"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useBandTone } from "../band";

/** A numbered chapter heading that adapts to the band it sits on. */
export function SectionTitle({ eyebrow, title, children }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode }) {
  const dark = useBandTone() === "ink";
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className={cn("eyebrow flex items-center gap-3", dark ? "text-paper/70" : "text-stone")}>
          <span
            aria-hidden
            className={cn(
              "sec-num inline-grid h-6 min-w-8 place-items-center rounded-full px-2 font-mono text-[10px] tracking-normal",
              dark ? "bg-paper text-ink" : "bg-ink text-paper",
              "print:bg-transparent print:text-ink"
            )}
          />
          <span className={cn("h-px w-6", dark ? "bg-paper/40" : "bg-ink/20")} />
          {eyebrow}
        </p>
        <h2 className={cn("display mt-4 text-[clamp(2.04rem,4.25vw,3.23rem)] leading-[1.02]", dark ? "text-paper [&_.accent]:text-brand-2" : "text-ink", "print:text-ink")}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
