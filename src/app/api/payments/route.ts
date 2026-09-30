import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logIfSchemaOutOfSync, prisma } from '@/lib/prisma';

// The signed-in traveller's credit-pack purchases, newest first.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, planId: true, credits: true, amount: true, currency: true, status: true, createdAt: true }
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    logIfSchemaOutOfSync(error, 'GET /api/payments');
    return NextResponse.json({ success: false, error: 'Failed to fetch payments' }, { status: 500 });
  }
}
