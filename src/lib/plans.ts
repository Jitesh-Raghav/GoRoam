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
