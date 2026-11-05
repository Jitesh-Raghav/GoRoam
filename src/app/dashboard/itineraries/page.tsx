"use client";

import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Loader2, Plus, Printer, Search, Trash2 } from "@/components/site/icons";
import { CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { Scene } from "@/components/scenes/scene";
import { SCENES } from "@/components/scenes/scenes";
import { PillLink } from "@/components/site/pill";
import { SplitText } from "@/components/motion/split-text";
import { invalidate, prefetchJson, updateCached, useCachedJson } from "@/lib/cached-json";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { useDestinationPhoto } from "@/lib/use-destination-photo";
import { HeroPhoto } from "@/components/itinerary/hero-photo";
import { countryCodeFor } from "@/lib/flags";
import { Flag } from "@/components/itinerary/guide/flag";
import { cn } from "@/lib/utils";
import { COMPANIONS, labelFor, titleCase } from "@/lib/trip";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  place?: string;
  landscape?: string;
  country?: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  status: string;
  createdAt: string;
}

const formatDate = (dateString: string, withYear = true) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });


const LIST_URL = "/api/itineraries";

function Postcard({ it, onDelete }: { it: Itinerary; onDelete: (id: string) => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [covered, setCovered] = useState(false);
  const onShown = useCallback(() => setCovered(true), []);
  const { scene } = useDestinationScene([it.destination, it.place].filter(Boolean).join(", "), it.landscape);
  const photo = useDestinationPhoto(it.place || it.destination);
  const href = `/dashboard/itinerary/${it.id}`;
  const place = titleCase(it.destination);

  return (
    <motion.article
      layout
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group"
      // Opening a trip is instant when its data is already on the way.
      onPointerEnter={() => prefetchJson(`/api/itinerary/${it.id}`)}
      onFocusCapture={() => prefetchJson(`/api/itinerary/${it.id}`)}
    >
      {/* The photo opens the trip too; the name below is the one link keyboards and screen readers get. */}
      <Link href={href} className={CARD_LINK} tabIndex={-1} aria-hidden>
        <div className={cn(CARD_PHOTO, "aspect-[4/3]")}>
          <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]">
            {!covered && <LazyScene id={scene} tint={SCENES[scene].tint} paused />}
            <HeroPhoto photo={photo} credit={false} lazy onShown={onShown} />
          </div>
        </div>
      </Link>

      <div className="mt-3.5 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <Link href={href} className="flex items-center gap-2 outline-none focus-visible:underline">
            <Flag code={countryCodeFor(it.place || it.destination, it.country)} className="h-[0.8rem] shrink-0" />
            <h3 className={cn(CARD_TITLE, "truncate")}>{place}</h3>
          </Link>
          <p className={cn(CARD_META, "mt-1")}>
            {formatDate(it.startDate, false)} – {formatDate(it.endDate)} · {it.numberOfDays} {it.numberOfDays === 1 ? "day" : "days"}
          </p>
          <p className={cn(CARD_META, "mt-0.5 truncate")}>
            {it.numberOfPeople} {it.numberOfPeople === 1 ? "traveller" : "travellers"} · {labelFor(COMPANIONS, it.tripType)} · ${it.budget.toLocaleString("en-US")}
          </p>
        </div>
        <div className="-mr-2 -mt-1 flex shrink-0 items-center">
          <Link
            href={`${href}?print=1`}
            aria-label={`Print ${place} itinerary`}
            title="Print or save as PDF"
            className="grid size-9 place-items-center rounded-full text-stone transition-colors hover:bg-paper-2 hover:text-ink"
          >
            <Printer className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${place} itinerary`}
            title="Delete"
            className="grid size-9 place-items-center rounded-full text-stone transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {confirming && (
        <div role="alertdialog" aria-label={`Delete ${place}?`} className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-paper-2 py-1.5 pl-4 pr-1.5">
          <span className="text-sm text-ink">Delete this trip?</span>
          <span className="flex gap-1">
            <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-paper-3">
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                await onDelete(it.id);
                setDeleting(false);
                setConfirming(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3.5 py-1.5 text-sm text-white disabled:opacity-60"
            >
              {deleting && <Loader2 className="size-3.5 animate-spin" />} Delete
            </button>
          </span>
        </div>
      )}
    </motion.article>
  );
}

function ItinerariesContent() {
  const { data: session } = useSession();
  const list = useCachedJson<{ data: Itinerary[] }>(session?.user?.email ? LIST_URL : null);
  const itineraries = useMemo(() => list.data?.data ?? [], [list.data]);
  const loading = list.loading;
  const error = list.error ?? null;
  const [query, setQuery] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/itinerary/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        updateCached<{ data: Itinerary[] }>(LIST_URL, (d) => ({ ...d, data: d.data.filter((i) => i.id !== id) }));
        invalidate(`/api/itinerary/${id}`);
      } else setDeleteError(data.error || "Couldn't delete that itinerary.");
    } catch {
      setDeleteError("Network error. Please try again.");
    }
  };

  const filtered = useMemo(
    () => itineraries.filter((i) => i.destination.toLowerCase().includes(query.trim().toLowerCase())),
    [itineraries, query]
  );
  const stats = useMemo(
    () => [
      { label: "Trips planned", value: itineraries.length },
      { label: "Days of adventure", value: itineraries.reduce((s, i) => s + i.numberOfDays, 0) },
      { label: "Destinations", value: new Set(itineraries.map((i) => i.destination.toLowerCase().trim())).size },
      { label: "Travellers", value: itineraries.reduce((s, i) => s + i.numberOfPeople, 0) },
    ],
    [itineraries]
  );

  return (
    <div className="mx-auto max-w-[80rem]">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-stone">Your collection</p>
          <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[1] text-ink">
            <SplitText text="Every trip," trigger="mount" className="block" />
            <SplitText segments={[{ text: "beautifully", className: "accent" }, { text: " kept." }]} trigger="mount" delay={0.12} className="block" />
          </h1>
        </div>
        <PillLink href="/dashboard" variant="ink" icon={<Plus className="size-4" />}>
          New trip
        </PillLink>
      </header>

      {!loading && !error && itineraries.length > 0 && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-3xl bg-white/80 p-5 ring-1 ring-line">
                <p className="display text-4xl leading-none text-ink">{s.value}</p>
                <p className="mt-2 text-sm text-stone">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex h-12 w-full items-center gap-3 rounded-full bg-white/80 px-5 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand/40 sm:max-w-sm">
              <Search className="size-4 text-stone" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations"
                aria-label="Search destinations"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-2"
              />
            </label>
            <p className="text-sm text-stone">
              Showing {filtered.length} of {itineraries.length}
            </p>
          </div>
        </>
      )}

      {deleteError && <p className="mt-6 text-sm text-destructive">{deleteError}</p>}

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="skeleton aspect-[4/3] rounded-[1.25rem]" />
                <div className="mt-4 space-y-2.5 px-0.5">
                  <div className="skeleton h-5 w-1/2 rounded-full" />
                  <div className="skeleton h-3.5 w-2/3 rounded-full" />
                  <div className="skeleton h-3.5 w-3/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[28px] bg-white/80 p-10 text-center ring-1 ring-line">
            <p className="display text-2xl">We couldn&apos;t load your trips.</p>
            <p className="mx-auto mt-3 max-w-md text-stone">{error}</p>
            <button
              type="button"
              onClick={() => invalidate(LIST_URL)}
              className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-brand"
            >
              Try again
            </button>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="relative overflow-hidden rounded-[36px] bg-ink">
            <div className="absolute inset-0">
              <Scene id="peaks" intro />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />
            <div className="relative max-w-lg p-8 py-16 text-paper sm:p-14">
              <p className="eyebrow text-paper/60">Nothing here yet</p>
              <h2 className="display mt-4 text-4xl leading-[1.02]">
                Your first adventure is <span className="accent">one sentence</span> away.
              </h2>
              <p className="mt-4 text-paper/70">Tell GoRoam where you&apos;re dreaming of and we&apos;ll plan every day of it.</p>
              <PillLink href="/dashboard" variant="paper" className="mt-8">
                Plan your first trip
              </PillLink>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] bg-white/80 p-10 text-center ring-1 ring-line">
            <CalendarDays className="mx-auto size-6 text-brand" />
            <p className="display mt-3 text-2xl">No trips match “{query}”.</p>
            <button type="button" onClick={() => setQuery("")} className={cn("mt-4 text-sm text-ink underline underline-offset-4")}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {filtered.map((it) => (
                <Postcard key={it.id} it={it} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ItinerariesPage() {
  return <ItinerariesContent />;
}
