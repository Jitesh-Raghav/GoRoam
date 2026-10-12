"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BedDouble, ChevronDown, Info, Lightbulb, Scooter, Sparkles, X, type LucideIcon } from "@/components/site/icons";
import { formatMoney } from "@/lib/currency";
import { useMoney } from "@/lib/money";
import { dayStops, type ItineraryData } from "@/lib/trip";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function Section({ icon: Icon, title, total, share, color, children, open: startOpen = false }: { icon: LucideIcon; title: string; total: string; share: number; color: string; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <section className="rounded-[22px] bg-white ring-1 ring-line">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl" style={{ background: `${color}1f`, color }}>
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-ink">{title}</span>
            <span className="display text-lg text-ink">{total}</span>
          </span>
          <span className="mt-1.5 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
              <motion.span initial={{ width: 0 }} animate={{ width: `${Math.round(share * 100)}%` }} transition={{ duration: 0.8, ease }} className="block h-full rounded-full" style={{ background: color }} />
            </span>
            <span className="w-9 text-right font-mono text-[11px] text-stone">{Math.round(share * 100)}%</span>
          </span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-stone transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
            <div className="border-t border-line px-4 pb-4 pt-3 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Row({ label, sub, value, strong }: { label: ReactNode; sub?: ReactNode; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className={cn("leading-snug", strong ? "text-ink" : "text-ink/85")}>{label}</p>
        {sub && <p className="mt-0.5 text-xs text-stone">{sub}</p>}
      </div>
      <p className={cn("shrink-0 font-mono text-xs", strong ? "text-ink" : "text-ink/80")}>{value}</p>
    </div>
  );
}

/**
 * Where the budget goes, line by line: the stay (and every option's cost), each
 * day's stops with how their price adds up, and the rental when it's counted.
 * Getting there is shown on its own section of the page, never counted here.
 */
export function BudgetBreakdown({
  open,
  onClose,
  data,
  budget,
  typed,
  nights,
  people,
  days,
  stay,
  rental,
  onPickDay,
}: {
  open: boolean;
  onClose: () => void;
  data: ItineraryData;
  budget: number;
  typed?: { amount: number; currency: string };
  nights: number;
  people: number;
  days: number;
  stay: number | null;
  rental: number | null;
  onPickDay: (i: number) => void;
}) {
  const { fmt: money, currency } = useMoney();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, onClose]);

  const dayList = data.itinerary.map((d, i) => ({ i, d, total: d.totalDayCost ?? 0, stops: dayStops(d) }));
  const activities = dayList.reduce((n, x) => n + x.total, 0) || data.summary?.totalCost || 0;
  const planned = activities + (stay ?? 0) + (rental ?? 0);
  const share = (v: number) => (planned > 0 ? v / planned : 0);
  const left = budget - planned;
  const over = left < 0;
  const budgetText = typed && typed.currency === currency ? formatMoney(typed.amount, currency, 0) : money(budget);
  const priced = (data.stays ?? []).filter((s) => (s.pricePerNight ?? 0) > 0);
  const avgNight = priced.length ? priced.reduce((n, s) => n + (s.pricePerNight ?? 0), 0) / priced.length : 0;
  const cheapest = priced.reduce<(typeof priced)[number] | null>((a, s) => (!a || (s.pricePerNight ?? 0) < (a.pricePerNight ?? 0) ? s : a), null);
  const priciest = dayList.reduce<(typeof dayList)[number] | null>((a, x) => (!a || x.total > a.total ? x : a), null);
  const pick = data.getAround?.picks[data.getAround.chosen ?? 0];

  // Where the money could come back from, biggest first.
  const savings = [
    cheapest && stay !== null && avgNight > (cheapest.pricePerNight ?? 0) ? { text: `Stay at ${cheapest.name}`, save: Math.round((avgNight - (cheapest.pricePerNight ?? 0)) * nights) } : null,
    rental ? { text: "Skip the rental, use buses and shared rides", save: rental } : null,
    priciest && priciest.total > 0 && dayList.length > 1 ? { text: `Trim day ${priciest.i + 1}, the priciest`, save: Math.round(priciest.total - activities / dayList.length) } : null,
  ]
    .filter((x): x is { text: string; save: number } => !!x && x.save > 0)
    .sort((a, b) => b.save - a.save);

  // Rendered at the end of <body>, above the sticky bars and the site header.
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="no-print fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Budget breakdown">
          <motion.button type="button" aria-label="Close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm" />
          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[32px] bg-paper shadow-2xl sm:inset-y-3 sm:left-auto sm:right-3 sm:max-h-none sm:w-[30rem] sm:rounded-[32px]"
          >
            {/* Summary */}
            <div className="relative bg-ink px-6 pb-6 pt-5 text-paper">
              <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-paper/25 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[0.6rem] text-paper/60">Budget breakdown</p>
                  <p className="display mt-2 text-4xl tabular-nums">{money(planned)}</p>
                  <p className="mt-1 text-sm text-paper/70">planned of your {budgetText}</p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-paper/10 hover:bg-paper/20">
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-paper/10">
                {[
                  { v: stay ?? 0, c: "#1A5FD6" },
                  { v: activities, c: "#F5F8FC" },
                  { v: rental ?? 0, c: "#7CC4FF" },
                ].map((x, i) => (
                  <motion.span key={i} initial={{ width: 0 }} animate={{ width: `${(x.v / Math.max(planned, budget, 1)) * 100}%` }} transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.08 }} style={{ background: x.c }} className="h-full" />
                ))}
              </div>
              <p className={cn("mt-3 inline-flex rounded-full px-3 py-1 text-xs", over ? "bg-coral/20 text-coral" : "bg-emerald-400/15 text-emerald-300")}>
                {over ? `${money(-left)} over budget` : `${money(left)} left`} · {money(planned / Math.max(people, 1) / Math.max(days, 1))} per person a day
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {stay !== null && (
                <Section icon={BedDouble} title={`Stay · ${nights} ${nights === 1 ? "night" : "nights"}`} total={money(stay)} share={share(stay)} color="#1A5FD6" open>
                  <Row strong label="Counted in your budget" sub={`Average of the stays below: ${money(avgNight)} a night × ${nights}`} value={money(stay)} />
                  <div className="mt-2 border-t border-dashed border-line pt-2">
                    {priced.map((s) => (
                      <Row key={s.name} label={s.name} sub={`${s.type ? `${s.type} · ` : ""}${money(s.pricePerNight ?? 0)} a night`} value={money((s.pricePerNight ?? 0) * nights)} />
                    ))}
                  </div>
                </Section>
              )}

              <Section icon={Sparkles} title="Activities & food" total={money(activities)} share={share(activities)} color="#0E1F3B" open={stay === null}>
                {dayList.map(({ i, d, total, stops }) => (
                  <div key={i} className="border-b border-dashed border-line py-2 last:border-0">
                    <button type="button" onClick={() => { onPickDay(i); onClose(); }} className="flex w-full items-baseline justify-between gap-3 text-left">
                      <span className="text-ink">
                        <span className="font-mono text-[11px] text-brand">D{i + 1}</span> {d.theme}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-ink">{money(total)}</span>
                    </button>
                    {stops.map((s) => (
                      <Row key={s.key} label={s.activity.place.name} sub={s.activity.priceNote || (s.activity.estimatedCost ? `for ${people} ${people === 1 ? "person" : "people"}` : "Free")} value={money(s.activity.estimatedCost ?? 0)} />
                    ))}
                  </div>
                ))}
              </Section>

              {rental && pick && (
                <Section icon={Scooter} title="Rental" total={money(rental)} share={share(rental)} color="#7CC4FF">
                  <Row strong label={pick.name} sub={`${money(pick.pricePerDayUsd)} a day × ${days} days`} value={money(rental)} />
                </Section>
              )}

              {over && savings.length > 0 && (
                <div className="rounded-[22px] bg-sun-soft p-4 ring-1 ring-sun/25">
                  <p className="eyebrow flex items-center gap-2 text-[0.58rem] text-ink/70">
                    <Lightbulb className="size-3.5 text-sun" /> Ways to save
                  </p>
                  {savings.map((x) => (
                    <Row key={x.text} label={x.text} value={`−${money(x.save)}`} />
                  ))}
                </div>
              )}

              <p className="flex gap-2 px-1 text-xs leading-relaxed text-stone">
                <Info className="mt-0.5 size-3.5 shrink-0" /> Getting there isn&apos;t counted here; compare the fares in Getting there. Prices are estimates; check before you book.
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
