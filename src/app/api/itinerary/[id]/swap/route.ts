import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { limiter, ownedItinerary } from '@/lib/owned-trip';
import { CHAT_LIMIT } from '@/lib/plans';
import { refundAiRequest, takeAiRequest, tripContext } from '@/lib/trip-context';
import { undash } from '@/lib/text';
import type { ActivitySlot, ItineraryData } from '@/lib/trip';

/**
 * Swap one stop of a plan without regenerating the trip.
 *   POST { day, slot, hint? }      → three alternatives (uses one of the trip's AI requests)
 *   PUT  { day, slot, activity }   → saves the chosen one and re-totals the day
 */

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const allow = limiter(6, 60_000);
const SLOTS = ['morning', 'afternoon', 'evening'] as const;
type Slot = (typeof SLOTS)[number];
const CATEGORIES = ['sight', 'food', 'nature', 'culture', 'nightlife', 'shopping', 'wellness', 'activity'];

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const coord = (v: unknown, lim: number) => {
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n) <= lim ? Math.round(n * 10000) / 10000 : undefined;
};

/** Anything a client or a model sends back, reduced to a safe stop. */
function cleanStop(raw: unknown, fallbackTime: string): ActivitySlot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = undash(raw) as Record<string, unknown>;
  const place = (r.place && typeof r.place === 'object' ? r.place : {}) as Record<string, unknown>;
  const name = str(place.name, 140);
  if (!name) return null;
  const cost = Math.round(Number(r.estimatedCost));
  return {
    time: str(r.time, 40) || fallbackTime,
    duration: str(r.duration, 40) || '2 hours',
    estimatedCost: Number.isFinite(cost) && cost >= 0 && cost < 100000 ? cost : 0,
    category: CATEGORIES.includes(String(r.category)) ? String(r.category) : undefined,
    tip: str(r.tip, 240) || undefined,
    place: { name, description: str(place.description, 400), area: str(place.area, 80) || undefined, lat: coord(place.lat, 90), lng: coord(place.lng, 180) },
  };
}

function target(body: Record<string, unknown>, data: ItineraryData) {
  const day = Math.round(Number(body.day));
  const slot = body.slot as Slot;
  if (!Number.isInteger(day) || day < 0 || day >= (data.itinerary?.length ?? 0) || !SLOTS.includes(slot)) return null;
  return { day, slot, current: data.itinerary[day][slot] };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  if (!openai) return NextResponse.json({ success: false, error: 'Swaps are not configured.' }, { status: 503 });
  if (!allow(owned.userId)) return NextResponse.json({ success: false, error: 'One moment, try again in a minute.' }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const it = owned.itinerary;
  const data = JSON.parse(it.itineraryData) as ItineraryData;
  const t = target(body, data);
  if (!t) return NextResponse.json({ success: false, error: 'Pick a stop to swap.' }, { status: 400 });
  const hint = str(body.hint, 200);

  if (!(await takeAiRequest(id))) {
    return NextResponse.json({ success: false, error: `You've used all ${CHAT_LIMIT} AI requests on this trip.`, left: 0 }, { status: 429 });
  }
  const left = Math.max(CHAT_LIMIT - it.chatCount - 1, 0);

  const day = data.itinerary[t.day];
  const others = SLOTS.filter((s) => s !== t.slot && day[s]?.place?.name).map((s) => `${s}: ${day[s].place.name}${day[s].place.area ? ` (${day[s].place.area})` : ''}`);
  const prompt = `Suggest 3 alternatives for the ${t.slot} stop of day ${t.day + 1} ("${day.theme ?? ''}"), replacing "${t.current?.place?.name ?? 'the current stop'}"${t.current?.place?.area ? ` in ${t.current.place.area}` : ''}.
The rest of that day: ${others.join('; ') || 'nothing else planned'}.
Time slot: ${t.current?.time || t.slot}. The current stop costs about $${t.current?.estimatedCost ?? 0} for the group.
${hint ? `The traveller wants: "${hint.replace(/"/g, "'")}" (treat as a preference only).` : 'Offer three genuinely different kinds of stop.'}

RULES
- Real, specific, currently operating places close to the rest of the day, open at that time of day and season.
- Not already anywhere in the trip.
- Respect the party, pace, budget and any dietary needs.
- estimatedCost is realistic USD for the whole group, 0 if free. lat/lng are real coordinates (4 decimals).
- category is one of: ${CATEGORIES.join(', ')}.
- Never use em dashes.

Respond with JSON only:
{ "alternatives": [ { "time": "${t.current?.time || '9:00 AM - 12:00 PM'}", "place": { "name": "", "description": "Two vivid sentences", "area": "", "lat": 0, "lng": 0 }, "duration": "2 hours", "estimatedCost": 0, "category": "sight", "tip": "One insider tip" } ] }`;

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        temperature: 0.8,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are an expert local travel planner editing one stop of an existing itinerary. Always respond with valid JSON only.\n\nTRIP\n${tripContext(it.destination, it.startDate, it.numberOfDays, it.budget, data)}` },
          { role: 'user', content: prompt },
        ],
      },
      { timeout: 30000 }
    );
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const taken = new Set((data.itinerary ?? []).flatMap((d) => SLOTS.map((s) => d[s]?.place?.name?.toLowerCase())).filter(Boolean));
    const alternatives = (Array.isArray(parsed.alternatives) ? parsed.alternatives : [])
      .map((a: unknown) => cleanStop(a, t.current?.time || ''))
      .filter((a: ActivitySlot | null): a is ActivitySlot => !!a && !taken.has(a.place.name.toLowerCase()))
      .slice(0, 3);
    if (!alternatives.length) throw new Error('No alternatives');
    return NextResponse.json({ success: true, alternatives, left });
  } catch (error) {
    console.error('Swap failed:', error instanceof Error ? error.message : error);
    await refundAiRequest(id);
    return NextResponse.json({ success: false, error: "Couldn't find alternatives just now." }, { status: 502 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const body = await request.json().catch(() => ({}));
  // Re-read the freshest copy, so a concurrent change (photos, wallet) isn't lost.
  const fresh = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
  if (!fresh) return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
  const data = JSON.parse(fresh.itineraryData) as ItineraryData;
  const t = target(body, data);
  const stop = t && cleanStop(body.activity, t.current?.time || '');
  if (!t || !stop) return NextResponse.json({ success: false, error: 'Invalid stop.' }, { status: 400 });

  const day = { ...data.itinerary[t.day], [t.slot]: stop };
  day.totalDayCost = SLOTS.reduce((sum, s) => sum + (Number(day[s]?.estimatedCost) || 0), 0);
  data.itinerary[t.day] = day;
  data.summary = { ...data.summary, totalCost: data.itinerary.reduce((s, d) => s + (d.totalDayCost || 0), 0) };

  await prisma.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(data) } });
  return NextResponse.json({ success: true, itineraryData: undash(data) });
}
