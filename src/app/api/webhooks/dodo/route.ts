import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import type DodoPayments from 'dodopayments';
import { prisma } from '@/lib/prisma';
import { dodo, planForProduct } from '@/lib/dodo';
import { PLANS } from '@/lib/plans';

type PaymentData = DodoPayments.Payment;

/**
 * Dodo Payments webhook. This is the only place credits are added for a
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
        await grantCredits(event.data);
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
    // A 5xx makes Dodo retry the delivery later.
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}

async function grantCredits(payment: PaymentData) {
  const item = payment.product_cart?.[0];
  // The product that was actually paid for decides the pack; metadata is a fallback.
  const plan = planForProduct(item?.product_id) ?? PLANS.find((p) => p.id === payment.metadata?.plan_id);
  if (!plan) {
    console.warn(`Payment ${payment.payment_id} is not for a credit pack; ignoring`);
    return;
  }

  const metaUserId = typeof payment.metadata?.user_id === 'string' ? payment.metadata.user_id : null;
  const user =
    (metaUserId && (await prisma.user.findUnique({ where: { id: metaUserId }, select: { id: true } }))) ||
    (payment.customer?.email && (await prisma.user.findUnique({ where: { email: payment.customer.email }, select: { id: true } })));
  if (!user) {
    console.error(`Payment ${payment.payment_id}: no GoRoam account for ${payment.customer?.email ?? 'unknown customer'}; credit manually`);
    return;
  }

  const credits = plan.credits * Math.max(item?.quantity ?? 1, 1);
  try {
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          providerPaymentId: payment.payment_id,
          checkoutSessionId: payment.checkout_session_id ?? null,
          userId: user.id,
          planId: plan.id,
          credits,
          amount: payment.total_amount,
          currency: payment.currency,
        },
      }),
      prisma.user.update({ where: { id: user.id }, data: { credits: { increment: credits } } }),
    ]);
  } catch (error) {
    // Already recorded: this is a retried delivery, and the credits were added the first time.
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
    // Never below zero: credits already spent stay spent.
    await tx.$executeRaw`UPDATE "User" SET "credits" = GREATEST("credits" - ${payment.credits}, 0) WHERE "id" = ${payment.userId}`;
  });
}
