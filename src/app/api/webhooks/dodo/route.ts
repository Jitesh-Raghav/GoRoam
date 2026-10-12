import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import type DodoPayments from 'dodopayments';
import { logIfSchemaOutOfSync, prisma } from '@/lib/prisma';
import { dodo, planForProduct } from '@/lib/dodo';
import { PLANS } from '@/lib/plans';

type PaymentData = DodoPayments.Payment;

/**
 * Dodo Payments webhook. This is the only place a pass is granted for a
 * purchase: the signature proves the event came from Dodo, and the unique
 * payment id makes retried deliveries harmless.
 */
export async function POST(request: NextRequest) {
  if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
    console.error('DODO_PAYMENTS_WEBHOOK_KEY is not set; cannot verify webhooks');
    // 500 so Dodo keeps retrying until the secret is configured.
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  let event: DodoPayments.UnwrapWebhookEvent;
  try {
    event = dodo().webhooks.unwrap(body, {
      headers: {
        'webhook-id': request.headers.get('webhook-id') ?? '',
        'webhook-signature': request.headers.get('webhook-signature') ?? '',
        'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    switch (event.type) {
      case 'payment.succeeded':
        await grantPass(event.data);
        break;
      case 'refund.succeeded':
        // Partial refunds are goodwill gestures; only a full refund takes the pack back.
        if (!event.data.is_partial) await revokeCredits(event.data.payment_id, 'refunded');
        break;
      case 'dispute.lost':
        await revokeCredits(event.data.payment_id, 'disputed');
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error handling Dodo webhook ${event.type}:`, error);
    logIfSchemaOutOfSync(error, `POST /api/webhooks/dodo (${event.type})`);
    // A 5xx makes Dodo retry the delivery later.
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}

const DAY = 24 * 60 * 60 * 1000;

async function grantPass(payment: PaymentData) {
  const item = payment.product_cart?.[0];
  // The product that was actually paid for decides the pack; metadata is a fallback.
  const plan = planForProduct(item?.product_id) ?? PLANS.find((p) => p.id === payment.metadata?.plan_id);
  if (!plan) {
    console.warn(`Payment ${payment.payment_id} is not for a pass; ignoring`);
    return;
  }

  const metaUserId = typeof payment.metadata?.user_id === 'string' ? payment.metadata.user_id : null;
  const select = { id: true, passUntil: true, passPlan: true } as const;
  const user =
    (metaUserId && (await prisma.user.findUnique({ where: { id: metaUserId }, select }))) ||
    (payment.customer?.email && (await prisma.user.findUnique({ where: { email: payment.customer.email }, select })));
  if (!user) {
    console.error(`Payment ${payment.payment_id}: no GoRoam account for ${payment.customer?.email ?? 'unknown customer'}; credit manually`);
    return;
  }

  // A new pass starts now; buying again adds its days on top of what's left.
  const days = plan.days * Math.max(item?.quantity ?? 1, 1);
  const from = Math.max(Date.now(), user.passUntil?.getTime() ?? 0);
  const passUntil = new Date(from + days * DAY);
  // The longer plan's fair-use allowance wins while both overlap.
  const passPlan = user.passPlan === 'year' && user.passUntil && user.passUntil.getTime() > Date.now() ? 'year' : plan.id;
  try {
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          providerPaymentId: payment.payment_id,
          checkoutSessionId: payment.checkout_session_id ?? null,
          userId: user.id,
          planId: plan.id,
          credits: 0,
          amount: payment.total_amount,
          currency: payment.currency,
        },
      }),
      prisma.user.update({ where: { id: user.id }, data: { passUntil, passPlan } }),
    ]);
  } catch (error) {
    // Already recorded: this is a retried delivery, and the pass was granted the first time.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return;
    throw error;
  }
}

async function revokeCredits(providerPaymentId: string, status: 'refunded' | 'disputed') {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { providerPaymentId } });
    if (!payment) return;
    // Flip the status only if it's still active, so repeats can't deduct twice.
    const flipped = await tx.payment.updateMany({ where: { providerPaymentId, status: 'succeeded' }, data: { status } });
    if (flipped.count === 0) return;
    // Older credit packs give their credits back (never below zero).
    if (payment.credits > 0) {
      await tx.$executeRaw`UPDATE "User" SET "credits" = GREATEST("credits" - ${payment.credits}, 0) WHERE "id" = ${payment.userId}`;
      return;
    }
    // A pass: take its days back off the end, but never into the past.
    const plan = PLANS.find((p) => p.id === payment.planId);
    const user = await tx.user.findUnique({ where: { id: payment.userId }, select: { passUntil: true } });
    if (!plan || !user?.passUntil) return;
    const cut = new Date(Math.max(Date.now(), user.passUntil.getTime() - plan.days * DAY));
    await tx.user.update({ where: { id: payment.userId }, data: { passUntil: cut } });
  });
}
