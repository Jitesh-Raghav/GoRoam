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
import { ArrowLeft, ArrowRight, Check, Moon, Sun, Sunrise } from "@/components/site/icons";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MANIFESTO } from "@/lib/copy";
import { HERO_SEQUENCE, formatCoords } from "@/lib/destinations";
import { Scene } from "@/components/scenes/scene";
import { ScrambleText } from "@/components/motion/scramble-text";
import { ScrollWords } from "@/components/motion/scroll-words";
import { SplitText } from "@/components/motion/split-text";
import { PillLink } from "@/components/site/pill";
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

const STAMP_INKS = ["#0B8278", "#16324A", "#B23A2B", "#A8631A"];
const STAMP_TILTS = [-12, 9, -6, 14, -9, 5, -14, 11];
const MINI_PLANE =
  "M38 0C38 -3 35 -5 30 -5L10 -5L-8 -32L-18 -32L-6 -5L-24 -5L-31 -15L-38 -15L-34 0L-38 15L-31 15L-24 5L-6 5L-18 32L-8 32L10 5L30 5C35 5 38 3 38 0Z";

/**
 * A passport page that gets stamped for every wonder the hero visits: an inked
 * arrival stamp (city code, country, plane) thumps down, slightly askew, in a new ink.
 */
function PassportStamp({ dest, index }: { dest: (typeof HERO_SEQUENCE)[number]; index: number }) {
  const u = useId().replace(/:/g, "");
  const ink = STAMP_INKS[index % STAMP_INKS.length];
  const tilt = STAMP_TILTS[index % STAMP_TILTS.length];
  const country = (dest.place.split(",").pop() ?? "").trim().toUpperCase();

  return (
    <div className="relative size-[140px] rounded-full bg-[#FBFAF5] shadow-[0_26px_50px_-24px_rgba(10,30,44,0.6)] ring-[5px] ring-paper">
      {/* The page: faint security guilloche. */}
      <svg viewBox="0 0 120 120" className="absolute inset-0" aria-hidden>
        {[18, 26, 34, 42, 50, 56].map((r) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#0B8278" strokeOpacity="0.07" strokeDasharray="1.5 2.5" />
        ))}
      </svg>
      <AnimatePresence initial={false}>
        <motion.div
          key={`${dest.slug}-ring`}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${ink}` }}
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 0.9, ease, delay: 0.12 }}
        />
        <motion.svg
          key={dest.slug}
          viewBox="0 0 120 120"
          className="absolute inset-0"
          role="img"
          aria-label={`Passport stamp: ${dest.name}, ${dest.place}`}
          initial={{ opacity: 0, scale: 1.8, rotate: tilt - 16 }}
          animate={{ opacity: 0.96, scale: 1, rotate: tilt }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3 } }}
          transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.9 }}
        >
          <defs>
            <path id={`${u}-top`} d="M24,60 a36,36 0 1,1 72,0" />
            <path id={`${u}-bottom`} d="M19,60 a41,41 0 0,0 82,0" />
            {/* Worn, uneven ink. */}
            <filter id={`${u}-ink`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.05 1.5" result="speckle" />
              <feComposite in="SourceGraphic" in2="speckle" operator="in" />
            </filter>
          </defs>
          <g filter={`url(#${u}-ink)`} fill={ink}>
            <circle cx="60" cy="60" r="50" fill="none" stroke={ink} strokeWidth="3.2" />
            <circle cx="60" cy="60" r="46" fill="none" stroke={ink} strokeWidth="1.1" />
            <circle cx="60" cy="60" r="30" fill="none" stroke={ink} strokeWidth="1.3" />
            <text className="font-mono" fontSize="6.8" fontWeight="600" letterSpacing="1.6">
              <textPath href={`#${u}-top`} startOffset="50%" textAnchor="middle">
                {country}
              </textPath>
            </text>
            <text className="font-mono" fontSize="5.6" fontWeight="600" letterSpacing="1.4">
              <textPath href={`#${u}-bottom`} startOffset="50%" textAnchor="middle">
                ARRIVED · GOROAM
              </textPath>
            </text>
            <path d="M14.5 60l1.6-1.1 1.6 1.1-1.6 1.1zM102.3 60l1.6-1.1 1.6 1.1-1.6 1.1z" />
            <path d={MINI_PLANE} transform="translate(60 44) rotate(-90) scale(0.13)" />
            <text x="60" y="68" textAnchor="middle" fontSize="21" letterSpacing="0.5" stroke={ink} strokeWidth="0.35" style={{ fontFamily: "var(--font-inter-tight), sans-serif" }}>
              {dest.code}
            </text>
            <text x="60" y="79" textAnchor="middle" className="font-mono" fontSize="5" fontWeight="600" letterSpacing="1">
              {dest.moment.time}
            </text>
          </g>
        </motion.svg>
      </AnimatePresence>
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
    <section ref={sectionRef} className="relative lg:h-[270vh]" aria-label="Destinations showcase">
      <motion.div style={stageStyle} className="hero-stage relative overflow-hidden lg:sticky lg:top-0 lg:h-svh">
        {/* Copy */}
        <motion.div
          style={desktop ? { opacity: textOpacity, y: textY } : undefined}
          className="container-x relative z-10 pt-20 sm:pt-24 lg:flex lg:h-full lg:items-center lg:pt-10"
        >
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1, ease, delay: 0.1 }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-white/60 py-1.5 pl-2 pr-4 text-sm text-ink/80"
            >
              <span className="relative grid size-5 place-items-center">
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand/40" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              A window to anywhere
            </motion.div>

            <h2 className="display text-[clamp(2.89rem,11.05vw,4.76rem)] leading-[0.88] text-ink lg:text-[clamp(3.57rem,calc(7.91vw_-_16.15px),7.14rem)]">
              <span className="block">
                <SplitText text="Plan less." trigger="inView" delay={0.15} />
              </span>
              <span className="block">
                <SplitText
                  segments={[{ text: "Wander more.", className: "accent" }]}
                  trigger="inView"
                  delay={0.3}
                />
              </span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.1, ease, delay: 0.55 }}
              className="mt-7 max-w-[34rem] text-lg leading-relaxed text-stone sm:text-xl"
            >
              Tell GoRoam where you&apos;re dreaming of. In seconds you&apos;ll have a day-by-day itinerary: real places,
              honest budgets and the quiet corners guidebooks forget.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.1, ease, delay: 0.7 }}
              className="mt-9 max-w-[36rem]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <PillLink href="/dashboard" variant="ink" size="lg">
                  Start planning for free
                </PillLink>
                <Link href="/#how" className="group inline-flex items-center gap-2 px-2 text-sm text-ink/70 transition-colors hover:text-ink">
                  How it works <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.2, delay: 0.95 }}
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
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.2, ease, delay: 0.9 }}
            className={cn("pointer-events-auto absolute -left-16 bottom-10 w-[17.5rem] rounded-3xl border border-white/60 bg-paper/95 p-5 shadow-[0_30px_70px_-35px_rgba(10,30,44,0.55)]", expanded && "pointer-events-none")}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow text-stone">Now showing</span>
              <span className="eyebrow text-ink/70">
                {pad(index + 1)} / {pad(HERO_SEQUENCE.length)}
              </span>
            </div>
            {/* Positioned and clipped, so the outgoing name can't slide up over "Now showing". */}
            <div className="relative mt-3 h-[2.4rem] overflow-hidden [clip-path:inset(0)]">
              <AnimatePresence initial={false}>
                <motion.p
                  key={dest.slug}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.8, ease }}
                  className="display absolute inset-x-0 top-0 truncate whitespace-nowrap text-[1.7rem] leading-[1.2] text-ink"
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
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.2, ease, delay: 1.05 }}
            className="absolute -right-8 top-[16%] hidden xl:block"
          >
            <div className="animate-float flex w-[17rem] items-center gap-3 rounded-2xl border border-white/60 bg-paper/95 p-3 pr-4 shadow-[0_24px_60px_-30px_rgba(10,30,44,0.5)]">
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
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.4, ease, delay: 1.15 }}
            className="absolute -left-[66px] top-[7%]"
          >
            <PassportStamp dest={dest} index={index} />
          </motion.div>
        </motion.div>

        {/* The scene window: an arch on load that opens to full-bleed as you scroll. */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.4, ease, delay: 0.35 }}
          className="hero-frame relative mx-4 mt-12 h-[66svh] min-h-[26.25rem] overflow-hidden rounded-b-[28px] rounded-t-[999px] bg-paper-2 sm:mx-8 lg:absolute lg:inset-0 lg:m-0 lg:h-auto lg:min-h-0 lg:rounded-none"
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
            <p className="display mt-2 text-2xl">{dest.name}</p>
          </div>

          {/* desktop manifesto over the opened scene */}
          <motion.div style={{ opacity: overlayOpacity }} className="pointer-events-none absolute inset-0 z-10 hidden bg-[radial-gradient(ellipse_at_center,rgba(10,30,44,0.62),rgba(10,30,44,0.42))] lg:block" />
          <motion.div style={{ opacity: manifestoOpacity }} className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center lg:flex">
            <div className="container-x max-w-6xl text-center">
              <p className="eyebrow mb-8 text-paper/70">(01) / Why GoRoam</p>
              <ScrollWords
                tokens={[MANIFESTO]}
                progress={manifesto}
                dim={0.18}
                className="display text-[clamp(2.04rem,3.57vw,3.74rem)] leading-[1.08] text-paper"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: chromeOpacity }}
          className="hero-cue pointer-events-none absolute bottom-8 z-10 hidden items-center gap-3 lg:flex [@media(max-height:820px)]:!hidden"
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
