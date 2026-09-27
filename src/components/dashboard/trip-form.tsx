"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeftRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  MapPin,
  Minus,
  Moon,
  Mountain,
  Navigation,
  Plane,
  Plus,
  ShoppingBag,
  Sparkles,
  TreePine,
  Users,
  UtensilsCrossed,
  Wallet,
  Waves,
} from "lucide-react";

import { useCredits } from "@/components/dashboard/dashboard-layout";
import { BoardingPass } from "@/components/dashboard/boarding-pass";
import { GeneratingOverlay } from "@/components/dashboard/generating-overlay";
import { PillButton } from "@/components/site/pill";
import { cn } from "@/lib/utils";

const interestOptions = [
  { id: "nature", label: "Nature", icon: TreePine, hint: "Parks, trails, views" },
  { id: "food", label: "Food", icon: UtensilsCrossed, hint: "Markets, local tables" },
  { id: "culture", label: "Culture", icon: Building2, hint: "History, museums" },
  { id: "adventure", label: "Adventure", icon: Mountain, hint: "Hikes, thrills" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, hint: "Bazaars, boutiques" },
  { id: "nightlife", label: "Nightlife", icon: Moon, hint: "Bars, late nights" },
  { id: "relaxation", label: "Relaxation", icon: Waves, hint: "Spas, slow days" },
  { id: "photography", label: "Photography", icon: Camera, hint: "Golden-hour spots" },
];

const interestLabels = Object.fromEntries(interestOptions.map((o) => [o.id, o.label]));

export interface TripFormData {
  source: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: "national" | "international";
  interests: string[];
}

interface TripFormProps {
  onSubmit?: (data: unknown) => void;
  isLoading?: boolean;
}

function Section({ n, title, subtitle, children }: { n: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white/80 p-5 ring-1 ring-line sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <span className="font-mono text-xs text-brand">{n}</span>
        <div>
          <h2 className="display text-[1.9rem] leading-none text-ink">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-stone">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
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

export function TripForm({ onSubmit, isLoading: externalLoading = false }: TripFormProps) {
  const router = useRouter();
  const { credits, refreshCredits } = useCredits();
  const [formData, setFormData] = useState<TripFormData>({
    source: "",
    destination: "",
    startDate: "",
    numberOfDays: 3,
    budget: 1000,
    numberOfPeople: 1,
    tripType: "national",
    interests: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Pre-fill the destination picked on the landing page.
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("destination");
    if (d) setFormData((prev) => ({ ...prev, destination: d.slice(0, 120) }));
  }, []);

  const handleInputChange = <K extends keyof TripFormData>(field: K, value: TripFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId) ? prev.interests.filter((id) => id !== interestId) : [...prev.interests, interestId],
    }));
    if (errors.interests) setErrors((prev) => ({ ...prev, interests: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.source || formData.source.length < 2) {
      newErrors.source = "Source must be at least 2 characters.";
    }
    if (!formData.destination || formData.destination.length < 2) {
      newErrors.destination = "Destination must be at least 2 characters.";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Please select a start date.";
    }
    if (formData.numberOfDays < 1 || formData.numberOfDays > 30) {
      newErrors.numberOfDays = "Number of days must be between 1 and 30.";
    }
    if (formData.budget < 100) {
      newErrors.budget = "Budget must be at least $100.";
    }
    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 20) {
      newErrors.numberOfPeople = "Number of people must be between 1 and 20.";
    }
    if (formData.interests.length === 0) {
      newErrors.interests = "You have to select at least one interest.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      document.querySelector("[aria-invalid='true'], [data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh credits after successful itinerary generation
        await refreshCredits();
        router.push(`/dashboard/itinerary/${result.data.itineraryId}`);
        onSubmit?.(result.data);
      } else {
        setErrors({ submit: result.error });
        setIsSubmitting(false);
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || externalLoading;

  return (
    <>
      <AnimatePresence>{busy && <GeneratingOverlay destination={formData.destination} days={formData.numberOfDays} />}</AnimatePresence>

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
        <div className="space-y-5">
          <Section n="01" title="Where to?" subtitle="Your starting point and the place you keep daydreaming about.">
            <div className="relative grid gap-3 md:grid-cols-2">
              <TextField
                id="trip-source"
                label="Starting from"
                icon={Navigation}
                value={formData.source}
                onChange={(v) => handleInputChange("source", v)}
                placeholder="e.g. Mumbai, India"
                error={errors.source}
              />
              <TextField
                id="trip-destination"
                label="Destination"
                icon={Plane}
                value={formData.destination}
                onChange={(v) => handleInputChange("destination", v)}
                placeholder="e.g. Kyoto, Japan"
                error={errors.destination}
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, source: prev.destination, destination: prev.source }))
                }
                aria-label="Swap origin and destination"
                className="absolute left-1/2 top-[2.25rem] hidden size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper shadow-lg transition-transform duration-500 ease-out-expo hover:rotate-180 md:grid"
              >
                <ArrowLeftRight className="size-4" />
              </button>
            </div>
            <div className="mt-5">
              <p className="eyebrow mb-3 text-[0.6rem] text-stone">Trip type</p>
              <div role="radiogroup" aria-label="Trip type" className="relative grid grid-cols-2 rounded-2xl bg-paper-2 p-1.5">
                {(
                  [
                    ["national", "National", "Within your country"],
                    ["international", "International", "Across borders"],
                  ] as const
                ).map(([value, label, hint]) => {
                  const active = formData.tripType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleInputChange("tripType", value)}
                      className="relative rounded-xl px-4 py-3 text-left"
                    >
                      {active && (
                        <motion.span
                          layoutId="trip-type"
                          className="absolute inset-0 rounded-xl bg-white shadow-[0_10px_30px_-18px_rgba(21,19,15,0.5)] ring-1 ring-line"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className={cn("relative block font-medium", active ? "text-ink" : "text-ink/60")}>{label}</span>
                      <span className="relative block text-xs text-stone">{hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section n="02" title="When & for how long?" subtitle="Pick a start date and how many days you want planned.">
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                id="trip-date"
                label="Start date"
                icon={CalendarDays}
                type="date"
                min={today}
                value={formData.startDate}
                onChange={(v) => handleInputChange("startDate", v)}
                error={errors.startDate}
              />
              <div>
                <Stepper
                  label="Duration"
                  icon={Clock3}
                  value={formData.numberOfDays}
                  onChange={(v) => handleInputChange("numberOfDays", v)}
                  min={1}
                  max={30}
                  suffix={(v) => (v === 1 ? "day" : "days")}
                  error={errors.numberOfDays}
                />
                <QuickPicks values={[3, 5, 7, 10, 14]} current={formData.numberOfDays} onPick={(v) => handleInputChange("numberOfDays", v)} format={(v) => `${v} days`} />
              </div>
            </div>
          </Section>

          <Section n="03" title="Who's coming & the budget" subtitle="Your total budget for the whole trip, in US dollars.">
            <div className="grid gap-3 md:grid-cols-2">
              <Stepper
                label="Travellers"
                icon={Users}
                value={formData.numberOfPeople}
                onChange={(v) => handleInputChange("numberOfPeople", v)}
                min={1}
                max={20}
                suffix={(v) => (v === 1 ? "person" : "people")}
                error={errors.numberOfPeople}
              />
              <div>
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
                    <span className="eyebrow text-[0.6rem] text-stone">Budget (USD)</span>
                    <span className="mt-1 flex items-center text-[1.05rem] text-ink">
                      <span className="text-stone">$</span>
                      <input
                        id="trip-budget"
                        type="number"
                        inputMode="numeric"
                        min={100}
                        step={50}
                        value={formData.budget || ""}
                        onChange={(e) => handleInputChange("budget", Number(e.target.value))}
                        aria-invalid={!!errors.budget}
                        className="w-full bg-transparent pl-0.5 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </span>
                  </span>
                </label>
                <FieldError message={errors.budget} />
                <QuickPicks
                  values={[500, 1000, 2500, 5000]}
                  current={formData.budget}
                  onPick={(v) => handleInputChange("budget", v)}
                  format={(v) => `$${v.toLocaleString("en-US")}`}
                />
              </div>
            </div>
          </Section>

          <Section n="04" title="What do you love?" subtitle="Pick as many as you like — we'll weave them through every day.">
            <div role="group" aria-label="Interests" data-invalid={!!errors.interests} className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {interestOptions.map((interest) => {
                const Icon = interest.icon;
                const isSelected = formData.interests.includes(interest.id);
                return (
                  <motion.button
                    key={interest.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleInterestToggle(interest.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "group relative flex flex-col items-start gap-6 rounded-2xl p-4 text-left ring-1 transition-colors duration-300",
                      isSelected ? "bg-ink text-paper ring-ink" : "bg-paper/60 text-ink ring-line hover:bg-white hover:ring-ink/20"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-xl transition-colors",
                        isSelected ? "bg-brand text-white" : "bg-white text-brand ring-1 ring-line"
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-medium">{interest.label}</span>
                      <span className={cn("block text-xs", isSelected ? "text-paper/60" : "text-stone")}>{interest.hint}</span>
                    </span>
                    <span
                      className={cn(
                        "absolute right-3 top-3 grid size-5 place-items-center rounded-full transition-all duration-300",
                        isSelected ? "scale-100 bg-brand text-white opacity-100" : "scale-50 opacity-0"
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <FieldError message={errors.interests} />
          </Section>

          <div className="flex flex-col gap-4 rounded-[28px] bg-ink p-5 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="display text-2xl leading-none">Ready when you are.</p>
              <p className="mt-2 text-sm text-paper/60">
                {credits > 0 ? (
                  <>
                    Uses 1 credit · you have <span className="text-paper">{credits}</span> left
                  </>
                ) : (
                  <>
                    You&apos;re out of credits.{" "}
                    <Link href="/dashboard/credits" className="text-brand-2 underline underline-offset-4">
                      Top up to keep planning
                    </Link>
                  </>
                )}
              </p>
            </div>
            <PillButton type="submit" variant="brand" size="lg" disabled={busy} icon={<Sparkles className="size-4" />}>
              {busy ? "Generating…" : "Generate itinerary"}
            </PillButton>
          </div>
          <FieldError message={errors.submit} />
        </div>

        <aside className="order-first xl:order-none">
          <div className="xl:sticky xl:top-10">
            <BoardingPass data={formData} interestLabels={interestLabels} />
            <p className="mt-4 hidden px-2 text-sm leading-relaxed text-stone xl:block">
              Your boarding pass updates as you type. Try a destination like <em>Kyoto</em>, <em>Santorini</em> or <em>Rio</em>.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
