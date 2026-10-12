// Server-only: how to get to the destination and how to get around once there.
import type OpenAI from 'openai';
import { airportCode, cityOf } from '@/lib/booking';
import { googleHeaders, googleKey } from '@/lib/place-photos';
import { undash } from '@/lib/text';
import type { GetAround, GetThere, ItineraryData, RentalKind, RentalPick, StaySuggestion, TravelOption, TripPreferences } from '@/lib/trip';

export interface LogisticsContext {
  destination: string;
  source?: string;
  startDate: string;
  numberOfDays: number;
  people: number;
  prefs?: TripPreferences;
  /** Multi-city trips: where the trip starts and where it ends. */
  firstCity?: string;
  lastCity?: string;
}

/** The first and last city of a trip, from its legs when it has them. */
export const tripEnds = (destination: string, legs?: { city: string }[]) => ({
  firstCity: legs?.length ? legs[0].city : destination,
  lastCity: legs?.length ? legs[legs.length - 1].city : destination,
});

const MODES = ['flight', 'train', 'bus', 'drive', 'ferry'] as const;
const KINDS: RentalKind[] = ['scooter', 'bike', 'car', 'cycle'];
const BEST = ['cheapest', 'fastest', 'best value'] as const;

const text = (v: unknown, max = 120) => (typeof v === 'string' && v.trim() ? v.replace(/\s+/g, ' ').trim().slice(0, max) : undefined);
const num = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.round(Number(v)) : 0);
const coord = (v: unknown, lim: number) => (Number.isFinite(Number(v)) && Math.abs(Number(v)) <= lim && Number(v) !== 0 ? Math.round(Number(v) * 10000) / 10000 : undefined);

export function logisticsPrompt(ctx: LogisticsContext) {
  const year = ctx.startDate.slice(0, 4);
  const back = new Date(ctx.startDate);
  back.setUTCDate(back.getUTCDate() + ctx.numberOfDays - 1);
  const to = ctx.firstCity || ctx.destination;
  const homeFrom = ctx.lastCity && ctx.lastCity !== to ? ctx.lastCity : null;
  return `A group of ${ctx.people} is travelling from ${ctx.source || 'their home city'} to ${to}${homeFrom ? `, ending the trip in ${homeFrom} and going home from there` : ''}, leaving ${ctx.startDate} and coming back ${back.toISOString().slice(0, 10)}.${ctx.prefs ? ` Spending style: ${ctx.prefs.spend}. Getting around by: ${ctx.prefs.transport}.` : ''}

1. "getThere": the real ways to get from ${ctx.source || 'home'} to ${to} (the city itself, its own airport or station, never a different city's), best first. 2 to 4 options, only modes that genuinely make sense (a direct or one-stop flight, a named train, an overnight sleeper bus, driving when it's under ~10 hours, a ferry).
   - "title": the actual service that runs on THIS route: the airlines that fly it, the named train with its number, the bus operator. Never invent one or reuse a name from another route.
   - "from" and "to": the real airport (with IATA code) or station or bus stand used at each end.
   - "fromCode"/"toCode": IATA codes for flights, "" otherwise.
   - "duration": door-to-door-ish journey time ("2h 10m", "24h overnight").
   - "priceUsd": the typical ${year} fare PER PERSON, ONE WAY, in USD, for the dates (economy, sleeper/3AC or the class most people take). For driving: fuel and tolls for one car, one way.
   - "priceNote": the same fare in the local currency as a range ("₹4,500–6,500 one way").
   - "frequency": how often it runs ("8 flights a day", "Daily, 11:40 AM").
   - "pros": one line on why you'd pick it.
${homeFrom ? `   - "returnNote": how to get home from ${homeFrom} by the same kind of transport, with its typical one-way fare per person in the local currency (under 90 characters).
` : ''}   - "best": tag one option "best value", the cheapest "cheapest", the fastest "fastest" (an option can be untagged).
2. "getAround": renting your own wheels at ${to}${homeFrom ? ` and ${homeFrom}` : ''}.
   - "picks": 3 or 4 real, well-reviewed rental shops or services there, covering the kinds that make sense locally ("scooter", "bike" for motorbikes, "car", "cycle"), each with "kind", "name", "area", "lat", "lng" (real, 4 decimals), "pricePerDayUsd" (typical ${year} rate per day for one vehicle), "priceNote" (local currency, "₹400–600 a day"), "deposit", "needs" (licence or permit needed, e.g. "Two-wheeler licence; IDP for foreigners"), "tip".
   - "notes": 3 short local rules of the road (fuel, helmets, parking, hill roads, tolls).

Never use em dashes. Respond with JSON only:
{"getThere":{"options":[{"mode":"flight","title":"","from":"","to":"","fromCode":"","toCode":"","duration":"","priceUsd":0,"priceNote":"","frequency":"","pros":""${homeFrom ? ',"returnNote":""' : ''},"best":"best value"}]},"getAround":{"picks":[{"kind":"scooter","name":"","area":"","lat":0,"lng":0,"pricePerDayUsd":0,"priceNote":"","deposit":"","needs":"","tip":""}],"notes":[""]}}`;
}

export function tidyGetThere(raw: unknown): GetThere | undefined {
  const r = raw as { options?: unknown[] } | undefined;
  const options: TravelOption[] = (Array.isArray(r?.options) ? r.options : [])
    .map((o) => {
      const x = o as Record<string, unknown>;
      const mode = MODES.find((m) => m === String(x.mode).toLowerCase()) ?? (String(x.mode).toLowerCase() === 'car' ? 'drive' : undefined);
      const title = text(x.title, 80);
      if (!mode || !title) return null;
      const code = (v: unknown) => (typeof v === 'string' && /^[A-Za-z]{3}$/.test(v.trim()) ? v.trim().toUpperCase() : undefined);
      const opt: TravelOption = {
        mode,
        title,
        from: text(x.from, 70) ?? '',
        to: text(x.to, 70) ?? '',
        duration: text(x.duration, 30) ?? '',
        priceUsd: num(x.priceUsd),
        priceNote: text(x.priceNote, 50),
        frequency: text(x.frequency, 50),
        pros: text(x.pros, 140) ?? '',
        returnNote: text(x.returnNote, 110),
        best: BEST.find((b) => b === x.best),
        fromCode: mode === 'flight' ? code(x.fromCode) : undefined,
        toCode: mode === 'flight' ? code(x.toCode) : undefined,
      };
      for (const k of Object.keys(opt) as (keyof TravelOption)[]) if (opt[k] === undefined) delete opt[k];
      return opt;
    })
    .filter((o): o is TravelOption => !!o && o.priceUsd > 0)
    .slice(0, 4);
  if (!options.length) return undefined;
  const pick = Math.max(0, options.findIndex((o) => o.best === 'best value'));
  return { options, pick };
}

export function tidyGetAround(raw: unknown, prefs?: TripPreferences): GetAround | undefined {
  const r = raw as { picks?: unknown[]; notes?: unknown[] } | undefined;
  const picks: RentalPick[] = (Array.isArray(r?.picks) ? r.picks : [])
    .map((p) => {
      const x = p as Record<string, unknown>;
      const kind = KINDS.find((k) => k === String(x.kind).toLowerCase());
      const name = text(x.name, 70);
      if (!kind || !name) return null;
      const pick: RentalPick = {
        kind,
        name,
        area: text(x.area, 50) ?? '',
        lat: coord(x.lat, 90),
        lng: coord(x.lng, 180),
        pricePerDayUsd: num(x.pricePerDayUsd),
        priceNote: text(x.priceNote, 50),
        deposit: text(x.deposit, 60),
        needs: text(x.needs, 80),
        tip: text(x.tip, 140),
      };
      for (const k of Object.keys(pick) as (keyof RentalPick)[]) if (pick[k] === undefined) delete pick[k];
      return pick;
    })
    .filter((p): p is RentalPick => !!p && p.pricePerDayUsd > 0)
    .slice(0, 5);
  if (!picks.length) return undefined;
  const notes = (Array.isArray(r?.notes) ? r.notes : []).map((n) => text(n, 140)).filter((n): n is string => !!n).slice(0, 4);
  const wantsCar = prefs?.transport === 'car';
  const chosen = wantsCar ? Math.max(0, picks.findIndex((p) => p.kind === 'car')) : 0;
  return { picks, notes, inBudget: wantsCar, chosen };
}

export async function generateLogistics(openai: OpenAI, ctx: LogisticsContext): Promise<{ getThere?: GetThere; getAround?: GetAround }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a meticulous travel logistics planner who knows real routes, services, rental shops and current fares. Always respond with valid JSON only.' },
      { role: 'user', content: logisticsPrompt(ctx) },
    ],
    temperature: 0.3,
    max_tokens: 2200,
    response_format: { type: 'json_object' },
  });
  const raw = undash(JSON.parse(completion.choices[0]?.message?.content || '{}'));
  return { getThere: tidyGetThere(raw.getThere), getAround: tidyGetAround(raw.getAround, ctx.prefs) };
}

/** Plausible canned logistics for local testing. */
export function fakeLogistics(ctx: LogisticsContext): { getThere?: GetThere; getAround?: GetAround } {
  const from = cityOf(ctx.source || 'Pune');
  const to = cityOf(ctx.firstCity || ctx.destination);
  const home = ctx.lastCity && ctx.lastCity !== ctx.firstCity ? cityOf(ctx.lastCity) : null;
  return {
    getThere: {
      pick: 0,
      options: [
        { mode: 'flight', title: 'IndiGo or Air India, nonstop', from: `${from} Airport (PNQ)`, to: `${to} Airport (COK)`, fromCode: 'PNQ', toCode: 'COK', duration: '1h 55m', priceUsd: 62, priceNote: '₹4,500–6,500 one way', frequency: '6 flights a day', pros: 'Fastest by far; book 3 weeks ahead for the best fares.', ...(home ? { returnNote: `Home from ${home}: flights from about ₹7,000` } : {}), best: 'best value' },
        { mode: 'train', title: 'Netravati Express 16345', from: `${from} Junction`, to: 'Ernakulam Junction', duration: '24h overnight', priceUsd: 18, priceNote: '₹1,450 in 3AC', frequency: 'Daily, 11:40 AM', pros: 'Coastal views through the Konkan; a berth to sleep in.', best: 'cheapest' },
        { mode: 'bus', title: 'Volvo multi-axle sleeper', from: `${from} Swargate`, to: `${to} Vyttila Hub`, duration: '20h', priceUsd: 24, priceNote: '₹1,900–2,400', frequency: 'Several evenings a week', pros: 'Leaves in the evening, arrives the next afternoon.' },
      ],
    },
    getAround: {
      chosen: 0,
      inBudget: ctx.prefs?.transport === 'car',
      notes: ['Helmets are compulsory for rider and pillion.', 'Fuel up in town; pumps thin out in the hills.', 'Carry your licence and the rental papers at all times.'],
      picks: [
        { kind: 'scooter', name: `${to} Scooter Rentals`, area: 'Fort Kochi', lat: 9.9658, lng: 76.2421, pricePerDayUsd: 6, priceNote: '₹450–600 a day', deposit: '₹2,000 or an ID', needs: 'Two-wheeler licence', tip: 'Ask for a recent-model Activa; photograph any scratches.' },
        { kind: 'bike', name: 'Royal Enfield rentals', area: 'MG Road', lat: 9.9763, lng: 76.2847, pricePerDayUsd: 14, priceNote: '₹1,000–1,300 a day', deposit: '₹5,000', needs: 'Two-wheeler licence; IDP for foreigners', tip: 'Perfect for the ghat roads to Munnar.' },
        { kind: 'car', name: 'Self-drive car hire', area: 'Edappally', lat: 10.0261, lng: 76.3083, pricePerDayUsd: 30, priceNote: '₹2,200–3,000 a day', deposit: '₹10,000', needs: 'Car licence; IDP for foreigners', tip: 'Unlimited-km plans pay off for a hill trip.' },
      ],
    },
  };
}

/* ------------------------------ Real places ------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Google's JSON, narrowed where used
async function searchText(query: string, at?: { lat: number; lng: number }, count = 1): Promise<any[]> {
  const key = googleKey();
  if (!key) return [];
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.displayName,places.location,places.rating,places.googleMapsUri,places.shortFormattedAddress',
        ...googleHeaders(),
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'en', maxResultCount: count, ...(at ? { locationBias: { circle: { center: { latitude: at.lat, longitude: at.lng }, radius: 25000 } } } : {}) }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    return (await res.json()).places ?? [];
  } catch {
    return [];
  }
}

/** The middle of a trip's stops, to search near. */
function centre(data: ItineraryData) {
  const pts = data.itinerary.flatMap((d) => [d.morning, d.afternoon, d.evening, ...(d.stops ?? [])]).filter((s) => s?.place?.lat && s.place.lng);
  if (!pts.length) return undefined;
  return { lat: pts.reduce((n, s) => n + s!.place.lat!, 0) / pts.length, lng: pts.reduce((n, s) => n + s!.place.lng!, 0) / pts.length };
}

/**
 * With a Google key: checks each stay against Places (real pin, rating and link)
 * and swaps the suggested rental shops for real, well-rated ones nearby, keeping
 * the typical prices. Without a key it changes nothing.
 */
export async function enrichPlaces(data: ItineraryData, destination: string): Promise<{ stays?: StaySuggestion[]; getAround?: GetAround } | null> {
  if (!googleKey()) return null;
  const at = centre(data);
  const city = cityOf(destination);
  const stays = data.stays?.length
    ? await Promise.all(
        data.stays.map(async (s) => {
          const [p] = await searchText(`${s.name}, ${s.area}, ${s.city ? cityOf(s.city) : city}`, at);
          if (!p?.location) return s;
          return { ...s, lat: coord(p.location.latitude, 90), lng: coord(p.location.longitude, 180), rating: typeof p.rating === 'number' ? p.rating : s.rating, mapsUrl: p.googleMapsUri ?? s.mapsUrl };
        }),
      )
    : undefined;
  let getAround = data.getAround;
  if (getAround?.picks.length) {
    const kinds = [...new Set(getAround.picks.map((p) => p.kind))];
    const found = await Promise.all(kinds.map((k) => searchText(`${k === 'bike' ? 'motorbike' : k === 'cycle' ? 'bicycle' : k} rental in ${city}`, at, 2).then((r) => ({ k, r }))));
    const picks: RentalPick[] = [];
    for (const { k, r } of found) {
      const template = getAround.picks.find((p) => p.kind === k)!;
      const good = r.filter((p) => p.location && (p.rating ?? 0) >= 4);
      if (!good.length) picks.push(...getAround.picks.filter((p) => p.kind === k));
      for (const p of good)
        picks.push({ ...template, name: String(p.displayName?.text ?? template.name).slice(0, 70), area: String(p.shortFormattedAddress ?? template.area).split(',').slice(-2, -1)[0]?.trim() || template.area, lat: coord(p.location.latitude, 90), lng: coord(p.location.longitude, 180), rating: p.rating, mapsUrl: p.googleMapsUri });
    }
    getAround = { ...getAround, picks: picks.slice(0, 6), chosen: 0 };
  }
  return { stays, getAround };
}

/* ------------------------------ Live fares ------------------------------ */

/**
 * The cheapest real fare for the flight option (Aviasales data via
 * Travelpayouts), when TRAVELPAYOUTS_TOKEN is set. Per person, one way, USD.
 */
export async function liveFlightFare(o: TravelOption, origin: string, destination: string, date: string): Promise<number | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token || o.mode !== 'flight') return null;
  const a = o.fromCode || airportCode(origin);
  const b = o.toCode || airportCode(destination);
  if (!a || !b) return null;
  try {
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({ origin: a, destination: b, departure_at: date.slice(0, 7), currency: 'usd', sorting: 'price', one_way: 'true', limit: '1', token })}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 21600 } });
    if (!res.ok) return null;
    const price = (await res.json())?.data?.[0]?.price;
    return Number.isFinite(Number(price)) && Number(price) > 0 ? Math.round(Number(price)) : null;
  } catch {
    return null;
  }
}

/** Swaps the typical flight fare for a live one when a fare feed is configured. */
export async function withLiveFares(g: GetThere | undefined, ctx: LogisticsContext): Promise<GetThere | undefined> {
  if (!g || !process.env.TRAVELPAYOUTS_TOKEN) return g;
  const options = await Promise.all(
    g.options.map(async (o) => {
      const live = await liveFlightFare(o, ctx.source ?? '', ctx.firstCity || ctx.destination, ctx.startDate);
      return live ? { ...o, priceUsd: live, live: true } : o;
    }),
  );
  return { ...g, options };
}
