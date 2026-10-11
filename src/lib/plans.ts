/**
 * Credit packs. The landing page, the dashboard and the FAQ all read from here,
 * so credits and prices can never drift apart again.
 */
export type PlanId = "starter" | "explorer" | "adventurer";

export interface Plan {
  id: PlanId;
  name: string;
  credits: number;
  /** One-time price in USD. */
  price: number;
  tagline: string;
  features: string[];
  popular?: boolean;
}

/**
 * Credits every new account starts with (matches the `User.credits` default in Prisma).
 * One full trip shows what GoRoam does; the next one is what people pay for.
 */
export const FREE_CREDITS = 1;

/** "1 free itinerary" / "3 free itineraries". */
export const freeTrips = (n = FREE_CREDITS) => `${n === 1 ? "1 free itinerary" : `${n} free itineraries`}`;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 9.99,
    tagline: "For the next getaway or two",
    features: [
      "10 AI-planned itineraries",
      "Local guide: phrases with audio, food, culture & events",
      "AI concierge for every trip",
      "Live weather, money converter & offline maps",
      "Edit any day freely, rain plans & optimised routes",
      "Swap any stop with AI, split costs in a trip wallet",
      "Bookings vault, jet-lag plan, and trips that work offline",
      "Flight, stay & adventure booking links",
      "PDF, email & calendar export",
    ],
  },
  {
    id: "explorer",
    name: "Explorer",
    credits: 30,
    price: 24.99,
    tagline: "For people who are always planning the next one",
    features: [
      "30 AI-planned itineraries",
      "Everything in Starter",
      "Each day's plan on WhatsApp every morning, for your whole group",
      "Adventure & sports packages for every trip",
      "Friends vote on your plan from a shared link",
      "Shareable trip links",
      "Packing lists & pre-trip checklists",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "adventurer",
    name: "Adventurer",
    credits: 90,
    price: 69.99,
    tagline: "For globetrotters, groups and travel pros",
    features: [
      "90 AI-planned itineraries",
      "Everything in Explorer",
      "Best price per itinerary",
      "Plan for friends, family & clients",
      "24/7 priority support",
    ],
  },
];

/** Questions the AI concierge answers per trip (keeps each itinerary's cost bounded). */
export const CHAT_LIMIT = 30;

export const usd = (n: number) => `$${n.toFixed(2)}`;
export const perTrip = (p: Plan) => usd(p.price / p.credits);

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
  starter: { INR: 799, EUR: 9.49, GBP: 7.99 },
  explorer: { INR: 1999, EUR: 23.99, GBP: 19.99 },
  adventurer: { INR: 5499, EUR: 64.99, GBP: 54.99 },
};

export const LOCAL_PRICES = process.env.NEXT_PUBLIC_LOCAL_PRICES === "1";

/** The fixed price of a pack in a currency we charge in, or null when that currency is billed in USD. */
export function fixedPrice(plan: PlanId, currency: string): number | null {
  if (currency === "USD") return PLANS.find((p) => p.id === plan)!.price;
  if (!LOCAL_PRICES) return null;
  return PRICES[plan][currency as PackCurrency] ?? null;
}
