import { NextRequest, NextResponse } from 'next/server';

/**
 * Weather for each day of a trip, from Open-Meteo (free, no key):
 *   - days within the next 16 days: the live forecast
 *   - days further out: what the same dates were like last year
 *   - days already past: what was recorded
 * Also returns the destination's time zone, for the local-time readout.
 */

export interface DayWeather {
  date: string;
  code: number;
  max: number;
  min: number;
  /** Chance of rain (forecast) or millimetres that fell (history). */
  rain: number | null;
  source: 'forecast' | 'last-year' | 'recorded';
}

export interface TripWeather {
  timezone: string | null;
  days: DayWeather[];
}

const DAILY_FORECAST = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max';
const DAILY_ARCHIVE = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum';
const cache = new Map<string, { at: number; value: TripWeather }>();
const TTL = 3 * 3600 * 1000;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const lastYear = (s: string) => `${Number(s.slice(0, 4)) - 1}${s.slice(4)}`.replace(/-02-29$/, '-02-28');

interface Daily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max?: (number | null)[];
  precipitation_sum?: (number | null)[];
}

async function fetchDaily(base: string, lat: number, lng: number, from: string, to: string, fields: string) {
  const params = new URLSearchParams({ latitude: lat.toFixed(4), longitude: lng.toFixed(4), daily: fields, timezone: 'auto', start_date: from, end_date: to });
  const res = await fetch(`${base}?${params}`, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return (await res.json()) as { timezone?: string; daily?: Daily };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const lat = Number(q.get('lat'));
  const lng = Number(q.get('lng'));
  const start = q.get('start') ?? '';
  const days = Math.round(Number(q.get('days')));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !(days >= 1 && days <= 30)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const key = `${lat.toFixed(2)},${lng.toFixed(2)},${start},${days}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return NextResponse.json(hit.value, { headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=10800' } });

  const today = iso(new Date());
  const horizon = addDays(today, 15);
  const recordedUntil = addDays(today, -6); // the archive lags a few days
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const forecastDates = dates.filter((d) => d >= addDays(today, -1) && d <= horizon);
  const pastDates = dates.filter((d) => d <= recordedUntil);
  const futureDates = dates.filter((d) => !forecastDates.includes(d) && !pastDates.includes(d));

  const out = new Map<string, DayWeather>();
  let timezone: string | null = null;
  const take = (daily: Daily | undefined, source: DayWeather['source'], mapBack?: (d: string) => string) => {
    if (!daily) return;
    daily.time.forEach((t, i) => {
      const date = mapBack ? mapBack(t) : t;
      if (!dates.includes(date) || daily.temperature_2m_max[i] == null) return;
      out.set(date, {
        date,
        code: daily.weather_code[i] ?? 0,
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
        rain: source === 'forecast' ? (daily.precipitation_probability_max?.[i] ?? null) : (daily.precipitation_sum?.[i] ?? null),
        source,
      });
    });
  };

  const jobs: Promise<void>[] = [];
  if (forecastDates.length) {
    jobs.push(
      fetchDaily('https://api.open-meteo.com/v1/forecast', lat, lng, forecastDates[0], forecastDates[forecastDates.length - 1], DAILY_FORECAST).then((r) => {
        timezone = r.timezone ?? timezone;
        take(r.daily, 'forecast');
      })
    );
  }
  if (pastDates.length) {
    jobs.push(
      fetchDaily('https://archive-api.open-meteo.com/v1/archive', lat, lng, pastDates[0], pastDates[pastDates.length - 1], DAILY_ARCHIVE).then((r) => {
        timezone = r.timezone ?? timezone;
        take(r.daily, 'recorded');
      })
    );
  }
  if (futureDates.length) {
    // Last year's same dates, mapped forward onto the trip's.
    const back = futureDates.map(lastYear);
    const forward = new Map(back.map((b, i) => [b, futureDates[i]]));
    jobs.push(
      fetchDaily('https://archive-api.open-meteo.com/v1/archive', lat, lng, back[0], back[back.length - 1], DAILY_ARCHIVE).then((r) => {
        timezone = r.timezone ?? timezone;
        take(r.daily, 'last-year', (d) => forward.get(d) ?? '');
      })
    );
  }

  const settled = await Promise.allSettled(jobs);
  if (settled.every((s) => s.status === 'rejected')) {
    console.error('weather:', (settled[0] as PromiseRejectedResult).reason);
    return NextResponse.json({ error: 'Weather unavailable' }, { status: 502 });
  }
  const value: TripWeather = { timezone, days: dates.map((d) => out.get(d)).filter((d): d is DayWeather => !!d) };
  if (settled.every((s) => s.status === 'fulfilled')) {
    if (cache.size > 2000) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), value });
  }
  return NextResponse.json(value, { headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=10800' } });
}
