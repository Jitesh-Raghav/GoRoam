"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A section's surface on the trip page. Most of the page sits calmly on paper;
 * the local guide is a white panel, like a guidebook laid on the table; and
 * only the video "cinema" goes dark.
 */
export type BandTone = "plain" | "panel" | "ink";

const BandContext = createContext<BandTone>("plain");
export const useBandTone = () => useContext(BandContext);
export const isDarkBand = (tone: BandTone) => tone === "ink";

const SURFACE: Record<Exclude<BandTone, "plain">, string> = {
  panel: "bg-white shadow-card ring-1 ring-line",
  ink: "bg-ink text-paper",
};

function Glows() {
  return (
    <>
      <div className="pointer-events-none absolute -left-24 -top-32 size-[28rem] rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 size-[24rem] rounded-full bg-sun/10 blur-3xl" />
    </>
  );
}

export function Band({ tone = "plain", id, className, children }: { tone?: BandTone; id?: string; className?: string; children: ReactNode }) {
  return (
    <BandContext.Provider value={tone}>
      {tone === "plain" ? (
        <section id={id} className={cn("mt-24 scroll-mt-6", className)}>
          {children}
        </section>
      ) : (
        <section
          id={id}
          className={cn(
            "relative isolate mt-24 scroll-mt-6 overflow-clip rounded-panel px-3 py-12 min-[400px]:px-4 sm:px-10 sm:py-16",
            "print:rounded-none print:bg-none print:p-0 print:text-ink print:shadow-none print:ring-0",
            SURFACE[tone],
            className
          )}
        >
          {tone === "ink" && (
            <div className="pointer-events-none absolute inset-0 -z-10 print:hidden">
              <Glows />
            </div>
          )}
          {children}
        </section>
      )}
    </BandContext.Provider>
  );
}
