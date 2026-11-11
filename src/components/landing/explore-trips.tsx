"use client";

/* eslint-disable @next/next/no-img-element -- tiny round thumbnails from our own photo route */

import { useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { cn } from "@/lib/utils";

export interface ExploreLink {
  href: string;
  label: string;
  /** A small photo of the place; cities and months show an icon instead. */
  photo?: string;
  icon?: "city" | "month";
}

export interface ExploreGroup {
  id: string;
  label: string;
  links: ExploreLink[];
}

function Thumb({ link }: { link: ExploreLink }) {
  const [broken, setBroken] = useState(false);
  if (link.photo && !broken) {
    return <img src={link.photo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" data-photo="" onError={() => setBroken(true)} className="size-7 shrink-0 rounded-full object-cover ring-2 ring-white" />;
  }
  const Icon = link.icon === "month" ? CalendarDays : MapPin;
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-white/15 group-hover:text-sun-2">
      <Icon className="size-3.5" />
    </span>
  );
}

/**
 * More trips to explore, under the trending cards: one tab at a time of photo
 * chips. Every tab's links are in the page, so search engines follow them all.
 */
export function ExploreTrips({ groups }: { groups: ExploreGroup[] }) {
  const [active, setActive] = useState(groups[0]?.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Explore more trips" className="no-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
          {groups.map((g) => {
            const on = g.id === active;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                id={`explore-tab-${g.id}`}
                aria-selected={on}
                aria-controls={`explore-${g.id}`}
                onClick={() => setActive(g.id)}
                className={cn("shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-200", on ? "bg-ink text-paper" : "text-ink/70 hover:bg-paper-2 hover:text-ink")}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.id} id={`explore-${g.id}`} role="tabpanel" aria-labelledby={`explore-tab-${g.id}`} hidden={g.id !== active}>
          <ul className="tab-in no-scrollbar -mx-4 mt-5 grid auto-cols-max grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex sm:flex-wrap sm:overflow-visible sm:px-0">
            {g.links.map((l) => (
              <li key={l.href}>
                <QuietLink
                  href={l.href}
                  className="group inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white py-1 pl-1 pr-3.5 text-sm text-ink ring-1 ring-line transition-colors duration-200 hover:bg-ink hover:text-paper hover:ring-ink sm:pr-4"
                >
                  <Thumb link={l} />
                  {l.label}
                  <ArrowUpRight className="-ml-2.5 h-3.5 w-0 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100" />
                </QuietLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

    </div>
  );
}
