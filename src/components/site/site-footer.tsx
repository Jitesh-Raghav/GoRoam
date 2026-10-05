"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowUpRight, Github, Instagram, Linkedin, Moon, Sparkles, Sun, Twitter, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { getLenis } from "@/components/motion/smooth-scroll";
import { getMonument, type MonumentId } from "@/components/scenes/monuments";
import { DESTINATIONS } from "@/lib/destinations";
import { parseTripPrompt, plannerHref } from "@/lib/prompt-parse";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { BalloonSticker, CameraSticker, CompassSticker, PalmSticker, PinSticker, PostcardSticker, StampSticker, TagSticker } from "./footer-stickers";

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
            <h2 className="display mt-4 text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[0.92]">
              Your next trip is <span className="italic text-brand-2">one sentence</span> away.
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
    ],
  },
];

const SOCIAL: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "X (Twitter)", href: "https://x.com/goroamapp", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/goroamapp", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/goroam", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/goroam", icon: Github },
];

/* -------------------------------------------------------------------------- */
/*                                  Wordmark                                  */
/* -------------------------------------------------------------------------- */

/** The giant GoRoam: letters rise in, a sheen sweeps across, and a spotlight follows the pointer. */
function Wordmark({ letterRef }: { letterRef?: (i: number, el: HTMLSpanElement | null) => void }) {
  const word = "GoRoam".split("");
  // The spotlight layer is fixed to the viewport, so it takes viewport coordinates.
  const move = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--fx", `${e.clientX}px`);
    e.currentTarget.style.setProperty("--fy", `${e.clientY}px`);
    e.currentTarget.style.setProperty("--fo", "1");
  };
  return (
    <div
      onPointerMove={move}
      onPointerLeave={(e) => e.currentTarget.style.setProperty("--fo", "0")}
      aria-hidden
      className="footer-wordmark relative flex select-none justify-center overflow-hidden"
    >
      {word.map((ch, i) => (
        <motion.span
          key={i}
          ref={(el) => letterRef?.(i, el)}
          initial={{ y: "70%" }}
          whileInView={{ y: "22%" }}
          whileHover={{ y: "14%" }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.4, ease, delay: i * 0.06 }}
          className="display footer-letter text-[26vw] leading-[0.8]"
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

type Sticker = { id: string; Art: (p: { className?: string }) => React.ReactElement; left: string; top: string; size: string; rot: number; depth: number; dur: number; phone?: boolean };

/* Positions are percentages of the finale, so the arrangement holds at every width. */
const STICKERS: Sticker[] = [
  { id: "stamp", Art: StampSticker, left: "3%", top: "6%", size: "w-[17vw] sm:w-[9vw]", rot: -14, depth: 14, dur: 6.4, phone: true },
  { id: "tag", Art: TagSticker, left: "22%", top: "-2%", size: "w-[21vw] sm:w-[10.5vw]", rot: 6, depth: 9, dur: 7.2, phone: true },
  { id: "balloon", Art: BalloonSticker, left: "47%", top: "-6%", size: "w-[13vw] sm:w-[6.5vw]", rot: -4, depth: 20, dur: 8, phone: true },
  { id: "compass", Art: CompassSticker, left: "64%", top: "8%", size: "w-[8vw] sm:w-[6vw]", rot: 8, depth: 11, dur: 6.8 },
  { id: "postcard", Art: PostcardSticker, left: "79%", top: "3%", size: "w-[20vw] sm:w-[11vw]", rot: 9, depth: 15, dur: 7.6, phone: true },
  { id: "palm", Art: PalmSticker, left: "0.5%", top: "46%", size: "w-[8vw] sm:w-[7vw]", rot: -6, depth: 7, dur: 9 },
  { id: "camera", Art: CameraSticker, left: "91%", top: "50%", size: "w-[8vw] sm:w-[7vw]", rot: 12, depth: 10, dur: 7 },
];

/**
 * The footer's last flourish: travel stickers bob around the wordmark and lean
 * towards the pointer, a paper plane loops through the letters, and a pin drops
 * onto the "o" to say you are here.
 */
function Finale() {
  const ref = useRef<HTMLDivElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [box, setBox] = useState<{ w: number; h: number; pin: { x: number; y: number } | null }>({ w: 0, h: 0, pin: null });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const o = letters.current[1];
      let pin = null;
      if (o) {
        const a = el.getBoundingClientRect();
        const wm = o.parentElement!.getBoundingClientRect();
        // Layout box, not the animated transform: the letter settles 22% down.
        pin = { x: wm.left - a.left + o.offsetLeft + o.offsetWidth / 2, y: wm.top - a.top + o.offsetTop + o.offsetHeight * 0.5 };
      }
      setBox({ w: el.clientWidth, h: el.clientHeight, pin });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const untilt = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--px", "0");
    e.currentTarget.style.setProperty("--py", "0");
  };

  const { w, h } = box;
  const weave = w ? `M ${-0.06 * w} ${0.3 * h} C ${0.12 * w} ${0.02 * h}, ${0.22 * w} ${0.95 * h}, ${0.38 * w} ${0.66 * h} S ${0.6 * w} ${0.12 * h}, ${0.7 * w} ${0.58 * h} S ${0.9 * w} ${0.92 * h}, ${1.06 * w} ${0.22 * h}` : "";

  return (
    <div ref={ref} onPointerMove={tilt} onPointerLeave={untilt} className="relative pt-[30vw] sm:pt-[14vw]" style={{ ["--px" as string]: 0, ["--py" as string]: 0 }}>
      <Wordmark letterRef={(i, el) => (letters.current[i] = el)} />

      {/* The paper plane's dashed loop through the letters. */}
      {w > 0 && (
        <svg viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute inset-0 z-10 size-full overflow-visible" aria-hidden>
          <motion.path d={weave} fill="none" stroke="#F4F8F9" strokeOpacity={0.28} strokeWidth={1.4} strokeDasharray="4 8" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : undefined} transition={{ duration: 2.4, ease, delay: 0.6 }} />
          {inView && !reduce && (
            <g className="footer-weave" style={{ offsetPath: `path("${weave}")` }}>
              <path d="M-40 0H-4" stroke="#34D1BF" strokeOpacity={0.7} strokeWidth={1.6} strokeDasharray="2 4" />
              <path d="M14 0L-10 -9L-6 -1L-18 -4L-14 0L-18 4L-6 1L-10 9Z" fill="#F4F8F9" stroke="#0A1E2C" strokeOpacity={0.3} strokeWidth={0.8} strokeLinejoin="round" />
              <path d="M14 0L-6 -1L-10 9Z" fill="#CFE3E6" />
            </g>
          )}
        </svg>
      )}

      {STICKERS.map((s, i) => (
        <motion.div
          key={s.id}
          aria-hidden
          initial={{ opacity: 0, y: 40, scale: 0.5, rotate: s.rot - 25 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1, rotate: s.rot } : undefined}
          transition={{ type: "spring", stiffness: 140, damping: 13, delay: 0.3 + i * 0.12 }}
          className={cn("pointer-events-none absolute z-20", s.size, !s.phone && "hidden sm:block")}
          style={{ left: s.left, top: s.top }}
        >
          <div
            className="transition-transform duration-700 ease-out-expo"
            style={{ transform: `translate3d(calc(var(--px) * ${s.depth}px), calc(var(--py) * ${s.depth * 0.7}px), 0) rotate(calc(var(--px) * ${s.depth * 0.4}deg))` }}
          >
            <div className="sticker-bob drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)]" style={{ animationDuration: `${s.dur}s`, animationDelay: `${-i * 1.3}s` }}>
              <s.Art className="h-auto w-full" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* "You are here", dropped onto the o. */}
      {box.pin && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: -160 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 1.6 }}
          className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: box.pin.x, top: box.pin.y }}
        >
          <span className="mb-1 whitespace-nowrap rounded-full bg-paper px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink shadow-lg sm:text-[11px]">You are here</span>
          <PinSticker className="h-auto w-[7vw] drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] sm:w-[3.2vw]" />
          <span className="footer-pin-pulse absolute -bottom-1 left-1/2 h-2 w-8 -translate-x-1/2 rounded-[50%] bg-sun/50" />
        </motion.div>
      )}
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
              href="https://x.com/compose/tweet?text=I%27ve%20been%20using%20%23GoRoam%20for%20travel%20planning%2C%20check%20it%20out!%20%40goroamapp"
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
        <p>© {new Date().getFullYear()} GoRoam. All rights reserved. Made for the curious.</p>
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

      <Finale />
    </footer>
  );
}
