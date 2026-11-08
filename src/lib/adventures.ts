/**
 * Adventures: cheap, adventurous trips written for travellers flying in from the US,
 * Europe, the UK and Australia (hitchhiking Kyrgyzstan, the Ha Giang Loop, the Annapurna
 * Circuit…), each a how-to page at /adventures/[slug]. Prices are in US dollars and
 * rounded; visa notes are for US, EU, UK and Australian passports and say to check, since
 * the rules move. The entries live in the adventures-* files by region, the entry rules in
 * adventure-visas.ts.
 */
import { ADVENTURES_CAUCASUS } from "@/lib/adventures-caucasus";
import { ADVENTURES_CENTRAL_ASIA_1 } from "@/lib/adventures-central-asia-1";
import { ADVENTURES_CENTRAL_ASIA_2 } from "@/lib/adventures-central-asia-2";
import { ADVENTURES_LATIN_AMERICA_1 } from "@/lib/adventures-latin-america-1";
import { ADVENTURES_LATIN_AMERICA_2 } from "@/lib/adventures-latin-america-2";
import { ADVENTURES_SEA_1 } from "@/lib/adventures-sea-1";
import { ADVENTURES_SEA_2 } from "@/lib/adventures-sea-2";
import { ADVENTURES_SEA_3 } from "@/lib/adventures-sea-3";
import { ADVENTURES_SOUTH_ASIA_1 } from "@/lib/adventures-south-asia-1";
import { ADVENTURES_SOUTH_ASIA_2 } from "@/lib/adventures-south-asia-2";

export type AdventureKind =
  | "hitchhike"
  | "motorbike"
  | "trek"
  | "overland"
  | "cycle"
  | "boat"
  | "dive"
  | "jungle"
  | "volcano"
  | "horse"
  | "rail"
  | "climb"
  | "raft"
  | "surf"
  | "fly"
  | "desert";

export type AdventureArea = "Southeast Asia" | "South Asia" | "Central Asia & Mongolia" | "Caucasus & Middle East" | "Latin America";

export type Difficulty = "Easy" | "Moderate" | "Challenging" | "Hard";

export interface Adventure {
  slug: string;
  /** "Hitchhiking in Kyrgyzstan". */
  title: string;
  /** The search title: "Hitchhiking in Kyrgyzstan (2026): Routes, Costs & Safety". */
  seoTitle: string;
  /** The meta description, about 150 characters. */
  description: string;
  kind: AdventureKind;
  country: string;
  area: AdventureArea;
  /** What the photo lookup asks for: "Song Kol lake, Kyrgyzstan". */
  place: string;
  tagline: string;
  /** Why go: two or three sentences. */
  why: string;
  difficulty: Difficulty;
  /** Typical length, in days: [shortest sensible, comfortable]. */
  days: [number, number];
  /** The best months, 1–12. */
  months: number[];
  /** What the seasons mean on the ground, in a sentence or two. */
  season: string;
  /** US dollars a day per person, before flights: [shoestring, mid-range, comfortable]. */
  budget: [number, number, number];
  /** How it works, as steps in order. */
  steps: string[];
  /** The route or plan, stage by stage: [name, what happens]. */
  route: [stage: string, detail: string][];
  /** What things cost on the ground, in US dollars: [item, cost]. */
  costs: [item: string, cost: string][];
  gear: string[];
  safety: string[];
  /** For US, EU, UK and Australian passports. */
  visa: string;
  getThere: string;
  getAround: string;
  tips: string[];
  /** Questions specific to this adventure; the common ones are built from the data (see adventureFaqs). */
  faqs: { q: string; a: string }[];
}

export const ADVENTURES: Adventure[] = [
  ...ADVENTURES_SEA_1,
  ...ADVENTURES_SEA_2,
  ...ADVENTURES_SEA_3,
  ...ADVENTURES_SOUTH_ASIA_1,
  ...ADVENTURES_SOUTH_ASIA_2,
  ...ADVENTURES_CENTRAL_ASIA_1,
  ...ADVENTURES_CENTRAL_ASIA_2,
  ...ADVENTURES_CAUCASUS,
  ...ADVENTURES_LATIN_AMERICA_1,
  ...ADVENTURES_LATIN_AMERICA_2,
];

export const adventureBySlug = (slug: string) => ADVENTURES.find((a) => a.slug === slug);

// Roughly how well known each one is: the "Popular" order, and the picks other pages show.
const FAME = [
  "ha-giang-loop", "hitchhike-kyrgyzstan", "annapurna-circuit", "everest-base-camp", "uyuni-salt-flats", "salkantay-trek",
  "hitchhike-mongolia", "pamir-highway", "hitchhike-georgia", "mount-rinjani", "koh-tao-diving", "ijen-and-bromo",
  "komodo-boat-trip", "vietnam-by-motorbike", "wadi-rum", "death-road", "lost-city-trek", "acatenango",
  "mae-hong-son-loop", "thakhek-loop", "el-nido-to-coron", "song-kol-horse-trek", "gobi-overland", "silk-road-by-train",
  "jordan-trail", "kazbegi-treks", "mestia-to-ushguli", "pokhara-paragliding", "ella-train-and-hikes", "spiti-valley",
  "manali-leh-highway", "hitchhike-cambodia", "hitchhike-vietnam", "mekong-slow-boat", "vang-vieng", "angkor-by-bicycle",
];
/** Every adventure, best known first. */
export const POPULAR: Adventure[] = [
  ...FAME.map((slug) => ADVENTURES.find((a) => a.slug === slug)).filter((a): a is Adventure => !!a),
  ...ADVENTURES.filter((a) => !FAME.includes(a.slug)),
];

export const AREAS: AdventureArea[] = ["Southeast Asia", "South Asia", "Central Asia & Mongolia", "Caucasus & Middle East", "Latin America"];
/** "Central Asia & Mongolia" → "central-asia-and-mongolia", for anchors and filters. */
export const areaId = (area: AdventureArea) => area.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");
export const DIFFICULTIES: Difficulty[] = ["Easy", "Moderate", "Challenging", "Hard"];

export const KIND_LABEL: Record<AdventureKind, string> = {
  hitchhike: "Hitchhiking",
  motorbike: "Motorbike",
  trek: "Trekking",
  overland: "Overland",
  cycle: "Cycling",
  boat: "Boats & islands",
  dive: "Diving",
  jungle: "Jungle",
  volcano: "Volcanoes",
  horse: "Horse trekking",
  rail: "By train",
  climb: "Climbing",
  raft: "Rafting",
  surf: "Surfing",
  fly: "Paragliding",
  desert: "Desert",
};

/** The kinds that are actually used, most common first, for the filter. */
export const usedKinds = () => {
  const n = new Map<AdventureKind, number>();
  for (const a of ADVENTURES) n.set(a.kind, (n.get(a.kind) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([kind, count]) => ({ kind, count }));
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** [10, 11, 12, 1, 2] → "Oct – Feb" ("Oct–Feb" when tight); runs joined with commas. */
export function monthsText(months: number[], tight = false) {
  if (months.length >= 12) return "All year";
  const sorted = [...months].sort((a, b) => a - b);
  const runs: number[][] = [];
  for (const m of sorted) {
    const last = runs[runs.length - 1];
    if (last && last[last.length - 1] + 1 === m) last.push(m);
    else runs.push([m]);
  }
  // A run ending in December joins one starting in January.
  if (runs.length > 1 && runs[0][0] === 1 && runs[runs.length - 1].at(-1) === 12) runs[0] = [...runs.pop()!, ...runs[0]];
  const dash = tight ? "–" : " – ";
  return runs.map((r) => (r.length === 1 ? MONTHS[r[0] - 1] : `${MONTHS[r[0] - 1]}${dash}${MONTHS[r[r.length - 1] - 1]}`)).join(", ");
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const daysText = (a: Adventure) => (a.days[0] === a.days[1] ? `${a.days[0]} days` : `${a.days[0]}–${a.days[1]} days`);

// How an adventure reads mid-sentence ("How much does … cost?"), where its title doesn't.
const CALLED: Record<string, string> = {
  "vietnam-by-motorbike": "riding Vietnam by motorbike",
  "angkor-by-bicycle": "cycling Angkor",
  "vang-vieng": "an adventure trip to Vang Vieng",
  "khao-sok-jungle": "a trip to Khao Sok",
  "ijen-and-bromo": "an Ijen and Bromo trip",
  "komodo-boat-trip": "a Komodo boat trip",
  "el-nido-to-coron": "the El Nido to Coron boat trip",
  "spiti-valley": "a Spiti Valley road trip",
  "manali-leh-highway": "riding the Manali–Leh Highway",
  "ella-train-and-hikes": "the Kandy to Ella train",
  "meghalaya-root-bridges": "the living root bridges trek",
  "silk-road-by-train": "a Silk Road trip by train",
  "charyn-and-kolsai": "a Charyn Canyon and Kolsai Lakes trip",
  "gobi-overland": "a Gobi tour",
  "mestia-to-ushguli": "the Mestia to Ushguli trek",
  "jordan-trail": "the Dana to Petra trek",
  "wadi-rum": "a Wadi Rum trip",
  "oman-wadis": "an Oman road trip",
  "uyuni-salt-flats": "a Uyuni salt flats tour",
  "laguna-69": "the Laguna 69 hike",
  "acatenango": "the Acatenango hike",
};
// Titles that start with an ordinary word read in lower case mid-sentence ("the", "hitchhiking"…).
const PLAIN_START = /^(The|Hitchhiking|Climbing|Learning|Trekking|Sailing|Diving|Surfing|Rafting|Bouldering|Biking|Paragliding|Horse|Cycling)\b/;

/** "the Ha Giang Loop", "hitchhiking in Kyrgyzstan", "a Gobi tour". */
export function adventureName(a: Adventure) {
  if (CALLED[a.slug]) return CALLED[a.slug];
  const t = a.title.split(":")[0];
  return PLAIN_START.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}

/** [3, 4, 5, 9, 10, 11] → "March to May and September to November". */
export function monthsLong(months: number[]) {
  const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const runs = monthsText(months)
    .split(", ")
    .map((r) => r.split(" – ").map((m) => FULL[MONTHS.indexOf(m)] ?? m).join(" to "));
  return runs.length > 1 ? `${runs.slice(0, -1).join(", ")} and ${runs[runs.length - 1]}` : runs[0];
}

// An adventure's own question on one of these topics replaces the general one.
const ASKS = { time: /\bbest time\b|^when\b/i, days: /how many days|how long do you need/i, safe: /\bsafe\b/i };

/** The questions everyone asks, answered from the adventure's own data, then its own. */
export function adventureFaqs(a: Adventure) {
  const what = adventureName(a);
  const months = monthsLong(a.months);
  const own = (topic: keyof typeof ASKS) => a.faqs.some((f) => ASKS[topic].test(f.q));
  const general = [
    {
      q: `How much does ${what} cost?`,
      a: `Budget about ${usd(a.budget[0])} a day on a shoestring, ${usd(a.budget[1])} mid-range and ${usd(a.budget[2])}+ for comfort, before flights. ${a.costs
        .slice(0, 3)
        .map(([item, cost]) => `${item}: ${cost}.`)
        .join(" ")}`,
    },
    !own("time") && { q: `When is the best time for ${what}?`, a: `${months === "All year" ? "Any time of year" : `The best months are ${months}`}. ${a.season}` },
    !own("days") && {
      q: `How many days do you need for ${what}?`,
      a: `Plan on ${daysText(a)}, in ${a.route.length} stages: ${a.route.map(([stage]) => stage).join("; ")}.`,
    },
    { q: `Do I need a visa for ${a.country}?`, a: a.visa },
    !own("safe") && { q: `Is ${what} safe?`, a: a.safety.slice(0, 2).join(" ") },
  ].filter((f): f is { q: string; a: string } => !!f);
  return [...general, ...a.faqs];
}

/** Others like it: the same kind first, then the same part of the world. */
export function relatedAdventures(a: Adventure, n = 3) {
  return ADVENTURES.filter((o) => o.slug !== a.slug)
    .map((o) => ({ o, score: (o.kind === a.kind ? 3 : 0) + (o.area === a.area ? 2 : 0) + (o.country === a.country ? 1 : 0) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, n)
    .map((x) => x.o);
}
