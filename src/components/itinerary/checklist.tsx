"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Plus, X } from "@/components/site/icons";
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

/** Where each to-do is done on this page. */
const TASK_LINKS: Record<string, string> = {
  "Book flights": "#chapter-there",
  "Book where you're staying": "#chapter-stay",
  "Check passport validity & visa rules": "#chapter-before",
  "Get travel insurance": "#chapter-before",
};

function Item({ label, done, onToggle, onRemove, href }: { label: string; done: boolean; onToggle: () => void; onRemove?: () => void; href?: string }) {
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="group flex items-center gap-1 rounded-2xl bg-white pr-1.5 ring-1 ring-line transition-shadow hover:shadow-[0_14px_30px_-22px_rgba(14,31,59,0.6)]">
      <button type="button" onClick={onToggle} aria-pressed={done} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-left">
        <span className={cn("relative grid size-6 shrink-0 place-items-center rounded-full ring-1 transition-all duration-300", done ? "bg-brand text-white ring-brand" : "bg-white text-transparent ring-ink/20 group-hover:ring-ink/40")}>
          {done && <motion.span initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 rounded-full bg-brand" />}
          <Check className="relative size-3.5" />
        </span>
        <span className="relative min-w-0 text-[0.95rem]">
          <span className={cn("transition-colors duration-300", done ? "text-stone-2" : "text-ink")}>{label}</span>
          <motion.span aria-hidden initial={false} animate={{ scaleX: done ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 top-1/2 h-px origin-left bg-stone-2/70" />
        </span>
      </button>
      {href && !done && (
        <a href={href} className="no-print shrink-0 rounded-full px-2.5 py-1 text-xs text-brand opacity-0 transition-opacity hover:bg-brand-soft group-hover:opacity-100 focus-visible:opacity-100">
          Go <ArrowRight className="inline size-3" />
        </a>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="grid size-7 shrink-0 place-items-center rounded-full text-stone opacity-0 transition-opacity hover:bg-paper-2 group-hover:opacity-100 focus-visible:opacity-100">
          <X className="size-3.5" />
        </button>
      )}
    </motion.li>
  );
}

/** A luggage tag in hairlines, for the header corner. */
function TagLines() {
  const l = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const, strokeLinecap: "round" as const };
  return (
    <svg aria-hidden viewBox="0 0 240 160" className="pointer-events-none absolute -right-4 top-0 h-full w-[240px] text-paper/[0.14] print:hidden [mask-image:linear-gradient(to_left,black_40%,transparent)]">
      <path {...l} d="M120 30h84a10 10 0 0 1 10 10v70a10 10 0 0 1-10 10h-84l-26-45z" />
      <circle {...l} cx="112" cy="75" r="6" />
      <path {...l} d="M106 75C80 75 60 60 40 40S8 10 -6 14" strokeDasharray="2 5" className="text-sun-2/50" />
      <path {...l} d="M138 58h56M138 72h40M138 86h48" strokeDasharray="1 5" />
      <path {...l} d="M138 102h26" />
    </svg>
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

  const R = 40;
  const C = 2 * Math.PI * R;
  const ids = [...TASKS.map((t) => `task:${t}`), ...pack.map((p) => `pack:${p}`)];

  return (
    <div className="overflow-hidden rounded-[32px] bg-white ring-1 ring-line">
      <div className="relative isolate overflow-hidden bg-ink px-6 py-7 text-paper sm:px-8">
        <TagLines />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="eyebrow text-[0.6rem] text-paper/60">Before you go</p>
            <h3 className="display mt-3 text-[clamp(2rem,4vw,2.8rem)] leading-none">
              Ready, set, <span className="text-sun-2">roam.</span>
            </h3>
            <p className="mt-2 text-sm text-paper/70">{pct === 100 ? "All set. Have a wonderful trip." : `${doneCount} of ${total} done`}</p>
          </div>
          <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r={R} fill="none" stroke={pct === 100 ? "var(--sun-2)" : "var(--brand-2)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - pct / 100) }} initial={false} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
            </svg>
            <span className="display absolute inset-0 grid place-items-center text-xl">{pct}%</span>
          </div>
        </div>
        {/* one segment per item */}
        <div className="relative mt-5 flex gap-[3px]">
          {ids.map((id) => (
            <span key={id} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", state.done.includes(id) ? "bg-sun-2" : "bg-paper/15")} />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="bg-brand-soft/50 p-5 sm:p-7">
          <p className="eyebrow mb-3 text-[0.62rem] text-brand">To do</p>
          <ul className="space-y-2">
            {TASKS.map((t) => (
              <Item key={t} label={t} done={state.done.includes(`task:${t}`)} onToggle={() => toggle(`task:${t}`)} href={TASK_LINKS[t]} />
            ))}
          </ul>
        </div>
        <div className="p-5 sm:p-7">
          <p className="eyebrow mb-3 text-[0.62rem] text-brand">Pack</p>
          <ul className="space-y-2">
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
            className="no-print mt-3 flex items-center gap-2 rounded-full bg-paper-2/70 py-1 pl-4 pr-1 ring-1 ring-line backdrop-blur focus-within:ring-brand/40"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add something to pack"
              aria-label="Add something to pack"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-stone-2"
            />
            <button type="submit" aria-label="Add item" className="grid size-8 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-brand">
              <Plus className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
