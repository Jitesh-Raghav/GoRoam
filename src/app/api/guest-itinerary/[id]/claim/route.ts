import { NextRequest, NextResponse, after } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { guestData } from '@/lib/guest';
import { photosForItinerary } from '@/lib/place-photos';
import { prisma } from '@/lib/prisma';

/**
 * Moves a guest trip into the signed-in traveller's account. It uses their free
 * credit when they have one; a brand-new account's first trip is never blocked.
 * Claiming twice returns the same itinerary.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Sign in first.' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, credits: true } });
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  const guest = await prisma.guestTrip.findUnique({ where: { id } });
  if (!guest) return NextResponse.json({ success: false, error: 'This preview has expired.' }, { status: 404 });
  if (guest.claimedItineraryId) {
    if (guest.claimedByUserId === user.id) return NextResponse.json({ success: true, itineraryId: guest.claimedItineraryId });
    return NextResponse.json({ success: false, error: 'This trip already belongs to another account.' }, { status: 409 });
  }

  // One guest trip per account, so the free preview can't be farmed.
  const already = await prisma.guestTrip.findFirst({ where: { claimedByUserId: user.id }, select: { claimedItineraryId: true } });
  if (already?.claimedItineraryId) {
    return NextResponse.json({ success: false, error: 'You already unlocked a free preview. Plan this one in the planner.', itineraryId: already.claimedItineraryId }, { status: 409 });
  }

  const data = guestData(guest);
  const itinerary = await prisma.$transaction(async (tx) => {
    // Take the free credit if there is one; never go below zero.
    if ((user.credits ?? 0) > 0) await tx.user.updateMany({ where: { id: user.id, credits: { gte: 1 } }, data: { credits: { decrement: 1 } } });
    const created = await tx.itinerary.create({
      data: {
        userId: user.id,
        destination: guest.destination,
        startDate: guest.startDate,
        endDate: new Date(guest.startDate.getTime() + (guest.numberOfDays - 1) * 86400000),
        numberOfDays: guest.numberOfDays,
        budget: guest.budget,
        numberOfPeople: guest.numberOfPeople,
        tripType: guest.tripType,
        interests: guest.interests,
        itineraryData: JSON.stringify(data),
        status: 'completed',
      },
    });
    await tx.guestTrip.update({ where: { id }, data: { claimedByUserId: user.id, claimedItineraryId: created.id } });
    return created;
  });

  after(() => photosForItinerary(itinerary).catch((error) => console.error('Claimed trip photos failed:', error)));
  return NextResponse.json({ success: true, itineraryId: itinerary.id });
}
