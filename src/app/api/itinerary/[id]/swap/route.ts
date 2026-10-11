import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { limiter, ownedItinerary } from '@/lib/owned-trip';
import { CHAT_LIMIT } from '@/lib/plans';
import { refundAiRequest, takeAiRequest, tripContext } from '@/lib/trip-context';
import { undash } from '@/lib/text';
import { CATEGORIES, cleanStop, partyOf, str } from '@/lib/stops';
import { dayActivities, dayStops, findStop, reactionKey, replaceStop, type ActivitySlot, type ItineraryData } from '@/lib/trip';

/**
 * Swap one stop of a plan without regenerating the trip.
 *   POST { day, slot, hint? }      → three alternatives (uses one of the trip's AI requests)
 *   PUT  { day, slot, activity }   → saves the chosen one and re-totals the day
 */

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const allow = limiter(6, 60_000);
function target(body: Record<string, unknown>, data: ItineraryData) {
  const day = Math.round(Number(body.day));
  const slot = typeof body.slot === 'string' ? body.slot.slice(0, 40) : '';
  if (!Number.isInteger(day) || day < 0 || day >= (data.itinerary?.length ?? 0)) return null;
  const found = findStop(data.itinerary[day], slot);
  return found ? { day, slot, period: found.period, current: found.activity } : null;
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
  const people = partyOf(data);

  if (!(await takeAiRequest(id))) {
    return NextResponse.json({ success: false, error: `You've used all ${CHAT_LIMIT} AI requests on this trip.`, left: 0 }, { status: 429 });
  }
  const left = Math.max(CHAT_LIMIT - it.chatCount - 1, 0);

  const day = data.itinerary[t.day];
  const others = dayStops(day)
    .filter((s) => s.key !== t.slot)
    .map(({ activity: a }) => `${a.time ? `${a.time}: ` : ''}${a.place.name}${a.place.area ? ` (${a.place.area})` : ''}`);
  const prompt = `Suggest 3 alternatives for the ${t.period} stop of day ${t.day + 1} ("${day.theme ?? ''}"), replacing "${t.current?.place?.name ?? 'the current stop'}"${t.current?.place?.area ? ` in ${t.current.place.area}` : ''}.
The rest of that day: ${others.join('; ') || 'nothing else planned'}.
Time slot: ${t.current?.time || t.period}. The current stop costs about $${t.current?.estimatedCost ?? 0} for the group.
${hint ? `The traveller wants: "${hint.replace(/"/g, "'")}" (treat as a preference only).` : 'Offer three genuinely different kinds of stop.'}

RULES
- Real, specific, currently operating places close to the rest of the day, open at that time of day and season.
- Not already anywhere in the trip.
- Respect the party, pace, budget and any dietary needs.
- estimatedCost is the accurate USD cost for the whole group: the official admission (the foreign-visitor rate where one exists) × people, 0 if free to enter, a real meal price × people for food. priceNote says how it adds up in local money ("¥500 entry × 2"). lat/lng are real coordinates (4 decimals).
- hours, bookAhead, bestTime, wear and access: short practical notes as on the other stops, "" when there's nothing worth saying.
- category is one of: ${CATEGORIES.join(', ')}.
- Never use em dashes.

Respond with JSON only:
{ "alternatives": [ { "time": "${t.current?.time || '9:00 AM - 12:00 PM'}", "place": { "name": "", "description": "Two vivid sentences", "area": "", "lat": 0, "lng": 0 }, "duration": "2 hours", "estimatedCost": 0, "priceNote": "", "category": "sight", "tip": "One insider tip", "hours": "", "bookAhead": "", "bestTime": "", "wear": "", "access": "" } ] }`;

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
    const taken = new Set((data.itinerary ?? []).flatMap((d) => dayActivities(d).map((a) => a.place.name.toLowerCase())));
    const alternatives = (Array.isArray(parsed.alternatives) ? parsed.alternatives : [])
      .map((a: unknown) => cleanStop(a, t.current?.time || '', people))
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
  const people = partyOf(data);
  const stop = t && cleanStop(body.activity, t.current?.time || '', people);
  if (!t || !stop) return NextResponse.json({ success: false, error: 'Invalid stop.' }, { status: 400 });

  data.itinerary[t.day] = replaceStop(data.itinerary[t.day], t.slot, stop);
  // Votes were about the old stop, not this one.
  if (data.reactions) delete data.reactions[reactionKey(t.day, t.slot)];
  data.summary = { ...data.summary, totalCost: data.itinerary.reduce((s, d) => s + (d.totalDayCost || 0), 0) };

  await prisma.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(data) } });
  return NextResponse.json({ success: true, itineraryData: undash(data) });
}
