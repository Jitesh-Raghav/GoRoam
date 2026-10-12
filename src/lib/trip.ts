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
  { id: "relaxed", label: "Slow", hint: "Long lunches, lie-ins, room to wander", prompt: "relaxed: few transfers, unhurried stops and downtime" },
  { id: "balanced", label: "Balanced", hint: "A good mix of seeing and being", prompt: "balanced: a full but comfortable day" },
  { id: "packed", label: "Full throttle", hint: "Up early, see it all", prompt: "packed: early starts and as much as possible" },
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
  { id: "honeymoon", label: "Honeymoon", hint: "", prompt: "a honeymoon: add romantic moments" },
  { id: "anniversary", label: "Anniversary", hint: "", prompt: "an anniversary: add one special celebration" },
  { id: "birthday", label: "Birthday", hint: "", prompt: "a birthday: plan one memorable celebration" },
  { id: "first", label: "First visit", hint: "", prompt: "a first visit: cover the essentials well" },
  { id: "workation", label: "Workation", hint: "", prompt: "a workation: keep mornings light and include work-friendly cafés" },
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
  /** The currency the traveller typed their budget in ("INR"); the trip's `budget` is always USD. */
  budgetCurrency?: string;
  /** The budget exactly as typed, in `budgetCurrency`. */
  budgetLocal?: number;
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
    ...(typeof p.budgetCurrency === "string" && /^[A-Z]{3}$/.test(p.budgetCurrency) && Number(p.budgetLocal) > 0 && Number(p.budgetLocal) < 1e10
      ? { budgetCurrency: p.budgetCurrency, budgetLocal: Math.round(Number(p.budgetLocal)) }
      : {}),
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
  /** Set on days the traveller has edited; planner stops use their slot name. */
  id?: string;
  /** Added by the traveller rather than the planner. */
  mine?: boolean;
  time: string;
  place: PlaceDetails;
  duration: string;
  estimatedCost: number;
  category?: string;
  tip?: string;
  /** How the cost adds up, in local money: "¥1,000 entry × 2". */
  priceNote?: string;
  /** Set when the cost looked implausible, so the page asks the traveller to check it. */
  priceCheck?: boolean;
  /** Opening hours on that day: "9:00–17:00, closed Mondays". */
  hours?: string;
  /** Why to book ahead, when it matters: "Timed tickets sell out a week ahead". */
  bookAhead?: string;
  /** The best time to be there: "Before 8 AM, before the tour buses". */
  bestTime?: string;
  /** Dress code or footwear: "Shoulders and knees covered". */
  wear?: string;
  /** Step-free access, stairs or terrain: "Steep steps, no lift". */
  access?: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  summary?: string;
  /**
   * The day's stops, in order. Days are written this way once the traveller
   * edits them (any number of stops); planner output and older trips use the
   * three fixed slots below instead. Read either with `dayStops()`.
   */
  stops?: ActivitySlot[];
  morning?: ActivitySlot;
  afternoon?: ActivitySlot;
  evening?: ActivitySlot;
  totalDayCost: number;
  /** One practical trick for the day (a transit pass, a queue hack). */
  dayTip?: string;
  /** Multi-city trips: the city this day is spent in. */
  city?: string;
  /** Multi-city trips: the journey to `city` that opens this day. */
  transfer?: Transfer;
}

/** Getting from one city to the next on a multi-city trip. */
export interface Transfer {
  from: string;
  to: string;
  /** "train", "flight", "bus", "car" or "ferry". */
  mode: string;
  /** "Shatabdi Express 12015, 4h 30m" or "about 2h 15m". */
  duration?: string;
  /** For the whole group, USD. */
  cost?: number;
  depart?: string;
  tip?: string;
}

/** One leg of a multi-city trip: a city and how many days are spent there. */
export interface TripLeg {
  city: string;
  days: number;
}

/** Up to five cities, 1–30 days each, adding up to `total` (the last leg absorbs any difference). */
export function normalizeLegs(input: unknown, total: number): TripLeg[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const legs = input
    .map((l) => ({ city: typeof l?.city === "string" ? l.city.replace(/\s+/g, " ").trim().slice(0, 80) : "", days: Math.max(1, Math.min(30, Math.round(Number(l?.days)) || 1)) }))
    .filter((l) => l.city)
    .slice(0, 5);
  if (legs.length < 2) return undefined;
  let sum = legs.reduce((n, l) => n + l.days, 0);
  // Fit the legs to the trip: trim from the end, or let the last leg take the extra days.
  for (let i = legs.length - 1; sum > total && i >= 0; i--) {
    const cut = Math.min(legs[i].days - 1, sum - total);
    legs[i].days -= cut;
    sum -= cut;
  }
  if (sum < total) legs[legs.length - 1].days += total - sum;
  return sum > total ? undefined : legs;
}

/** "Delhi → Jaipur → Udaipur". */
export const legsLabel = (legs: TripLeg[]) => legs.map((l) => l.city.split(",")[0]).join(" → ");

export type DayPeriod = "morning" | "afternoon" | "evening";
const PERIODS: DayPeriod[] = ["morning", "afternoon", "evening"];

/** "9:00 AM - 12:00 PM" → morning; "18:30" → evening. */
export function periodOf(time: string | undefined, fallback: DayPeriod = "afternoon"): DayPeriod {
  const m = time?.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?)?/i);
  if (!m) return fallback;
  let h = Number(m[1]) % 24;
  const ap = m[3]?.[0]?.toLowerCase();
  if (ap === "p" && h < 12) h += 12;
  if (ap === "a" && h === 12) h = 0;
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

export interface DayStop {
  /** Stable within the day: the slot name for planner stops, an id for added ones. */
  key: string;
  period: DayPeriod;
  activity: ActivitySlot;
}

/** A day's stops in order, whichever way the day is stored. */
export function dayStops(day: DayItinerary | undefined | null): DayStop[] {
  if (!day) return [];
  if (Array.isArray(day.stops)) {
    return day.stops
      .filter((s) => s?.place?.name)
      .map((s, i) => ({ key: s.id ?? `s${i}`, period: periodOf(s.time, PERIODS[Math.min(i, 2)]), activity: s }));
  }
  return PERIODS.flatMap((k) => (day[k]?.place?.name ? [{ key: k as string, period: k, activity: day[k]! }] : []));
}

/** Just the activities. */
export const dayActivities = (day: DayItinerary | undefined | null) => dayStops(day).map((s) => s.activity);

/**
 * The day rewritten as an ordered list of stops. Planner stops keep their
 * slot name as their id, so friends' votes and swaps stay attached to them.
 */
export function withStops(day: DayItinerary, stops: ActivitySlot[]): DayItinerary {
  const { morning: _m, afternoon: _a, evening: _e, ...rest } = day;
  void _m;
  void _a;
  void _e;
  return { ...rest, stops, totalDayCost: stops.reduce((n, s) => n + (Number(s.estimatedCost) || 0), 0) };
}

/** Stops that a downpour spoils: open-air by category or by name. */
export function isOutdoor(s: ActivitySlot) {
  if (s.category === 'nature') return true;
  return /\b(park|garden|grove|beach|viewpoint|lookout|hike|trail|walk|stroll|cruise|boat|ghat|lake|falls|waterfall|square|piazza|bridge|street|market|bazaar|zoo|safari|pass|dunes|ruins|fort|shrine|inari)\b/i.test(`${s.place.name} ${s.place.description ?? ''}`) && !/\b(covered|indoor|museum|gallery|hall)\b/i.test(s.place.name);
}

/** The stop with this key on the day, if any. */
export const findStop = (day: DayItinerary | undefined | null, key: string) => dayStops(day).find((s) => s.key === key);

/** The day with one stop replaced (keeping its key), costs recomputed. */
export function replaceStop(day: DayItinerary, key: string, stop: ActivitySlot): DayItinerary {
  if (!Array.isArray(day.stops) && (PERIODS as string[]).includes(key)) {
    const next = { ...day, [key]: { ...stop, id: undefined } };
    return { ...next, totalDayCost: dayActivities(next).reduce((n, s) => n + (Number(s.estimatedCost) || 0), 0) };
  }
  return withStops(day, editableStops(day).map((s) => (s.id === key ? { ...stop, id: key } : s)));
}

/** The day's stops with ids, ready to edit. */
export const editableStops = (day: DayItinerary): ActivitySlot[] => dayStops(day).map((s) => ({ ...s.activity, id: s.key }));

export interface StaySuggestion {
  name: string;
  area: string;
  type?: string;
  why: string;
  pricePerNight?: number;
  /** Multi-city trips: which city it's in. */
  city?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  /** Google Maps link once the stay is checked against Places. */
  mapsUrl?: string;
}

/** One way of getting from home to the destination. */
export interface TravelOption {
  mode: "flight" | "train" | "bus" | "drive" | "ferry";
  /** "IndiGo or Air India, nonstop" / "Netravati Express 16345". */
  title: string;
  /** Where it leaves from: "Pune Airport (PNQ)", "Pune Junction". */
  from: string;
  to: string;
  duration: string;
  /** Typical fare, per person, one way, USD. */
  priceUsd: number;
  /** In the local currency: "₹4,500–6,500 one way". */
  priceNote?: string;
  frequency?: string;
  /** Why pick it, in one line. */
  pros: string;
  /** Multi-city trips: getting home from the last city the same way. */
  returnNote?: string;
  best?: "cheapest" | "fastest" | "best value";
  /** Set when the fare came from a live price feed. */
  live?: boolean;
  /** IATA codes for flights, so live fares and deep links can be built. */
  fromCode?: string;
  toCode?: string;
}

export interface GetThere {
  options: TravelOption[];
  /** Index of the option the budget counts. */
  pick: number;
}

export type RentalKind = "scooter" | "bike" | "car" | "cycle";

export interface RentalPick {
  kind: RentalKind;
  name: string;
  area: string;
  lat?: number;
  lng?: number;
  /** Typical rate per day, USD, for one vehicle. */
  pricePerDayUsd: number;
  priceNote?: string;
  deposit?: string;
  needs?: string;
  tip?: string;
  rating?: number;
  mapsUrl?: string;
}

export interface GetAround {
  picks: RentalPick[];
  /** Fuel, helmets, parking, licences: the local rules of the road. */
  notes: string[];
  /** Whether the rental counts toward the budget, and which one. */
  inBudget?: boolean;
  chosen?: number;
}

/** What one day will hold, written up front so the days written later don't repeat each other. */
export interface DayOutline {
  day: number;
  theme: string;
  area: string;
  anchors: string[];
}

export interface Essentials {
  currency?: string;
  language?: string;
  plugs?: string;
  tipping?: string;
  weather?: string;
  gettingAround?: string;
  phrase?: string;
  /** Is the tap water safe to drink. */
  water?: string;
  /** Ride-hailing, transit and payment apps that work there. */
  apps?: string;
  /** How to get mobile data: eSIM, where to buy a SIM, roughly what it costs. */
  sim?: string;
  /** The main emergency number(s). */
  emergency?: string;
}

export interface PlacePhoto {
  url: string | null;
  /** What the photo actually shows (the matched page or place). */
  title?: string;
  credit?: string;
  sourceUrl?: string;
  /** false when it's a nearby landmark or the city rather than the place itself. */
  exact?: boolean;
  kind?: "place" | "nearby" | "city" | "dish";
  /** A photo of the destination, shown if `url` fails to load. */
  fallback?: string;
  /** Google rating and review count, when the photo came from Google Places. */
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
}

/** How a stop's photo is filed on the trip: by place and city, so repeats share one. */
export const photoKey = (name: string, city: string) =>
  `${name}|${city.split(",")[0]}`.toLowerCase().replace(/\s+/g, " ").trim();

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
  /** ISO 4217 code of the local currency, e.g. "JPY". */
  currencyCode?: string;
  /** Getting from the main airport or station into town. */
  arrival?: { mode: string; time?: string; cost?: string; tip?: string }[];
  /** Local emergency numbers. */
  emergency?: { police?: string; ambulance?: string; fire?: string; tourist?: string; general?: string };
  /** Common tourist scams and how to avoid them. */
  scams?: { name: string; avoid: string }[];
  /** Entry basics for travellers from the trip's home country. */
  entry?: { summary: string; from?: string };
  /** Health basics: water, jabs, pharmacies, and anything about sun, altitude or air. */
  health?: { tapWater?: string; vaccines?: string; pharmacy?: string; note?: string };
  /** Filled by the server from YouTube, never by the model. */
  videos?: TripVideo[];
}

export interface WalletPerson {
  id: string;
  name: string;
}

export const EXPENSE_CATEGORIES = ["food", "stay", "transport", "activities", "shopping", "other"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface WalletExpense {
  id: string;
  title: string;
  /** In the wallet's currency. */
  amount: number;
  paidBy: string;
  /** Who shares it (person ids); everyone splits equally. */
  split: string[];
  category: ExpenseCategory;
  /** YYYY-MM-DD */
  date: string;
}

/** The trip's shared spending: who paid for what, and who owes whom. */
export interface Wallet {
  currency: string;
  people: WalletPerson[];
  expenses: WalletExpense[];
}

export const BOOKING_KINDS = ["flight", "stay", "train", "car", "activity", "insurance", "other"] as const;
export type BookingKind = (typeof BOOKING_KINDS)[number];

/** Something the traveller actually booked, kept with the trip so it's all in one place. */
export interface TripBooking {
  id: string;
  kind: BookingKind;
  /** "AI 314 Mumbai → Osaka", "Hotel The Celestine". */
  title: string;
  /** Confirmation / PNR / policy number. */
  ref?: string;
  /** Local date-time, "YYYY-MM-DDTHH:mm" (or just a date). */
  start?: string;
  end?: string;
  /** Address, terminal or meeting point. */
  location?: string;
  notes?: string;
}

/** What friends on a shared link think of one stop. */
export interface StopReaction {
  up: number;
  down: number;
  notes: { name: string; text: string; vote: "up" | "down"; at: string }[];
}

/** Key for a stop's reactions: "0-morning". */
export const reactionKey = (day: number, slot: string) => `${day}-${slot}`;

export interface ItineraryData {
  itinerary: DayItinerary[];
  /** Real photos found for the stops, saved so later views need no lookups. */
  photos?: Record<string, PlacePhoto>;
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
  /** Shared expenses, added by the traveller during the trip. */
  wallet?: Wallet;
  /** Flights, stays and tickets the traveller booked. */
  bookings?: TripBooking[];
  /** Friends' votes and notes from shared links, by reactionKey. */
  reactions?: Record<string, StopReaction>;
  /** What the traveller asked for (added when the planner got richer fields). */
  trip?: { source?: string; preferences?: TripPreferences; legs?: TripLeg[] };
  /** Trip intelligence: crowds, places to eat, packing, getting around, money manners and carbon. */
  insights?: TripInsights;
  /** How to get there from home, with typical fares. */
  getThere?: GetThere;
  /** Scooter, bike and car rentals at the destination. */
  getAround?: GetAround;
  /** The plan for every day, written first; days still being written are listed in `pending`. */
  outline?: DayOutline[];
  /** Day numbers (1-based) still being written in the background. */
  pending?: number[];
}

/** Round-trip cost of the chosen way there, for the whole group, USD. */
export function getThereCost(data: Pick<ItineraryData, "getThere">, people: number): number {
  const g = data.getThere;
  const o = g?.options[g.pick] ?? g?.options[0];
  if (!o) return 0;
  // Driving is per vehicle (fuel and tolls), everything else per person; both ways.
  return Math.round((o.mode === "drive" ? o.priceUsd : o.priceUsd * Math.max(1, people)) * 2);
}

/** The rental for the whole trip, when the traveller counts it. */
export function getAroundCost(data: Pick<ItineraryData, "getAround">, days: number): number {
  const g = data.getAround;
  if (!g?.inBudget || !g.picks.length) return 0;
  const p = g.picks[g.chosen ?? 0] ?? g.picks[0];
  return Math.round(p.pricePerDayUsd * Math.max(1, days));
}

/** What a stop is like to visit, keyed in TripInsights.stops by the place name in lower case. */
export interface StopInsight {
  crowd?: "quiet" | "busy" | "packed";
  /** When it's calmest: "before 9 AM", "weekday afternoons". */
  quietest?: string;
  /** Days of the week it's closed: ["Monday"]. */
  closedOn?: string[];
  kids?: boolean;
  accessible?: boolean;
  /** Where the best photo is, and when. */
  photo?: string;
}

export interface TripInsights {
  stops: Record<string, StopInsight>;
  /** Places to eat near each day's stops. */
  eats: { day: number; near: string; name: string; cuisine: string; price: 1 | 2 | 3 | 4; veg: boolean; rating?: number; note: string }[];
  packing: { item: string; why: string }[];
  /** What to wear at temples, mosques and the like. */
  dress?: string;
  transit: { mode: string; cost: string; tip: string }[];
  rideApps: string[];
  money: { tipping: string; bargaining: string };
  carbon: { totalKg: number; parts: { label: string; kg: number }[]; greener: string[] };
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
  /** "generating" while later days are still being written, "partial" if some failed. */
  status?: string;
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
