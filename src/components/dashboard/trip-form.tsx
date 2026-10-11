"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowDownUp,
  ArrowRight,
  Baby,
  Bike,
  Building,
  Building2,
  Camera,
  Car,
  Check,
  Clock3,
  Compass,
  Footprints,
  Gem,
  Heart,
  Hotel,
  Landmark,
  Leaf,
  MapPin,
  Martini,
  Minus,
  Mountain,
  Navigation,
  Palette,
  Palmtree,
  Plane,
  Plus,
  Route,
  Sailboat,
  ShoppingBag,
  Sofa,
  Sparkles,
  Tent,
  TreePine,
  User,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
  GripVertical,
} from "@/components/site/icons";

import { useCredits } from "@/components/dashboard/dashboard-layout";
import { invalidate } from "@/lib/cached-json";
import { DateRangePicker } from "./date-range-picker";
import { Inspire } from "./inspire";
import { track } from "@/lib/analytics";
import { BoardingPass } from "@/components/dashboard/boarding-pass";
import { PlaceField } from "@/components/dashboard/place-field";
import { GeneratingOverlay } from "@/components/dashboard/generating-overlay";
import { OutOfCredits, PLANNER_DRAFT_KEY } from "@/components/dashboard/out-of-credits";
import { PillButton } from "@/components/site/pill";
import {
  COMPANIONS,
  DEFAULT_PREFERENCES,
  DIETS,
  OCCASIONS,
  PACES,
  SPEND,
  STAYS,
  TRANSPORT,
  VIBES,
  labelFor,
  legsLabel,
  type TripLeg,
  type TripPreferences,
} from "@/lib/trip";
import { PLANS, perTrip } from "@/lib/plans";
import { budgetPicks, compactMoney, formatMoney, roundBudget } from "@/lib/currency";
import { tidy, useMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof MapPin> = {
  solo: User,
  couple: Heart,
  family: Baby,
  friends: Users,
  savvy: Wallet,
  comfort: Sparkles,
  luxury: Gem,
  hotel: Hotel,
  boutique: Building,
  apartment: Sofa,
  resort: Palmtree,
  hostel: Tent,
  transit: Footprints,
  rides: Car,
  car: Compass,
  landmarks: Landmark,
  hidden: Compass,
  food: UtensilsCrossed,
  art: Palette,
  history: Building2,
  outdoors: TreePine,
  beach: Sailboat,
  nightlife: Martini,
  shopping: ShoppingBag,
  wellness: Leaf,
  thrills: Mountain,
  photo: Camera,
};

const MAX_VIBES = 5;

const STEPS = [
  { id: "route", label: "Route", title: "Where & when?", subtitle: "Your starting point, the place you keep daydreaming about, and your dates." },
  { id: "people", label: "Who & budget", title: "Who's coming?", subtitle: "Who's on the trip and the total budget for everyone, in your own currency." },
  { id: "style", label: "Style", title: "How do you travel?", subtitle: "Your pace, what you're into and where you like to wake up." },
  { id: "details", label: "Details", title: "The fine print.", subtitle: "Optional, but it's what makes the plan feel like yours." },
] as const;

export interface TripFormData {
  source: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  /** The total budget, in `budgetCurrency`. */
  budget: number;
  budgetCurrency: string;
  interests: string[];
  /** Multi-city: the cities on the way, before `destination`, with days in each. Empty for one city. */
  stops?: Stop[];
}

interface TripFormProps {
  onSubmit?: (data: unknown) => void;
  isLoading?: boolean;
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-1.5 overflow-hidden pt-2 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="size-4 shrink-0" /> {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Stepper({
  label,
  icon: Icon,
  value,
  onChange,
  min,
  max,
  suffix,
  error,
}: {
  label: string;
  icon: typeof MapPin;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: (v: number) => string;
  error?: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div>
      <div
        className={cn(
          "flex h-[4.5rem] items-center gap-3 rounded-2xl bg-paper/60 px-4 ring-1",
          error ? "ring-destructive/60" : "ring-line-strong"
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand ring-1 ring-line-strong">
          <Icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="eyebrow text-[0.6rem] text-stone">{label}</span>
          <span className="mt-1 text-[1.05rem] text-ink" aria-live="polite">
            {value} {suffix(value)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(clamp(value - 1))}
            disabled={value <= min}
            aria-label={`Decrease ${label.toLowerCase()}`}
            className="grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-line-strong transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            aria-label={`Increase ${label.toLowerCase()}`}
            className="grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-line-strong transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function QuickPicks<T extends number>({ values, current, onPick, format }: { values: T[]; current: number; onPick: (v: T) => void; format: (v: T) => string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm transition-colors",
            current === v ? "bg-ink text-paper" : "bg-paper-2 text-ink/70 hover:bg-paper-3 hover:text-ink"
          )}
        >
          {format(v)}
        </button>
      ))}
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  label,
  hint,
  active,
  onClick,
  layoutGroup,
  compact,
}: {
  icon?: typeof MapPin;
  label: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
  layoutGroup: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "relative flex rounded-2xl text-left ring-1 transition-colors duration-300",
        compact ? "items-center gap-3 p-3.5" : "flex-col items-start gap-5 p-4",
        active ? "text-paper ring-ink" : "bg-paper/60 text-ink ring-line-strong hover:bg-white hover:ring-ink/35"
      )}
    >
      {active && <motion.span layoutId={layoutGroup} className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
      {Icon && (
        <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-brand text-white" : "bg-white text-brand ring-1 ring-line-strong")}>
          <Icon className="size-5" />
        </span>
      )}
      <span className="relative min-w-0">
        <span className="block font-medium">{label}</span>
        {hint && <span className={cn("block text-xs", active ? "text-paper/60" : "text-stone")}>{hint}</span>}
      </span>
    </button>
  );
}

function Chip({ label, icon: Icon, active, onClick, disabled }: { label: string; icon?: typeof MapPin; active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled && !active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm ring-1 transition-colors duration-300 disabled:opacity-40",
        active ? "bg-ink text-paper ring-ink" : "bg-paper/60 text-ink ring-line-strong hover:bg-white hover:ring-ink/35"
      )}
    >
      {Icon && <Icon className={cn("size-4", active ? "text-brand-2" : "text-brand")} />}
      {label}
      {active && <Check className="size-3.5 text-brand-2" />}
    </motion.button>
  );
}

function Label({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <p className="eyebrow text-[0.6rem] text-stone">{children}</p>
      {aside && <p className="text-xs text-stone">{aside}</p>}
    </div>
  );
}

/** A stop on the way, before the destination. `id` keeps rows steady while they're reordered. */
interface Stop extends TripLeg {
  id: string;
}
let stopSeq = 0;
const newStop = (city = "", days = 2): Stop => ({ id: `s${Date.now().toString(36)}${++stopSeq}`, city, days });

function DaysStepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-white px-1 py-1 ring-1 ring-line-strong" role="group" aria-label={`Days in ${label}`}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-paper-2 disabled:opacity-35" aria-label={`Fewer days in ${label}`}>
        <Minus className="size-3.5" />
      </button>
      <span className="w-[3.6rem] text-center text-sm tabular-nums text-ink" aria-live="polite">
        {value} {value === 1 ? "day" : "days"}
      </span>
      <button type="button" onClick={() => onChange(Math.min(29, value + 1))} className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-paper-2" aria-label={`More days in ${label}`}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** The route's markers: a ring where you start, numbered stops, a solid square where you end (as in ride apps). */
function Marker({ kind, n }: { kind: "start" | "stop" | "add" | "end"; n?: number }) {
  return (
    <span aria-hidden className="relative z-10 grid size-9 shrink-0 place-items-center">
      {kind === "start" && <span className="size-3.5 rounded-full bg-white ring-[3.5px] ring-ink" />}
      {kind === "stop" && <span className="grid size-7 place-items-center rounded-full bg-brand font-mono text-[11px] text-white shadow-[0_0_0_4px_var(--paper)]">{n}</span>}
      {kind === "add" && <span className="grid size-7 place-items-center rounded-full border-[1.5px] border-dashed border-brand/60 bg-paper text-brand"><Plus className="size-3.5" /></span>}
      {kind === "end" && <span className="size-3.5 rounded-[3px] bg-ink shadow-[0_0_0_4px_var(--paper)]" />}
    </span>
  );
}

function StopRow({
  stop,
  index,
  count,
  onChange,
  onRemove,
  onMove,
}: {
  stop: Stop;
  index: number;
  count: number;
  onChange: (s: Stop) => void;
  onRemove: () => void;
  onMove: (to: number) => void;
}) {
  const controls = useDragControls();
  const name = stop.city.split(",")[0] || `stop ${index + 1}`;
  return (
    <Reorder.Item
      value={stop}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-2 sm:gap-x-3"
    >
      <span className="pt-[1.125rem]">
        <Marker kind="stop" n={index + 1} />
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="min-w-0 flex-1 basis-full sm:basis-auto">
          <PlaceField id={`trip-stop-${stop.id}`} kind="to" label={`Stop ${index + 1}`} icon={MapPin} value={stop.city} onChange={(city) => onChange({ ...stop, city })} placeholder={index === 0 ? "e.g. Jaipur" : "e.g. Udaipur"} />
        </div>
        <DaysStepper value={stop.days} onChange={(days) => onChange({ ...stop, days })} label={name} />
        {count > 1 && (
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" && index > 0) {
                e.preventDefault();
                onMove(index - 1);
              } else if (e.key === "ArrowDown" && index < count - 1) {
                e.preventDefault();
                onMove(index + 1);
              }
            }}
            aria-label={`Reorder ${name}: drag, or use the arrow keys`}
            className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-full text-stone transition-colors hover:bg-white hover:text-ink active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="grid size-9 shrink-0 place-items-center rounded-full text-stone transition-colors hover:bg-destructive/10 hover:text-destructive">
          <X className="size-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}

/**
 * Where the trip goes, read top to bottom like a ride app: where you start,
 * the cities you stop in on the way (each with its days), and where you end
 * up. Adding a stop puts it before the destination.
 */
function RouteBuilder({
  source,
  destination,
  stops,
  destDays,
  onSource,
  onDestination,
  onStops,
  onDestDays,
  onReverse,
  errors,
}: {
  source: string;
  destination: string;
  stops: Stop[];
  destDays: number;
  onSource: (v: string) => void;
  onDestination: (v: string) => void;
  onStops: (next: Stop[]) => void;
  onDestDays: (d: number) => void;
  onReverse: () => void;
  errors: Record<string, string>;
}) {
  const total = destDays + stops.reduce((n, s) => n + s.days, 0);
  const short = (c: string) => c.split(",")[0].trim();
  return (
    <div className={cn("rounded-[26px] bg-paper/70 p-3 ring-1 sm:p-4", errors.legs ? "ring-destructive/60" : "ring-line-strong")}>
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-stone">
          <Route className="size-3.5 text-brand" /> {stops.length ? `Your route · ${stops.length + 1} cities` : "Your route"}
        </p>
        <button type="button" onClick={onReverse} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink/70 transition-colors hover:bg-white hover:text-ink" aria-label="Reverse the route">
          <ArrowDownUp className="size-3.5" /> Reverse
        </button>
      </div>

      <div className="relative">
        {/* The rail joining start, stops and destination. */}
        <span aria-hidden className="pointer-events-none absolute bottom-[2.25rem] left-[1.125rem] top-[2.25rem] w-0 -translate-x-1/2 border-l-2 border-dashed border-ink/20" />

        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-2 sm:gap-x-3">
          <span className="pt-[1.125rem]">
            <Marker kind="start" />
          </span>
          <PlaceField id="trip-source" kind="from" label="Starting from" icon={Navigation} value={source} onChange={onSource} placeholder="e.g. Mumbai, India" error={errors.source} />
        </div>

        <Reorder.Group axis="y" values={stops} onReorder={onStops} className="mt-2 space-y-2">
          <AnimatePresence initial={false}>
            {stops.map((stop, i) => (
              <StopRow
                key={stop.id}
                stop={stop}
                index={i}
                count={stops.length}
                onChange={(next) => onStops(stops.map((s) => (s.id === stop.id ? next : s)))}
                onRemove={() => onStops(stops.filter((s) => s.id !== stop.id))}
                onMove={(to) => {
                  const next = stops.filter((s) => s.id !== stop.id);
                  next.splice(to, 0, stop);
                  onStops(next);
                }}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {stops.length < 4 && (
          <div className="mt-1 grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-2 sm:gap-x-3">
            <Marker kind="add" />
            <button
              type="button"
              onClick={() => onStops([...stops, newStop("", 2)])}
              className="group inline-flex min-h-11 items-center gap-2 justify-self-start rounded-full py-2 pl-1 pr-3 text-left text-sm text-brand transition-colors hover:text-ink"
            >
              <span className="font-medium">Add a stop</span>
              <span className="text-stone group-hover:text-ink/70">{destination.trim() ? `on the way to ${short(destination)}` : "on the way"}</span>
            </button>
          </div>
        )}

        <div className="mt-1 grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-2 sm:gap-x-3">
          <span className="pt-[1.125rem]">
            <Marker kind="end" />
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="min-w-0 flex-1 basis-full sm:basis-auto">
              <PlaceField id="trip-destination" kind="to" label={stops.length ? "Final destination" : "Destination"} icon={Plane} value={destination} onChange={onDestination} placeholder="e.g. Kyoto, Japan" error={errors.destination} />
            </div>
            {stops.length > 0 && <DaysStepper value={destDays} onChange={onDestDays} label={short(destination) || "your destination"} />}
          </div>
        </div>
      </div>

      {stops.length > 0 && (
        <p className="mt-3 px-1 text-xs leading-relaxed text-stone">
          <span className="text-ink">
            {[short(source) || "Start", ...stops.map((s) => `${short(s.city) || "Stop"} ${s.days}d`), `${short(destination) || "Destination"} ${destDays}d`].join(" → ")}
          </span>
          {" · "}
          {total} days. The first day in each new city is a travel day, with the train, flight or road option locals use.
        </p>
      )}
      <FieldError message={errors.legs} />
    </div>
  );
}

/** An older route (the destination first, then `legs` after it) as stops before a new final destination. */
function fromLegsAfter(destination: string, legs: TripLeg[], numberOfDays: number): { destination: string; stops: Stop[] } {
  const first = Math.max(1, numberOfDays - legs.reduce((n, l) => n + l.days, 0));
  const all = [{ city: destination, days: first }, ...legs];
  return { destination: all[all.length - 1].city, stops: all.slice(0, -1).map((l) => newStop(l.city, l.days)) };
}

/** Currencies offered for the budget, besides the traveller's own. */
const BUDGET_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD", "AED", "CHF"];

/** "₹", "€", "$" — the symbol a currency is written with. */
const symbolOf = (c: string) => {
  try {
    return new Intl.NumberFormat(c === "INR" ? "en-IN" : "en-US", { style: "currency", currency: c, currencyDisplay: "narrowSymbol" }).formatToParts(0).find((p) => p.type === "currency")?.value ?? c;
  } catch {
    return c;
  }
};

export function TripForm({ onSubmit, isLoading: externalLoading = false }: TripFormProps) {
  const router = useRouter();
  const { credits, creditsLoaded, refreshCredits } = useCredits();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [formData, setFormData] = useState<TripFormData>({
    source: "",
    destination: "",
    startDate: "",
    numberOfDays: 4,
    budget: 1500,
    budgetCurrency: "USD",
    interests: [],
  });
  const money = useMoney();
  // Once the traveller has set a budget (or one came with them), leave it alone.
  const budgetSet = useRef(false);
  const [prefs, setPrefs] = useState<TripPreferences>(DEFAULT_PREFERENCES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paywall, setPaywall] = useState(false);
  // "Inspire me where to go" on the home page lands here with ?inspire=1.
  const [inspireNow, setInspireNow] = useState(false);
  const outOfCredits = creditsLoaded && credits < 1;
  const today = new Date().toISOString().split("T")[0];

  // Pre-fill from the landing page or "Plan a similar trip", or pick up a plan
  // saved when the traveller went to top up their credits.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("inspire")) setInspireNow(true);
    try {
      const raw = window.sessionStorage.getItem(PLANNER_DRAFT_KEY);
      const prefilled = ["destination", "days", "budget", "start", "with", "vibes", "diet", "notes"].some((k) => q.get(k));
      if (raw && !prefilled) {
        const draft = JSON.parse(raw);
        if (draft?.formData) {
          if (draft.formData.budget) budgetSet.current = true;
          const { legs: oldLegs, ...saved } = draft.formData as TripFormData & { legs?: TripLeg[] };
          // Drafts from before stops: `legs` were the cities after the destination.
          const moved = oldLegs?.length && !saved.stops?.length ? fromLegsAfter(saved.destination, oldLegs, saved.numberOfDays) : {};
          setFormData((prev) => ({ ...prev, ...saved, ...moved }));
        }
        if (draft?.prefs) setPrefs((prev) => ({ ...prev, ...draft.prefs }));
        if (typeof draft?.step === "number") setStep(Math.max(0, Math.min(STEPS.length - 1, draft.step)));
        return;
      }
    } catch {
      /* storage unavailable or corrupt draft: start fresh */
    }
    const d = q.get("destination");
    const days = Number(q.get("days"));
    const budget = Number(q.get("budget"));
    const cur = /^[A-Z]{3}$/.test(q.get("cur") ?? "") ? q.get("cur")! : "USD";
    // "Delhi:2,Jaipur:2": the stops before the destination, from the landing prompt.
    // Older links sent `legs`, the cities after the destination; they're turned around here.
    const cities = (param: string | null) =>
      (param ?? "")
        .split(",")
        .map((p) => {
          const [city, n] = p.split(":");
          return { city: (city ?? "").trim().slice(0, 80), days: Math.max(1, Math.min(30, Math.round(Number(n)) || 2)) };
        })
        .filter((l) => l.city.length >= 2)
        .slice(0, 4);
    const urlStops = cities(q.get("stops"));
    const oldLegs = cities(q.get("legs"));
    const route = urlStops.length
      ? { stops: urlStops.map((l) => newStop(l.city, l.days)) }
      : d && oldLegs.length
        ? fromLegsAfter(d.slice(0, 120), oldLegs, days >= 1 && days <= 30 ? Math.round(days) : oldLegs.reduce((n, l) => n + l.days, 1))
        : {};
    if (budget > 0) budgetSet.current = true;
    const start = q.get("start") ?? "";
    const vibes = (q.get("vibes") ?? "").split(",").filter((v) => VIBES.some((o) => o.id === v)).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      ...(d ? { destination: d.slice(0, 120) } : {}),
      ...(days >= 1 && days <= 30 ? { numberOfDays: Math.round(days) } : {}),
      ...(budget > 0 ? { budget: Math.round(budget), budgetCurrency: cur } : {}),
      ...(/^\d{4}-\d{2}-\d{2}$/.test(start) && start >= today ? { startDate: start } : {}),
      ...(vibes.length ? { interests: vibes } : {}),
      ...route,
    }));

    // From the landing page's free-form trip description.
    const who = COMPANIONS.find((c) => c.id === q.get("with"))?.id;
    const diet = (q.get("diet") ?? "").split(",").filter((v) => DIETS.some((o) => o.id === v));
    const notes = q.get("notes")?.trim().slice(0, 400);
    if (who || diet.length || notes) {
      setPrefs((prev) => ({
        ...prev,
        ...(who
          ? {
              companions: who,
              adults: who === "solo" ? 1 : who === "couple" ? 2 : Math.max(prev.adults, 2),
              children: who === "family" ? Math.max(prev.children, 1) : 0,
            }
          : {}),
        ...(diet.length ? { diet } : {}),
        ...(notes ? { notes } : {}),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read the URL once, on arrival
  }, []);

  // Start the budget in the traveller's own money once we know what that is.
  useEffect(() => {
    if (budgetSet.current || !money.live || money.region === "USD" || !money.rates?.[money.region]) return;
    budgetSet.current = true;
    setFormData((prev) => ({ ...prev, budgetCurrency: money.region, budget: budgetPicks(money.region, money.rates![money.region])[1] }));
  }, [money.live, money.region, money.rates]);

  const people = prefs.adults + prefs.children;
  const stops = formData.stops ?? [];
  const stopDays = stops.reduce((n, l) => n + l.days, 0);
  const destDays = Math.max(1, formData.numberOfDays - stopDays);
  const setStops = (next: Stop[], dest = destDays) => {
    setFormData((prev) => ({ ...prev, stops: next, numberOfDays: Math.min(30, dest + next.reduce((n, l) => n + l.days, 0)) }));
    if (errors.legs) setErrors((prev) => ({ ...prev, legs: "" }));
  };
  /** The whole route for the planner: the stops, then the destination with the days left. */
  const route = useMemo<TripLeg[] | undefined>(
    () => (formData.stops?.length ? [...formData.stops.map(({ city, days }) => ({ city, days })), { city: formData.destination, days: destDays }] : undefined),
    [formData.stops, formData.destination, destDays]
  );
  // If the trip gets shorter elsewhere (the date picker), take days from the last stops first.
  useEffect(() => {
    if (!formData.stops?.length || formData.numberOfDays - formData.stops.reduce((n, l) => n + l.days, 0) >= 1) return;
    let over = 1 - (formData.numberOfDays - formData.stops.reduce((n, l) => n + l.days, 0));
    const next = formData.stops.map((l) => ({ ...l }));
    for (let i = next.length - 1; over > 0 && i >= 0; i--) {
      const cut = Math.min(next[i].days - 1, over);
      next[i].days -= cut;
      over -= cut;
    }
    setFormData((prev) => ({ ...prev, stops: over > 0 ? next.slice(0, Math.max(0, prev.numberOfDays - 1)) : next }));
  }, [formData.numberOfDays, formData.stops]);
  const cur = formData.budgetCurrency;
  /** The budget in USD, which is what the planner and the AI work in; null until rates arrive for a non-USD budget. */
  const budgetUsd = cur === "USD" ? formData.budget : money.toUsd(formData.budget, cur);
  const curRate = cur === "USD" ? 1 : (money.rates?.[cur] ?? null);
  const picks = budgetPicks(cur, curRate);
  const minLocal = curRate ? roundBudget(100 * curRate) : 100;
  const nf = (n: number) => formatMoney(tidy(n), cur, 0);
  const perPersonDay = formData.budget / Math.max(people, 1) / Math.max(formData.numberOfDays, 1);
  const budgetOptions = [...new Set([money.region, cur, ...BUDGET_CURRENCIES])].filter((c) => c === "USD" || money.rates?.[c]);

  const switchCurrency = (next: string) => {
    budgetSet.current = true;
    const usd = budgetUsd ?? 1500;
    const rate = next === "USD" ? 1 : (money.rates?.[next] ?? null);
    if (!rate) return;
    setFormData((prev) => ({ ...prev, budgetCurrency: next, budget: roundBudget(usd * rate) }));
  };

  const set = <K extends keyof TripFormData>(field: K, value: TripFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };
  const setPref = <K extends keyof TripPreferences>(field: K, value: TripPreferences[K]) => setPrefs((prev) => ({ ...prev, [field]: value }));

  const pickCompanions = (id: TripPreferences["companions"]) =>
    setPrefs((prev) => ({
      ...prev,
      companions: id,
      adults: id === "solo" ? 1 : id === "couple" ? 2 : Math.max(prev.adults, 2),
      children: id === "family" ? Math.max(prev.children, 1) : id === "friends" ? prev.children : 0,
    }));

  const toggleVibe = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id) ? prev.interests.filter((i) => i !== id) : prev.interests.length >= MAX_VIBES ? prev.interests : [...prev.interests, id],
    }));
    if (errors.interests) setErrors((prev) => ({ ...prev, interests: "" }));
  };

  const validate = (upTo: number) => {
    const e: Record<string, string> = {};
    if (upTo >= 0) {
      if (!formData.source || formData.source.trim().length < 2) e.source = "Where are you starting from?";
      if (!formData.destination || formData.destination.trim().length < 2) e.destination = "Where would you like to go?";
      if (!formData.startDate) e.startDate = "Pick a start date.";
      else if (formData.startDate < today) e.startDate = "Pick a date from today onwards.";
      if (formData.numberOfDays < 1 || formData.numberOfDays > 30) e.numberOfDays = "Trips can be 1 to 30 days.";
      if (stops.length && stops.some((l) => l.city.trim().length < 2)) e.legs = "Name every stop on your route, or remove the empty one.";
    }
    if (upTo >= 1) {
      if (budgetUsd === null) e.budget = "We couldn't load exchange rates. Switch the budget to USD and try again.";
      else if (!formData.budget || budgetUsd < 99.5) e.budget = `Budget must be at least ${formatMoney(minLocal, cur, 0)}.`;
    }
    if (upTo >= 2) {
      if (formData.interests.length === 0) e.interests = "Pick at least one thing you're into.";
    }
    setErrors(e);
    const bad = Object.keys(e);
    if (bad.length) {
      const first = STEPS.findIndex((_, i) => (i === 0 ? ["source", "destination", "startDate", "numberOfDays", "legs"] : i === 1 ? ["budget"] : i === 2 ? ["interests"] : []).some((k) => bad.includes(k)));
      if (first >= 0 && first !== step) {
        setDir(first > step ? 1 : -1);
        setStep(first);
      }
    }
    return bad.length === 0;
  };

  const go = (to: number) => {
    if (to > step && !validate(to - 1)) return;
    setErrors({});
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showPaywall = () => {
    try {
      window.sessionStorage.setItem(PLANNER_DRAFT_KEY, JSON.stringify({ formData, prefs, step }));
    } catch {
      /* ignore */
    }
    setPaywall(true);
  };

  const generate = async () => {
    if (!validate(3)) return;
    if (outOfCredits) return showPaywall();
    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stops: undefined,
          budget: Math.round(budgetUsd ?? formData.budget),
          legs: route,
          numberOfPeople: people,
          tripType: prefs.companions,
          preferences: cur === "USD" ? prefs : { ...prefs, budgetCurrency: cur, budgetLocal: formData.budget },
        }),
      });
      const result = await response.json();
      if (response.status === 402) {
        setIsSubmitting(false);
        await refreshCredits();
        return showPaywall();
      }
      if (result.success) {
        try {
          window.sessionStorage.removeItem(PLANNER_DRAFT_KEY);
        } catch {
          /* ignore */
        }
        await refreshCredits();
        // The trips list now has a new card; fetch it fresh next time it's shown.
        invalidate("/api/itineraries");
        track("trip_generated", { destination: formData.destination, days: formData.numberOfDays });
        router.push(`/dashboard/itinerary/${result.data.itineraryId}`);
        onSubmit?.(result.data);
      } else {
        setErrors({ submit: result.error || "Something went wrong. Please try again." });
        setIsSubmitting(false);
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) go(step + 1);
    else generate();
  };

  const busy = isSubmitting || externalLoading;
  const current = STEPS[step];

  const pass = useMemo(
    () => ({
      ...formData,
      // The pass flies to the final destination; the stops show underneath.
      ...(route ? { via: legsLabel(route) } : {}),
      numberOfPeople: people,
      tripType: labelFor(COMPANIONS, prefs.companions),
      note: `${labelFor(PACES, prefs.pace)} pace · ${labelFor(STAYS, prefs.stay)} · ${labelFor(SPEND, prefs.spend)}`,
    }),
    [formData, people, prefs, route]
  );
  const vibeLabels = useMemo(() => Object.fromEntries(VIBES.map((v) => [v.id, v.label])), []);

  return (
    <>
      <AnimatePresence>{busy && <GeneratingOverlay destination={formData.destination} days={formData.numberOfDays} />}</AnimatePresence>
      <AnimatePresence>
        {paywall && <OutOfCredits destination={formData.destination} days={formData.numberOfDays} onClose={() => setPaywall(false)} />}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
        <div className="min-w-0 space-y-4">
          {/* Phones: a slim, read-only ticket strip that fills in as you type, so the pass stays in
              view without looking like a form. The full pass sits below the form. */}
          <a
            href="#boarding-pass"
            className="flex items-center gap-3 rounded-[18px] bg-ink px-4 py-3 text-paper shadow-[0_14px_30px_-20px_rgba(14,31,59,0.8)] xl:hidden"
            aria-label="Your boarding pass so far. Tap to see it in full."
          >
            <Plane className="size-4 shrink-0 text-brand-2" />
            <span className="min-w-0 flex-1 truncate text-sm">
              <span className={formData.source ? "text-paper" : "text-paper/50"}>{formData.source.split(",")[0] || "Your city"}</span>
              <ArrowRight className="mx-1.5 inline size-3.5 -translate-y-px text-paper/40" />
              <span className={formData.destination ? "font-medium text-brand-2" : "text-paper/50"}>{formData.destination.split(",")[0] || "Anywhere"}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-paper/60">
              {formData.numberOfDays}d · {people}p · {compactMoney(formData.budget, cur)}
            </span>
          </a>

          {/* Progress */}
          <nav aria-label="Planner steps" className="rounded-[22px] bg-white/80 p-1.5 ring-1 ring-line-strong">
            <ol className="grid grid-cols-4 gap-1">
              {STEPS.map((s, i) => {
                const on = i === step;
                const done = i < step;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={on ? "step" : undefined}
                      className={cn("relative flex w-full items-center justify-center gap-2 rounded-2xl px-2 py-2.5 text-sm transition-colors", on ? "text-paper" : "text-ink/60 hover:text-ink")}
                    >
                      {on && <motion.span layoutId="step-pill" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                      <span className={cn("relative grid size-5 place-items-center rounded-full font-mono text-[10px]", on ? "bg-brand text-white" : done ? "bg-brand-soft text-brand" : "bg-paper-2")}>
                        {done ? <Check className="size-3.5" /> : i + 1}
                      </span>
                      <span className="relative hidden sm:inline">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <section className="relative overflow-hidden rounded-[28px] bg-white/80 p-5 ring-1 ring-line-strong sm:p-8">
            <div className="flex items-start gap-4">
              <span className="font-mono text-xs text-brand">0{step + 1}</span>
              <div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2 key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="display text-[2.04rem] leading-none text-ink">
                    {current.title}
                  </motion.h2>
                </AnimatePresence>
                <p className="mt-2 text-sm text-stone">{current.subtitle}</p>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                initial={{ opacity: 0, x: dir * 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -36 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 space-y-8"
              >
                {step === 0 && (
                  <>
                    <RouteBuilder
                      source={formData.source}
                      destination={formData.destination}
                      stops={stops}
                      destDays={destDays}
                      onSource={(v) => set("source", v)}
                      onDestination={(v) => set("destination", v)}
                      onStops={(next) => {
                        // A new stop takes its days from the destination while it can spare them.
                        const added = next.length > stops.length ? next[next.length - 1] : null;
                        if (!added) return setStops(next);
                        const d = Math.min(added.days, Math.max(1, destDays - 1));
                        setStops(next.map((x) => (x === added ? { ...x, days: d } : x)), destDays - d >= 1 ? destDays - d : destDays);
                      }}
                      onDestDays={(d) => setStops(stops, d)}
                      onReverse={() => setFormData((prev) => ({ ...prev, source: prev.destination, destination: prev.source, stops: prev.stops?.slice().reverse() }))}
                      errors={errors}
                    />
                    <Inspire
                      autoOpen={inspireNow}
                      from={formData.source}
                      companions={prefs.companions}
                      budget={Math.round(budgetUsd ?? 0) || 2000}
                      days={formData.numberOfDays}
                      interests={formData.interests}
                      onPick={(destination, month) => {
                        set("destination", destination);
                        // The 1st of that month (or a week from now, if it's this month).
                        const now = new Date();
                        const year = month - 1 < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
                        const first = new Date(year, month - 1, 1);
                        const start = first <= now ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7) : first;
                        set("startDate", `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`);
                      }}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <DateRangePicker
                        start={formData.startDate}
                        days={formData.numberOfDays}
                        min={today}
                        error={errors.startDate}
                        onChange={(startDate, numberOfDays) => {
                          set("startDate", startDate);
                          set("numberOfDays", numberOfDays);
                        }}
                      />
                      <div>
                        <Stepper label="Duration" icon={Clock3} value={formData.numberOfDays} onChange={(v) => set("numberOfDays", v)} min={1} max={30} suffix={(v) => (v === 1 ? "day" : "days")} error={errors.numberOfDays} />
                        <QuickPicks values={[2, 4, 7, 10, 14]} current={formData.numberOfDays} onPick={(v) => set("numberOfDays", v)} format={(v) => (v === 2 ? "Weekend" : v === 7 ? "A week" : v === 14 ? "Two weeks" : `${v} days`)} />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div>
                      <Label>Travelling as</Label>
                      <div role="radiogroup" aria-label="Travelling as" className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {COMPANIONS.map((c) => (
                          <ChoiceCard key={c.id} icon={ICONS[c.id]} label={c.label} hint={c.hint} active={prefs.companions === c.id} onClick={() => pickCompanions(c.id)} layoutGroup="companions" />
                        ))}
                      </div>
                      <AnimatePresence initial={false}>
                        {(prefs.companions === "family" || prefs.companions === "friends") && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="grid gap-3 pt-3 md:grid-cols-2">
                              <Stepper label="Adults" icon={User} value={prefs.adults} onChange={(v) => setPref("adults", v)} min={1} max={16} suffix={(v) => (v === 1 ? "adult" : "adults")} />
                              <Stepper label="Children" icon={Baby} value={prefs.children} onChange={(v) => setPref("children", v)} min={0} max={10} suffix={(v) => (v === 1 ? "child" : "children")} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <Label aside={perPersonDay > 0 ? `≈ ${nf(perPersonDay)} per person per day` : undefined}>Total budget</Label>
                      <label
                        htmlFor="trip-budget"
                        className={cn(
                          "flex h-[4.5rem] cursor-text items-center gap-3 rounded-2xl bg-paper/60 px-4 ring-1 transition-shadow focus-within:bg-white focus-within:ring-2",
                          errors.budget ? "ring-destructive/60" : "ring-line-strong focus-within:ring-brand/50"
                        )}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand ring-1 ring-line-strong">
                          <Wallet className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="eyebrow text-[0.6rem] text-stone">Budget ({cur})<span className="hidden sm:inline"> · everything included</span></span>
                          <span className="mt-1 flex items-center text-[1.05rem] text-ink">
                            <span className="text-stone">{symbolOf(cur)}</span>
                            <input
                              id="trip-budget"
                              type="number"
                              inputMode="numeric"
                              min={minLocal}
                              step={picks[0] >= 10000 ? 1000 : 50}
                              value={formData.budget || ""}
                              onChange={(e) => {
                                budgetSet.current = true;
                                set("budget", Number(e.target.value));
                              }}
                              aria-invalid={!!errors.budget}
                              className="w-full bg-transparent pl-0.5 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </span>
                        </span>
                        <select
                          value={cur}
                          onChange={(e) => switchCurrency(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Budget currency"
                          className="shrink-0 cursor-pointer rounded-full bg-white py-1.5 pl-3 pr-2 font-mono text-xs text-ink ring-1 ring-line-strong outline-none hover:ring-brand/40 focus-visible:ring-2 focus-visible:ring-brand/50"
                        >
                          {budgetOptions.map((c) => (
                            <option key={c} value={c}>
                              {symbolOf(c)} {c}
                            </option>
                          ))}
                        </select>
                      </label>
                      <FieldError message={errors.budget} />
                      <QuickPicks
                        values={picks}
                        current={formData.budget}
                        onPick={(v) => {
                          budgetSet.current = true;
                          set("budget", v);
                        }}
                        format={(v) => compactMoney(v, cur)}
                      />
                      {cur !== "USD" && budgetUsd !== null && budgetUsd > 0 && <p className="mt-2 px-1 text-xs text-stone">≈ ${Math.round(budgetUsd).toLocaleString("en-US")} at today&apos;s rate</p>}
                    </div>

                    <div>
                      <Label>Spending style</Label>
                      <div role="radiogroup" aria-label="Spending style" className="grid gap-3 md:grid-cols-3">
                        {SPEND.map((o) => (
                          <ChoiceCard key={o.id} icon={ICONS[o.id]} label={o.label} hint={o.hint} active={prefs.spend === o.id} onClick={() => setPref("spend", o.id)} layoutGroup="spend" compact />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <Label>Pace</Label>
                      <div role="radiogroup" aria-label="Pace" className="grid gap-3 md:grid-cols-3">
                        {PACES.map((o, i) => (
                          <button
                            key={o.id}
                            type="button"
                            role="radio"
                            aria-checked={prefs.pace === o.id}
                            onClick={() => setPref("pace", o.id)}
                            className={cn(
                              "relative rounded-2xl p-4 text-left ring-1 transition-colors duration-300",
                              prefs.pace === o.id ? "text-paper ring-ink" : "bg-paper/60 text-ink ring-line-strong hover:bg-white hover:ring-ink/35"
                            )}
                          >
                            {prefs.pace === o.id && <motion.span layoutId="pace" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                            <span className="relative flex gap-1" aria-hidden>
                              {Array.from({ length: 5 }, (_, k) => (
                                <span key={k} className={cn("h-1.5 w-5 rounded-full", k < 2 + i * 1.5 ? "bg-brand" : prefs.pace === o.id ? "bg-paper/20" : "bg-ink/10")} />
                              ))}
                            </span>
                            <span className="relative mt-4 block font-medium">{o.label}</span>
                            <span className={cn("relative block text-xs", prefs.pace === o.id ? "text-paper/60" : "text-stone")}>{o.hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div data-invalid={!!errors.interests}>
                      <Label aside={`${formData.interests.length}/${MAX_VIBES} picked`}>You&apos;re into</Label>
                      <div role="group" aria-label="Interests" className="flex flex-wrap gap-2">
                        {VIBES.map((v) => (
                          <Chip key={v.id} label={v.label} icon={ICONS[v.id]} active={formData.interests.includes(v.id)} onClick={() => toggleVibe(v.id)} disabled={formData.interests.length >= MAX_VIBES} />
                        ))}
                      </div>
                      <FieldError message={errors.interests} />
                    </div>

                    <div>
                      <Label>Where you&apos;ll stay</Label>
                      <div role="radiogroup" aria-label="Where you'll stay" className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {STAYS.map((o) => (
                          <ChoiceCard key={o.id} icon={ICONS[o.id]} label={o.label} hint={o.hint} active={prefs.stay === o.id} onClick={() => setPref("stay", o.id)} layoutGroup="stay" />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div>
                      <Label>Getting around</Label>
                      <div role="radiogroup" aria-label="Getting around" className="grid gap-3 md:grid-cols-3">
                        {TRANSPORT.map((o) => (
                          <ChoiceCard key={o.id} icon={o.id === "car" ? Car : o.id === "rides" ? Bike : ICONS[o.id]} label={o.label} hint={o.hint} active={prefs.transport === o.id} onClick={() => setPref("transport", o.id)} layoutGroup="transport" compact />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label aside="Every food stop will respect these">Food preferences</Label>
                      <div className="flex flex-wrap gap-2">
                        {DIETS.map((o) => (
                          <Chip
                            key={o.id}
                            label={o.label}
                            active={prefs.diet.includes(o.id)}
                            onClick={() => setPref("diet", prefs.diet.includes(o.id) ? prefs.diet.filter((d) => d !== o.id) : [...prefs.diet, o.id])}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Occasion</Label>
                      <div role="radiogroup" aria-label="Occasion" className="flex flex-wrap gap-2">
                        {OCCASIONS.map((o) => (
                          <Chip key={o.id} label={o.label} active={prefs.occasion === o.id} onClick={() => setPref("occasion", o.id)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label aside={`${prefs.notes.length}/400`}>Anything else?</Label>
                      <textarea
                        value={prefs.notes}
                        onChange={(e) => setPref("notes", e.target.value.slice(0, 400))}
                        rows={3}
                        placeholder="Must-sees, things to skip, mobility needs, a restaurant you've always wanted to try…"
                        aria-label="Anything else"
                        className="w-full resize-none rounded-2xl bg-paper/60 p-4 text-[1.02rem] text-ink outline-none ring-1 ring-line-strong transition-shadow placeholder:text-stone-2 focus:bg-white focus:ring-2 focus:ring-brand/50"
                      />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          <div className="flex flex-col gap-4 rounded-[28px] bg-ocean p-4 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pl-6">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button type="button" onClick={() => go(step - 1)} aria-label="Previous step" className="grid size-11 shrink-0 place-items-center rounded-full bg-paper/10 transition-colors hover:bg-paper hover:text-ink">
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <p className="text-sm text-paper/60">
                {step < STEPS.length - 1 ? (
                  <>
                    Step {step + 1} of {STEPS.length} · next: <span className="text-paper">{STEPS[step + 1].label}</span>
                  </>
                ) : outOfCredits ? (
                  <>
                    You&apos;ve used your free trip · more from <span className="text-paper">{perTrip(PLANS[PLANS.length - 1])}</span> a trip.{" "}
                    <Link href="/dashboard/credits" className="text-brand-2 underline underline-offset-4">
                      See packs
                    </Link>
                  </>
                ) : (
                  <>
                    Uses 1 credit · you have <span className="text-paper">{credits}</span> left
                  </>
                )}
              </p>
            </div>
            {step < STEPS.length - 1 ? (
              <PillButton type="submit" variant="paper" size="lg" icon={<ArrowRight className="size-4" />}>
                Continue
              </PillButton>
            ) : (
              <PillButton type="submit" variant="brand" size="lg" disabled={busy} icon={<Sparkles className="size-4" />}>
                {busy ? "Generating…" : outOfCredits ? "Unlock this trip" : "Generate itinerary"}
              </PillButton>
            )}
          </div>
          <FieldError message={errors.submit} />
        </div>

        <aside id="boarding-pass" className="scroll-mt-20">
          <div className="xl:sticky xl:top-10">
            <p className="eyebrow mb-3 px-2 text-stone xl:hidden">Your boarding pass · preview</p>
            <BoardingPass data={pass} interestLabels={vibeLabels} />
            <p className="mt-4 px-2 text-sm leading-relaxed text-stone">
              Your boarding pass updates as you go. Try a destination like <em>Kyoto</em>, <em>Berlin</em> or <em>Rio</em>.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
