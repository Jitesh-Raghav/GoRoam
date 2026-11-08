import { NextRequest, NextResponse } from 'next/server';
import { adventureBySlug } from '@/lib/adventures';
import { photoRedirect } from '@/lib/photo-redirect';

/** An adventure's photo at a stable address on our own site; see photoRedirect. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const a = adventureBySlug((await params).slug);
  if (!a) return new NextResponse(null, { status: 404 });
  return photoRedirect(request, a.place);
}
