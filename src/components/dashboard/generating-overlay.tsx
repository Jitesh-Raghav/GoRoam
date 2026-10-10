"use client";

import { motion } from "framer-motion";
import { Check } from "@/components/site/icons";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { Scene } from "@/components/scenes/scene";

const STEPS = [
  "Reading your travel style",
  "Balancing the budget day by day",
  "Scouting icons and hidden gems",
  "Timing mornings, afternoons and evenings",
  "Pinning every stop to the map",
  "Adding the finishing touches",
];

/** Full-screen, cinematic wait while the itinerary is generated. */
export function GeneratingOverlay({ destination, days }: { destination: string; days: number }) {
  const [done, setDone] = useState(0);
  const { scene } = useDestinationScene(destination);

  useEffect(() => {
    const t = window.setInterval(() => setDone((d) => Math.min(d + 1, STEPS.length - 1)), 2600);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[80] overflow-hidden bg-ink text-paper"
    >
      <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: "easeOut" }} className="absolute inset-0">
        <Scene id={scene} intro />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,30,44,0.55),transparent_65%)]" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 320 90" className="w-[min(320px,80vw)] text-paper/40" aria-hidden>
          <path id="gen-route" d="M10 80C80 10 240 10 310 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="10" cy="80" r="4" fill="currentColor" />
          <circle cx="310" cy="80" r="4" fill="var(--brand-2)" />
          <g>
            <path d="M-9 -3L6 0L-9 3L-6 0Z" fill="#fff" />
            <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
              <mpath href="#gen-route" />
            </animateMotion>
          </g>
        </svg>

        <p className="eyebrow mt-8 text-paper/60">Crafting your itinerary</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(2.21rem,5.1vw,4.25rem)] leading-[1.02]">
          {days} days in <span className="accent">{destination.split(",")[0] || "somewhere new"}</span>
        </h2>

        <ul className="mt-10 w-full max-w-sm space-y-3 text-left">
          {STEPS.map((s, i) => (
            <motion.li
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= done ? 1 : 0.35, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-500",
                  i < done ? "bg-brand text-white" : i === done ? "bg-paper/15 ring-1 ring-paper/40" : "bg-paper/10"
                )}
              >
                {i < done ? <Check className="size-3.5" /> : i === done ? <span className="size-1.5 animate-pulse rounded-full bg-paper" /> : null}
              </span>
              {s}
            </motion.li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-paper/50">Good plans take a moment. Please keep this tab open.</p>
      </div>
    </motion.div>
  );
}
