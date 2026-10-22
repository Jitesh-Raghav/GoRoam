import { TRIP_IDEAS, type TripIdea, type TripTag } from "@/lib/trip-ideas";

/**
 * Squad Match: a group swipes on the same deck of trips, picks vibes, sets a
 * private budget each and taps the weekends they're free. This works out the
 * trip that fits everyone. Budgets only ever leave as "fits everyone"; nobody's
 * number is shown or attributed.
 */

export const USD_TO_INR = 88;
export const SQUAD_MAX = 20;
export const DECK_SIZE = 12;

export type Vibe = "beach" | "mountains" | "party" | "food" | "adventure" | "culture" | "wildlife" | "chill";

export const VIBES: { id: Vibe; label: string; emoji: string; tags: TripTag[] }[] = [
  { id: "beach", label: "Beaches", emoji: "🏖️", tags: ["beach"] },
  { id: "mountains", label: "Mountains", emoji: "🏔️", tags: ["hills", "snow"] },
  { id: "party", label: "Nightlife", emoji: "🪩", tags: ["festival", "beach"] },
  { id: "food", label: "Food", emoji: "🍜", tags: ["heritage", "festival", "abroad"] },
  { id: "adventure", label: "Adventure", emoji: "🪂", tags: ["adventure", "snow", "desert"] },
  { id: "culture", label: "Culture", emoji: "🏛️", tags: ["heritage", "festival"] },
  { id: "wildlife", label: "Wildlife", emoji: "🐅", tags: ["wildlife"] },
  { id: "chill", label: "Doing nothing", emoji: "😴", tags: ["beach", "hills", "honeymoon"] },
];
export const VIBE_IDS = VIBES.map((v) => v.id);

const ROLES: Record<Vibe | "yes" | "picky" | "wild", { title: string; emoji: string; line: string }> = {
  beach: { title: "The Beach Bum", emoji: "🏖️", line: "Will steer every plan towards the water." },
  mountains: { title: "The Mountain Goat", emoji: "🏔️", line: "Already eyeing the 5am trek." },
  party: { title: "The Night Owl", emoji: "🌙", line: "Peaks at 1am, sleeps through breakfast." },
  food: { title: "The Foodie", emoji: "🍜", line: "Plans the whole day around lunch." },
  adventure: { title: "The Adrenaline Junkie", emoji: "🪂", line: "If it needs a waiver, they're in." },
  culture: { title: "The Museum Nerd", emoji: "🏛️", line: "Reads every plaque. Every single one." },
  wildlife: { title: "The Safari Spotter", emoji: "🐅", line: "Packed binoculars before socks." },
  chill: { title: "The Hammock Philosopher", emoji: "😴", line: "Here to do nothing, beautifully." },
  yes: { title: "The Yes Person", emoji: "🙌", line: "Swiped right on basically everything." },
  picky: { title: "The Picky One", emoji: "🧐", line: "Hard to please, impossible to fool." },
  wild: { title: "The Wildcard", emoji: "🃏", line: "Nobody knows what they'll do. Including them." },
};

/** What the browser needs to show a card, so the whole trip list isn't shipped. */
export interface DeckCard {
  slug: string;
  name: string;
  region: string;
  country: string;
  destination: string;
  landscape: TripIdea["landscape"];
  days: number;
  tagline: string;
  /** Backpacker cost per person a day, in `currency`. */
  perDay: number;
  currency: "INR" | "USD";
}

export interface MemberAnswers {
  name: string;
  homeCity: string;
  /** INR per person for the whole trip, getting there aside. */
  maxBudget: number;
  dates: string[];
  likes: string[];
  passes: string[];
  vibes: Vibe[];
}

/** A small, stable hash so every friend sees the same deck in the same order. */
function seed(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle<T>(xs: T[], rand: () => number) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Twelve trips in season around when the squad was made: mostly India, a few abroad, no two of a kind in a row. */
export function squadDeck(code: string, created: Date): TripIdea[] {
  const m = created.getMonth() + 1;
  const next = (m % 12) + 1;
  const pool = shuffle(
    TRIP_IDEAS.filter((t) => t.months.includes(m) || t.months.includes(next)),
    seed(code),
  );
  const pick = (india: boolean, n: number) => {
    const out: TripIdea[] = [];
    const seen = new Set<string>();
    // First pass one per leading tag, for variety; then fill.
    const mine = pool.filter((t) => (t.country === "India") === india);
    for (const t of mine) {
      if (out.length < n && !seen.has(t.tags[0])) {
        seen.add(t.tags[0]);
        out.push(t);
      }
    }
    for (const t of mine) if (out.length < n && !out.includes(t)) out.push(t);
    return out;
  };
  const home = pick(true, 7);
  const away = pick(false, DECK_SIZE - home.length);
  // Interleave: two at home, one away.
  const deck: TripIdea[] = [];
  while (home.length || away.length) {
    deck.push(...home.splice(0, 2), ...away.splice(0, 1));
  }
  return deck;
}

export const deckCard = (t: TripIdea): DeckCard => ({
  slug: t.slug,
  name: t.name,
  region: t.region,
  country: t.country,
  destination: t.destination,
  landscape: t.landscape,
  days: t.days,
  tagline: t.tagline,
  perDay: t.budget[0],
  currency: t.currency === "USD" ? "USD" : "INR",
});

/** The next eight Fridays, starting at least five days after the squad was made. */
export function squadWeekends(created: Date) {
  const d = new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate() + 5));
  while (d.getUTCDay() !== 5) d.setUTCDate(d.getUTCDate() + 1);
  return Array.from({ length: 8 }, (_, i) => new Date(d.getTime() + i * 7 * 86400000).toISOString().slice(0, 10));
}

/** What a trip costs one person at each level, in INR, for its full length. */
const costs = (t: TripIdea) => t.budget.map((b) => b * t.days * (t.currency === "USD" ? USD_TO_INR : 1));

const TIERS = ["Backpacker", "Mid-range", "Comfort"] as const;

export interface SquadMatch {
  trip: TripIdea;
  matchPct: number;
  likedBy: number;
  fits: boolean;
  /** The best level everyone can afford, and its cost per head in INR. */
  tier: (typeof TIERS)[number];
  perHead: number;
}

export interface SquadResult {
  best: SquadMatch;
  runnersUp: SquadMatch[];
  date: { iso: string; free: number } | null;
  /** How often the friends swiped the same way, 0-100; null with one person. */
  sync: number | null;
  roles: { name: string; title: string; emoji: string; line: string }[];
}

function scoreTrip(t: TripIdea, members: MemberAnswers[], cap: number): SquadMatch {
  const vibeTags = (m: MemberAnswers) => new Set(VIBES.filter((v) => m.vibes.includes(v.id)).flatMap((v) => v.tags));
  let total = 0;
  let likedBy = 0;
  for (const m of members) {
    const liked = m.likes.includes(t.slug);
    likedBy += liked ? 1 : 0;
    let s = liked ? 1 : m.passes.includes(t.slug) ? 0 : 0.5;
    if (t.tags.some((x) => vibeTags(m).has(x))) s += 0.25;
    total += Math.min(1, s);
  }
  const c = costs(t);
  let level = 0;
  while (level < 2 && c[level + 1] <= cap) level++;
  return { trip: t, matchPct: Math.round((100 * total) / members.length), likedBy, fits: c[0] <= cap, tier: TIERS[level], perHead: c[level] };
}

function assignRoles(members: MemberAnswers[], deckSize: number) {
  const count = new Map<Vibe, number>();
  members.forEach((m) => m.vibes.forEach((v) => count.set(v, (count.get(v) ?? 0) + 1)));
  const taken = new Set<string>();
  return members.map((m) => {
    const swiped = m.likes.length + m.passes.length || deckSize;
    const ratio = m.likes.length / swiped;
    const options: (keyof typeof ROLES)[] = [];
    if (ratio >= 0.75) options.push("yes");
    if (ratio <= 0.2) options.push("picky");
    // Their rarest vibe in the group first, so roles come out different.
    options.push(...[...m.vibes].sort((a, b) => (count.get(a) ?? 0) - (count.get(b) ?? 0)));
    const key = options.find((k) => !taken.has(k)) ?? options[0] ?? "wild";
    taken.add(key);
    return { name: m.name, ...ROLES[key] };
  });
}

/** How alike the squad swiped: for each pair, the share of trips both swiped where they agreed. */
function syncScore(members: MemberAnswers[]) {
  const pairs: number[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const both = [...a.likes, ...a.passes].filter((s) => b.likes.includes(s) || b.passes.includes(s));
      if (!both.length) continue;
      pairs.push(both.filter((s) => a.likes.includes(s) === b.likes.includes(s)).length / both.length);
    }
  }
  return pairs.length ? Math.round((100 * pairs.reduce((x, y) => x + y, 0)) / pairs.length) : null;
}

export function matchSquad(deck: TripIdea[], members: MemberAnswers[]): SquadResult | null {
  if (!members.length || !deck.length) return null;
  const cap = Math.min(...members.map((m) => m.maxBudget));
  const scored = deck
    .map((t) => scoreTrip(t, members, cap))
    .sort((a, b) => Number(b.fits) - Number(a.fits) || b.matchPct - a.matchPct || b.likedBy - a.likedBy || a.perHead - b.perHead);
  const tally = new Map<string, number>();
  members.forEach((m) => m.dates.forEach((d) => tally.set(d, (tally.get(d) ?? 0) + 1)));
  const [iso, free] = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? [];
  return {
    best: scored[0],
    runnersUp: scored.slice(1, 4),
    date: iso ? { iso, free: free! } : null,
    sync: syncScore(members),
    roles: assignRoles(members, deck.length),
  };
}

/** A member row from the database, parsed. */
export function readMember(m: { name: string; homeCity: string; maxBudget: number; dates: string; likes: string; passes: string; vibes: string }): MemberAnswers {
  const list = (s: string) => {
    try {
      const v = JSON.parse(s);
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  };
  return { name: m.name, homeCity: m.homeCity, maxBudget: m.maxBudget, dates: list(m.dates), likes: list(m.likes), passes: list(m.passes), vibes: list(m.vibes) as Vibe[] };
}

/** "2026-11-14" → "Fri 14 Nov". */
export const fridayLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
