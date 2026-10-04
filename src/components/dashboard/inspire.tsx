"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CloudSun, Compass, Loader2, Plane, RefreshCw, Sparkles, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Idea } from "@/app/api/inspire/route";
import { Flag } from "@/components/itinerary/guide/flag";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { sceneForDestination } from "@/lib/destinations";
import { countryCodeFor } from "@/lib/flags";
import { VIBES, money } from "@/lib/trip";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "Not sure where?" Pick a month and a feel, and get four places that are at their
 * best then, with rough cost, flight time and weather. "Plan this" fills the form.
 */
export function Inspire({
  from,
  companions,
  budget,
  days,
  interests,
  onPick,
  className,
}: {
  from: string;
  companions: string;
  budget: number;
  days: number;
  interests: string[];
  onPick: (destination: string, month: number) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() + i + 1, 1));
  const [month, setMonth] = useState(months[0].getMonth() + 1);
  const [vibes, setVibes] = useState<string[]>(interests.slice(0, 3));
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const find = async (more = false) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, budget, days, from, companions, vibes, exclude: more ? seen : [] }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) throw new Error(body.error || "Couldn't find ideas just now.");
      setIdeas(body.ideas);
      setSeen((s) => [...new Set([...(more ? s : []), ...body.ideas.map((i: Idea) => i.destination)])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't find ideas just now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("group inline-flex items-center gap-2 rounded-full bg-sun-soft px-3.5 py-2 text-sm text-ink ring-1 ring-sun/30 transition-colors hover:bg-ink hover:text-paper", className)}
      >
        <Compass className="size-4 text-brand transition-transform duration-700 group-hover:rotate-[200deg] group-hover:text-sun-2" />
        Not sure where? <span className="font-medium">Inspire me</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div key="inspire" className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-label="Destination ideas"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              className="relative flex max-h-[94svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[30px] bg-paper shadow-2xl sm:rounded-[30px]"
            >
              <header className="relative shrink-0 overflow-hidden bg-ocean px-6 pb-6 pt-5 text-paper">
                <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-brand/40 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow flex items-center gap-2 text-paper/60">
                      <Sparkles className="size-3.5 text-sun-2" /> Inspire me
                    </p>
                    <h3 className="display mt-2 text-[clamp(2rem,4vw,2.8rem)] leading-[0.95]">
                      Where&apos;s at its <span className="italic text-brand-2">best</span> then?
                    </h3>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full bg-paper/10 transition-colors hover:bg-paper hover:text-ink">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="relative mt-5 flex flex-wrap gap-1.5">
                  {months.map((m) => {
                    const v = m.getMonth() + 1;
                    return (
                      <button key={v} type="button" onClick={() => setMonth(v)} className={cn("rounded-full px-3.5 py-1.5 text-sm transition-colors", v === month ? "bg-paper text-ink" : "bg-paper/10 text-paper/80 hover:bg-paper/20")}>
                        {m.toLocaleDateString("en-US", { month: "short", year: m.getFullYear() !== now.getFullYear() ? "2-digit" : undefined })}
                      </button>
                    );
                  })}
                </div>
                <div className="relative mt-3 flex flex-wrap gap-1.5">
                  {VIBES.slice(0, 9).map((v) => {
                    const on = vibes.includes(v.id);
                    return (
                      <button key={v.id} type="button" aria-pressed={on} onClick={() => setVibes(on ? vibes.filter((x) => x !== v.id) : [...vibes, v.id].slice(-5))} className={cn("rounded-full px-3 py-1 text-xs ring-1 ring-inset transition-colors", on ? "bg-brand-2 text-ink ring-brand-2" : "text-paper/70 ring-paper/20 hover:text-paper")}>
                        {v.label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-paper/55">
                    {days} days · about {money(budget)} all in{from ? ` · from ${from.split(",")[0]}` : ""}
                  </p>
                  <button type="button" onClick={() => find()} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-70">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Compass className="size-4" />} {ideas.length ? "Find new ideas" : "Find places"}
                  </button>
                </div>
              </header>

              <div className="overflow-y-auto p-5 sm:p-6">
                {error && <p className="mb-4 rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}
                {busy && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-72 rounded-[24px]" />
                    ))}
                  </div>
                )}
                {!busy && !ideas.length && !error && (
                  <div className="grid place-items-center px-6 py-14 text-center">
                    <Compass className="size-8 text-brand" />
                    <p className="mt-3 max-w-sm text-stone">Pick a month and what you&apos;re in the mood for. We&apos;ll find four places that are at their best then, within your budget.</p>
                  </div>
                )}
                {!busy && ideas.length > 0 && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ideas.map((idea, i) => {
                        const scene = sceneForDestination(idea.destination, idea.landscape);
                        const flag = countryCodeFor(idea.destination);
                        return (
                          <motion.article key={idea.destination} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease, delay: i * 0.07 }} className="group flex flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
                            <div className="relative h-36 overflow-hidden">
                              <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.06]">
                                <LazyScene id={scene} tint={SCENES[scene].tint} />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                              <h4 className="display absolute bottom-3 left-4 right-4 flex items-center gap-2 text-[1.8rem] leading-none text-paper">
                                {flag && <Flag code={flag} className="h-[0.55em]" />}
                                <span className="truncate">{idea.destination}</span>
                              </h4>
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                              <p className="flex-1 text-sm leading-relaxed text-stone">{idea.why}</p>
                              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                                <span className="flex flex-col rounded-xl bg-paper-2/70 px-2.5 py-2">
                                  <Wallet className="size-3.5 text-brand" />
                                  <span className="mt-1 text-ink">≈ {money(idea.cost)}</span>
                                </span>
                                <span className="flex flex-col rounded-xl bg-paper-2/70 px-2.5 py-2">
                                  <Plane className="size-3.5 text-brand" />
                                  <span className="mt-1 truncate text-ink">{idea.flightTime ?? "Varies"}</span>
                                </span>
                                <span className="flex flex-col rounded-xl bg-paper-2/70 px-2.5 py-2">
                                  <CloudSun className="size-3.5 text-brand" />
                                  <span className="mt-1 truncate text-ink">{idea.weather ?? "Good"}</span>
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-1">
                                {idea.bestFor.map((t) => (
                                  <span key={t} className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-ink">
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onPick(idea.destination, month);
                                  setOpen(false);
                                }}
                                className="mt-4 inline-flex items-center justify-between gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-brand"
                              >
                                Plan this trip <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                              </button>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button type="button" onClick={() => find(true)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-stone ring-1 ring-line transition-colors hover:bg-ink hover:text-paper">
                        <RefreshCw className="size-3.5" /> Show me others
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
