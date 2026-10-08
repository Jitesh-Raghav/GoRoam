"use client";

import { addDays, addMonths, differenceInCalendarDays, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "@/components/site/icons";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const MAX_DAYS = 30;
const iso = (d: Date) => format(d, "yyyy-MM-dd");
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Six rows of a month, Monday first, padded with the neighbouring months. */
function monthGrid(month: Date) {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

/**
 * Trip dates in one place: click a start, then an end, and the trip length
 * follows. The current length is drawn as a band from the start date, and
 * hovering previews a new end. Two months on desktop, a bottom sheet on phones.
 */
export function DateRangePicker({
  start,
  days,
  onChange,
  min,
  error,
}: {
  /** YYYY-MM-DD, or "" before one is picked. */
  start: string;
  days: number;
  onChange: (start: string, days: number) => void;
  /** YYYY-MM-DD: nothing earlier can be picked. */
  min: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const minDate = useMemo(() => parseISO(min), [min]);
  const startDate = start ? parseISO(start) : null;
  const endDate = startDate ? addDays(startDate, Math.max(days, 1) - 1) : null;
  const [month, setMonth] = useState(() => startOfMonth(startDate ?? minDate));
  const [dir, setDir] = useState(1);
  const [phase, setPhase] = useState<"start" | "end">("start");
  const [hover, setHover] = useState<Date | null>(null);
  const [focus, setFocus] = useState<Date>(startDate ?? minDate);
  const [note, setNote] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const show = () => {
    const base = startDate ?? minDate;
    setMonth(startOfMonth(base));
    setFocus(base);
    setPhase(startDate ? "end" : "start");
    setNote(null);
    setOpen(true);
  };

  const go = (n: number) => {
    setDir(n);
    setMonth((m) => addMonths(m, n));
  };

  const pick = (d: Date) => {
    if (d < minDate) return;
    setFocus(d);
    if (phase === "start" || !startDate || d < startDate) {
      onChange(iso(d), days);
      setPhase("end");
      setNote("Now pick the last day");
      return;
    }
    const length = differenceInCalendarDays(d, startDate) + 1;
    onChange(start, Math.min(length, MAX_DAYS));
    setNote(length > MAX_DAYS ? `Trips go up to ${MAX_DAYS} days, so we've kept it at ${MAX_DAYS}.` : null);
    setPhase("start");
  };

  const quick = (label: string, s: Date, n = days) => (
    <button
      key={label}
      type="button"
      onClick={() => {
        const d = s < minDate ? minDate : s;
        onChange(iso(d), n);
        setMonth(startOfMonth(d));
        setFocus(d);
        setPhase("start");
        setNote(null);
      }}
      className="shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-xs text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      {label}
    </button>
  );
  const nextFriday = addDays(minDate, ((5 - minDate.getDay() + 7) % 7) || 7);

  // Arrow keys move the focused day, Enter picks it.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) {
      e.preventDefault();
      const next = addDays(focus, step);
      if (next < minDate) return;
      setFocus(next);
      if (!isSameMonth(next, month) && !isSameMonth(next, addMonths(month, 1))) go(next > month ? 1 : -1);
      if (phase === "end") setHover(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(focus);
    }
  };
  useEffect(() => {
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${iso(focus)}"]`)?.focus({ preventScroll: true });
  }, [focus, month]);

  // What's drawn as the range: a hover preview while picking the end, else the trip.
  const previewEnd = phase === "end" && hover && startDate && hover >= startDate ? hover : endDate;
  const inRange = (d: Date) => !!startDate && !!previewEnd && d >= startDate && d <= previewEnd;
  const previewDays = startDate && previewEnd ? differenceInCalendarDays(previewEnd, startDate) + 1 : days;

  // A plain render function (not a component), so hovering doesn't remount the days.
  const renderMonth = (m: Date, className?: string) => (
    <div key={iso(m)} className={className}>
      <p className="display mb-3 text-center text-lg text-ink">{format(m, "MMMM yyyy")}</p>
      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={cn("pb-2 font-mono text-[10px] uppercase tracking-wider", i >= 5 ? "text-brand" : "text-stone")}>
            {w}
          </span>
        ))}
        {monthGrid(m).map((d) => {
          const out = !isSameMonth(d, m);
          const past = d < minDate;
          const isStart = !!startDate && isSameDay(d, startDate);
          const isEnd = !!previewEnd && isSameDay(d, previewEnd);
          const range = inRange(d);
          const weekend = d.getDay() === 0 || d.getDay() === 6;
          if (out) return <span key={iso(d)} aria-hidden className="h-10" />;
          return (
            <div key={iso(d)} className={cn("relative h-10", range && !isStart && !isEnd && "bg-brand-soft", range && isStart && !isEnd && "bg-gradient-to-r from-transparent from-50% to-brand-soft to-50%", range && isEnd && !isStart && "bg-gradient-to-r from-brand-soft from-50% to-transparent to-50%")}>
              <button
                type="button"
                role="gridcell"
                data-day={iso(d)}
                tabIndex={isSameDay(d, focus) ? 0 : -1}
                disabled={past}
                aria-selected={isStart || isEnd}
                aria-label={format(d, "EEEE d MMMM yyyy")}
                onClick={() => pick(d)}
                onMouseEnter={() => phase === "end" && setHover(d)}
                className={cn(
                  "relative mx-auto grid size-10 place-items-center rounded-full text-sm tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  past ? "cursor-not-allowed text-stone-2/50 line-through decoration-stone-2/30" : "text-ink hover:bg-ink hover:text-paper",
                  weekend && !past && !range && "text-brand",
                  (isStart || isEnd) && "bg-ink !text-paper shadow-[0_8px_18px_-8px_rgba(10,30,44,0.7)] hover:bg-brand",
                  isSameDay(d, minDate) && !isStart && !isEnd && "ring-1 ring-inset ring-brand/50"
                )}
              >
                {format(d, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex h-[4.5rem] w-full items-center gap-3 rounded-2xl bg-paper/60 px-4 text-left ring-1 transition-shadow hover:bg-white",
          error ? "ring-destructive/60" : open ? "bg-white ring-2 ring-brand/50" : "ring-line"
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand ring-1 ring-line">
          <CalendarDays className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="eyebrow text-[0.6rem] text-stone">Dates</span>
          <span className="mt-1 truncate text-[1.05rem] text-ink">
            {startDate && endDate ? (
              <>
                {format(startDate, "EEE, d MMM")} <span className="text-stone">→</span> {format(endDate, "EEE, d MMM")}
              </>
            ) : (
              <span className="text-stone-2">Pick your dates</span>
            )}
          </span>
        </span>
        {startDate && <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 font-mono text-[11px] text-brand">{days}d</span>}
      </button>
      {error && <p className="mt-1.5 px-1 text-xs text-destructive">{error}</p>}

      <AnimatePresence>
        {open && (
          <>
            <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink/35 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
            {/* A dialog rather than a dropdown, so no scrolling container can ever clip it. */}
            <div className="pointer-events-none fixed inset-0 z-[61] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              key="pop"
              role="dialog"
              aria-modal="true"
              aria-label="Choose your trip dates"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.4, ease }}
              className="pointer-events-auto max-h-[92svh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-[0_-20px_60px_-20px_rgba(10,30,44,0.4)] ring-1 ring-line sm:w-[min(720px,calc(100vw-3rem))] sm:rounded-[28px] sm:p-7 sm:shadow-[0_40px_90px_-30px_rgba(10,30,44,0.5)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-stone">
                  {phase === "start" ? (
                    <>
                      Pick your <span className="text-ink">first day</span>
                    </>
                  ) : (
                    <>
                      Now your <span className="text-ink">last day</span>
                    </>
                  )}
                </p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-8 place-items-center rounded-full bg-paper-2 text-ink transition-colors hover:bg-ink hover:text-paper">
                  <X className="size-4" />
                </button>
              </div>
              <div className="no-scrollbar -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {quick("This weekend", nextFriday, 3)}
                {quick("Next weekend", addDays(nextFriday, 7), 3)}
                {quick("In 2 weeks", addDays(minDate, 14))}
                {quick("Next month", startOfMonth(addMonths(minDate, 1)))}
              </div>

              <div className="relative mt-4" onKeyDown={onKey} ref={grid} role="grid" onMouseLeave={() => setHover(null)}>
                <button type="button" onClick={() => go(-1)} disabled={month <= startOfMonth(minDate)} aria-label="Previous month" className="absolute left-0 top-0 z-10 grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-2 disabled:pointer-events-none disabled:opacity-25">
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next month" className="absolute right-0 top-0 z-10 grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-2">
                  <ChevronRight className="size-4" />
                </button>
                <div className="overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                    <motion.div
                      key={iso(month)}
                      custom={dir}
                      initial={{ x: dir * 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: dir * -40, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                      className="grid gap-8 sm:grid-cols-2"
                    >
                      {renderMonth(month)}
                      {renderMonth(addMonths(month, 1), "hidden sm:block")}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-sm text-ink" aria-live="polite">
                  {startDate ? (
                    <>
                      <span className="display text-xl">{previewDays}</span> {previewDays === 1 ? "day" : "days"}
                      <span className="text-stone">
                        {" "}
                        · {Math.max(previewDays - 1, 0)} {previewDays - 1 === 1 ? "night" : "nights"}
                      </span>
                    </>
                  ) : (
                    <span className="text-stone">No dates yet</span>
                  )}
                  {note && <span className="ml-2 text-xs text-brand">{note}</span>}
                </p>
                <div className="flex gap-2">
                  {startDate && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange("", days);
                        setPhase("start");
                        setNote(null);
                      }}
                      className="rounded-full px-4 py-2 text-sm text-stone transition-colors hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                  <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-colors hover:bg-brand">
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
