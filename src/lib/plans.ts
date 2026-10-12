/**
 * The Week and Year Passes. The landing page, the dashboard and the FAQ all read
 * from here, so prices never drift apart. Credits remain only for the free first
 * trip and for packs bought before passes existed.
 */
export type PlanId = "week" | "year";

export interface Plan {
  id: PlanId;
  name: string;
  /** How long the pass lasts once bought. */
  days: number;
  /** One-time price in USD (no auto-renew). */
  price: number;
  /** "week" / "year", for "$3.99 / week". */
  period: string;
  tagline: string;
  features: string[];
  /** Fair use: trips a pass covers over its whole length (stops abuse, never a real traveller). */
  fairUse: number;
  popular?: boolean;
}

/** Trips any pass may start in one day. */
export const FAIR_USE_PER_DAY = 10;

/**
 * Credits every new account starts with (matches the `User.credits` default in Prisma).
 * One full trip shows what GoRoam does; the next one is what people pay for.
 */
export const FREE_CREDITS = 1;

/** "1 free itinerary" / "3 free itineraries". */
export const freeTrips = (n = FREE_CREDITS) => `${n === 1 ? "1 free itinerary" : `${n} free itineraries`}`;

const EVERYTHING = [
  "Unlimited AI-planned trips (fair use)",
  "Getting there: flights, trains & buses compared",
  "Stays matched to your style, with a map",
  "Scooter, bike & car rentals with day rates",
  "Local guide: phrases with audio, food, culture & events",
  "AI concierge, swaps, rain plans & optimised routes",
  "Live weather, money converter & offline maps",
  "Each day's plan on WhatsApp for your whole group",
  "Budget breakdown, trip wallet & bookings vault",
  "PDF booklet, email, calendar & shareable links",
];

export const PLANS: Plan[] = [
  {
    id: "week",
    name: "Week Pass",
    days: 7,
    price: 3.99,
    period: "week",
    tagline: "Plan this trip, and the one after it",
    features: EVERYTHING,
    fairUse: 10,
  },
  {
    id: "year",
    name: "Year Pass",
    days: 365,
    price: 19.99,
    period: "year",
    tagline: "Every trip you take this year",
    features: ["Everything in the Week Pass, for 365 days", ...EVERYTHING.slice(1), "Priority support"],
    fairUse: 40,
    popular: true,
  },
];

/** Questions the AI concierge answers per trip (keeps each itinerary's cost bounded). */
export const CHAT_LIMIT = 30;

export const usd = (n: number) => `$${n.toFixed(2)}`;
/** "$0.05 a day". */
export const perDay = (p: Plan) => usd(p.price / p.days);
/** The cheapest pass, for "from $3.99". */
export const cheapestPlan = () => PLANS.reduce((a, p) => (p.price < a.price ? p : a), PLANS[0]);

/** Whether a pass is running now. */
export const passActive = (u: { passUntil?: Date | string | null }) => !!u.passUntil && new Date(u.passUntil).getTime() > Date.now();

/** Currencies a pack has its own fixed price in, besides USD. */
export type PackCurrency = "INR" | "EUR" | "GBP";

/**
 * Fixed local prices, set as round local numbers rather than converted at
 * today's rate. They're only shown (and charged) once the same amounts are
 * in Dodo's localized pricing (scripts/dodo-local-prices.ts) and
 * NEXT_PUBLIC_LOCAL_PRICES=1 is set. Until then visitors see a converted
 * "≈" figure next to the USD price they'll actually pay.
 */
export const PRICES: Record<PlanId, Record<PackCurrency, number>> = {
  week: { INR: 149, EUR: 3.49, GBP: 2.99 },
  year: { INR: 699, EUR: 17.99, GBP: 15.99 },
};

export const LOCAL_PRICES = process.env.NEXT_PUBLIC_LOCAL_PRICES === "1";

/** The fixed price of a pack in a currency we charge in, or null when that currency is billed in USD. */
export function fixedPrice(plan: PlanId, currency: string): number | null {
  if (currency === "USD") return PLANS.find((p) => p.id === plan)!.price;
  if (!LOCAL_PRICES) return null;
  return PRICES[plan][currency as PackCurrency] ?? null;
}
