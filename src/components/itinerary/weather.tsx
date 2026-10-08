"use client";

import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, Umbrella, type LucideIcon } from "@/components/site/icons";
import { useEffect, useMemo, useState } from "react";
import type { DayWeather, TripWeather } from "@/app/api/weather/route";
import type { DayItinerary } from "@/lib/trip";
import { cn } from "@/lib/utils";

/** WMO weather codes, grouped into what a traveller cares about. */
export function weatherInfo(code: number): { label: string; icon: LucideIcon } {
  if (code === 0) return { label: "Clear", icon: Sun };
  if (code <= 2) return { label: "Partly cloudy", icon: CloudSun };
  if (code === 3) return { label: "Overcast", icon: Cloud };
  if (code === 45 || code === 48) return { label: "Fog", icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: CloudDrizzle };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Rain", icon: CloudRain };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: "Snow", icon: CloudSnow };
  if (code >= 95) return { label: "Thunderstorms", icon: CloudLightning };
  return { label: "Mixed", icon: CloudSun };
}

const prefersFahrenheit = () => typeof navigator !== "undefined" && /-(US|LR|MM)$/i.test(navigator.language);
export const temp = (c: number, f: boolean) => `${Math.round(f ? (c * 9) / 5 + 32 : c)}°`;

/** The centre of the trip's stops: good enough for a city's weather. */
export function tripCentre(days: DayItinerary[]): [number, number] | null {
  const pts: [number, number][] = [];
  for (const d of days) {
    for (const s of [d.morning, d.afternoon, d.evening]) {
      const { lat, lng } = s?.place ?? {};
      if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) && Math.abs(lat!) <= 90 && Math.abs(lng!) <= 180) pts.push([lat!, lng!]);
    }
  }
  if (!pts.length) return null;
  // Median rather than mean, so one stray coordinate can't drag the centre away.
  const mid = (xs: number[]) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  return [mid(pts.map((p) => p[0])), mid(pts.map((p) => p[1]))];
}

const asked = new Map<string, Promise<TripWeather | null>>();

export function useTripWeather(centre: [number, number] | null, start: string, days: number) {
  const [weather, setWeather] = useState<TripWeather | null>(null);
  const key = centre ? `lat=${centre[0].toFixed(3)}&lng=${centre[1].toFixed(3)}&start=${start.slice(0, 10)}&days=${days}` : null;
  useEffect(() => {
    if (!key) return;
    let live = true;
    let hit = asked.get(key);
    if (!hit) {
      hit = fetch(`/api/weather?${key}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      asked.set(key, hit);
      hit.then((w) => !w && asked.delete(key));
    }
    hit.then((w) => live && setWeather(w));
    return () => {
      live = false;
    };
  }, [key]);
  const byDate = useMemo(() => new Map((weather?.days ?? []).map((d) => [d.date, d])), [weather]);
  return { weather, byDate };
}

/** "☀ 24° / 15°" for a day tab. */
export function WeatherChip({ day, className, tone = "light" }: { day?: DayWeather; className?: string; tone?: "light" | "dark" }) {
  const [f, setF] = useState(false);
  useEffect(() => setF(prefersFahrenheit()), []);
  if (!day) return null;
  const { label, icon: Icon } = weatherInfo(day.code);
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[11px]", tone === "dark" ? "text-paper/85" : "text-ink/80", className)} title={`${label}${day.source === "forecast" ? "" : day.source === "last-year" ? " (last year on this date)" : " (recorded)"}`}>
      <Icon className={cn("size-3.5", tone === "dark" ? "text-sun-2" : "text-brand")} />
      {temp(day.max, f)}
      <span className="opacity-60">/{temp(day.min, f)}</span>
    </span>
  );
}

/** The fuller forecast line in a day's header. */
export function DayForecast({ day }: { day?: DayWeather }) {
  const [f, setF] = useState(false);
  useEffect(() => setF(prefersFahrenheit()), []);
  if (!day) return null;
  const { label, icon: Icon } = weatherInfo(day.code);
  const wet = day.source === "forecast" ? (day.rain ?? 0) >= 40 : (day.rain ?? 0) >= 2;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm text-ink ring-1 ring-line" title={day.source === "forecast" ? "Live forecast" : day.source === "last-year" ? "What these dates were like last year" : "Recorded weather"}>
      <Icon className="size-4 text-brand" />
      <span>
        {label} · {temp(day.max, f)}
        <span className="text-stone">/{temp(day.min, f)}</span>
      </span>
      {wet && (
        <span className="inline-flex items-center gap-1 text-xs text-brand">
          <Umbrella className="size-3.5" />
          {day.source === "forecast" ? `${day.rain}%` : "pack a brolly"}
        </span>
      )}
      {day.source !== "forecast" && <span className="hidden text-[10px] uppercase tracking-wider text-stone sm:inline">{day.source === "last-year" ? "typical" : "recorded"}</span>}
    </span>
  );
}

/** The destination's clock, and how far it is from the traveller's. */
export function useLocalTime(timezone: string | null | undefined) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!timezone) return;
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, [timezone]);
  if (!timezone || !now) return null;
  try {
    const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(now);
    // Offset between the destination's wall clock and ours, in minutes.
    const wall = (tz?: string) => {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(now);
      const v = (t: string) => Number(p.find((x) => x.type === t)?.value);
      return Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
    };
    const diff = Math.round((wall(timezone) - wall()) / 60000);
    const h = Math.floor(Math.abs(diff) / 60);
    const m = Math.abs(diff) % 60;
    const span = `${h ? `${h}h` : ""}${m ? `${h ? " " : ""}${m}m` : ""}`;
    const relative = diff === 0 ? "Same time as you" : `${span} ${diff > 0 ? "ahead of" : "behind"} you`;
    return { time, relative, city: timezone.split("/").pop()?.replace(/_/g, " ") };
  } catch {
    return null;
  }
}

/** Every day of the trip at a glance: the forecast, or last year's weather further out. */
export function WeatherOutlook({ days, className }: { days: DayWeather[]; className?: string }) {
  const [f, setF] = useState(false);
  useEffect(() => setF(prefersFahrenheit()), []);
  if (!days.length) return null;
  const sources = new Set(days.map((d) => d.source));
  const note = sources.has("forecast") && sources.size === 1 ? "Live forecast" : sources.has("forecast") ? "Live forecast, then last year's weather for later days" : sources.has("last-year") ? "Too far out for a forecast: this is what these dates were like last year" : "Recorded weather";
  const hot = Math.max(...days.map((d) => d.max));
  const cold = Math.min(...days.map((d) => d.min));
  const span = Math.max(hot - cold, 1);
  return (
    <div className={cn("glass print-avoid rounded-[24px] p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <CloudSun className="size-5" />
        </span>
        <span className="max-w-[60%] text-right text-[11px] leading-snug text-stone">{note}</span>
      </div>
      <p className="eyebrow mt-4 text-[0.6rem] text-stone">Weather, day by day</p>
      <ul className="mt-3 space-y-1.5">
        {days.map((d, i) => {
          const { label, icon: Icon } = weatherInfo(d.code);
          const wet = d.source === "forecast" ? (d.rain ?? 0) >= 40 : (d.rain ?? 0) >= 2;
          return (
            <li key={d.date} className="grid grid-cols-[3.5rem_1.25rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
              <span className="font-mono text-[11px] text-stone">
                D{i + 1} <span className="opacity-70">{new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}</span>
              </span>
              <Icon className="size-4 text-brand" aria-label={label} />
              {/* Each day's range drawn on the trip's overall temperature scale. */}
              <span className="relative h-1.5 rounded-full bg-paper-2">
                <span
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand-2 to-sun"
                  style={{ left: `${((d.min - cold) / span) * 100}%`, right: `${((hot - d.max) / span) * 100}%` }}
                />
              </span>
              <span className="w-24 text-right font-mono text-xs text-ink">
                {temp(d.min, f)} / {temp(d.max, f)}
                {wet && <Umbrella className="ml-1 inline size-3 text-brand" aria-label="Rain likely" />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
