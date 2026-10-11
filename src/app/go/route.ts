import { NextRequest, NextResponse } from 'next/server';
import { PARTNER_HOSTS } from '@/lib/booking';

/**
 * Outbound partner links: /go?p=<partner>&u=<url>. Only known partner sites are
 * allowed (never an open redirect); each click is logged per partner, then the
 * traveller is sent on with a 302. Crawlers are told not to follow or index it.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const partner = (request.nextUrl.searchParams.get('p') ?? 'unknown').slice(0, 40);
  const raw = request.nextUrl.searchParams.get('u') ?? '';
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'Bad link' }, { status: 400 });
  }
  const host = url.hostname.toLowerCase();
  const allowed = url.protocol === 'https:' && PARTNER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  if (!allowed) return NextResponse.json({ error: 'Unknown partner' }, { status: 400 });

  // One line per click, readable in Vercel's logs and easy to count per partner.
  console.log(JSON.stringify({ event: 'partner_click', partner, host, ref: request.headers.get('referer') ?? null }));
  try {
    const { track } = await import('@vercel/analytics/server');
    await track('partner_click', { partner, host });
  } catch {
    /* analytics is best-effort */
  }
  const res = NextResponse.redirect(url.toString(), 302);
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
