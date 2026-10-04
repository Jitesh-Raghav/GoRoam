import { NextRequest, NextResponse } from 'next/server';
import { destinationPhoto } from '@/lib/destination-photo';

/**
 * A big, real photo of a destination for the trip hero ("Moscow, Russia" → Red Square
 * at dusk). Public, so shared trips get it too; cached at the edge for a week.
 */
const tracked = new Set<string>();

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 120);
  if (!q) return NextResponse.json({ url: null }, { status: 400 });

  const photo = await destinationPhoto(q);
  if (!photo?.url) {
    return NextResponse.json({ url: null }, { headers: { 'Cache-Control': 'public, max-age=600' } });
  }

  // Unsplash asks apps to ping a photo's download endpoint when they use it.
  const { track, ...rest } = photo;
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (track && key && !tracked.has(track)) {
    tracked.add(track);
    fetch(track, { headers: { Authorization: `Client-ID ${key}` }, signal: AbortSignal.timeout(4000) }).catch(() => tracked.delete(track));
  }

  return NextResponse.json(rest, {
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' },
  });
}
