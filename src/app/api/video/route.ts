import { NextRequest, NextResponse } from 'next/server';
import { findVideo } from '@/lib/videos';

/**
 * The top YouTube video for one search ("Shimla food tour"), so a guide's
 * "watch before you go" ideas each show their own real thumbnail. Public, like
 * the photo lookups, so shared trips get them too.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 120);
  if (!q) return NextResponse.json({ video: null }, { status: 400 });
  const video = await findVideo(q);
  return NextResponse.json(
    { video },
    { headers: { 'Cache-Control': video ? 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' : 'no-store' } }
  );
}
