import type { TripDay } from "@/lib/trip-days";
import type { TripExtra } from "@/lib/trip-ideas-extra";
import type { TripIdea } from "@/lib/trip-ideas";
import { WORLD_1 } from "@/lib/trip-world-1";
import { WORLD_2 } from "@/lib/trip-world-2";
import { WORLD_3 } from "@/lib/trip-world-3";
import { WORLD_4 } from "@/lib/trip-world-4";
import { WORLD_5 } from "@/lib/trip-world-5";
import { WORLD_DAYS_1 } from "@/lib/trip-world-days-1";
import { WORLD_DAYS_2 } from "@/lib/trip-world-days-2";
import { WORLD_DAYS_3 } from "@/lib/trip-world-days-3";
import { WORLD_DAYS_4 } from "@/lib/trip-world-days-4";
import { WORLD_DAYS_5 } from "@/lib/trip-world-days-5";
import { WORLD_DAYS_6 } from "@/lib/trip-world-days-6";
import { WORLD_DAYS_7 } from "@/lib/trip-world-days-7";
import type { WorldTrip } from "@/lib/trip-world-util";

/**
 * Trips around the world for travellers from Europe, the US and Australia,
 * priced in USD. Each one carries its overview, food and day plans with it;
 * the one-line plan is the day titles.
 */
// The fuller day plans, written separately, take the place of each trip's short ones.
const DETAILED: Record<string, TripDay[]> = { ...WORLD_DAYS_1, ...WORLD_DAYS_2, ...WORLD_DAYS_3, ...WORLD_DAYS_4, ...WORLD_DAYS_5, ...WORLD_DAYS_6, ...WORLD_DAYS_7 };

export const WORLD: WorldTrip[] = [...WORLD_1, ...WORLD_2, ...WORLD_3, ...WORLD_4, ...WORLD_5].map((t) => ({ ...t, dayPlan: DETAILED[t.slug] ?? t.dayPlan }));

export const WORLD_IDEAS: TripIdea[] = WORLD.map(({ extra: _extra, dayPlan, ...t }) => ({ ...t, currency: "USD", plan: dayPlan.map((d) => d[0]) }));
export const WORLD_EXTRA: Record<string, TripExtra> = Object.fromEntries(WORLD.map((t) => [t.slug, t.extra]));
export const WORLD_DAYS: Record<string, TripDay[]> = Object.fromEntries(WORLD.map((t) => [t.slug, t.dayPlan]));
