import { NextResponse, type NextRequest } from 'next/server';
import { destinationPhoto } from '@/lib/destination-photo';

const tracked = new Set<string>();
const BLANK = '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"/>';
const size = (v: string | null, fallback: number, max: number) => Math.min(Math.max(Math.round(Number(v)) || fallback, 200), max);

/**
 * A place's photo at a stable address on our own site (/trips/jaisalmer/photo,
 * /destinations/goa/photo), so a page's HTML, its link preview, structured data and the
 * sitemap can all name a real image without waiting for the browser to look one up.
 * Redirects to the photo itself (Unsplash asks that its images are served from its CDN),
 * sized by ?w= and ?h=.
 *
 * With no photo: cards ask with ?blank=1 and get an empty image, so their quiet
 * placeholder shows (a failed image would draw the browser's broken-image icon, and they
 * have no script to hide it); anything else gets a 404, so the page keeps its illustration
 * and nothing indexes a stand-in.
 */
export async function photoRedirect(request: NextRequest, destination: string) {
  const q = request.nextUrl.searchParams;
  const photo = await destinationPhoto(destination).catch(() => null);
  if (!photo?.url) {
    if (q.get('blank')) return new NextResponse(BLANK, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=600', 'X-Robots-Tag': 'noindex' } });
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=600' } });
  }

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
  // Google Places photos come back as our own relative proxy URL; a redirect needs an absolute one.
  return NextResponse.redirect(new URL(url, request.url), {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' },
  });
}
