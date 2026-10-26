"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "@/components/site/icons";
import { cn } from "@/lib/utils";

/** The packing list as a checklist that remembers your ticks on this device. */
export function PackList({ slug, items }: { slug: string; items: string[] }) {
  const key = `goroam:pack:${slug}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(saved)) setDone(saved.filter((x) => items.includes(x)));
    } catch {}
  }, [key, items]);
  const save = (next: string[]) => {
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };
  const toggle = (x: string) => save(done.includes(x) ? done.filter((d) => d !== x) : [...done, x]);
  const pct = Math.round((done.length / items.length) * 100);

  return (
    <div className="rounded-panel bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-stone">
          <span className="tabular-nums text-ink">{done.length}</span> of {items.length} packed
        </p>
        {done.length > 0 && (
          <button type="button" onClick={() => save([])} className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-ink">
            <RotateCcw className="size-3.5" /> Reset
          </button>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-2">
        <span className="block h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {items.map((x) => {
          const on = done.includes(x);
          return (
            <li key={x}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(x)}
                className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition-colors", on ? "bg-brand-soft/60 text-stone ring-brand/20" : "bg-paper/60 text-ink/85 ring-line hover:ring-ink/25")}
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full transition-colors", on ? "bg-brand text-white" : "bg-white ring-1 ring-line-strong")}>
                  {on && <Check className="duo-paper size-3.5" />}
                </span>
                <span className={cn("text-[0.95rem]", on && "line-through decoration-stone-2")}>{x}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
