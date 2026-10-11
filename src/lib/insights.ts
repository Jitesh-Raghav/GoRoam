// Server-only: writes a trip's "intelligence" (crowds, eats, packing, transit, money, carbon) once.
import type OpenAI from "openai";
import { dayStops, type ItineraryData, type TripInsights } from "./trip";

export interface InsightsContext {
  destination: string;
  source?: string;
  startDate: string;
  numberOfDays: number;
  people: number;
  data: ItineraryData;
}

const str = (v: unknown, max = 240) => (typeof v === "string" ? v.replace(/\s+/g, " ").replace(/—/g, ",").trim().slice(0, max) : "");
const arr = (v: unknown) => (Array.isArray(v) ? v : []);

function prompt(ctx: InsightsContext) {
  const month = new Date(ctx.startDate).toLocaleString("en", { month: "long" });
  const days = ctx.data.itinerary
    .map((d, i) => `Day ${i + 1}${d.city ? ` (${d.city})` : ""}: ${dayStops(d).map((s) => s.activity.place.name).join("; ")}`)
    .join("\n");
  const prefs = ctx.data.trip?.preferences;
  return `Trip: ${ctx.numberOfDays} days in ${ctx.destination}, starting ${ctx.startDate} (${month}), ${ctx.people} travellers${ctx.source ? `, coming from ${ctx.source}` : ""}.
Diet: ${prefs?.diet?.join(", ") || "no restrictions"}. Companions: ${prefs?.companions ?? "unknown"}. Transport preference: ${prefs?.transport ?? "any"}.
Stops by day:
${days}

Return JSON with exactly these keys:
{
  "stops": { "<exact stop name>": { "crowd": "quiet|busy|packed", "quietest": "when it's calmest, under 40 chars", "closedOn": ["Monday"], "kids": true, "accessible": false, "photo": "the best photo spot there and when, under 90 chars" } },
  "eats": [ { "day": 1, "near": "<a stop that day>", "name": "real, well-known restaurant or street-food spot", "cuisine": "short", "price": 1-4, "veg": true, "rating": 4.5, "note": "what to order, under 80 chars" } ],
  "packing": [ { "item": "short", "why": "tied to ${month} weather or the activities, under 70 chars" } ],
  "dress": "what to wear at religious sites here, one or two sentences",
  "transit": [ { "mode": "metro card / auto-rickshaw / taxi / bus…", "cost": "typical fare with local currency", "tip": "under 90 chars" } ],
  "rideApps": ["apps that work there"],
  "money": { "tipping": "norms in one or two sentences", "bargaining": "where and how much, one or two sentences" },
  "carbon": { "totalKg": number, "parts": [ { "label": "Flights from ${ctx.source || "home"}", "kg": number }, { "label": "Getting around", "kg": number }, { "label": "Stays", "kg": number } ], "greener": ["3 practical lower-carbon swaps for this trip"] }
}
Rules: include every stop listed, using its exact name. 2 eats per day, real places only, ${prefs?.diet?.length ? "matching the diet" : "a mix of local favourites"}. 6-8 packing items. 3-5 transit options. Carbon in kg CO2e for the whole group, realistic. Only list closing days you are confident about; otherwise use []. No em dashes.`;
}

function tidy(raw: Record<string, unknown>, data: ItineraryData): TripInsights {
  const names = new Set(data.itinerary.flatMap((d) => dayStops(d).map((s) => s.activity.place.name.toLowerCase())));
  const stops: TripInsights["stops"] = {};
  for (const [k, v] of Object.entries((raw.stops as Record<string, Record<string, unknown>>) ?? {})) {
    const key = k.toLowerCase().trim();
    if (!names.has(key) || !v) continue;
    const crowd = ["quiet", "busy", "packed"].includes(String(v.crowd)) ? (v.crowd as "quiet" | "busy" | "packed") : undefined;
    stops[key] = {
      crowd,
      quietest: str(v.quietest, 60) || undefined,
      closedOn: arr(v.closedOn).map((d) => str(d, 12)).filter((d) => /^(mon|tue|wed|thu|fri|sat|sun)/i.test(d)),
      kids: typeof v.kids === "boolean" ? v.kids : undefined,
      accessible: typeof v.accessible === "boolean" ? v.accessible : undefined,
      photo: str(v.photo, 120) || undefined,
    };
  }
  const money = (raw.money ?? {}) as Record<string, unknown>;
  const carbon = (raw.carbon ?? {}) as Record<string, unknown>;
  const parts = arr(carbon.parts)
    .map((p: Record<string, unknown>) => ({ label: str(p.label, 40), kg: Math.max(0, Math.round(Number(p.kg) || 0)) }))
    .filter((p) => p.label && p.kg > 0)
    .slice(0, 5);
  return {
    stops,
    eats: arr(raw.eats)
      .map((e: Record<string, unknown>) => ({
        day: Math.max(1, Math.min(data.itinerary.length, Math.round(Number(e.day) || 1))),
        near: str(e.near, 80),
        name: str(e.name, 80),
        cuisine: str(e.cuisine, 40),
        price: Math.max(1, Math.min(4, Math.round(Number(e.price) || 2))) as 1 | 2 | 3 | 4,
        veg: !!e.veg,
        rating: Number(e.rating) > 0 && Number(e.rating) <= 5 ? Math.round(Number(e.rating) * 10) / 10 : undefined,
        note: str(e.note, 120),
      }))
      .filter((e) => e.name)
      .slice(0, data.itinerary.length * 3),
    packing: arr(raw.packing)
      .map((p: Record<string, unknown>) => ({ item: str(p.item, 40), why: str(p.why, 100) }))
      .filter((p) => p.item)
      .slice(0, 10),
    dress: str(raw.dress, 300) || undefined,
    transit: arr(raw.transit)
      .map((t: Record<string, unknown>) => ({ mode: str(t.mode, 40), cost: str(t.cost, 60), tip: str(t.tip, 140) }))
      .filter((t) => t.mode)
      .slice(0, 6),
    rideApps: arr(raw.rideApps).map((a) => str(a, 24)).filter(Boolean).slice(0, 5),
    money: { tipping: str(money.tipping, 300), bargaining: str(money.bargaining, 300) },
    carbon: {
      totalKg: Math.max(Math.round(Number(carbon.totalKg) || 0), parts.reduce((n, p) => n + p.kg, 0)),
      parts,
      greener: arr(carbon.greener).map((g) => str(g, 140)).filter(Boolean).slice(0, 4),
    },
  };
}

/** Canned insights for local development without an API key (GOROAM_FAKE_AI=1). */
export function fakeInsights(ctx: InsightsContext): TripInsights {
  const stops: TripInsights["stops"] = {};
  const crowds = ["quiet", "busy", "packed"] as const;
  ctx.data.itinerary.forEach((d) =>
    dayStops(d).forEach((s, i) => {
      stops[s.activity.place.name.toLowerCase()] = {
        crowd: crowds[i % 3],
        quietest: i % 2 ? "Weekday afternoons" : "Before 9 AM",
        closedOn: i === 1 ? ["Monday"] : [],
        kids: i !== 2,
        accessible: i === 0,
        photo: i === 0 ? "From the upper steps at golden hour, facing west" : undefined,
      };
    })
  );
  return {
    stops,
    eats: ctx.data.itinerary.flatMap((d, i) => [
      { day: i + 1, near: dayStops(d)[0]?.activity.place.name ?? ctx.destination, name: "Omen Ginkakuji", cuisine: "Udon", price: 2, veg: true, rating: 4.5, note: "The signature dipping udon with seasonal vegetables" },
      { day: i + 1, near: dayStops(d)[1]?.activity.place.name ?? ctx.destination, name: "Nishiki Market stalls", cuisine: "Street food", price: 1, veg: false, rating: 4.4, note: "Tamagoyaki on a stick and matcha soft serve" },
    ]) as TripInsights["eats"],
    packing: [
      { item: "Light rain jacket", why: "November showers come and go quickly" },
      { item: "Comfortable walking shoes", why: "Temple days run past 15,000 steps" },
      { item: "Warm layer", why: "Evenings drop to around 8°C" },
      { item: "Socks without holes", why: "Shoes come off at temples and ryokan" },
      { item: "Coin purse", why: "Shrines, lockers and vending machines take coins" },
      { item: "Power adapter (Type A)", why: "Japan uses flat two-pin plugs" },
    ],
    dress: "Cover shoulders and knees at temples and shrines, and remove shoes where you see a step up or slippers. Hats come off inside halls.",
    transit: [
      { mode: "ICOCA card", cost: "¥2,000 incl. ¥500 deposit", tip: "Tap on buses, subways and most convenience stores" },
      { mode: "City bus", cost: "¥230 flat fare", tip: "Board at the back, pay at the front when you get off" },
      { mode: "Taxi", cost: "¥500 flag fall", tip: "Doors open automatically; don't touch them" },
      { mode: "Bicycle rental", cost: "¥1,000 a day", tip: "The flattest, fastest way along the river" },
    ],
    rideApps: ["GO", "Uber", "DiDi"],
    money: { tipping: "Tipping isn't customary and can confuse; great service is the norm.", bargaining: "Prices are fixed almost everywhere; at flea markets a polite ask for a small discount is fine." },
    carbon: {
      totalKg: 1480,
      parts: [
        { label: `Flights from ${ctx.source || "home"}`, kg: 1290 },
        { label: "Getting around", kg: 48 },
        { label: "Stays", kg: 142 },
      ],
      greener: ["Take the Shinkansen instead of a domestic flight", "Use the bus and a day pass over taxis", "Pick a stay with a green certification"],
    },
  };
}

export async function generateInsights(openai: OpenAI, ctx: InsightsContext): Promise<TripInsights> {
  const completion = await openai.chat.completions.create(
    {
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a meticulous local travel researcher. Give specific, accurate, practical facts about real places. Never invent restaurants, closures or prices you are unsure of. Never use em dashes. Respond with valid JSON only.",
        },
        { role: "user", content: prompt(ctx) },
      ],
    },
    { timeout: 60000 }
  );
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No insights from the model");
  return tidy(JSON.parse(text), ctx.data);
}
