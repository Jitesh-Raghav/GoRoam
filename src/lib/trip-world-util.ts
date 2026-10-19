import type { TripDay } from "@/lib/trip-days";
import type { TripExtra } from "@/lib/trip-ideas-extra";
import type { TripIdea, TripStay } from "@/lib/trip-ideas";

/** A trip abroad with its overview, food and day plans; the one-line plan is the day titles. */
export type WorldTrip = Omit<TripIdea, "plan" | "currency"> & { extra: TripExtra; dayPlan: TripDay[] };

export const st = (tier: TripStay["tier"], name: string, area: string, from: number, note: string): TripStay => ({ tier, name, area, from, note });
