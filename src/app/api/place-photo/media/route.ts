import { NextRequest, NextResponse } from 'next/server';
import { googleHeaders, googleKey } from '@/lib/place-photos';

/**
 * Serves a Google Places photo by its resource name. Google's image links are
 * short-lived and mustn't be stored, so trips keep this stable address and it
 * redirects to a fresh link (cached for a day at the edge).
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref') ?? '';
  const key = googleKey();
  // Stop cards use the default; the trip hero asks for a wider shot.
  const width = Math.max(400, Math.min(2400, Math.round(Number(request.nextUrl.searchParams.get('w')) || 1200)));
  if (!key || !/^places\/[\w-]+\/photos\/[\w-]+$/.test(ref)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${width}&skipHttpRedirect=true&key=${key}`, {
      headers: googleHeaders(),
      signal: AbortSignal.timeout(6000),
    });
    const data = res.ok ? await res.json() : null;
    if (!data?.photoUri) return new NextResponse(null, { status: 404 });
    return NextResponse.redirect(data.photoUri, {
      status: 302,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
