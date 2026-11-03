import type { Vibe } from "@/lib/trip-deep";
import { TRIP_IDEAS, type TripIdea } from "@/lib/trip-ideas";

/**
 * "Is it for you?": six quick scores out of 5, guessed from a trip's tags,
 * landscape and price, unless the trip's deep guide sets them by hand.
 */
export const VIBES: { id: Vibe; label: string; who: string }[] = [
  { id: "romance", label: "Romance", who: "couples" },
  { id: "beaches", label: "Beaches", who: "beach lovers" },
  { id: "adventure", label: "Adventure", who: "adventurers" },
  { id: "culture", label: "Culture", who: "culture lovers" },
  { id: "food", label: "Food", who: "food lovers" },
  { id: "value", label: "Value for money", who: "travellers on a budget" },
];

// Countries whose food is a reason to go in itself.
const FOODIE = new Set(["India", "Italy", "Spain", "France", "Portugal", "Greece", "Turkey", "Japan", "South Korea", "China", "Thailand", "Vietnam", "Malaysia", "Singapore", "Mexico", "Peru", "Morocco", "Georgia"]);

const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

export function vibesFor(t: TripIdea, override?: Partial<Record<Vibe, number>>): Record<Vibe, number> {
  const has = (x: TripIdea["tags"][number]) => t.tags.includes(x);
  // Value: where the mid-range day cost sits among trips priced in the same currency.
  const peers = TRIP_IDEAS.filter((o) => (o.currency ?? "INR") === (t.currency ?? "INR"))
    .map((o) => o.budget[1])
    .sort((a, b) => a - b);
  const rank = peers.findIndex((v) => v >= t.budget[1]) / Math.max(peers.length - 1, 1);
  return {
    romance: has("honeymoon") ? 5 : has("beach") || has("hills") ? 4 : has("heritage") ? 3 : 2,
    beaches: has("beach") ? 5 : t.landscape === "coast" ? 4 : t.landscape === "lakes" || t.landscape === "river" ? 2 : 1,
    adventure: has("adventure") ? 5 : has("snow") || has("wildlife") || has("desert") ? 4 : has("hills") ? 3 : 2,
    culture: has("heritage") ? 5 : has("festival") ? 4 : t.country === "India" ? 3 : 2,
    food: FOODIE.has(t.country) ? 4 : 3,
    value: clamp(5 - rank * 4),
    ...override,
  };
}

/** "Made for couples and beach lovers": the two strongest scores, in a line. */
export function vibeVerdict(v: Record<Vibe, number>) {
  const [a, b] = [...VIBES].sort((x, y) => v[y.id] - v[x.id]);
  return `Made for ${a.who} and ${b.who}`;
}
