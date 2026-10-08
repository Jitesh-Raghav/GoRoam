"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, Check, Clock3, Lightbulb, Loader2, MapPin, Sparkles, X } from "@/components/site/icons";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { updateCached } from "@/lib/cached-json";
import { CHAT_LIMIT } from "@/lib/plans";
import { money, type ActivitySlot, type ItineraryData, type ItineraryDetails } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { lookUpOwnPhoto } from "./place-photo";

type Slot = "morning" | "afternoon" | "evening";
interface Target {
  day: number;
  slot: Slot;
  current: ActivitySlot;
}

const SwapContext = createContext<((t: Target) => void) | null>(null);

/** The "Swap" button's handle; null where the trip can't be edited (shared, packages). */
export const useSwap = () => useContext(SwapContext);

const HINTS = ["Something indoors", "Cheaper", "More local", "Kid-friendly", "A great view", "Less walking"];
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Swap one stop for an AI-suggested alternative: pick a nudge ("something
 * indoors"), see three options nearby, and the chosen one is saved to the trip.
 */
export function SwapProvider({ it, enabled, children }: { it: ItineraryDetails; enabled: boolean; children: ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null);
  const [hint, setHint] = useState("");
  const [state, setState] = useState<"idle" | "finding" | "choosing" | "saving">("idle");
  const [options, setOptions] = useState<ActivitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && state !== "saving" && setTarget(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, state]);

  const open = (t: Target) => {
    setTarget(t);
    setHint("");
    setOptions([]);
    setError(null);
    setState("idle");
  };

  const find = async () => {
    if (!target) return;
    setState("finding");
    setError(null);
    try {
      const res = await fetch(`/api/itinerary/${it.id}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: target.day, slot: target.slot, hint }),
      });
      const body = await res.json().catch(() => ({}));
      if (typeof body.left === "number") setLeft(body.left);
      if (!res.ok || !body.success) throw new Error(body.error || "Couldn't find alternatives just now.");
      setOptions(body.alternatives);
      setState("choosing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't find alternatives just now.");
      setState("idle");
    }
  };

  const choose = async (activity: ActivitySlot) => {
    if (!target) return;
    setState("saving");
    try {
      const res = await fetch(`/api/itinerary/${it.id}/swap`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: target.day, slot: target.slot, activity }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) throw new Error(body.error || "Couldn't save that swap.");
      const next = body.itineraryData as ItineraryData;
      const swapped = next.itinerary?.[target.day]?.[target.slot];
      if (swapped) lookUpOwnPhoto(swapped);
      updateCached<{ data: ItineraryDetails }>(`/api/itinerary/${it.id}`, (d) => ({ ...d, data: { ...d.data, itineraryData: next } }));
      setTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that swap.");
      setState("choosing");
    }
  };

  return (
    <SwapContext.Provider value={enabled ? open : null}>
      {children}
      <AnimatePresence>
        {target && (
          <motion.div key="swap" className="no-print fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm" onClick={() => state !== "saving" && setTarget(null)} />
            <motion.div
              role="dialog"
              aria-label="Swap this stop"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[30px] bg-paper shadow-2xl sm:rounded-[30px]"
            >
              <header className="flex items-start justify-between gap-4 border-b border-line p-6">
                <div className="min-w-0">
                  <p className="eyebrow flex items-center gap-2 text-stone">
                    <ArrowRightLeft className="size-3.5 text-brand" /> Day {target.day + 1} · {target.slot}
                  </p>
                  <h3 className="display mt-2 text-[1.7rem] leading-[1] text-ink">
                    Swap <span className="accent">{target.current.place.name}</span>
                  </h3>
                </div>
                <button type="button" onClick={() => state !== "saving" && setTarget(null)} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-2 text-ink transition-colors hover:bg-ink hover:text-paper">
                  <X className="size-4" />
                </button>
              </header>

              <div className="overflow-y-auto p-6">
                <p className="text-sm text-stone">Anything in mind? Optional.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {HINTS.map((h) => (
                    <button key={h} type="button" onClick={() => setHint(hint === h ? "" : h)} className={cn("rounded-full px-3 py-1.5 text-xs transition-colors", hint === h ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-line hover:ring-ink/30")}>
                      {h}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={hint} onChange={(e) => setHint(e.target.value.slice(0, 200))} placeholder="Or type it: a rooftop bar, somewhere for ramen…" className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 text-sm text-ink outline-none ring-1 ring-line placeholder:text-stone-2 focus:ring-brand" />
                  <button type="button" onClick={find} disabled={state === "finding" || state === "saving"} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm text-white transition-colors hover:bg-ink disabled:opacity-60">
                    {state === "finding" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    {options.length ? "Try again" : "Find alternatives"}
                  </button>
                </div>
                {error && <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}

                {state === "finding" && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="skeleton h-56 rounded-[22px]" />
                    ))}
                  </div>
                )}

                {options.length > 0 && state !== "finding" && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {options.map((o, i) => (
                      <motion.article key={`${o.place.name}-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: i * 0.07 }} className="flex flex-col rounded-[22px] bg-white p-5 ring-1 ring-line">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs text-brand">0{i + 1}</span>
                          <span className="rounded-full bg-paper-2 px-2.5 py-1 font-mono text-xs text-ink">{o.estimatedCost ? money(o.estimatedCost) : "Free"}</span>
                        </div>
                        <h4 className="display mt-3 text-[1.27rem] leading-[1.02] text-ink">{o.place.name}</h4>
                        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone">
                          {o.place.area && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3 text-brand" /> {o.place.area}
                            </span>
                          )}
                          {o.duration && (
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="size-3 text-brand" /> {o.duration}
                            </span>
                          )}
                        </p>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-stone">{o.place.description}</p>
                        {o.tip && (
                          <p className="mt-3 flex gap-2 rounded-xl bg-brand-soft/60 p-2.5 text-xs text-ink">
                            <Lightbulb className="mt-px size-3.5 shrink-0 text-brand" /> {o.tip}
                          </p>
                        )}
                        <button type="button" onClick={() => choose(o)} disabled={state === "saving"} className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-brand disabled:opacity-60">
                          {state === "saving" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Use this
                        </button>
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
              <footer className="border-t border-line px-6 py-3 text-[11px] text-stone">
                Each search uses one of this trip&apos;s {CHAT_LIMIT} AI requests{left !== null ? ` · ${left} left` : ""}. Swapping is free once you&apos;ve picked.
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SwapContext.Provider>
  );
}
