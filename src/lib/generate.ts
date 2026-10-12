// Server-only: turns a trip request into a full itinerary with OpenAI.
import OpenAI from 'openai';
import { generateGuide } from '@/lib/guide';
import { SYSTEM_PROMPT, constructPrompt, tidy, tidyDay, tidyOutline, type ItineraryRequest, type PromptMode } from '@/lib/itinerary-ai';
import { enrichPlaces, fakeLogistics, generateLogistics, tripEnds, withLiveFares, type LogisticsContext } from '@/lib/logistics';
import { mutateTrip } from '@/lib/trip-store';
import { dayStops, normalizePreferences, type DayItinerary, type ItineraryData, type TripPreferences } from '@/lib/trip';

let client: OpenAI | null = null;
const openai = () => (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

/** Strip a ```json fence if the model added one. */
function unfence(text: string) {
  const t = text.trim();
  return t.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
}

/**
 * Builds the day-by-day plan (and, unless skipped, the local guide alongside it,
 * so it adds no wait). Throws when the model fails or returns unusable JSON.
 */
export async function generateItineraryData(data: ItineraryRequest, prefs: TripPreferences, opts: { guide?: boolean } = {}): Promise<ItineraryData> {
  // Local testing without an OpenAI key: a small canned trip (never in production).
  if (process.env.NODE_ENV !== 'production' && process.env.GOROAM_FAKE_AI === '1') return fakeTrip(data, prefs);

  const guidePromise = opts.guide === false
    ? Promise.resolve(undefined)
    : generateGuide(openai(), {
        destination: data.destination,
        source: data.source,
        startDate: data.startDate,
        numberOfDays: data.numberOfDays,
        interests: data.interests,
        preferences: prefs,
      }).catch((error) => {
        console.error('Guide generation failed:', error instanceof Error ? error.message : error);
        return undefined;
      });

  const completion = await openai().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: constructPrompt(data, prefs) },
    ],
    temperature: 0.7,
    max_tokens: 12000,
    response_format: { type: 'json_object' },
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('No response from OpenAI');

  let itineraryData: ItineraryData;
  try {
    itineraryData = tidy(JSON.parse(unfence(text)), data);
  } catch (error) {
    console.error('Failed to parse GPT response:', text.slice(0, 500), error);
    throw new Error('Invalid response format from AI');
  }
  itineraryData.trip = { source: data.source, preferences: prefs, ...(data.legs?.length ? { legs: data.legs } : {}) };
  delete itineraryData.guide;
  const guide = await guidePromise;
  if (guide) itineraryData.guide = guide;
  return itineraryData;
}

const fake = () => process.env.NODE_ENV !== 'production' && process.env.GOROAM_FAKE_AI === '1';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ask(data: ItineraryRequest, prefs: TripPreferences, mode: PromptMode, maxTokens: number) {
  const completion = await openai().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: constructPrompt(data, prefs, mode) },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('No response from OpenAI');
  return JSON.parse(unfence(text));
}

const logisticsContext = (data: ItineraryRequest, prefs: TripPreferences): LogisticsContext => ({
  destination: data.destination,
  source: data.source,
  startDate: data.startDate,
  numberOfDays: data.numberOfDays,
  people: data.numberOfPeople,
  prefs,
  ...tripEnds(data.destination, data.legs),
});

/** A day still being written: its outline, shown as a placeholder until the real day lands. */
function placeholder(n: number, data: ItineraryRequest, theme: string, area: string): DayItinerary {
  const d = new Date(`${data.startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n - 1);
  return { day: n, date: d.toISOString().slice(0, 10), theme, summary: area ? `Around ${area}.` : undefined, totalDayCost: 0 };
}

/**
 * The first look at a trip, fast: day 1 in full, an outline of every other day,
 * where to stay, how to get there and how to get around. The other days are
 * listed in `pending` and written afterwards by `finishTrip`.
 */
export async function generateFirstLook(data: ItineraryRequest, prefs: TripPreferences): Promise<ItineraryData> {
  const ctx = logisticsContext(data, prefs);
  let trip: ItineraryData;
  let logistics: Awaited<ReturnType<typeof generateLogistics>>;
  if (fake()) {
    trip = fakeTrip({ ...data, numberOfDays: 1 }, prefs);
    trip.outline = Array.from({ length: data.numberOfDays }, (_, i) => ({ day: i + 1, theme: `Day ${i + 1} in ${data.destination.split(',')[0]}`, area: 'Old town', anchors: [] }));
    logistics = fakeLogistics(ctx);
  } else {
    const [model, l] = await Promise.all([
      ask(data, prefs, data.numberOfDays > 1 ? { kind: 'first' } : { kind: 'full' }, 5000),
      generateLogistics(openai(), ctx).catch((error) => {
        console.error('Logistics failed:', error instanceof Error ? error.message : error);
        return {};
      }),
    ]);
    const outline = tidyOutline(model.outline, data.numberOfDays);
    trip = tidy({ ...model, itinerary: (model.itinerary ?? []).slice(0, 1) }, data);
    trip.outline = outline;
    logistics = l;
  }
  const outline = trip.outline!;
  const first = trip.itinerary[0];
  if (!first) throw new Error('Invalid response format from AI');
  trip.itinerary = [first, ...outline.slice(1).map((o) => placeholder(o.day, data, o.theme, o.area))];
  // Multi-city: the placeholders carry their city too.
  let i = 0;
  for (const leg of data.legs ?? []) for (let k = 0; k < leg.days && i < trip.itinerary.length; k++, i++) trip.itinerary[i].city = leg.city;
  if (data.numberOfDays > 1) trip.pending = outline.slice(1).map((o) => o.day);
  else delete trip.outline;
  trip.summary = { ...trip.summary, totalDays: data.numberOfDays };
  trip.getThere = await withLiveFares(logistics.getThere, ctx);
  trip.getAround = logistics.getAround;
  trip.trip = { source: data.source, preferences: prefs, ...(data.legs?.length ? { legs: data.legs } : {}) };
  delete trip.guide;
  return trip;
}

/** Every place a trip already visits, so a day being written doesn't repeat one. */
const visited = (trip: ItineraryData, except: number) => [
  ...trip.itinerary.filter((d) => d.day !== except).flatMap((d) => dayStops(d).map((s) => s.activity.place.name)),
  ...(trip.outline ?? []).filter((o) => o.day !== except).flatMap((o) => o.anchors),
];

async function writeDay(data: ItineraryRequest, prefs: TripPreferences, trip: ItineraryData, n: number): Promise<DayItinerary> {
  if (fake()) {
    await sleep(1200 * (n - 1));
    if (process.env.GOROAM_FAKE_FAIL_DAY === String(n)) throw new Error('Simulated failure');
    return tidyDay(fakeTrip({ ...data, numberOfDays: n }, prefs).itinerary[n - 1], n, data);
  }
  const model = await ask(data, prefs, { kind: 'day', day: n, outline: trip.outline?.find((o) => o.day === n), avoid: visited(trip, n) }, 2500);
  const day = Array.isArray(model.itinerary) ? model.itinerary[0] : model.day ?? model;
  if (!day || typeof day !== 'object') throw new Error('Invalid day from AI');
  return tidyDay(day, n, data);
}

/** The original request, rebuilt from a stored trip (for finishing it later). */
export function requestFromTrip(row: { destination: string; startDate: Date; numberOfDays: number; budget: number; numberOfPeople: number; tripType: string; interests: string }, trip: ItineraryData): { data: ItineraryRequest; prefs: TripPreferences } {
  let interests: string[] = [];
  try {
    interests = JSON.parse(row.interests);
  } catch {}
  const prefs = normalizePreferences(trip.trip?.preferences ?? { adults: row.numberOfPeople });
  return {
    data: {
      source: trip.trip?.source ?? '',
      destination: row.destination,
      startDate: row.startDate.toISOString().slice(0, 10),
      numberOfDays: row.numberOfDays,
      budget: row.budget,
      numberOfPeople: row.numberOfPeople,
      tripType: row.tripType,
      interests,
      ...(trip.trip?.legs?.length ? { legs: trip.trip.legs } : {}),
    },
    prefs,
  };
}

const finishing = new Map<string, Promise<void>>();

/**
 * Writes the days still pending, a few at a time, saving each as soon as it's
 * ready so the trip page fills in day by day. Days that fail stay pending and
 * the trip is marked "partial", ready for "Finish writing".
 */
export function finishTrip(id: string, data: ItineraryRequest, prefs: TripPreferences): Promise<void> {
  const running = finishing.get(id);
  if (running) return running;
  const job = (async () => {
    const { prisma } = await import('@/lib/prisma');
    const row = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
    if (!row) return;
    const trip = JSON.parse(row.itineraryData) as ItineraryData;
    const queue = [...(trip.pending ?? [])];
    if (!queue.length) return;
    let failed = 0;
    const worker = async () => {
      for (let n = queue.shift(); n !== undefined; n = queue.shift()) {
        try {
          const day = await writeDay(data, prefs, trip, n);
          await mutateTrip(id, (t) => {
            if (!t.pending?.includes(n)) return;
            t.itinerary[n - 1] = day;
            t.pending = t.pending.filter((x) => x !== n);
            t.summary = { ...t.summary, totalCost: t.itinerary.reduce((s, d) => s + (d.totalDayCost || 0), 0) };
            if (t.pending.length) return;
            delete t.pending;
            return { status: 'completed' };
          });
          trip.itinerary[n - 1] = day;
        } catch (error) {
          failed++;
          console.error(`Writing day ${n} failed:`, error instanceof Error ? error.message : error);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
    if (failed) await mutateTrip(id, (t) => (t.pending?.length ? { status: 'partial' } : undefined));
    // The new days' stops get their photos too.
    const fresh = await prisma.itinerary.findUnique({ where: { id }, select: { id: true, destination: true, itineraryData: true } });
    if (fresh) await (await import('@/lib/place-photos')).photosForItinerary(fresh).catch(() => {});
  })().finally(() => finishing.delete(id));
  finishing.set(id, job);
  return job;
}

/** With a Google key, swaps in real pins, ratings and rental shops. */
export async function enrichTrip(id: string, destination: string) {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
  if (!row) return;
  const found = await enrichPlaces(JSON.parse(row.itineraryData), destination);
  if (!found) return;
  await mutateTrip(id, (t) => {
    if (found.stays) t.stays = found.stays;
    if (found.getAround) t.getAround = { ...found.getAround, inBudget: t.getAround?.inBudget };
  });
}

function fakeTrip(data: ItineraryRequest, prefs: TripPreferences): ItineraryData {
  const city = data.destination.split(',')[0];
  const slot = (time: string, name: string, cost: number, lat: number, lng: number) => ({
    time,
    place: { name, description: `${name} is a well-loved stop in ${city}, with plenty to see for a few hours.`, area: city, lat, lng },
    duration: '3 hours',
    estimatedCost: cost,
    category: 'sight',
    tip: 'Go early to beat the crowds.',
  });
  const legOf = (i: number) => {
    let n = 0;
    for (const l of data.legs ?? []) if (i < (n += l.days)) return l;
    return undefined;
  };
  const itinerary = Array.from({ length: data.numberOfDays }, (_, i) => {
    const m = slot('9:00 AM - 12:00 PM', `${city} Old Fort ${i + 1}`, 10, 15.33 + i * 0.01, 76.46);
    const a = slot('1:00 PM - 4:00 PM', `${city} Market ${i + 1}`, 20, 15.34 + i * 0.01, 76.47);
    const e = slot('6:00 PM - 9:00 PM', `${city} Sunset Point ${i + 1}`, 15, 15.35 + i * 0.01, 76.45);
    const leg = legOf(i);
    const prev = i > 0 ? legOf(i - 1) : undefined;
    const here = leg?.city.split(',')[0] ?? city;
    return {
      day: i + 1,
      date: data.startDate,
      theme: `Day ${i + 1} in ${here}`,
      summary: `Exploring ${here}.`,
      morning: m,
      afternoon: a,
      evening: e,
      totalDayCost: 45,
      ...(leg ? { city: leg.city } : {}),
      ...(leg && prev && prev !== leg ? { transfer: { from: prev.city, to: leg.city, mode: 'train', duration: '4h 30m', depart: '7:00 AM', cost: 30, tip: 'Book a window seat on the left for the view.' } } : {}),
    };
  });
  const stays = [
    { name: `${city} Backpackers`, area: 'Fort Kochi', type: prefs.stay === 'hostel' ? 'Hostel' : 'Boutique hotel', why: 'Social, spotless dorms a short walk from the waterfront.', pricePerNight: 22, rating: 4.6, lat: 9.9667, lng: 76.2425 },
    { name: `Zostel ${city}`, area: 'Fort Kochi', type: prefs.stay === 'hostel' ? 'Hostel' : 'Hotel', why: 'Rooftop common room and walking tours most evenings.', pricePerNight: 18, rating: 4.4, lat: 9.9641, lng: 76.2453 },
    { name: `${city} Lagoon House`, area: 'Mattancherry', type: prefs.stay === 'hostel' ? 'Hostel' : 'Homestay', why: 'Quiet private rooms by the spice market.', pricePerNight: 30, rating: 4.7, lat: 9.9583, lng: 76.2597 },
    { name: `${city} City Stay`, area: 'MG Road', type: prefs.stay === 'hostel' ? 'Hostel' : 'Hotel', why: 'Close to the metro for day trips inland.', pricePerNight: 25, rating: 4.3, lat: 9.9767, lng: 76.2843 },
  ];
  return {
    itinerary,
    stays,
    summary: { totalCost: 45 * data.numberOfDays, totalDays: data.numberOfDays, destination: data.destination, highlights: [`The old fort of ${city}`], overview: `A test trip to ${city}.`, landscape: 'mountains' },
    trip: { source: data.source, preferences: prefs },
  };
}
