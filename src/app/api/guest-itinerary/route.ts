import { randomUUID } from 'crypto';
import { NextRequest, NextResponse, after } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateItineraryData } from '@/lib/generate';
import { GUEST_COOKIE, GUEST_PER_IP, GUEST_WINDOW_MS, clientIp, guestDailyLimit, hashIp } from '@/lib/guest';
import type { ItineraryRequest } from '@/lib/itinerary-ai';
import { prisma } from '@/lib/prisma';
import { normalizePreferences, titleCase, type Companions } from '@/lib/trip';

/**
 * A signed-out visitor's first trip, straight from the landing-page prompt.
 * One per device (and a few per IP) a day, with a global daily cap. Visitors who
 * already made one get it back instead of a new one.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    return NextResponse.json({ success: false, signedIn: true, error: 'You are signed in; use the planner.' }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const destination = String(body.destination ?? '').trim().slice(0, 120);
  if (destination.length < 2) return NextResponse.json({ success: false, error: 'Tell us where you want to go.' }, { status: 400 });

  const deviceId = request.cookies.get(GUEST_COOKIE)?.value || randomUUID();
  const ipHash = hashIp(clientIp(request));
  const since = new Date(Date.now() - GUEST_WINDOW_MS);

  const reply = (payload: Record<string, unknown>, status = 200) => {
    const res = NextResponse.json(payload, { status });
    res.cookies.set(GUEST_COOKIE, deviceId, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 365, path: '/' });
    return res;
  };

  // One free preview per device: hand back the one they already have.
  const existing = await prisma.guestTrip.findFirst({ where: { deviceId, createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, select: { id: true } });
  if (existing) return reply({ success: true, id: existing.id, existing: true });

  const [byIp, today] = await Promise.all([
    prisma.guestTrip.count({ where: { ipHash, createdAt: { gte: since } } }),
    prisma.guestTrip.count({ where: { createdAt: { gte: since } } }),
  ]);
  if (byIp >= GUEST_PER_IP || today >= guestDailyLimit()) {
    return reply({ success: false, limited: true, error: 'Sign in to plan this one. It takes ten seconds and your first trip is still free.' }, 429);
  }

  const days = Math.min(Math.max(Math.round(Number(body.days)) || 3, 1), 7);
  const companions: Companions = ['solo', 'couple', 'family', 'friends'].includes(body.companions) ? body.companions : 'couple';
  const prefs = normalizePreferences({ companions, adults: companions === 'solo' ? 1 : 2 });
  const people = prefs.adults + prefs.children;
  const start = typeof body.startDate === 'string' && !Number.isNaN(Date.parse(body.startDate)) && Date.parse(body.startDate) > Date.now() ? body.startDate.slice(0, 10) : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const budget = Math.max(Math.round(Number(body.budget)) || 0, 0) || Math.max(people * days * 120, 150);
  const data: ItineraryRequest = {
    source: '',
    destination,
    startDate: start,
    numberOfDays: days,
    budget,
    numberOfPeople: people,
    tripType: companions,
    interests: Array.isArray(body.interests) ? body.interests.filter((i: unknown) => typeof i === 'string').slice(0, 8) : [],
  };

  try {
    // The guide comes later, when the trip is claimed; skipping it keeps the wait short.
    const itineraryData = await generateItineraryData(data, prefs, { guide: false });
    const trip = await prisma.guestTrip.create({
      data: {
        destination: titleCase(destination),
        startDate: new Date(start),
        numberOfDays: days,
        budget,
        numberOfPeople: people,
        tripType: companions,
        interests: JSON.stringify(data.interests),
        itineraryData: JSON.stringify(itineraryData),
        ipHash,
        deviceId,
      },
      select: { id: true },
    });
    after(() => console.log(`guest trip ${trip.id}: ${days} days in ${destination}`));
    return reply({ success: true, id: trip.id });
  } catch (error) {
    console.error('Guest trip failed:', error instanceof Error ? error.message : error);
    return reply({ success: false, error: "We couldn't plan that just now. Try again, or sign in and use the planner." }, 500);
  }
}
