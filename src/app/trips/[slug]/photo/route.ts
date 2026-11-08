import { NextRequest, NextResponse } from 'next/server';
import { photoRedirect } from '@/lib/photo-redirect';
import { tripBySlug } from '@/lib/trip-ideas';

/** A trip's photo at a stable address on our own site; see photoRedirect. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const t = tripBySlug((await params).slug);
  if (!t) return new NextResponse(null, { status: 404 });
  return photoRedirect(request, t.destination);
}
