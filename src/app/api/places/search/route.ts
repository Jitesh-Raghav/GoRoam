import { NextRequest, NextResponse } from 'next/server';
import { googleHeaders, googleKey } from '@/lib/place-photos';

/**
 * Find a specific place to add to a day ("Blue Tokai Coffee", "Louvre"),
 * near the trip. Google Places text search when a key is set, otherwise
 * Photon (OpenStreetMap data, free, no key).
 *   GET ?q=&lat=&lng=  → { places: [{ name, area, address, lat, lng, kind }] }
 */
export interface FoundPlace {
  name: string;
  area?: string;
  address?: string;
  lat?: number;
  lng?: number;
  kind?: string;
}

const cache = new Map<string, FoundPlace[]>();
const round = (n: unknown) => (Number.isFinite(Number(n)) ? Math.round(Number(n) * 10000) / 10000 : undefined);

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
  const lat = Number(request.nextUrl.searchParams.get('lat'));
  const lng = Number(request.nextUrl.searchParams.get('lng'));
  const near = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (q.length < 2) return NextResponse.json({ places: [] });
  const key = `${q.toLowerCase()}|${near ? `${lat.toFixed(1)},${lng.toFixed(1)}` : ''}`;
  const hit = cache.get(key);
  if (hit) return NextResponse.json({ places: hit });

  let places: FoundPlace[] = [];
  const gkey = googleKey();
  if (gkey) {
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': gkey,
          'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress,places.formattedAddress,places.location,places.primaryTypeDisplayName',
          ...googleHeaders(),
        },
        body: JSON.stringify({
          textQuery: q,
          languageCode: 'en',
          maxResultCount: 6,
          ...(near ? { locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 40000 } } } : {}),
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Google's JSON, narrowed here
        places = (data.places ?? []).map((p: any) => ({
          name: p.displayName?.text,
          address: p.shortFormattedAddress ?? p.formattedAddress,
          area: (p.shortFormattedAddress ?? '').split(',').slice(-2, -1)[0]?.trim() || undefined,
          lat: round(p.location?.latitude),
          lng: round(p.location?.longitude),
          kind: p.primaryTypeDisplayName?.text,
        })).filter((p: FoundPlace) => p.name);
      }
    } catch (error) {
      console.warn('place search (google):', error instanceof Error ? error.message : error);
    }
  }
  if (!places.length) {
    try {
      const u = new URL('https://photon.komoot.io/api/');
      u.searchParams.set('q', q);
      u.searchParams.set('limit', '6');
      u.searchParams.set('lang', 'en');
      if (near) {
        u.searchParams.set('lat', String(lat));
        u.searchParams.set('lon', String(lng));
      }
      const res = await fetch(u, { headers: { 'User-Agent': 'GoRoam/1.0 (trip planner)' }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Photon's GeoJSON, narrowed here
        places = (data.features ?? []).map((f: any) => {
          const p = f.properties ?? {};
          const [lon, la] = f.geometry?.coordinates ?? [];
          return {
            name: p.name,
            area: p.district ?? p.locality ?? p.city,
            address: [p.street && `${p.street}${p.housenumber ? ` ${p.housenumber}` : ''}`, p.district ?? p.locality, p.city, p.country].filter(Boolean).join(', '),
            lat: round(la),
            lng: round(lon),
            kind: typeof p.osm_value === 'string' ? p.osm_value.replace(/_/g, ' ') : undefined,
          };
        }).filter((p: FoundPlace) => p.name);
      }
    } catch (error) {
      console.warn('place search (photon):', error instanceof Error ? error.message : error);
    }
  }
  if (places.length) {
    if (cache.size > 2000) cache.delete(cache.keys().next().value!);
    cache.set(key, places);
  }
  return NextResponse.json({ places });
}
