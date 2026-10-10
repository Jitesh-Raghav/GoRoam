"use client";

import { animate, motion, useInView } from "framer-motion";
import {
  Download,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Volume2,
  ArrowRightLeft,
  CloudSun,
  CloudRain,
  RefreshCw,
  Map as MapIcon,
  Wallet,
} from "@/components/site/icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "./section-heading";

const ease = [0.16, 1, 0.3, 1] as const;

function Tile({ className, visual, visualClassName, title, body, delay = 0 }: { className?: string; visual: ReactNode; visualClassName?: string; title: string; body: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group flex h-full flex-col overflow-hidden rounded-panel bg-white p-2 ring-1 ring-line transition-shadow duration-700 hover:shadow-float">
        <div className={cn("relative h-52 overflow-hidden rounded-card bg-paper sm:h-60", visualClassName)}>{visual}</div>
        <div className="p-5 pt-5 sm:p-6 sm:pt-6">
          <h3 className="display text-[1.4rem] leading-tight text-ink">{title}</h3>
          <p className="mt-2.5 max-w-md text-[0.95rem] leading-relaxed text-stone">{body}</p>
        </div>
      </div>
    </Reveal>
  );
}

function DaysVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const slots = [Sunrise, Sun, Moon];
  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center p-6">
      <div className="grid w-full max-w-[35rem] grid-cols-5 gap-2.5">
        {Array.from({ length: 5 }, (_, day) => (
          <div key={day} className="space-y-2.5">
            <p className="eyebrow text-center text-[0.6rem] text-stone">Day {day + 1}</p>
            {slots.map((Icon, s) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, ease, delay: day * 0.12 + s * 0.08 }}
                className="relative grid h-12 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-line"
              >
                <span
                  className="features-pulse absolute inset-0 bg-brand"
                  style={{ animationDelay: `${(day * 3 + s) * 0.18}s` }}
                />
                <Icon className="relative size-4 text-ink/70" />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={inView ? { opacity: 1, y: 0, rotate: -3 } : undefined}
        transition={{ duration: 1, ease, delay: 1 }}
        className="absolute bottom-5 right-5 hidden rounded-2xl bg-ink px-4 py-3 text-paper shadow-xl sm:block"
      >
        <p className="eyebrow text-[0.6rem] text-paper/60">Day 3 · Evening</p>
        <p className="mt-1 text-sm">Kaiseki dinner in Gion</p>
      </motion.div>
    </div>
  );
}

function BudgetVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  const bars = [72, 58, 86, 64, 78];
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-end p-6">
      <div className="mb-auto flex items-baseline justify-between">
        <p className="display text-3xl leading-none">$2,380</p>
        <p className="font-mono text-[11px] text-stone">of $2,400</p>
      </div>
      <div className="relative flex h-32 items-end gap-2.5">
        <div className="absolute inset-x-0 top-[12%] border-t border-dashed border-brand/70">
          <span className="eyebrow absolute -top-5 right-0 text-[0.55rem] text-brand">Daily budget</span>
        </div>
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={inView ? { height: `${h}%` } : undefined}
            transition={{ duration: 1.2, ease, delay: 0.15 * i }}
            className={cn("flex-1 rounded-t-lg", i === 2 ? "bg-brand" : "bg-ink/85")}
          />
        ))}
      </div>
    </div>
  );
}

function MapVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  const route = "M40 190C90 150 80 110 140 100S230 130 260 80S330 40 360 60";
  const pins = [
    [40, 190],
    [140, 100],
    [260, 80],
    [360, 60],
  ];
  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox="0 0 400 240" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="feat-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="var(--line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#feat-grid)" />
        <path d="M0 150Q120 120 200 170T400 140" fill="none" stroke="#d4e4e8" strokeWidth="18" />
        <path d="M120 0Q150 120 110 240" fill="none" stroke="#d4e4e8" strokeWidth="10" />
        <motion.path
          d={route}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : undefined}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
        />
        {pins.map(([x, y], i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: -18 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.3 + i * 0.5 }}
          >
            <circle cx={x} cy={y} r={i === pins.length - 1 ? 9 : 6} fill={i === pins.length - 1 ? "var(--brand)" : "var(--ink)"} />
            <circle cx={x} cy={y} r={2.5} fill="#fff" />
          </motion.g>
        ))}
      </svg>
      <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs shadow-md ring-1 ring-line">
        <MapPin className="size-3.5 text-brand" /> Open in Google Maps
      </div>
    </div>
  );
}

const PHRASES = [
  { en: "Thank you", local: "ありがとう", say: "Arigatō", flag: "jp" },
  { en: "How much?", local: "Quanto costa?", say: "KWAHN-toh KOH-stah", flag: "it" },
  { en: "Hello", local: "नमस्ते", say: "Namaste", flag: "in" },
];

function GuideVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-center gap-2.5 px-6">
      {PHRASES.map((p, i) => (
        <motion.div
          key={p.en}
          initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
          animate={inView ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.18 }}
          className={cn("flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_14px_30px_-22px_rgba(10,30,44,0.6)] ring-1 ring-line", i === 1 && "ml-8")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny flag */}
          <img src={`https://flagcdn.com/${p.flag}.svg`} alt="" className="h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-black/10" />
          <span className="min-w-0 flex-1">
            <span className="display block truncate text-lg leading-none text-ink">{p.local}</span>
            <span className="mt-1 block truncate text-[11px] text-stone">
              {p.en} · “{p.say}”
            </span>
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand">
            <Volume2 className="size-3.5" />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ConciergeVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-center gap-2.5 bg-ocean px-6 text-sm">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease, delay: 0.2 }}
        className="ml-auto max-w-[80%] rounded-[18px] rounded-br-md bg-paper px-4 py-2.5 text-ink"
      >
        It&apos;s raining on day 2, what now?
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease, delay: 0.9 }}
        className="max-w-[86%] rounded-[18px] rounded-bl-md bg-paper/10 px-4 py-2.5 leading-relaxed text-paper ring-1 ring-inset ring-paper/15"
      >
        Swap the garden walk for the Nishiki Market food crawl: it&apos;s covered, and 6 minutes from your afternoon stop.
      </motion.p>
      <motion.span
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 1.4 }}
        className="inline-flex items-center gap-2 self-start rounded-full bg-paper py-1.5 pl-1.5 pr-3.5 text-xs text-ink"
      >
        <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-brand-2 to-brand">
          <Sparkles className="size-3 text-white" />
        </span>
        Ask GoRoam
      </motion.span>
    </div>
  );
}

/* "Built for the road": five tiny working tools, each with a little life of its own. */

function ToolCard({ className, label, icon: Icon, children, i, inView }: { className?: string; label: string; icon: typeof CloudSun; children: ReactNode; i: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.1 }}
      className={cn("relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white p-3.5 shadow-[0_14px_30px_-24px_rgba(10,30,44,0.6)] ring-1 ring-line", className)}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="eyebrow truncate text-[0.55rem] text-stone">{label}</span>
        <Icon className="size-4 shrink-0 text-brand" />
      </span>
      <div className="mt-3 flex flex-1 flex-col justify-end lg:justify-center">{children}</div>
    </motion.div>
  );
}

const FORECAST = [
  { d: "Mon", icon: Sun, t: 24, rain: 10 },
  { d: "Tue", icon: CloudSun, t: 21, rain: 30 },
  { d: "Wed", icon: CloudRain, t: 18, rain: 80 },
  { d: "Thu", icon: CloudSun, t: 20, rain: 40 },
  { d: "Fri", icon: Sun, t: 23, rain: 5 },
];

function CountUp({ to, inView, prefix = "" }: { to: number; inView: boolean; prefix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <>
      {prefix}
      {n.toLocaleString("en-US")}
    </>
  );
}

function ToolsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35, once: true });
  return (
    <div ref={ref} className="absolute inset-0 grid grid-cols-2 grid-rows-[1fr_auto] gap-2.5 p-3 sm:grid-rows-[1fr_1fr_auto] sm:p-4 lg:grid-cols-5 lg:grid-rows-1">
      {/* Live weather for every day of the trip. */}
      <ToolCard label="Kyoto · 5 days" icon={CloudSun} i={0} inView={inView}>
        <div className="grid grid-cols-5 gap-1 text-center">
          {FORECAST.map((f, k) => (
            <div key={f.d} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-stone">{f.d}</span>
              <f.icon className={cn("size-3.5", f.rain > 50 ? "text-[#3a6ea5]" : "text-sun")} />
              <span className="font-mono text-[10px] text-ink">{f.t}°</span>
              <span className="relative h-9 w-1.5 overflow-hidden rounded-full bg-paper-2 lg:h-12">
                <motion.span
                  className="absolute inset-x-0 bottom-0 rounded-full bg-brand-2"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${f.rain}%` } : undefined}
                  transition={{ duration: 1, ease, delay: 0.5 + k * 0.08 }}
                />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 truncate text-[10px] text-stone">Rain Wed: we&apos;ve swapped in a museum</p>
      </ToolCard>

      {/* The money converter. */}
      <ToolCard label="Money" icon={ArrowRightLeft} i={1} inView={inView}>
        <p className="flex items-center gap-1.5 text-xs text-stone">
          <span>🇺🇸 $100</span>
          <ArrowRightLeft className="size-3 text-brand" />
          <span>🇯🇵 JPY</span>
        </p>
        <p className="display mt-1 text-[1.7rem] leading-none text-ink lg:text-[2rem]">
          <CountUp to={14820} inView={inView} prefix="¥" />
        </p>
        <p className="mt-1.5 truncate text-[10px] text-stone">Ramen ≈ ¥1,100 · taxi ≈ ¥1,800</p>
      </ToolCard>

      {/* Swap a stop you don't fancy. */}
      <ToolCard label="Swap a stop" icon={RefreshCw} i={2} inView={inView} className="max-sm:hidden">
        <div className="space-y-1.5">
          <motion.div
            initial={{ opacity: 1 }}
            animate={inView ? { opacity: 0.45 } : undefined}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="rounded-xl bg-paper-2/70 px-2.5 py-1.5 text-[11px] text-stone line-through decoration-stone/60"
          >
            Philosopher&apos;s Path
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.7, ease, delay: 1.3 }}
            className="rounded-xl bg-brand-soft px-2.5 py-1.5 text-[11px] font-medium text-ink"
          >
            Kyoto Railway Museum
            <span className="block text-[9px] font-normal text-brand">Indoors · 6 min away</span>
          </motion.div>
        </div>
        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[9px] text-paper">
          <RefreshCw className="size-2.5" /> Swapped
        </span>
      </ToolCard>

      {/* Split costs with the crew. */}
      <ToolCard label="Trip wallet" icon={Wallet} i={3} inView={inView} className="max-sm:hidden">
        <div className="space-y-1.5">
          {[
            { who: "You", c: "bg-brand", w: 72, amt: "$184" },
            { who: "Mia", c: "bg-sun", w: 48, amt: "$122" },
            { who: "Sam", c: "bg-[#c0503e]", w: 30, amt: "$76" },
          ].map((p, k) => (
            <div key={p.who} className="flex items-center gap-2">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-medium text-white", p.c)}>{p.who[0]}</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                <motion.span className={cn("absolute inset-y-0 left-0 rounded-full", p.c)} initial={{ width: 0 }} animate={inView ? { width: `${p.w}%` } : undefined} transition={{ duration: 1, ease, delay: 0.6 + k * 0.12 }} />
              </span>
              <span className="w-8 text-right font-mono text-[9px] text-ink">{p.amt}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 truncate text-[10px] text-ink">
          Mia → you <span className="font-medium text-brand">$12.50</span> settles it
        </p>
      </ToolCard>

      {/* The day's route, saved for offline. */}
      <ToolCard label="Offline map" icon={MapIcon} i={4} inView={inView} className="col-span-2 lg:col-span-1">
        <div className="relative -mx-1 h-24 overflow-hidden rounded-xl bg-[#e8f1ef] lg:h-28">
          <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
            <path d="M0 30H200M0 64H200M46 0V96M120 0V96M168 0V96" stroke="#fff" strokeWidth="5" />
            <path d="M0 82C40 70 70 90 110 76S170 60 200 70" stroke="#bcdde6" strokeWidth="9" fill="none" />
            <rect x="128" y="8" width="30" height="16" rx="3" fill="#cfe7cf" />
            <motion.path
              d="M24 70C52 52 70 44 92 40S138 30 150 18"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2.4"
              strokeDasharray="5 4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.6 }}
            />
            {[
              [24, 70],
              [92, 40],
              [150, 18],
            ].map(([x, y], k) => (
              <motion.g key={k} initial={{ scale: 0 }} animate={inView ? { scale: 1 } : undefined} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.7 + k * 0.4 }} style={{ transformOrigin: `${x}px ${y}px` }}>
                <circle cx={x} cy={y} r="7" fill={k === 2 ? "var(--sun)" : "var(--brand)"} stroke="#fff" strokeWidth="2" />
                <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontFamily="ui-monospace, monospace">
                  {k + 1}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 2.2 }}
          className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-medium text-brand"
        >
          <Download className="size-2.5" /> Saved offline · 9 stops
        </motion.span>
      </ToolCard>
    </div>
  );
}

export function Features() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          label="Built for travellers"
          title={[[{ text: "Everything a trip needs." }], [{ text: "Nothing it " }, { text: "doesn't.", className: "accent" }]]}
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Tile
            className="md:col-span-2 lg:col-span-4"
            visual={<DaysVisual />}
            title="Every day, beautifully paced"
            body="A morning, afternoon and evening for each day, with times, durations and a theme, so days flow instead of scramble."
          />
          <Tile
            className="lg:col-span-2"
            delay={0.08}
            visual={<BudgetVisual />}
            title="Honest about money"
            body="Every stop carries an estimated cost, and each day is planned to land inside the budget you set."
          />
          <Tile
            className="lg:col-span-2"
            visual={<MapVisual />}
            title="One tap to directions"
            body="Every stop is pinned on a day map, and one tap opens the whole day's route in Google Maps."
          />
          <Tile
            className="lg:col-span-2"
            delay={0.08}
            visual={<GuideVisual />}
            title="A local in your pocket"
            body="Phrases with audio, the dishes to order, culture do's and don'ts, and what's on that week."
          />
          <Tile
            className="md:col-span-2 lg:col-span-2"
            delay={0.16}
            visual={<ConciergeVisual />}
            title="Ask anything, anytime"
            body="Every trip has its own AI concierge that knows your days, stays and budget: rainy-day swaps, what to wear, how to get there."
          />
          <Tile
            className="md:col-span-2 lg:col-span-6"
            visual={<ToolsVisual />}
            visualClassName="h-[22rem] sm:h-[24rem] lg:h-64"
            title="Built for the road, not just the planning"
            body="Live weather for each day, a money converter, one-tap swaps, a wallet that splits costs with your crew, and the whole plan as a link, PDF, offline map or calendar."
          />
        </div>
      </div>
    </section>
  );
}
