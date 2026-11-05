"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface TripTab {
  id: string;
  label: string;
  /** Where "see all" goes for this tab. */
  more: { href: string; label: string };
  /** Rendered on the server; every tab's cards stay in the HTML, so their links are followed. */
  panel: ReactNode;
}

/** The tabs over the home page's trip cards: one set of cards at a time, switched without a re-render of the cards. */
export function TripTabs({ tabs, className }: { tabs: TripTab[]; className?: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const more = (sm: boolean) =>
    tabs.map((t) => (
      <Link
        key={t.id}
        href={t.more.href}
        hidden={t.id !== active}
        className={cn("group items-center gap-1.5 text-sm text-ink transition-colors hover:text-brand", sm ? "hidden sm:inline-flex" : "mt-6 inline-flex sm:hidden")}
      >
        {t.more.label} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    ));
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Kinds of trips" className="no-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto px-1 py-0.5">
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`trips-tab-${t.id}`}
                aria-selected={on}
                aria-controls={`trips-${t.id}`}
                onClick={() => setActive(t.id)}
                className={cn("shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-200", on ? "bg-ink text-paper" : "text-ink/70 hover:bg-paper-2 hover:text-ink")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {more(true)}
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`trips-${t.id}`} role="tabpanel" aria-labelledby={`trips-tab-${t.id}`} hidden={t.id !== active} className="tab-in mt-8">
          {t.panel}
        </div>
      ))}
      {more(false)}
    </div>
  );
}
