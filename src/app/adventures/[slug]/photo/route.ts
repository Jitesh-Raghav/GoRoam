import { NextRequest, NextResponse } from 'next/server';
import { adventureSights } from '@/lib/adventure-sights';
import { adventureBySlug } from '@/lib/adventures';
import { photoRedirect } from '@/lib/photo-redirect';

/**
 * An adventure's photo at a stable address on our own site; see photoRedirect. With ?s=N,
 * the photo of its Nth sight (from 0) instead, for the gallery; an N it doesn't have is a 404.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const a = adventureBySlug((await params).slug);
  if (!a) return new NextResponse(null, { status: 404 });
  const s = request.nextUrl.searchParams.get('s');
  if (s === null) return photoRedirect(request, a.place);
  const sight = /^\d{1,2}$/.test(s) ? adventureSights(a)[Number(s)] : undefined;
  if (!sight) return new NextResponse(null, { status: 404 });
  return photoRedirect(request, sight.query);
}
