"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock3, Dumbbell, GraduationCap, Map as MapIcon, Mountain, Sparkles, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { cityOf, ticketsFor } from "@/lib/booking";
import { money, type Experience, type ExperienceKind } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto, asStop } from "../place-photo";
import { SectionTitle } from "./section-title";

const ease = [0.16, 1, 0.3, 1] as const;

export const KIND: Record<ExperienceKind, { label: string; icon: LucideIcon; tone: string }> = {
  adventure: { label: "Adventure", icon: Mountain, tone: "bg-sun text-ink" },
  sport: { label: "Sport", icon: Dumbbell, tone: "bg-brand text-white" },
  tour: { label: "Tour", icon: MapIcon, tone: "bg-white text-ink" },
  class: { label: "Class", icon: GraduationCap, tone: "bg-brand-soft text-ink" },
  wellness: { label: "Wellness", icon: Sparkles, tone: "bg-sun-2 text-ink" },
};

/** Bookable adventures, sports, tours and classes, as a swipeable rail. */
export function Experiences({ items, destination }: { items: Experience[]; destination: string }) {
  const rail = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  const city = cityOf(destination);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="mt-20">
      <SectionTitle
        eyebrow="Adventures, sports & experiences"
        title={
          <>
            Go do <span className="italic text-brand">something.</span>
          </>
        }
      >
        <div className="no-print hidden gap-2 sm:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d)}
              aria-label={d < 0 ? "Previous experiences" : "More experiences"}
              className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-line transition-colors hover:bg-ink hover:text-paper"
            >
              <ArrowUpRight className={cn("size-4", d < 0 ? "-rotate-[135deg]" : "rotate-45")} />
            </button>
          ))}
        </div>
      </SectionTitle>

      <div ref={rail} className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 print:grid print:grid-cols-2 print:overflow-visible">
        {items.map((e, i) => {
          const kind = KIND[e.kind];
          return (
            <motion.article
              key={`${e.name}-${i}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease, delay: Math.min(i, 4) * 0.06 }}
              className="print-avoid group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] bg-white ring-1 ring-line sm:w-[calc((100%-1.5rem)/3)]"
            >
              <div className="relative h-44 overflow-hidden">
                <PlacePhoto activity={asStop(e.name)} destination={destination} icon={kind.icon} credit={false} imgClassName="group-hover:scale-[1.05]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                <span className={cn("absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm", kind.tone)}>
                  <kind.icon className="size-3.5" /> {kind.label}
                </span>
                {e.priceFrom ? (
                  <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-xs text-ink shadow-sm">from {money(e.priceFrom)}</span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="display text-[1.6rem] leading-[1.02] text-ink">{e.name}</h3>
                {e.duration && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone">
                    <Clock3 className="size-3.5 text-brand" /> {e.duration}
                  </p>
                )}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-stone">{e.why}</p>
                <a
                  href={ticketsFor(e.name, city)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="no-print mt-5 inline-flex items-center justify-between gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-brand"
                >
                  See packages & book <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                </a>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
