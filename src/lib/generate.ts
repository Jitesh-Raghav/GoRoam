// Server-only: turns a trip request into a full itinerary with OpenAI.
import OpenAI from 'openai';
import { generateGuide } from '@/lib/guide';
import { SYSTEM_PROMPT, constructPrompt, tidy, type ItineraryRequest } from '@/lib/itinerary-ai';
import type { ItineraryData, TripPreferences } from '@/lib/trip';

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
  itineraryData.trip = { source: data.source, preferences: prefs };
  delete itineraryData.guide;
  const guide = await guidePromise;
  if (guide) itineraryData.guide = guide;
  return itineraryData;
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
  const itinerary = Array.from({ length: data.numberOfDays }, (_, i) => {
    const m = slot('9:00 AM - 12:00 PM', `${city} Old Fort ${i + 1}`, 10, 15.33 + i * 0.01, 76.46);
    const a = slot('1:00 PM - 4:00 PM', `${city} Market ${i + 1}`, 20, 15.34 + i * 0.01, 76.47);
    const e = slot('6:00 PM - 9:00 PM', `${city} Sunset Point ${i + 1}`, 15, 15.35 + i * 0.01, 76.45);
    return { day: i + 1, date: data.startDate, theme: `Day ${i + 1} in ${city}`, summary: `Exploring ${city}.`, morning: m, afternoon: a, evening: e, totalDayCost: 45 };
  });
  return {
    itinerary,
    summary: { totalCost: 45 * data.numberOfDays, totalDays: data.numberOfDays, destination: data.destination, highlights: [`The old fort of ${city}`], overview: `A test trip to ${city}.`, landscape: 'mountains' },
    trip: { source: data.source, preferences: prefs },
  };
}
