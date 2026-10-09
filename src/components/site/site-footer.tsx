"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowUpRight, Compass, Github, Mail, Moon, Sparkles, Sun, Twitter, type LucideIcon } from "@/components/site/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getLenis } from "@/components/motion/smooth-scroll";
import { getMonument, type MonumentId } from "@/components/scenes/monuments";
import { DESTINATIONS } from "@/lib/destinations";
import { parseTripPrompt, plannerHref } from "@/lib/prompt-parse";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const ease = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*                                   Skyline                                  */
/* -------------------------------------------------------------------------- */

const SKYLINE: { id: MonumentId; s: number }[] = [
  { id: "pyramids", s: 0.4 },
  { id: "colosseum", s: 0.6 },
  { id: "eiffel", s: 0.36 },
  { id: "bigben", s: 0.34 },
  { id: "taj", s: 0.36 },
  { id: "burj", s: 0.4 },
  { id: "pagoda", s: 0.38 },
  { id: "angkor", s: 0.42 },
  { id: "opera", s: 0.42 },
  { id: "liberty", s: 0.35 },
  { id: "goldengate", s: 0.32 },
];

const BASE = 250;
const HEIGHT = 262;
const GAP = 46;

const layout = (() => {
  let x = 20;
  const items = SKYLINE.map(({ id, s }) => {
    const m = getMonument(id);
    const w = m.width * s;
    const cx = x + w / 2;
    x += w + GAP;
    return { id, s, cx, ground: m.ground, layers: m.layers.filter((l) => !l.noLine) };
  });
  return { items, width: Math.round(x - GAP + 20) };
})();

// The flight path: a long, lazy arc over the whole skyline.
const W = layout.width;
const ROUTE = `M ${W * 0.02} 150 C ${W * 0.25} 10, ${W * 0.62} 0, ${W * 0.98} 120`;

// Deterministic stars, so server and client agree.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
  // Rounded: the sine hash differs in its last digits between server and browser.
  const q = (v: number) => Math.round(v * 10) / 10;
  return { x: q(r(1) * W), y: q(8 + r(2) * 150), s: q(0.6 + r(3) * 1.4), d: q(r(4) * 4) };
});

/** The monuments draw themselves in once the footer is in view, then a plane loops over them. */
function Skyline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const n = layout.items.length;

  return (
    <div ref={ref} className="container-x relative pt-16 sm:pt-20">
      <svg viewBox={`0 0 ${W} ${HEIGHT}`} className="w-full overflow-visible text-paper/45" aria-hidden>
        <defs>
          <radialGradient id="ft-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4DC" />
            <stop offset="60%" stopColor="#FFE2A8" />
            <stop offset="100%" stopColor="#FFC876" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ft-trail" x1="0" x2="1">
            <stop offset="0%" stopColor="#34D1BF" stopOpacity="0" />
            <stop offset="100%" stopColor="#34D1BF" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#F4F8F9" className={reduce ? "opacity-40" : "footer-twinkle"} style={{ animationDelay: `${s.d}s` }} />
        ))}

        {/* The moon rises behind the skyline */}
        <motion.g initial={{ y: 70, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : undefined} transition={{ duration: 2.4, ease, delay: 0.4 }}>
          <circle cx={W * 0.72} cy={92} r={58} fill="url(#ft-moon)" opacity={0.35} />
          <circle cx={W * 0.72} cy={92} r={22} fill="#FFF1D6" />
          <circle cx={W * 0.72 + 7} cy={86} r={4} fill="#F2DDB3" />
          <circle cx={W * 0.72 - 6} cy={98} r={2.6} fill="#F2DDB3" />
        </motion.g>

        {/* Monuments, drawn one after another */}
        {layout.items.map((item, i) => (
          <g key={item.id} transform={`translate(${item.cx.toFixed(1)} ${(BASE - item.ground * item.s).toFixed(1)}) scale(${item.s})`}>
            {item.layers.map((l, k) => (
              <motion.path
                key={k}
                d={l.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.3 / item.s}
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : undefined}
                transition={{ duration: 1.8, ease: "easeInOut", delay: 0.15 + (i / n) * 1.6 }}
              />
            ))}
          </g>
        ))}
        <motion.path d={`M0 ${BASE}H${W}`} stroke="currentColor" strokeWidth={1.3} initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : undefined} transition={{ duration: 2.2, ease }} />

        {/* Flight path and plane */}
        <motion.path d={ROUTE} fill="none" stroke="#F4F8F9" strokeOpacity={0.22} strokeWidth={1.2} strokeDasharray="3 7" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : undefined} transition={{ duration: 2.6, ease, delay: 1.2 }} />
        {inView && !reduce && (
          <g className="footer-plane" style={{ offsetPath: `path("${ROUTE}")` }}>
            <path d="M-34 0H0" stroke="url(#ft-trail)" strokeWidth={1.6} />
            <path d="M8 0L-6 -5L-4 -1L-12 -9L-15 -9L-10 0L-15 9L-12 9L-4 1L-6 5Z" fill="#F4F8F9" />
          </g>
        )}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                World clocks                                */
/* -------------------------------------------------------------------------- */

const CLOCKS = [
  { city: "Paris", tz: "Europe/Paris" },
  { city: "Agra", tz: "Asia/Kolkata" },
  { city: "Kyoto", tz: "Asia/Tokyo" },
  { city: "New York", tz: "America/New_York" },
  { city: "Rio", tz: "America/Sao_Paulo" },
];

function WorldClocks() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <ul className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
      {CLOCKS.map((c) => {
        const hour = now ? Number(new Intl.DateTimeFormat("en-GB", { timeZone: c.tz, hour: "2-digit", hourCycle: "h23" }).format(now)) : 12;
        const day = hour >= 6 && hour < 19;
        const Icon = day ? Sun : Moon;
        return (
          <li key={c.city} className="group rounded-2xl bg-paper/[0.04] px-3 py-3 ring-1 ring-inset ring-paper/[0.06] transition-colors hover:bg-paper/[0.08]">
            <p className="eyebrow flex items-center justify-between gap-1.5 text-[0.58rem] text-paper/45">
              <span className="truncate">{c.city}</span>
              <Icon className={cn("size-3 shrink-0 transition-transform duration-700 group-hover:rotate-45", day ? "text-sun-2" : "text-brand-2")} />
            </p>
            <p className="mt-2 flex items-baseline gap-1 font-mono text-lg tabular-nums text-paper/90">
              {now ? new Intl.DateTimeFormat("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit" }).format(now) : "--:--"}
              <span className={cn("size-1 rounded-full bg-brand-2 transition-opacity", now && now.getSeconds() % 2 ? "opacity-100" : "opacity-20")} />
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Closing CTA                                */
/* -------------------------------------------------------------------------- */

const IDEAS = ["A slow week in Kyoto", "Bali with friends", "Rome for food", "Iceland road trip"];

function ClosingPrompt() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [shake, setShake] = useState(0);
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % DESTINATIONS.length), 3400);
    return () => window.clearInterval(t);
  }, []);
  const go = (value: string) => {
    const t = value.trim();
    if (!t) return setShake((s) => s + 1);
    const parsed = parseTripPrompt(t);
    router.push(plannerHref(parsed.destination || t.split(/\s+/).length > 3 ? parsed : { ...parsed, destination: t }));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    go(text);
  };
  const d = DESTINATIONS[i];

  return (
    <div className="container-x relative pt-20 sm:pt-28">
      <div className="relative overflow-hidden rounded-[32px] bg-paper/[0.04] p-7 ring-1 ring-inset ring-paper/10 sm:p-12">
        <div className="pointer-events-none absolute -left-24 -top-32 size-96 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 size-96 rounded-full bg-sun/15 blur-3xl" />
        <div className="relative grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <p className="eyebrow flex items-center gap-2 text-paper/50">
              <Sparkles className="size-3.5 text-sun-2" /> Ready when you are
            </p>
            <h2 className="display mt-4 text-[clamp(2.21rem,4.59vw,3.91rem)] leading-[0.92]">
              Your next trip is <span className="accent">one sentence</span> away.
            </h2>
            <p className="mt-5 flex h-6 min-w-0 items-center gap-2 overflow-hidden text-sm text-paper/55">
              <span className="shrink-0">Trending now:</span>
              <AnimatePresence mode="wait">
                <motion.span key={d.slug} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.45, ease }} className="truncate text-paper/85">
                  {d.name}, {d.place.split(",").pop()?.trim()} · best {d.bestTime}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>
          <div className="min-w-0 lg:col-span-6">
            <motion.form key={shake} onSubmit={submit} animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.4 }} className="group flex items-center gap-2 rounded-full bg-paper p-1.5 pl-5 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] ring-1 ring-paper/20 focus-within:ring-4 focus-within:ring-brand-2/40">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="10 days in Japan in spring, food and temples…" className="min-w-0 flex-1 bg-transparent py-3 text-[0.98rem] outline-none placeholder:text-stone-2" aria-label="Describe your trip" />
              <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-brand">
                Plan it <ArrowRight className="size-4 transition-transform duration-500 group-focus-within:translate-x-0.5" />
              </button>
            </motion.form>
            <div className="mt-4 flex flex-wrap gap-2">
              {IDEAS.map((idea) => (
                <button key={idea} type="button" onClick={() => go(idea)} className="rounded-full px-3.5 py-1.5 text-xs text-paper/70 ring-1 ring-inset ring-paper/15 transition-colors hover:bg-paper hover:text-ink">
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Columns                                  */
/* -------------------------------------------------------------------------- */

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Plan a trip", href: "/dashboard" },
      { label: "Destinations", href: "/#wonders" },
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/auth" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "My itineraries", href: "/dashboard/itineraries" },
      { label: "Travel packages", href: "/dashboard/packages" },
      { label: "Buy credits", href: "/dashboard/credits" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund policy", href: "/refunds" },
      { label: "Contact us", href: "/contact" },
      { label: "Cookies & analytics", href: "/privacy#analytics" },
    ],
  },
];

const SOCIAL: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "X (Twitter): @okayjitesh", href: "https://x.com/okayjitesh", icon: Twitter },
  { label: "Email jitesh@goroam.world", href: "mailto:jitesh@goroam.world", icon: Mail },
  { label: "Maker's portfolio", href: "https://jiteshraghav.xyz", icon: Compass },
  { label: "GitHub", href: "https://github.com/Jitesh-Raghav", icon: Github },
];

/* -------------------------------------------------------------------------- */
/*                               Harbour plate                                */
/* -------------------------------------------------------------------------- */

/** The plate's line colour: a dim sea-teal, so the harbour reads as quiet texture. */
const PLATE_LINE = "#5E8790";
/** The wordmark's: the theme's warm gold, like gilt engraved lettering. */
const WORDMARK = "#FFC876";
const PLATE_BG = "#0A1E2C";

/** A harbour ferry in the plate's engraved style, bow to the right. */
function Ferry() {
  return (
    <g stroke={PLATE_LINE} strokeWidth={1.1} strokeLinejoin="round">
      <path d="M-62 0H60L50 13H-54Z" fill={PLATE_BG} />
      <path d="M-58 4H56M-56 8H53" strokeWidth={0.8} />
      <path d="M-46 -15H42V0H-46Z" fill={PLATE_BG} />
      <path d="M-42 -9H38" strokeWidth={0.8} strokeDasharray="3 2.4" />
      <path d="M-28 -26H24V-15H-28Z" fill={PLATE_BG} />
      <path d="M-24 -21H20" strokeWidth={0.8} strokeDasharray="2.6 2.2" />
      <path d="M2 -38H12V-26H2Z" fill={PLATE_BG} />
      <path d="M4 -36V-27M7 -36V-27M10 -36V-27" strokeWidth={0.7} />
      {/* Wake */}
      <path d="M-66 12q-30 3 -70 1M-64 16q-40 4 -96 2M-60 20q-30 2 -60 1" strokeWidth={0.8} fill="none" />
    </g>
  );
}

/** A small sloop with hatched sails. */
function Sailboat() {
  return (
    <g stroke={PLATE_LINE} strokeWidth={1.1} strokeLinejoin="round">
      <path d="M-30 0H32L24 9H-24Z" fill={PLATE_BG} />
      <path d="M0 -2V-74" />
      <path d="M2 -70L30 -6H2Z" fill={PLATE_BG} />
      <path d="M-2 -64L-26 -6H-2Z" fill={PLATE_BG} />
      <path d="M6 -56V-6M10 -46V-6M14 -38V-6M18 -28V-6M22 -20V-6" strokeWidth={0.75} />
      <path d="M-6 -50V-6M-10 -40V-6M-14 -30V-6" strokeWidth={0.75} />
      <path d="M-34 12q20 3 70 0" strokeWidth={0.8} fill="none" />
    </g>
  );
}

/**
 * The footer's closing plate: Sydney Harbour by moonlight, engraved as dim teal
 * lines in the footer's ink, under a gilt "GoRoam". The plate is a static SVG
 * (generated by scripts/art/harbour-engraving.mjs); ferries, a sailboat and
 * glints on the moon's path move over it. It inks in from the left on view.
 */
function HarbourPlate() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  // The wordmark rises from behind the harbour as the plate scrolls into view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const rise = useTransform(scrollYProgress, [0, 0.8], reduce ? [0, 0] : [90, 0]);
  const glints = [
    [1300, 650, 16],
    [1560, 676, 20],
    [1640, 708, 24],
    [760, 690, 18],
  ];
  return (
    <div ref={ref} className="relative border-t border-paper/10 pt-12 sm:pt-16">
      <motion.div
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : undefined}
        transition={{ duration: 2.4, ease }}
        className="relative aspect-[12/5] overflow-hidden sm:aspect-[3/1]"
      >
        {/* Behind the plate: a giant gilt-engraved "GoRoam", its feet tucked behind the city and the water. */}
        <svg viewBox="0 0 2400 800" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          <defs>
            <pattern id="wordmark-hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
              {/* A faint gilt wash under the hairlines keeps the letters golden even when they're small. */}
              <rect width="4.5" height="4.5" fill={WORDMARK} fillOpacity={0.14} />
              <path d="M0 2.25H4.5" stroke={WORDMARK} strokeWidth={1.1} />
            </pattern>
          </defs>
          <motion.g style={{ y: rise }}>
            <text
              x={1212}
              y={532}
              textAnchor="middle"
              textLength={1700}
              lengthAdjust="spacingAndGlyphs"
              fontSize={540}
              style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 600, letterSpacing: "-0.04em" }}
            >
              {/* An offset outline first, like the shadow line of an engraved letter. */}
              <tspan fill="none" stroke={WORDMARK} strokeWidth={1.2} strokeOpacity={0.35}>
                GoRoam
              </tspan>
            </text>
            <text
              x={1200}
              y={520}
              textAnchor="middle"
              textLength={1700}
              lengthAdjust="spacingAndGlyphs"
              fontSize={540}
              fill="url(#wordmark-hatch)"
              stroke={WORDMARK}
              strokeWidth={1.8}
              style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 600, letterSpacing: "-0.04em" }}
            >
              GoRoam
            </text>
          </motion.g>
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element -- a static vector plate, already sized */}
        <img
          src="/art/harbour-engraving.svg"
          alt="Sydney Harbour by moonlight, engraved: the Harbour Bridge, the Opera House and the city skyline, with Fort Denison and trees on both shores."
          loading="lazy"
          decoding="async"
          width={2400}
          height={800}
          className="absolute inset-0 size-full object-cover"
        />
        {!reduce && (
          <svg viewBox="0 0 2400 800" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
            <g className="plate-ferry-a">
              <g transform="translate(520 676)">
                <Ferry />
              </g>
            </g>
            <g className="plate-ferry-b">
              <g transform="translate(1500 734) scale(-1.25 1.25)">
                <Ferry />
              </g>
            </g>
            <g transform="translate(1010 712)">
              <g className="plate-bob">
                <Sailboat />
              </g>
            </g>
            {glints.map(([x, y, l], i) => (
              <path key={i} d={`M${x} ${y}h${l}`} stroke={PLATE_LINE} strokeWidth={1.4} strokeLinecap="round" className="plate-glint" style={{ animationDelay: `${i * 0.7}s` }} />
            ))}
          </svg>
        )}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Back to top                                */
/* -------------------------------------------------------------------------- */

function BackToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const top = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button type="button" onClick={top} aria-label="Back to top" className="group relative grid size-14 place-items-center rounded-full text-paper transition-colors hover:text-ink">
      <span className="absolute inset-1 rounded-full bg-paper/[0.06] transition-colors duration-500 group-hover:bg-paper" />
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1.5} />
        <motion.circle cx="28" cy="28" r="26" fill="none" stroke="#34D1BF" strokeWidth={1.5} strokeLinecap="round" style={{ pathLength: progress }} />
      </svg>
      <ArrowUp className="relative size-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      {/* Rails, as on the rest of the landing page */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="container-x relative h-full">
          <span className="absolute inset-y-0 w-px bg-paper/[0.06]" style={{ left: "clamp(1rem,4vw,3rem)" }} />
          <span className="absolute inset-y-0 w-px bg-paper/[0.06]" style={{ right: "clamp(1rem,4vw,3rem)" }} />
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[70%] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />

      <ClosingPrompt />
      <Skyline />

      <div className="container-x relative grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo tone="paper" />
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-paper/60">AI-crafted itineraries for the curious. Real places, honest budgets, beautifully paced days.</p>
          <WorldClocks />
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid size-11 place-items-center rounded-full text-paper/75 ring-1 ring-inset ring-paper/15 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:rotate-[-8deg] hover:bg-paper hover:text-ink"
              >
                <s.icon className="size-4" />
              </a>
            ))}
            <a
              href="https://x.com/compose/tweet?text=I%27ve%20been%20planning%20trips%20with%20GoRoam%2C%20check%20it%20out%3A%20https%3A%2F%2Fgoroam.world%20%40okayjitesh"
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-paper/70 ring-1 ring-inset ring-paper/15 transition-colors hover:bg-paper hover:text-ink"
            >
              Share your journey <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {COLUMNS.map((col, c) => (
            <motion.div key={col.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, ease, delay: c * 0.08 }}>
              <p className="eyebrow text-paper/45">{col.title}</p>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group relative inline-flex items-center gap-1.5 text-paper/80 transition-colors hover:text-paper">
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-brand-2 transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                      </span>
                      <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container-x relative flex flex-col gap-5 border-t border-paper/10 py-7 text-sm text-paper/45 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p>© {new Date().getFullYear()} GoRoam. All rights reserved.</p>
          <p className="text-xs leading-relaxed text-paper/40">
            Operated by{" "}
            <a href="https://jiteshraghav.xyz" target="_blank" rel="noreferrer" className="text-paper/60 hover:text-paper">
              Jitesh Raghav
            </a>{" "}
            · Gurgaon, India ·{" "}
            <a href="mailto:jitesh@goroam.world" className="text-paper/60 hover:text-paper">
              jitesh@goroam.world
            </a>{" "}
            · Payments processed by Dodo Payments, our merchant of record.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-2/60" />
              <span className="relative size-2 rounded-full bg-brand-2" />
            </span>
            All systems go
          </span>
          <BackToTop />
        </div>
      </div>

      <HarbourPlate />
    </footer>
  );
}
