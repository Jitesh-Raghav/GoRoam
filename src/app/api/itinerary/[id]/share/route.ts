import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { shareToken } from '@/lib/share';

// Returns a read-only link the owner can send to their travel companions.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const itinerary = await prisma.itinerary.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true }
    });
    if (!itinerary) {
      return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
    }

    const url = `${request.nextUrl.origin}/trip/${itinerary.id}?t=${shareToken(itinerary.id)}`;
    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json({ success: false, error: 'Could not create a share link' }, { status: 500 });
  }
}
