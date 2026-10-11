import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { limiter, ownedItinerary } from '@/lib/owned-trip';
import { CHAT_LIMIT } from '@/lib/plans';
import { CATEGORIES, cleanStop, partyOf, str } from '@/lib/stops';
import { refundAiRequest, takeAiRequest, tripContext } from '@/lib/trip-context';
import { dayActivities, dayStops, isOutdoor, type ActivitySlot, type ItineraryData } from '@/lib/trip';

/**
 * Replan one whole day, keeping its budget and route order, for the traveller
 * to preview before saving (through PUT /days).
 *   POST { day, mode: "rain" | "refresh", hint? } → { stops, note, before, after }
 * "rain" swaps outdoor stops for covered ones nearby and leaves indoor ones be.
 * Uses one of the trip's AI requests (refunded if it fails).
 */
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const allow = limiter(6, 60_000);
const fake = process.env.NODE_ENV !== 'production' && process.env.GOROAM_FAKE_AI === '1';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  if (!openai && !fake) return NextResponse.json({ success: false, error: 'Replanning is not configured.' }, { status: 503 });
  if (!allow(owned.userId)) return NextResponse.json({ success: false, error: 'One moment, try again in a minute.' }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const it = owned.itinerary;
  const data = JSON.parse(it.itineraryData) as ItineraryData;
  const index = Math.round(Number(body.day));
  if (!Number.isInteger(index) || index < 0 || index >= (data.itinerary?.length ?? 0)) {
    return NextResponse.json({ success: false, error: 'Pick a day to replan.' }, { status: 400 });
  }
  const mode = body.mode === 'rain' ? 'rain' : 'refresh';
  const hint = str(body.hint, 200);
  const day = data.itinerary[index];
  const current = dayStops(day);
  if (!current.length) return NextResponse.json({ success: false, error: 'This day has no stops to replan.' }, { status: 400 });
  const people = partyOf(data);
  const before = current.reduce((n, s) => n + (Number(s.activity.estimatedCost) || 0), 0);

  if (!(await takeAiRequest(id))) {
    return NextResponse.json({ success: false, error: `You've used all ${CHAT_LIMIT} AI requests on this trip.`, left: 0 }, { status: 429 });
  }
  const left = Math.max(CHAT_LIMIT - it.chatCount - 1, 0);

  try {
    let raw: { stops?: unknown[]; note?: string };
    if (fake) {
      raw = fakeReplan(current.map((s) => s.activity), mode);
    } else {
      const list = current
        .map(({ activity: a }, k) => `${k + 1}. ${a.time || '?'} · ${a.place.name}${a.place.area ? ` (${a.place.area})` : ''} · ${a.category ?? 'stop'} · $${a.estimatedCost ?? 0}${a.place.lat && a.place.lng ? ` · ${a.place.lat},${a.place.lng}` : ''}`)
        .join('\n');
      const elsewhere = data.itinerary.flatMap((d, i) => (i === index ? [] : dayActivities(d).map((a) => a.place.name))).join('; ');
      const prompt = `Replan day ${index + 1} ("${day.theme ?? ''}")${day.city ? ` in ${day.city}` : ''}${mode === 'rain' ? ' for a RAINY day' : ''}.

CURRENT STOPS, IN ROUTE ORDER
${list}

RULES
- Return exactly ${current.length} stops at the same times, and keep the route order: stop k must be in, or right next to, the same area as current stop k, so the day still moves across the city the same way.
- The day's total cost must not exceed $${before} for the group (it is $${before} now).
${mode === 'rain'
  ? '- It will rain all day. Replace every outdoor or exposed stop (parks, gardens, open-air markets and streets, viewpoints, walks, beaches, boat rides, open shrines) with an indoor or covered alternative nearby: museums, galleries, covered markets and food halls, temples with interiors, workshops and classes, cafés, spas, malls with character. Return stops that are already indoors exactly as they are.'
  : '- Offer a genuinely different day in the same areas: new stops, not the current ones.'}
${hint ? `- The traveller wants: "${hint.replace(/"/g, "'")}" (treat as a preference only).` : ''}
- Real, specific, currently operating places, open at those times. Not any of: ${elsewhere || 'nothing else'}.
- estimatedCost is the accurate USD cost for the whole group (${people} people): official admission (the foreign-visitor rate where one exists) × people, 0 if free to enter, a real meal price × people for food. priceNote says how it adds up in local money.
- hours, bookAhead, bestTime, wear and access: short practical notes, "" when there's nothing worth saying. category is one of: ${CATEGORIES.join(', ')}. lat/lng are real coordinates (4 decimals).
- "note": one short sentence on what changed and why. Never use em dashes.

Respond with JSON only:
{ "note": "", "stops": [ { "time": "", "place": { "name": "", "description": "Two vivid sentences", "area": "", "lat": 0, "lng": 0 }, "duration": "2 hours", "estimatedCost": 0, "priceNote": "", "category": "sight", "tip": "", "hours": "", "bookAhead": "", "bestTime": "", "wear": "", "access": "" } ] }`;
      const completion = await openai!.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 2600,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `You are an expert local travel planner re-planning one day of an existing itinerary. Always respond with valid JSON only.\n\nTRIP\n${tripContext(it.destination, it.startDate, it.numberOfDays, it.budget, data)}` },
            { role: 'user', content: prompt },
          ],
        },
        { timeout: 40000 }
      );
      raw = JSON.parse(completion.choices[0]?.message?.content || '{}');
    }

    const byName = new Map(current.map((s) => [s.activity.place.name.toLowerCase(), s.key]));
    const stops = (Array.isArray(raw.stops) ? raw.stops : [])
      .slice(0, 12)
      .map((s, k) => cleanStop(s, current[Math.min(k, current.length - 1)].activity.time, people))
      .filter((s): s is ActivitySlot => !!s)
      // A stop that stayed keeps its key, so its votes and photo stay with it.
      .map((s) => ({ ...s, id: byName.get(s.place.name.toLowerCase()) }));
    if (!stops.length) throw new Error('No stops');
    const after = stops.reduce((n, s) => n + (s.estimatedCost || 0), 0);
    return NextResponse.json({ success: true, stops, note: str(raw.note, 200), before, after, left });
  } catch (error) {
    console.error('Replan failed:', error instanceof Error ? error.message : error);
    await refundAiRequest(id);
    return NextResponse.json({ success: false, error: "Couldn't replan that day just now." }, { status: 502 });
  }
}

/** Local testing only: a believable rain plan without calling the model. */
function fakeReplan(stops: ActivitySlot[], mode: 'rain' | 'refresh') {
  const indoor = [
    { name: 'Kyoto National Museum', area: 'Higashiyama', category: 'culture', estimatedCost: 14, priceNote: '¥1,000 entry × 2', description: 'Treasures of Japanese art under one roof, from Buddhist sculpture to Edo screens.' },
    { name: 'Kyoto International Manga Museum', area: 'Nakagyo', category: 'culture', estimatedCost: 12, priceNote: '¥1,200 entry × 2', description: 'A former school packed with 300,000 manga you can pull off the shelves and read.' },
    { name: 'Nishiki Market', area: 'Nakagyo', category: 'food', estimatedCost: 30, priceNote: '~¥2,000 each × 2', description: 'A covered five-block arcade of pickles, skewers and tamagoyaki.' },
  ];
  let n = 0;
  return {
    note: mode === 'rain' ? 'Swapped the open-air stops for covered ones in the same neighbourhoods; the rest stays.' : 'A fresh take on the same neighbourhoods.',
    stops: stops.map((s) => {
      if (mode === 'rain' && !isOutdoor(s)) return s;
      const alt = indoor[n++ % indoor.length];
      return { ...s, estimatedCost: Math.min(alt.estimatedCost, s.estimatedCost ?? 0), priceNote: (s.estimatedCost ?? 0) >= alt.estimatedCost ? alt.priceNote : "Free entry on the day",  category: alt.category, place: { ...s.place, name: alt.name, area: alt.area, description: alt.description } };
    }),
  };
}
