import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { enrichPlaces, fakeLogistics, generateLogistics, withLiveFares, type LogisticsContext } from '@/lib/logistics';
import { ownedItinerary } from '@/lib/owned-trip';
import { mutateTrip } from '@/lib/trip-store';
import type { GetAround, GetThere, ItineraryData } from '@/lib/trip';

/**
 * Getting there and getting around, for trips planned before they existed.
 *   POST → { success, getThere, getAround }   written once, saved with the trip (owner only)
 *   PUT { pick?: number, rental?: { inBudget: boolean, chosen: number } }   the traveller's choices
 */
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const fake = process.env.NODE_ENV !== 'production' && process.env.GOROAM_FAKE_AI === '1';
const inFlight = new Map<string, Promise<{ getThere?: GetThere; getAround?: GetAround }>>();

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const data = JSON.parse(owned.itinerary.itineraryData) as ItineraryData;
  if (data.getThere || data.getAround) return NextResponse.json({ success: true, getThere: data.getThere, getAround: data.getAround });
  if (!openai && !fake) return NextResponse.json({ success: false, error: 'Not configured.' }, { status: 503 });

  let job = inFlight.get(id);
  if (!job) {
    const it = owned.itinerary;
    const ctx: LogisticsContext = {
      destination: data.summary?.destination || it.destination,
      source: data.trip?.source,
      startDate: it.startDate.toISOString().slice(0, 10),
      numberOfDays: it.numberOfDays,
      people: it.numberOfPeople,
      prefs: data.trip?.preferences,
    };
    job = (async () => {
      const made = fake || !openai ? fakeLogistics(ctx) : await generateLogistics(openai, ctx);
      const getThere = await withLiveFares(made.getThere, ctx);
      const real = await enrichPlaces({ ...data, getAround: made.getAround }, ctx.destination).catch(() => null);
      const getAround = real?.getAround ?? made.getAround;
      await mutateTrip(id, (next) => {
        next.getThere = getThere;
        next.getAround = getAround;
        if (real?.stays) next.stays = real.stays;
      });
      return { getThere, getAround };
    })();
    inFlight.set(id, job);
    job.finally(() => inFlight.delete(id)).catch(() => {});
  }

  try {
    return NextResponse.json({ success: true, ...(await job) });
  } catch (error) {
    console.error('Logistics failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "Couldn't look up the journey just now." }, { status: 502 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  const body = await request.json().catch(() => ({}));
  const saved = await mutateTrip(id, (t) => {
    const pick = Math.round(Number(body?.pick));
    if (t.getThere && Number.isInteger(pick) && pick >= 0 && pick < t.getThere.options.length) t.getThere.pick = pick;
    const r = body?.rental;
    if (t.getAround && r && typeof r === 'object') {
      if (typeof r.inBudget === 'boolean') t.getAround.inBudget = r.inBudget;
      const chosen = Math.round(Number(r.chosen));
      if (Number.isInteger(chosen) && chosen >= 0 && chosen < t.getAround.picks.length) t.getAround.chosen = chosen;
    }
  });
  if (!saved) return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
  return NextResponse.json({ success: true, getThere: saved.getThere, getAround: saved.getAround });
}
