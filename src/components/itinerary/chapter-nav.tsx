"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

export interface Chapter {
  id: string;
  label: string;
}

/** Room left between the stuck bar and a chapter's heading. */
const GAP = 20;

/**
 * The trip page's table of contents: a glass chip bar that sticks while you
 * scroll, lights up the chapter you're reading and jumps to any other.
 */
export function ChapterNav({ chapters, className }: { chapters: Chapter[]; className?: string }) {
  const [active, setActive] = useState(chapters[0]?.id);
  const bar = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  // Where the bar's bottom edge sits once it sticks: its sticky top plus its height, plus a little air.
  const offset = () => {
    const el = nav.current;
    if (!el) return 120;
    return (parseFloat(getComputedStyle(el).top) || 0) + el.offsetHeight + GAP;
  };
  const ids = chapters.map((c) => c.id).join(",");

  // The active chapter is the last one whose top has passed the bar.
  useEffect(() => {
    const els = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let current = els[0].id;
        const line = offset() + 8;
        for (const el of els) if (el.getBoundingClientRect().top - line <= 0) current = el.id;
        setActive(current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  // Keep the active chip in view on phones, where the bar scrolls sideways.
  useEffect(() => {
    const chip = bar.current?.querySelector<HTMLElement>(`[data-chapter="${active}"]`);
    const el = bar.current;
    if (!chip || !el) return;
    el.scrollTo({ left: chip.offsetLeft - el.clientWidth / 2 + chip.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    const top = el.getBoundingClientRect().top + window.scrollY - offset();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: "smooth" });
  };

  if (chapters.length < 2) return null;

  return (
    <nav ref={nav} aria-label="Trip chapters" className={cn("no-print sticky z-30", className)}>
      <div className="glass rounded-full p-1 shadow-[0_18px_40px_-26px_rgba(10,30,44,0.6)]">
        <div ref={bar} className="no-scrollbar flex gap-0.5 overflow-x-auto">
          {chapters.map((c) => {
            const on = c.id === active;
            return (
              <a
                key={c.id}
                href={`#${c.id}`}
                data-chapter={c.id}
                aria-current={on ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(c.id);
                }}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors sm:flex-1 sm:justify-center",
                  on ? "text-paper" : "text-ink/70 hover:text-ink"
                )}
              >
                {on && <motion.span layoutId="chapter-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <span className={cn("relative size-1.5 rounded-full transition-colors", on ? "bg-sun-2" : "bg-brand/40")} />
                <span className="relative whitespace-nowrap">{c.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
