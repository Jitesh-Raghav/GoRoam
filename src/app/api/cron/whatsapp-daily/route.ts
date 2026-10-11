import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isoDay } from '@/lib/booking';
import { dayMessage } from '@/lib/day-message';
import { shareToken } from '@/lib/share';
import { dayActivities, type ItineraryData } from '@/lib/trip';
import { sendDayPlan, whatsappConfigured } from '@/lib/whatsapp';

/**
 * The WhatsApp morning message, run by Vercel Cron (vercel.json).
 * For every trip happening today (in its own time zone) with verified
 * numbers, it sends that day's plan once per number per day.
 *
 * Vercel's Hobby plan runs cron jobs once a day, so by default each run
 * sends today's plan to every trip that hasn't had it yet. On Pro, run it
 * hourly and set WHATSAPP_CRON_HOURLY=1 to send at each trip's chosen hour.
 * Protected by CRON_SECRET (Vercel sends it as a bearer token).
 */
export const maxDuration = 60;

function localNow(tz: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const v = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { date: `${v('year')}-${v('month')}-${v('day')}`, hour: Number(v('hour')) };
}

const WMO = (c: number) => (c === 0 ? 'Clear' : c <= 2 ? 'Partly cloudy' : c === 3 ? 'Overcast' : c <= 48 ? 'Fog' : c <= 57 ? 'Drizzle' : c <= 67 || (c >= 80 && c <= 82) ? 'Rain' : c <= 77 || c === 85 || c === 86 ? 'Snow' : 'Thunderstorms');

/** "Rain likely (70%), 18°/9°C" for the day's stops, from Open-Meteo. */
async function weatherLine(data: ItineraryData, index: number, date: string) {
  const pts = dayActivities(data.itinerary[index]).map((a) => [a.place.lat, a.place.lng]).filter((p): p is [number, number] => Number.isFinite(p[0]) && Number.isFinite(p[1]) && (p[0] !== 0 || p[1] !== 0));
  if (!pts.length) return undefined;
  const [lat, lng] = pts[Math.floor(pts.length / 2)];
  try {
    const q = new URLSearchParams({ latitude: lat.toFixed(3), longitude: lng.toFixed(3), daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max', timezone: 'auto', start_date: date, end_date: date });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`, { signal: AbortSignal.timeout(6000) });
    const d = (await res.json())?.daily;
    if (!d?.time?.length) return undefined;
    const rain = d.precipitation_probability_max?.[0];
    return `${WMO(d.weather_code[0])}${rain >= 40 ? ` (${rain}% chance of rain)` : ''}, ${Math.round(d.temperature_2m_max[0])}°/${Math.round(d.temperature_2m_min[0])}°C${rain >= 60 ? '. Open the trip for a one-tap rain plan.' : ''}`;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!whatsappConfigured()) return NextResponse.json({ skipped: 'WhatsApp not configured' });
  const hourly = process.env.WHATSAPP_CRON_HOURLY === '1';
  const origin = (process.env.NEXTAUTH_URL || request.nextUrl.origin).replace(/\/$/, '');
  const now = Date.now();

  const trips = await prisma.itinerary.findMany({
    where: { startDate: { lte: new Date(now + 2 * 864e5) }, endDate: { gte: new Date(now - 2 * 864e5) }, whatsappSubs: { some: { verified: true, stoppedAt: null } } },
    include: { whatsappSubs: { where: { verified: true, stoppedAt: null } } },
  });

  let sent = 0;
  let failed = 0;
  for (const it of trips) {
    const { date, hour } = localNow(it.timezone || 'UTC');
    const index = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${isoDay(it.startDate.toISOString(), 0)}T00:00:00Z`)) / 864e5);
    if (index < 0 || index >= it.numberOfDays) continue;
    if (hourly && hour < it.whatsappHour) continue;
    const due = it.whatsappSubs.filter((s) => s.lastSentDay !== date);
    if (!due.length) continue;
    const data = JSON.parse(it.itineraryData) as ItineraryData;
    if (!data.itinerary?.[index]) continue;
    const message = dayMessage(data, {
      index,
      destination: it.destination,
      startDate: it.startDate.toISOString(),
      link: `${origin}/trip/${it.id}?t=${shareToken(it.id)}`,
      weather: await weatherLine(data, index, date),
    });
    for (const sub of due) {
      try {
        await sendDayPlan(sub.phone, message);
        await prisma.whatsAppSub.update({ where: { id: sub.id }, data: { lastSentDay: date } });
        sent++;
      } catch (error) {
        failed++;
        console.error('whatsapp daily:', it.id, error instanceof Error ? error.message : error);
      }
    }
  }
  return NextResponse.json({ trips: trips.length, sent, failed });
}
