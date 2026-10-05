"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A section's surface on the trip page. Each part of the trip sits on its own
 * band (paper, a mint wash, deep ink, warm sun, or a bright aurora under glass)
 * so the page reads as distinct chapters rather than one long list.
 */
export type BandTone = "plain" | "brand" | "ink" | "sun" | "aurora";

const BandContext = createContext<BandTone>("plain");
export const useBandTone = () => useContext(BandContext);
export const isDarkBand = (tone: BandTone) => tone === "ink";

const SURFACE: Record<Exclude<BandTone, "plain">, string> = {
  brand: "bg-[linear-gradient(160deg,#dff5f1_0%,#eef9f7_45%,var(--paper)_100%)] ring-1 ring-inset ring-brand/10",
  ink: "bg-ink text-paper",
  sun: "bg-[linear-gradient(160deg,#fde9cf_0%,#fff4e6_45%,#fbf7f0_100%)] ring-1 ring-inset ring-sun/15",
  aurora: "bg-[linear-gradient(135deg,#0b8278_0%,#1aa596_32%,#7fdccf_62%,#ffc876_100%)]",
};

function Glows({ tone }: { tone: Exclude<BandTone, "plain"> }) {
  if (tone === "ink")
    return (
      <>
        <div className="pointer-events-none absolute -left-24 -top-32 size-[28rem] rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 size-[24rem] rounded-full bg-sun/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgb(255_255_255)_1px,transparent_1px)] [background-size:22px_22px]" />
      </>
    );
  if (tone === "aurora")
    return (
      <>
        <div className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full bg-sun-2/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-[26rem] rounded-full bg-ink/30 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/3 size-72 rounded-full bg-brand-2/50 blur-3xl" />
      </>
    );
  if (tone === "sun")
    return (
      <>
        <div className="pointer-events-none absolute -right-16 -top-20 size-80 rounded-full bg-sun/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 size-72 rounded-full bg-[#ff9e7a]/20 blur-3xl" />
      </>
    );
  return (
    <>
      <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-brand-2/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgb(11_130_120/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(11_130_120/0.08)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
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
            "relative isolate mt-24 scroll-mt-6 overflow-hidden rounded-[32px] px-3 py-12 min-[400px]:px-4 sm:rounded-[40px] sm:px-10 sm:py-16",
            "print:rounded-none print:bg-none print:p-0 print:text-ink print:ring-0",
            SURFACE[tone],
            className
          )}
        >
          <div className="pointer-events-none absolute inset-0 -z-10 print:hidden">
            <Glows tone={tone} />
          </div>
          {children}
        </section>
      )}
    </BandContext.Provider>
  );
}
