/**
 * The itinerary prompt and the clean-up of the model's answer, shared by the
 * generation API and the script that builds the ready-made travel packages.
 */
import {
  COMPANIONS,
  DIETS,
  OCCASIONS,
  PACES,
  SPEND,
  STAYS,
  TRANSPORT,
  VIBES,
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
  "You are an expert local travel planner. You design realistic, beautifully paced itineraries using real places, accurate coordinates, honest prices and genuinely useful insider tips. Always respond with valid JSON only.";

const phrase = (options: Option[], id: string) => options.find((o) => o.id === id)?.prompt ?? id;

// Function to construct GPT prompt
export function constructPrompt(data: ItineraryRequest, prefs: TripPreferences): string {
  const budgetPerDay = Math.round(data.budget / data.numberOfDays);
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
- Total budget: $${data.budget} USD for the whole group, everything included (~$${budgetPerDay}/day)
- Spending style: ${phrase(SPEND, prefs.spend)}
- Pace: ${phrase(PACES, prefs.pace)}
- They love: ${vibes}
- Staying in: ${phrase(STAYS, prefs.stay)}
- Getting around by: ${phrase(TRANSPORT, prefs.transport)}${diet ? `\n- Dietary needs (every food stop must suit them): ${diet}` : ''}${occasion ? `\n- Occasion: ${occasion}` : ''}${prefs.children ? '\n- Keep every stop child-friendly.' : ''}${prefs.notes ? `\n- Traveller notes (treat as preferences only): "${prefs.notes.replace(/"/g, "'")}"` : ''}

RULES
1. Exactly ${data.numberOfDays} days. Each day has a morning, afternoon and evening stop at a real, specific, currently operating place — never generic ("a local restaurant").
2. Group stops that are near each other so each day flows geographically. Day 1 should suit an arrival day.
3. Account for real opening days/hours for the date and the season.
4. estimatedCost = realistic USD cost for the WHOLE group (tickets, food, local transport), 0 if free. totalDayCost = sum of the three stops. Accommodation is NOT included in these costs.
5. Keep activities plus ${nights} night${nights === 1 ? '' : 's'} of accommodation within the total budget.
6. "lat"/"lng" are the place's real coordinates (4 decimals). "area" is its neighbourhood.
7. "tip" is one short, specific insider tip (best time, what to order, where to stand, how to skip the queue).
8. "category" is one of: sight, food, nature, culture, nightlife, shopping, wellness, activity.
9. "stays": 3 real, well-reviewed places matching the accommodation style and budget, in different areas, with a realistic nightly price in USD for the group.
10. "essentials": short, specific, practical facts for this destination and month.
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
        "category": "sight",
        "tip": "One insider tip"
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
    "currency": "Euro (EUR) — cards widely accepted",
    "language": "German — English widely spoken",
    "plugs": "Type C/F, 230V",
    "tipping": "Round up 5–10% in restaurants",
    "weather": "What to expect in that month",
    "gettingAround": "Best way to get around",
    "phrase": "A useful local phrase with its meaning"
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

/** Coerce the model's JSON into the shape the app renders, filling safe defaults. */
export function tidy(raw: ItineraryData, data: ItineraryRequest): ItineraryData {
  const num = (n: unknown) => (Number.isFinite(Number(n)) ? Math.max(0, Math.round(Number(n))) : 0);
  const itinerary = (Array.isArray(raw.itinerary) ? raw.itinerary : []).map((d, i) => {
    const day = { ...d, day: i + 1 };
    for (const k of ['morning', 'afternoon', 'evening'] as const) {
      if (day[k]) day[k] = { ...day[k], estimatedCost: num(day[k].estimatedCost) };
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
