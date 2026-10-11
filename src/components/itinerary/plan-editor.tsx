"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { ArrowRightLeft, Check, ChevronDown, ChevronUp, GripVertical, Loader2, MapPin, Plus, RotateCcw, Search, Trash2, X } from "@/components/site/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FoundPlace } from "@/app/api/places/search/route";
import { track } from "@/lib/analytics";
import { useMoney } from "@/lib/money";
import { retime } from "@/lib/route-order";
import { editableStops, type ActivitySlot, type ItineraryDetails } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { saveDays } from "./plan-tools";

/*
 * The plan editor: every day as a column of stops. Drag to reorder or to move
 * a stop to another day (or use the arrows and "Move to"), add your own place
 * by searching for it, delete with undo, then save. Days whose order changed
 * get fresh times on the way out.
 */

interface Item {
  /** Unique across the editor (stop keys are only unique within a day). */
  uid: string;
  stop: ActivitySlot;
}
type Columns = Item[][];

let seq = 0;
const uid = () => `i${++seq}`;
const colId = (d: number) => `day-${d}`;
const ease = [0.16, 1, 0.3, 1] as const;

function centreOf(items: Item[], fallback?: [number, number]) {
  const pts = items.map((i) => i.stop.place).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && (p.lat !== 0 || p.lng !== 0));
  if (!pts.length) return fallback;
  return [pts.reduce((n, p) => n + p.lat!, 0) / pts.length, pts.reduce((n, p) => n + p.lng!, 0) / pts.length] as [number, number];
}

export function PlanEditor({ it, startDay = 0, onClose }: { it: ItineraryDetails; startDay?: number; onClose: () => void }) {
  const days = useMemo(() => it.itineraryData?.itinerary ?? [], [it.itineraryData]);
  const initial = useMemo<Columns>(() => days.map((d) => editableStops(d).map((stop) => ({ uid: uid(), stop }))), [days]);
  const [cols, setCols] = useState<Columns>(initial);
  const [dragging, setDragging] = useState<Item | null>(null);
  const [removed, setRemoved] = useState<{ item: Item; day: number; at: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const tripCentre = useMemo(() => centreOf(initial.flat()), [initial]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Which days changed, compared with what was saved.
  const dirty = cols.map((c, d) => c.length !== initial[d].length || c.some((item, i) => item.uid !== initial[d][i]?.uid));
  const anyDirty = dirty.some(Boolean);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const el = board.current?.querySelector<HTMLElement>(`[data-day="${startDay}"]`);
    el?.scrollIntoView({ inline: "start", block: "nearest" });
    return () => {
      document.body.style.overflow = "";
    };
  }, [startDay]);

  const close = () => {
    if (anyDirty && !window.confirm("Discard your changes to the plan?")) return;
    onClose();
  };

  const find = (id: string) => {
    for (let d = 0; d < cols.length; d++) {
      if (id === colId(d)) return { day: d, index: cols[d].length };
      const i = cols[d].findIndex((x) => x.uid === id);
      if (i >= 0) return { day: d, index: i };
    }
    return null;
  };

  const onDragStart = (e: DragStartEvent) => {
    const at = find(String(e.active.id));
    setDragging(at ? cols[at.day][at.index] : null);
  };

  // Moving into another day happens while dragging, so the column opens up under the pointer.
  const onDragOver = (e: DragOverEvent) => {
    const from = find(String(e.active.id));
    const to = e.over ? find(String(e.over.id)) : null;
    if (!from || !to || from.day === to.day) return;
    setCols((prev) => {
      const next = prev.map((c) => [...c]);
      const [item] = next[from.day].splice(from.index, 1);
      next[to.day].splice(Math.min(to.index, next[to.day].length), 0, item);
      return next;
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const from = find(String(e.active.id));
    const to = e.over ? find(String(e.over.id)) : null;
    if (!from || !to || from.day !== to.day || from.index === to.index) return;
    setCols((prev) => prev.map((c, d) => (d === from.day ? arrayMove(c, from.index, Math.min(to.index, c.length - 1)) : c)));
  };

  const move = (day: number, index: number, toDay: number, toIndex?: number) =>
    setCols((prev) => {
      const next = prev.map((c) => [...c]);
      const [item] = next[day].splice(index, 1);
      next[toDay].splice(toIndex ?? next[toDay].length, 0, item);
      return next;
    });

  const remove = (day: number, index: number) => {
    const item = cols[day][index];
    setCols((prev) => prev.map((c, d) => (d === day ? c.filter((_, i) => i !== index) : c)));
    setRemoved({ item, day, at: index });
  };
  const restore = () => {
    if (!removed) return;
    setCols((prev) => prev.map((c, d) => (d === removed.day ? [...c.slice(0, removed.at), removed.item, ...c.slice(removed.at)] : c)));
    setRemoved(null);
  };

  const add = (day: number, place: FoundPlace | string) => {
    const p = typeof place === "string" ? { name: place.trim() } : place;
    if (!p.name) return;
    const stop: ActivitySlot = {
      time: "",
      duration: "1-2 hours",
      estimatedCost: 0,
      mine: true,
      category: "sight",
      place: { name: p.name, area: p.area, lat: p.lat, lng: p.lng, description: p.address ?? "" },
    };
    setCols((prev) => prev.map((c, d) => (d === day ? [...c, { uid: uid(), stop }] : c)));
    track("place_added", { day: day + 1, located: typeof place !== "string" && !!place.lat });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const changed = cols
        .map((c, d) => ({ index: d, items: c }))
        .filter(({ index }) => dirty[index])
        .map(({ index, items }) => ({ index, stops: retime(items.map((i) => i.stop), initial[index].map((i) => i.stop)) }));
      await saveDays(it, changed);
      track("plan_edited", { days: changed.length });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your changes.");
      setSaving(false);
    }
  };

  return (
    <motion.div className="no-print fixed inset-0 z-[70] flex flex-col bg-paper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} role="dialog" aria-label="Edit your plan">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="eyebrow text-[0.6rem] text-stone">Edit your plan</p>
          <p className="truncate text-sm text-ink">Drag stops to reorder or move them between days. Times update when you save.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-destructive">{error}</span>}
          <button type="button" onClick={close} disabled={saving} className="rounded-full px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-paper-2 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={!anyDirty || saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm text-paper transition-colors hover:bg-brand disabled:opacity-40">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save changes
          </button>
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        <div ref={board} className="flex flex-1 snap-x gap-3 overflow-x-auto overflow-y-hidden p-4 sm:gap-4 sm:p-6">
          {cols.map((items, d) => (
            <DayColumn
              key={d}
              day={d}
              title={days[d]?.theme}
              total={days.length}
              items={items}
              dirty={dirty[d]}
              centre={centreOf(items, tripCentre)}
              onMove={move}
              onRemove={remove}
              onAdd={add}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16,1,0.3,1)" }}>{dragging ? <Row item={dragging} overlay /> : null}</DragOverlay>
      </DndContext>

      {removed && (
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease }} className="fixed bottom-5 left-1/2 z-[71] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-paper shadow-float">
          <span className="max-w-[50vw] truncate">Removed {removed.item.stop.place.name}</span>
          <button type="button" onClick={restore} className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1.5 text-paper transition-colors hover:bg-paper/20">
            <RotateCcw className="size-3.5" /> Undo
          </button>
          <button type="button" onClick={() => setRemoved(null)} aria-label="Dismiss" className="grid size-7 place-items-center rounded-full text-paper/60 hover:text-paper">
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function DayColumn({
  day,
  title,
  total,
  items,
  dirty,
  centre,
  onMove,
  onRemove,
  onAdd,
}: {
  day: number;
  title?: string;
  total: number;
  items: Item[];
  dirty: boolean;
  centre?: [number, number];
  onMove: (day: number, index: number, toDay: number, toIndex?: number) => void;
  onRemove: (day: number, index: number) => void;
  onAdd: (day: number, place: FoundPlace | string) => void;
}) {
  const { fmt: money } = useMoney();
  const { setNodeRef, isOver } = useDroppable({ id: colId(day) });
  const cost = items.reduce((n, i) => n + (i.stop.estimatedCost || 0), 0);
  return (
    <section data-day={day} className={cn("flex w-[86vw] max-w-[23rem] shrink-0 snap-start flex-col rounded-[24px] bg-paper-2/70 ring-1 transition-colors sm:w-[22rem]", isOver ? "ring-brand/50" : "ring-line")}>
      <div className="flex items-start justify-between gap-2 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-stone">
            Day {day + 1}
            {dirty && <span className="rounded-full bg-brand px-1.5 py-0.5 text-[0.5rem] tracking-[0.15em] text-white">Edited</span>}
          </p>
          <p className="mt-1 truncate text-sm text-ink">{title}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-stone">{money(cost)}</span>
      </div>
      <div ref={setNodeRef} className="min-h-24 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        <SortableContext items={items.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
          {items.map((item, i) => (
            <SortableRow key={item.uid} item={item} day={day} index={i} count={items.length} total={total} onMove={onMove} onRemove={onRemove} />
          ))}
        </SortableContext>
        {!items.length && <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-xs text-stone">Drop a stop here, or add a place below.</p>}
      </div>
      <AddPlace day={day} centre={centre} onAdd={onAdd} />
    </section>
  );
}

function SortableRow(props: { item: Item; day: number; index: number; count: number; total: number; onMove: (day: number, index: number, toDay: number, toIndex?: number) => void; onRemove: (day: number, index: number) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props.item.uid });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "opacity-30")}>
      <Row {...props} handle={{ ref: setActivatorNodeRef, ...attributes, ...listeners }} />
    </div>
  );
}

function Row({
  item,
  day,
  index,
  count,
  total,
  onMove,
  onRemove,
  overlay,
  handle,
}: {
  item: Item;
  day?: number;
  index?: number;
  count?: number;
  total?: number;
  onMove?: (day: number, index: number, toDay: number, toIndex?: number) => void;
  onRemove?: (day: number, index: number) => void;
  overlay?: boolean;
  handle?: Record<string, unknown> & { ref: (el: HTMLElement | null) => void };
}) {
  const { fmt: money } = useMoney();
  const s = item.stop;
  const { ref, ...handleProps } = handle ?? { ref: undefined };
  const can = day !== undefined && index !== undefined && onMove && onRemove;
  return (
    <div className={cn("group flex gap-2 rounded-2xl bg-white p-2.5 pr-2 ring-1 ring-line", overlay && "rotate-[1.5deg] shadow-float ring-brand/40")}>
      <button
        type="button"
        ref={ref as never}
        {...handleProps}
        aria-label={`Drag ${s.place.name}`}
        className="grid w-6 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-stone-2 hover:bg-paper-2 hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-sm leading-snug text-ink [overflow-wrap:anywhere]">{s.place.name}</p>
          <span className="shrink-0 pt-0.5 font-mono text-[11px] text-ink">{s.estimatedCost ? money(s.estimatedCost) : "Free"}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-2 truncate text-[11px] text-stone">
            {s.time && <span className="shrink-0">{s.time.split(/\s*[-–]\s*/)[0]}</span>}
            {s.place.area && (
              <span className="inline-flex min-w-0 items-center gap-0.5 truncate">
                <MapPin className="size-3 shrink-0" /> {s.place.area}
              </span>
            )}
            {s.mine && <span className="shrink-0 rounded-full bg-sun-soft px-1.5 text-[10px] text-ink">yours</span>}
          </p>
          {can && (
            <div className="-my-1 flex shrink-0 items-center gap-0.5">
              <button type="button" onClick={() => onMove!(day!, index!, day!, index! - 1)} disabled={index === 0} aria-label="Move up" className="grid size-7 place-items-center rounded-lg text-stone hover:bg-paper-2 hover:text-ink disabled:opacity-25">
                <ChevronUp className="size-3.5" />
              </button>
              <button type="button" onClick={() => onMove!(day!, index!, day!, index! + 1)} disabled={index === (count ?? 0) - 1} aria-label="Move down" className="grid size-7 place-items-center rounded-lg text-stone hover:bg-paper-2 hover:text-ink disabled:opacity-25">
                <ChevronDown className="size-3.5" />
              </button>
              {(total ?? 0) > 1 && (
                <label className="relative grid size-7 cursor-pointer place-items-center rounded-lg text-stone hover:bg-paper-2 hover:text-ink" title="Move to another day">
                  <ArrowRightLeft className="size-3.5" />
                  <select
                    value=""
                    onChange={(e) => e.target.value !== "" && onMove!(day!, index!, Number(e.target.value))}
                    aria-label={`Move ${s.place.name} to another day`}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  >
                    <option value="">Move to…</option>
                    {Array.from({ length: total ?? 0 }, (_, d) => d)
                      .filter((d) => d !== day)
                      .map((d) => (
                        <option key={d} value={d}>
                          Day {d + 1}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <button type="button" onClick={() => onRemove!(day!, index!)} aria-label={`Remove ${s.place.name}`} className="grid size-7 place-items-center rounded-lg text-stone hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Search for a place near the day and add it; or add exactly what was typed. */
function AddPlace({ day, centre, onAdd }: { day: number; centre?: [number, number]; onAdd: (day: number, place: FoundPlace | string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<FoundPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: q.trim() });
        if (centre) {
          params.set("lat", String(centre[0]));
          params.set("lng", String(centre[1]));
        }
        const res = await fetch(`/api/places/search?${params}`, { signal: ctrl.signal });
        const body = await res.json().catch(() => ({}));
        setResults(Array.isArray(body.places) ? body.places : []);
      } catch {
        /* typing on, or offline */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q, centre]);

  const pick = (p: FoundPlace | string) => {
    onAdd(day, p);
    setQ("");
    setResults([]);
    setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="m-3 mt-0 inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 py-2.5 text-sm text-ink/70 transition-colors hover:border-brand hover:text-brand">
        <Plus className="size-4" /> Add a place
      </button>
    );
  }
  return (
    <div className="m-3 mt-0 rounded-2xl bg-white p-2 ring-1 ring-brand/40">
      <label className="flex items-center gap-2 px-2">
        {loading ? <Loader2 className="size-4 animate-spin text-brand" /> : <Search className="size-4 text-stone" />}
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 100))}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && q.trim()) pick(results[0] ?? q);
          }}
          placeholder="A café, a museum, a friend's place…"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-stone-2"
          aria-label={`Add a place to day ${day + 1}`}
        />
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-7 place-items-center rounded-full text-stone hover:text-ink">
          <X className="size-3.5" />
        </button>
      </label>
      {(results.length > 0 || q.trim().length >= 2) && (
        <ul className="mt-1 max-h-56 overflow-y-auto border-t border-line pt-1">
          {results.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <button type="button" onClick={() => pick(p)} className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left hover:bg-paper-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{p.name}</span>
                  <span className="block truncate text-[11px] text-stone">{[p.kind, p.address].filter(Boolean).join(" · ")}</span>
                </span>
              </button>
            </li>
          ))}
          {q.trim().length >= 2 && (
            <li>
              <button type="button" onClick={() => pick(q)} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-ink hover:bg-paper-2">
                <Plus className="size-3.5 text-brand" /> Add &ldquo;{q.trim()}&rdquo; as typed
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
