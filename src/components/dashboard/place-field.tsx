"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { MapPin, type LucideIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

type Suggestion = { main: string; secondary: string };

const RECENT_KEY = "goroam:recent-places";
const POPULAR: Suggestion[] = [
  { main: "Tokyo", secondary: "Japan" },
  { main: "Bali", secondary: "Indonesia" },
  { main: "Paris", secondary: "France" },
  { main: "Dubai", secondary: "United Arab Emirates" },
  { main: "Goa", secondary: "India" },
  { main: "Santorini", secondary: "Greece" },
];

const label = (s: Suggestion) => (s.secondary ? `${s.main}, ${s.secondary}` : s.main);

function readRecent(): Suggestion[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5);
  } catch {
    return [];
  }
}
function remember(s: Suggestion) {
  try {
    const next = [s, ...readRecent().filter((r) => label(r) !== label(s))].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
}

/** Bold the part of a name that matches what was typed. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.trim().toLowerCase()) : -1;
  if (i < 0 || !query.trim()) return <>{text}</>;
  const n = query.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-ink">{text.slice(i, i + n)}</mark>
      {text.slice(i + n)}
    </>
  );
}

/**
 * A city field with live suggestions (Google Places through /api/places/autocomplete, or a built-in list).
 * Empty and focused, it offers recent picks, or popular places for a destination.
 */
export function PlaceField({
  id,
  label: fieldLabel,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  kind,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  kind: "from" | "to";
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [hint, setHint] = useState<"recent" | "popular" | null>(null);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const typed = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  // Fetch suggestions as the traveller types (debounced); show hints when the field is empty.
  useEffect(() => {
    if (!open) return;
    const q = value.trim();
    if (q.length < 2 || !typed.current) {
      const recent = readRecent();
      const show = recent.length ? recent : kind === "to" ? POPULAR : [];
      setItems(q ? [] : show);
      setHint(q ? null : recent.length ? "recent" : kind === "to" ? "popular" : null);
      setActive(-1);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(() => {
      fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setItems(d.suggestions ?? []);
          setHint(null);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [value, open, kind]);

  // Close when tapping outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (s: Suggestion) => {
    typed.current = false;
    onChange(label(s));
    remember(s);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || !items.length) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const show = open && items.length > 0;

  return (
    <div ref={box} className={cn("relative", open && "z-30")}>
      <label
        htmlFor={id}
        className={cn(
          "flex h-[4.5rem] cursor-text items-center gap-3 rounded-2xl bg-paper/60 px-4 ring-1 transition-shadow focus-within:bg-white focus-within:ring-2",
          error ? "ring-destructive/60 focus-within:ring-destructive/60" : "ring-line focus-within:ring-brand/50"
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand ring-1 ring-line">
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="eyebrow text-[0.6rem] text-stone">{fieldLabel}</span>
          <input
            id={id}
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={show}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-invalid={!!error}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              typed.current = true;
              onChange(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            className="mt-1 w-full bg-transparent text-[1.05rem] text-ink outline-none placeholder:text-stone-2"
          />
        </span>
        {loading && <span aria-hidden className="size-4 shrink-0 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />}
      </label>

      <AnimatePresence>
        {show && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] origin-top overflow-hidden rounded-2xl bg-white/90 p-1.5 shadow-[0_28px_60px_-28px_rgba(10,30,44,0.55)] ring-1 ring-line backdrop-blur-xl"
          >
            {hint && <li className="eyebrow px-3 pb-1 pt-2 text-[0.6rem] text-stone">{hint === "recent" ? "Recent" : "Popular right now"}</li>}
            {items.map((s, i) => (
              <motion.li
                key={label(s)}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025, duration: 0.2 }}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
                className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors", i === active ? "bg-brand-soft" : "hover:bg-paper")}
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg ring-1", i === active ? "bg-white text-brand ring-brand/20" : "bg-paper text-stone ring-line")}>
                  <MapPin className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] text-ink/80">
                    <Highlight text={s.main} query={value} />
                  </span>
                  {s.secondary && <span className="block truncate text-xs text-stone">{s.secondary}</span>}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
