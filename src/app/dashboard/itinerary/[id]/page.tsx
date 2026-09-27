'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Download,
  Heart,
  MapPin,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Users,
  Wallet,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Scene } from '@/components/scenes/scene';
import { PillLink } from '@/components/site/pill';
import { sceneForDestination } from '@/lib/destinations';
import { cn } from '@/lib/utils';

interface PlaceDetails {
  name: string;
  description: string;
  googleMapsLink: string;
}

interface ActivitySlot {
  time: string;
  place: PlaceDetails;
  duration: string;
  estimatedCost: number;
}

interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  morning: ActivitySlot;
  afternoon: ActivitySlot;
  evening: ActivitySlot;
  totalDayCost: number;
}

interface ItineraryData {
  itinerary: DayItinerary[];
  summary: {
    totalCost: number;
    totalDays: number;
    destination: string;
    highlights: string[];
  };
}

interface ItineraryDetails {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  itineraryData: ItineraryData;
  createdAt: string;
}

const SLOTS = [
  { key: 'morning', label: 'Morning', icon: Sunrise },
  { key: 'afternoon', label: 'Afternoon', icon: Sun },
  { key: 'evening', label: 'Evening', icon: Moon },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;
const money = (n: number | undefined) => `$${Math.round(n ?? 0).toLocaleString('en-US')}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n: number) => String(n).padStart(2, '0');

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });

const dayDate = (startIso: string, offset: number) => {
  const d = new Date(startIso);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

// A search URL is more reliable than whatever link the model returns.
const mapsUrl = (place: string, destination: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, ${destination}`)}`;

function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="skeleton h-[min(60vh,520px)] rounded-[32px]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-3xl" />
        ))}
      </div>
      <div className="skeleton h-64 rounded-[28px]" />
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[36px] bg-ink">
      <div className="absolute inset-0">
        <Scene id="dunes" intro />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />
      <div className="relative max-w-lg p-8 py-20 text-paper sm:p-14">
        <p className="eyebrow text-paper/60">Itinerary not found</p>
        <h1 className="display mt-4 text-5xl leading-[0.95]">
          This trip seems to have <span className="italic text-brand-2">wandered off.</span>
        </h1>
        <p className="mt-4 text-paper/70">{message}</p>
        <PillLink href="/dashboard/itineraries" variant="paper" className="mt-8" icon={<ArrowLeft className="size-4" />}>
          Back to itineraries
        </PillLink>
      </div>
    </div>
  );
}

function Slot({
  slot,
  activity,
  destination,
  last,
}: {
  slot: (typeof SLOTS)[number];
  activity?: ActivitySlot;
  destination: string;
  last: boolean;
}) {
  if (!activity?.place?.name) return null;
  const Icon = slot.icon;
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease }}
      className="print-avoid relative pb-8 pl-16 last:pb-0"
    >
      {!last && <span aria-hidden className="absolute bottom-0 left-[21px] top-12 w-px bg-line" />}
      <span className="absolute left-0 top-0 grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-5" />
      </span>
      <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_30px_60px_-45px_rgba(21,19,15,0.5)] sm:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone">
          <span className="eyebrow text-[0.62rem] text-brand">{slot.label}</span>
          {activity.time && <span>{activity.time}</span>}
          {activity.duration && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" /> {activity.duration}
            </span>
          )}
          <span className="ml-auto font-mono text-xs text-ink">{activity.estimatedCost ? money(activity.estimatedCost) : 'Free'}</span>
        </div>
        <h4 className="display mt-3 text-[1.9rem] leading-[1.05] text-ink">{activity.place.name}</h4>
        {activity.place.description && <p className="mt-2 leading-relaxed text-stone">{activity.place.description}</p>}
        <a
          href={mapsUrl(activity.place.name, destination)}
          target="_blank"
          rel="noreferrer"
          className="no-print mt-4 inline-flex items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <MapPin className="size-4" /> Open in Google Maps <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </motion.li>
  );
}

function ItineraryContent() {
  const params = useParams();
  const [itinerary, setItinerary] = useState<ItineraryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const dayRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itinerary/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setItinerary(data.data);
        } else {
          setError(data.error || 'Failed to fetch itinerary');
        }
      } catch {
        setError('Failed to fetch itinerary');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItinerary();
    }
  }, [params.id]);

  // Opened from "Print" on the itineraries page.
  useEffect(() => {
    if (!itinerary) return;
    if (new URLSearchParams(window.location.search).get('print') === '1') {
      // Let the hero scene finish its entrance before the snapshot.
      const t = window.setTimeout(() => window.print(), 2400);
      return () => window.clearTimeout(t);
    }
  }, [itinerary]);

  const days = useMemo(() => itinerary?.itineraryData?.itinerary ?? [], [itinerary]);

  useEffect(() => {
    if (!days.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveDay(Number((e.target as HTMLElement).dataset.day));
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    dayRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [days.length]);

  if (loading) return <Loading />;
  if (error || !itinerary) return <NotFound message={error || 'The requested itinerary could not be found.'} />;

  const summary = itinerary.itineraryData?.summary;
  const highlights = summary?.highlights ?? [];
  const totalCost = summary?.totalCost ?? days.reduce((s, d) => s + (d.totalDayCost ?? 0), 0);
  const scene = sceneForDestination(itinerary.destination);
  const perDay = itinerary.budget / Math.max(itinerary.numberOfDays, 1);
  const maxDay = Math.max(perDay, ...days.map((d) => d.totalDayCost ?? 0), 1);
  const within = totalCost <= itinerary.budget;

  const jumpTo = (day: number) => {
    const el = dayRefs.current[day - 1];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Hero (doubles as the PDF cover) */}
      <section className="relative h-[min(64vh,580px)] min-h-[420px] overflow-hidden rounded-[32px] bg-ink print:h-[300px] print:min-h-0">
        <div className="absolute inset-0">
          <Scene id={scene} intro interactive title={itinerary.destination} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-ink/30" />
        <div className="no-print absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/dashboard/itineraries"
            className="inline-flex items-center gap-2 rounded-full bg-paper/15 px-4 py-2.5 text-sm text-paper ring-1 ring-inset ring-paper/25 backdrop-blur-md transition-colors hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="size-4" /> All trips
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-sm text-ink transition-colors hover:bg-brand hover:text-white"
          >
            <Download className="size-4" /> Download PDF
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.3 }} className="eyebrow text-paper/75">
            {cap(itinerary.tripType)} trip · {itinerary.numberOfDays} {itinerary.numberOfDays === 1 ? 'day' : 'days'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.4 }}
            className="display mt-3 max-w-4xl text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.88]"
          >
            {itinerary.destination}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }} className="mt-4 text-paper/80">
            {fmt(itinerary.startDate, { month: 'long', day: 'numeric' })} — {fmt(itinerary.endDate, { month: 'long', day: 'numeric', year: 'numeric' })}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 rounded-3xl bg-white/80 p-5 ring-1 ring-line lg:col-span-1">
          <p className="flex items-center gap-2 text-sm text-stone">
            <Wallet className="size-4 text-brand" /> Estimated total
          </p>
          <p className="display mt-3 text-5xl leading-none text-ink">{money(totalCost)}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalCost / Math.max(itinerary.budget, 1)) * 100, 100)}%` }}
              transition={{ duration: 1.4, ease, delay: 0.4 }}
              className={cn('h-full rounded-full', within ? 'bg-brand' : 'bg-destructive')}
            />
          </div>
          <p className="mt-2 text-xs text-stone">
            {within ? 'Within' : 'Over'} your {money(itinerary.budget)} budget
          </p>
        </div>
        <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-line">
          <p className="flex items-center gap-2 text-sm text-stone">
            <CalendarDays className="size-4 text-brand" /> Duration
          </p>
          <p className="display mt-3 text-5xl leading-none text-ink">{itinerary.numberOfDays}</p>
          <p className="mt-2 text-xs text-stone">{itinerary.numberOfDays === 1 ? 'day' : 'days'} of adventure</p>
        </div>
        <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-line">
          <p className="flex items-center gap-2 text-sm text-stone">
            <Users className="size-4 text-brand" /> Travellers
          </p>
          <p className="display mt-3 text-5xl leading-none text-ink">{itinerary.numberOfPeople}</p>
          <p className="mt-2 text-xs text-stone">{itinerary.numberOfPeople === 1 ? 'solo explorer' : 'in the group'}</p>
        </div>
        <div className="col-span-2 rounded-3xl bg-white/80 p-5 ring-1 ring-line lg:col-span-1">
          <p className="flex items-center gap-2 text-sm text-stone">
            <Heart className="size-4 text-brand" /> Travel style
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {itinerary.interests.map((i) => (
              <span key={i} className="rounded-full bg-paper-2 px-3 py-1 text-sm text-ink">
                {cap(i)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights + spend */}
      <section className="mt-5 grid gap-3 lg:grid-cols-12">
        {highlights.length > 0 && (
          <div className="print-avoid rounded-[28px] bg-ink p-7 text-paper sm:p-9 lg:col-span-7 print:col-span-12">
            <p className="eyebrow flex items-center gap-2 text-paper/60">
              <Sparkles className="size-3.5 text-brand-2" /> Trip highlights
            </p>
            <ol className="mt-6 space-y-5">
              {highlights.map((h, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                  className="flex gap-5 border-t border-paper/10 pt-5 first:border-t-0 first:pt-0"
                >
                  <span className="display text-3xl leading-none text-brand-2">{pad(i + 1)}</span>
                  <span className="text-lg leading-snug text-paper/90">{h}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        )}
        <div className={cn('print-avoid rounded-[28px] bg-white/80 p-7 ring-1 ring-line sm:p-9 print:hidden', highlights.length ? 'lg:col-span-5' : 'lg:col-span-12')}>
          <p className="eyebrow text-stone">Daily spend</p>
          <p className="mt-2 text-sm text-stone">Estimated cost per day against your daily budget of {money(perDay)}.</p>
          <div className="relative mt-8 flex h-44 items-end gap-2">
            <div className="absolute inset-x-0 border-t border-dashed border-brand/60" style={{ bottom: `${(perDay / maxDay) * 100}%` }}>
              <span className="eyebrow absolute -top-4 right-0 text-[0.55rem] text-brand">Budget / day</span>
            </div>
            {days.map((d, i) => (
              <button
                key={d.day ?? i}
                type="button"
                onClick={() => jumpTo(i + 1)}
                className="group relative flex h-full flex-1 flex-col justify-end"
                aria-label={`Day ${i + 1}: ${money(d.totalDayCost)}`}
              >
                <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-[10px] text-paper opacity-0 transition-opacity group-hover:opacity-100">
                  {money(d.totalDayCost)}
                </span>
                <motion.span
                  initial={{ height: 0 }}
                  whileInView={{ height: `${((d.totalDayCost ?? 0) / maxDay) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease, delay: i * 0.06 }}
                  className={cn(
                    'block w-full rounded-t-lg transition-colors',
                    activeDay === i + 1 ? 'bg-brand' : 'bg-ink/80 group-hover:bg-ink'
                  )}
                />
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {days.map((d, i) => (
              <span key={d.day ?? i} className="flex-1 text-center font-mono text-[10px] text-stone">
                D{i + 1}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Day navigator */}
      {days.length > 1 && (
        <nav aria-label="Days" className="no-print sticky top-16 z-20 -mx-4 mt-10 bg-paper/85 px-4 py-3 backdrop-blur-xl lg:top-0 lg:mx-0 lg:rounded-full lg:px-2 lg:py-2 lg:ring-1 lg:ring-line">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {days.map((d, i) => (
              <button
                key={d.day ?? i}
                type="button"
                onClick={() => jumpTo(i + 1)}
                className={cn(
                  'relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors',
                  activeDay === i + 1 ? 'text-paper' : 'text-ink/70 hover:bg-paper-2'
                )}
              >
                {activeDay === i + 1 && (
                  <motion.span layoutId="day-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                )}
                <span className="relative">Day {i + 1}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Days */}
      <div className="mt-4">
        {days.map((day, i) => (
          <section
            key={day.day ?? i}
            ref={(el) => {
              dayRefs.current[i] = el;
            }}
            data-day={i + 1}
            className="grid gap-8 border-t border-line py-12 lg:grid-cols-12 lg:gap-12 lg:py-16"
          >
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow text-stone">
                  Day {pad(i + 1)} · {dayDate(itinerary.startDate, i)}
                </p>
                <h3 className="display mt-4 text-[clamp(2.4rem,4vw,3.4rem)] leading-[0.95] text-ink">{day.theme || `Day ${i + 1}`}</h3>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper-2 px-3.5 py-1.5 text-sm text-ink">
                  <Wallet className="size-3.5 text-brand" /> {money(day.totalDayCost)} estimated
                </p>
              </div>
            </div>
            <ol className="lg:col-span-8">
              {SLOTS.map((slot, k) => (
                <Slot key={slot.key} slot={slot} activity={day[slot.key]} destination={itinerary.destination} last={k === SLOTS.length - 1} />
              ))}
            </ol>
          </section>
        ))}
      </div>

      {/* Outro */}
      <section className="no-print mt-4 flex flex-col items-start justify-between gap-6 rounded-[32px] bg-ink p-8 text-paper sm:flex-row sm:items-center sm:p-10">
        <div>
          <p className="display text-4xl leading-none">Bon voyage.</p>
          <p className="mt-2 text-paper/60">Take it offline, or start dreaming about the next one.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-paper/10 px-5 text-sm ring-1 ring-inset ring-paper/20 transition-colors hover:bg-paper hover:text-ink"
          >
            <Download className="size-4" /> Download PDF
          </button>
          <PillLink href="/dashboard" variant="brand" icon={<Plus className="size-4" />}>
            Plan another trip
          </PillLink>
        </div>
      </section>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <DashboardLayout>
      <ItineraryContent />
    </DashboardLayout>
  );
}
