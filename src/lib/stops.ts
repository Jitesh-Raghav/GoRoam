// Server-side helpers for stops the client or a model sends back.
import { checkStop } from '@/lib/itinerary-ai';
import { undash } from '@/lib/text';
import type { ActivitySlot, ItineraryData } from '@/lib/trip';

export const CATEGORIES = ['sight', 'food', 'nature', 'culture', 'nightlife', 'shopping', 'wellness', 'activity'];

export const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const coord = (v: unknown, lim: number) => {
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n) <= lim && n !== 0 ? Math.round(n * 10000) / 10000 : undefined;
};

/** Anything a client or a model sends back, reduced to a safe stop (ids and "mine" kept). */
export function cleanStop(raw: unknown, fallbackTime: string, people: number): ActivitySlot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = undash(raw) as Record<string, unknown>;
  const place = (r.place && typeof r.place === 'object' ? r.place : {}) as Record<string, unknown>;
  const name = str(place.name, 140);
  if (!name) return null;
  const cost = Math.round(Number(r.estimatedCost));
  const id = str(r.id, 40);
  const stop = checkStop(
    {
      time: str(r.time, 40) || fallbackTime,
      duration: str(r.duration, 40) || '2 hours',
      estimatedCost: Number.isFinite(cost) && cost >= 0 && cost < 100000 ? cost : 0,
      category: CATEGORIES.includes(String(r.category)) ? String(r.category) : undefined,
      tip: str(r.tip, 240) || undefined,
      place: { name, description: str(place.description, 400), area: str(place.area, 80) || undefined, lat: coord(place.lat, 90), lng: coord(place.lng, 180) },
      priceNote: str(r.priceNote, 80) || undefined,
      hours: str(r.hours, 90) || undefined,
      bookAhead: str(r.bookAhead, 90) || undefined,
      bestTime: str(r.bestTime, 90) || undefined,
      wear: str(r.wear, 90) || undefined,
      access: str(r.access, 90) || undefined,
    },
    people
  );
  if (id && /^[\w-]+$/.test(id)) stop.id = id;
  if (r.mine === true) stop.mine = true;
  return stop;
}

/** How many are travelling, for the per-person price check. */
export const partyOf = (data: ItineraryData) => {
  const p = data.trip?.preferences;
  return p ? Math.max(1, (Number(p.adults) || 0) + (Number(p.children) || 0)) : 2;
};
