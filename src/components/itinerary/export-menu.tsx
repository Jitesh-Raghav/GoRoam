"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight, Download, type LucideIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface ExportItem {
  icon: LucideIcon;
  label: string;
  hint: string;
  onSelect: () => void;
}

/** One "Export" button for the trip's take-aways (calendar, offline map, PDF), instead of a row of them. */
export function ExportMenu({ items, className }: { items: ExportItem[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Closes on a click elsewhere or Escape.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!items.length) return null;
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={className}>
        <Download className="size-4" /> <span className="hidden sm:inline">Export</span>
        <ChevronRight className={cn("hidden size-3.5 transition-transform duration-300 sm:block", open ? "-rotate-90" : "rotate-90")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-40 mt-2 w-[18rem] origin-top-right rounded-card bg-white p-1.5 text-ink shadow-float ring-1 ring-line"
          >
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  it.onSelect();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <it.icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm">{it.label}</span>
                  <span className="block truncate text-xs text-stone">{it.hint}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
