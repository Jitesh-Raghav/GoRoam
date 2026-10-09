import { NextRequest, NextResponse } from 'next/server';
import { guestPreview } from '@/lib/guest';
import { resolveTripPhotos } from '@/lib/place-photos';
import { prisma } from '@/lib/prisma';

// Photos for a guest preview's visible day only.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.guestTrip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ success: false, photos: {}, fallback: null }, { status: 404 });
  const { details } = guestPreview(trip);
  const result = await resolveTripPhotos(details.itineraryData, trip.destination).catch(() => ({ photos: {}, fallback: null }));
  return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
