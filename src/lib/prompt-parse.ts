import { KNOWN_PLACES } from "./booking";
import { titleCase, type Companions } from "./trip";

/**
 * Reads a free-form trip description ("7 days in Japan in October with my
 * partner, love food and hikes") and pulls out what the planner form can use.
 * It's deliberately conservative: anything it isn't sure about is left for the
 * traveller to fill in, and the whole text always travels along as notes so
 * the AI sees every nuance.
 */
export interface ParsedPrompt {
  destination?: string;
  days?: number;
  month?: string;
  startDate?: string;
  budget?: number;
  companions?: Companions;
  interests: string[];
  diet: string[];
  notes: string;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_SHORT = MONTHS.map((m) => m.slice(0, 3));

// Places travellers often name that aren't airports.
const EXTRA_PLACES = [
  "machu picchu", "angkor wat", "hallstatt", "amalfi", "amalfi coast", "tuscany", "provence", "patagonia", "lapland", "maui",
  "yosemite", "banff", "swiss alps", "scotland", "norway", "finland", "sweden", "vietnam", "andaman", "rajasthan", "himachal",
  "manali", "spiti", "rishikesh", "munnar", "coorg", "ooty", "meghalaya", "sikkim", "darjeeling", "hampi", "pondicherry",
  "gokarna", "jaisalmer", "jodhpur", "kashmir", "andalusia", "cappadocia", "petra", "jordan", "sahara", "dolomites", "lake como",
  "cinque terre", "bavaria", "the alps", "alps", "iceland", "greenland", "tasmania", "fiji", "maldives", "seychelles", "bhutan",
  "tibet", "mongolia", "georgia", "croatia", "dubrovnik", "montenegro", "slovenia", "malta", "cyprus", "sicily", "sardinia",
  "corsica", "crete", "mykonos", "santorini", "bali", "lombok", "phuket", "krabi", "chiang mai", "luang prabang", "hoi an",
  "ha long bay", "kyoto", "hokkaido", "okinawa", "jeju", "taiwan", "cuba", "costa rica", "galapagos", "yucatan", "tulum",
];

const PLACES = Array.from(new Set([...KNOWN_PLACES, ...EXTRA_PLACES])).sort((a, b) => b.length - a.length);

// Phrases that map onto the planner's interest ids.
const VIBE_WORDS: [string, RegExp][] = [
  ["food", /\b(food|foodie|seafood|dining|eat|eating|cuisine|restaurants?|caf[eé]s?|coffee|street food|markets?|wine|tasting)\b/],
  ["outdoors", /\b(hik(e|es|ing)|treks?|trekking|nature|national parks?|mountains?|outdoors?|waterfalls?|lakes?|forests?|viewpoints?|camping)\b/],
  ["art", /\b(art|museums?|galler(y|ies)|architecture|design)\b/],
  ["history", /\b(histor(y|ic|ical)|heritage|temples?|castles?|ruins|old town|forts?|palaces?)\b/],
  ["beach", /\b(beach(es)?|sea|ocean|swim(ming)?|island|snorkel(l)?ing|coast)\b/],
  ["nightlife", /\b(nightlife|bars?|clubs?|clubbing|party|parties|live music|cocktails?)\b/],
  ["shopping", /\b(shop(ping)?|boutiques?|bazaars?|souvenirs?)\b/],
  ["wellness", /\b(spa|relax(ing|ed)?|wellness|yoga|slow|unwind|retreat|onsen)\b/],
  ["thrills", /\b(adventure|adrenaline|thrill(s|ing)?|div(e|ing)|surf(ing)?|rafting|paraglid(e|ing)|bungee|ski(ing)?|safari)\b/],
  ["photo", /\b(photo(s|graphy)?|instagram(mable)?|sunsets?|sunrises?|views)\b/],
  ["hidden", /\b(hidden gems?|off the beaten|avoid(ing)? (the )?crowds|less touristy|locals?|quiet|authentic)\b/],
  ["landmarks", /\b(landmarks?|iconic|must[- ]sees?|famous|highlights|first time|sightseeing)\b/],
];

const DIET_WORDS: [string, RegExp][] = [
  ["vegan", /\bvegan\b/],
  ["vegetarian", /\b(vegetarian|veggie|veg only|pure veg)\b/],
  ["halal", /\bhalal\b/],
  ["kosher", /\bkosher\b/],
  ["gluten-free", /\b(gluten[- ]free|coeliac|celiac)\b/],
  ["no-alcohol", /\b(no alcohol|don'?t drink|teetotal|sober)\b/],
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fourteen: 14, fifteen: 15, twenty: 20,
};

const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : NUMBER_WORDS[s] ?? NaN);

function findDays(t: string): number | undefined {
  let m = t.match(/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen|fifteen|twenty)[\s-]*(days?|nights?)\b/);
  if (m) {
    const n = num(m[1]);
    if (Number.isFinite(n)) return Math.max(1, Math.min(30, m[2].startsWith("night") ? n + 1 : n));
  }
  m = t.match(/\b(\d{1,2}|a|an|one|two|three|four)[\s-]*weeks?\b/);
  if (m) {
    const n = num(m[1]);
    if (Number.isFinite(n)) return Math.min(30, n * 7);
  }
  if (/\bfortnight\b/.test(t)) return 14;
  if (/\b(long )?weekend\b/.test(t)) return /\blong weekend\b/.test(t) ? 3 : 2;
  return undefined;
}

function findMonth(t: string): number | undefined {
  for (let i = 0; i < 12; i++) {
    if (new RegExp(`\\b(${MONTHS[i]}|${MONTH_SHORT[i]})\\b`).test(t)) {
      // "may" is also a verb — only accept it after in/during/this/next/early/mid/late.
      if (i === 4 && !/\b(in|during|this|next|early|mid|late|end of)\s+may\b/.test(t)) continue;
      return i;
    }
  }
  return undefined;
}

/** The next start date in that month: a week out if it's this month, else the 1st. */
function startFor(month: number, now = new Date()) {
  const y = now.getFullYear();
  if (month === now.getMonth()) {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d;
  }
  return new Date(month > now.getMonth() ? y : y + 1, month, 1);
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function findBudget(t: string): number | undefined {
  const m = t.match(/(?:\$|usd\s?)\s?(\d[\d,]*(?:\.\d+)?)\s?(k)?\b|\b(\d[\d,]*)\s?(k)?\s?(?:usd|dollars|bucks)\b/);
  if (!m) return undefined;
  const raw = Number((m[1] ?? m[3]).replace(/,/g, ""));
  const v = Math.round(raw * ((m[2] ?? m[4]) ? 1000 : 1));
  return v >= 100 && v <= 200000 ? v : undefined;
}

function findCompanions(t: string): Companions | undefined {
  if (/\b(kids?|children|child|family|toddlers?|parents|my mum|my mom|my dad)\b/.test(t)) return "family";
  if (/\b(friends|mates|group|buddies|squad|bachelor(ette)?|gang)\b/.test(t)) return "friends";
  if (/\b(honeymoon|anniversary|my (wife|husband|partner|girlfriend|boyfriend|fianc[eé]e?)|couple|the two of us|romantic)\b/.test(t)) return "couple";
  if (/\b(solo|alone|by myself|on my own|just me)\b/.test(t)) return "solo";
  return undefined;
}

// Place names that are also everyday English words.
const AMBIGUOUS = new Set(["nice", "male", "georgia", "jordan", "turkey", "china"]);

function findPlace(raw: string, t: string): string | undefined {
  const padded = ` ${t.replace(/[^a-z0-9' ]+/g, " ")} `;
  // Every known place mentioned, scored by what precedes it: "to Kyoto" beats "from Mumbai".
  const hits: { p: string; at: number; score: number }[] = [];
  for (const p of PLACES) {
    if (p.length < 3) continue;
    let at = padded.indexOf(` ${p} `);
    while (at !== -1) {
      if (!hits.some((h) => at >= h.at && at < h.at + h.p.length)) {
        const before = padded.slice(Math.max(0, at - 16), at);
        let score = 1;
        if (/\b(to|in|visit|visiting|explore|around|across|of)\s*$/.test(before)) score = 3;
        else if (/\bfrom\s*$/.test(before)) score = 0;
        if (AMBIGUOUS.has(p) && score < 3) score = 0;
        hits.push({ p, at, score });
      }
      at = padded.indexOf(` ${p} `, at + 1);
    }
  }
  const best = hits.filter((h) => h.score > 0).sort((a, b) => b.score - a.score || a.at - b.at)[0];
  if (best) return titleCase(best.p);
  // Fall back to a capitalised place after "to" / "in" / "visit" ("trip to Hallstatt").
  const m = raw.match(/\b(?:to|in|visit(?:ing)?|around|across|explore)\s+((?:[A-Z][\p{L}'’.-]+)(?:\s+(?:[A-Z][\p{L}'’.-]+|de|del|la|di|da)){0,3})/u);
  if (m) {
    const words = m[1].split(/\s+/);
    if (!words.some((w) => MONTHS.includes(w.toLowerCase()) || MONTH_SHORT.includes(w.toLowerCase()))) return m[1];
  }
  return undefined;
}

export function parseTripPrompt(text: string, now = new Date()): ParsedPrompt {
  const raw = text.replace(/\s+/g, " ").trim();
  const t = raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const month = findMonth(t);
  const interests = VIBE_WORDS.filter(([, re]) => re.test(t))
    .map(([id]) => id)
    .slice(0, 5);
  return {
    destination: findPlace(raw, t),
    days: findDays(t),
    month: month === undefined ? undefined : titleCase(MONTHS[month]),
    startDate: month === undefined ? undefined : iso(startFor(month, now)),
    budget: findBudget(t),
    companions: findCompanions(t),
    interests,
    diet: DIET_WORDS.filter(([, re]) => re.test(t)).map(([id]) => id),
    notes: raw.slice(0, 400),
  };
}

/** Where the hero's prompt sends the traveller: the planner, pre-filled. */
export function plannerHref(p: ParsedPrompt) {
  const q = new URLSearchParams();
  if (p.destination) q.set("destination", p.destination);
  if (p.days) q.set("days", String(p.days));
  if (p.budget) q.set("budget", String(p.budget));
  if (p.startDate) q.set("start", p.startDate);
  if (p.companions) q.set("with", p.companions);
  if (p.interests.length) q.set("vibes", p.interests.join(","));
  if (p.diet.length) q.set("diet", p.diet.join(","));
  if (p.notes) q.set("notes", p.notes);
  const s = q.toString();
  return s ? `/dashboard?${s}` : "/dashboard";
}
