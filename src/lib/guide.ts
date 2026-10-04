import type OpenAI from "openai";
import { COMPANIONS, DIETS, VIBES, type ExperienceKind, type TipCategory, type TripGuide, type TripPreferences } from "./trip";
import { undash } from "./text";
import { findVideos } from "./videos";

/**
 * The local guide that rides along with every itinerary: phrases, food,
 * culture, souvenirs, events, tips, experiences and videos. It's written by a
 * second model call that runs beside the day plan, so it adds no wait.
 */

export interface GuideContext {
  destination: string;
  /** Where they're travelling from, for visa basics. */
  source?: string;
  startDate: string;
  numberOfDays: number;
  interests: string[];
  preferences?: TripPreferences;
}

const label = (options: { id: string; prompt: string }[], id: string) => options.find((o) => o.id === id)?.prompt ?? id;

export function buildGuidePrompt(ctx: GuideContext) {
  const month = new Date(`${ctx.startDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const p = ctx.preferences;
  const who = p ? `${label(COMPANIONS, p.companions)}${p.children ? ` with ${p.children} child${p.children === 1 ? "" : "ren"}` : ""}` : "travellers";
  const vibes = ctx.interests.map((i) => label(VIBES, i)).join("; ") || "a bit of everything";
  const diet = p?.diet.length ? p.diet.map((d) => label(DIETS, d)).join(", ") : "";

  return `Write a local guide for ${who} visiting ${ctx.destination} for ${ctx.numberOfDays} days from ${ctx.startDate} (${month}). They love: ${vibes}.${diet ? ` Dietary needs: ${diet}. Every dish must suit them.` : ""}

RULES
- Be specific to ${ctx.destination}, never generic travel advice.
- phrases: exactly 5 everyday phrases a visitor really uses (hello, thank you, how much, where is…, a local courtesy). "local" in the native script, "romanized" in Latin letters (omit if the language already uses Latin letters), "pronunciation" as a simple English sound-alike. If English is the local language, give 5 local slang expressions instead.
- languageCode: the BCP-47 tag for the main local language (e.g. "ja-JP", "hi-IN", "fr-FR"). language: its English name.
- etiquette: 3 dos and 3 don'ts that a respectful visitor should know about the local culture.
- food: 5 must-try dishes or drinks with a specific, real place to try each.${diet ? " Respect the dietary needs." : ""} "veg" true only if the dish is normally vegetarian.
- souvenirs: 5 things genuinely worth bringing home, where to buy them, and a realistic price range in USD.
- facts: 3 surprising, true facts about the place that would delight a traveller. Short title + one or two sentences.
- events: up to 4 festivals, events, seasonal happenings or sports fixtures that take place in or around ${month}. Only include ones you are confident recur at that time; say "usually" for dates. Empty array if none.
- tips: 6 practical tips and tricks for everyday travel there, one per category: money, transport, safety, timing, connectivity, etiquette.
- experiences: 6 bookable experiences and packages: at least 2 adventure activities, at least 1 sport (to play or to watch live), plus tours, classes or wellness that match their interests. "priceFrom" is a realistic per-person USD price.
- videoQueries: 4 YouTube search phrases that would find great videos about visiting ${ctx.destination} (a guide, a food tour, a walking tour, things to know).
- currencyCode: the ISO 4217 code of the local currency.
- health: tapWater (is tap water safe to drink, one short sentence), vaccines (commonly recommended vaccinations or "none beyond routine", ending with "check with a travel clinic"), pharmacy (the local word for pharmacy and how to spot one), note (one sentence on sun, altitude, air quality or mosquitoes if relevant, else empty).
- arrival: 2 or 3 ways to get from the main airport (or station, if there's no airport) into the centre, each with a realistic time, a cost and one tip.
- emergency: the local emergency phone numbers (police, ambulance, fire, a tourist police or helpline if one exists, and the general number like 112).
- scams: 3 common tourist scams or traps there and exactly how to avoid each.
- entry: ${ctx.source ? `entry and visa basics for someone travelling from ${ctx.source} (their nationality is likely that country's), in two short sentences, ending with a reminder to confirm on the official government site.` : 'general entry and visa basics in two short sentences, ending with a reminder to confirm on the official government site.'}${ctx.source ? ` "from" is the traveller's likely country.` : ''}

Respond with JSON only:
{
  "language": "Japanese",
  "languageCode": "ja-JP",
  "phrases": [{ "english": "Thank you", "local": "ありがとう", "romanized": "Arigatō", "pronunciation": "ah-ree-GAH-toh" }],
  "etiquette": { "dos": ["..."], "donts": ["..."] },
  "food": [{ "name": "Dish", "localName": "Native name", "what": "One vivid sentence", "whereToTry": "Real place, neighbourhood", "veg": false }],
  "souvenirs": [{ "name": "Item", "why": "One sentence", "where": "Where to buy", "priceRange": "$10–30" }],
  "facts": [{ "title": "Short title", "fact": "One or two sentences" }],
  "events": [{ "name": "Event", "when": "Usually mid-October", "what": "One sentence", "where": "Venue or area" }],
  "tips": [{ "category": "money", "tip": "One specific tip" }],
  "experiences": [{ "name": "Experience", "kind": "adventure", "duration": "4 hours", "priceFrom": 60, "why": "One sentence" }],
  "videoQueries": ["..."],
  "currencyCode": "JPY",
  "arrival": [{ "mode": "Airport express train", "time": "75 min", "cost": "$25", "tip": "One tip" }],
  "emergency": { "police": "110", "ambulance": "119", "fire": "119", "tourist": "050-3816-2787", "general": "" },
  "scams": [{ "name": "Scam", "avoid": "How to avoid it" }],
  "entry": { "summary": "Two short sentences.", "from": "India" },
  "health": { "tapWater": "Safe to drink everywhere.", "vaccines": "None beyond routine; check with a travel clinic.", "pharmacy": "Yakkyoku (薬局), look for a green cross.", "note": "" }
}`;
}

const TIP_CATEGORIES: TipCategory[] = ["money", "transport", "safety", "timing", "connectivity", "etiquette"];
const KINDS: ExperienceKind[] = ["adventure", "sport", "tour", "class", "wellness"];

const str = (v: unknown, max = 240) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") as Record<string, unknown>[] : []);
const strings = (v: unknown, n: number, max = 200) => (Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, n) : []);
const price = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : undefined;
};

/** Coerce whatever the model returned into a guide that's safe to render. */
export function tidyGuide(raw: unknown): TripGuide {
  const g = (raw && typeof raw === "object" ? undash(raw) : {}) as Record<string, unknown>;
  const etiquette = (g.etiquette && typeof g.etiquette === "object" ? g.etiquette : {}) as Record<string, unknown>;
  const code = str(g.languageCode, 20);
  return {
    language: str(g.language, 40) || undefined,
    languageCode: /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(code) ? code : undefined,
    phrases: list(g.phrases)
      .map((p) => ({ english: str(p.english, 80), local: str(p.local, 120), romanized: str(p.romanized, 120) || undefined, pronunciation: str(p.pronunciation, 120) || undefined }))
      .filter((p) => p.english && p.local)
      .slice(0, 5),
    etiquette: { dos: strings(etiquette.dos, 3), donts: strings(etiquette.donts, 3) },
    food: list(g.food)
      .map((f) => ({ name: str(f.name, 80), localName: str(f.localName, 80) || undefined, what: str(f.what), whereToTry: str(f.whereToTry, 120) || undefined, veg: f.veg === true }))
      .filter((f) => f.name && f.what)
      .slice(0, 6),
    souvenirs: list(g.souvenirs)
      .map((s) => ({ name: str(s.name, 80), why: str(s.why), where: str(s.where, 120) || undefined, priceRange: str(s.priceRange, 40) || undefined }))
      .filter((s) => s.name && s.why)
      .slice(0, 6),
    facts: list(g.facts)
      .map((f) => ({ title: str(f.title, 80), fact: str(f.fact, 320) }))
      .filter((f) => f.title && f.fact)
      .slice(0, 3),
    events: list(g.events)
      .map((e) => ({ name: str(e.name, 100), when: str(e.when, 80), what: str(e.what), where: str(e.where, 120) || undefined }))
      .filter((e) => e.name && e.when)
      .slice(0, 4),
    tips: list(g.tips)
      .map((t) => ({ category: TIP_CATEGORIES.includes(t.category as TipCategory) ? (t.category as TipCategory) : "timing", tip: str(t.tip) }))
      .filter((t) => t.tip)
      .slice(0, 8),
    experiences: list(g.experiences)
      .map((e) => ({
        name: str(e.name, 100),
        kind: KINDS.includes(e.kind as ExperienceKind) ? (e.kind as ExperienceKind) : "tour",
        duration: str(e.duration, 40) || undefined,
        priceFrom: price(e.priceFrom),
        why: str(e.why),
      }))
      .filter((e) => e.name && e.why)
      .slice(0, 8),
    videoQueries: strings(g.videoQueries, 4, 100),
    currencyCode: /^[A-Z]{3}$/.test(str(g.currencyCode, 3)) ? str(g.currencyCode, 3) : undefined,
    arrival: list(g.arrival)
      .map((a) => ({ mode: str(a.mode, 60), time: str(a.time, 30) || undefined, cost: str(a.cost, 30) || undefined, tip: str(a.tip, 200) || undefined }))
      .filter((a) => a.mode)
      .slice(0, 3),
    emergency: (() => {
      const e = (g.emergency && typeof g.emergency === "object" ? g.emergency : {}) as Record<string, unknown>;
      const num = (v: unknown) => (/^[\d\s+()-]{2,20}$/.test(str(v, 20)) ? str(v, 20) : undefined);
      const out = { police: num(e.police), ambulance: num(e.ambulance), fire: num(e.fire), tourist: num(e.tourist), general: num(e.general) };
      return Object.values(out).some(Boolean) ? out : undefined;
    })(),
    scams: list(g.scams)
      .map((x) => ({ name: str(x.name, 80), avoid: str(x.avoid, 240) }))
      .filter((x) => x.name && x.avoid)
      .slice(0, 4),
    health: (() => {
      const h = (g.health && typeof g.health === "object" ? g.health : {}) as Record<string, unknown>;
      const out = { tapWater: str(h.tapWater, 200) || undefined, vaccines: str(h.vaccines, 240) || undefined, pharmacy: str(h.pharmacy, 160) || undefined, note: str(h.note, 240) || undefined };
      return Object.values(out).some(Boolean) ? out : undefined;
    })(),
    entry: (() => {
      const e = (g.entry && typeof g.entry === "object" ? g.entry : {}) as Record<string, unknown>;
      const summary = str(e.summary, 360);
      return summary ? { summary, from: str(e.from, 60) || undefined } : undefined;
    })(),
  };
}

/** Writes the guide (and looks up videos) for one trip. Throws when the model fails. */
export async function generateGuide(openai: OpenAI, ctx: GuideContext): Promise<TripGuide> {
  const completion = await openai.chat.completions.create(
    {
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a well-travelled local host. You give accurate, specific, culturally respectful advice about real places, real dishes and real customs. Never invent events or facts you are unsure of. Never use em dashes (—); use commas, colons or full stops instead. Always respond with valid JSON only.",
        },
        { role: "user", content: buildGuidePrompt(ctx) },
      ],
    },
    { timeout: 60000 }
  );
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No guide from the model");
  const guide = tidyGuide(JSON.parse(text));
  const videos = await findVideos(ctx.destination).catch(() => []);
  if (videos.length) guide.videos = videos;
  return guide;
}
