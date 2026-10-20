import type { TripDay } from "@/lib/trip-days";
import type { TripExtra } from "@/lib/trip-ideas-extra";
import type { TripIdea } from "@/lib/trip-ideas";
import { WORLD_1 } from "@/lib/trip-world-1";
import { WORLD_2 } from "@/lib/trip-world-2";
import { WORLD_3 } from "@/lib/trip-world-3";
import { WORLD_4 } from "@/lib/trip-world-4";
import { WORLD_5 } from "@/lib/trip-world-5";
import { WORLD_6 } from "@/lib/trip-world-6";
import { WORLD_7 } from "@/lib/trip-world-7";
import { WORLD_8 } from "@/lib/trip-world-8";
import { WORLD_9 } from "@/lib/trip-world-9";
import { WORLD_10 } from "@/lib/trip-world-10";
import { WORLD_11 } from "@/lib/trip-world-11";
import { WORLD_12 } from "@/lib/trip-world-12";
import { WORLD_13 } from "@/lib/trip-world-13";
import { WORLD_14 } from "@/lib/trip-world-14";
import { WORLD_15 } from "@/lib/trip-world-15";
import { WORLD_16 } from "@/lib/trip-world-16";
import { WORLD_17 } from "@/lib/trip-world-17";
import { WORLD_18 } from "@/lib/trip-world-18";
import { WORLD_19 } from "@/lib/trip-world-19";
import { WORLD_20 } from "@/lib/trip-world-20";
import { WORLD_DAYS_1 } from "@/lib/trip-world-days-1";
import { WORLD_DAYS_2 } from "@/lib/trip-world-days-2";
import { WORLD_DAYS_3 } from "@/lib/trip-world-days-3";
import { WORLD_DAYS_4 } from "@/lib/trip-world-days-4";
import { WORLD_DAYS_5 } from "@/lib/trip-world-days-5";
import { WORLD_DAYS_6 } from "@/lib/trip-world-days-6";
import { WORLD_DAYS_7 } from "@/lib/trip-world-days-7";
import { WORLD_DAYS_8 } from "@/lib/trip-world-days-8";
import { WORLD_DAYS_9 } from "@/lib/trip-world-days-9";
import { WORLD_DAYS_10 } from "@/lib/trip-world-days-10";
import { WORLD_DAYS_11 } from "@/lib/trip-world-days-11";
import { WORLD_DAYS_12 } from "@/lib/trip-world-days-12";
import { WORLD_DAYS_13 } from "@/lib/trip-world-days-13";
import { WORLD_DAYS_14 } from "@/lib/trip-world-days-14";
import type { WorldTrip } from "@/lib/trip-world-util";

/**
 * Trips around the world for travellers from Europe, the US and Australia,
 * priced in USD. Each one carries its overview, food and day plans with it;
 * the one-line plan is the day titles.
 */
// The fuller day plans, written separately, take the place of each trip's short ones.
const DETAILED: Record<string, TripDay[]> = { ...WORLD_DAYS_1, ...WORLD_DAYS_2, ...WORLD_DAYS_3, ...WORLD_DAYS_4, ...WORLD_DAYS_5, ...WORLD_DAYS_6, ...WORLD_DAYS_7, ...WORLD_DAYS_8, ...WORLD_DAYS_9, ...WORLD_DAYS_10, ...WORLD_DAYS_11, ...WORLD_DAYS_12, ...WORLD_DAYS_13, ...WORLD_DAYS_14 };

export const WORLD: WorldTrip[] = [...WORLD_1, ...WORLD_2, ...WORLD_3, ...WORLD_4, ...WORLD_5, ...WORLD_6, ...WORLD_7, ...WORLD_8, ...WORLD_9, ...WORLD_10, ...WORLD_11, ...WORLD_12, ...WORLD_13, ...WORLD_14, ...WORLD_15, ...WORLD_16, ...WORLD_17, ...WORLD_18, ...WORLD_19, ...WORLD_20].map((t) => ({ ...t, dayPlan: DETAILED[t.slug] ?? t.dayPlan }));

export const WORLD_IDEAS: TripIdea[] = WORLD.map(({ extra: _extra, dayPlan, ...t }) => ({ ...t, currency: "USD", plan: dayPlan.map((d) => d[0]) }));
export const WORLD_EXTRA: Record<string, TripExtra> = Object.fromEntries(WORLD.map((t) => [t.slug, t.extra]));
export const WORLD_DAYS: Record<string, TripDay[]> = Object.fromEntries(WORLD.map((t) => [t.slug, t.dayPlan]));
