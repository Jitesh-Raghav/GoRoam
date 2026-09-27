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

/** Credits every new account starts with (matches the `User.credits` default in Prisma). */
export const FREE_CREDITS = 3;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 9.99,
    tagline: "For the next getaway or two",
    features: ["10 AI-planned itineraries", "Flight, stay & activity booking links", "PDF export & calendar sync", "Email support"],
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

export const usd = (n: number) => `$${n.toFixed(2)}`;
export const perTrip = (p: Plan) => usd(p.price / p.credits);
