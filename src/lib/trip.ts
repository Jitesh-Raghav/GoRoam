/**
 * The trip model shared by the planner form, the generation API and the
 * itinerary views. Everything the AI returns beyond the original day plan is
 * optional, so itineraries saved before these fields existed still render.
 */

/* -------------------------------------------------------------------------- */
/*                               Planner options                              */
/* -------------------------------------------------------------------------- */

export interface Option<T extends string = string> {
  id: T;
  label: string;
  hint: string;
  /** How the option is described to the AI. */
  prompt: string;
}

export type Companions = "solo" | "couple" | "family" | "friends";
export type Pace = "relaxed" | "balanced" | "packed";
export type Spend = "savvy" | "comfort" | "luxury";
export type Stay = "hostel" | "hotel" | "boutique" | "resort" | "apartment";
export type Transport = "transit" | "rides" | "car";
export type Occasion = "none" | "honeymoon" | "anniversary" | "birthday" | "first" | "workation";

export const COMPANIONS: Option<Companions>[] = [
  { id: "solo", label: "Solo", hint: "Just me", prompt: "a solo traveller" },
  { id: "couple", label: "Couple", hint: "The two of us", prompt: "a couple" },
  { id: "family", label: "Family", hint: "With the kids", prompt: "a family" },
  { id: "friends", label: "Friends", hint: "The whole crew", prompt: "a group of friends" },
];

export const PACES: Option<Pace>[] = [
  { id: "relaxed", label: "Slow", hint: "Long lunches, lie-ins, room to wander", prompt: "relaxed — few transfers, unhurried stops and downtime" },
  { id: "balanced", label: "Balanced", hint: "A good mix of seeing and being", prompt: "balanced — a full but comfortable day" },
  { id: "packed", label: "Full throttle", hint: "Up early, see it all", prompt: "packed — early starts and as much as possible" },
];

export const SPEND: Option<Spend>[] = [
  { id: "savvy", label: "Savvy", hint: "Street food, free sights, great value", prompt: "budget-savvy: good value, free sights, casual local food" },
  { id: "comfort", label: "Comfort", hint: "Nice meals, the odd splurge", prompt: "mid-range comfort with the occasional treat" },
  { id: "luxury", label: "Luxury", hint: "Tasting menus, private tours", prompt: "luxury: top restaurants, private or skip-the-line experiences" },
];

export const STAYS: Option<Stay>[] = [
  { id: "hotel", label: "Hotel", hint: "Reliable & central", prompt: "a well-located hotel" },
  { id: "boutique", label: "Boutique", hint: "Small, stylish, local", prompt: "a boutique or design hotel" },
  { id: "apartment", label: "Apartment", hint: "Space & a kitchen", prompt: "a rental apartment" },
  { id: "resort", label: "Resort", hint: "Pools & pampering", prompt: "a resort" },
  { id: "hostel", label: "Hostel", hint: "Social & cheap", prompt: "a hostel or guesthouse" },
];

export const VIBES: Option[] = [
  { id: "landmarks", label: "Iconic sights", hint: "The must-sees, done smart", prompt: "iconic landmarks, timed to beat the crowds" },
  { id: "hidden", label: "Hidden gems", hint: "Where locals actually go", prompt: "hidden gems and local favourites" },
  { id: "food", label: "Food & drink", hint: "Markets, street food, tables", prompt: "food: markets, street food and memorable restaurants" },
  { id: "art", label: "Art & design", hint: "Museums, galleries, buildings", prompt: "art, museums and architecture" },
  { id: "history", label: "History", hint: "Old towns, ruins, stories", prompt: "history and heritage" },
  { id: "outdoors", label: "Outdoors", hint: "Hikes, parks, viewpoints", prompt: "the outdoors: hikes, parks and viewpoints" },
  { id: "beach", label: "Beaches", hint: "Sand, swims, sunsets", prompt: "beaches and time by the water" },
  { id: "nightlife", label: "Nightlife", hint: "Bars, music, late nights", prompt: "nightlife: bars, live music and late nights" },
  { id: "shopping", label: "Shopping", hint: "Boutiques & bazaars", prompt: "shopping: boutiques, markets and local design" },
  { id: "wellness", label: "Wellness", hint: "Spas, yoga, slow mornings", prompt: "wellness: spas, baths and slow mornings" },
  { id: "thrills", label: "Thrills", hint: "Adrenaline & activities", prompt: "adventure activities and thrills" },
  { id: "photo", label: "Photo spots", hint: "Golden-hour views", prompt: "photogenic spots at the best light" },
];

export const DIETS: Option[] = [
  { id: "vegetarian", label: "Vegetarian", hint: "", prompt: "vegetarian" },
  { id: "vegan", label: "Vegan", hint: "", prompt: "vegan" },
  { id: "halal", label: "Halal", hint: "", prompt: "halal" },
  { id: "kosher", label: "Kosher", hint: "", prompt: "kosher" },
  { id: "gluten-free", label: "Gluten-free", hint: "", prompt: "gluten-free" },
  { id: "no-alcohol", label: "No alcohol", hint: "", prompt: "alcohol-free venues" },
];

export const TRANSPORT: Option<Transport>[] = [
  { id: "transit", label: "Walk & transit", hint: "Metro, trams, feet", prompt: "walking and public transport" },
  { id: "rides", label: "Taxis & rides", hint: "Door to door", prompt: "taxis and ride-hailing" },
  { id: "car", label: "Rental car", hint: "Road-trip freedom", prompt: "a rental car" },
];

export const OCCASIONS: Option<Occasion>[] = [
  { id: "none", label: "Just because", hint: "", prompt: "" },
  { id: "honeymoon", label: "Honeymoon", hint: "", prompt: "a honeymoon — add romantic moments" },
  { id: "anniversary", label: "Anniversary", hint: "", prompt: "an anniversary — add one special celebration" },
  { id: "birthday", label: "Birthday", hint: "", prompt: "a birthday — plan one memorable celebration" },
  { id: "first", label: "First visit", hint: "", prompt: "a first visit — cover the essentials well" },
  { id: "workation", label: "Workation", hint: "", prompt: "a workation — keep mornings light and include work-friendly cafés" },
];

/* -------------------------------------------------------------------------- */
/*                               Stored trip data                             */
/* -------------------------------------------------------------------------- */

export interface TripPreferences {
  companions: Companions;
  adults: number;
  children: number;
  spend: Spend;
  stay: Stay;
  pace: Pace;
  diet: string[];
  transport: Transport;
  occasion: Occasion;
  notes: string;
}

export const DEFAULT_PREFERENCES: TripPreferences = {
  companions: "couple",
  adults: 2,
  children: 0,
  spend: "comfort",
  stay: "hotel",
  pace: "balanced",
  diet: [],
  transport: "transit",
  occasion: "none",
  notes: "",
};

const pick = <T extends string>(options: Option<T>[], value: unknown, fallback: T): T =>
  options.some((o) => o.id === value) ? (value as T) : fallback;

const int = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** Accepts anything and returns preferences that are safe to trust. */
export function normalizePreferences(input: unknown): TripPreferences {
  const p = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_PREFERENCES;
  const companions = pick(COMPANIONS, p.companions, d.companions);
  const soloOrCouple = companions === "solo" ? 1 : companions === "couple" ? 2 : null;
  return {
    companions,
    adults: soloOrCouple ?? int(p.adults, 1, 16, 2),
    children: soloOrCouple ? 0 : int(p.children, 0, 10, 0),
    spend: pick(SPEND, p.spend, d.spend),
    stay: pick(STAYS, p.stay, d.stay),
    pace: pick(PACES, p.pace, d.pace),
    diet: Array.isArray(p.diet) ? p.diet.filter((x): x is string => DIETS.some((o) => o.id === x)) : [],
    transport: pick(TRANSPORT, p.transport, d.transport),
    occasion: pick(OCCASIONS, p.occasion, d.occasion),
    notes: typeof p.notes === "string" ? p.notes.replace(/\s+/g, " ").trim().slice(0, 400) : "",
  };
}

export interface PlaceDetails {
  name: string;
  description: string;
  googleMapsLink?: string;
  area?: string;
  lat?: number;
  lng?: number;
}

export interface ActivitySlot {
  time: string;
  place: PlaceDetails;
  duration: string;
  estimatedCost: number;
  category?: string;
  tip?: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  summary?: string;
  morning: ActivitySlot;
  afternoon: ActivitySlot;
  evening: ActivitySlot;
  totalDayCost: number;
  /** One practical trick for the day (a transit pass, a queue hack). */
  dayTip?: string;
}

export interface StaySuggestion {
  name: string;
  area: string;
  type?: string;
  why: string;
  pricePerNight?: number;
}

export interface Essentials {
  currency?: string;
  language?: string;
  plugs?: string;
  tipping?: string;
  weather?: string;
  gettingAround?: string;
  phrase?: string;
}

export interface Phrase {
  english: string;
  local: string;
  romanized?: string;
  pronunciation?: string;
}

export interface Dish {
  name: string;
  localName?: string;
  what: string;
  whereToTry?: string;
  veg?: boolean;
}

export interface Souvenir {
  name: string;
  why: string;
  where?: string;
  priceRange?: string;
}

export interface TripEvent {
  name: string;
  when: string;
  what: string;
  where?: string;
}

export type TipCategory = "money" | "transport" | "safety" | "timing" | "connectivity" | "etiquette";
export type ExperienceKind = "adventure" | "sport" | "tour" | "class" | "wellness";

export interface Experience {
  name: string;
  kind: ExperienceKind;
  duration?: string;
  priceFrom?: number;
  why: string;
}

export interface TripVideo {
  id: string;
  title: string;
  channel?: string;
  thumb: string;
}

export interface TripGuide {
  /** BCP-47 tag for reading the phrases aloud, e.g. "ja-JP". */
  languageCode?: string;
  language?: string;
  phrases: Phrase[];
  etiquette: { dos: string[]; donts: string[] };
  food: Dish[];
  souvenirs: Souvenir[];
  facts: { title: string; fact: string }[];
  events: TripEvent[];
  tips: { category: TipCategory; tip: string }[];
  experiences: Experience[];
  videoQueries: string[];
  /** Filled by the server from YouTube, never by the model. */
  videos?: TripVideo[];
}

export interface ItineraryData {
  itinerary: DayItinerary[];
  summary: {
    totalCost: number;
    totalDays: number;
    destination: string;
    highlights: string[];
    overview?: string;
    /** What the place looks like (coast, hills, city…), for picking its poster. */
    landscape?: string;
    /** ISO 3166-1 alpha-2 code of the destination's country, lower case. */
    countryCode?: string;
  };
  stays?: StaySuggestion[];
  essentials?: Essentials;
  packing?: string[];
  /** The local guide: phrases, food, culture, events and more (added later, so optional). */
  guide?: TripGuide;
  /** What the traveller asked for (added when the planner got richer fields). */
  trip?: { source?: string; preferences?: TripPreferences };
}

export interface ItineraryDetails {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  itineraryData: ItineraryData;
  createdAt: string;
  /** Concierge questions already asked (owner views only). */
  chatCount?: number;
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const UPPER = new Set(["usa", "uk", "uae", "us", "nyc", "dc", "la"]);
const LOWER = new Set(["of", "de", "la", "del", "da", "do", "and", "the", "en", "sur", "am"]);

/** "new york, usa" → "New York, USA". Leaves text the user already capitalised alone. */
export function titleCase(text: string) {
  const t = text.trim();
  if (!t || /[A-Z]/.test(t)) return t;
  return t
    .split(/(\s+|,|-)/)
    .map((w, i) => {
      if (UPPER.has(w)) return w.toUpperCase();
      if (i > 0 && LOWER.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}

export const labelFor = (options: Option[], id: string) =>
  options.find((o) => o.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1);

export const money = (n: number | undefined) => `$${Math.round(n ?? 0).toLocaleString("en-US")}`;
