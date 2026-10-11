"use client";

import { motion } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Baby,
  Bike,
  Bus,
  Camera,
  Car,
  Check,
  Coins,
  Footprints,
  HandCoins,
  Leaf,
  Loader2,
  Luggage,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stamp,
  Star,
  TrainFront,
  TriangleAlert,
  Users,
  UtensilsCrossed,
  Wallet as WalletIcon,
  Wifi,
  type LucideIcon,
} from "@/components/site/icons";
import { PlacePhoto, asStop, asThing } from "./place-photo";
import { cityOf, esimLink, insuranceLinks, mapsSearchUrl, visaLink } from "@/lib/booking";
import { formatMoney } from "@/lib/currency";
import { useMoney } from "@/lib/money";
import { EXPENSE_CATEGORIES, dayStops, type ActivitySlot, type ItineraryDetails, type StopInsight, type TripGuide, type TripInsights, type Wallet } from "@/lib/trip";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------------------------------------- */
/* Data: the trip's insights, written once by the server and kept with the trip.                  */
/* ---------------------------------------------------------------------------------------------- */

type State = "ready" | "writing" | "failed";
const Ctx = createContext<{ insights?: TripInsights; state: State }>({ state: "failed" });
export const useTripInsights = () => useContext(Ctx);

export function InsightsProvider({ tripId, stored, canWrite, children }: { tripId: string; stored?: TripInsights; canWrite: boolean; children: ReactNode }) {
  const [insights, setInsights] = useState<TripInsights | undefined>(stored);
  const [state, setState] = useState<State>(stored ? "ready" : canWrite ? "writing" : "failed");
  useEffect(() => {
    if (stored) {
      setInsights(stored);
      setState("ready");
      return;
    }
    if (!canWrite) return;
    let live = true;
    setState("writing");
    fetch(`/api/itinerary/${tripId}/insights`, { method: "POST" })
      .then((r) => r.json())
      .then((b) => {
        if (!live) return;
        if (b?.success && b.insights) {
          setInsights(b.insights);
          setState("ready");
        } else setState("failed");
      })
      .catch(() => live && setState("failed"));
    return () => {
      live = false;
    };
  }, [tripId, stored, canWrite]);
  const value = useMemo(() => ({ insights, state }), [insights, state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const stopInsight = (insights: TripInsights | undefined, activity: ActivitySlot): StopInsight | undefined => insights?.stops[activity.place.name.toLowerCase().trim()];

/* ---------------------------------------------------------------------------------------------- */
/* On each stop: crowds, closures, who it suits and the photo.                                     */
/* ---------------------------------------------------------------------------------------------- */

const CROWD = { quiet: { bars: 1, label: "Usually quiet", tone: "text-emerald-600" }, busy: { bars: 2, label: "Gets busy", tone: "text-sun" }, packed: { bars: 3, label: "Often packed", tone: "text-coral" } } as const;

/** Crowd level, a closure warning for that date, kid and access flags, and the photo spot. */
export function StopInsightRow({ activity, date }: { activity: ActivitySlot; date: string }) {
  const { insights } = useTripInsights();
  const s = stopInsight(insights, activity);
  if (!s) return null;
  const weekday = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const closedToday = s.closedOn?.some((d) => weekday.toLowerCase().startsWith(d.toLowerCase().slice(0, 3)));
  const crowd = s.crowd ? CROWD[s.crowd] : null;
  return (
    <div className="mt-4 space-y-2">
      {closedToday && (
        <p className="flex items-start gap-2 rounded-2xl bg-coral-soft px-3 py-2 text-xs leading-snug text-ink ring-1 ring-coral/30">
          <TriangleAlert className="mt-px size-3.5 shrink-0 text-coral" />
          <span>
            <span className="font-medium">Usually closed on {weekday}s.</span> Check before you go, or swap it to another day.
          </span>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {crowd && (
          <span className="inline-flex items-center gap-2 rounded-full bg-paper-2/80 px-2.5 py-1 text-ink/85" title={s.quietest ? `Calmest ${s.quietest}` : undefined}>
            <span aria-hidden className="flex items-end gap-[2px]">
              {[1, 2, 3].map((b) => (
                <span key={b} className={cn("w-[3px] rounded-full", b <= crowd.bars ? "bg-current" : "bg-ink/15", crowd.tone)} style={{ height: 4 + b * 3 }} />
              ))}
            </span>
            {crowd.label}
            {s.quietest && <span className="text-stone">· calmest {s.quietest.replace(/^./, (c) => c.toLowerCase())}</span>}
          </span>
        )}
        {s.kids && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-2.5 py-1 text-ink/85">
            <Baby className="size-3.5 text-sun" /> Kid-friendly
          </span>
        )}
        {s.accessible && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-ink/85">
            <Footprints className="size-3.5 text-brand" /> Step-free access
          </span>
        )}
        {!closedToday && !!s.closedOn?.length && <span className="rounded-full bg-paper-2/80 px-2.5 py-1 text-stone">Closed {s.closedOn.map((d) => d.slice(0, 3)).join(", ")}</span>}
      </div>
      {s.photo && (
        <p className="flex items-start gap-2 text-xs leading-snug text-stone">
          <Camera className="mt-px size-3.5 shrink-0 text-brand" />
          <span>
            <span className="text-ink">Photo spot · </span>
            {s.photo}
          </span>
        </p>
      )}
    </div>
  );
}

const NoIcon = (() => null) as unknown as LucideIcon;

/** A real photo (Google Places, then Wikimedia, then the city) filling its positioned parent. */
function Pic({ name, area, thing, credit = true, className }: { name: string; area?: string; thing?: boolean; credit?: boolean; className?: string }) {
  const slot = useMemo(() => (thing ? asThing(name) : asStop(name, area)), [name, area, thing]);
  // No camera glyph when nothing is found: the card's own gradient carries it.
  return <PlacePhoto activity={slot} credit={credit} icon={NoIcon} className={className} />;
}

/** A card whose background is a photo under a deep scrim, for text that stays readable. */
function PhotoCard({ photo, area, thing, className, scrim = "from-ink via-ink/80 to-ink/25", delay = 0, children }: { photo: string; area?: string; thing?: boolean; className?: string; scrim?: string; delay?: number; children: ReactNode }) {
  return (
    <Card className={cn("isolate text-paper", className)} delay={delay}>
      <Pic name={photo} area={area} thing={thing} credit={false} className="-z-10 transition-transform duration-[1.6s] group-hover:scale-105" />
      <span aria-hidden className={cn("absolute inset-0 -z-10 bg-gradient-to-t", scrim)} />
      {children}
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Each day: places to eat near the stops.                                                         */
/* ---------------------------------------------------------------------------------------------- */

const priceTag = (p: number) => "●".repeat(p) + "○".repeat(4 - p);

export function DayEats({ day, destination }: { day: number; destination: string }) {
  const { insights } = useTripInsights();
  const eats = insights?.eats.filter((e) => e.day === day + 1) ?? [];
  if (!eats.length) return null;
  return (
    <section className="no-print mt-8 sm:ml-[4.25rem]" aria-label="Places to eat nearby">
      <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-stone">
        <UtensilsCrossed className="size-3.5 text-brand" /> Eat nearby
      </p>
      <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
        {eats.map((e, i) => (
          <motion.a
            key={`${e.name}-${i}`}
            href={mapsSearchUrl(e.name, destination)}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: i * 0.06 }}
            className="group relative min-w-[78%] snap-start overflow-hidden rounded-[22px] bg-white ring-1 ring-line transition-shadow hover:shadow-[0_24px_48px_-30px_rgba(14,31,59,0.55)] sm:min-w-0"
          >
            <span className="relative block h-36 overflow-hidden">
              <Pic name={e.name} area={e.near} className="transition-transform duration-700 group-hover:scale-105" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 flex gap-1.5">
                {e.rating && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[11px] text-paper backdrop-blur-md">
                    <Star className="size-3 text-sun-2" /> {e.rating.toFixed(1)}
                  </span>
                )}
                {e.veg && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] text-emerald-700 backdrop-blur-md">
                    <Leaf className="size-3" /> Veg-friendly
                  </span>
                )}
              </span>
              <span className="absolute bottom-2.5 left-3 rounded-full bg-white/85 px-2 py-0.5 text-[11px] tracking-[0.12em] text-ink backdrop-blur-md">{priceTag(e.price)}</span>
            </span>
            <span className="block p-4">
            <span className="relative flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="display block truncate text-lg text-ink">{e.name}</span>
                <span className="mt-0.5 block text-xs text-stone">{e.cuisine}</span>
              </span>
            </span>
            <span className="relative mt-3 block text-sm leading-relaxed text-ink/85">{e.note}</span>
            <span className="relative mt-3 flex items-center justify-between text-xs text-stone">
              <span className="inline-flex min-w-0 items-center gap-1 truncate">
                <MapPin className="size-3 shrink-0 text-brand" /> near {e.near}
              </span>
              <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Know before you go: entry, data, cover, packing, getting around, money, events and carbon.      */
/* ---------------------------------------------------------------------------------------------- */

function Card({ className, children, delay = 0 }: { className?: string; children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay }}
      className={cn("group relative overflow-hidden rounded-[28px] p-5 sm:p-7", className)}
    >
      {children}
    </motion.div>
  );
}

function CardHead({ icon: Icon, eyebrow, title, dark }: { icon: LucideIcon; eyebrow: string; title: string; dark?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", dark ? "bg-white/10 text-sun-2 ring-1 ring-white/15" : "bg-brand-soft text-brand")}>
        <Icon className="size-5" />
      </span>
      <span>
        <span className={cn("eyebrow block text-[0.6rem]", dark ? "text-paper/60" : "text-stone")}>{eyebrow}</span>
        <span className={cn("display mt-1 block text-[1.45rem] leading-tight", dark ? "text-paper" : "text-ink")}>{title}</span>
      </span>
    </div>
  );
}

const TRANSIT_ICON = (mode: string): LucideIcon =>
  /metro|subway|train|rail|card|pass/i.test(mode) ? TrainFront : /bus/i.test(mode) ? Bus : /bike|cycle|scooter/i.test(mode) ? Bike : /walk/i.test(mode) ? Footprints : Car;

export function KnowBeforeYouGo({ it, guide }: { it: ItineraryDetails; guide?: TripGuide }) {
  const { insights, state } = useTripInsights();
  const city = cityOf(it.destination);
  const sacred = it.itineraryData.itinerary.flatMap((d) => dayStops(d)).map((x) => x.activity.place.name).find((n) => /temple|shrine|mosque|church|cathedral|gurdwara|pagoda|dera|mandir|masjid|basilica/i.test(n));
  const fromIndia = /india/i.test(it.itineraryData.trip?.source ?? "");
  const cover = insuranceLinks(fromIndia);
  const events = guide?.events ?? [];
  const scams = guide?.scams ?? [];
  const carbon = insights?.carbon;
  const maxPart = Math.max(1, ...(carbon?.parts.map((p) => p.kg) ?? [1]));
  // A rough yardstick: an average person's yearly footprint is about 4,700 kg CO2e.
  const perPerson = carbon ? Math.round(carbon.totalKg / Math.max(1, it.numberOfPeople)) : 0;

  return (
    <div className="no-print">
      {/* Row 1: the three things to sort before leaving */}
      <div className="grid gap-3 md:grid-cols-3">
        <PhotoCard photo={`${city} airport`} className="flex min-h-[19rem] flex-col justify-end">
          <CardHead icon={Stamp} eyebrow="Entry & visa" title="Can you get in?" dark />
          <p className="mt-4 text-sm leading-relaxed text-paper/85">{guide?.entry?.summary ?? "Check what your passport needs: visas, e-visas and any arrival forms."}</p>
          <a href={visaLink(it.destination)} target="_blank" rel="noopener noreferrer sponsored nofollow" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm text-ink transition-colors hover:bg-sun-2">
            Check your passport <ArrowUpRight className="size-4" />
          </a>
        </PhotoCard>
        <PhotoCard photo={city} className="flex min-h-[19rem] flex-col justify-end" scrim="from-[#0B2A6B] via-[#0B2A6B]/80 to-[#0B2A6B]/20" delay={0.06}>
          <CardHead icon={Wifi} eyebrow="Stay connected" title="Data from the moment you land" dark />
          <p className="mt-4 text-sm leading-relaxed text-paper/85">A travel eSIM installs before you fly: maps, rides and WhatsApp work at the airport, without roaming bills.</p>
          <a href={esimLink()} target="_blank" rel="noopener noreferrer sponsored nofollow" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm text-ink transition-colors hover:bg-sun-2">
            Get an eSIM <ArrowUpRight className="size-4" />
          </a>
        </PhotoCard>
        <PhotoCard photo={`${city} station`} className="flex min-h-[19rem] flex-col justify-end" scrim="from-[#3A2205] via-[#3A2205]/75 to-[#3A2205]/20" delay={0.12}>
          <CardHead icon={ShieldCheck} eyebrow="Travel insurance" title="Covered if plans change" dark />
          <p className="mt-4 text-sm leading-relaxed text-paper/85">Medical care, cancelled flights and lost bags, for a few dollars a day.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {cover.map((c) => (
              <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer sponsored nofollow" title={c.blurb} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm text-ink transition-colors hover:bg-sun-2">
                {c.name} <ArrowUpRight className="size-4" />
              </a>
            ))}
          </div>
        </PhotoCard>
      </div>

      {state === "writing" && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-stone ring-1 ring-line">
          <Loader2 className="size-4 animate-spin text-brand" /> Researching crowds, places to eat, transport and more for your trip…
        </p>
      )}

      {insights && (
        <>
          {/* Row 2: packing and dress */}
          <div className="mt-3 grid gap-3 lg:grid-cols-12">
            <Card className="bg-white ring-1 ring-line lg:col-span-8">
              <div className="relative -mx-5 -mt-5 mb-6 h-32 overflow-hidden sm:-mx-7 sm:-mt-7">
                <Pic name={city} credit={false} />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
              </div>
              <CardHead icon={Luggage} eyebrow="Pack for the forecast" title="What goes in the bag" />
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {insights.packing.map((p, i) => (
                  <motion.li
                    key={p.item}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease, delay: i * 0.04 }}
                    className="flex items-start gap-3 rounded-2xl bg-paper-2/60 p-3"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                      <Check className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-ink">{p.item}</span>
                      <span className="block text-xs leading-snug text-stone">{p.why}</span>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </Card>
            {insights.dress && (
              <PhotoCard photo={sacred ?? `temple ${city}`} thing={!sacred} className="flex min-h-[22rem] flex-col justify-end lg:col-span-4" delay={0.06}>
                <CardHead icon={Sparkles} eyebrow="Temples, mosques & shrines" title="What to wear" dark />
                <p className="mt-4 leading-relaxed text-paper/90">{insights.dress}</p>
                {sacred && <p className="mt-3 text-xs text-paper/60">Pictured: {sacred}</p>}
              </PhotoCard>
            )}
          </div>

          {/* Row 3: getting around, money manners */}
          <div className="mt-3 grid gap-3 lg:grid-cols-12">
            <Card className="bg-white ring-1 ring-line lg:col-span-7">
              <CardHead icon={TrainFront} eyebrow="Getting around" title="Passes, fares and rides" />
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {insights.transit.map((t) => {
                  const Icon = TRANSIT_ICON(t.mode);
                  return (
                    <div key={t.mode} className="rounded-2xl bg-paper-2/60 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center gap-2.5 text-sm text-ink">
                          <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                            <Pic name={`${city} ${t.mode}`} thing credit={false} />
                          </span>
                          <Icon className="size-4 shrink-0 text-brand" /> <span className="truncate">{t.mode}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-ink ring-1 ring-line">{t.cost}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-stone">{t.tip}</p>
                    </div>
                  );
                })}
              </div>
              {insights.rideApps.length > 0 && (
                <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-stone">
                  Ride apps that work here:
                  {insights.rideApps.map((a) => (
                    <span key={a} className="rounded-full bg-ink px-3 py-1 text-xs text-paper">
                      {a}
                    </span>
                  ))}
                </p>
              )}
            </Card>
            <Card className="bg-[linear-gradient(160deg,#E3EEFF,#F5F8FC)] ring-1 ring-brand/15 lg:col-span-5" delay={0.06}>
              <CardHead icon={HandCoins} eyebrow="Money manners" title="Tipping, bargaining, scams" />
              <dl className="mt-5 space-y-3 text-sm leading-relaxed">
                {insights.money.tipping && (
                  <div>
                    <dt className="eyebrow text-[0.55rem] text-brand">Tipping</dt>
                    <dd className="mt-1 text-ink/85">{insights.money.tipping}</dd>
                  </div>
                )}
                {insights.money.bargaining && (
                  <div>
                    <dt className="eyebrow text-[0.55rem] text-brand">Bargaining</dt>
                    <dd className="mt-1 text-ink/85">{insights.money.bargaining}</dd>
                  </div>
                )}
                {scams.length > 0 && (
                  <div>
                    <dt className="eyebrow text-[0.55rem] text-coral">Watch out for</dt>
                    <dd className="mt-1 space-y-1.5">
                      {scams.slice(0, 3).map((s) => (
                        <p key={s.name} className="flex gap-2 text-ink/85">
                          <TriangleAlert className="mt-1 size-3.5 shrink-0 text-coral" />
                          <span>
                            <span className="text-ink">{s.name}.</span> {s.avoid}
                          </span>
                        </p>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>

          {/* Row 4: events, each over a photo of it */}
          {events.length > 0 && (
            <div className="mt-3">
              <div className={cn("no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible", events.length >= 3 && "lg:grid-cols-4")}>
                {events.slice(0, 4).map((e, i) => (
                  <PhotoCard key={e.name} photo={`${e.name} ${city}`} thing delay={i * 0.06} className="flex min-h-[20rem] min-w-[80%] snap-start flex-col justify-end md:min-w-0">
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] text-paper ring-1 ring-white/25 backdrop-blur-md">
                      <Sparkles className="size-3 text-sun-2" /> {e.when}
                    </span>
                    {i === 0 && <span className="eyebrow mb-2 block text-[0.55rem] text-sun-2">While you&apos;re there</span>}
                    <span className="display block text-2xl leading-tight">{e.name}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-paper/80">{e.what}</span>
                    {e.where && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs text-paper/70">
                        <MapPin className="size-3" /> {e.where}
                      </span>
                    )}
                  </PhotoCard>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 grid gap-3 lg:grid-cols-12">
            {carbon && carbon.totalKg > 0 && (
              <Card className="isolate bg-[#0B3B2E] text-paper lg:col-span-12" delay={0.06}>
                <Pic name={`${city} forest`} thing credit={false} className="-z-10 opacity-40 mix-blend-luminosity" />
                <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,#0B3B2E_20%,rgba(11,59,46,0.85)_55%,rgba(14,31,59,0.6))]" />
                <div className="max-w-2xl">
                <span aria-hidden className="absolute -right-14 -top-14 size-48 rounded-full bg-emerald-400/20 blur-3xl" />
                <CardHead icon={Leaf} eyebrow="Carbon footprint" title="This trip's footprint" dark />
                <p className="relative mt-4 flex items-baseline gap-2">
                  <span className="display text-5xl tabular-nums">{carbon.totalKg.toLocaleString("en-US")}</span>
                  <span className="text-paper/70">kg CO₂e</span>
                </p>
                <p className="relative text-xs text-paper/60">
                  About {perPerson.toLocaleString("en-US")} kg each, or {Math.max(1, Math.round((perPerson / 4700) * 100))}% of an average person&apos;s year.
                </p>
                <div className="relative mt-5 space-y-2.5">
                  {carbon.parts.map((p, i) => (
                    <div key={p.label}>
                      <div className="flex justify-between text-xs text-paper/75">
                        <span>{p.label}</span>
                        <span className="font-mono">{p.kg.toLocaleString("en-US")} kg</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(p.kg / maxPart) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease, delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sun-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {carbon.greener.length > 0 && (
                  <ul className="relative mt-5 space-y-1.5 text-sm text-paper/85">
                    {carbon.greener.map((g) => (
                      <li key={g} className="flex gap-2">
                        <Leaf className="mt-1 size-3.5 shrink-0 text-emerald-300" /> {g}
                      </li>
                    ))}
                  </ul>
                )}
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Trip tools: what's been spent against the budget, by category and by day.                       */
/* ---------------------------------------------------------------------------------------------- */

const CAT_COLOR: Record<string, string> = { food: "#FF6B5B", stay: "#1A5FD6", transport: "#7CC4FF", activities: "#FFD23F", shopping: "#E0645C", other: "#9DB4F0" };

export function SpendChart({ wallet, budgetUsd, startDate, days }: { wallet?: Wallet; budgetUsd: number; startDate: string; days: number }) {
  const { convert } = useMoney();
  if (!wallet || !wallet.expenses.length) return null;
  const cur = wallet.currency;
  const total = wallet.expenses.reduce((n, e) => n + e.amount, 0);
  const budget = cur === "USD" ? budgetUsd : (convert(budgetUsd, cur) ?? 0);
  const pct = budget > 0 ? Math.min(1.5, total / budget) : 0;
  const byCat = EXPENSE_CATEGORIES.map((c) => ({ c, v: wallet.expenses.filter((e) => e.category === c).reduce((n, e) => n + e.amount, 0) })).filter((x) => x.v > 0);
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const byDay = dates.map((d) => wallet.expenses.filter((e) => e.date === d).reduce((n, e) => n + e.amount, 0));
  const maxDay = Math.max(1, ...byDay, budget / Math.max(1, days));
  const perDay = budget / Math.max(1, days);
  const money = (v: number) => formatMoney(Math.round(v), cur, 0);
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <Card className="mt-6 bg-white ring-1 ring-line">
      <CardHead icon={WalletIcon} eyebrow="Spending" title="Spent vs budget" />
      <div className="mt-6 grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        {/* the ring: how much of the budget is gone */}
        <div className="relative mx-auto size-40">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#EAF0F8" strokeWidth="12" />
            <motion.circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={pct > 1 ? "#FF6B5B" : "#1A5FD6"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              whileInView={{ strokeDashoffset: C * (1 - Math.min(1, pct)) }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <span>
              <span className="display block text-2xl text-ink">{Math.round(pct * 100)}%</span>
              <span className="block text-[11px] text-stone">of {money(budget)}</span>
            </span>
          </div>
        </div>
        <div className="space-y-6">
          {/* by category */}
          <div>
            <div className="flex h-3 overflow-hidden rounded-full bg-paper-2">
              {byCat.map((x) => (
                <motion.span key={x.c} initial={{ width: 0 }} whileInView={{ width: `${(x.v / total) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, ease }} style={{ background: CAT_COLOR[x.c] }} className="h-full" />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone">
              {byCat.map((x) => (
                <li key={x.c} className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: CAT_COLOR[x.c] }} />
                  <span className="capitalize text-ink/80">{x.c}</span> {money(x.v)}
                </li>
              ))}
            </ul>
          </div>
          {/* by day, against the daily budget */}
          <div>
            <div className="relative flex h-28 items-end gap-1.5">
              <span aria-hidden className="absolute inset-x-0 border-t border-dashed border-coral/60" style={{ bottom: `${(perDay / maxDay) * 100}%` }}>
                <span className="absolute -top-4 right-0 text-[10px] text-coral">daily budget</span>
              </span>
              {byDay.map((v, i) => (
                <div key={i} className="flex h-full flex-1 flex-col justify-end">
                  <motion.span
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(v / maxDay) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease, delay: i * 0.05 }}
                    title={money(v)}
                    className={cn("block min-h-[2px] rounded-t-md", v > perDay ? "bg-coral" : "bg-brand")}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex gap-1.5 text-center font-mono text-[10px] text-stone">
              {byDay.map((_, i) => (
                <span key={i} className="flex-1">
                  D{i + 1}
                </span>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm text-stone">
            <Coins className="size-4 text-brand" /> {money(total)} spent{budget > 0 && <> · {total <= budget ? `${money(budget - total)} left` : `${money(total - budget)} over`}</>}
            <Users className="ml-2 size-4 text-brand" /> {wallet.people.length || 1} in the wallet
          </p>
        </div>
      </div>
    </Card>
  );
}
