import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toDetails, verifyShareToken } from '@/lib/share';

// Public, read-only view of a shared itinerary. The signed token is the key.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!verifyShareToken(id, request.nextUrl.searchParams.get('t'))) {
      return NextResponse.json({ success: false, error: 'This share link is invalid.' }, { status: 404 });
    }

    const itinerary = await prisma.itinerary.findUnique({ where: { id } });
    if (!itinerary) {
      return NextResponse.json({ success: false, error: 'This trip is no longer available.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toDetails(itinerary) });
  } catch (error) {
    console.error('Error fetching shared itinerary:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
