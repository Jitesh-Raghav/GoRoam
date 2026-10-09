import { NextRequest, NextResponse } from 'next/server';
import { matchPlaces } from '@/lib/cities';
import { googleHeaders, googleKey } from '@/lib/place-photos';

type Suggestion = { main: string; secondary: string };

const cache = new Map<string, Suggestion[]>();

/** City / region suggestions for the planner's From and To fields. Google Places when a key is set, else a built-in list. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const hit = cache.get(q.toLowerCase());
  if (hit) return NextResponse.json({ suggestions: hit, source: 'cache' });

  const key = googleKey();
  if (key) {
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, ...googleHeaders() },
        body: JSON.stringify({ input: q, includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'country', 'natural_feature'], languageCode: 'en' }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Google's JSON, narrowed here
        const list: Suggestion[] = (data.suggestions ?? []).flatMap((s: any) => {
          const p = s.placePrediction?.structuredFormat;
          const main = p?.mainText?.text;
          return main ? [{ main, secondary: p?.secondaryText?.text ?? '' }] : [];
        }).slice(0, 6);
        if (list.length) {
          if (cache.size > 1000) cache.delete(cache.keys().next().value!);
          cache.set(q.toLowerCase(), list);
          return NextResponse.json({ suggestions: list, source: 'google' });
        }
      } else {
        console.warn('places autocomplete:', res.status, (await res.text()).slice(0, 200));
      }
    } catch (error) {
      console.warn('places autocomplete:', error instanceof Error ? error.message : error);
    }
  }
  return NextResponse.json({ suggestions: matchPlaces(q), source: 'local' });
}
