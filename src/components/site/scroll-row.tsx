"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "@/components/site/icons";
import { cn } from "@/lib/utils";

/** One card's width in a row: a peek of the next on phones, two and a bit on tablets, four on laptops. */
export const ROW_ITEM = "w-[74vw] max-w-[19rem] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/2.35)] sm:max-w-none lg:w-[calc((100%-3.75rem)/4)]";
/** The image sizes that go with ROW_ITEM. */
export const ROW_SIZES = "(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 42vw, 74vw";

/**
 * A row of cards on one line: swipe on phones, arrow buttons beside the heading on
 * laptops (hidden at each end). The cards are passed in already rendered (server-side),
 * so the row only adds its scroll position.
 */
export function ScrollRow({ head, label, children, className }: { head: ReactNode; label: string; children: ReactNode; className?: string }) {
  const list = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    read();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = list.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };
  const arrow = "grid size-10 place-items-center rounded-full text-ink ring-1 ring-inset ring-line transition-colors hover:bg-ink hover:text-paper hover:ring-ink disabled:pointer-events-none disabled:opacity-35";

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1">{head}</div>
        <div className="hidden shrink-0 gap-2 lg:flex">
          <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label={`Back: ${label}`} className={arrow}>
            <ArrowLeft className="size-4" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label={`More: ${label}`} className={arrow}>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <ul
        ref={list}
        aria-label={label}
        className={cn(
          "no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2",
          "sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
        )}
      >
        {children}
      </ul>
    </div>
  );
}
