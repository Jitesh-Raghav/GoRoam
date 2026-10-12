import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dodo, paymentsConfigured } from '@/lib/dodo';
import { grantPass } from '@/lib/grant-pass';
import { prisma } from '@/lib/prisma';

/**
 * Back from checkout: confirms the payment with Dodo directly and grants the pass,
 * so it switches on even if the webhook is slow or misconfigured. The webhook
 * stays the source of truth for refunds; granting is idempotent either way.
 *   POST { paymentId } → { success, granted, plan }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  if (!paymentsConfigured()) return NextResponse.json({ success: false, error: 'Payments are not configured.' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const paymentId = typeof body?.paymentId === 'string' ? body.paymentId.trim().slice(0, 100) : '';
  if (!/^[\w-]+$/.test(paymentId)) return NextResponse.json({ success: false, error: 'Missing payment id' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, email: true } });
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  try {
    const payment = await dodo().payments.retrieve(paymentId);
    // Only the buyer's own, completed payment counts.
    const owner = payment.metadata?.user_id === user.id || (!payment.metadata?.user_id && payment.customer?.email === user.email);
    if (!owner) return NextResponse.json({ success: false, error: 'Not your payment' }, { status: 403 });
    if (payment.status !== 'succeeded') return NextResponse.json({ success: true, granted: false, status: payment.status });
    const plan = await grantPass(payment);
    return NextResponse.json({ success: true, granted: true, plan: plan ?? payment.metadata?.plan_id ?? null });
  } catch (error) {
    const e = error as { status?: number; message?: string };
    console.error('Confirming checkout failed:', e?.status, e?.message);
    return NextResponse.json({ success: false, error: 'Could not confirm the payment yet.' }, { status: 502 });
  }
}
