"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getMonument, type MonumentId } from "@/components/scenes/monuments";
import { Logo } from "./logo";

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
  return { items, width: x - GAP + 20 };
})();

function SkylineItem({ item, progress, index }: { item: (typeof layout.items)[number]; progress: MotionValue<number>; index: number }) {
  const n = layout.items.length;
  const start = (index / n) * 0.62;
  const draw = useTransform(progress, [start, start + 0.38], [0, 1]);
  return (
    <g transform={`translate(${item.cx.toFixed(1)} ${(BASE - item.ground * item.s).toFixed(1)}) scale(${item.s})`}>
      {item.layers.map((l, i) => (
        <motion.path key={i} d={l.d} fill="none" stroke="currentColor" strokeWidth={1.3 / item.s} strokeLinejoin="round" style={{ pathLength: draw }} />
      ))}
    </g>
  );
}

function Skyline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.55"] });
  const base = useTransform(scrollYProgress, [0, 0.9], [0, 1]);
  return (
    <div ref={ref} className="container-x pt-20">
      <svg viewBox={`0 0 ${layout.width.toFixed(0)} 262`} className="w-full text-paper/40" aria-hidden>
        {layout.items.map((item, i) => (
          <SkylineItem key={item.id} item={item} progress={scrollYProgress} index={i} />
        ))}
        <motion.path d={`M0 ${BASE}H${layout.width.toFixed(0)}`} stroke="currentColor" strokeWidth={1.3} style={{ pathLength: base }} />
      </svg>
    </div>
  );
}

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
    const t = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <ul className="mt-10 grid grid-cols-3 gap-x-6 gap-y-5 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
      {CLOCKS.map((c) => (
        <li key={c.city}>
          <p className="eyebrow text-[0.62rem] text-paper/45">{c.city}</p>
          <p className="mt-2 font-mono text-lg tabular-nums text-paper/90">
            {now ? new Intl.DateTimeFormat("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit" }).format(now) : "--:--"}
          </p>
        </li>
      ))}
    </ul>
  );
}

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
      { label: "Buy credits", href: "/dashboard/credits" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/goroam" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/goroam" },
      { label: "X (Twitter)", href: "https://x.com/goroamapp" },
      { label: "Instagram", href: "https://instagram.com/goroamapp" },
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

export function SiteFooter() {
  const word = "GoRoam".split("");
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <Skyline />
      <div className="container-x grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo tone="paper" />
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-paper/60">
            AI-crafted itineraries for the curious. Real places, honest budgets, beautifully paced days.
          </p>
          <WorldClocks />
          <a
            href="https://x.com/compose/tweet?text=I%27ve%20been%20using%20%23GoRoam%20for%20travel%20planning%20-%20check%20it%20out!%20%40goroamapp"
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-paper/15 px-5 py-3 text-sm text-paper/80 transition-colors hover:bg-paper hover:text-ink"
          >
            Share your journey on X
          </a>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-6 lg:col-start-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-paper/45">{col.title}</p>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group relative inline-block text-paper/80 transition-colors hover:text-paper"
                      {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      {l.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-brand transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-col gap-3 border-t border-paper/10 py-7 text-sm text-paper/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} GoRoam. All rights reserved.</p>
        <p>
          Built by{" "}
          <Link href="https://github.com/goroam" className="text-paper/70 hover:text-brand-2">
            @GoRoamTeam
          </Link>{" "}
          · Made for the curious
        </p>
      </div>
      <div aria-hidden className="pointer-events-none flex select-none justify-center overflow-hidden">
        {word.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: "70%" }}
            whileInView={{ y: "22%" }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
            className="display bg-gradient-to-b from-paper/[0.16] to-transparent bg-clip-text text-[26vw] leading-[0.8] text-transparent"
          >
            {ch}
          </motion.span>
        ))}
      </div>
    </footer>
  );
}
