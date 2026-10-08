"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Loader2, Plus, Printer, Search, Trash2, Users, Wallet } from "@/components/site/icons";
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
import { COMPANIONS, VIBES, labelFor, titleCase } from "@/lib/trip";

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

function Postcard({ it, index, onDelete }: { it: Itinerary; index: number; onDelete: (id: string) => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { scene } = useDestinationScene([it.destination, it.place].filter(Boolean).join(", "), it.landscape);
  const photo = useDestinationPhoto(it.place || it.destination);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.06, 0.4) }}
      className="group flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_40px_80px_-50px_rgba(10,30,44,0.5)]"
      // Opening a trip is instant when its data is already on the way.
      onPointerEnter={() => prefetchJson(`/api/itinerary/${it.id}`)}
      onFocusCapture={() => prefetchJson(`/api/itinerary/${it.id}`)}
    >
      <Link href={`/dashboard/itinerary/${it.id}`} className="relative block h-56 overflow-hidden" aria-label={`Open ${titleCase(it.destination)} itinerary`}>
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.06]">
          <LazyScene id={scene} tint={SCENES[scene].tint} />
          <HeroPhoto photo={photo} credit={false} lazy drift={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
        <span className="absolute right-4 top-4 rounded-md border border-dashed border-paper/70 bg-paper/15 px-2.5 py-1.5 text-center text-paper backdrop-blur-sm">
          <span className="display block text-xl leading-none">{it.numberOfDays}</span>
          <span className="eyebrow block text-[0.52rem]">{it.numberOfDays === 1 ? "day" : "days"}</span>
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
          <p className="eyebrow text-[0.6rem] text-paper/70">
            {formatDate(it.startDate, false)} – {formatDate(it.endDate)}
          </p>
          <h3 className="display mt-2 flex items-center gap-2.5 text-[1.87rem] leading-none">
            <Flag code={countryCodeFor(it.place || it.destination, it.country)} className="h-[0.6em]" />
            <span className="truncate">{titleCase(it.destination)}</span>
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs text-ink/75">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5">
            <Users className="size-3.5 text-brand" /> {it.numberOfPeople} {it.numberOfPeople === 1 ? "traveller" : "travellers"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5">
            <Wallet className="size-3.5 text-brand" /> ${it.budget.toLocaleString("en-US")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5">{labelFor(COMPANIONS, it.tripType)}</span>
        </div>
        {it.interests.length > 0 && (
          <p className="mt-4 text-sm text-stone">
            {it.interests.slice(0, 3).map((i) => labelFor(VIBES, i)).join(" · ")}
            {it.interests.length > 3 && ` +${it.interests.length - 3}`}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <AnimatePresence mode="wait" initial={false}>
              {confirming ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <span className="text-sm text-ink">Delete this trip?</span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-paper-2"
                    >
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
                </motion.div>
              ) : (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <span className="whitespace-nowrap text-xs text-stone" title={`Created ${formatDate(it.createdAt)}`}>
                    Created {formatDate(it.createdAt, false)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/itinerary/${it.id}?print=1`}
                      aria-label={`Print ${it.destination} itinerary`}
                      title="Print or save as PDF"
                      className="grid size-9 place-items-center rounded-full text-ink/60 transition-colors hover:bg-paper-2 hover:text-ink"
                    >
                      <Printer className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      aria-label={`Delete ${it.destination} itinerary`}
                      title="Delete"
                      className="grid size-9 place-items-center rounded-full text-ink/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <Link
                      href={`/dashboard/itinerary/${it.id}`}
                      className="ml-1 inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-sm text-paper transition-colors hover:bg-brand"
                    >
                      Open <ArrowUpRight className="size-3.5" />
                    </Link>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
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
          <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[0.92] text-ink">
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
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-[28px] bg-white ring-1 ring-line">
                <div className="skeleton h-56" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-4 w-2/3 rounded-full" />
                  <div className="skeleton h-4 w-1/2 rounded-full" />
                  <div className="skeleton mt-6 h-9 rounded-full" />
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
              <h2 className="display mt-4 text-4xl leading-[0.95]">
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
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filtered.map((it, index) => (
                <Postcard key={it.id} it={it} index={index} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ItinerariesPage() {
  return <ItinerariesContent />;
}
