"use client";

import { motion } from "framer-motion";
import { Heart } from "@/components/site/icons";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** "Is it for you?": six scores out of 5 as segmented bars that fill in as they scroll into view. */
export function VibeScores({ name, verdict, scores }: { name: string; verdict: string; scores: { label: string; score: number }[] }) {
  return (
    <div className="border-y border-line py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <Heart className="size-4 text-brand" /> Is {name} for you?
          </p>
          <p className="display mt-2 text-[1.35rem] leading-snug text-ink">{verdict}</p>
        </div>
        <p className="text-xs text-stone">GoRoam&apos;s take, out of 5</p>
      </div>
      <motion.dl initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.3 }} className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {scores.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-baseline justify-between text-sm">
              <dt className="text-ink/80">{s.label}</dt>
              <dd className="font-mono text-xs text-stone">
                <span className="text-ink">{s.score}</span>/5
              </dd>
            </div>
            <div aria-hidden className="mt-2 grid grid-cols-5 gap-1">
              {Array.from({ length: 5 }, (_, k) => (
                <span key={k} className="h-1.5 overflow-hidden rounded-full bg-paper-2">
                  {k < s.score && (
                    <motion.span
                      className={cn("block h-full origin-left rounded-full", s.score >= 4 ? "bg-brand" : s.score === 3 ? "bg-brand-2" : "bg-stone-2")}
                      variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.5, ease, delay: i * 0.05 + k * 0.06 } } }}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </motion.dl>
    </div>
  );
}
