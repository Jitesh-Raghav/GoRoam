"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Check,
  Download,
  ExternalLink,
  MapPin,
  Moon,
  Navigation,
  PenLine,
  Sparkles,
  Sun,
  Sunrise,
  Wallet,
  Users,
  CalendarDays,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { Scene } from "@/components/scenes/scene";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    icon: PenLine,
    title: "Tell us the dream.",
    body: "Where you're starting, where you're headed, when, who's coming and what you love. It takes about thirty seconds.",
    points: ["Any city, country or wild idea", "Budget, group size and trip length", "Eight travel styles to mix"],
  },
  {
    icon: Sparkles,
    title: "We craft the days.",
    body: "GoRoam's AI weighs your budget, pace and interests to build a morning, afternoon and evening for every day — real places, not placeholders.",
    points: ["Popular icons and hidden gems", "Costs estimated for every stop", "A theme for every day"],
  },
  {
    icon: Navigation,
    title: "Go. It's all in your pocket.",
    body: "Open any stop in Google Maps, keep every itinerary in your dashboard, or print a clean PDF for the road.",
    points: ["One tap to directions", "Saved to your account", "Print-ready PDF export"],
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

function Field({ label, value, icon: Icon, active }: { label: string; value: React.ReactNode; icon: typeof MapPin; active?: boolean }) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3 transition-colors", active ? "border-brand/50 bg-brand-soft/40" : "border-line bg-white")}>
      <p className="eyebrow text-[0.6rem] text-stone">{label}</p>
      <p className="mt-1.5 flex items-center gap-2 text-[0.95rem] text-ink">
        <Icon className="size-4 text-brand" />
        {value}
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" icon={Navigation} value="Mumbai, India" />
        <Field label="When" icon={CalendarDays} value="12 Apr · 5 days" />
        <Field label="Who" icon={Users} value="2 travellers" />
        <Field label="Budget" icon={Wallet} value="$2,400" />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          ["Culture", true],
          ["Food", true],
          ["Nature", false],
          ["Photography", true],
          ["Nightlife", false],
        ].map(([label, on], i) => (
          <motion.span
            key={label as string}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm",
              on ? "bg-ink text-paper" : "bg-paper-2 text-ink/70"
            )}
          >
            {on && <Check className="size-3.5" />}
            {label as string}
          </motion.span>
        ))}
      </div>
      <div className="mt-auto">
        <div className="relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand py-3.5 text-sm font-medium text-white">
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
      <div className="flex items-center gap-5">
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
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
        <div>
          <p className="display text-3xl leading-none">Crafting Kyoto…</p>
          <p className="mt-2 text-sm text-stone">5 days · 2 travellers · Culture, Food, Photography</p>
        </div>
      </div>
      <ul className="mt-6 space-y-2.5">
        {STATUS.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-3 text-sm transition-colors duration-500", i < done ? "text-ink" : "text-stone-2")}>
            <span className={cn("grid size-5 place-items-center rounded-full transition-colors duration-500", i < done ? "bg-brand text-white" : "bg-paper-2")}>
              {i < done && <Check className="size-3" />}
            </span>
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-2.5">
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
      <div className="relative h-28 shrink-0 overflow-hidden rounded-2xl">
        <Scene id="fuji" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-paper">
          <p className="display text-3xl leading-none">5 days in Kyoto</p>
          <span className="eyebrow rounded-full bg-paper/15 px-2.5 py-1.5 backdrop-blur">$2,380</span>
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
          <span key={d} className={cn("rounded-full px-3 py-1 text-xs", i === 0 ? "bg-ink text-paper" : "bg-paper-2 text-ink/60")}>
            {d}
          </span>
        ))}
      </div>
      <p className="mt-4 eyebrow text-stone">Temples & tea</p>
      <ol className="relative mt-3 space-y-3 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-line">
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
        <span className="inline-flex items-center justify-center gap-2 rounded-full bg-paper-2 py-3 text-sm text-ink">
          <ExternalLink className="size-4" /> Open in Maps
        </span>
        <span className="inline-flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm text-paper">
          <Download className="size-4" /> Download PDF
        </span>
      </div>
    </motion.div>
  );
}

function PlannerMock({ step, className }: { step: number; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[36px] bg-paper-2 ring-1 ring-line", className)}>
      <LazyScene id="fuji" className="opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/20" />
      <div className="relative flex h-full items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-[460px] rounded-[26px] bg-white/[0.96] shadow-[0_40px_90px_-40px_rgba(21,19,15,0.6)] ring-1 ring-black/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="mx-auto font-mono text-[11px] text-stone">GoRoam — New trip</span>
            <span className="eyebrow text-[0.6rem] text-brand">0{step + 1}/03</span>
          </div>
          <div className="h-[430px] p-5 sm:p-6">
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

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileRef, { amount: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Desktop: the step crossing the middle of the viewport drives the mock.
  useEffect(() => {
    if (!desktop) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [desktop]);

  // Mobile: the mock plays through the steps on its own while visible.
  useEffect(() => {
    if (desktop || !mobileInView) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4200);
    return () => window.clearInterval(t);
  }, [desktop, mobileInView]);

  return (
    <section id="how" className="relative scroll-mt-10 bg-paper py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading
          index="03"
          label="How it works"
          title={[[{ text: "From a sentence" }], [{ text: "to a " }, { text: "journey.", className: "italic text-brand" }]]}
          description="Three steps, a few seconds, zero spreadsheets. Here's what happens after you hit plan."
        />

        <div ref={mobileRef} className="mt-12 lg:hidden">
          <PlannerMock step={step} className="h-[600px]" />
        </div>

        <div className="mt-12 grid gap-10 lg:mt-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-step={i}
                className="flex flex-col justify-center border-t border-line py-8 lg:min-h-[78vh] lg:border-t-0 lg:py-0"
              >
                <div className={cn("transition-opacity duration-700", desktop && step !== i ? "lg:opacity-30" : "opacity-100")}>
                  <div className="flex items-center gap-4">
                    <span className={cn("display text-6xl leading-none transition-colors duration-700", step === i ? "text-brand" : "text-ink/20")}>
                      0{i + 1}
                    </span>
                    <span className={cn("grid size-11 place-items-center rounded-full transition-colors duration-700", step === i ? "bg-ink text-paper" : "bg-paper-2 text-ink/50")}>
                      <s.icon className="size-5" />
                    </span>
                  </div>
                  <h3 className="display mt-6 text-[2.6rem] leading-[0.98] lg:text-[3.4rem]">{s.title}</h3>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-stone">{s.body}</p>
                  <ul className="mt-6 space-y-2.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-ink/80">
                        <span className="size-1.5 rounded-full bg-brand" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-[11vh] h-[78vh]">
              <PlannerMock step={step} className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
