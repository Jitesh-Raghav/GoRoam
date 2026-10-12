import { NextRequest, NextResponse } from 'next/server';
import type DodoPayments from 'dodopayments';
import { logIfSchemaOutOfSync, prisma } from '@/lib/prisma';
import { dodo } from '@/lib/dodo';
import { DAY, grantPass } from '@/lib/grant-pass';
import { PLANS } from '@/lib/plans';

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
    console.error('Dodo webhook signature mismatch: check DODO_PAYMENTS_WEBHOOK_KEY is the signing secret of this endpoint (test and live endpoints differ).');
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
