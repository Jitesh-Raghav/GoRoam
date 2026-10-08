"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowUpRight, Baby, CalendarDays, Navigation, Plane, ShieldCheck, User } from "@/components/site/icons";
import { useMemo, useState, type ReactNode } from "react";
import { BOOKING_TABS, partnersFor } from "@/components/itinerary/booking-panel";
import { SplitText } from "@/components/motion/split-text";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { cityOf, isoDay, type BookingKind, type BookingQuery } from "@/lib/booking";
import { titleCase } from "@/lib/trip";
import { useCachedJson } from "@/lib/cached-json";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface TripSummary {
  id: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  numberOfPeople: number;
}

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
            {d < 0 ? "−" : "+"}
          </button>
        ))}
      </div>
    </div>
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
  // Shared with "My itineraries", so it's usually cached already.
  const saved = useCachedJson<{ data: TripSummary[] }>("/api/itineraries").data?.data;
  const trips = useMemo(() => (saved ?? []).filter((t) => t.startDate.slice(0, 10) >= today).slice(0, 6), [saved, today]);

  const set = <K extends keyof BookingQuery>(k: K, v: BookingQuery[K]) => setQ((prev) => ({ ...prev, [k]: v }));
  const ready = q.destination.trim().length > 1;
  const query = useMemo(() => ({ ...q, destination: titleCase(q.destination || "Anywhere") }), [q]);
  const partners = partnersFor(kind, query);

  const fillFromTrip = (t: TripSummary) =>
    setQ((prev) => ({
      ...prev,
      destination: titleCase(t.destination),
      checkIn: isoDay(t.startDate, 0),
      checkOut: isoDay(t.startDate, Math.max(t.numberOfDays - 1, 1)),
      adults: Math.max(t.numberOfPeople, 1),
      children: 0,
    }));

  return (
    <div className="mx-auto max-w-[80rem]">
      <header>
        <p className="eyebrow text-stone">Book travel</p>
        <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[0.92] text-ink">
          <SplitText text="Flights, stays" trigger="mount" className="block" />
          <SplitText segments={[{ text: "& the " }, { text: "good stuff.", className: "accent" }]} trigger="mount" delay={0.12} className="block" />
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone">Search once. We open the best partners with your route, dates and party already filled in.</p>
      </header>

      <section className="mt-10 overflow-hidden rounded-[32px] bg-white/80 ring-1 ring-line">
        <div className="relative h-48 overflow-hidden sm:h-64">
          {/* Plane, train and coach on the move: the journey rather than the destination. */}
          <LazyScene id="journey" tint={SCENES.journey.tint} align="xMidYMid slice" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div role="tablist" aria-label="What to book" className="absolute bottom-4 left-4 right-4 flex gap-1 overflow-x-auto rounded-full bg-ink/40 p-1 backdrop-blur-md sm:right-auto">
            {BOOKING_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={kind === t.id}
                onClick={() => setKind(t.id)}
                className={cn("relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors", kind === t.id ? "text-ink" : "text-paper/80 hover:text-paper")}
              >
                {kind === t.id && <motion.span layoutId="book-tab" className="absolute inset-0 rounded-full bg-paper" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <t.icon className="relative size-4" />
                <span className="relative">{t.id === "experiences" ? "Tickets & tours" : t.label}</span>
              </button>
            ))}
          </div>
        </div>

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
                <button key={t.id} type="button" onClick={() => fillFromTrip(t)} className="rounded-full bg-paper-2 px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
                  {cityOf(titleCase(t.destination))} · {new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group flex items-center gap-4 rounded-[24px] bg-ink p-5 text-paper transition-colors hover:bg-brand aria-disabled:pointer-events-none aria-disabled:opacity-40"
              >
                <span className="min-w-0 flex-1">
                  <span className="display block text-2xl leading-none">{p.name}</span>
                  <span className="mt-1.5 block truncate text-sm text-paper/60 group-hover:text-paper/85">{p.blurb}</span>
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper/10 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" />
                </span>
              </motion.a>
            ))}
          </div>
          {!ready && <p className="mt-3 text-sm text-stone">Add a destination to open our partners.</p>}
        </div>
      </section>

      <p className="mt-6 flex items-start gap-2 text-sm text-stone">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
        You book directly with trusted partners, so payments, changes and refunds stay with them. GoRoam may earn a small commission, never a markup.
      </p>
    </div>
  );
}

export default function BookPage() {
  return <BookContent />;
}
