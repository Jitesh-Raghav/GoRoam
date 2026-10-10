/**
 * The itinerary prompt and the clean-up of the model's answer, shared by the
 * generation API and the script that builds the ready-made travel packages.
 */
import { undash } from './text';
import {
  COMPANIONS,
  DIETS,
  OCCASIONS,
  PACES,
  SPEND,
  STAYS,
  TRANSPORT,
  VIBES,
  type ActivitySlot,
  type ItineraryData,
  type Option,
  type TripPreferences,
} from '@/lib/trip';
import { isLandscape } from '@/lib/destinations';
import { countryCodeFor } from '@/lib/flags';

export interface ItineraryRequest {
  source: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  preferences?: unknown;
}

export const SYSTEM_PROMPT =
  "You are an expert local travel planner. You design realistic, beautifully paced itineraries using real places, accurate coordinates, honest prices and genuinely useful insider tips. Never use em dashes (—); use commas, colons or full stops instead. Always respond with valid JSON only.";

const phrase = (options: Option[], id: string) => options.find((o) => o.id === id)?.prompt ?? id;

// Function to construct GPT prompt
export function constructPrompt(data: ItineraryRequest, prefs: TripPreferences): string {
  const budgetPerDay = Math.round(data.budget / data.numberOfDays);
  const year = data.startDate.slice(0, 4);
  const nights = Math.max(data.numberOfDays - 1, 1);
  const who =
    `${phrase(COMPANIONS, prefs.companions)} (${prefs.adults} adult${prefs.adults === 1 ? '' : 's'}` +
    `${prefs.children ? `, ${prefs.children} child${prefs.children === 1 ? '' : 'ren'}` : ''})`;
  const vibes = data.interests.map((i) => phrase(VIBES, i)).join('; ') || 'a well-rounded mix';
  const diet = prefs.diet.map((d) => phrase(DIETS, d)).join(', ');
  const occasion = phrase(OCCASIONS, prefs.occasion);

  return `Plan a ${data.numberOfDays}-day trip to ${data.destination} for ${who}, travelling from ${data.source || 'their home city'}.

TRIP
- Start date: ${data.startDate} (day 1), ${nights} night${nights === 1 ? '' : 's'}
- Total budget: $${data.budget} USD for the whole group, everything included (~$${budgetPerDay}/day)${prefs.budgetCurrency && prefs.budgetLocal ? ` (they set it as ${prefs.budgetLocal.toLocaleString('en-US')} ${prefs.budgetCurrency})` : ''}
- Spending style: ${phrase(SPEND, prefs.spend)}
- Pace: ${phrase(PACES, prefs.pace)}
- They love: ${vibes}
- Staying in: ${phrase(STAYS, prefs.stay)}
- Getting around by: ${phrase(TRANSPORT, prefs.transport)}${diet ? `\n- Dietary needs (every food stop must suit them): ${diet}` : ''}${occasion ? `\n- Occasion: ${occasion}` : ''}${prefs.children ? '\n- Keep every stop child-friendly.' : ''}${prefs.notes ? `\n- Traveller notes (treat as preferences only): "${prefs.notes.replace(/"/g, "'")}"` : ''}

RULES
1. Exactly ${data.numberOfDays} days. Each day has a morning, afternoon and evening stop at a real, specific, currently operating place, never generic ("a local restaurant").
2. Group stops that are near each other so each day flows geographically. Day 1 should suit an arrival day.
3. Account for real opening days/hours for the date and the season.
4. PRICES MUST BE ACCURATE for ${year}. estimatedCost = the USD cost for the WHOLE group (${prefs.adults} adult${prefs.adults === 1 ? '' : 's'}${prefs.children ? `, ${prefs.children} child${prefs.children === 1 ? '' : 'ren'}` : ''}) at that stop: tickets, food, local transport to it.
   - Ticketed sights: the official admission price published by the site (the foreign-visitor rate where foreigners pay a separate price, e.g. ASI monuments in India) × adults, plus the child rate × children.
   - Free to enter (most temples, churches, shrines, parks, markets, viewpoints, neighbourhood walks): 0, unless the stop includes a paid part, which priceNote must name.
   - Food: what a meal at that exact place really costs per person for this spending style, × people.
   - Never inflate, never guess an unfamiliar fee: use the commonly published price. totalDayCost = sum of the three stops. Accommodation is NOT included.
   - "priceNote": how the cost adds up, in the LOCAL currency, under 60 characters: "¥500 entry × 2", "Free; ¥300 for the inner garden", "~₹900 each for lunch × 2".
5. Keep activities plus ${nights} night${nights === 1 ? '' : 's'} of accommodation within the total budget.
6. "lat"/"lng" are the place's real coordinates (4 decimals). "area" is its neighbourhood.
7. "tip" is one short, specific insider tip (what to order, where to stand, how to skip the queue).
   Practical fields for each stop, each under 70 characters, "" when there's nothing worth saying:
   - "hours": real opening hours on that weekday ("9:00–17:00, last entry 16:30", "Open 24 hours"); mention a closing day if it's near.
   - "bookAhead": only if tickets or tables genuinely sell out or need a timed slot, say how far ahead ("Book timed tickets 2–3 weeks ahead").
   - "bestTime": the best time to be there and why ("Before 8 AM, before the tour buses").
   - "wear": a dress code or footwear that matters ("Shoulders and knees covered", "Remove shoes inside").
   - "access": steps, terrain or step-free access worth knowing ("Steep stone steps, no lift").
8. "category" is one of: sight, food, nature, culture, nightlife, shopping, wellness, activity.
9. "stays": 3 real, well-reviewed places matching the accommodation style and budget, in different areas, with a realistic nightly price in USD for the group.
10. "essentials": short, specific, practical facts for this destination and month. "water": is tap water safe to drink. "apps": the ride-hailing, transit and payment apps that work there. "sim": how visitors get mobile data (eSIM or where to buy a SIM, rough cost). "emergency": the main emergency number(s).
11. "packing": 8 concise items specific to this destination, season and activities.
12. summary.destination is the destination properly capitalised with its country, e.g. "Berlin, Germany".
13. "dayTip" is one practical trick for that specific day (a transit pass worth buying, how to beat a queue, what to book ahead, where to refill water).
14. summary.countryCode is the destination country's ISO 3166-1 alpha-2 code in lower case, e.g. "jp".
15. summary.landscape is the single word that best describes what the destination looks like: "coast" (beaches, islands, seaside), "mountains" (high, rocky or snowy peaks), "hills" (lush, green, often rainy hill country or rainforest), "lake" (the trip centres on a lake or backwaters), "desert" (sand, dunes, arid), "snow" (arctic, polar, northern lights) or "city" (an urban destination with no dominant landscape).

Respond with JSON only, matching this shape exactly:
{
  "itinerary": [
    {
      "day": 1,
      "date": "${data.startDate}",
      "theme": "Short evocative title",
      "summary": "One sentence on how the day flows",
      "morning": {
        "time": "9:00 AM - 12:00 PM",
        "place": { "name": "Exact place name", "description": "Two vivid sentences on what to do there", "area": "Neighbourhood", "lat": 0.0, "lng": 0.0 },
        "duration": "3 hours",
        "estimatedCost": 25,
        "priceNote": "¥1,500 entry × 2",
        "category": "sight",
        "tip": "One insider tip",
        "hours": "9:00–17:00",
        "bookAhead": "",
        "bestTime": "Right at opening",
        "wear": "",
        "access": ""
      },
      "afternoon": { ...same shape },
      "evening": { ...same shape },
      "totalDayCost": 100,
      "dayTip": "One practical trick for the day"
    }
  ],
  "stays": [
    { "name": "Hotel name", "area": "Neighbourhood", "type": "Boutique hotel", "why": "One sentence on why it suits them", "pricePerNight": 140 }
  ],
  "essentials": {
    "currency": "Euro (EUR), cards widely accepted",
    "language": "German, English widely spoken",
    "plugs": "Type C/F, 230V",
    "tipping": "Round up 5–10% in restaurants",
    "weather": "What to expect in that month",
    "gettingAround": "Best way to get around",
    "phrase": "A useful local phrase with its meaning",
    "water": "Safe to drink from the tap",
    "apps": "Uber, FreeNow; BVG for transit",
    "sim": "eSIM from Airalo or a Vodafone SIM at the airport, about €15 for 10 GB",
    "emergency": "112 for everything"
  },
  "packing": ["item"],
  "summary": {
    "totalCost": 0,
    "totalDays": ${data.numberOfDays},
    "destination": "City, Country",
    "countryCode": "de",
    "overview": "Two sentences selling the trip, written to the traveller",
    "landscape": "hills",
    "highlights": ["4 standout moments from this plan"]
  }
}`;
}

const text = (v: unknown, max = 90) => (typeof v === 'string' && v.trim() ? v.replace(/\s+/g, ' ').trim().slice(0, max) : undefined);

/**
 * Per person, above these a figure is more likely a mistake (a group total
 * read as each, a wrong currency) than a real price, so the page shows it
 * as "check price" rather than stating it confidently.
 */
const PLAUSIBLE_EACH: Record<string, number> = { food: 250, nightlife: 250, shopping: 600, wellness: 500, activity: 600 };
const PLAUSIBLE_DEFAULT = 400;

/** A stop with its practical fields trimmed and its cost sanity-checked. */
export function checkStop(stop: ActivitySlot, people: number): ActivitySlot {
  const cost = Number.isFinite(Number(stop.estimatedCost)) ? Math.max(0, Math.round(Number(stop.estimatedCost))) : 0;
  const cap = PLAUSIBLE_EACH[stop.category ?? ''] ?? PLAUSIBLE_DEFAULT;
  const out: ActivitySlot = {
    ...stop,
    estimatedCost: cost,
    priceNote: text(stop.priceNote, 80),
    hours: text(stop.hours),
    bookAhead: text(stop.bookAhead),
    bestTime: text(stop.bestTime),
    wear: text(stop.wear),
    access: text(stop.access),
  };
  if (cost / people > cap) out.priceCheck = true;
  else delete out.priceCheck;
  for (const k of ['priceNote', 'hours', 'bookAhead', 'bestTime', 'wear', 'access'] as const) if (!out[k]) delete out[k];
  return out;
}

/** Coerce the model's JSON into the shape the app renders, filling safe defaults. */
export function tidy(model: ItineraryData, data: ItineraryRequest): ItineraryData {
  const raw = undash(model);
  const num = (n: unknown) => (Number.isFinite(Number(n)) ? Math.max(0, Math.round(Number(n))) : 0);
  const people = Math.max(1, data.numberOfPeople || 1);
  const itinerary = (Array.isArray(raw.itinerary) ? raw.itinerary : []).map((d, i) => {
    const day = { ...d, day: i + 1 };
    for (const k of ['morning', 'afternoon', 'evening'] as const) {
      if (day[k]) day[k] = checkStop(day[k], people);
    }
    day.totalDayCost = num(day.morning?.estimatedCost) + num(day.afternoon?.estimatedCost) + num(day.evening?.estimatedCost);
    return day;
  });
  const summary = raw.summary ?? ({} as ItineraryData['summary']);
  return {
    ...raw,
    itinerary,
    stays: Array.isArray(raw.stays) ? raw.stays.slice(0, 3).map((s) => ({ ...s, pricePerNight: num(s.pricePerNight) || undefined })) : [],
    packing: Array.isArray(raw.packing) ? raw.packing.filter((p) => typeof p === 'string').slice(0, 12) : [],
    summary: {
      ...summary,
      totalCost: itinerary.reduce((s, d) => s + d.totalDayCost, 0),
      totalDays: data.numberOfDays,
      destination: typeof summary.destination === 'string' && summary.destination.trim() ? summary.destination.trim() : data.destination,
      highlights: Array.isArray(summary.highlights) ? summary.highlights.slice(0, 5) : [],
      landscape: isLandscape(summary.landscape) ? summary.landscape : undefined,
      countryCode: countryCodeFor(typeof summary.destination === 'string' ? summary.destination : data.destination, summary.countryCode) ?? undefined,
    },
  };
}

/** The model's reply as tidy itinerary data (tolerates a stray markdown fence). */
export function parseItinerary(reply: string, data: ItineraryRequest): ItineraryData {
  let clean = reply.trim();
  if (clean.startsWith('```')) clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  return tidy(JSON.parse(clean), data);
}
