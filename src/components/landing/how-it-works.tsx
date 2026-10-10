"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Check,
  Download,
  ExternalLink,
  MapPin,
  Moon,
  Navigation,
  Sparkles,
  Sun,
  Sunrise,
  Wallet,
  Users,
  CalendarDays,
} from "@/components/site/icons";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { Scene } from "@/components/scenes/scene";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    title: "Tell us the dream",
    body: "Where you're going, who's coming, your pace, budget and what you love. Type it in one line or fill four quick steps.",
  },
  {
    title: "We plan every day",
    body: "A morning, afternoon and evening for each day: real places grouped by area, with timings, costs and an insider tip for every stop.",
  },
  {
    title: "Book it and go",
    body: "Flights, stays and tickets open with your dates filled in. Share the plan, sync it to your calendar and take it offline.",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;
const stateMotion = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(6px)" },
  transition: { duration: 0.6, ease },
};

function useTyped(text: string, speed = 70) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const t = window.setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(t);
    }, speed);
    return () => window.clearInterval(t);
  }, [text, speed]);
  return out;
}

function Field({ label, value, icon: Icon, active, compact }: { label: string; value: React.ReactNode; icon: typeof MapPin; active?: boolean; compact?: boolean }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border px-3.5 py-2.5 transition-colors sm:px-4 sm:py-3",
        compact && "max-[399px]:flex max-[399px]:items-center max-[399px]:justify-between max-[399px]:gap-3 max-[399px]:py-2",
        active ? "border-brand/50 bg-brand-soft/40" : "border-line bg-white"
      )}
    >
      <p className="eyebrow shrink-0 text-[0.6rem] text-stone">{label}</p>
      <p className={cn("mt-1.5 flex min-w-0 items-center gap-2 text-[0.88rem] text-ink sm:text-[0.95rem]", compact && "max-[399px]:mt-0 max-[399px]:text-[0.82rem]")}>
        <Icon className="size-4 shrink-0 text-brand" />
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function FormState() {
  const typed = useTyped("Kyoto, Japan");
  return (
    <motion.div {...stateMotion} className="flex h-full flex-col gap-3">
      <Field
        label="Where to?"
        icon={MapPin}
        active
        value={
          <span>
            {typed}
            <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-ink align-middle" />
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-3">
        <Field compact label="From" icon={Navigation} value="Mumbai, India" />
        <Field compact label="When" icon={CalendarDays} value="12 Apr · 5 days" />
        <Field compact label="Who" icon={Users} value="Couple · Slow pace" />
        <Field compact label="Budget" icon={Wallet} value="$2,400" />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1 sm:gap-2">
        {[
          ["History", true],
          ["Food & drink", true],
          ["Hidden gems", false],
          ["Photo spots", true],
          ["Wellness", false],
        ].map(([label, on], i) => (
          <motion.span
            key={label as string}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
              on ? "bg-ink text-paper" : "bg-paper-2 text-ink/70",
              i > 3 && "max-[399px]:hidden"
            )}
          >
            {on && <Check className="size-3.5" />}
            {label as string}
          </motion.span>
        ))}
      </div>
      <div className="mt-auto pt-1">
        <div className="relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand py-3 text-sm font-medium text-white sm:py-3.5">
          <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand/40" />
          <Sparkles className="relative size-4" />
          <span className="relative">Generate itinerary</span>
        </div>
      </div>
    </motion.div>
  );
}

const STATUS = ["Balancing a $2,400 budget", "Scouting temples & tea houses", "Timing the quiet hours", "Pinning every stop to the map"];

function GeneratingState() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setDone((d) => Math.min(d + 1, STATUS.length)), 700);
    return () => window.clearInterval(t);
  }, []);
  return (
    <motion.div {...stateMotion} className="flex h-full flex-col">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative size-16 shrink-0 sm:size-20">
          <svg viewBox="0 0 80 80" className="size-16 -rotate-90 sm:size-20">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--paper-2)" strokeWidth="6" />
            <motion.circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </svg>
          <Sparkles className="absolute inset-0 m-auto size-6 text-brand" />
        </div>
        <div className="min-w-0">
          <p className="display text-[1.44rem] leading-none sm:text-2xl">Crafting Kyoto…</p>
          <p className="mt-2 text-xs text-stone sm:text-sm">5 days · 2 travellers · Culture, Food, Photography</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2.5 sm:mt-6">
        {STATUS.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-3 text-[0.82rem] transition-colors duration-500 sm:text-sm", i < done ? "text-ink" : "text-stone-2")}>
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-500", i < done ? "bg-brand text-white" : "bg-paper-2")}>
              {i < done && <Check className="size-3" />}
            </span>
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-2.5 pt-5">
        {[88, 72, 80].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton size-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 rounded-full" style={{ width: `${w}%` }} />
              <div className="skeleton h-2.5 w-1/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const DAY = [
  { icon: Sunrise, slot: "Morning", time: "7:00 AM", title: "Fushimi Inari Taisha", meta: "3h · Free" },
  { icon: Sun, slot: "Afternoon", time: "1:00 PM", title: "Gion & Yasaka Shrine", meta: "4h · $25" },
  { icon: Moon, slot: "Evening", time: "6:30 PM", title: "Supper on Pontocho Alley", meta: "2.5h · $60" },
];

function ResultState() {
  return (
    <motion.div {...stateMotion} className="flex h-full flex-col">
      <div className="relative h-24 shrink-0 overflow-hidden rounded-2xl sm:h-28">
        <Scene id="fuji" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-paper">
          <p className="display text-[1.36rem] leading-none sm:text-2xl">5 days in Kyoto</p>
          <span className="eyebrow shrink-0 rounded-full bg-paper/15 px-2.5 py-1.5 backdrop-blur">$2,380</span>
        </div>
      </div>
      <div className="mt-4 flex gap-1 sm:gap-1.5">
        {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
          <span key={d} className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs", i === 0 ? "bg-ink text-paper" : "bg-paper-2 text-ink/60")}>
            {d}
          </span>
        ))}
      </div>
      <p className="mt-4 eyebrow text-stone">Temples & tea</p>
      <ol className="relative mt-3 space-y-2.5 sm:space-y-3 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-line">
        {DAY.map((r, i) => (
          <motion.li
            key={r.title}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease }}
            className="relative flex items-center gap-3"
          >
            <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <r.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] text-stone">
                {r.slot} · {r.time}
              </p>
              <p className="truncate text-sm font-medium text-ink">{r.title}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-stone">{r.meta}</span>
          </motion.li>
        ))}
      </ol>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-paper-2 py-3 text-[0.8rem] text-ink sm:gap-2 sm:text-sm">
          <ExternalLink className="size-4" /> Open in Maps
        </span>
        <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-ink py-3 text-[0.8rem] text-paper sm:gap-2 sm:text-sm">
          <Download className="size-4" /> Download PDF
        </span>
      </div>
    </motion.div>
  );
}

function PlannerMock({ step, className }: { step: number; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-panel bg-paper-2 ring-1 ring-line", className)}>
      <LazyScene id="fuji" className="opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/20" />
      <div className="relative flex h-full items-center justify-center px-3 py-8 sm:p-10">
        <div className="w-full max-w-[460px] overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white/[0.96] shadow-[0_40px_90px_-40px_rgba(10,30,44,0.6)] ring-1 ring-black/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3 sm:px-5 sm:py-3.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="mx-auto font-mono text-[11px] text-stone">GoRoam · New trip</span>
            <span className="eyebrow text-[0.6rem] text-brand">0{step + 1}/03</span>
          </div>
          <div className="h-[408px] overflow-hidden p-4 sm:h-[430px] sm:p-6">
            <AnimatePresence mode="wait">
              {step === 0 && <FormState key="form" />}
              {step === 1 && <GeneratingState key="gen" />}
              {step === 2 && <ResultState key="result" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEP_MS = 5200;

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();

  // While the section is on screen the mock plays through the three steps; picking one restarts the clock.
  useEffect(() => {
    if (!inView || reduce) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [inView, reduce, step, tick]);

  const pick = (i: number) => {
    setStep(i);
    setTick((t) => t + 1);
  };

  return (
    <section id="how" className="relative scroll-mt-16 py-20 lg:py-28">
      <div ref={ref} className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            label="How it works"
            size="md"
            title={[[{ text: "One sentence in." }], [{ text: "A whole " }, { text: "journey", className: "accent" }, { text: " out." }]]}
            description="Three steps, about a minute, zero spreadsheets."
          />
          <ol className="mt-10 border-t border-line" aria-label="The three steps">
            {STEPS.map((s, i) => {
              const active = step === i;
              return (
                <li key={s.title} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-current={active ? "step" : undefined}
                    className="group relative flex w-full gap-5 py-5 text-left"
                  >
                    <span className={cn("display w-8 shrink-0 text-lg leading-7 tabular-nums transition-colors duration-500", active ? "text-brand" : "text-ink/30")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("display block text-[1.35rem] leading-7 transition-colors duration-500", active ? "text-ink" : "text-ink/45 group-hover:text-ink/70")}>
                        {s.title}
                      </span>
                      <span className={cn("mt-2 block text-[0.98rem] leading-relaxed transition-colors duration-500", active ? "text-stone" : "text-stone/60")}>{s.body}</span>
                    </span>
                    {/* How long until the mock moves on. */}
                    <span aria-hidden className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                      {active && (
                        <span
                          key={`${step}-${tick}`}
                          className={cn("block h-full origin-left bg-ink", inView && !reduce ? "animate-fill-x" : "scale-x-100")}
                          style={{ animationDuration: `${STEP_MS}ms` }}
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="lg:col-span-7">
          <PlannerMock step={step} className="h-[34rem] sm:h-[36rem]" />
        </div>
      </div>
    </section>
  );
}
