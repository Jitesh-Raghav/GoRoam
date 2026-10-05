"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const TASKS = [
  "Book flights",
  "Book where you're staying",
  "Check passport validity & visa rules",
  "Get travel insurance",
  "Download offline maps",
  "Tell your bank & sort local cash",
];

const PACKING_FALLBACK = ["Passport & ID", "Phone charger & adapter", "Comfortable walking shoes", "Reusable water bottle", "Any medication", "A light layer"];

interface Saved {
  done: string[];
  extra: string[];
}

function load(key: string): Saved {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const v = JSON.parse(raw);
      return { done: Array.isArray(v.done) ? v.done : [], extra: Array.isArray(v.extra) ? v.extra : [] };
    }
  } catch {
    /* storage unavailable: start fresh */
  }
  return { done: [], extra: [] };
}

function Item({ label, done, onToggle, onRemove }: { label: string; done: boolean; onToggle: () => void; onRemove?: () => void }) {
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="group flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-2 text-left"
      >
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-lg ring-1 transition-all duration-300",
            done ? "bg-brand text-white ring-brand" : "bg-white text-transparent ring-line group-hover:ring-ink/30"
          )}
        >
          <Check className="size-3.5" />
        </span>
        <span className={cn("text-[0.95rem] transition-colors", done ? "text-stone-2 line-through decoration-stone-2/60" : "text-ink")}>{label}</span>
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="grid size-7 place-items-center rounded-full text-stone opacity-0 transition-opacity hover:bg-paper-2 group-hover:opacity-100 focus-visible:opacity-100">
          <X className="size-3.5" />
        </button>
      )}
    </motion.li>
  );
}

/** Pre-trip to-dos plus a destination-specific packing list, remembered on this device. */
export function Checklist({ tripId, packing }: { tripId: string; packing?: string[] }) {
  const key = `goroam:checklist:${tripId}`;
  const [state, setState] = useState<Saved>({ done: [], extra: [] });
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const pack = useMemo(() => [...(packing?.length ? packing : PACKING_FALLBACK), ...state.extra], [packing, state.extra]);

  useEffect(() => {
    setState(load(key));
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state, ready]);

  const toggle = (id: string) => setState((s) => ({ ...s, done: s.done.includes(id) ? s.done.filter((d) => d !== id) : [...s.done, id] }));
  const total = TASKS.length + pack.length;
  const doneCount = [...TASKS.map((t) => `task:${t}`), ...pack.map((p) => `pack:${p}`)].filter((id) => state.done.includes(id)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const add = () => {
    const v = draft.trim().slice(0, 60);
    if (!v || pack.includes(v)) return;
    setState((s) => ({ ...s, extra: [...s.extra, v] }));
    setDraft("");
  };

  return (
    <div className="glass rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-stone">Before you go</p>
          <h3 className="display mt-3 text-4xl leading-none text-ink">Ready, set, roam.</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-ink">{pct}%</span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-paper-2">
            <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-2 text-[0.62rem] text-brand">To do</p>
          <ul>
            {TASKS.map((t) => (
              <Item key={t} label={t} done={state.done.includes(`task:${t}`)} onToggle={() => toggle(`task:${t}`)} />
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-2 text-[0.62rem] text-brand">Pack</p>
          <ul>
            <AnimatePresence initial={false}>
              {pack.map((p) => (
                <Item
                  key={p}
                  label={p}
                  done={state.done.includes(`pack:${p}`)}
                  onToggle={() => toggle(`pack:${p}`)}
                  onRemove={state.extra.includes(p) ? () => setState((s) => ({ done: s.done.filter((d) => d !== `pack:${p}`), extra: s.extra.filter((e) => e !== p) })) : undefined}
                />
              ))}
            </AnimatePresence>
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
            className="no-print mt-2 flex items-center gap-2 rounded-xl bg-paper/70 py-1 pl-3 pr-1 ring-1 ring-line focus-within:ring-brand/40"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add something to pack"
              aria-label="Add something to pack"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-stone-2"
            />
            <button type="submit" aria-label="Add item" className="grid size-8 place-items-center rounded-lg bg-ink text-paper transition-colors hover:bg-brand">
              <Plus className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
