import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { photosForItinerary } from '@/lib/place-photos';
import { verifyShareToken } from '@/lib/share';

// The stop photos for a shared trip; the signed share token is the key.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!verifyShareToken(id, request.nextUrl.searchParams.get('t'))) {
    return NextResponse.json({ success: false, error: 'This share link is invalid.' }, { status: 404 });
  }

  const itinerary = await prisma.itinerary.findUnique({ where: { id }, select: { id: true, destination: true, itineraryData: true } });
  if (!itinerary) {
    return NextResponse.json({ success: false, error: 'This trip is no longer available.' }, { status: 404 });
  }

  const result = await photosForItinerary(itinerary);
  return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'private, max-age=300' } });
}
