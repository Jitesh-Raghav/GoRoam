import { NextRequest, NextResponse } from 'next/server';

/**
 * Public holidays during a trip, from Nager.Date (free, no key). Holidays
 * close banks and some museums, fill trains and change opening hours, so the
 * trip page flags them on the right days. Countries Nager doesn't cover just
 * return an empty list.
 */
export interface Holiday {
  date: string;
  /** English name, e.g. "Culture Day". */
  name: string;
  /** Name in the local language, when different. */
  localName?: string;
  /** False for holidays kept only in some regions. */
  nationwide: boolean;
}

const cache = new Map<string, { at: number; value: Holiday[] }>();
const TTL = 24 * 3600 * 1000;

async function yearOf(country: string, year: number): Promise<Holiday[]> {
  const key = `${country}-${year}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country.toUpperCase()}`, { signal: AbortSignal.timeout(6000) });
  // 404 / 204: a country Nager doesn't have. Remember that too.
  const raw = res.ok && res.status !== 204 ? ((await res.json()) as { date: string; name: string; localName?: string; global?: boolean }[]) : [];
  if (!res.ok && res.status !== 404) throw new Error(`Nager ${res.status}`);
  const value = (Array.isArray(raw) ? raw : []).map((h) => ({
    date: h.date,
    name: h.name,
    localName: h.localName && h.localName !== h.name ? h.localName : undefined,
    nationwide: h.global !== false,
  }));
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value });
  return value;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const country = (q.get('country') ?? '').toLowerCase();
  const from = q.get('from') ?? '';
  const to = q.get('to') ?? '';
  if (!/^[a-z]{2}$/.test(country) || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const years = [...new Set([Number(from.slice(0, 4)), Number(to.slice(0, 4))])];
  try {
    const all = (await Promise.all(years.map((y) => yearOf(country, y)))).flat();
    const holidays = all.filter((h) => h.date >= from && h.date <= to);
    return NextResponse.json({ holidays }, { headers: { 'Cache-Control': 'public, max-age=21600, s-maxage=86400' } });
  } catch (error) {
    console.error('holidays:', error instanceof Error ? error.message : error);
    return NextResponse.json({ holidays: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
