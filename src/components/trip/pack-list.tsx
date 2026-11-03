"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface PackGroup {
  name: string;
  items: string[];
}

/**
 * The packing list as a ruled checklist in groups. Ticks are remembered on this
 * device, and the whole list copies as plain text to send to the group.
 */
export function PackList({ slug, title, groups }: { slug: string; title: string; groups: PackGroup[] }) {
  const key = `goroam:pack:${slug}`;
  const items = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const [done, setDone] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

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
  const copy = async () => {
    const text = [title, "", ...groups.flatMap((g) => [g.name, ...g.items.map((x) => `${done.includes(x) ? "☑" : "☐"} ${x}`), ""])].join("\n").trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const pct = items.length ? (done.length / items.length) * 100 : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-stone">
          <span className="display mr-1 text-[1.75rem] leading-none tabular-nums text-ink">{done.length}</span> of {items.length} packed
        </p>
        <div className="flex items-center gap-2">
          {done.length > 0 && (
            <button type="button" onClick={() => save([])} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-stone transition-colors hover:text-ink">
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-ink ring-1 ring-line-strong transition-colors hover:bg-ink hover:text-paper hover:ring-ink">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy list"}
          </button>
        </div>
      </div>
      <div className="mt-4 h-[2px] bg-line">
        <span className="block h-full bg-ink transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {groups.map((g) => {
          const packed = g.items.filter((x) => done.includes(x)).length;
          return (
            <section key={g.name} aria-label={g.name}>
              <h4 className="flex items-baseline justify-between gap-3 border-b border-ink pb-2.5">
                <span className="display text-[1.15rem] text-ink">{g.name}</span>
                <span className="font-mono text-xs text-stone">
                  {packed}/{g.items.length}
                </span>
              </h4>
              <ul className="divide-y divide-line">
                {g.items.map((x) => {
                  const on = done.includes(x);
                  return (
                    <li key={x}>
                      <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(x)} className="group flex w-full items-start gap-3.5 py-3.5 text-left">
                        <span className={cn("mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors duration-200", on ? "border-ink bg-ink text-paper" : "border-ink/30 group-hover:border-ink")}>
                          {on && <Check className="duo-paper size-3" />}
                        </span>
                        <span className={cn("text-[0.98rem] leading-snug transition-colors duration-200", on ? "text-stone line-through decoration-stone-2" : "text-ink/85 group-hover:text-ink")}>{x}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
