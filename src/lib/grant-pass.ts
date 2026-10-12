// Server-only: turns a successful Dodo payment into a Week or Year Pass.
import { Prisma } from '@prisma/client';
import type DodoPayments from 'dodopayments';
import { planForProduct } from '@/lib/dodo';
import { PLANS } from '@/lib/plans';
import { prisma } from '@/lib/prisma';

type PaymentData = DodoPayments.Payment;

export const DAY = 24 * 60 * 60 * 1000;

/**
 * Grants (or extends) the pass a payment bought. Safe to call more than once for
 * the same payment: the webhook and the return-from-checkout check can both run it.
 * Returns the plan id when this call recorded the payment, null otherwise.
 */
export async function grantPass(payment: PaymentData): Promise<string | null> {
  const item = payment.product_cart?.[0];
  // The product that was actually paid for decides the pack; metadata is a fallback.
  const plan = planForProduct(item?.product_id) ?? PLANS.find((p) => p.id === payment.metadata?.plan_id);
  if (!plan) {
    console.warn(`Payment ${payment.payment_id} is not for a pass; ignoring`);
    return null;
  }

  const metaUserId = typeof payment.metadata?.user_id === 'string' ? payment.metadata.user_id : null;
  const select = { id: true, passUntil: true, passPlan: true } as const;
  const user =
    (metaUserId && (await prisma.user.findUnique({ where: { id: metaUserId }, select }))) ||
    (payment.customer?.email && (await prisma.user.findUnique({ where: { email: payment.customer.email }, select })));
  if (!user) {
    console.error(`Payment ${payment.payment_id}: no GoRoam account for ${payment.customer?.email ?? 'unknown customer'}; credit manually`);
    return null;
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return null;
    throw error;
  }
  return plan.id;
}

