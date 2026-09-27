"use client";

import {
  AnimatePresence,
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Compass, Moon, Sun, Sunrise } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MANIFESTO } from "@/lib/copy";
import { HERO_SEQUENCE, formatCoords } from "@/lib/destinations";
import { Scene } from "@/components/scenes/scene";
import { ScrambleText } from "@/components/motion/scramble-text";
import { ScrollWords } from "@/components/motion/scroll-words";
import { SplitText } from "@/components/motion/split-text";
import { TripPrompt } from "@/components/site/trip-prompt";
import { useIntro } from "@/components/site/use-intro";

const SLIDE_MS = 6500;
const ease = [0.16, 1, 0.3, 1] as const;
const slotIcon = { Morning: Sunrise, Afternoon: Sun, Evening: Moon };
const pad = (n: number) => String(n).padStart(2, "0");

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

function RotatingBadge() {
  return (
    <div className="relative size-[132px] rounded-full bg-paper shadow-[0_20px_50px_-25px_rgba(21,19,15,0.5)]">
      <svg viewBox="0 0 120 120" className="animate-spin-slow absolute inset-0" aria-hidden>
        <defs>
          <path id="hero-badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-ink font-mono text-[9px] uppercase tracking-[0.34em]">
          <textPath href="#hero-badge-circle">Plan · Explore · Roam · Wander ·</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-ink text-paper">
        <Compass className="size-5" />
      </div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const intro = useIntro();
  const desktop = useIsDesktop();
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [moving, setMoving] = useState(false);
  const dest = HERO_SEQUENCE[index];
  const Icon = slotIcon[dest.moment.slot];
  const firstSlide = cycle === 0;

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + HERO_SEQUENCE.length) % HERO_SEQUENCE.length);
    setCycle((c) => c + 1);
  };

  useEffect(() => {
    if (!intro.ready) return;
    const wait = SLIDE_MS + (firstSlide ? intro.delay * 1000 : 0);
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % HERO_SEQUENCE.length);
      setCycle((c) => c + 1);
    }, wait);
    return () => window.clearTimeout(t);
  }, [cycle, intro.ready, intro.delay, firstSlide]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const inOut = cubicBezier(0.65, 0, 0.35, 1);
  const expand = useTransform(scrollYProgress, [0.03, 0.46], [0, 1], { ease: inOut });
  const textOpacity = useTransform(scrollYProgress, [0.02, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -90]);
  const chromeOpacity = useTransform(scrollYProgress, [0.01, 0.12], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.38, 0.56], [0, 1]);
  const manifestoOpacity = useTransform(scrollYProgress, [0.44, 0.54], [0, 1]);
  const manifesto = useTransform(scrollYProgress, [0.5, 0.94], [0, 1]);
  useMotionValueEvent(expand, "change", (v) => {
    setExpanded(v > 0.02);
    // Freeze the scene's looping animations while the window is opening, so the
    // browser can reuse the painted layer instead of re-rasterising every frame.
    setMoving(v > 0.01 && v < 0.99);
  });

  const delay = intro.delay;
  const stageStyle = (desktop ? { "--e": expand } : undefined) as MotionStyle | undefined;

  return (
    <section ref={sectionRef} className="relative lg:h-[270vh]" aria-label="Introduction">
      <motion.div style={stageStyle} className="hero-stage relative overflow-hidden lg:sticky lg:top-0 lg:h-svh">
        {/* Copy */}
        <motion.div
          style={desktop ? { opacity: textOpacity, y: textY } : undefined}
          className="container-x relative z-10 pt-28 sm:pt-32 lg:flex lg:h-full lg:items-center lg:pt-10"
        >
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1, ease, delay: delay + 0.1 }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-white/60 py-1.5 pl-2 pr-4 text-sm text-ink/80"
            >
              <span className="relative grid size-5 place-items-center">
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand/40" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              Your AI travel concierge
            </motion.div>

            <h1 className="display text-[clamp(3.4rem,13vw,5.6rem)] leading-[0.88] text-ink lg:text-[clamp(4.2rem,calc(9.3vw_-_19px),8.4rem)]">
              <span className="block">
                <SplitText text="Plan less." trigger="mount" ready={intro.ready} delay={delay + 0.15} />
              </span>
              <span className="block">
                <SplitText
                  segments={[{ text: "Wander ", className: "italic text-brand" }, { text: "more." }]}
                  trigger="mount"
                  ready={intro.ready}
                  delay={delay + 0.3}
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: delay + 0.55 }}
              className="mt-7 max-w-[34rem] text-lg leading-relaxed text-stone sm:text-xl"
            >
              Tell GoRoam where you&apos;re dreaming of. In seconds you&apos;ll have a day-by-day itinerary — real places,
              honest budgets and the quiet corners guidebooks forget.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: delay + 0.7 }}
              className="mt-9 max-w-[36rem]"
            >
              <TripPrompt
                quickPicks={[
                  { label: "Kyoto", value: "Kyoto, Japan" },
                  { label: "Santorini", value: "Santorini, Greece" },
                  { label: "Rome", value: "Rome, Italy" },
                  { label: "Bali", value: "Bali, Indonesia" },
                ]}
              />
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={intro.ready ? { opacity: 1 } : undefined}
              transition={{ duration: 1.2, delay: delay + 0.95 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone"
            >
              {["First trip free", "No card needed", "Ready in seconds"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-brand" /> {t}
                </li>
              ))}
            </motion.ul>
          </div>
        </motion.div>

        {/* Desktop arch anchor: caption, moment card and badge float around it. */}
        <motion.div style={{ opacity: chromeOpacity }} className="hero-arch pointer-events-none z-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={intro.ready ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1.2, ease, delay: delay + 0.9 }}
            className={cn("pointer-events-auto absolute -left-16 bottom-10 w-[17.5rem] rounded-3xl border border-white/60 bg-paper/95 p-5 shadow-[0_30px_70px_-35px_rgba(21,19,15,0.55)]", expanded && "pointer-events-none")}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow text-stone">Now showing</span>
              <span className="eyebrow text-ink/70">
                {pad(index + 1)} / {pad(HERO_SEQUENCE.length)}
              </span>
            </div>
            <div className="mt-3 h-[2.4rem] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={dest.slug}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.8, ease }}
                  className="display text-[2.1rem] leading-[1.1] text-ink"
                >
                  {dest.name}
                </motion.p>
              </AnimatePresence>
            </div>
            <p className="mt-0.5 text-sm text-stone">{dest.place}</p>
            <ScrambleText text={formatCoords(dest.lat, dest.lng)} className="mt-3 block font-mono text-[11px] tracking-wide text-ink/60" />
            <div className="mt-4 flex items-center gap-3">
              <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  key={`${index}-${cycle}`}
                  className="hero-progress h-full w-full origin-left rounded-full bg-brand"
                  style={{ animationDuration: `${SLIDE_MS}ms`, animationDelay: firstSlide ? `${delay}s` : "0s" }}
                />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous destination"
                  onClick={() => go(-1)}
                  className="grid size-7 place-items-center rounded-full border border-line text-ink/70 transition-colors hover:bg-ink hover:text-paper"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Next destination"
                  onClick={() => go(1)}
                  className="grid size-7 place-items-center rounded-full border border-line text-ink/70 transition-colors hover:bg-ink hover:text-paper"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={intro.ready ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1.2, ease, delay: delay + 1.05 }}
            className="absolute -right-8 top-[16%] hidden xl:block"
          >
            <div className="animate-float flex w-[17rem] items-center gap-3 rounded-2xl border border-white/60 bg-paper/95 p-3 pr-4 shadow-[0_24px_60px_-30px_rgba(21,19,15,0.5)]">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dest.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease }}
                  className="min-w-0"
                >
                  <p className="eyebrow text-stone">Day 1 · {dest.moment.slot}</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-ink">{dest.moment.title}</p>
                  <p className="text-xs text-stone">{dest.moment.time}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
            animate={intro.ready ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
            transition={{ duration: 1.4, ease, delay: delay + 1.15 }}
            className="absolute -left-[66px] top-[7%]"
          >
            <RotatingBadge />
          </motion.div>
        </motion.div>

        {/* The scene window: an arch on load that opens to full-bleed as you scroll. */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.4, ease, delay: delay + 0.35 }}
          className="hero-frame relative mx-4 mt-12 h-[66svh] min-h-[420px] overflow-hidden rounded-b-[28px] rounded-t-[999px] bg-paper-2 sm:mx-8 lg:absolute lg:inset-0 lg:m-0 lg:h-auto lg:min-h-0 lg:rounded-none"
        >
          <div className="hero-frame-inner absolute inset-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={dest.slug}
                className="absolute inset-0"
                initial={{ opacity: 0, zIndex: 2 }}
                animate={{ opacity: 1, zIndex: 2, transition: { duration: 1.2, ease: "easeOut" } }}
                exit={{ opacity: 1, zIndex: 1, transition: { duration: 1.3 } }}
              >
                <Scene id={dest.scene} intro interactive paused={moving} title={`${dest.name}, ${dest.place}`} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* mobile caption */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/60 to-transparent p-5 pt-16 text-paper lg:hidden">
            <p className="eyebrow text-paper/70">
              {pad(index + 1)} / {pad(HERO_SEQUENCE.length)} · {dest.place}
            </p>
            <p className="display mt-2 text-3xl">{dest.name}</p>
          </div>

          {/* desktop manifesto over the opened scene */}
          <motion.div style={{ opacity: overlayOpacity }} className="pointer-events-none absolute inset-0 z-10 hidden bg-[radial-gradient(ellipse_at_center,rgba(21,19,15,0.62),rgba(21,19,15,0.42))] lg:block" />
          <motion.div style={{ opacity: manifestoOpacity }} className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center lg:flex">
            <div className="container-x max-w-6xl text-center">
              <p className="eyebrow mb-8 text-paper/70">(01) — Why GoRoam</p>
              <ScrollWords
                tokens={[MANIFESTO]}
                progress={manifesto}
                dim={0.18}
                className="display text-[clamp(2.4rem,4.2vw,4.4rem)] leading-[1.08] text-paper"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: chromeOpacity }}
          className="hero-cue pointer-events-none absolute bottom-8 z-10 hidden items-center gap-3 lg:flex"
        >
          <span className="relative h-10 w-px overflow-hidden bg-ink/15">
            <span className="hero-scroll-line absolute inset-x-0 top-0 h-1/2 bg-ink" />
          </span>
          <span className="eyebrow text-stone">Scroll to explore</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
