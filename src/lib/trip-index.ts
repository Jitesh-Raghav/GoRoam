import { TRIP_IDEAS, monthsLabel, placeLabel, price, type TripIdea } from "@/lib/trip-ideas";

/**
 * The GoRoam Trip Cost Index: every /trips plan's per-person day budget, gathered
 * into two indexes (India & nearby in rupees, worldwide in dollars, never
 * converted into each other) with zone medians, rankings and generated findings.
 * Everything is derived from TRIP_IDEAS, so the index moves when a trip's prices do.
 */

export type IndexId = "india" | "world";
export const INDEX_UPDATED = "2026-11-05";
export const INDEX_NAME = "GoRoam Trip Cost Index 2026";

export const INDEXES: { id: IndexId; label: string; short: string; currency: "INR" | "USD" }[] = [
  { id: "india", label: "India & nearby", short: "India", currency: "INR" },
  { id: "world", label: "Worldwide", short: "Worldwide", currency: "USD" },
];

const INDIA_ZONES: Record<string, string> = {
  "Himachal Pradesh": "North India",
  Uttarakhand: "North India",
  Punjab: "North India",
  "Uttar Pradesh": "North India",
  Rajasthan: "West India",
  Gujarat: "West India",
  Maharashtra: "West India",
  Karnataka: "South India",
  Kerala: "South India",
  "Tamil Nadu": "South India",
  Puducherry: "South India",
  "West Bengal": "East & Northeast India",
  Sikkim: "East & Northeast India",
  Meghalaya: "East & Northeast India",
  Assam: "East & Northeast India",
  "Arunachal Pradesh": "East & Northeast India",
  Odisha: "East & Northeast India",
  "Madhya Pradesh": "Central India",
  "Andaman & Nicobar": "Andaman & Lakshadweep",
  Lakshadweep: "Andaman & Lakshadweep",
};

const WORLD_ZONES: Record<string, string[]> = {
  Europe: ["United Kingdom", "Portugal", "Spain", "Italy", "France", "Switzerland", "Norway", "Germany", "Austria", "Sweden", "Netherlands", "Malta", "Iceland", "Hungary", "Greece", "Finland", "Denmark", "Czech Republic", "Belgium", "Turkey"],
  "North America": ["United States", "Canada", "Mexico"],
  "Caribbean & Central America": ["Turks and Caicos Islands", "Saint Lucia", "Jamaica", "Costa Rica", "Belize", "Barbados", "Bahamas", "Aruba"],
  "South America": ["Peru", "Ecuador", "Colombia", "Chile", "Brazil", "Argentina"],
  Asia: ["Japan", "South Korea", "China", "Cambodia", "Laos", "Philippines", "Thailand", "Vietnam", "Malaysia", "Singapore", "Indonesia", "Sri Lanka", "Nepal", "Bhutan", "Maldives"],
  "Oceania & Pacific": ["Australia", "New Zealand", "Fiji", "French Polynesia"],
  "Africa & Middle East": ["South Africa", "Tanzania", "Kenya", "Morocco", "Jordan", "Egypt", "Mauritius", "United Arab Emirates", "Oman"],
};
const COUNTRY_ZONE = Object.fromEntries(Object.entries(WORLD_ZONES).flatMap(([zone, countries]) => countries.map((c) => [c, zone])));

export const indexOf = (t: TripIdea): IndexId => (t.currency === "USD" ? "world" : "india");

/** The zone a trip is counted in; null only for a trip the maps above don't cover. */
export function zoneOf(t: TripIdea): string | null {
  if (indexOf(t) === "india") return t.country === "India" ? (INDIA_ZONES[t.region] ?? null) : "Nearby abroad";
  return COUNTRY_ZONE[t.country] ?? null;
}

export interface IndexRow {
  slug: string;
  name: string;
  place: string;
  country: string;
  zone: string;
  days: number;
  /** Per person a day: backpacker, mid-range, luxury, in the index's currency. */
  low: number;
  mid: number;
  high: number;
  /** Mid-range for two people for the plan's length. */
  forTwo: number;
  months: number[];
  best: string;
  tags: TripIdea["tags"];
}

const rowOf = (t: TripIdea): IndexRow => ({
  slug: t.slug,
  name: t.name,
  place: placeLabel(t),
  country: t.country,
  zone: zoneOf(t) ?? "Other",
  days: t.days,
  low: t.budget[0],
  mid: t.budget[1],
  high: t.budget[2],
  forTwo: t.budget[1] * t.days * 2,
  months: t.months,
  best: monthsLabel(t.months),
  tags: t.tags,
});

export const indexRows = (id: IndexId) => TRIP_IDEAS.filter((t) => indexOf(t) === id).map(rowOf).sort((a, b) => a.mid - b.mid || a.name.localeCompare(b.name));

export function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Money in the index's own currency, rounded to a sensible step for a quoted figure. */
export function money(id: IndexId, n: number) {
  const step = id === "india" ? 50 : 5;
  const r = Math.round(n / step) * step;
  return id === "india" ? `₹${r.toLocaleString("en-IN")}` : `$${r.toLocaleString("en-US")}`;
}

export interface ZoneStat {
  zone: string;
  count: number;
  low: number;
  mid: number;
  high: number;
  cheapest: IndexRow;
  priciest: IndexRow;
}

/** For each zone: the median day at each level and its cheapest and priciest trip, cheapest zone first. */
export function zoneStats(id: IndexId): ZoneStat[] {
  const rows = indexRows(id);
  const zones = [...new Set(rows.map((r) => r.zone))];
  return zones
    .map((zone) => {
      const z = rows.filter((r) => r.zone === zone);
      return { zone, count: z.length, low: median(z.map((r) => r.low)), mid: median(z.map((r) => r.mid)), high: median(z.map((r) => r.high)), cheapest: z[0], priciest: z[z.length - 1] };
    })
    .sort((a, b) => a.mid - b.mid);
}

/** The cheapest trip in season each month, January first. */
export function bestValueByMonth(id: IndexId) {
  const rows = indexRows(id);
  return Array.from({ length: 12 }, (_, i) => rows.find((r) => r.months.includes(i + 1)) ?? null);
}

const ratio = (a: number, b: number) => {
  const r = a / b;
  return r >= 10 ? `${Math.round(r)}×` : `${r.toFixed(1).replace(/\.0$/, "")}×`;
};

/** "North India is India's best-value region", or both names when two zones share the lowest median. */
function tied(zones: ZoneStat[], low: number) {
  const best = zones.filter((z) => z.mid === low).map((z) => z.zone);
  return best.length === 1 ? `${best[0]} is India's best-value region` : `${best.slice(0, -1).join(", ")} and ${best[best.length - 1]} are India's best-value regions`;
}

/** The headline findings, as quotable sentences, generated from the data. */
export function findings(): string[] {
  const india = indexRows("india");
  const home = india.filter((r) => r.country === "India");
  const abroad = india.filter((r) => r.country !== "India");
  const world = indexRows("world");
  const iz = zoneStats("india").filter((z) => z.zone !== "Nearby abroad");
  const wz = zoneStats("world");
  const beach = (rows: IndexRow[]) => rows.find((r) => r.tags.includes("beach"));
  const per = (id: IndexId, r: IndexRow) => `${money(id, r.mid)} a day`;
  const out = [
    `A mid-range day in India costs a median of ${money("india", median(home.map((r) => r.mid)))} per person across ${home.length} trips; on the ${abroad.length} trips abroad from India it's ${money("india", median(abroad.map((r) => r.mid)))}.`,
    `The most affordable mid-range trip in India is ${home[0].name} (${per("india", home[0])}); the priciest is ${home[home.length - 1].name} (${per("india", home[home.length - 1])}), ${ratio(home[home.length - 1].mid, home[0].mid)} as much.`,
    `${tied(iz, iz[0].mid)} at a median ${money("india", iz[0].mid)} a day; ${iz[iz.length - 1].zone} is the most expensive at ${money("india", iz[iz.length - 1].mid)}.`,
    `The cheapest trip abroad from India is ${abroad[0].name}, at about ${per("india", abroad[0])} mid-range before flights.`,
    `Worldwide, the median mid-range day is ${money("world", median(world.map((r) => r.mid)))} per person; ${wz[0].zone} is the cheapest region (${money("world", wz[0].mid)}) and ${wz[wz.length - 1].zone} the priciest (${money("world", wz[wz.length - 1].mid)}).`,
    `The most expensive trip in the index is ${world[world.length - 1].name} at ${per("world", world[world.length - 1])} mid-range, ${ratio(world[world.length - 1].mid, world[0].mid)} the price of the cheapest worldwide trip, ${world[0].name} (${per("world", world[0])}).`,
  ];
  const ib = beach(home);
  const wb = beach(world);
  if (ib && wb) out.push(`The best-value beach trips are ${ib.name} in India (${per("india", ib)}) and ${wb.name} worldwide (${per("world", wb)}).`);
  out.push(`A typical 5-day mid-range trip for two costs about ${money("india", median(home.map((r) => r.mid)) * 10)} in India and ${money("world", median(world.map((r) => r.mid)) * 10)} worldwide, before getting there.`);
  return out;
}

/** The FAQ, answered from the data. */
export function indexFaqs() {
  const india = indexRows("india");
  const home = india.filter((r) => r.country === "India");
  const abroad = india.filter((r) => r.country !== "India");
  const world = indexRows("world");
  const cheapAbroad = abroad.slice(0, 3).map((r) => `${r.name} (${money("india", r.mid)} a day)`);
  const cheapWorld = world.slice(0, 3).map((r) => `${r.name} (${money("world", r.mid)} a day)`);
  return [
    { q: "What is the cheapest trip in India?", a: `In the GoRoam Trip Cost Index, ${home[0].name} is the cheapest mid-range trip in India at about ${money("india", home[0].mid)} per person a day, followed by ${home[1].name} and ${home[2].name}.` },
    { q: "What is the cheapest international trip from India?", a: `${cheapAbroad.join(", ")} are the cheapest trips abroad from India per day at mid-range, before flights.` },
    { q: "How much does a mid-range day of travel cost in India?", a: `A median of ${money("india", median(home.map((r) => r.mid)))} per person a day across ${home.length} trips, covering stay, food, local transport and entry fees.` },
    { q: "Where is the cheapest place to travel in the world?", a: `Of the ${world.length} worldwide trips in the index, the lowest mid-range daily costs are ${cheapWorld.join(", ")}.` },
    { q: "How is the Trip Cost Index calculated?", a: "Each figure is GoRoam's estimate of what one person spends a day on stay, food, local transport and entry fees, at backpacker, mid-range and luxury levels, from the research behind each trip guide. Getting to the destination is not included. Zone figures are medians." },
  ];
}

/** Both indexes as CSV, one row per trip. */
export function indexCsv() {
  const head = ["index", "currency", "trip", "place", "country", "zone", "days", "backpacker_per_day", "midrange_per_day", "luxury_per_day", "midrange_trip_for_two", "best_months", "url"];
  const esc = (v: string | number) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const lines = INDEXES.flatMap((ix) =>
    indexRows(ix.id).map((r) => [ix.label, ix.currency, r.name, r.place, r.country, r.zone, r.days, r.low, r.mid, r.high, r.forTwo, r.best, `https://www.goroam.world/trips/${r.slug}`].map(esc).join(","))
  );
  return [head.join(","), ...lines].join("\n");
}

/**
 * The trip's place in its index for the line on each trip page, by mid-range day:
 * "the 12th cheapest of the 100 worldwide trips", or counted from the top for the
 * dearer half. Trips on the same price share a place.
 */
export function rankSentence(t: TripIdea) {
  const id = indexOf(t);
  const rows = indexRows(id);
  const mid = t.budget[1];
  const joint = rows.filter((r) => r.mid === mid).length > 1 ? "joint " : "";
  const cheap = rows.filter((r) => r.mid < mid).length + 1;
  const dear = rows.filter((r) => r.mid > mid).length + 1;
  const nth = (n: number) => (n === 1 ? "" : `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th")} `);
  const place = cheap <= dear ? `the ${joint}${nth(cheap)}cheapest` : `the ${joint}${nth(dear)}priciest`;
  return `At ${price(t, mid)} a mid-range day, ${t.name} is ${place} of the ${rows.length} ${id === "world" ? "worldwide" : "India & nearby"} trips in the GoRoam Trip Cost Index.`;
}
