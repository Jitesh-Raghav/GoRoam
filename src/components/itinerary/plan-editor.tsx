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
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Flower2, GripVertical, Landmark, Loader2, MapPin, Martini, MoreHorizontal, Mountain, Palette, Plus, RotateCcw, Search, ShoppingBag, Trash2, TreePine, UtensilsCrossed, X } from "@/components/site/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FoundPlace } from "@/app/api/places/search/route";
import { track } from "@/lib/analytics";
import { useMoney } from "@/lib/money";
import { km, retime, routeKm } from "@/lib/route-order";
import { editableStops, type ActivitySlot, type ItineraryDetails } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto } from "./place-photo";
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
const tabId = (d: number) => `tab-${d}`;
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
  // The day shown on phones.
  const [view, setView] = useState(startDay);
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
      if (id === colId(d) || id === tabId(d)) return { day: d, index: cols[d].length };
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

  // What changed since opening, for the header: moved, added and removed stops.
  const origin = useMemo(() => new Map(initial.flatMap((c, d) => c.map((item, i) => [item.uid, { day: d, index: i }] as const))), [initial]);
  const now = new Set(cols.flat().map((i) => i.uid));
  const added = cols.flat().filter((i) => !origin.has(i.uid)).length;
  const removedCount = [...origin.keys()].filter((k) => !now.has(k)).length;
  const moved = cols.reduce((n, c, d) => n + c.filter((item) => origin.has(item.uid) && origin.get(item.uid)!.day !== d).length, 0);
  // A day counts as reordered when the stops it kept are in a new order.
  const reordered = cols.filter((c, d) => {
    const kept = c.filter((item) => origin.get(item.uid)?.day === d).map((item) => origin.get(item.uid)!.index);
    return kept.some((v, i) => i > 0 && v < kept[i - 1]);
  }).length;
  const summary = [
    moved && `${moved} moved to another day`,
    reordered && `${reordered} ${reordered === 1 ? "day" : "days"} reordered`,
    added && `${added} added`,
    removedCount && `${removedCount} removed`,
  ]
    .filter(Boolean)
    .join(" · ");
  const statusOf = (item: Item, d: number): "new" | "moved" | undefined => {
    const o = origin.get(item.uid);
    if (!o) return "new";
    return o.day !== d ? "moved" : undefined;
  };

  const actions = (
    <>
      <button type="button" onClick={close} disabled={saving} className="rounded-full px-4 py-2.5 text-sm text-ink ring-1 ring-line-strong transition-colors hover:bg-white disabled:opacity-50">
        Cancel
      </button>
      <button
        type="button"
        onClick={save}
        disabled={!anyDirty || saving}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper shadow-[0_12px_28px_-14px_rgba(14,31,59,0.8)] transition-colors hover:bg-brand disabled:opacity-40 disabled:shadow-none md:flex-none"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save changes
      </button>
    </>
  );

  return (
    <motion.div
      className="no-print fixed inset-0 z-[70] flex flex-col bg-[radial-gradient(rgba(14,31,59,0.07)_1px,transparent_1px)] bg-paper [background-size:22px_22px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Edit your plan"
    >
      <header className="liquid-glass relative z-10 mx-2 mt-2 flex items-center gap-3 rounded-[22px] px-3 py-2.5 sm:mx-4 sm:mt-4 sm:px-4">
        <button type="button" onClick={close} aria-label="Close the editor" className="grid size-10 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-white">
          <X className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="display truncate text-lg leading-tight text-ink sm:text-xl">Edit your plan</p>
          <p className="truncate text-xs text-stone">
            {summary ? <span className="text-brand">{summary}</span> : <span className="hidden sm:inline">Drag a stop to reorder it or drop it on another day. Times update when you save.</span>}
            {!summary && <span className="sm:hidden">Hold and drag to move stops</span>}
          </p>
        </div>
        {error && <span className="hidden max-w-xs truncate text-sm text-destructive md:block">{error}</span>}
        <div className="hidden items-center gap-2 md:flex">{actions}</div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        {/* Phones: one day at a time; drop a stop on a tab to move it to that day. */}
        <nav aria-label="Days" className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-1 pt-3 md:hidden">
          {cols.map((items, d) => (
            <DayTab key={d} day={d} count={items.length} active={d === view} dirty={dirty[d]} onClick={() => setView(d)} />
          ))}
        </nav>

        <div ref={board} className="flex-1 overflow-y-auto overscroll-contain px-3 pb-28 pt-3 md:overflow-x-auto md:overflow-y-hidden md:px-6 md:pb-6 md:pt-5">
          <div className="md:grid md:h-full md:auto-cols-[minmax(19.5rem,28rem)] md:grid-flow-col md:items-start md:gap-4">
            {cols.map((items, d) => (
              <DayColumn
                key={d}
                day={d}
                hidden={d !== view}
                title={days[d]?.theme}
                city={days[d]?.city}
                total={days.length}
                items={items}
                dirty={dirty[d]}
                statusOf={(item) => statusOf(item, d)}
                centre={centreOf(items, tripCentre)}
                onMove={move}
                onRemove={remove}
                onAdd={add}
              />
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16,1,0.3,1)" }}>{dragging ? <Row item={dragging} overlay /> : null}</DragOverlay>
      </DndContext>

      {/* Phones: the actions sit under the thumb. */}
      <div className="liquid-glass fixed inset-x-2 bottom-2 z-[71] flex items-center gap-2 rounded-full p-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] md:hidden">
        {error ? <span className="min-w-0 flex-1 truncate px-3 text-sm text-destructive">{error}</span> : null}
        {actions}
      </div>

      <AnimatePresence>
        {removed && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-[72] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-paper shadow-float md:bottom-6"
          >
            <span className="min-w-0 truncate">Removed {removed.item.stop.place.name}</span>
            <button type="button" onClick={restore} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1.5 text-paper transition-colors hover:bg-paper/20">
              <RotateCcw className="size-3.5" /> Undo
            </button>
            <button type="button" onClick={() => setRemoved(null)} aria-label="Dismiss" className="grid size-7 shrink-0 place-items-center rounded-full text-paper/60 hover:text-paper">
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CATEGORY_ICON: Record<string, typeof MapPin> = {
  sight: Landmark,
  food: UtensilsCrossed,
  nature: TreePine,
  culture: Palette,
  nightlife: Martini,
  shopping: ShoppingBag,
  wellness: Flower2,
  activity: Mountain,
};

function DayTab({ day, count, active, dirty, onClick }: { day: number; count: number; active: boolean; dirty: boolean; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: tabId(day) });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-all",
        active ? "bg-ink text-paper shadow-[0_10px_24px_-14px_rgba(14,31,59,0.9)]" : "bg-white text-ink ring-1 ring-line-strong",
        isOver && "scale-105 bg-brand text-white ring-0"
      )}
    >
      Day {day + 1}
      <span className={cn("rounded-full px-1.5 font-mono text-[10px]", active || isOver ? "bg-white/15" : "bg-paper-2 text-stone")}>{count}</span>
      {dirty && <span aria-label="edited" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-sun-2" />}
    </button>
  );
}

function DayColumn({
  day,
  hidden,
  title,
  city,
  total,
  items,
  dirty,
  statusOf,
  centre,
  onMove,
  onRemove,
  onAdd,
}: {
  day: number;
  /** Phones show one day at a time. */
  hidden: boolean;
  title?: string;
  city?: string;
  total: number;
  items: Item[];
  dirty: boolean;
  statusOf: (item: Item) => "new" | "moved" | undefined;
  centre?: [number, number];
  onMove: (day: number, index: number, toDay: number, toIndex?: number) => void;
  onRemove: (day: number, index: number) => void;
  onAdd: (day: number, place: FoundPlace | string) => void;
}) {
  const { fmt: money } = useMoney();
  const { setNodeRef, isOver } = useDroppable({ id: colId(day) });
  const cost = items.reduce((n, i) => n + (i.stop.estimatedCost || 0), 0);
  const walk = routeKm(items.map((i) => i.stop));
  return (
    <section
      data-day={day}
      className={cn(
        "flex flex-col rounded-[26px] bg-white/75 shadow-[0_1px_2px_rgba(14,31,59,0.05),0_24px_48px_-36px_rgba(14,31,59,0.45)] ring-1 backdrop-blur-sm transition-[box-shadow,background-color] md:max-h-full",
        hidden && "max-md:hidden",
        isOver ? "bg-brand-soft/70 ring-2 ring-brand/50" : "ring-line"
      )}
    >
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-paper">
          <span className="text-center leading-none">
            <span className="block font-mono text-[8px] tracking-[0.2em] text-paper/60">DAY</span>
            <span className="display mt-0.5 block text-lg">{day + 1}</span>
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.95rem] leading-snug text-ink">{title || `Day ${day + 1}`}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone">
            {city && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">{city.split(",")[0]}</span>}
            <span>
              {items.length} {items.length === 1 ? "stop" : "stops"}
            </span>
            <span aria-hidden>·</span>
            <span className="font-mono">{money(cost)}</span>
            {walk > 0.05 && (
              <>
                <span aria-hidden>·</span>
                <span>{walk < 10 ? walk.toFixed(1) : Math.round(walk)} km</span>
              </>
            )}
            {dirty && <span className="rounded-full bg-sun-soft px-2 py-0.5 text-ink">Edited</span>}
          </p>
        </div>
      </div>
      <div ref={setNodeRef} className="min-h-20 flex-1 px-3 pb-1 md:overflow-y-auto">
        <SortableContext items={items.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
          {items.map((item, i) => (
            <div key={item.uid}>
              {i > 0 && <Hop from={items[i - 1].stop} to={item.stop} />}
              <SortableRow item={item} day={day} index={i} count={items.length} total={total} status={statusOf(item)} onMove={onMove} onRemove={onRemove} />
            </div>
          ))}
        </SortableContext>
        {!items.length && (
          <div className="grid place-items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong px-4 py-8 text-center">
            <MapPin className="size-5 text-brand/60" />
            <p className="text-xs text-stone">A free day. Drop a stop here, or add a place.</p>
          </div>
        )}
      </div>
      <AddPlace day={day} centre={centre} onAdd={onAdd} />
    </section>
  );
}

/** The walk between two stops, when both are on the map. */
function Hop({ from, to }: { from: ActivitySlot; to: ActivitySlot }) {
  const a = from.place;
  const b = to.place;
  const ok = (p: typeof a) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && (p.lat !== 0 || p.lng !== 0);
  const d = ok(a) && ok(b) ? km([a.lat!, a.lng!], [b.lat!, b.lng!]) : null;
  return (
    <div aria-hidden className="flex h-6 items-center gap-2 pl-[1.6rem]">
      <span className="h-full border-l-2 border-dotted border-ink/15" />
      {d !== null && <span className="font-mono text-[10px] text-stone">{d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`}</span>}
    </div>
  );
}

function SortableRow(props: {
  item: Item;
  day: number;
  index: number;
  count: number;
  total: number;
  status?: "new" | "moved";
  onMove: (day: number, index: number, toDay: number, toIndex?: number) => void;
  onRemove: (day: number, index: number) => void;
}) {
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
  status,
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
  status?: "new" | "moved";
  onMove?: (day: number, index: number, toDay: number, toIndex?: number) => void;
  onRemove?: (day: number, index: number) => void;
  overlay?: boolean;
  handle?: Record<string, unknown> & { ref: (el: HTMLElement | null) => void };
}) {
  const { fmt: money } = useMoney();
  const [menu, setMenu] = useState(false);
  const s = item.stop;
  const { ref, ...handleProps } = handle ?? { ref: undefined };
  const can = day !== undefined && index !== undefined && onMove && onRemove;
  const Icon = CATEGORY_ICON[s.category ?? ""] ?? MapPin;
  const time = s.time?.split(/\s*[-–]\s*/)[0];
  const others = Array.from({ length: total ?? 0 }, (_, d) => d).filter((d) => d !== day);
  const iconBtn = "grid size-8 place-items-center rounded-full text-stone transition-colors hover:bg-paper-2 hover:text-ink disabled:opacity-25";

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-[20px] bg-white p-2 pr-2.5 ring-1 transition-shadow hover:shadow-[0_14px_30px_-22px_rgba(14,31,59,0.6)] focus-within:shadow-[0_14px_30px_-22px_rgba(14,31,59,0.6)]",
        status === "new" ? "ring-sun/60" : status === "moved" ? "ring-brand/40" : "ring-line",
        overlay && "rotate-[1.5deg] shadow-float ring-2 ring-brand/50"
      )}
    >
      <button
        type="button"
        ref={ref as never}
        {...handleProps}
        aria-label={`Drag ${s.place.name}`}
        className="-ml-0.5 grid h-12 w-5 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-stone-2 transition-colors hover:bg-paper-2 hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-paper-2">
        <PlacePhoto activity={s} icon={Icon} credit={false} className="absolute inset-0" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11px] text-stone">
          {time && <span className="font-mono text-ink/80">{time}</span>}
          {time && <span aria-hidden>·</span>}
          <Icon className="size-3 shrink-0 text-brand" />
          {s.place.area && <span className="truncate">{s.place.area}</span>}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink [overflow-wrap:anywhere]">{s.place.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px]">
          <span className="font-mono text-ink/70">{s.estimatedCost ? money(s.estimatedCost) : "Free"}</span>
          {status === "new" && <span className="rounded-full bg-sun-soft px-1.5 text-[10px] text-ink">New</span>}
          {status === "moved" && <span className="rounded-full bg-brand-soft px-1.5 text-[10px] text-brand">Moved</span>}
          {s.mine && status !== "new" && <span className="rounded-full bg-paper-2 px-1.5 text-[10px] text-stone">Yours</span>}
        </p>
      </div>

      {can && (
        <>
          {/* Desktop: quick actions on hover or focus. */}
          <div className="hidden shrink-0 flex-col items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
            <button type="button" onClick={() => onMove!(day!, index!, day!, index! - 1)} disabled={index === 0} aria-label={`Move ${s.place.name} up`} className={cn(iconBtn, "size-7")}>
              <ChevronUp className="size-3.5" />
            </button>
            <button type="button" onClick={() => onMove!(day!, index!, day!, index! + 1)} disabled={index === (count ?? 0) - 1} aria-label={`Move ${s.place.name} down`} className={cn(iconBtn, "size-7")}>
              <ChevronDown className="size-3.5" />
            </button>
          </div>
          <div className="relative shrink-0">
            <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label={`More for ${s.place.name}`} className={iconBtn}>
              <MoreHorizontal className="size-4" />
            </button>
            <AnimatePresence>
              {menu && (
                <>
                  <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.16 }}
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.25rem)] z-20 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(14,31,59,0.55)] ring-1 ring-line"
                  >
                    {[
                      { label: "Move up", icon: ChevronUp, off: index === 0, run: () => onMove!(day!, index!, day!, index! - 1) },
                      { label: "Move down", icon: ChevronDown, off: index === (count ?? 0) - 1, run: () => onMove!(day!, index!, day!, index! + 1) },
                    ].map((a) => (
                      <button key={a.label} type="button" role="menuitem" disabled={a.off} onClick={() => (a.run(), setMenu(false))} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-ink hover:bg-paper-2 disabled:opacity-35 md:hidden">
                        <a.icon className="size-4 text-stone" /> {a.label}
                      </button>
                    ))}
                    {others.length > 0 && (
                      <>
                        <p className="eyebrow px-2.5 pb-1 pt-2 text-[0.55rem] text-stone">Move to</p>
                        <div className="flex flex-wrap gap-1 px-1.5 pb-1.5">
                          {others.map((d) => (
                            <button key={d} type="button" role="menuitem" onClick={() => (onMove!(day!, index!, d), setMenu(false))} className="rounded-full bg-paper-2 px-2.5 py-1 text-xs text-ink transition-colors hover:bg-ink hover:text-paper">
                              Day {d + 1}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <button type="button" role="menuitem" onClick={() => (onRemove!(day!, index!), setMenu(false))} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
                      <Trash2 className="size-4" /> Remove
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
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
      <button type="button" onClick={() => setOpen(true)} className="m-3 mt-2 inline-flex items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-line-strong py-3 text-sm text-ink/70 transition-colors hover:border-brand hover:bg-brand-soft/50 hover:text-brand">
        <Plus className="size-4" /> Add a place
      </button>
    );
  }
  return (
    <div className="m-3 mt-2 rounded-[18px] bg-white p-2 ring-2 ring-brand/40">
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
