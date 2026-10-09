import { NextRequest, NextResponse } from 'next/server';
import { packageBySlug } from '@/lib/packages';
import { loadPackage } from '@/lib/packages-data';
import { resolveTripPhotos } from '@/lib/place-photos';

// Stop photos for a ready-made trip that was written without them. Public and
// cached hard, so each package is looked up once per server, not per visitor.
const cache = new Map<string, Promise<Awaited<ReturnType<typeof resolveTripPhotos>>>>();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  const data = pkg ? await loadPackage(slug) : null;
  if (!pkg || !data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  let hit = cache.get(slug);
  if (!hit) {
    hit = resolveTripPhotos(structuredClone(data), data.summary?.destination || pkg.destination);
    cache.set(slug, hit);
    hit.catch(() => cache.delete(slug));
  }
  try {
    const result = await hit;
    return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } });
  } catch {
    return NextResponse.json({ success: false, photos: {}, fallback: null }, { status: 502 });
  }
}
