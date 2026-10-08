"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
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
} from "@/components/site/icons";

import { useCredits } from "@/components/dashboard/dashboard-layout";
import { invalidate } from "@/lib/cached-json";
import { DateRangePicker } from "./date-range-picker";
import { Inspire } from "./inspire";
import { track } from "@/lib/analytics";
import { BoardingPass } from "@/components/dashboard/boarding-pass";
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
  type TripPreferences,
} from "@/lib/trip";
import { PLANS, perTrip } from "@/lib/plans";
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
  { id: "people", label: "Who & budget", title: "Who's coming?", subtitle: "Who's on the trip and the total budget for everyone, in US dollars." },
  { id: "style", label: "Style", title: "How do you travel?", subtitle: "Your pace, what you're into and where you like to wake up." },
  { id: "details", label: "Details", title: "The fine print.", subtitle: "Optional, but it's what makes the plan feel like yours." },
] as const;

export interface TripFormData {
  source: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  budget: number;
  interests: string[];
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

function TextField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  min,
}: {
  id: string;
  label: string;
  icon: typeof MapPin;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  min?: string;
}) {
  return (
    <div>
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
          <span className="eyebrow text-[0.6rem] text-stone">{label}</span>
          <input
            id={id}
            type={type}
            min={min}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className="mt-1 w-full bg-transparent text-[1.05rem] text-ink outline-none placeholder:text-stone-2"
          />
        </span>
      </label>
      <FieldError message={error} />
    </div>
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
          error ? "ring-destructive/60" : "ring-line"
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand ring-1 ring-line">
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
            className="grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            aria-label={`Increase ${label.toLowerCase()}`}
            className="grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink"
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
        active ? "text-paper ring-ink" : "bg-paper/60 text-ink ring-line hover:bg-white hover:ring-ink/20"
      )}
    >
      {active && <motion.span layoutId={layoutGroup} className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
      {Icon && (
        <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-brand text-white" : "bg-white text-brand ring-1 ring-line")}>
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
        active ? "bg-ink text-paper ring-ink" : "bg-paper/60 text-ink ring-line hover:bg-white hover:ring-ink/20"
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

const nf = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

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
    interests: [],
  });
  const [prefs, setPrefs] = useState<TripPreferences>(DEFAULT_PREFERENCES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const outOfCredits = creditsLoaded && credits < 1;
  const today = new Date().toISOString().split("T")[0];

  // Pre-fill from the landing page or "Plan a similar trip", or pick up a plan
  // saved when the traveller went to top up their credits.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    try {
      const raw = window.sessionStorage.getItem(PLANNER_DRAFT_KEY);
      const prefilled = ["destination", "days", "budget", "start", "with", "vibes", "diet", "notes"].some((k) => q.get(k));
      if (raw && !prefilled) {
        const draft = JSON.parse(raw);
        if (draft?.formData) setFormData((prev) => ({ ...prev, ...draft.formData }));
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
    const start = q.get("start") ?? "";
    const vibes = (q.get("vibes") ?? "").split(",").filter((v) => VIBES.some((o) => o.id === v)).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      ...(d ? { destination: d.slice(0, 120) } : {}),
      ...(days >= 1 && days <= 30 ? { numberOfDays: Math.round(days) } : {}),
      ...(budget >= 100 ? { budget: Math.round(budget) } : {}),
      ...(/^\d{4}-\d{2}-\d{2}$/.test(start) && start >= today ? { startDate: start } : {}),
      ...(vibes.length ? { interests: vibes } : {}),
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

  const people = prefs.adults + prefs.children;
  const perPersonDay = formData.budget / Math.max(people, 1) / Math.max(formData.numberOfDays, 1);

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
    }
    if (upTo >= 1) {
      if (!formData.budget || formData.budget < 100) e.budget = "Budget must be at least $100.";
    }
    if (upTo >= 2) {
      if (formData.interests.length === 0) e.interests = "Pick at least one thing you're into.";
    }
    setErrors(e);
    const bad = Object.keys(e);
    if (bad.length) {
      const first = STEPS.findIndex((_, i) => (i === 0 ? ["source", "destination", "startDate", "numberOfDays"] : i === 1 ? ["budget"] : i === 2 ? ["interests"] : []).some((k) => bad.includes(k)));
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
          numberOfPeople: people,
          tripType: prefs.companions,
          preferences: prefs,
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
      numberOfPeople: people,
      tripType: labelFor(COMPANIONS, prefs.companions),
      note: `${labelFor(PACES, prefs.pace)} pace · ${labelFor(STAYS, prefs.stay)} · ${labelFor(SPEND, prefs.spend)}`,
    }),
    [formData, people, prefs]
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
          {/* Progress */}
          <nav aria-label="Planner steps" className="rounded-[22px] bg-white/80 p-1.5 ring-1 ring-line">
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
                        {done ? <Check className="size-3" /> : i + 1}
                      </span>
                      <span className="relative hidden sm:inline">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <section className="relative overflow-hidden rounded-[28px] bg-white/80 p-5 ring-1 ring-line sm:p-8">
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
                    <div className="relative grid gap-3 md:grid-cols-2">
                      <TextField id="trip-source" label="Starting from" icon={Navigation} value={formData.source} onChange={(v) => set("source", v)} placeholder="e.g. Mumbai, India" error={errors.source} />
                      <TextField id="trip-destination" label="Destination" icon={Plane} value={formData.destination} onChange={(v) => set("destination", v)} placeholder="e.g. Kyoto, Japan" error={errors.destination} />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, source: prev.destination, destination: prev.source }))}
                        aria-label="Swap origin and destination"
                        className="absolute left-1/2 top-[2.25rem] hidden size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper shadow-lg transition-transform duration-500 ease-out-expo hover:rotate-180 md:grid"
                      >
                        <ArrowLeftRight className="size-4" />
                      </button>
                    </div>
                    <Inspire
                      className="-mt-4"
                      from={formData.source}
                      companions={prefs.companions}
                      budget={Number(formData.budget) || 2000}
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
                          errors.budget ? "ring-destructive/60" : "ring-line focus-within:ring-brand/50"
                        )}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand ring-1 ring-line">
                          <Wallet className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="eyebrow text-[0.6rem] text-stone">Budget (USD) · everything included</span>
                          <span className="mt-1 flex items-center text-[1.05rem] text-ink">
                            <span className="text-stone">$</span>
                            <input
                              id="trip-budget"
                              type="number"
                              inputMode="numeric"
                              min={100}
                              step={50}
                              value={formData.budget || ""}
                              onChange={(e) => set("budget", Number(e.target.value))}
                              aria-invalid={!!errors.budget}
                              className="w-full bg-transparent pl-0.5 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </span>
                        </span>
                      </label>
                      <FieldError message={errors.budget} />
                      <QuickPicks values={[750, 1500, 3000, 6000]} current={formData.budget} onPick={(v) => set("budget", v)} format={(v) => nf(v)} />
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
                              prefs.pace === o.id ? "text-paper ring-ink" : "bg-paper/60 text-ink ring-line hover:bg-white hover:ring-ink/20"
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
                        className="w-full resize-none rounded-2xl bg-paper/60 p-4 text-[1.02rem] text-ink outline-none ring-1 ring-line transition-shadow placeholder:text-stone-2 focus:bg-white focus:ring-2 focus:ring-brand/50"
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

        <aside className="order-first xl:order-none">
          <div className="xl:sticky xl:top-10">
            <BoardingPass data={pass} interestLabels={vibeLabels} />
            <p className="mt-4 hidden px-2 text-sm leading-relaxed text-stone xl:block">
              Your boarding pass updates as you go. Try a destination like <em>Kyoto</em>, <em>Berlin</em> or <em>Rio</em>.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
