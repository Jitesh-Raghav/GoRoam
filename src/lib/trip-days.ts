import { DAYS_ABROAD } from "@/lib/trip-days-abroad";
import { DAYS_INDIA_1 } from "@/lib/trip-days-india-1";
import { DAYS_INDIA_2 } from "@/lib/trip-days-india-2";
import { WORLD_DAYS } from "@/lib/trip-world";

/** One day of a /trips plan: [title, morning, afternoon, evening, tip?]. */
export type TripDay = [title: string, morning: string, afternoon: string, evening: string, tip?: string];

const ALL: Record<string, TripDay[]> = { ...DAYS_INDIA_1, ...DAYS_INDIA_2, ...DAYS_ABROAD, ...WORLD_DAYS };

export const daysFor = (slug: string): TripDay[] | undefined => ALL[slug];
