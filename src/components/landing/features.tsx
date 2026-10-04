"use client";

import { motion, useInView } from "framer-motion";
import {
  Building2,
  Camera,
  Compass,
  Download,
  FileText,
  Landmark,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  TreePine,
  UtensilsCrossed,
  Volume2,
  Waves,
  ArrowRightLeft,
  CloudSun,
  Map as MapIcon,
  Wallet,
} from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { Brackets } from "./guides";
import { SectionHeading } from "./section-heading";

const ease = [0.16, 1, 0.3, 1] as const;

function Tile({ className, visual, title, body, delay = 0 }: { className?: string; visual: ReactNode; title: string; body: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white/80 p-2 ring-1 ring-line transition-shadow duration-700 hover:shadow-[0_40px_80px_-50px_rgba(10,30,44,0.45)]">
        <div className="relative h-60 overflow-hidden rounded-[22px] bg-paper">{visual}</div>
        <div className="p-5 pt-6">
          <h3 className="display text-[1.9rem] leading-none text-ink">{title}</h3>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-stone">{body}</p>
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
      <div className="grid w-full max-w-[560px] grid-cols-5 gap-2.5">
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
        <p className="display text-4xl leading-none">$2,380</p>
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

function PdfVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ y: 40, rotate: 6, opacity: 0 }}
        animate={inView ? { y: 0, rotate: -4, opacity: 1 } : undefined}
        transition={{ duration: 1.1, ease }}
        className="relative h-48 w-36 overflow-hidden rounded-xl bg-white p-3 shadow-[0_24px_50px_-24px_rgba(10,30,44,0.5)] ring-1 ring-line"
      >
        <div className="relative h-14 overflow-hidden rounded-md">
          <LazyScene id="santorini" tint="#E98A7C" />
        </div>
        <p className="display mt-2 text-lg leading-none">Santorini</p>
        {[90, 70, 84, 60, 76].map((w, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : undefined}
            transition={{ duration: 0.8, ease, delay: 0.5 + i * 0.1 }}
            className="mt-1.5 h-1.5 origin-left rounded-full bg-paper-2"
            style={{ width: `${w}%` }}
          />
        ))}
        <FileText className="absolute bottom-2.5 right-2.5 size-3.5 text-stone-2" />
      </motion.div>
      <motion.span
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 1 }}
        className="absolute right-[26%] top-[18%] grid size-12 place-items-center rounded-full bg-brand text-white shadow-lg"
      >
        <Download className="features-bob size-5" />
      </motion.span>
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
            <span className="display block truncate text-xl leading-none text-ink">{p.local}</span>
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

const TOOLS = [
  { icon: CloudSun, label: "Day 2 · Kyoto", value: "18° / 9°", note: "Live forecast, rain at 4 pm" },
  { icon: ArrowRightLeft, label: "Swap a stop", value: "3 ideas", note: "“Something indoors”, nearby" },
  { icon: Wallet, label: "Trip wallet", value: "Sam → you", note: "$42.50 settles it" },
  { icon: MapIcon, label: "Offline map", value: "9 stops", note: "Opens in Organic Maps" },
];

function ToolsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  return (
    <div ref={ref} className="absolute inset-0 grid grid-cols-2 gap-2.5 p-4 sm:p-5 lg:grid-cols-4">
      {TOOLS.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.1 }}
          className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_14px_30px_-24px_rgba(10,30,44,0.6)] ring-1 ring-line"
        >
          <span className="flex items-center justify-between">
            <span className="eyebrow text-[0.55rem] text-stone">{t.label}</span>
            <t.icon className="size-4 text-brand" />
          </span>
          <span>
            <span className="display block text-3xl leading-none text-ink">{t.value}</span>
            <span className="mt-1 block truncate text-[11px] text-stone">{t.note}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

const STYLES = [
  { icon: Landmark, label: "Iconic sights" },
  { icon: UtensilsCrossed, label: "Food & drink" },
  { icon: Building2, label: "History" },
  { icon: Compass, label: "Hidden gems" },
  { icon: TreePine, label: "Outdoors" },
  { icon: Moon, label: "Nightlife" },
  { icon: Waves, label: "Wellness" },
  { icon: Camera, label: "Photo spots" },
];

function StylesVisual() {
  const row = (items: typeof STYLES, dark: boolean) =>
    items.map((s) => (
      <span
        key={s.label}
        className={cn(
          "mr-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm",
          dark ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-line"
        )}
      >
        <s.icon className={cn("size-4", dark ? "text-brand-2" : "text-brand")} />
        {s.label}
      </span>
    ));
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
      <Marquee duration={26}>{row(STYLES.slice(0, 4), false)}</Marquee>
      <Marquee duration={30} reverse>
        {row(STYLES.slice(4), true)}
      </Marquee>
      <Marquee duration={22}>{row([...STYLES].reverse().slice(0, 4), false)}</Marquee>
    </div>
  );
}

export function Features() {
  return (
    <section className="relative bg-paper py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading
          index="05"
          label="Built for travellers"
          title={[[{ text: "Everything a trip needs." }], [{ text: "Nothing it ", className: "italic text-brand" }, { text: "doesn't.", className: "italic text-brand" }]]}
        />
        <div className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Brackets />
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
            visual={<PdfVisual />}
            title="Share, email, sync, print"
            body="Send the crew a private link, email the plan to yourself, add every stop to your calendar, or save a beautiful PDF."
          />
          <Tile
            className="md:col-span-2 lg:col-span-2"
            delay={0.16}
            visual={<StylesVisual />}
            title="Made for how you travel"
            body="Solo or with the kids, slow or full throttle, vegan or anything goes: twelve interests and every preference shape the plan."
          />
          <Tile
            className="md:col-span-1 lg:col-span-3"
            visual={<GuideVisual />}
            title="A local in your pocket"
            body="Five phrases with audio, the dishes to order, culture do's and don'ts, souvenirs worth carrying home, events that week and three facts to impress at dinner."
          />
          <Tile
            className="md:col-span-1 lg:col-span-3"
            delay={0.08}
            visual={<ConciergeVisual />}
            title="Ask anything, anytime"
            body="Every trip comes with its own AI concierge that knows your days, stays and budget, for rainy-day swaps, what to wear or how to get there."
          />
          <Tile
            className="md:col-span-2 lg:col-span-6"
            visual={<ToolsVisual />}
            title="Built for the road, not just the planning"
            body="Live weather for every day, a money converter, swap any stop you don't fancy, split costs with your crew in the trip wallet, and download the whole plan as an offline map."
          />
        </div>
      </div>
    </section>
  );
}
