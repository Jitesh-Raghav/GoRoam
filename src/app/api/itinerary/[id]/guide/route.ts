import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { generateGuide } from '@/lib/guide';
import { ownedItinerary } from '@/lib/owned-trip';
import type { ItineraryData, TripGuide } from '@/lib/trip';

/**
 * Writes the local guide for a trip planned before guides existed (or whose
 * guide call failed). Free, owner-only, and done once: it's saved with the trip.
 */

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const inFlight = new Map<string, Promise<TripGuide>>();

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const data = JSON.parse(owned.itinerary.itineraryData) as ItineraryData;
  if (data.guide) return NextResponse.json({ success: true, guide: data.guide });
  if (!openai) return NextResponse.json({ success: false, error: 'The guide writer is not configured.' }, { status: 503 });

  let job = inFlight.get(id);
  if (!job) {
    const it = owned.itinerary;
    job = generateGuide(openai, {
      destination: data.summary?.destination || it.destination,
      source: data.trip?.source,
      startDate: it.startDate.toISOString().slice(0, 10),
      numberOfDays: it.numberOfDays,
      interests: JSON.parse(it.interests),
      preferences: data.trip?.preferences,
    }).then(async (guide) => {
      // Re-read so nothing written meanwhile is lost.
      const fresh = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
      if (fresh) {
        const next = JSON.parse(fresh.itineraryData) as ItineraryData;
        next.guide = guide;
        await prisma.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(next) } });
      }
      return guide;
    });
    inFlight.set(id, job);
    job.finally(() => inFlight.delete(id)).catch(() => {});
  }

  try {
    return NextResponse.json({ success: true, guide: await job });
  } catch (error) {
    console.error('Guide generation failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "Couldn't write the guide just now." }, { status: 502 });
  }
}
