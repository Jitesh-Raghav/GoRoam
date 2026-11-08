import { NextRequest, NextResponse } from 'next/server';
import { guideBySlug } from '@/lib/destination-guides';
import { photoRedirect } from '@/lib/photo-redirect';

/** A destination guide's photo at a stable address on our own site; see photoRedirect. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) return new NextResponse(null, { status: 404 });
  return photoRedirect(request, g.destination);
}
