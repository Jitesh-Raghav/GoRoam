"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "@/components/site/icons";
import { track } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;
const KEY = "goroam:create-yours-hidden";

/**
 * "Make this trip yours": a bar pinned to the bottom of public trip pages once
 * the reader has scrolled past the hero. Full width on phones, a floating card on
 * desktop. Closing it hides it for the rest of the visit.
 */
export function CreateYoursBar({ href, place, days, source }: { href: string; place: string; days?: number; source: string }) {
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem(KEY) === "1");
    } catch {
      setHidden(false);
    }
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && !hidden && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease }}
          className="no-print fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:px-0 sm:pb-0"
        >
          <div className="flex items-center gap-3 rounded-[22px] bg-ink p-2 pl-4 text-paper shadow-[0_24px_60px_-20px_rgba(14,31,59,0.65)] ring-1 ring-white/10 sm:w-[25rem]">
            <span className="hidden size-10 shrink-0 place-items-center rounded-2xl bg-brand text-white min-[400px]:grid">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Make this {place} trip yours</p>
              <p className="truncate text-xs text-paper/60">{days ? `Your dates, budget & pace · ${days} days` : "Your dates, budget & pace"} · free</p>
            </div>
            <Link
              href={href}
              onClick={() => track("create_yours_clicked", { source, place })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brand hover:text-white"
            >
              Create yours <ArrowRight className="size-4" />
            </Link>
            <button type="button" onClick={close} aria-label="Hide" className="grid size-8 shrink-0 place-items-center rounded-full text-paper/50 hover:bg-white/10 hover:text-paper">
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
