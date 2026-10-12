import { NextRequest, NextResponse } from 'next/server';
import { mutateTrip } from '@/lib/trip-store';
import OpenAI from 'openai';
import { fakeInsights, generateInsights, type InsightsContext } from '@/lib/insights';
import { ownedItinerary } from '@/lib/owned-trip';
import type { ItineraryData, TripInsights } from '@/lib/trip';

/**
 * Writes a trip's insights (crowds, places to eat, packing, getting around, money
 * manners and carbon) the first time its owner opens it. Free, done once, saved
 * with the trip so shared links show it too.
 */
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const fake = process.env.NODE_ENV !== 'production' && process.env.GOROAM_FAKE_AI === '1';
const inFlight = new Map<string, Promise<TripInsights>>();

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const data = JSON.parse(owned.itinerary.itineraryData) as ItineraryData;
  if (data.insights) return NextResponse.json({ success: true, insights: data.insights });
  if (!openai && !fake) return NextResponse.json({ success: false, error: 'Not configured.' }, { status: 503 });

  let job = inFlight.get(id);
  if (!job) {
    const it = owned.itinerary;
    const ctx: InsightsContext = {
      destination: data.summary?.destination || it.destination,
      source: data.trip?.source,
      startDate: it.startDate.toISOString().slice(0, 10),
      numberOfDays: it.numberOfDays,
      people: it.numberOfPeople,
      data,
    };
    job = (fake || !openai ? Promise.resolve(fakeInsights(ctx)) : generateInsights(openai, ctx)).then(async (insights) => {
      // Under a row lock, so nothing written meanwhile (edits, wallet) is lost.
      await mutateTrip(id, (next) => {
        next.insights = insights;
      });
      return insights;
    });
    inFlight.set(id, job);
    job.finally(() => inFlight.delete(id)).catch(() => {});
  }

  try {
    return NextResponse.json({ success: true, insights: await job });
  } catch (error) {
    console.error('Insights failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "Couldn't research the trip just now." }, { status: 502 });
  }
}
