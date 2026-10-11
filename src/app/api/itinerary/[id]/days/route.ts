import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ownedItinerary } from '@/lib/owned-trip';
import { cleanStop, partyOf } from '@/lib/stops';
import { undash } from '@/lib/text';
import { dayStops, reactionKey, withStops, type ActivitySlot, type ItineraryData } from '@/lib/trip';

/**
 * Save edited days: reordered, moved between days, added, removed or
 * replanned stops.
 *   PUT { days: [{ index, stops: ActivitySlot[] }] }   → only the days that changed
 * Every stop is re-checked on the server (trimmed fields, sane prices), each
 * day's total and the trip total are recomputed, and friends' votes on
 * stops that no longer exist are dropped.
 */
const MAX_STOPS = 12;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const body = await request.json().catch(() => ({}));
  const edits = Array.isArray(body?.days) ? body.days.slice(0, 60) : [];
  if (!edits.length) return NextResponse.json({ success: false, error: 'Nothing to save.' }, { status: 400 });

  // Re-read the freshest copy, so a concurrent change (photos, wallet) isn't lost.
  const fresh = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
  if (!fresh) return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
  const data = JSON.parse(fresh.itineraryData) as ItineraryData;
  const people = partyOf(data);
  const total = data.itinerary?.length ?? 0;

  for (const edit of edits) {
    const index = Math.round(Number(edit?.index));
    if (!Number.isInteger(index) || index < 0 || index >= total || !Array.isArray(edit?.stops)) {
      return NextResponse.json({ success: false, error: 'Invalid day.' }, { status: 400 });
    }
    const seen = new Set<string>();
    const stops = (edit.stops as unknown[])
      .slice(0, MAX_STOPS)
      .map((raw, i) => cleanStop(raw, ['9:00 AM', '1:00 PM', '6:00 PM'][Math.min(i, 2)], people))
      .filter((s): s is ActivitySlot => !!s)
      .map((s) => {
        // Every stop keeps a unique key on its day (votes and swaps hang off it).
        let key = s.id && !seen.has(s.id) ? s.id : `p${Math.random().toString(36).slice(2, 9)}`;
        while (seen.has(key)) key = `p${Math.random().toString(36).slice(2, 9)}`;
        seen.add(key);
        return { ...s, id: key };
      });
    const before = dayStops(data.itinerary[index]).map((s) => s.key);
    data.itinerary[index] = withStops(data.itinerary[index], stops);
    // Votes were about stops; drop the ones whose stop left this day.
    if (data.reactions) for (const key of before) if (!seen.has(key)) delete data.reactions[reactionKey(index, key)];
  }
  data.summary = { ...data.summary, totalCost: data.itinerary.reduce((s, d) => s + (d.totalDayCost || 0), 0) };

  await prisma.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(data) } });
  return NextResponse.json({ success: true, itineraryData: undash(data) });
}
