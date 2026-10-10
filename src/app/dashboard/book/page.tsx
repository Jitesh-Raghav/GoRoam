"use client";

/* eslint-disable @next/next/no-img-element -- small looked-up thumbnails, already sized by the photo API */

import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowUpRight, Baby, CalendarDays, Check, MapPin, Minus, Navigation, Plane, Plus, ShieldCheck, User } from "@/components/site/icons";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { BOOKING_TABS, partnersFor } from "@/components/itinerary/booking-panel";
import { SplitText } from "@/components/motion/split-text";
import type { SceneId } from "@/components/scenes/scenes";
import { PhotoPanel } from "@/components/site/photo-panel";
import { BRAND_PHOTOS, PHOTO_QUERIES, sizedPhoto, useBrandPhoto, usePlacePhoto } from "@/lib/brand-photos";
import { cityOf, isoDay, type BookingKind, type BookingQuery } from "@/lib/booking";
import { DESTINATIONS, type Destination } from "@/lib/destinations";
import { titleCase } from "@/lib/trip";
import { useCachedJson } from "@/lib/cached-json";
import { useDebounced } from "@/lib/use-debounced";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface TripSummary {
  id: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  numberOfPeople: number;
}

/** Drawn under each tab's photo, and shown if none loads. */
const TAB_SCENES: Record<BookingKind, SceneId> = { flights: "journey", stays: "coast", experiences: "dunes", transport: "peaks" };

/** Ideas for an empty "To" field: places the photo lookup knows well. */
const POPULAR = ["eiffel-tower", "burj-khalifa", "santorini", "colosseum", "statue-of-liberty", "sydney-opera-house"]
  .map((slug) => DESTINATIONS.find((d) => d.slug === slug))
  .filter((d): d is Destination => !!d);

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Plane; children: ReactNode }) {
  return (
    <label className="flex h-[4.25rem] min-w-0 cursor-text items-center gap-3 rounded-2xl bg-paper/60 px-4 ring-1 ring-line transition-shadow focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/50">
      <Icon className="size-4 shrink-0 text-brand" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="eyebrow text-[0.58rem] text-stone">{label}</span>
        {children}
      </span>
    </label>
  );
}

const input = "mt-1 w-full min-w-0 bg-transparent text-[1rem] text-ink outline-none placeholder:text-stone-2";

function Counter({ label, icon: Icon, value, onChange, min, max }: { label: string; icon: typeof Plane; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex h-[4.25rem] items-center gap-3 rounded-2xl bg-paper/60 px-4 ring-1 ring-line">
      <Icon className="size-4 shrink-0 text-brand" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="eyebrow text-[0.58rem] text-stone">{label}</span>
        <span className="mt-1 text-[1rem] text-ink" aria-live="polite">
          {value}
        </span>
      </span>
      <div className="flex gap-1">
        {[-1, 1].map((d) => (
          <button
            key={d}
            type="button"
            aria-label={`${d < 0 ? "Fewer" : "More"} ${label.toLowerCase()}`}
            disabled={d < 0 ? value <= min : value >= max}
            onClick={() => onChange(Math.max(min, Math.min(max, value + d)))}
            className="grid size-8 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink"
          >
            {d < 0 ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One of your upcoming trips, with a photo of where it goes: tap to fill the search. */
function TripChip({ trip, onPick }: { trip: TripSummary; onPick: () => void }) {
  const place = titleCase(trip.destination);
  const photo = sizedPhoto(usePlacePhoto(place), 120);
  const [broken, setBroken] = useState<string | null>(null);
  const url = photo?.url && photo.url !== broken ? photo.url : null;
  return (
    <button
      type="button"
      onClick={onPick}
      className="group inline-flex items-center gap-2 rounded-full bg-paper-2 py-1 pl-1 pr-3.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-paper-3 text-brand">
        {url ? (
          <img src={url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(url)} className="size-full object-cover" />
        ) : (
          <MapPin className="size-3.5" />
        )}
      </span>
      {cityOf(place)} · {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
    </button>
  );
}

/** A popular place as a photo card: tap to search it. */
function PopularCard({ place, active, onPick }: { place: Destination; active: boolean; onPick: () => void }) {
  const photo = sizedPhoto(usePlacePhoto(place.query), 720);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cn(
        "group relative block w-full overflow-hidden rounded-card text-left outline-none ring-offset-2 ring-offset-paper transition-shadow focus-visible:ring-2 focus-visible:ring-brand",
        active && "ring-2 ring-brand"
      )}
    >
      <PhotoPanel photo={photo} scene={place.scene} credit={false} className="aspect-[4/5] transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]">
        <span className="absolute inset-x-4 bottom-4 text-paper">
          <span className="eyebrow block text-[0.6rem] text-paper/75">Best {place.bestTime}</span>
          <span className="display mt-1.5 block text-[1.35rem] leading-tight">{cityOf(place.query)}</span>
          <span className="mt-1 block text-xs text-paper/70">{place.days}</span>
        </span>
        <span
          className={cn(
            "absolute right-3 top-3 grid size-8 place-items-center rounded-full transition-colors",
            active ? "bg-paper text-ink" : "bg-ink/35 text-paper backdrop-blur-md group-hover:bg-paper group-hover:text-ink"
          )}
        >
          {active ? <Check className="size-4" /> : <ArrowUpRight className="size-4" />}
        </span>
      </PhotoPanel>
    </button>
  );
}

function BookContent() {
  const today = isoDay(new Date().toISOString(), 0);
  const [kind, setKind] = useState<BookingKind>("flights");
  const [q, setQ] = useState<BookingQuery>({
    origin: "",
    destination: "",
    checkIn: isoDay(new Date().toISOString(), 21),
    checkOut: isoDay(new Date().toISOString(), 25),
    adults: 2,
    children: 0,
  });
  const searchRef = useRef<HTMLElement>(null);
  // Shared with "My itineraries", so it's usually cached already.
  const saved = useCachedJson<{ data: TripSummary[] }>("/api/itineraries").data?.data;
  const trips = useMemo(() => (saved ?? []).filter((t) => t.startDate.slice(0, 10) >= today).slice(0, 6), [saved, today]);

  const set = <K extends keyof BookingQuery>(k: K, v: BookingQuery[K]) => setQ((prev) => ({ ...prev, [k]: v }));
  const ready = q.destination.trim().length > 1;
  const query = useMemo(() => ({ ...q, destination: titleCase(q.destination || "Anywhere") }), [q]);
  const partners = partnersFor(kind, query);
  const tab = BOOKING_TABS.find((t) => t.id === kind) ?? BOOKING_TABS[0];

  // The banner shows where you're going once you've typed it, and the kind of booking until then.
  const typed = useDebounced(q.destination.trim(), 500);
  const place = typed.length >= 3 ? titleCase(typed) : "";
  const placePhoto = usePlacePhoto(place, !!place);
  const tabPhoto = useBrandPhoto(BRAND_PHOTOS.book[kind], PHOTO_QUERIES.book[kind]);
  const banner = place && placePhoto ? placePhoto : tabPhoto;

  const fillFromTrip = (t: TripSummary) =>
    setQ((prev) => ({
      ...prev,
      destination: titleCase(t.destination),
      checkIn: isoDay(t.startDate, 0),
      checkOut: isoDay(t.startDate, Math.max(t.numberOfDays - 1, 1)),
      adults: Math.max(t.numberOfPeople, 1),
      children: 0,
    }));

  const pickPopular = (d: Destination) => {
    set("destination", d.query);
    track("booking_idea_picked", { destination: d.query });
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-[80rem]">
      <header>
        <p className="eyebrow text-stone">Book travel</p>
        <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[1] text-ink">
          <SplitText text="Flights, stays" trigger="mount" className="block" />
          <SplitText segments={[{ text: "& the " }, { text: "good stuff.", className: "accent" }]} trigger="mount" delay={0.12} className="block" />
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone">Search once. We open the sites you already use with your route, dates and party filled in.</p>
      </header>

      <section ref={searchRef} aria-label="Search" className="mt-10 scroll-mt-6 overflow-hidden rounded-panel bg-white shadow-card ring-1 ring-line">
        <PhotoPanel photo={banner} scene={TAB_SCENES[kind]} lazy={false} creditClassName="bottom-auto top-4" className="h-56 sm:h-72 lg:h-80">
          {place && (
            <span className="absolute left-4 top-4 inline-flex max-w-[60%] items-center gap-1.5 rounded-full bg-ink/40 px-3 py-1.5 text-xs text-paper ring-1 ring-inset ring-paper/20 backdrop-blur-md sm:left-6 sm:top-6">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{place}</span>
            </span>
          )}
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="display hidden text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.05] text-paper drop-shadow-[0_2px_18px_rgba(10,28,39,0.35)] sm:block">
              {place ? (
                <>
                  {tab.label === "Tickets" ? "Tickets & tours" : tab.label} for <span className="accent">{cityOf(place)}.</span>
                </>
              ) : (
                <>
                  Where to <span className="accent">next?</span>
                </>
              )}
            </p>
            <div role="tablist" aria-label="What to book" className="no-scrollbar flex gap-1 self-start overflow-x-auto rounded-full bg-ink/45 p-1 backdrop-blur-md sm:self-auto">
              {BOOKING_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={kind === t.id}
                  onClick={() => setKind(t.id)}
                  className={cn("relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors", kind === t.id ? "text-ink" : "text-paper/85 hover:text-paper")}
                >
                  {kind === t.id && <motion.span layoutId="book-tab" className="absolute inset-0 rounded-full bg-paper" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <t.icon className="relative size-4" />
                  <span className="relative">{t.id === "experiences" ? "Tickets & tours" : t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </PhotoPanel>

        <div className="p-4 sm:p-6">
          <div className="relative grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="From" icon={Navigation}>
              <input value={q.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Your city" className={input} />
            </Field>
            <Field label="To" icon={Plane}>
              <input value={q.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Where to?" className={input} autoFocus />
            </Field>
            <button
              type="button"
              aria-label="Swap origin and destination"
              onClick={() => setQ((p) => ({ ...p, origin: p.destination, destination: p.origin ?? "" }))}
              className="absolute left-1/2 top-[2.1rem] hidden size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper shadow-lg transition-transform duration-500 hover:rotate-180 md:grid xl:left-1/4"
            >
              <ArrowLeftRight className="size-3.5" />
            </button>
            <Field label="Depart · check-in" icon={CalendarDays}>
              <input
                type="date"
                min={today}
                value={q.checkIn}
                onChange={(e) => {
                  const v = e.target.value;
                  setQ((p) => ({ ...p, checkIn: v, checkOut: p.checkOut <= v ? isoDay(`${v}T00:00:00Z`, 1) : p.checkOut }));
                }}
                className={input}
              />
            </Field>
            <Field label="Return · check-out" icon={CalendarDays}>
              <input type="date" min={q.checkIn} value={q.checkOut} onChange={(e) => set("checkOut", e.target.value)} className={input} />
            </Field>
            <div className="xl:col-span-2">
              <Counter label="Adults" icon={User} value={q.adults} onChange={(v) => set("adults", v)} min={1} max={16} />
            </div>
            <div className="xl:col-span-2">
              <Counter label="Children" icon={Baby} value={q.children ?? 0} onChange={(v) => set("children", v)} min={0} max={10} />
            </div>
          </div>

          {trips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1 text-[0.58rem] text-stone">Your upcoming trips</span>
              {trips.map((t) => (
                <TripChip key={t.id} trip={t} onPick={() => fillFromTrip(t)} />
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p, i) => (
              <motion.a
                key={`${kind}-${p.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                href={ready ? p.href : undefined}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => track("booking_partner_clicked", { partner: p.id, kind, where: "book" })}
                aria-disabled={!ready}
                className="group flex min-w-0 items-center gap-4 rounded-card bg-white p-4 ring-1 ring-line transition-[box-shadow,background-color,color] duration-300 hover:bg-ink hover:text-paper hover:shadow-float aria-disabled:pointer-events-none aria-disabled:opacity-45 sm:p-5"
              >
                <span aria-hidden className="display grid size-11 shrink-0 place-items-center rounded-xl bg-paper-2 text-lg text-ink transition-colors group-hover:bg-paper/10 group-hover:text-paper">
                  {p.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="display block text-xl leading-none">{p.name}</span>
                  <span className="mt-1.5 block truncate text-sm text-stone transition-colors group-hover:text-paper/70">{p.blurb}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper transition-[transform,background-color,color] duration-500 group-hover:rotate-45 group-hover:bg-paper group-hover:text-ink">
                  <ArrowUpRight className="size-4" />
                </span>
              </motion.a>
            ))}
          </div>
          {!ready && <p className="mt-3 text-sm text-stone">Add a destination to open the booking sites.</p>}
        </div>
      </section>

      <p className="mt-6 flex items-start gap-2 text-sm text-stone">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
        You book directly on these sites, so payments, changes and refunds stay with them. Some links earn GoRoam a small commission, never a markup.
      </p>

      {/* Ideas, as real photos: one tap fills the search. */}
      <section aria-labelledby="ideas" className="mt-16">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-brand">Need an idea?</p>
            <h2 id="ideas" className="display mt-3 text-3xl text-ink">
              Popular right now
            </h2>
          </div>
          <p className="text-sm text-stone">Tap a place to search it.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {POPULAR.map((d) => (
            <PopularCard key={d.slug} place={d} active={q.destination === d.query} onPick={() => pickPopular(d)} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function BookPage() {
  return <BookContent />;
}
