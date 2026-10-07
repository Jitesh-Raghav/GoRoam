import { NextRequest, NextResponse } from 'next/server';
import { isGooglePhoto, resolveDishPhoto, resolvePhoto } from '@/lib/place-photos';
import type { PlacePhoto } from '@/lib/trip';

/**
 * A photo for one thing that isn't a trip stop (a hotel, a dish, an experience).
 * Trip stops come in one batch from /api/itinerary/[id]/photos instead.
 * Public on purpose, so shared trips get photos too.
 */

const NONE: PlacePhoto = { url: null };

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const name = (q.get('name') ?? '').trim().slice(0, 140);
  const city = (q.get('city') ?? '').trim().slice(0, 120);
  const area = (q.get('area') ?? '').trim().slice(0, 80) || undefined;
  const lat = q.get('lat') ? Number(q.get('lat')) : undefined;
  const lng = q.get('lng') ? Number(q.get('lng')) : undefined;

  if (!name) return NextResponse.json(NONE, { status: 400 });

  // Dishes are looked up as food, never as a place, so they don't fall back to a city photo.
  const photo = (q.get('kind') === 'dish' ? await resolveDishPhoto(name) : await resolvePhoto({ name, area, lat, lng }, city || name)) ?? NONE;

  return NextResponse.json(photo, {
    headers: {
      // Proxied Google photos stay valid, but their ratings change, so those are cached for a day.
      'Cache-Control': !photo.url
        ? 'no-store'
        : isGooglePhoto(photo)
          ? 'public, max-age=3600, s-maxage=86400'
          : 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
