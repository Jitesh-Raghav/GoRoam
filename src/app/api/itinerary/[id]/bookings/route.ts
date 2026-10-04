import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ownedItinerary } from '@/lib/owned-trip';
import { BOOKING_KINDS, type BookingKind, type ItineraryData, type TripBooking } from '@/lib/trip';

/** Saves the trip's bookings and documents (owner only). The whole list is sent each time. */

const MAX = 40;
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const when = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(v) ? v : undefined);

function clean(raw: unknown): TripBooking[] | null {
  if (!Array.isArray(raw)) return null;
  const out: TripBooking[] = [];
  for (const b of raw.slice(0, MAX)) {
    if (!b || typeof b !== 'object') continue;
    const r = b as Record<string, unknown>;
    const id = typeof r.id === 'string' && /^[\w-]{1,40}$/.test(r.id) ? r.id : null;
    const title = str(r.title, 120);
    if (!id || !title) continue;
    out.push({
      id,
      kind: (BOOKING_KINDS as readonly string[]).includes(r.kind as string) ? (r.kind as BookingKind) : 'other',
      title,
      ref: str(r.ref, 60) || undefined,
      start: when(r.start),
      end: when(r.end),
      location: str(r.location, 200) || undefined,
      notes: str(r.notes, 400) || undefined,
    });
  }
  return out;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const body = await request.json().catch(() => null);
  const bookings = clean(body?.bookings);
  if (!bookings) return NextResponse.json({ success: false, error: 'Those bookings could not be saved.' }, { status: 400 });

  // Re-read the freshest copy, so a concurrent change (photos, wallet) isn't lost.
  const fresh = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
  if (!fresh) return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
  const data = JSON.parse(fresh.itineraryData) as ItineraryData;
  data.bookings = bookings;
  await prisma.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(data) } });
  return NextResponse.json({ success: true, bookings });
}
