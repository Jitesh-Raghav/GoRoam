import { NextRequest, NextResponse } from 'next/server';
import { currencyFor } from '@/lib/currency';

/**
 * Where the visitor is, from the country header Vercel adds to every request
 * (Cloudflare's as a fallback). Prices on the site are shown in that
 * country's currency. Nothing is stored; without a header the client keeps
 * its guess from the browser's language.
 */
export async function GET(request: NextRequest) {
  const raw = request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry');
  const country = raw && /^[a-z]{2}$/i.test(raw) && raw.toUpperCase() !== 'XX' ? raw.toLowerCase() : null;
  return NextResponse.json(
    { country, currency: currencyFor(country) },
    { headers: { 'Cache-Control': 'private, no-store', Vary: 'x-vercel-ip-country' } }
  );
}
