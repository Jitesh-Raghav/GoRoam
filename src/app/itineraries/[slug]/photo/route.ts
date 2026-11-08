import { NextRequest, NextResponse } from 'next/server';
import { sizedPhoto } from '@/lib/brand-photos';
import { packageBySlug } from '@/lib/packages';
import { loadPackage } from '@/lib/packages-data';
import { photoRedirect } from '@/lib/photo-redirect';

/**
 * A ready-made itinerary's cover at a stable address: the photo of one of its stops that
 * the trip carries, or failing that the destination's photo (see photoRedirect).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const pkg = packageBySlug(slug);
  if (!pkg) return new NextResponse(null, { status: 404 });
  const data = await loadPackage(slug).catch(() => null);
  const photos = Object.values(data?.photos ?? {});
  const cover = photos.find((p) => p.kind === 'place' && p.url) ?? photos.find((p) => p.url) ?? null;
  if (cover?.url) {
    const w = Math.min(Math.max(Math.round(Number(request.nextUrl.searchParams.get('w'))) || 1200, 200), 2400);
    const url = sizedPhoto(cover, w)?.url ?? cover.url;
    return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' } });
  }
  return photoRedirect(request, pkg.destination);
}
