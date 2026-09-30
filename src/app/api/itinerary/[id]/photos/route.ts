import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { photosForItinerary } from '@/lib/place-photos';

// Every stop's photo for one of your trips, in a single request. Found photos are
// saved onto the trip, so after the first view this is a plain database read.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const itinerary = await prisma.itinerary.findFirst({
    where: session.user.id ? { id, userId: session.user.id } : { id, user: { email: session.user.email } },
    select: { id: true, destination: true, itineraryData: true },
  });
  if (!itinerary) {
    return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
  }

  const result = await photosForItinerary(itinerary);
  return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'private, max-age=300' } });
}
