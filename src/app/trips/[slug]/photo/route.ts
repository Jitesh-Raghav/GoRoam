import { NextRequest, NextResponse } from 'next/server';
import { destinationPhoto } from '@/lib/destination-photo';
import { tripBySlug } from '@/lib/trip-ideas';

const tracked = new Set<string>();
const size = (v: string | null, fallback: number, max: number) => Math.min(Math.max(Math.round(Number(v)) || fallback, 200), max);

/**
 * A trip's photo at a stable address on our own site (/trips/jaisalmer/photo), so the
 * page's HTML, its link preview, structured data and the sitemap can all name a real
 * image without waiting for the browser to look one up. Redirects to the photo itself
 * (Unsplash asks that its images are served from its CDN), sized by ?w= and ?h=.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const t = tripBySlug((await params).slug);
  if (!t) return new NextResponse(null, { status: 404 });
  const q = request.nextUrl.searchParams;
  const photo = await destinationPhoto(t.destination).catch(() => null);
  // No photo: a 404, so the page keeps its illustration and nothing indexes a stand-in.
  if (!photo?.url) return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=600' } });

  // Unsplash asks apps to ping a photo's download endpoint when they use it.
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (photo.track && key && !tracked.has(photo.track)) {
    tracked.add(photo.track);
    fetch(photo.track, { headers: { Authorization: `Client-ID ${key}` }, signal: AbortSignal.timeout(4000) }).catch(() => tracked.delete(photo.track!));
  }

  let url = photo.url;
  if (url.startsWith('https://images.unsplash.com/')) {
    const u = new URL(url);
    u.searchParams.set('w', String(size(q.get('w'), 1600, 2400)));
    if (q.get('h')) u.searchParams.set('h', String(size(q.get('h'), 900, 1600)));
    url = u.toString();
  }
  return NextResponse.redirect(url, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' },
  });
}
