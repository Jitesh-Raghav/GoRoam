import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dodo, paymentsConfigured, productIdFor } from '@/lib/dodo';
import { currencyFor } from '@/lib/currency';
import { PLANS, fixedPrice, type PlanId } from '@/lib/plans';

// Starts a Dodo Payments checkout for one credit pack and returns its URL.
// Credits are added later by the webhook, never by this route or the redirect.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!paymentsConfigured()) {
      return NextResponse.json(
        { success: false, error: "Online checkout isn't available yet." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const plan = PLANS.find((p) => p.id === body?.planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Unknown credit pack' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true }
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Come back to the credits page; "return=planner" leads on to a saved trip draft.
    const back = new URL('/dashboard/credits', request.nextUrl.origin);
    back.searchParams.set('plan', plan.id);
    if (body?.returnTo === 'planner') back.searchParams.set('return', 'planner');
    const success = new URL(back);
    success.searchParams.set('checkout', 'success');
    const cancel = new URL(back);
    cancel.searchParams.set('checkout', 'cancelled');

    // Charge in the visitor's own currency when the pack has a fixed price in it
    // (set up in Dodo's localized pricing). The country comes from the request,
    // never from the client, so the price matches the one the site showed.
    const country = request.headers.get('x-vercel-ip-country');
    const local = currencyFor(country);
    const billingCurrency = local && local !== 'USD' && fixedPrice(plan.id, local) !== null ? local : null;

    const checkout = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: productIdFor(plan.id as PlanId)!, quantity: 1 }],
      ...(billingCurrency ? { billing_currency: billingCurrency as 'INR' | 'EUR' | 'GBP' } : {}),
      customer: { email: user.email, name: user.name ?? undefined },
      metadata: { user_id: user.id, plan_id: plan.id },
      return_url: success.toString(),
      cancel_url: cancel.toString(),
    });

    if (!checkout.checkout_url) {
      throw new Error('Dodo Payments returned no checkout URL');
    }

    return NextResponse.json({ success: true, data: { url: checkout.checkout_url } });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: "We couldn't start checkout. Please try again." },
      { status: 500 }
    );
  }
}
