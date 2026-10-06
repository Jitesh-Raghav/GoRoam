"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { Scene } from "@/components/scenes/scene";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { PLANS, perTrip } from "@/lib/plans";
import { titleCase } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { useCheckout } from "./use-checkout";

/** Where the planner stashes its answers while the traveller tops up. */
export const PLANNER_DRAFT_KEY = "goroam:planner-draft";

/**
 * Shown when a traveller with no credits asks for an itinerary. Their answers
 * are saved, so buying a pack brings them straight back to a filled-in plan.
 */
export function OutOfCredits({ destination, days, onClose }: { destination: string; days: number; onClose: () => void }) {
  const place = titleCase(destination.split(",")[0] || "your trip");
  const { scene } = useDestinationScene(destination || "mountains");
  const checkout = useCheckout(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] grid place-items-end overflow-y-auto bg-ink/50 p-3 sm:place-items-center sm:p-6"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-paper shadow-[0_50px_140px_-40px_rgba(10,30,44,0.7)]"
      >
        <div className="relative h-44 overflow-hidden bg-ink sm:h-52">
          <Scene id={scene} intro />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-paper/15 text-paper ring-1 ring-inset ring-paper/25 transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="size-4" />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-8">
            <p className="eyebrow text-paper/65">
              {days} {days === 1 ? "day" : "days"} · ready to plan
            </p>
            <h2 id="paywall-title" className="display mt-2 text-[clamp(1.87rem,4.25vw,2.72rem)] leading-[0.95]">
              {place} is <span className="italic text-brand-2">one step away.</span>
            </h2>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-stone">
            You&apos;ve used your free itinerary. Pick a pack to keep planning. Your answers are saved, so you&apos;ll come straight back to this trip.
          </p>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => checkout.start(p.id, "planner")}
                disabled={checkout.pending !== null}
                className={cn(
                  "group relative flex flex-col rounded-[22px] p-4 text-left ring-1 transition-colors disabled:cursor-wait",
                  p.popular ? "bg-ink text-paper ring-ink hover:bg-brand hover:ring-brand" : "bg-white/80 text-ink ring-line hover:bg-ink hover:text-paper"
                )}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-medium text-white group-hover:bg-ink">
                    <Sparkles className="size-3" /> Popular
                  </span>
                )}
                <span className="eyebrow text-[0.58rem] opacity-60">{p.name}</span>
                <span className="display mt-2 text-3xl leading-none">${p.price}</span>
                <span className="mt-1.5 text-sm">
                  {p.credits} trips <span className="opacity-60">· {perTrip(p)} each</span>
                </span>
                {checkout.pending === p.id ? (
                  <Loader2 className="absolute bottom-4 right-4 size-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="absolute bottom-4 right-4 size-4 opacity-60 transition-transform duration-500 group-hover:rotate-45 group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>

          {checkout.error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {checkout.error}
            </p>
          )}

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-stone">
            {["Cards, UPI & more", "Credits never expire", "30-day money-back guarantee"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-brand" /> {t}
              </li>
            ))}
          </ul>

          <button type="button" onClick={onClose} className="mt-5 text-sm text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink">
            Maybe later, keep editing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
