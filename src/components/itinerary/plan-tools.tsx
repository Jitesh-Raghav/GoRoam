"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CloudRain, Loader2, MapPin, PenLine as Pencil, Route, Sparkles, Wand2, WhatsApp, X } from "@/components/site/icons";
import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { updateCached } from "@/lib/cached-json";
import { dayMessage } from "@/lib/day-message";
import { useMoney } from "@/lib/money";
import { CHAT_LIMIT } from "@/lib/plans";
import { optimiseOrder } from "@/lib/route-order";
import { editableStops, isOutdoor, type ActivitySlot, type DayItinerary, type ItineraryData, type ItineraryDetails } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { lookUpOwnPhoto } from "./place-photo";

const PlanEditor = dynamic(() => import("./plan-editor").then((m) => m.PlanEditor), { ssr: false });

type Kind = "rain" | "refresh" | "optimise";

interface Preview {
  day: number;
  kind: Kind;
  status: "asking" | "loading" | "ready" | "saving" | "error";
  now: ActivitySlot[];
  next?: ActivitySlot[];
  note?: string;
  km?: { before: number; after: number };
  error?: string;
  hint: string;
}

export interface PlanTools {
  /** Whole-day replan for rain, or a fresh take ("refresh"), shown as a preview first. */
  replan: (day: number, mode: "rain" | "refresh") => void;
  /** Reorder the day's stops by distance, shown as a preview first. */
  optimise: (day: number) => void;
  /** Open the full editor (drag between days, add, delete, reorder). */
  edit: (day?: number) => void;
  /** Opens WhatsApp with the day's plan and a link to the trip, to send to the group. */
  whatsapp: (day: number) => void;
}

const Ctx = createContext<PlanTools | null>(null);
/** Null where the plan can't be changed (shared links, packages, guests). */
export const usePlanTools = () => useContext(Ctx);

const ease = [0.16, 1, 0.3, 1] as const;
const HINTS = ["More food", "Less walking", "Kid-friendly", "Hidden gems", "Cheaper", "More culture"];

/** Saves edited days and refreshes the cached trip. Shared by the preview and the editor. */
export async function saveDays(it: ItineraryDetails, days: { index: number; stops: ActivitySlot[] }[]) {
  const res = await fetch(`/api/itinerary/${it.id}/days`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days }) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) throw new Error(body.error || "Couldn't save your changes.");
  const next = body.itineraryData as ItineraryData;
  updateCached<{ data: ItineraryDetails }>(`/api/itinerary/${it.id}`, (d) => ({ ...d, data: { ...d.data, itineraryData: next } }));
  // New places need photos.
  for (const { index } of days) for (const s of next.itinerary?.[index]?.stops ?? []) lookUpOwnPhoto(s);
  return next;
}

export function PlanToolsProvider({ it, enabled, children }: { it: ItineraryDetails; enabled: boolean; children: ReactNode }) {
  const { fmt: money } = useMoney();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [editing, setEditing] = useState<{ day: number } | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const days = it.itineraryData?.itinerary ?? [];

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && preview.status !== "saving" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const ask = async (p: Preview) => {
    setPreview({ ...p, status: "loading", error: undefined });
    try {
      const res = await fetch(`/api/itinerary/${it.id}/replan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: p.day, mode: p.kind, hint: p.hint || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (typeof body.left === "number") setLeft(body.left);
      if (!res.ok || !body.success) throw new Error(body.error || "Couldn't replan that day.");
      track(p.kind === "rain" ? "rain_plan_previewed" : "day_replan_previewed", { day: p.day + 1 });
      setPreview({ ...p, status: "ready", next: body.stops, note: body.note });
    } catch (e) {
      setPreview({ ...p, status: "error", error: e instanceof Error ? e.message : "Couldn't replan that day." });
    }
  };

  const tools: PlanTools = {
    replan: (day, mode) => {
      const p: Preview = { day, kind: mode, status: mode === "rain" ? "loading" : "asking", now: editableStops(days[day]), hint: "" };
      setPreview(p);
      if (mode === "rain") void ask(p);
    },
    optimise: (day) => {
      const now = editableStops(days[day]);
      const r = optimiseOrder(now);
      setPreview({
        day,
        kind: "optimise",
        status: "ready",
        now,
        next: r.changed ? r.stops : undefined,
        km: { before: r.beforeKm, after: r.afterKm },
        note: r.changed ? undefined : "This day is already in its shortest order.",
        hint: "",
      });
    },
    edit: (day = 0) => setEditing({ day }),
    whatsapp: (day) => {
      // Open the tab now (popup blockers), then point it at wa.me once the signed link is back.
      const tab = window.open("about:blank", "_blank");
      const send = (link: string) => {
        const href = `https://wa.me/?text=${encodeURIComponent(dayMessage(it.itineraryData, { index: day, destination: it.destination, startDate: it.startDate, link }).text)}`;
        if (tab) tab.location.href = href;
        else window.location.href = href;
      };
      track("whatsapp_shared", { day: day + 1 });
      fetch(`/api/itinerary/${it.id}/share`, { method: "POST" })
        .then((r) => r.json())
        .then((b) => send(b?.data?.url || `${window.location.origin}/trip/${it.id}`))
        .catch(() => send(`${window.location.origin}/trip/${it.id}`));
    },
  };

  const apply = async () => {
    if (!preview?.next) return;
    const p = preview;
    setPreview({ ...p, status: "saving" });
    try {
      await saveDays(it, [{ index: p.day, stops: p.next! }]);
      track(p.kind === "rain" ? "rain_plan_applied" : p.kind === "optimise" ? "day_optimised" : "day_replanned", { day: p.day + 1 });
      setPreview(null);
    } catch (e) {
      setPreview({ ...p, status: "error", error: e instanceof Error ? e.message : "Couldn't save." });
    }
  };

  const changed = (s: ActivitySlot) => !preview?.now.some((n) => n.place.name === s.place.name);
  const moved = (s: ActivitySlot, i: number) => preview?.now[i]?.place.name !== s.place.name;
  const cost = (list: ActivitySlot[] = []) => list.reduce((n, s) => n + (s.estimatedCost || 0), 0);
  const title = preview?.kind === "rain" ? "Rain plan" : preview?.kind === "optimise" ? "Shortest route" : "Replan this day";
  const Icon = preview?.kind === "rain" ? CloudRain : preview?.kind === "optimise" ? Route : Wand2;

  return (
    <Ctx.Provider value={enabled ? tools : null}>
      {children}
      {editing && <PlanEditor it={it} startDay={editing.day} onClose={() => setEditing(null)} />}
      <AnimatePresence>
        {preview && (
          <motion.div key="plan-preview" className="no-print fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm" onClick={() => preview.status !== "saving" && setPreview(null)} />
            <motion.div
              role="dialog"
              aria-label={title}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              className="relative flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[30px] bg-paper shadow-2xl sm:rounded-[30px]"
            >
              <header className="flex items-start justify-between gap-4 border-b border-line p-6">
                <div className="min-w-0">
                  <p className="eyebrow flex items-center gap-2 text-stone">
                    <Icon className="size-3.5 text-brand" /> Day {preview.day + 1} · {days[preview.day]?.theme}
                  </p>
                  <h3 className="display mt-2 text-[1.7rem] leading-[1] text-ink">
                    {preview.kind === "rain" ? (
                      <>
                        A <span className="accent">dry</span> day, same route.
                      </>
                    ) : preview.kind === "optimise" ? (
                      <>
                        Less walking, <span className="accent">more seeing.</span>
                      </>
                    ) : (
                      <>
                        A fresh take on <span className="accent">this day.</span>
                      </>
                    )}
                  </h3>
                  <p className="mt-2 text-sm text-stone">
                    {preview.kind === "rain"
                      ? "Outdoor stops swapped for covered ones nearby. Same neighbourhoods in the same order, same times, no more spend."
                      : preview.kind === "optimise"
                        ? "The same stops, in the order that covers the least ground."
                        : "New stops in the same areas and order, within the day's budget."}
                  </p>
                </div>
                <button type="button" onClick={() => preview.status !== "saving" && setPreview(null)} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-2 text-ink transition-colors hover:bg-ink hover:text-paper">
                  <X className="size-4" />
                </button>
              </header>

              <div className="overflow-y-auto p-6">
                {preview.status === "asking" || (preview.kind === "refresh" && preview.status === "error" && !preview.next) ? (
                  <div>
                    <p className="text-sm text-stone">Anything in mind? Optional.</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {HINTS.map((h) => (
                        <button key={h} type="button" onClick={() => setPreview({ ...preview, hint: preview.hint === h ? "" : h })} className={cn("rounded-full px-3 py-1.5 text-xs transition-colors", preview.hint === h ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-line hover:ring-ink/30")}>
                          {h}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={preview.hint}
                        onChange={(e) => setPreview({ ...preview, hint: e.target.value.slice(0, 200) })}
                        placeholder="Or type it: a cooking class, somewhere with a view…"
                        className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 text-sm text-ink outline-none ring-1 ring-line placeholder:text-stone-2 focus:ring-brand"
                      />
                      <button type="button" onClick={() => ask(preview)} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm text-white transition-colors hover:bg-ink">
                        <Sparkles className="size-4" /> Replan
                      </button>
                    </div>
                  </div>
                ) : null}

                {preview.error && <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{preview.error}</p>}

                {preview.status === "loading" && (
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {[0, 1].map((c) => (
                      <div key={c} className="space-y-2">
                        {preview.now.map((_, i) => (
                          <div key={i} className="skeleton h-16 rounded-2xl" />
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {(preview.status === "ready" || preview.status === "saving" || (preview.status === "error" && preview.next)) && (
                  <>
                    {preview.note && <p className="mb-4 flex gap-2 rounded-2xl bg-brand-soft/60 p-3 text-sm text-ink"><Sparkles className="mt-0.5 size-4 shrink-0 text-brand" /> {preview.note}</p>}
                    {preview.next && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          { label: "Now", list: preview.now, isNew: false },
                          { label: preview.kind === "optimise" ? "Shortest order" : "New plan", list: preview.next, isNew: true },
                        ].map((col) => (
                          <div key={col.label}>
                            <p className="eyebrow mb-2 text-[0.6rem] text-stone">{col.label}</p>
                            <ol className="space-y-2">
                              {col.list.map((s, i) => {
                                const fresh = col.isNew && (preview.kind === "optimise" ? moved(s, i) : changed(s));
                                return (
                                  <li key={`${s.place.name}-${i}`} className={cn("flex items-center gap-3 rounded-2xl p-3 ring-1", fresh ? "bg-white ring-brand/40" : col.isNew ? "bg-white ring-line" : "bg-paper-2/70 ring-transparent")}>
                                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full font-mono text-[11px]", fresh ? "bg-brand text-white" : "bg-ink/80 text-paper")}>{i + 1}</span>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm text-ink">{s.place.name}</p>
                                      <p className="flex items-center gap-2 truncate text-[11px] text-stone">
                                        <span>{s.time?.split(/\s*[-–]\s*/)[0]}</span>
                                        {s.place.area && (
                                          <span className="inline-flex items-center gap-0.5 truncate">
                                            <MapPin className="size-3" /> {s.place.area}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <span className="shrink-0 font-mono text-xs text-ink">{s.estimatedCost ? money(s.estimatedCost) : "Free"}</span>
                                    {fresh && <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] text-brand">{preview.kind === "optimise" ? "moved" : "new"}</span>}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2 text-xs">
                      {preview.next && preview.kind !== "optimise" && (
                        <span className={cn("rounded-full px-3 py-1.5", cost(preview.next) <= cost(preview.now) ? "bg-brand-soft text-brand" : "bg-sun-soft text-ink")}>
                          Day spend {money(cost(preview.now))} → {money(cost(preview.next))}
                        </span>
                      )}
                      {preview.km && preview.km.before > 0 && (
                        <span className="rounded-full bg-brand-soft px-3 py-1.5 text-brand">
                          Route {preview.km.before.toFixed(1)} km → {preview.km.after.toFixed(1)} km
                          {preview.km.after < preview.km.before - 0.05 ? ` · saves ${(preview.km.before - preview.km.after).toFixed(1)} km` : ""}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-stone">
                  {preview.kind === "optimise" ? "Worked out on this device; nothing is used up." : `Each replan uses one of this trip's ${CHAT_LIMIT} AI requests${left !== null ? ` · ${left} left` : ""}. Nothing changes until you save.`}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPreview(null)} disabled={preview.status === "saving"} className="rounded-full px-4 py-2.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-paper-2 disabled:opacity-50">
                    Keep mine
                  </button>
                  {preview.kind === "refresh" && preview.next && (
                    <button type="button" onClick={() => ask(preview)} disabled={preview.status === "saving" || preview.status === "loading"} className="rounded-full px-4 py-2.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-paper-2 disabled:opacity-50">
                      Try again
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={apply}
                    disabled={!preview.next || preview.status === "saving" || preview.status === "loading"}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-brand disabled:opacity-40"
                  >
                    {preview.status === "saving" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Use this plan
                  </button>
                </div>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

/**
 * Under a day's header, for the trip's owner: the rain plan (lit up when the
 * forecast says rain and the day has outdoor stops), a fresh take on the
 * day, the shortest route, and the full editor.
 */
export function DayActions({ index, day, rainy }: { index: number; day: DayItinerary; rainy?: boolean }) {
  const tools = usePlanTools();
  if (!tools) return null;
  const stops = editableStops(day);
  const exposed = stops.filter(isOutdoor).length;
  const wet = !!rainy && exposed > 0;
  const btn = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors";
  return (
    <div className="no-print flex flex-wrap gap-2" role="group" aria-label={`Change day ${index + 1}`}>
      <button
        type="button"
        onClick={() => tools.replan(index, "rain")}
        disabled={!stops.length}
        className={cn(btn, wet ? "bg-brand text-white shadow-[0_10px_30px_-12px_rgba(26,95,214,0.8)] hover:bg-ink" : "bg-white/80 text-ink ring-1 ring-line hover:bg-ink hover:text-paper")}
        title={wet ? `Rain is forecast and ${exposed} ${exposed === 1 ? "stop is" : "stops are"} outdoors` : "Swap outdoor stops for covered ones, same route and budget"}
      >
        <CloudRain className="size-4" /> {wet ? "Rain forecast: get a dry plan" : "Rain plan"}
      </button>
      <button type="button" onClick={() => tools.replan(index, "refresh")} disabled={!stops.length} className={cn(btn, "bg-white/80 text-ink ring-1 ring-line hover:bg-ink hover:text-paper")}>
        <Wand2 className="size-4" /> Replan day
      </button>
      {stops.length > 2 && (
        <button type="button" onClick={() => tools.optimise(index)} className={cn(btn, "bg-white/80 text-ink ring-1 ring-line hover:bg-ink hover:text-paper")}>
          <Route className="size-4" /> Optimise my day
        </button>
      )}
      <button type="button" onClick={() => tools.edit(index)} className={cn(btn, "bg-white/80 text-ink ring-1 ring-line hover:bg-ink hover:text-paper")}>
        <Pencil className="size-4" /> Edit plan
      </button>
      <button type="button" onClick={() => tools.whatsapp(index)} className={cn(btn, "bg-white/80 text-ink ring-1 ring-line hover:bg-[#1da851] hover:text-white hover:ring-transparent")}>
        <WhatsApp className="size-4" /> Send to WhatsApp
      </button>
    </div>
  );
}
