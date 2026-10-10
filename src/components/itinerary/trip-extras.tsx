"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, Car, Clock3, Footprints, Info, Landmark, PlaneLanding, Sparkles, Sun, Sunrise, Ticket, TrainFront } from "@/components/site/icons";
import { useEffect, useMemo, useState } from "react";
import type { DayWeather } from "@/app/api/weather/route";
import type { Holiday } from "@/app/api/holidays/route";
import type { ActivitySlot, DayItinerary, TripGuide } from "@/lib/trip";
import { cn } from "@/lib/utils";

/*
 * The small, practical layer of the trip page: how far it is from one stop to
 * the next, what each stop needs you to know, how full the day is, when the
 * sun rises and sets, and which days are public holidays. Every piece hides
 * itself when its data is missing, so older trips simply show less.
 */

const ease = [0.16, 1, 0.3, 1] as const;

type Transport = "transit" | "rides" | "car" | undefined;

const located = (a?: ActivitySlot) => {
  const { lat, lng } = a?.place ?? {};
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) && Math.abs(lat!) <= 90 && Math.abs(lng!) <= 180 ? ([lat!, lng!] as const) : null;
};

/** Great-circle distance in km. */
function haversine([lat1, lng1]: readonly [number, number], [lat2, lng2]: readonly [number, number]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

const roundMins = (m: number) => (m < 10 ? Math.max(1, Math.round(m)) : Math.round(m / 5) * 5);

export interface Leg {
  /** Along the streets, roughly (straight line × 1.3). */
  km: number;
  mins: number;
  mode: "walk" | "transit" | "ride" | "drive";
  label: string;
  directions: string;
}

/** How to get from one stop to the next, estimated from their coordinates. */
export function legBetween(a: ActivitySlot, b: ActivitySlot, transport: Transport): Leg | null {
  const from = located(a);
  const to = located(b);
  if (!from || !to) return null;
  const straight = haversine(from, to);
  // Coordinates more than 60 km apart on the same day are more likely a slip than a plan.
  if (straight > 60) return null;
  const km = Math.max(0.1, straight * 1.3);
  let mode: Leg["mode"];
  let mins: number;
  if (km <= 1.6) {
    mode = "walk";
    mins = km * 13;
  } else if (transport === "car") {
    mode = "drive";
    mins = km * 2.2 + 6;
  } else if (transport === "rides") {
    mode = "ride";
    mins = km * 2.4 + 6;
  } else {
    mode = "transit";
    mins = km * 2.6 + 10;
  }
  const m = roundMins(mins);
  const label = mode === "walk" ? `${m} min walk` : mode === "drive" ? `~${m} min drive` : mode === "ride" ? `~${m} min by taxi` : `~${m} min by metro or taxi`;
  const travelmode = mode === "walk" ? "walking" : mode === "transit" ? "transit" : "driving";
  const directions = `https://www.google.com/maps/dir/?api=1&origin=${from.join(",")}&destination=${to.join(",")}&travelmode=${travelmode}`;
  return { km, mins: m, mode, label, directions };
}

const km = (n: number) => (n < 1 ? `${Math.round(n * 1000 / 50) * 50} m` : `${n.toFixed(n < 10 ? 1 : 0)} km`);

/** The dashed stretch between two stop cards: distance, time and a directions link. */
export function StopConnector({ leg }: { leg: Leg }) {
  const Icon = leg.mode === "walk" ? Footprints : leg.mode === "transit" ? TrainFront : Car;
  return (
    <li aria-label={`Next stop: ${km(leg.km)}, ${leg.label}`} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2.5 pb-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5">
      <div className="relative flex justify-center">
        <span aria-hidden className="absolute inset-y-[-1.25rem] w-px border-l border-dashed border-brand/35" />
        <span aria-hidden className="relative mt-1.5 grid size-6 place-items-center rounded-full bg-paper text-brand ring-1 ring-brand/25">
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-ink ring-1 ring-line">
          <span className="font-mono">{km(leg.km)}</span>
          <span className="h-3 w-px bg-line" />
          {leg.label}
        </span>
        <a
          href={leg.directions}
          target="_blank"
          rel="noreferrer"
          className="no-print inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-brand transition-colors hover:bg-brand-soft"
        >
          Directions <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </li>
  );
}

/** What a stop needs you to know before you go: hours, booking, timing, dress, access. */
export function StopFacts({ activity }: { activity: ActivitySlot }) {
  const facts = [
    activity.hours && { icon: Clock3, label: "Hours", text: activity.hours, tone: "plain" },
    activity.bookAhead && { icon: Ticket, label: "Book ahead", text: activity.bookAhead, tone: "warn" },
    activity.bestTime && { icon: Sun, label: "Best time", text: activity.bestTime, tone: "plain" },
    activity.wear && { icon: Sparkles, label: "Wear", text: activity.wear, tone: "plain" },
    activity.access && { icon: Footprints, label: "Access", text: activity.access, tone: "plain" },
  ].filter(Boolean) as { icon: typeof Clock3; label: string; text: string; tone: "plain" | "warn" }[];
  if (!facts.length) return null;
  return (
    <dl className="mt-4 grid gap-1.5">
      {facts.map((f) => (
        <div
          key={f.label}
          className={cn("flex min-w-0 items-start gap-2 rounded-2xl px-3 py-2 text-xs leading-snug", f.tone === "warn" ? "bg-sun-soft/70 text-ink ring-1 ring-sun/30" : "bg-paper-2/70 text-ink/85")}
        >
          <f.icon className={cn("mt-px size-3.5 shrink-0", f.tone === "warn" ? "text-sun" : "text-brand")} />
          <span className="min-w-0">
            <dt className="eyebrow inline text-[0.55rem] text-stone">{f.label} · </dt>
            <dd className="inline">{f.text}</dd>
          </span>
        </div>
      ))}
    </dl>
  );
}

/** "3 hours", "1.5 hrs", "90 minutes", "2-3 hours" → hours. */
function hoursIn(duration?: string) {
  if (!duration) return 0;
  const t = duration.toLowerCase();
  const nums = (t.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (!nums.length) return 0;
  const n = nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0];
  return /min/.test(t) && !/h(ou)?r/.test(t) ? n / 60 : n;
}

export interface DayLoad {
  level: "Easy" | "Moderate" | "Full";
  walkKm: number;
  hours: number;
  stops: number;
}

/** How full a day is: hours out, stops and the walking between them. */
export function dayLoad(day: DayItinerary, transport: Transport): DayLoad | null {
  const stops = [day.morning, day.afternoon, day.evening].filter((s) => s?.place?.name);
  if (!stops.length) return null;
  const hours = stops.reduce((s, a) => s + hoursIn(a.duration), 0);
  let walkKm = 0;
  for (let i = 1; i < stops.length; i++) {
    const leg = legBetween(stops[i - 1], stops[i], transport);
    if (leg?.mode === "walk") walkKm += leg.km;
  }
  // Walking inside big sights isn't in the legs; count a little for each.
  walkKm += stops.filter((s) => ["sight", "nature", "culture", "shopping"].includes(s.category ?? "")).length * 1.2;
  const level = hours >= 9 || walkKm >= 9 ? "Full" : hours <= 5.5 && walkKm < 5 ? "Easy" : "Moderate";
  return { level, walkKm, hours, stops: stops.length };
}

export function DayLoadChip({ load }: { load: DayLoad }) {
  const bars = load.level === "Easy" ? 1 : load.level === "Moderate" ? 2 : 3;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm text-ink ring-1 ring-line"
      title={`${load.stops} stops · about ${Math.round(load.hours)} hours out · roughly ${load.walkKm.toFixed(0)} km on foot`}
    >
      <span aria-hidden className="flex items-end gap-[2px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("w-[3px] rounded-full", i < bars ? (bars === 3 ? "bg-sun" : "bg-brand") : "bg-line")} style={{ height: 6 + i * 3 }} />
        ))}
      </span>
      {load.level} day
      <span className="text-xs text-stone">
        ~{load.walkKm.toFixed(0)} km on foot
      </span>
    </span>
  );
}

/** "06:24" → "6:24 AM" (or 24h where that's the local habit). */
function clock(hhmm: string, offsetMin = 0) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m + offsetMin));
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(d);
  } catch {
    return hhmm;
  }
}

const uvLabel = (uv: number) => (uv >= 11 ? "extreme" : uv >= 8 ? "very high" : uv >= 6 ? "high" : uv >= 3 ? "moderate" : "low");

/** Sunrise, sunset, the golden hour before it, and the UV peak. */
export function Daylight({ day }: { day?: DayWeather }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready || !day?.sunrise || !day.sunset) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/80 px-3.5 py-2 text-sm text-ink ring-1 ring-line">
      <span className="inline-flex items-center gap-1.5" title="Sunrise">
        <Sunrise className="size-4 text-sun" /> {clock(day.sunrise)}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Golden hour starts about 45 minutes before sunset">
        <span aria-hidden className="size-2 rounded-full bg-gradient-to-br from-sun-2 to-sun" />
        Golden {clock(day.sunset, -45)}
      </span>
      <span className="inline-flex items-center gap-1.5 text-stone" title="Sunset">
        Sunset {clock(day.sunset)}
      </span>
      {day.uv !== undefined && day.uv >= 3 && (
        <span className={cn("inline-flex items-center gap-1 text-xs", day.uv >= 6 ? "text-sun" : "text-stone")} title="Peak UV index: sunscreen and a hat above 6">
          <Sun className="size-3.5" /> UV {day.uv} {uvLabel(day.uv)}
        </span>
      )}
    </span>
  );
}

const asked = new Map<string, Promise<Holiday[]>>();

/** The destination's public holidays during the trip, by date. */
export function useHolidays(country: string | null | undefined, start: string, days: number) {
  const [list, setList] = useState<Holiday[]>([]);
  const from = start.slice(0, 10);
  const to = useMemo(() => {
    const d = new Date(`${from}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + Math.max(days - 1, 0));
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }, [from, days]);
  useEffect(() => {
    if (!country || !/^[a-z]{2}$/i.test(country) || !to) return;
    const key = `country=${country.toLowerCase()}&from=${from}&to=${to}`;
    let hit = asked.get(key);
    if (!hit) {
      hit = fetch(`/api/holidays?${key}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (Array.isArray(d?.holidays) ? (d.holidays as Holiday[]) : []))
        .catch(() => []);
      asked.set(key, hit);
    }
    let live = true;
    hit.then((h) => live && setList(h));
    return () => {
      live = false;
    };
  }, [country, from, to]);
  return useMemo(() => {
    const byDate = new Map<string, Holiday[]>();
    for (const h of list) byDate.set(h.date, [...(byDate.get(h.date) ?? []), h]);
    return byDate;
  }, [list]);
}

/** A note on a day that falls on a public holiday. */
export function HolidayNote({ holidays }: { holidays?: Holiday[] }) {
  if (!holidays?.length) return null;
  const h = holidays[0];
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="mt-4 flex max-w-xl items-start gap-3 rounded-2xl bg-sun-soft/60 p-3.5 text-sm leading-relaxed text-ink ring-1 ring-sun/25"
    >
      <Landmark className="mt-0.5 size-4 shrink-0 text-sun" />
      <span>
        <span className="font-medium">
          {h.name}
          {h.localName ? ` (${h.localName})` : ""}
        </span>
        {h.nationwide ? " · public holiday." : " · a regional holiday in parts of the country."} Expect busier sights and transport; banks, offices and some shops close, and museums may keep different hours.
      </span>
    </motion.p>
  );
}

/** Day 1: how to get from the airport (or station) into town. */
export function ArrivalPanel({ arrival }: { arrival?: TripGuide["arrival"] }) {
  if (!arrival?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="print-avoid mt-6 overflow-hidden rounded-[26px] bg-ink text-paper"
    >
      <div className="flex items-center gap-3 px-5 pt-5 sm:px-6">
        <span className="grid size-10 place-items-center rounded-2xl bg-paper/10 text-brand-2">
          <PlaneLanding className="size-5" />
        </span>
        <div>
          <p className="eyebrow text-[0.6rem] text-paper/60">Arriving</p>
          <p className="text-paper">Getting into town</p>
        </div>
      </div>
      <ul className={cn("mt-4 grid gap-px bg-paper/10", arrival.length === 3 ? "sm:grid-cols-3" : arrival.length === 2 ? "sm:grid-cols-2" : "")}>
        {arrival.map((a) => (
          <li key={a.mode} className="bg-ink px-5 py-4 sm:px-6">
            <p className="text-paper">{a.mode}</p>
            <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-paper/70">
              {a.time && (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5 text-brand-2" /> {a.time}
                </span>
              )}
              {a.cost && <span>{a.cost}</span>}
            </p>
            {a.tip && <p className="mt-2 text-xs leading-relaxed text-paper/60">{a.tip}</p>}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/** The honest small print under a trip's numbers. */
export function PriceDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[11px] leading-relaxed text-stone", className)}>
      <Info className="mt-px size-3.5 shrink-0" />
      Prices are estimates for {new Date().getFullYear()} from published rates; confirm on the official site before you go.
    </p>
  );
}

/** A stop whose price looked off: ask the traveller to check rather than state it. */
export function CheckPrice() {
  return (
    <span className="inline-flex items-center gap-1" title="This estimate looked unusually high, so check the official price">
      <AlertCircle className="size-3.5 text-sun" /> Check price
    </span>
  );
}
