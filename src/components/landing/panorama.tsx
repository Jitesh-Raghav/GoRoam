"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { circle, mountainRidge, mulberry32, palmTree, r1, rect, rollingRidge, umbrellaPine, cypressTree, canopyBlobs } from "@/components/scenes/geometry";
import { getMonument, type MonumentId, type Tone } from "@/components/scenes/monuments";
import { LondonClock } from "@/components/scenes/london-clock";
import { Clouds, Layer, Monument, Sun } from "@/components/scenes/primitives";
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
  { id: "eiffel", x: 190, scale: 0.8, label: "Eiffel Tower", tones: { body: "#6B5650", shade: "#45363A", light: "#B58E78" } },
  { id: "bigben", x: 395, scale: 0.58, label: "Big Ben", tones: { body: "#CDA874", shade: "#8E6B3E", glow: "#FFF4DC", light: "#F2D7A6" } },
  { id: "colosseum", x: 640, scale: 0, label: "Colosseum", tones: { body: "#DDA674", shade: "#A9703F", light: "#F0C99C" } },
  { id: "pagoda", x: 905, scale: 0.62, label: "Yasaka Pagoda", tones: { body: "#C0503E", shade: "#7E2F2C", glow: "#F6E3C9", light: "#E9846C" } },
  { id: "angkor", x: 1200, scale: 0.5, label: "Angkor Wat", tones: { body: "#C9B087", shade: "#8C7651", light: "#EAD6AE" } },
  { id: "taj", x: 1545, scale: 0.6, label: "Taj Mahal", tones: { body: "#F7F1E7", shade: "#CDBFA6", light: "#FFFFFF" } },
  { id: "liberty", x: 1815, scale: 0.55, label: "Statue of Liberty", tones: { body: "#7DBAA8", shade: "#4F8A79", glow: "#F4A340", light: "#B4E0D2" } },
  { id: "burj", x: 1985, scale: 0.78, label: "Burj Khalifa", tones: { body: "#B2CBD5", shade: "#7F9EAC", glow: "#EAF3F6", light: "#E6F2F6" } },
];

const CHRIST_X = 2235;
/** A four-point glint, for the Eiffel Tower's sparkle. */
const SPARK = "M0 -3.4L0.7 -0.7L3.4 0L0.7 0.7L0 3.4L-0.7 0.7L-3.4 0L-0.7 -0.7Z";
/** The little train: an engine and its carriages, front to back. */
const TRAIN = ["engine", "#0B8278", "#F4A340", "#16324A"] as const;
/** Travellers on the footpath: shirt and backpack colours, pace, start. */
const WALKERS = [
  { top: "#0B8278", pack: "#F4A340", dur: 120, delay: -10 },
  { top: "#C0503E", pack: "#16324A", dur: 135, delay: -58 },
  { top: "#F4A340", pack: "#0B8278", dur: 128, delay: -96 },
];
/** Where the sun sits over the landscape: monuments east of it are lit from the left. */
const SUN_X = 1720;

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

    // Hamlets of tiny houses on the far meadow.
    const houses = [748, 768, 790, 1436, 1458, 1478, 2050, 2070].map((x, i) => {
      const y = hill.at(x) + 5;
      const w = 12 + (i % 3) * 2;
      return { wall: rect(x - w / 2, y - 9, w, 9), roof: `M${r1(x - w / 2 - 2)} ${r1(y - 9)}L${r1(x)} ${r1(y - 17)}L${r1(x + w / 2 + 2)} ${r1(y - 9)}Z` };
    });

    // Wildflowers across the front meadow.
    const flowerRand = mulberry32(77);
    const flowers: Record<string, string> = { "#FFF4DC": "", "#F6B6C1": "", "#FFC876": "", "#FFFFFF": "" };
    const keys = Object.keys(flowers);
    for (let i = 0; i < 340; i++) {
      const x = flowerRand() * PANO_W;
      const y = front.at(x) + 10 + flowerRand() * (PANO_H - front.at(x) - 10);
      flowers[keys[i % keys.length]] += circle(x, y, 1.6 + flowerRand() * 1.8);
    }

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

    // ---- Life and detail ------------------------------------------------------

    // Soft ground shadows, cast away from the sun.
    const shadows = monuments.map((m) => {
      const w = getMonument(m.id).width * m.scale;
      return { cx: m.x + (m.x < SUN_X ? -1 : 1) * w * 0.16, cy: m.y - 1, rx: w * 0.52, ry: Math.max(5, w * 0.035) };
    });

    // The Taj's long reflecting canal, narrowing towards the mausoleum.
    const taj = monuments.find((m) => m.id === "taj")!;
    const canal = `M${r1(taj.x - 12)} ${r1(taj.y + 4)}L${r1(taj.x + 12)} ${r1(taj.y + 4)}L${r1(taj.x + 44)} ${r1(taj.y + 58)}L${r1(taj.x - 44)} ${r1(taj.y + 58)}Z`;
    const canalGlints = [0.25, 0.45, 0.65, 0.85].map((t) => ({ x: taj.x, y: r1(taj.y + 4 + t * 54), half: r1(12 + t * 30) }));

    // A railway running low across the meadow, half hidden by its rises.
    const railY = (x: number) => hill.at(Math.min(PANO_W, Math.max(0, x))) + 44;
    let rail = `M-260 ${r1(railY(0))}`;
    for (let x = -240; x <= PANO_W + 260; x += 20) rail += `L${x} ${r1(railY(x))}`;
    const sleepers = Array.from({ length: Math.floor(PANO_W / 26) }, (_, i) => {
      const x = 13 + i * 26;
      return `M${x} ${r1(railY(x) + 1)}l0 4`;
    }).join("");

    // A footpath along the front meadow, for a few walkers.
    const pathY = (x: number) => front.at(x) + 16;
    let walk = `M120 ${r1(pathY(120))}`;
    for (let x = 140; x <= 2120; x += 20) walk += `L${x} ${r1(pathY(x))}`;
    const fence = [300, 330, 360, 390, 420, 450, 480].map((x) => ({ x, y: r1(pathY(x) - 6) }));

    // Windmill above the first hamlet.
    const mill = { x: 830, y: hill.at(830) + 4 };

    // Chimney smoke from a few cottages.
    const smoke = [790, 1458, 2070].map((x, i) => ({ x: x + 3, y: r1(hill.at(x) - 15), delay: -i * 1.7 }));

    // Landmark details: Liberty's torch, the Eiffel Tower's sparkle, Burj windows, Big Ben's clock.
    const place = (id: MonumentId) => monuments.find((m) => m.id === id)!;
    const lib = place("liberty");
    const torch = { x: lib.x - 40 * lib.scale, y: lib.y - (600 - 14) * lib.scale };
    const eif = place("eiffel");
    const sparkRand = mulberry32(91);
    const sparkles = Array.from({ length: 16 }, () => {
      const t = 0.08 + sparkRand() * 0.84; // 0 top, 1 ground
      const half = 114 * Math.pow(t, 1.7) * 0.8;
      return { x: r1(eif.x + (sparkRand() * 2 - 1) * half * eif.scale), y: r1(eif.y - (1 - t) * 600 * eif.scale), d: r1(sparkRand() * 4) };
    });
    const burj = place("burj");
    const winRand = mulberry32(57);
    const windows = Array.from({ length: 12 }, () => ({
      x: r1(burj.x + (winRand() * 2 - 1) * 14 * burj.scale),
      y: r1(burj.y - (0.15 + winRand() * 0.6) * 600 * burj.scale),
      d: r1(winRand() * 4.6),
    }));
    const ben = place("bigben");
    const clock = { cx: ben.x, cy: ben.y - (600 - 256) * ben.scale, r: 27 * ben.scale };

    // Bushes and stones along the front meadow.
    const bushRand = mulberry32(203);
    const bushes = [250, 610, 980, 1290, 1620, 1890].map((x, i) => {
      const y = front.at(x) + 6;
      const blobs = canopyBlobs(x, y - 12, 15 + bushRand() * 6, 5, 300 + i);
      return { d: blobs.map((b) => circle(b.cx, b.cy, b.r)).join(""), light: blobs.slice(0, 2).map((b) => circle(b.cx - b.r * 0.2, b.cy - b.r * 0.25, b.r * 0.5)).join(""), c: i % 2 ? "#3F8A6C" : "#4E9A7A" };
    });
    const stones = [700, 1130, 1760, 2010].map((x, i) => ({ x, y: r1(front.at(x) + 12), rx: 9 + (i % 2) * 5, ry: 5 + (i % 2) * 2 }));

    // Butterflies over the meadow.
    const butterflies = [
      { x: 520, y: front.at(520) - 26, c: "#F4A340", d: 0 },
      { x: 1210, y: front.at(1210) - 34, c: "#F6B6C1", d: -2.4 },
      { x: 1990, y: front.at(1990) - 24, c: "#FFF4DC", d: -4.1 },
    ];

    return {
      shadows,
      canal,
      canalGlints,
      rail,
      sleepers,
      walk,
      fence,
      mill,
      smoke,
      torch,
      sparkles,
      windows,
      clock,
      bushes,
      stones,
      butterflies,
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
      houses,
      flowers,
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
        <linearGradient id={`${uid}-canal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6F6F4" stopOpacity="0.85" />
          <stop offset="1" stopColor="#5BB5B0" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${uid}-flame`}>
          <stop offset="0" stopColor="#FFF4DC" />
          <stop offset="0.35" stopColor="#FFC876" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F4A340" stopOpacity="0" />
        </radialGradient>
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
        <Monument id="christ" x={s.christ.x} y={s.christ.y} scale={1.75} tones={{ body: "#F1EBDF", shade: "#C9BEA9", light: "#FFFFFF" }} detailed light="left" />
      </Layer>

      {/* The wonders on their meadow. */}
      <Layer depth={0.4}>
        <path d={s.hill} fill={`url(#${uid}-hill)`} />
        <path d={s.hillHatch} fill="none" stroke="#E2F0C9" strokeOpacity={0.6} strokeWidth={2} strokeLinecap="round" />
        {s.houses.map((h, i) => (
          <g key={i}>
            <path d={h.wall} fill="#F3E9D8" />
            <path d={h.roof} fill={i % 2 ? "#C8664B" : "#B25A44"} />
          </g>
        ))}
        {s.shadows.map((sh, i) => (
          <ellipse key={i} cx={sh.cx} cy={sh.cy} rx={sh.rx} ry={sh.ry} fill="#2F6E58" opacity={0.2} />
        ))}
        {s.monuments.map((m) => (
          <Monument key={m.id} id={m.id} x={m.x} y={m.y} scale={m.scale} tones={m.tones} detailed light={m.x > SUN_X ? "left" : "right"} />
        ))}

        {/* The Taj's reflecting canal, catching the light. */}
        <path d={s.canal} fill="#9FD4D6" />
        <path d={s.canal} fill={`url(#${uid}-canal)`} />
        {s.canalGlints.map((g, i) => (
          <path key={i} d={`M${r1(g.x - g.half * 0.6)} ${g.y}h${r1(g.half * 1.2)}`} stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" className="scene-shimmer" style={{ animationDelay: `${-i * 0.8}s` }} />
        ))}

        {/* Big Ben keeps London time; Liberty's torch flickers; the Eiffel Tower sparkles; the Burj glints. */}
        <LondonClock cx={s.clock.cx} cy={s.clock.cy} r={s.clock.r} color="#3B2C1E" />
        <circle cx={s.torch.x} cy={s.torch.y} r={9} fill={`url(#${uid}-flame)`} className="pano-flicker" />
        {s.sparkles.map((p, i) => (
          <path key={i} d={SPARK} transform={`translate(${p.x} ${p.y})`} fill="#FFFFFF" className="scene-sparkle" style={{ animationDelay: `${p.d}s` }} />
        ))}
        {s.windows.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={2.4} height={1.6} fill="#FFF4DC" className="scene-twinkle" style={{ animationDelay: `${w.d}s` }} />
        ))}

        {/* A windmill turning above the hamlet. */}
        <g>
          <path d={`M${s.mill.x - 12} ${s.mill.y}L${s.mill.x - 7} ${s.mill.y - 56}L${s.mill.x + 7} ${s.mill.y - 56}L${s.mill.x + 12} ${s.mill.y}Z`} fill="#F3E9D8" />
          <path d={`M${s.mill.x - 9} ${s.mill.y - 54}Q${s.mill.x} ${s.mill.y - 70} ${s.mill.x + 9} ${s.mill.y - 54}Z`} fill="#B25A44" />
          <rect x={s.mill.x - 2.5} y={s.mill.y - 10} width={5} height={10} rx={2.5} fill="#8E6B3E" />
          <g className="scene-spin" style={{ animationDuration: "16s" }}>
            {[0, 90, 180, 270].map((a) => (
              <g key={a} transform={`rotate(${a} ${s.mill.x} ${s.mill.y - 56})`}>
                <rect x={s.mill.x - 1} y={s.mill.y - 98} width={2} height={42} fill="#6B5650" />
                <rect x={s.mill.x + 1} y={s.mill.y - 96} width={9} height={30} fill="#FFF8EC" stroke="#CDBFA6" strokeWidth={0.8} />
              </g>
            ))}
            <circle cx={s.mill.x} cy={s.mill.y - 56} r={3} fill="#6B5650" />
          </g>
        </g>

        {/* Smoke curling from cottage chimneys. */}
        {s.smoke.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y})`}>
            {[0, 1, 2].map((k) => (
              <circle key={k} r={3.4} fill="#FFFFFF" className="pano-smoke" style={{ animationDelay: `${c.delay - k * 1.3}s` }} />
            ))}
          </g>
        ))}

        {/* The railway, and a little train running along it. */}
        <path d={s.rail} fill="none" stroke="#6E8F72" strokeWidth={1.6} opacity={0.7} />
        <path d={s.sleepers} stroke="#6E8F72" strokeWidth={1.4} opacity={0.5} />
        {TRAIN.map((car, i) => (
          <g key={i} className="pano-rider pano-train" style={{ offsetPath: `path("${s.rail}")`, animationDelay: `${-22 + i * 0.62}s` }}>
            {car === "engine" ? (
              <>
                <rect x={-14} y={-14} width={28} height={12} rx={3} fill="#C0503E" />
                <rect x={-13} y={-20} width={9} height={8} rx={1.5} fill="#16324A" />
                <rect x={8} y={-22} width={4} height={8} fill="#16324A" />
                {[0, 1, 2].map((k) => (
                  <circle key={k} cx={10} cy={-26} r={3} fill="#FFFFFF" className="pano-steam" style={{ animationDelay: `${-k * 0.5}s` }} />
                ))}
              </>
            ) : (
              <>
                <rect x={-14} y={-14} width={28} height={12} rx={3} fill={car} />
                {[-9, -2, 5].map((wx) => (
                  <rect key={wx} x={wx} y={-11.5} width={4.5} height={4} rx={1} fill="#FFF4DC" opacity={0.9} />
                ))}
              </>
            )}
            <circle cx={-8} cy={-1.5} r={2.4} fill="#2B2B2B" />
            <circle cx={8} cy={-1.5} r={2.4} fill="#2B2B2B" />
          </g>
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
        {Object.entries(s.flowers).map(([c, d]) => (
          <path key={c} d={d} fill={c} opacity={0.9} />
        ))}

        {/* A worn footpath with a stretch of fence, and travellers walking it. */}
        <path d={s.walk} fill="none" stroke="#D9EBC2" strokeWidth={7} strokeLinecap="round" opacity={0.55} />
        <path d={s.fence.map((f) => `M${f.x} ${f.y}v-12`).join("")} stroke="#8E6B3E" strokeWidth={2.4} strokeLinecap="round" />
        <path d={`M${s.fence[0].x} ${s.fence[0].y - 9}L${s.fence[s.fence.length - 1].x} ${s.fence[s.fence.length - 1].y - 9}M${s.fence[0].x} ${s.fence[0].y - 4}L${s.fence[s.fence.length - 1].x} ${s.fence[s.fence.length - 1].y - 4}`} stroke="#A9825A" strokeWidth={1.6} />
        {WALKERS.map((w, i) => (
          <g key={i} className="pano-rider pano-walk" style={{ offsetPath: `path("${s.walk}")`, animationDuration: `${w.dur}s`, animationDelay: `${w.delay}s` }}>
            <g className="pano-bob" style={{ animationDelay: `${i * 0.2}s` }}>
              <rect x={-2.6} y={-15} width={5.2} height={9} rx={2.2} fill={w.top} />
              <rect x={-4.8} y={-14} width={3} height={6} rx={1.2} fill={w.pack} />
              <circle cx={0} cy={-18} r={2.8} fill="#E8B48F" />
              <path d="M-1.4 -6.2l-1 6M1.4 -6.2l1 6" stroke="#2C3E50" strokeWidth={1.8} strokeLinecap="round" />
            </g>
          </g>
        ))}

        {s.stones.map((st, i) => (
          <g key={i}>
            <ellipse cx={st.x} cy={st.y} rx={st.rx} ry={st.ry} fill="#A8B5AE" />
            <ellipse cx={st.x - st.rx * 0.25} cy={st.y - st.ry * 0.35} rx={st.rx * 0.5} ry={st.ry * 0.4} fill="#D3DDD6" />
          </g>
        ))}
        {s.bushes.map((b, i) => (
          <g key={i}>
            <path d={b.d} fill={b.c} />
            <path d={b.light} fill="#FFFFFF" opacity={0.16} />
          </g>
        ))}

        {/* Butterflies wandering over the flowers. */}
        {s.butterflies.map((b, i) => (
          <g key={i} transform={`translate(${r1(b.x)} ${r1(b.y)})`}>
            <g className="pano-flutter" style={{ animationDelay: `${b.d}s` }}>
              <g className="pano-wing" style={{ animationDelay: `${b.d}s` }}>
                <path d="M0 0C-7 -9 -12 -3 -7 2C-4 4 -2 2 0 0ZM0 0C7 -9 12 -3 7 2C4 4 2 2 0 0Z" fill={b.c} stroke="#5A4A3A" strokeWidth={0.6} />
              </g>
              <path d="M0 -3v6" stroke="#3A2E22" strokeWidth={1.2} strokeLinecap="round" />
            </g>
          </g>
        ))}
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

/**
 * The sky behind the hero copy: the low sun and two soft clouds drifting at the
 * edges, kept clear of the headline so nothing competes with it.
 */
export function PanoramaSky({ className }: { className?: string }) {
  const uid = "sky" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const { ref, paused } = useLiveScene(true);
  const clouds = [
    { x: -60, y: 190, w: 440, seed: 3, speed: 120 },
    { x: 1300, y: 260, w: 360, seed: 21, speed: 140 },
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
      <Layer depth={0.04}>
        {/* Long, soft rays turning slowly around the sun. */}
        <g className="pano-rays" style={{ transformOrigin: "1150px 668px" }}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d="M1150 668L1143 520L1157 520Z" fill="#FFE7B0" opacity={i % 2 ? 0.16 : 0.26} transform={`rotate(${i * 22.5} 1150 668)`} />
          ))}
        </g>
        <Sun uid={uid} x={1150} y={668} r={54} color="#FFF3DD" glow="#FFC876" halo={6} haloOpacity={0.4} />
      </Layer>
      <Layer depth={0.1}>
        <Clouds color="#FFFFFF" opacity={0.7} items={clouds} />
      </Layer>
    </svg>
  );
}
