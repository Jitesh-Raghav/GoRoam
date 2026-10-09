// Server-only helpers for signed-out first trips (see the GuestTrip model).
import { createHash } from 'crypto';
import type { GuestTrip } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { undash } from './text';
import type { ItineraryData, ItineraryDetails } from './trip';

export const GUEST_COOKIE = 'goroam_guest';
export const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Guest trips allowed per IP per day (some IPs are shared: offices, campuses, mobile carriers). */
export const GUEST_PER_IP = 3;
export const guestDailyLimit = () => Number(process.env.GUEST_DAILY_LIMIT) || 300;

export function clientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/** Never store raw IPs: a salted hash is enough to rate-limit. */
export const hashIp = (ip: string) => createHash('sha256').update(`${process.env.NEXTAUTH_SECRET ?? ''}:${ip}`).digest('hex').slice(0, 32);

export function guestData(trip: GuestTrip): ItineraryData {
  return undash(JSON.parse(trip.itineraryData)) as ItineraryData;
}

/**
 * The preview a signed-out visitor sees: Day 1 in full, and for later days only
 * their theme and cost. Locked stops never leave the server.
 */
export function guestPreview(trip: GuestTrip) {
  const data = guestData(trip);
  const days = data.itinerary ?? [];
  const locked = days.slice(1).map((d) => ({ day: d.day, theme: d.theme, totalDayCost: d.totalDayCost }));
  const details: ItineraryDetails = {
    id: `guest-${trip.id}`,
    destination: trip.destination,
    startDate: trip.startDate.toISOString(),
    endDate: new Date(trip.startDate.getTime() + (trip.numberOfDays - 1) * 86400000).toISOString(),
    numberOfDays: trip.numberOfDays,
    budget: trip.budget,
    numberOfPeople: trip.numberOfPeople,
    tripType: trip.tripType,
    interests: JSON.parse(trip.interests),
    itineraryData: { ...data, itinerary: days.slice(0, 1), guide: undefined, packing: undefined, wallet: undefined, bookings: undefined, reactions: undefined },
    createdAt: trip.createdAt.toISOString(),
  };
  return { details, locked };
}
