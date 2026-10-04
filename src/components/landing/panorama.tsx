"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { circle, mountainRidge, mulberry32, palmTree, r1, rect, rollingRidge, umbrellaPine, cypressTree, canopyBlobs } from "@/components/scenes/geometry";
import { getMonument, type MonumentId, type Tone } from "@/components/scenes/monuments";
import { Birds, Clouds, Layer, Monument, Sun } from "@/components/scenes/primitives";
import { cn } from "@/lib/utils";

/**
 * The landing hero's illustration: one continuous daylight landscape with the
 * world's wonders standing side by side on rolling hills. It's drawn from the
 * same procedural pieces as the other scenes, so it shares their parallax,
 * "pop-up" entrance and reduced-motion handling.
 */

export const PANO_W = 2400;
export const PANO_H = 760;

const bump = (t: number, c: number, w: number, h: number) => h * Math.exp(-(((t - c) / w) ** 2));

type Tones = Partial<Record<Tone, string>>;

interface Placed {
  id: MonumentId;
  x: number;
  scale: number;
  tones: Tones;
  label: string;
}

// Left to right, Paris to Rio. Scales keep heights varied, so the skyline reads as a rhythm.
const MONUMENTS: Placed[] = [
  { id: "eiffel", x: 190, scale: 0.8, label: "Eiffel Tower", tones: { body: "#6B5650", shade: "#4D3D3C" } },
  { id: "bigben", x: 395, scale: 0.58, label: "Big Ben", tones: { body: "#CDA874", shade: "#9A7647", glow: "#FFF4DC" } },
  { id: "colosseum", x: 640, scale: 0, label: "Colosseum", tones: { body: "#DDA674", shade: "#A9703F", light: "#F0C99C" } },
  { id: "pagoda", x: 905, scale: 0.62, label: "Yasaka Pagoda", tones: { body: "#C0503E", glow: "#F6E3C9" } },
  { id: "angkor", x: 1200, scale: 0.5, label: "Angkor Wat", tones: { body: "#C9B087", shade: "#98815B" } },
  { id: "taj", x: 1545, scale: 0.6, label: "Taj Mahal", tones: { body: "#F7F1E7", shade: "#D9CCB5" } },
  { id: "liberty", x: 1815, scale: 0.55, label: "Statue of Liberty", tones: { body: "#7DBAA8", shade: "#5A9786", glow: "#F4A340" } },
  { id: "burj", x: 1985, scale: 0.78, label: "Burj Khalifa", tones: { body: "#B2CBD5", glow: "#EAF3F6" } },
];

const CHRIST_X = 2235;

/** Short brush strokes over a slope — the grass and rock texture of a painted hillside. */
function hatch(at: (x: number) => number, seed: number, count: number, depth: number, len: number, x0 = 0, x1 = PANO_W) {
  const rand = mulberry32(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = x0 + rand() * (x1 - x0);
    const y = at(x) + 6 + rand() * depth;
    const l = len * (0.5 + rand());
    const lean = (rand() - 0.5) * l * 0.6;
    d += `M${r1(x)} ${r1(y)}l${r1(lean)} ${r1(-l)}`;
  }
  return d;
}

/** Vertical rock striations down a mountain face. */
function striations(at: (x: number) => number, seed: number, count: number, x0: number, x1: number, below: number) {
  const rand = mulberry32(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = x0 + rand() * (x1 - x0);
    const top = at(x) + 8 + rand() * 20;
    const h = 40 + rand() * below;
    d += `M${r1(x)} ${r1(top)}q${r1((rand() - 0.5) * 18)} ${r1(h / 2)} ${r1((rand() - 0.5) * 10)} ${r1(h)}`;
  }
  return d;
}

/** A round deciduous tree: trunk plus a cluster of crown puffs, with a sunlit highlight. */
function roundTree(x: number, y: number, h: number, seed: number) {
  const r = h * 0.3;
  const cy = y - h + r;
  const crown = canopyBlobs(x, cy, r, 7, seed);
  let body = rect(x - h * 0.025, cy, h * 0.05, y - cy);
  let light = "";
  for (const b of crown) {
    body += circle(b.cx, b.cy, b.r);
    if (b.cx < x && b.cy < cy + r * 0.1) light += circle(b.cx + b.r * 0.12, b.cy - b.r * 0.1, b.r * 0.62);
  }
  return { body, light };
}

/** A broad tropical leaf, base at (x, y), pointing along `angle` (radians, 0 = up). */
function leaf(x: number, y: number, len: number, angle: number, width: number) {
  const sx = Math.sin(angle);
  const sy = -Math.cos(angle);
  const tx = x + sx * len;
  const ty = y + sy * len;
  const mx = x + sx * len * 0.5;
  const my = y + sy * len * 0.5;
  const nx = -sy * width;
  const ny = sx * width;
  const blade = `M${r1(x)} ${r1(y)}Q${r1(mx + nx)} ${r1(my + ny)} ${r1(tx)} ${r1(ty)}Q${r1(mx - nx)} ${r1(my - ny)} ${r1(x)} ${r1(y)}Z`;
  const rib = `M${r1(x)} ${r1(y)}Q${r1(mx + nx * 0.12)} ${r1(my + ny * 0.12)} ${r1(tx)} ${r1(ty)}`;
  return { blade, rib };
}

function Sway({ children, delay = 0, origin }: { children: ReactNode; delay?: number; origin: string }) {
  return (
    <g className="pano-sway" style={{ animationDelay: `${delay}s`, transformOrigin: origin }}>
      {children}
    </g>
  );
}

function useLandscape(uid: string) {
  return useMemo(() => {
    const far = mountainRidge({ seed: 21, y: 360, amp: 150, rough: 0.5, detail: 8, width: PANO_W, bottom: PANO_H, shape: (t) => -bump(t, 0.5, 0.2, 70) });
    const range = mountainRidge({ seed: 8, y: 440, amp: 110, rough: 0.55, detail: 8, width: PANO_W, bottom: PANO_H });
    // Andean peaks rising behind the centre, like Huayna Picchu over the ruins.
    const andes = mountainRidge({
      seed: 33,
      y: 612,
      amp: 54,
      rough: 0.64,
      detail: 9,
      width: PANO_W,
      bottom: PANO_H,
      shape: (t) =>
        -bump(t, 0.512, 0.021, 340) - bump(t, 0.476, 0.019, 250) - bump(t, 0.546, 0.024, 225) - bump(t, 0.44, 0.028, 150) - bump(t, 0.585, 0.03, 120) - bump(t, 0.5, 0.07, 70),
    });
    // Corcovado: a steep granite sugarloaf for Christ the Redeemer.
    const corcovado = mountainRidge({ seed: 41, y: 650, amp: 20, rough: 0.5, detail: 7, width: PANO_W, bottom: PANO_H, shape: (t) => -bump(t, 0.931, 0.032, 380) - bump(t, 0.975, 0.03, 120) });
    const hill = rollingRidge({ seed: 7, y: 652, amp: 34, waves: 3, width: PANO_W, bottom: PANO_H, shape: (t) => bump(t, 0.5, 0.1, 22) });
    const front = rollingRidge({ seed: 13, y: 718, amp: 26, waves: 4, width: PANO_W, bottom: PANO_H });

    const colWidth = getMonument("colosseum").width;
    const monuments = MONUMENTS.map((m) => ({
      ...m,
      scale: m.id === "colosseum" ? 300 / colWidth : m.scale,
      y: hill.at(m.x) + 6,
    }));
    const christ = { x: CHRIST_X, y: corcovado.at(CHRIST_X) + 3 };

    // Trees between the wonders, standing just in front of them.
    const greens = ["#4E9A7A", "#3F8A6C", "#5BA683"];
    const rounds = [
      { x: 300, h: 120, c: greens[0], s: 2 },
      { x: 520, h: 96, c: greens[1], s: 5 },
      { x: 1000, h: 132, c: "#EFB0BF", s: 8 },
      { x: 1080, h: 104, c: "#E3954B", s: 11 },
      { x: 1400, h: 92, c: greens[2], s: 14 },
      { x: 1690, h: 116, c: greens[0], s: 17 },
      { x: 2075, h: 108, c: "#D97B3A", s: 20 },
      { x: 2150, h: 90, c: greens[1], s: 23 },
    ].map((t) => ({ ...t, y: hill.at(t.x) + 22, ...roundTree(t.x, hill.at(t.x) + 22, t.h, t.s) }));
    const cypress = [1330, 1356, 1735, 1760].map((x, i) => cypressTree(x, hill.at(x) + 18, 120 + (i % 2) * 26)).join("");
    const pines = [470, 785].map((x, i) => umbrellaPine(x, hill.at(x) + 20, 120 + i * 18, i ? -0.06 : 0.07, 4 + i)).join("");
    const palms = [
      { x: 2290, h: 170, b: -0.18, s: 3 },
      { x: 2350, h: 210, b: 0.12, s: 6 },
      { x: 2210, h: 140, b: 0.2, s: 9 },
    ].map((p) => ({ ...p, y: front.at(p.x) + 6 }));

    // Big foreground leaves framing the bottom corners.
    const leavesL = [
      leaf(40, PANO_H + 10, 230, 0.35, 46),
      leaf(110, PANO_H + 20, 200, 0.9, 40),
      leaf(-10, PANO_H, 180, -0.2, 38),
      leaf(190, PANO_H + 30, 150, 0.55, 32),
    ];
    const leavesR = [
      leaf(2370, PANO_H + 10, 240, -0.4, 48),
      leaf(2290, PANO_H + 20, 190, -0.95, 40),
      leaf(2420, PANO_H, 170, 0.15, 36),
      leaf(2200, PANO_H + 30, 140, -0.6, 30),
    ];

    return {
      far: far.d,
      range: range.d,
      andes: andes.d,
      andesLines: striations(andes.at, 3, 60, 900, 1500, 120),
      corcovado: corcovado.d,
      corcovadoLines: striations(corcovado.at, 7, 18, 2160, 2310, 140),
      hill: hill.d,
      hillHatch: hatch(hill.at, 5, 520, 70, 9),
      front: front.d,
      frontHatch: hatch(front.at, 9, 420, 40, 12),
      monuments,
      christ,
      rounds,
      cypress,
      pines,
      palms,
      leavesL,
      leavesR,
      uid,
    };
  }, [uid]);
}

/** Pause looping animations when off screen, and report pointer position as --mx/--my for parallax. */
function useLiveScene(interactive: boolean) {
  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!interactive || !el || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const mx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      const my = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", mx.toFixed(3));
        el.style.setProperty("--my", my.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, visible]);

  return { ref, paused: !visible };
}

export function PanoramaLandscape({ intro, className }: { intro: boolean; className?: string }) {
  const uid = "pano" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = useLandscape(uid);
  const { ref, paused } = useLiveScene(true);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${PANO_W} ${PANO_H}`}
      preserveAspectRatio="xMidYMax slice"
      className={cn("scene overflow-visible", intro && "scene-intro", className)}
      data-paused={paused ? "true" : undefined}
      role="img"
      aria-label="An illustrated panorama of world wonders: the Eiffel Tower, Big Ben, the Colosseum, a Kyoto pagoda, Angkor Wat beneath Andean peaks, the Taj Mahal, the Statue of Liberty, the Burj Khalifa and Christ the Redeemer."
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-andes`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86BEA9" />
          <stop offset="1" stopColor="#4C8C7A" />
        </linearGradient>
        <linearGradient id={`${uid}-hill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFDDA9" />
          <stop offset="0.6" stopColor="#8CC294" />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6DAE88" />
          <stop offset="1" stopColor="#3F8A6C" />
        </linearGradient>
        <linearGradient id={`${uid}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F8F9" stopOpacity="0" />
          <stop offset="1" stopColor="#F4F8F9" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Distant ranges, softened by atmosphere. */}
      <Layer depth={0.08}>
        <path d={s.far} fill="#CBE2E1" />
      </Layer>
      <Layer depth={0.14}>
        <path d={s.range} fill="#AED2CD" />
        <rect y={420} width={PANO_W} height={PANO_H - 420} fill={`url(#${uid}-haze)`} />
      </Layer>

      {/* Andean peaks and Corcovado. */}
      <Layer depth={0.22}>
        <path d={s.andes} fill="#A7D3BF" transform="translate(-10 4)" />
        <path d={s.andes} fill={`url(#${uid}-andes)`} />
        <path d={s.andesLines} fill="none" stroke="#A9D3C1" strokeOpacity={0.55} strokeWidth={2.2} strokeLinecap="round" />
      </Layer>
      <Layer depth={0.3}>
        <path d={s.corcovado} fill="#5E9C82" />
        <path d={s.corcovadoLines} fill="none" stroke="#86BCA2" strokeOpacity={0.6} strokeWidth={2.4} strokeLinecap="round" />
        <Monument id="christ" x={s.christ.x} y={s.christ.y} scale={1.75} tones={{ body: "#F1EBDF", shade: "#C9BEA9" }} />
      </Layer>

      {/* The wonders on their meadow. */}
      <Layer depth={0.4}>
        <path d={s.hill} fill={`url(#${uid}-hill)`} />
        <path d={s.hillHatch} fill="none" stroke="#E2F0C9" strokeOpacity={0.6} strokeWidth={2} strokeLinecap="round" />
        {s.monuments.map((m) => (
          <Monument key={m.id} id={m.id} x={m.x} y={m.y} scale={m.scale} tones={m.tones} />
        ))}
      </Layer>

      {/* Trees standing between them. */}
      <Layer depth={0.5}>
        <path d={s.pines} fill="#3D7F63" />
        <path d={s.cypress} fill="#2F6E58" />
        {s.rounds.map((t) => (
          <g key={t.x}>
            <path d={t.body} fill={t.c} />
            <path d={t.light} fill="#FFFFFF" opacity={0.18} />
          </g>
        ))}
      </Layer>

      {/* Foreground meadow, footpath and palms. */}
      <Layer depth={0.7}>
        <path d={s.front} fill={`url(#${uid}-front)`} />
        <path d={s.frontHatch} fill="none" stroke="#9BD0AC" strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />
        {s.palms.map((p, i) => (
          <Sway key={p.x} delay={-i * 1.7} origin={`${p.x}px ${r1(p.y)}px`}>
            <path d={palmTree(p.x, p.y, p.h, p.b, p.s)} fill="#2C6E5A" />
          </Sway>
        ))}
      </Layer>

      {/* Big leaves framing the corners. */}
      <Layer depth={0.95}>
        {[...s.leavesL, ...s.leavesR].map((l, i) => (
          <Sway key={i} delay={-i * 0.9} origin={i < 4 ? `60px ${PANO_H}px` : `${PANO_W - 60}px ${PANO_H}px`}>
            <path d={l.blade} fill={["#2E7766", "#1F5B4F", "#3E8C6E", "#25685A"][i % 4]} />
            <path d={l.rib} fill="none" stroke="#A7D6BE" strokeOpacity={0.45} strokeWidth={2} />
          </Sway>
        ))}
      </Layer>
    </svg>
  );
}

const PLANE =
  "M38 0C38 -3 35 -5 30 -5L10 -5L-8 -32L-18 -32L-6 -5L-24 -5L-31 -15L-38 -15L-34 0L-38 15L-31 15L-24 5L-6 5L-18 32L-8 32L10 5L30 5C35 5 38 3 38 0Z";

/** The sky behind the hero copy: sun, two-tone clouds, birds and a passing plane. */
export function PanoramaSky({ className }: { className?: string }) {
  const uid = "sky" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const { ref, paused } = useLiveScene(true);
  const clouds = [
    { x: 40, y: 200, w: 520, seed: 3, speed: 86 },
    { x: 1120, y: 340, w: 430, seed: 9, speed: 100 },
    { x: 300, y: 470, w: 250, seed: 14, speed: 72 },
    { x: 1280, y: 130, w: 300, seed: 21, speed: 118 },
  ];

  return (
    <svg
      ref={ref}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className={cn("scene", className)}
      data-paused={paused ? "true" : undefined}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-trail`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <Layer depth={0.04}>
        <Sun uid={uid} x={1150} y={668} r={54} color="#FFF3DD" glow="#FFC876" halo={6} haloOpacity={0.4} />
      </Layer>
      <Layer depth={0.1}>
        {/* Warm undersides first, then the sunlit tops, drifting together. */}
        <g transform="translate(0 14)">
          <Clouds color="#F6E4CB" opacity={0.95} items={clouds} />
        </g>
        <Clouds color="#FFFFFF" opacity={0.96} items={clouds} />
      </Layer>
      <Birds x={900} y={560} count={4} color="#3E6170" scale={0.85} duration={56} delay={-14} />
      <g className="pano-plane">
        <g transform="translate(0 150)">
          <path d="M-360 0H-34" stroke={`url(#${uid}-trail)`} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 0" />
          <path d={PLANE} transform="scale(0.42)" fill="#16324A" opacity={0.8} />
        </g>
      </g>
    </svg>
  );
}
