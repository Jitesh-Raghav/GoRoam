import { NextResponse } from 'next/server';

/** Exchange rates against USD (open.er-api.com: free, no key, refreshed daily). */
let cached: { at: number; rates: Record<string, number> } | null = null;
const TTL = 12 * 3600 * 1000;

export async function GET() {
  if (!cached || Date.now() - cached.at > TTL) {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(6000) });
      const data = res.ok ? await res.json() : null;
      if (data?.result !== 'success' || !data.rates) throw new Error(`FX ${res.status}`);
      cached = { at: Date.now(), rates: data.rates };
    } catch (error) {
      console.error('fx:', error instanceof Error ? error.message : error);
      if (!cached) return NextResponse.json({ error: 'Rates unavailable' }, { status: 502 });
    }
  }
  return NextResponse.json({ base: 'USD', rates: cached.rates, updated: cached.at }, { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=21600' } });
}
