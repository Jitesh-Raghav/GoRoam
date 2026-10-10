"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BedDouble,
  CalendarPlus,
  Clock3,
  CloudSun,
  Flower2,
  HandCoins,
  Landmark,
  Languages,
  Lightbulb,
  MapPin,
  Martini,
  MessageSquareQuote,
  Moon,
  Mountain,
  Palette,
  Plug,
  Printer,
  Repeat,
  Route,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunrise,
  Ticket,
  TramFront,
  TreePine,
  UtensilsCrossed,
  Wand2,
  ArrowRightLeft,
  Map as MapIcon,
} from "@/components/site/icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Scene } from "@/components/scenes/scene";
import { SCENES } from "@/components/scenes/scenes";
import { BoardingPass } from "@/components/dashboard/boarding-pass";
import { PhotoPanel } from "@/components/site/photo-panel";
import { PillLink } from "@/components/site/pill";
import { cityOf, dayRouteUrl, isoDay, mapsSearchUrl, stayPartners, ticketsFor, type BookingQuery } from "@/lib/booking";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { useDestinationPhoto } from "@/lib/use-destination-photo";
import { downloadIcs } from "@/lib/ics";
import {
  COMPANIONS,
  PACES,
  SPEND,
  STAYS,
  VIBES,
  labelFor,
  money,
  titleCase,
  type ActivitySlot,
  type DayItinerary,
  type Essentials,
  type ItineraryDetails,
  type PlacePhoto as PlacePhotoData,
  type StaySuggestion,
} from "@/lib/trip";
import { cn } from "@/lib/utils";
import { countryCodeFor } from "@/lib/flags";
import { BigMoments, pairMoments } from "./big-moments";
import { BookingPanel } from "./booking-panel";
import { Checklist } from "./checklist";
import { track } from "@/lib/analytics";
import { hasMapsKey, locatedStops } from "@/lib/maps";
import { Concierge } from "./concierge";
import { EmailButton } from "./email-button";
import { ExportMenu, type ExportItem } from "./export-menu";
import { Experiences } from "./guide/experiences";
import { Flag } from "./guide/flag";
import { GuidePending } from "./guide/guide-pending";
import { LocalGuide } from "./guide/local-guide";
import { CoolFacts, Events } from "./guide/moments";
import { SectionTitle } from "./guide/section-title";
import { Band } from "./band";
import { ChapterNav, type Chapter } from "./chapter-nav";
import { useGuide } from "./guide/use-guide";
import { Videos } from "./guide/videos";
import { HeroPhoto } from "./hero-photo";
import { Bookings } from "./bookings";
import { CurrencyCard } from "./currency-card";
import { JetLagCard } from "./jetlag-card";
import { ReactionsProvider, StopReactions, useReactions } from "./reactions";
import { SwapProvider, useSwap } from "./swap-dialog";
import { TripWallet } from "./wallet";
import { DayForecast, WeatherChip, WeatherOutlook, tripCentre, useLocalTime, useTripWeather } from "./weather";
import type { DayWeather } from "@/app/api/weather/route";
import { currencyFor } from "@/lib/currency";
import { downloadKml, hasMappableStops } from "@/lib/kml";
import { updateCached, useCachedJson } from "@/lib/cached-json";
import { PlacePhoto, TripPhotosProvider, asStop } from "./place-photo";
import { RouteMap, type RouteStop } from "./route-map";
import { ShareButton } from "./share-dialog";

const ease = [0.16, 1, 0.3, 1] as const;
const VIBE_LABELS = Object.fromEntries(VIBES.map((v) => [v.id, v.label]));
const pad = (n: number) => String(n).padStart(2, "0");

const SLOTS = [
  { key: "morning", label: "Morning", icon: Sunrise },
  { key: "afternoon", label: "Afternoon", icon: Sun },
  { key: "evening", label: "Evening", icon: Moon },
] as const;

const CATEGORY: Record<string, { label: string; icon: typeof Landmark }> = {
  sight: { label: "Sight", icon: Landmark },
  food: { label: "Food & drink", icon: UtensilsCrossed },
  nature: { label: "Nature", icon: TreePine },
  culture: { label: "Culture", icon: Palette },
  nightlife: { label: "Nightlife", icon: Martini },
  shopping: { label: "Shopping", icon: ShoppingBag },
  wellness: { label: "Wellness", icon: Flower2 },
  activity: { label: "Activity", icon: Mountain },
};

const ESSENTIALS: { key: keyof Essentials; label: string; icon: typeof Banknote }[] = [
  { key: "weather", label: "Weather", icon: CloudSun },
  { key: "currency", label: "Money", icon: Banknote },
  { key: "language", label: "Language", icon: Languages },
  { key: "gettingAround", label: "Getting around", icon: TramFront },
  { key: "tipping", label: "Tipping", icon: HandCoins },
  { key: "plugs", label: "Plugs", icon: Plug },
  { key: "phrase", label: "Say it like a local", icon: MessageSquareQuote },
];

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

const dayLabel = (startIso: string, offset: number) => fmt(`${isoDay(startIso, offset)}T00:00:00Z`, { weekday: "short", month: "short", day: "numeric" });

/** Whole days from today until the trip starts (negative once it has begun). */
function daysUntil(startIso: string) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const start = Date.parse(`${startIso.slice(0, 10)}T00:00:00Z`);
  return Math.round((start - today) / 86_400_000);
}

const bookable = (a: ActivitySlot) => (a.estimatedCost ?? 0) > 0 && !["food", "nightlife", "shopping"].includes(a.category ?? "");

/* -------------------------------------------------------------------------- */
/*                                   Pieces                                   */
/* -------------------------------------------------------------------------- */

function Fact({ label, value, sub, className }: { label: string; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 bg-card px-5 py-4 sm:px-6", className)}>
      <p className="eyebrow text-[0.6rem] text-stone">{label}</p>
      <p className="mt-1.5 truncate text-[1.05rem] text-ink">{value}</p>
      {sub && <p className="truncate text-xs text-stone">{sub}</p>}
    </div>
  );
}

function Countdown({ start, days }: { start: string; days: number }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => setN(daysUntil(start)), [start]);
  if (n === null) return null;
  const [eyebrow, big, small] =
    n > 1
      ? ["Departs in", String(n), "days"]
      : n === 1
        ? ["Departs", "Tomorrow", "pack tonight"]
        : n === 0
          ? ["Departs", "Today", "bon voyage"]
          : -n < days
            ? ["You're there", `Day ${-n + 1}`, `of ${days}`]
            : ["Trip complete", "Relive it", "or plan the next one"];
  return (
    <div className="rounded-3xl bg-paper/10 px-5 py-4 text-paper ring-1 ring-inset ring-paper/20">
      <p className="eyebrow text-[0.6rem] text-paper/60">{eyebrow}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="display text-4xl leading-none">{big}</span>
        <span className="text-sm text-paper/70">{small}</span>
      </p>
    </div>
  );
}

const stopId = (day: number, key: string) => `stop-${day}-${key}`;

function StopCard({ slot, activity, index, day, destination, last, eager, live }: { slot: (typeof SLOTS)[number]; activity: ActivitySlot; index: number; day: number; destination: string; last: boolean; eager?: boolean; live?: boolean }) {
  const cat = activity.category ? CATEGORY[activity.category] : undefined;
  const Icon = slot.icon;
  const swap = useSwap();
  const votes = useReactions().get(day, slot.key);
  const disliked = !!votes && votes.down > votes.up;
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease, delay: 0.1 + index * 0.08 }}
      className="print-avoid relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2.5 pb-5 last:pb-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5"
    >
      <div className="relative flex justify-center">
        {!last && <span aria-hidden className="absolute bottom-[-1.25rem] top-12 w-px border-l border-dashed border-brand/35" />}
        <span
          className={cn(
            "relative mt-5 grid size-9 place-items-center rounded-full font-mono text-sm shadow-[0_10px_24px_-10px_rgba(10,30,44,0.6)] ring-4 ring-paper sm:size-11",
            last ? "bg-sun text-ink" : "bg-ink text-white"
          )}
        >
          {index + 1}
          {live && <span aria-hidden className="absolute inset-[-6px] animate-ping rounded-full ring-2 ring-brand/50 [animation-duration:2.4s]" />}
        </span>
      </div>
      <article
        id={stopId(day, slot.key)}
        className="scroll-mt-6 overflow-hidden rounded-[28px] bg-white ring-1 ring-line shadow-[0_24px_60px_-48px_rgba(10,30,44,0.55)] transition-shadow duration-500 hover:shadow-[0_36px_70px_-42px_rgba(10,30,44,0.5)] md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        <div className="relative aspect-[16/8] sm:aspect-[16/10] md:aspect-auto md:min-h-[18.75rem]">
          <PlacePhoto activity={activity} destination={destination} icon={cat?.icon ?? Icon} eager={eager} rating />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/60 to-transparent" />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-ink/35 px-3 py-1.5 text-paper ring-1 ring-inset ring-paper/20 backdrop-blur-md">
              <Icon className="size-3.5 shrink-0 text-sun-2" />
              <span className="eyebrow text-[0.6rem]">{slot.label}</span>
              {activity.time && <span className="hidden truncate text-xs text-paper/80 sm:inline">· {activity.time}</span>}
            </span>
            <span className="shrink-0 rounded-full bg-white/95 px-2.5 py-1.5 font-mono text-xs text-ink shadow-sm">{activity.estimatedCost ? money(activity.estimatedCost) : "Free"}</span>
          </div>
        </div>
        <div className="p-4 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-stone">
            {activity.time && <span className="sm:hidden">{activity.time}</span>}
            {activity.duration && (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5 text-brand" /> {activity.duration}
              </span>
            )}
          </div>
          <h4 className="display mt-2 text-[clamp(1.44rem,2.55vw,1.87rem)] leading-[1.02] text-ink">{activity.place.name}</h4>
          {(cat || activity.place.area) && (
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {cat && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 text-ink/80">
                  <cat.icon className="size-3.5 text-brand" /> {cat.label}
                </span>
              )}
              {activity.place.area && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 text-ink/80">
                  <MapPin className="size-3.5 text-brand" /> {activity.place.area}
                </span>
              )}
            </div>
          )}
          {activity.place.description && <p className="mt-3 line-clamp-4 leading-relaxed text-stone sm:line-clamp-none">{activity.place.description}</p>}
          {activity.tip && (
            <p className="mt-4 flex gap-3 rounded-2xl bg-brand-soft/60 p-3.5 text-sm leading-relaxed text-ink">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                <span className="font-medium">Local tip · </span>
                {activity.tip}
              </span>
            </p>
          )}
          <div className="no-print mt-5 flex flex-wrap gap-2">
            <a
              href={mapsSearchUrl(activity.place.name, destination)}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("directions_clicked", { where: "stop" })}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-brand"
            >
              <MapPin className="size-4" /> Directions
            </a>
            {bookable(activity) && (
              <a
                href={ticketsFor(activity.place.name, destination)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <Ticket className="size-4" /> Tickets & tours
              </a>
            )}
            {swap && (
              <button
                type="button"
                onClick={() => swap({ day, slot: slot.key, current: activity })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-inset transition-colors hover:bg-ink hover:text-paper hover:ring-ink",
                  disliked ? "bg-sun-soft text-ink ring-sun/40" : "text-ink ring-line"
                )}
              >
                <ArrowRightLeft className="size-4" /> {disliked ? "Swap (crew voted no)" : "Swap"}
              </button>
            )}
          </div>
          <StopReactions day={day} slot={slot.key} />
        </div>
      </article>
    </motion.li>
  );
}

// The live Google map only loads (script and all) when a day's map scrolls into view.
const DayMap = dynamic(() => import("./day-map"), { ssr: false });

/**
 * The day's route: a live, zoomable dark Google map when a Maps key is set,
 * otherwise (or if Google rejects the key) the illustrated route.
 */
function DayRoute({ stops, seed, destination, className }: { stops: RouteStop[]; seed: string; destination: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const live = hasMapsKey && !failed && locatedStops(stops).length > 0;

  useEffect(() => {
    if (!live || near) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [live, near]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <RouteMap stops={stops} seed={seed} className="absolute inset-0" />
      {live && near && <DayMap stops={stops} destination={destination} className="absolute inset-0" onFail={() => setFailed(true)} />}
    </div>
  );
}

/** The day's stops as a photo mosaic: one hero shot and the rest stacked beside it. Tapping one scrolls to its card. */
function DayGlance({ stops, day, destination }: { stops: RouteStop[]; day: number; destination: string }) {
  if (!stops.length) return null;
  const go = (key: string) => document.getElementById(stopId(day, key))?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div
      className={cn(
        "no-print no-scrollbar -mx-3 mt-6 flex snap-x gap-2 overflow-x-auto px-5 scroll-px-5 min-[400px]:-mx-4 min-[400px]:px-6 min-[400px]:scroll-px-6 sm:scroll-px-0 sm:mx-0 sm:grid sm:h-[380px] sm:gap-3 sm:overflow-visible sm:px-0",
        stops.length === 1 && "sm:grid-cols-1",
        stops.length === 2 && "sm:grid-cols-2",
        stops.length >= 3 && "sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] sm:grid-rows-2"
      )}
    >
      {stops.map((s, k) => {
        const cat = s.activity.category ? CATEGORY[s.activity.category] : undefined;
        const slot = SLOTS.find((x) => x.key === s.key)!;
        return (
          <motion.button
            key={s.key}
            type="button"
            onClick={() => go(s.key)}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease, delay: k * 0.08 }}
            className={cn(
              "group relative h-52 w-[72%] shrink-0 snap-start overflow-hidden rounded-[26px] bg-ink text-left sm:h-auto sm:w-auto",
              stops.length >= 3 && k === 0 && "sm:row-span-2"
            )}
            aria-label={`${slot.label}: ${s.activity.place.name}`}
          >
            <PlacePhoto activity={s.activity} destination={destination} icon={cat?.icon ?? slot.icon} credit={false} imgClassName="group-hover:scale-[1.06]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
            <span className={cn("absolute left-4 top-4 grid size-8 place-items-center rounded-full font-mono text-xs shadow-lg", k === stops.length - 1 ? "bg-sun text-ink" : "bg-white/95 text-ink")}>
              {k + 1}
            </span>
            <span className="absolute inset-x-0 bottom-0 p-4 text-paper sm:p-5">
              <span className="eyebrow flex items-center gap-1.5 text-[0.6rem] text-sun-2">
                <slot.icon className="size-3.5" /> {slot.label}
              </span>
              <span className={cn("display mt-1.5 line-clamp-2 block leading-[1]", stops.length >= 3 && k === 0 ? "text-[clamp(1.53rem,2.55vw,2.21rem)]" : "text-[1.36rem]")}>
                {s.activity.place.name}
              </span>
              {s.activity.place.area && <span className="mt-1 block truncate text-xs text-paper/70">{s.activity.place.area}</span>}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function DayPanel({
  day,
  index,
  it,
  total,
  onJump,
  print,
  weather,
  nowSlot,
}: {
  day: DayItinerary;
  index: number;
  it: ItineraryDetails;
  total: number;
  onJump?: (i: number) => void;
  print?: boolean;
  weather?: DayWeather;
  /** Today, during the trip: the slot happening now (or next). */
  nowSlot?: string | null;
}) {
  const stops: RouteStop[] = SLOTS.flatMap((s) => (day[s.key]?.place?.name ? [{ key: s.key, label: s.label, activity: day[s.key] }] : []));
  const route = dayRouteUrl(
    stops.map((s) => s.activity.place.name),
    it.destination,
    it.itineraryData.trip?.preferences?.transport === "car" ? "driving" : "transit"
  );
  return (
    <div className="print-break">
      <div className="flex flex-col gap-5">
        <div className="min-w-0">
          <p className="eyebrow flex flex-wrap items-center gap-2 text-stone">
            Day {pad(index + 1)} · {dayLabel(it.startDate, index)}
            {nowSlot !== undefined && (
              <span className="rounded-full bg-brand px-2 py-1 text-[0.55rem] tracking-[0.18em] text-white">Today</span>
            )}
          </p>
          <h3 className="display mt-3 text-[clamp(2.04rem,4.25vw,3.06rem)] leading-[1.02] text-ink">{day.theme || `Day ${index + 1}`}</h3>
          {day.summary && <p className="mt-3 max-w-xl text-stone">{day.summary}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 text-sm">
          <DayForecast day={weather} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 text-ink ring-1 ring-line">
            <Banknote className="size-4 text-brand" /> {money(day.totalDayCost)}
          </span>
          {route && (
            <a
              href={route}
              target="_blank"
              rel="noreferrer"
              className="no-print inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-paper transition-colors hover:bg-brand"
            >
              <Route className="size-4" /> Day route
            </a>
          )}
        </div>
      </div>

      <DayGlance stops={stops} day={index} destination={it.destination} />

      {stops.length > 1 && <DayRoute stops={stops} seed={`${it.id}-${index}`} destination={it.destination} className="no-print mt-3 aspect-[100/48] sm:aspect-[100/40]" />}

      <ol className="mt-8">
        {stops.map((s, k) => (
          <StopCard key={s.key} slot={SLOTS.find((x) => x.key === s.key)!} activity={s.activity} index={k} day={index} destination={it.destination} last={k === stops.length - 1} eager={print} live={!!nowSlot && nowSlot === s.key} />
        ))}
      </ol>

      {day.dayTip && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.35 }}
          className="print-avoid mt-6 flex gap-4 rounded-[24px] bg-sun-soft/70 p-5 ring-1 ring-sun/25 sm:ml-[4.25rem]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sun text-ink">
            <Wand2 className="size-5" />
          </span>
          <span>
            <span className="eyebrow block text-[0.6rem] text-ink/60">Today&apos;s trick</span>
            <span className="mt-1 block leading-relaxed text-ink">{day.dayTip}</span>
          </span>
        </motion.div>
      )}

      {onJump && total > 1 && (
        <div className="no-print mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onJump(index - 1)}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="size-4" /> {index > 0 ? `Day ${index}` : "Previous"}
          </button>
          <button
            type="button"
            onClick={() => onJump(index + 1)}
            disabled={index === total - 1}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-brand disabled:pointer-events-none disabled:opacity-30"
          >
            {index < total - 1 ? `Day ${index + 2}` : "Next"} <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function BudgetCard({
  budget,
  activities,
  stay,
  nights,
  people,
  days,
  dayCosts,
  active,
  onPick,
}: {
  budget: number;
  activities: number;
  stay: number | null;
  nights: number;
  people: number;
  days: number;
  dayCosts: number[];
  active: number;
  onPick: (i: number) => void;
}) {
  const planned = activities + (stay ?? 0);
  const left = budget - planned;
  const over = left < 0;
  const denom = Math.max(budget, planned, 1);
  const segs = [
    { label: "Activities & food", value: activities, color: "var(--ink)" },
    ...(stay !== null ? [{ label: `Stay · ${nights} ${nights === 1 ? "night" : "nights"}`, value: stay, color: "var(--brand)" }] : []),
  ];
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const maxDay = Math.max(...dayCosts, 1);

  return (
    <div className="glass rounded-[28px] p-5 sm:p-6">
      <p className="eyebrow text-stone">Budget</p>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative size-[112px] shrink-0">
          <svg viewBox="0 0 132 132" className="size-full -rotate-90">
            <circle cx={66} cy={66} r={R} fill="none" stroke="var(--paper-2)" strokeWidth={14} />
            {segs.map((s) => {
              const len = (s.value / denom) * C;
              const el = (
                <motion.circle
                  key={s.label}
                  cx={66}
                  cy={66}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={14}
                  strokeDasharray={`${len} ${C}`}
                  initial={{ strokeDashoffset: -offset + len }}
                  animate={{ strokeDashoffset: -offset }}
                  transition={{ duration: 1.2, ease, delay: 0.3 }}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="display text-2xl leading-none text-ink">{Math.round((planned / Math.max(budget, 1)) * 100)}%</p>
              <p className="mt-1 text-[10px] text-stone">of {money(budget)}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="display text-3xl leading-none text-ink">{money(planned)}</p>
          <p className="mt-1.5 text-sm text-stone">planned of your {money(budget)} budget</p>
          <p className={cn("mt-3 inline-flex rounded-full px-2.5 py-1 text-xs", over ? "bg-destructive/10 text-destructive" : "bg-brand-soft text-brand")}>
            {over ? `${money(-left)} over` : `${money(left)} to spare`}
          </p>
        </div>
      </div>
        <ul className="mt-5 space-y-2.5 text-sm">
          {segs.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="min-w-0 flex-1 truncate text-stone">{s.label}</span>
              <span className="font-mono text-xs text-ink">{money(s.value)}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full bg-paper-3" />
            <span className="min-w-0 flex-1 truncate text-stone">{over ? "Over budget" : "Left for flights & extras"}</span>
            <span className={cn("font-mono text-xs", over ? "text-destructive" : "text-ink")}>{money(Math.abs(left))}</span>
          </li>
        </ul>
      <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-inset ring-white text-xs leading-relaxed text-stone">
        ≈ <span className="text-ink">{money(planned / Math.max(people, 1) / Math.max(days, 1))}</span> per person per day on the ground
        {stay === null ? ", before accommodation." : ", stay included."}
      </p>

      {dayCosts.length > 1 && (
        <div className="mt-5">
          <p className="eyebrow mb-3 text-[0.6rem] text-stone">Spend by day</p>
          <ul className="space-y-1.5">
            {dayCosts.map((c, i) => (
              <li key={i}>
                <button type="button" onClick={() => onPick(i)} className="group flex w-full items-center gap-3 text-left" aria-label={`Day ${i + 1}: ${money(c)}`}>
                  <span className={cn("w-7 font-mono text-[11px]", active === i ? "text-brand" : "text-stone")}>D{i + 1}</span>
                  <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max((c / maxDay) * 100, 3)}%` }}
                      transition={{ duration: 1, ease, delay: 0.2 + i * 0.05 }}
                      className={cn("absolute inset-y-0 left-0 rounded-full transition-colors", active === i ? "bg-brand" : "bg-ink/75 group-hover:bg-ink")}
                    />
                  </span>
                  <span className="w-12 text-right font-mono text-[11px] text-ink">{money(c)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StayCard({ stay, index, query }: { stay: StaySuggestion; index: number; query: BookingQuery }) {
  const [primary] = stayPartners(query, `${stay.name}, ${cityOf(query.destination)}`);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease, delay: index * 0.08 }}
      className="glass print-avoid group flex h-full w-[84%] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] sm:w-[60%] md:w-auto"
    >
      <div className="relative h-48 overflow-hidden print:h-32">
        <PlacePhoto activity={asStop(stay.name, stay.area)} destination={query.destination} icon={BedDouble} rating imgClassName="group-hover:scale-[1.05]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/50 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-ink/40 px-2.5 py-1 font-mono text-xs text-paper ring-1 ring-inset ring-paper/20 backdrop-blur-md">{pad(index + 1)}</span>
        {stay.pricePerNight ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-right text-ink shadow-sm">
            <span className="display text-lg leading-none">{money(stay.pricePerNight)}</span>
            <span className="ml-1 text-[11px] text-stone">/ night</span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h4 className="display text-[1.61rem] leading-[1.02] text-ink">{stay.name}</h4>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-stone">
          <MapPin className="size-3.5 text-brand" /> {stay.area}
          {stay.type && <span>· {stay.type}</span>}
        </p>
        <p className="mt-3 flex-1 leading-relaxed text-stone">{stay.why}</p>
        <div className="no-print mt-5 flex flex-wrap gap-2">
          <a
            href={primary.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-brand"
          >
            Check dates on {primary.name} <ArrowUpRight className="size-4" />
          </a>
          <a
            href={mapsSearchUrl(stay.name, query.destination)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <MapPin className="size-4" /> Map
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    View                                    */
/* -------------------------------------------------------------------------- */

export function TripView({
  it,
  shared = false,
  shareToken,
  variant = "trip",
  photosEndpoint,
  unlockUrl,
  backHref = "/itineraries",
}: {
  it: ItineraryDetails;
  shared?: boolean;
  /** The share link's token, so a shared view can load the trip's photos. */
  shareToken?: string | null;
  /** "package": a ready-made GoRoam trip rather than one of yours. "guest": a signed-out first trip, Day 1 only. */
  variant?: "trip" | "package" | "guest";
  /** Where to load stop photos from, when the default for the variant doesn't apply. */
  photosEndpoint?: string;
  /** Guest previews: where sign-in returns to, to claim and unlock the trip. */
  unlockUrl?: string;
  /** Packages: where "Trip gallery" leads back to (the public gallery, or the dashboard's copy of it). */
  backHref?: string;
}) {
  const data = it.itineraryData;
  // Guest previews behave like packages (no owner tools), with their own wording and an unlock button.
  const isGuest = variant === "guest";
  const isPackage = variant === "package" || isGuest;
  const unlock = () => {
    track("guest_unlock_clicked", { destination: it.destination, where: "trip" });
    // The sign-in page offers Google and an email link, then returns here to claim the trip.
    window.location.href = `/auth?callbackUrl=${encodeURIComponent(unlockUrl ?? "/dashboard")}`;
  };
  // On a public itinerary page the page itself owns the <h1>.
  const HeroHeading = isPackage ? motion.h2 : motion.h1;

  // Every stop's photo in one request; packages ship with theirs.
  const packagePhotos = isPackage && !Object.keys(data?.photos ?? {}).length ? `/api/packages/${it.id.replace(/^package-/, "")}/photos` : null;
  const photosUrl = photosEndpoint ?? (isPackage ? packagePhotos : null) ?? (isPackage ? null : shared ? (shareToken ? `/api/shared/${it.id}/photos?t=${encodeURIComponent(shareToken)}` : null) : `/api/itinerary/${it.id}/photos`);
  const fetchedPhotos = useCachedJson<{ photos: Record<string, PlacePhotoData>; fallback: string | null }>(photosUrl);
  const tripPhotos = useMemo(() => {
    const saved = data?.photos ?? {};
    const photos = { ...saved, ...fetchedPhotos.data?.photos };
    const anyFallback = Object.values(photos).find((p) => p.fallback)?.fallback ?? null;
    return {
      photos,
      fallback: fetchedPhotos.data?.fallback ?? anyFallback,
      city: (data?.summary?.destination || it.destination).split(",")[0].trim(),
      loading: !!photosUrl && fetchedPhotos.loading,
    };
  }, [data, fetchedPhotos.data, fetchedPhotos.loading, photosUrl, it.destination]);
  const days = useMemo(() => data?.itinerary ?? [], [data]);
  const [active, setActive] = useState(0);
  const planRef = useRef<HTMLElement>(null);

  const prefs = data?.trip?.preferences;
  const title = titleCase(it.destination);
  const { scene, pending: scenePending } = useDestinationScene(
    [it.destination, data?.summary?.destination].filter(Boolean).join(", "),
    data?.summary?.landscape
  );
  const dark = SCENES[scene]?.dark ?? true;
  // A real photo of the place, faded in over the illustration once it loads.
  const heroPhoto = useDestinationPhoto(data?.summary?.destination || it.destination);
  const adults = prefs?.adults ?? it.numberOfPeople;
  const children = prefs?.children ?? 0;
  const people = adults + children;
  const nights = Math.max(it.numberOfDays - 1, 1);
  const dayCosts = days.map((d) => d.totalDayCost ?? 0);
  const activities = dayCosts.reduce((a, b) => a + b, 0) || data?.summary?.totalCost || 0;
  const priced = (data?.stays ?? []).map((s) => s.pricePerNight ?? 0).filter((n) => n > 0);
  const stayTotal = priced.length ? Math.round((priced.reduce((a, b) => a + b, 0) / priced.length) * nights) : null;
  const who = prefs ? labelFor(COMPANIONS, prefs.companions) : it.tripType ? labelFor([], it.tripType) : "";

  const query: BookingQuery = {
    origin: data?.trip?.source,
    destination: title,
    checkIn: isoDay(it.startDate, 0),
    checkOut: isoDay(it.startDate, nights),
    adults,
    children,
    stay: prefs?.stay,
  };

  const essentials = ESSENTIALS.filter((e) => data?.essentials?.[e.key]);
  const flag = countryCodeFor(data?.summary?.destination || it.destination, data?.summary?.countryCode);
  const { guide, state: guideState } = useGuide(it.id, data?.guide, !shared && !isPackage);
  const city = cityOf(title);
  const similar = `/dashboard?${new URLSearchParams({ destination: title, days: String(it.numberOfDays), budget: String(Math.round(it.budget)) })}`;
  const owner = !shared && !isPackage;

  // Live forecast (or last year's weather on these dates) and the destination's clock.
  const centre = useMemo(() => (isPackage ? null : tripCentre(days)), [days, isPackage]);
  const { weather, byDate } = useTripWeather(centre, it.startDate, it.numberOfDays);
  const localTime = useLocalTime(weather?.timezone);
  const localCurrency = guide?.currencyCode || currencyFor(flag);

  // During the trip, open on today and point at what's happening now.
  const [todayIndex, setTodayIndex] = useState<number | null>(null);
  const [nowSlot, setNowSlot] = useState<string | null>(null);
  useEffect(() => {
    if (isPackage) return;
    const n = daysUntil(it.startDate);
    if (n > 0 || -n >= it.numberOfDays) return;
    setTodayIndex(-n);
    setActive(-n);
    const pick = () => {
      let hour = new Date().getHours();
      try {
        if (weather?.timezone) hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: weather.timezone }).format(new Date()));
      } catch {}
      setNowSlot(hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening");
    };
    pick();
    const t = window.setInterval(pick, 5 * 60_000);
    return () => window.clearInterval(t);
  }, [it.startDate, it.numberOfDays, isPackage, weather?.timezone]);

  // Browsers name a saved PDF after the page title: "New York Itinerary-By GoRoam".
  useEffect(() => {
    const previous = document.title;
    const name = `${title.split(",")[0].trim() || "Trip"} Itinerary-By GoRoam`;
    const apply = () => {
      document.title = name;
    };
    apply();
    window.addEventListener("beforeprint", apply);
    return () => {
      window.removeEventListener("beforeprint", apply);
      document.title = previous;
    };
  }, [title]);

  const printPdf = () => {
    track("pdf_downloaded", { destination: it.destination, variant });
    window.print();
  };

  useEffect(() => {
    track(isPackage ? "package_viewed" : "itinerary_viewed", { destination: it.destination, days: it.numberOfDays, shared });
  }, [it.id, it.destination, it.numberOfDays, isPackage, shared]);

  // Opened from "Print" on the itineraries page.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("print") === "1") {
      const t = window.setTimeout(() => window.print(), 2400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const jump = (i: number) => {
    const next = Math.max(0, Math.min(days.length - 1, i));
    setActive(next);
    const top = planRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 112, behavior: "smooth" });
  };

  const btn = "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-colors";

  // Chapters for the sticky bar: only the ones this trip actually has.
  const hasDo = !!guide && (guide.experiences.length > 0 || guide.events.length > 0 || (guide.videos?.length ?? 0) > 0 || guide.videoQueries.length > 0);
  const chapters: Chapter[] = [
    { id: "chapter-plan", label: "Plan" },
    { id: "chapter-stay", label: "Stay" },
    ...(hasDo ? [{ id: "chapter-do", label: "Do & see" }] : []),
    ...(guide ? [{ id: "chapter-local", label: "Local guide" }] : []),
    { id: "chapter-before", label: "Before you go" },
    ...(owner ? [{ id: "chapter-tools", label: "Trip tools" }] : []),
  ];
  // A chapter's first section sits flush with it, so a jump lands on the heading.
  const chapterBox = "mt-24 scroll-mt-28 [&>*:first-child]:mt-0";
  const glass = cn(btn, "bg-paper/15 text-paper ring-1 ring-inset ring-paper/25 hover:bg-paper hover:text-ink");
  // The trip's take-aways, behind one Export button.
  const exports: ExportItem[] = [
    {
      icon: CalendarPlus,
      label: "Add to calendar",
      hint: "Every stop as an event (.ics)",
      onSelect: () => {
        downloadIcs(it);
        track("calendar_downloaded", { destination: it.destination });
      },
    },
    ...(hasMappableStops(it) ? [{ icon: MapIcon, label: "Offline map", hint: "Every stop, for any maps app (.kml)", onSelect: () => downloadKml(it) }] : []),
    { icon: Printer, label: "Save as PDF", hint: "A print-ready copy of the trip", onSelect: printPdf },
  ];
  // A later stop's photo for "{city}, unexpectedly", so it isn't the hero shot again.
  const lastDay = days[days.length - 1];
  const factStop = lastDay?.afternoon ?? lastDay?.evening ?? lastDay?.morning;
  // Each highlight with the stop it's about, for the big-moments mosaic.
  const moments = useMemo(() => pairMoments(data?.summary?.highlights ?? [], days), [data, days]);
  // Opens a day from anywhere above the plan, and brings the plan into view.
  const openDay = (i: number) => {
    setActive(Math.max(0, Math.min(days.length - 1, i)));
    const top = planRef.current?.getBoundingClientRect().top;
    if (top !== undefined) window.scrollTo({ top: window.scrollY + top - 112, behavior: "smooth" });
  };

  return (
    <TripPhotosProvider value={tripPhotos}>
    <SwapProvider it={it} enabled={owner}>
    <ReactionsProvider tripId={it.id} token={shareToken} mode={shared ? "shared" : owner ? "owner" : "off"} initial={data?.reactions}>
    <div className="trip-sections relative isolate mx-auto max-w-[82.5rem]">
      {/* Hero — doubles as the PDF cover */}
      <section className="relative h-[min(74vh,660px)] min-h-[26rem] sm:min-h-[31.25rem] overflow-hidden rounded-panel bg-ink print:h-[320px] print:min-h-0">
        <div className="absolute inset-0">
          {!scenePending && <Scene key={scene} id={scene} intro interactive title={title} />}
        </div>
        <HeroPhoto photo={heroPhoto} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/35" />
        <div className="no-print absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-4 sm:p-6">
          {isGuest ? (
            <span className={cn(glass, "pointer-events-none")}>
              <Sparkles className="size-4" /> Your free trip preview
            </span>
          ) : isPackage ? (
            <Link href={backHref} className={glass}>
              <ArrowLeft className="size-4" /> Trip gallery
            </Link>
          ) : shared ? (
            <span className={cn(glass, "pointer-events-none")}>
              <Sparkles className="size-4" /> Shared with you
            </span>
          ) : (
            <Link href="/dashboard/itineraries" className={glass}>
              <ArrowLeft className="size-4" /> All trips
            </Link>
          )}
          <div className="flex flex-wrap gap-2">
            {!shared && !isPackage && <ShareButton tripId={it.id} title={title} className={cn(btn, "bg-paper text-ink hover:bg-brand hover:text-white")} />}
            {!shared && !isPackage && <EmailButton tripId={it.id} className={cn(glass, "disabled:opacity-70")} />}
            <ExportMenu items={exports} className={glass} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 text-paper sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.3 }} className="eyebrow text-paper/75">
              {it.numberOfDays} {it.numberOfDays === 1 ? "day" : "days"} ·{" "}
              {isGuest ? "Planned for you by GoRoam" : isPackage ? "GoRoam travel package" : `${fmt(it.startDate, { month: "short", day: "numeric" })} – ${fmt(it.endDate, { month: "short", day: "numeric", year: "numeric" })}`}
              {who && ` · ${who}`}
            </motion.p>
            <HeroHeading
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease, delay: 0.4 }}
              className={cn("display mt-3 text-[clamp(2.89rem,7.65vw,7.22rem)] leading-[0.96]", !dark && "drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]")}
            >
              {flag && <Flag code={flag} className="mr-[0.2em] h-[0.4em] -translate-y-[0.12em] align-middle" />}
              {title}
            </HeroHeading>
            {data?.summary?.overview && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }} className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-paper/85">
                {data.summary.overview}
              </motion.p>
            )}
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.8 }} className="no-print shrink-0 self-start lg:self-auto">
            {isGuest ? (
              <button type="button" onClick={unlock} className={cn(btn, "h-14 bg-brand px-6 text-base text-white hover:bg-brand/90")}>
                <Sparkles className="size-4" /> Unlock the full trip, free
              </button>
            ) : isPackage ? (
              <PillLink href={similar} variant="brand" size="lg" onClick={() => track("package_customized", { destination: it.destination, where: "hero" })}>
                Make it mine
              </PillLink>
            ) : (
              <Countdown start={it.startDate} days={it.numberOfDays} />
            )}
          </motion.div>
        </div>
      </section>

      {/* Facts */}
      <section className={cn("mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line", localTime ? "md:grid-cols-3 lg:grid-cols-6" : "md:grid-cols-5")}>
        <Fact label="From" value={data?.trip?.source ? titleCase(data.trip.source) : "Anywhere"} sub={`to ${title}`} />
        <Fact
          label="Travellers"
          value={`${people} ${people === 1 ? "traveller" : "travellers"}`}
          sub={prefs ? `${adults} adult${adults === 1 ? "" : "s"}${children ? ` · ${children} kid${children === 1 ? "" : "s"}` : ""}` : who}
        />
        <Fact label="Pace" value={prefs ? labelFor(PACES, prefs.pace) : "Balanced"} sub={prefs ? `${labelFor(SPEND, prefs.spend)} spending` : undefined} />
        <Fact label="Staying in" value={prefs ? labelFor(STAYS, prefs.stay) : "Your pick"} sub={`${nights} ${nights === 1 ? "night" : "nights"}`} />
        {localTime && <Fact label="Local time" value={localTime.time} sub={localTime.relative} />}
        <Fact
          className={localTime ? undefined : "col-span-2 md:col-span-1"}
          label="Into"
          value={it.interests.length ? it.interests.slice(0, 2).map((i) => labelFor(VIBES, i)).join(", ") : "A bit of everything"}
          sub={it.interests.length > 2 ? `+${it.interests.length - 2} more` : undefined}
        />
      </section>

      {/* The trip's boarding pass, on the PDF cover only. */}
      <section className="print-avoid mx-auto mt-6 hidden max-w-[35rem] print:block">
        <BoardingPass
          scene={scene}
          interestLabels={VIBE_LABELS}
          data={{
            source: data?.trip?.source ? titleCase(data.trip.source) : "",
            destination: title,
            startDate: isoDay(it.startDate, 0),
            numberOfDays: it.numberOfDays,
            numberOfPeople: people,
            budget: Math.round(it.budget),
            tripType: who || "Trip",
            interests: it.interests,
            note: prefs ? `${labelFor(PACES, prefs.pace)} pace · ${labelFor(STAYS, prefs.stay)}` : undefined,
          }}
        />
      </section>

      {/* The trip at a glance: its big moments as photos, each opening its day. */}
      <BigMoments moments={moments} destination={it.destination} onOpen={openDay} />

      <ChapterNav chapters={chapters} title={`${cityOf(title)} · ${it.numberOfDays} ${it.numberOfDays === 1 ? "day" : "days"}`} className={cn(moments.length ? "mt-14" : "mt-6", shared ? "top-3" : "top-[calc(4.75rem+env(safe-area-inset-top))] lg:top-4")} />

      <div id="chapter-plan" className="mt-10 grid scroll-mt-28 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Plan */}
        <main className="min-w-0 lg:col-span-8">
          <section ref={planRef} className="scroll-mt-6">
            <SectionTitle eyebrow="The plan" title={<>Day by <span className="accent">day.</span></>} />

            {days.length > 1 && (
              <div
                role="tablist"
                aria-label="Days"
                onKeyDown={(e) => {
                  // Arrow keys step through the days, as in any tab bar.
                  const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                  if (!step) return;
                  e.preventDefault();
                  const next = Math.max(0, Math.min(days.length - 1, active + step));
                  jump(next);
                  (e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[next])?.focus();
                }}
                className="no-print no-scrollbar -mx-3 mt-6 flex snap-x gap-2 overflow-x-auto px-5 scroll-px-5 min-[400px]:-mx-4 min-[400px]:px-6 min-[400px]:scroll-px-6 sm:scroll-px-0 pb-1 sm:mx-0 sm:px-0"
              >
                {days.map((d, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      tabIndex={on ? 0 : -1}
                      onClick={() => jump(i)}
                      className={cn(
                        "group relative min-w-[9.5rem] flex-1 shrink-0 snap-start sm:min-w-[11.5rem] overflow-hidden rounded-[22px] text-left ring-1 transition-[color,box-shadow] duration-300",
                        on ? "text-paper shadow-[0_24px_50px_-28px_rgba(10,30,44,0.7)] ring-ink" : "bg-white text-ink ring-line hover:shadow-[0_20px_40px_-30px_rgba(10,30,44,0.6)]"
                      )}
                    >
                      {on && <motion.span layoutId="day-card" className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                      <span className="relative block h-24 overflow-hidden sm:h-28">
                        <PlacePhoto activity={d.morning ?? d.afternoon ?? d.evening} destination={it.destination} credit={false} imgClassName="group-hover:scale-[1.06]" />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                        <span className="absolute bottom-2 left-3 font-mono text-[11px] text-paper">{todayIndex === i ? "TODAY" : `DAY ${pad(i + 1)}`}</span>
                        <WeatherChip day={byDate.get(isoDay(it.startDate, i))} tone="dark" className="absolute right-3 top-2 rounded-full bg-ink/35 px-2 py-0.5 backdrop-blur-sm" />
                        <span className="absolute bottom-2 right-3 font-mono text-[11px] text-paper/80">{money(d.totalDayCost)}</span>
                      </span>
                      <span className="relative block p-3.5 pt-3">
                        <span className={cn("block text-xs", on ? "text-sun-2" : "text-brand")}>{dayLabel(it.startDate, i)}</span>
                        <span className="mt-1.5 line-clamp-2 block text-[0.95rem] leading-snug">{d.theme || `Day ${i + 1}`}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8">
              {/* On screen: one day at a time. In print: every day. */}
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease }} className="print:hidden">
                  {days[active] && (
                    <DayPanel
                      day={days[active]}
                      index={active}
                      it={it}
                      total={days.length}
                      onJump={jump}
                      weather={byDate.get(isoDay(it.startDate, active))}
                      nowSlot={todayIndex === active ? nowSlot : undefined}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="hidden space-y-14 print:block">
                {days.map((d, i) => (
                  <DayPanel key={i} day={d} index={i} it={it} total={days.length} print weather={byDate.get(isoDay(it.startDate, i))} />
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* Rail */}
        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-3 lg:sticky lg:top-6">
            <BudgetCard
              budget={it.budget}
              activities={activities}
              stay={stayTotal}
              nights={nights}
              people={people}
              days={it.numberOfDays}
              dayCosts={dayCosts}
              active={active}
              onPick={jump}
            />
            <div className="no-print">
              <BookingPanel query={query} className="glass-dark" />
            </div>
          </div>
        </aside>
      </div>

      {/* Stays */}
      <Band id="chapter-stay">
        <SectionTitle eyebrow="Where to stay" title={<>Pick your <span className="accent">base.</span></>}>
          <p className="max-w-sm text-sm text-stone">
            Hand-picked for {prefs ? `a ${labelFor(STAYS, prefs.stay).toLowerCase()} stay` : "this trip"} · {fmt(it.startDate, { month: "short", day: "numeric" })}{" "}
            <ArrowRight className="inline size-3.5 -translate-y-px" /> {fmt(`${query.checkOut}T00:00:00Z`, { month: "short", day: "numeric" })}
          </p>
        </SectionTitle>
        {data?.stays?.length ? (
          <div className="no-scrollbar -mx-3 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 scroll-px-5 min-[400px]:-mx-4 min-[400px]:px-6 min-[400px]:scroll-px-6 md:scroll-px-0 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 print:grid print:grid-cols-3">
            {data.stays.map((s, i) => (
              <StayCard key={`${s.name}-${i}`} stay={s} index={i} query={query} />
            ))}
          </div>
        ) : (
          <div className="no-print mt-8 grid gap-3 md:grid-cols-3">
            {stayPartners(query).map((p, i) => (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="glass group flex items-center gap-4 rounded-[26px] p-6 transition-colors hover:bg-ink hover:text-paper"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <BedDouble className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="display block text-xl leading-none">{p.name}</span>
                  <span className="mt-1 block text-sm text-stone group-hover:text-paper/60">{i === 0 ? `Stays in ${cityOf(title)}` : p.blurb}</span>
                </span>
                <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" />
              </a>
            ))}
          </div>
        )}
      </Band>


      {/* The local guide */}
      {guide ? (
        <>
          {hasDo && (
            <div id="chapter-do" className={chapterBox}>
              <Experiences items={guide.experiences} destination={title} />
              <Events events={guide.events} month={fmt(it.startDate, { month: "long" })} destination={it.destination} />
              <Videos videos={guide.videos} queries={guide.videoQueries} destination={title} />
            </div>
          )}
          <div id="chapter-local" className={chapterBox}>
            <LocalGuide guide={guide} destination={title} />
            <CoolFacts facts={guide.facts} city={city} stop={factStop} destination={it.destination} />
          </div>
        </>
      ) : (
        guideState === "writing" && <GuidePending />
      )}

      <div id="chapter-before" className={chapterBox}>
      {/* Essentials */}
      {(essentials.length > 0 || !!weather?.days.length || !!localCurrency) && (
        <Band>
          <SectionTitle eyebrow="Good to know" title={<>The <span className="accent">essentials.</span></>} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {essentials.map((e, i) => (
              <motion.div
                key={e.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease, delay: i * 0.05 }}
                className={cn(
                  "print-avoid rounded-[24px] p-5",
                  e.key === "weather" ? "bg-[linear-gradient(135deg,var(--sun-soft),#fff_72%)] shadow-card ring-1 ring-sun/20 sm:col-span-2" : "glass"
                )}
              >
                <span className={cn("grid size-10 place-items-center rounded-xl", e.key === "weather" ? "duo-sun bg-sun/15 text-ink" : "bg-brand-soft text-brand")}>
                  <e.icon className="size-5" />
                </span>
                <p className="eyebrow mt-4 text-[0.6rem] text-stone">{e.label}</p>
                <p className={cn("mt-1.5 leading-snug text-ink", e.key === "weather" && "text-lg")}>{data.essentials![e.key]}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start empty:hidden">
            {!!weather?.days.length && <WeatherOutlook days={weather.days} className="lg:col-span-7" />}
            {localCurrency && <CurrencyCard local={localCurrency} budgetUsd={it.budget} className={weather?.days.length ? "lg:col-span-5" : "lg:col-span-6"} />}
            {!isPackage && weather?.timezone && <JetLagCard timezone={weather.timezone} departure={isoDay(it.startDate, 0)} className="lg:col-span-12" />}
          </div>
        </Band>
      )}


      {/* Checklist */}
      <section className="mt-24">
        <Checklist tripId={it.id} packing={data?.packing} />
      </section>
      </div>

      {/* Your trip tools: the bookings vault and the shared wallet. */}
      {owner && (
        <div id="chapter-tools" className={chapterBox}>
        <Bookings
          tripId={it.id}
          initial={data?.bookings}
          defaultDate={isoDay(it.startDate, -2)}
          onSaved={(bookings) => updateCached<{ data: ItineraryDetails }>(`/api/itinerary/${it.id}`, (d) => ({ ...d, data: { ...d.data, itineraryData: { ...d.data.itineraryData, bookings } } }))}
        />
        <TripWallet
          tripId={it.id}
          initial={data?.wallet}
          people={people}
          budgetUsd={it.budget}
          localCurrency={localCurrency}
          onSaved={(wallet) => updateCached<{ data: ItineraryDetails }>(`/api/itinerary/${it.id}`, (d) => ({ ...d, data: { ...d.data, itineraryData: { ...d.data.itineraryData, wallet } } }))}
        />
        </div>
      )}

      {/* Outro, over a photo of the place */}
      <section className="no-print mt-24">
        <PhotoPanel photo={heroPhoto} scene={scene} shade="left" creditClassName="bottom-auto top-4" className="rounded-panel text-paper">
          <div className="relative flex min-h-[20rem] flex-col items-start justify-end gap-8 p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display text-[clamp(2.21rem,4.25vw,3.4rem)] leading-[1.02]">
                {isGuest ? (
                  <>
                    Love Day 1? <span className="accent">There&apos;s more.</span>
                  </>
                ) : isPackage ? (
                  <>
                    Make it <span className="accent">yours.</span>
                  </>
                ) : shared ? (
                  <>
                    Dreaming up <span className="accent">your own?</span>
                  </>
                ) : (
                  <>
                    Bon <span className="accent">voyage.</span>
                  </>
                )}
              </p>
              <p className="mt-3 max-w-md text-paper/60">
                {isGuest
                  ? "Sign in with Google, free, to unlock every day, the map, the local guide, PDF and sharing. It takes ten seconds."
                  : isPackage
                  ? "Change the dates, budget, pace or who's coming, and GoRoam re-plans every day around you."
                  : shared
                    ? "GoRoam plans a day-by-day trip like this one in under a minute, flights, stays and all."
                    : "Take it offline, send it to the crew, or start dreaming about the next one."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isGuest ? (
                <button type="button" onClick={unlock} className={cn(btn, "h-12 bg-brand px-6 text-white hover:bg-brand/90")}>
                  <Sparkles className="size-4" /> Sign in free to unlock every day
                </button>
              ) : isPackage ? (
                <>
                  <Link href={backHref} className={cn(btn, "h-12 bg-paper/10 px-5 ring-1 ring-inset ring-paper/20 hover:bg-paper hover:text-ink")}>
                    <ArrowLeft className="size-4" /> More packages
                  </Link>
                  <PillLink href={similar} variant="brand" onClick={() => track("package_customized", { destination: it.destination, where: "outro" })}>
                    Make it mine
                  </PillLink>
                </>
              ) : shared ? (
                <PillLink href="/dashboard" variant="brand" size="lg">
                  Plan my trip for free
                </PillLink>
              ) : (
                <>
                  <Link href={similar} className={cn(btn, "h-12 bg-paper/10 px-5 ring-1 ring-inset ring-paper/20 hover:bg-paper hover:text-ink")}>
                    <Repeat className="size-4" /> Plan a similar trip
                  </Link>
                  <PillLink href="/dashboard" variant="brand">
                    Plan a new trip
                  </PillLink>
                </>
              )}
            </div>
          </div>
        </PhotoPanel>
      </section>

      {!shared && !isPackage && <Concierge tripId={it.id} city={city} asked={it.chatCount ?? 0} />}
    </div>
    </ReactionsProvider>
    </SwapProvider>
    </TripPhotosProvider>
  );
}
