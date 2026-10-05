import { ArrowRight } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BOUNCE, lerp, prog, spr } from "../anim";
import { Emblem, PLANE_REST } from "../components/emblem";
import { Eyebrow } from "../components/kit";
import { useFormat } from "../format";
import { wordFrame, wordMatch, type Cue, type SceneProps } from "../scene";
import type { Variant } from "../script";
import { C, E, F } from "../theme";
import type { PlacedBeat } from "../timeline";
// GoRoam's own scene kit, so the finale is the landing page's panorama, brought to life.
import { BIRD_PATH, canopyBlobs, circle, cloudPath, cypressTree, mountainRidge, mulberry32, palmTree, r1, rect, rollingRidge, umbrellaPine } from "../../../src/components/scenes/geometry";
import { getMonument, type MonumentId, type Tone } from "../../../src/components/scenes/monuments";
import { Monument } from "../../../src/components/scenes/primitives";

const PW = 2400;
const PH = 760;
const SUN_X = 1720;
const CHRIST_X = 2235;

const bump = (t: number, c: number, w: number, h: number) => h * Math.exp(-(((t - c) / w) ** 2));

/* Same placements and tones as src/components/landing/panorama.tsx. */
const MONUMENTS: { id: MonumentId; x: number; scale: number; tones: Partial<Record<Tone, string>> }[] = [
  { id: "eiffel", x: 190, scale: 0.8, tones: { body: "#6B5650", shade: "#45363A", light: "#B58E78" } },
  { id: "bigben", x: 395, scale: 0.58, tones: { body: "#CDA874", shade: "#8E6B3E", glow: "#FFF4DC", light: "#F2D7A6" } },
  { id: "colosseum", x: 640, scale: 0, tones: { body: "#DDA674", shade: "#A9703F", light: "#F0C99C" } },
  { id: "pagoda", x: 905, scale: 0.62, tones: { body: "#C0503E", shade: "#7E2F2C", glow: "#F6E3C9", light: "#E9846C" } },
  { id: "angkor", x: 1200, scale: 0.5, tones: { body: "#C9B087", shade: "#8C7651", light: "#EAD6AE" } },
  { id: "taj", x: 1545, scale: 0.6, tones: { body: "#F7F1E7", shade: "#CDBFA6", light: "#FFFFFF" } },
  { id: "liberty", x: 1815, scale: 0.55, tones: { body: "#7DBAA8", shade: "#4F8A79", glow: "#F4A340", light: "#B4E0D2" } },
  { id: "burj", x: 1985, scale: 0.78, tones: { body: "#B2CBD5", shade: "#7F9EAC", glow: "#EAF3F6", light: "#E6F2F6" } },
];

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

function hatch(at: (x: number) => number, seed: number, count: number, depth: number, len: number) {
  const rand = mulberry32(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = rand() * PW;
    const y = at(x) + 6 + rand() * depth;
    const l = len * (0.5 + rand());
    d += `M${r1(x)} ${r1(y)}l${r1((rand() - 0.5) * l * 0.6)} ${r1(-l)}`;
  }
  return d;
}

function useLand() {
  return useMemo(() => {
    const far = mountainRidge({ seed: 21, y: 360, amp: 150, rough: 0.5, detail: 8, width: PW, bottom: PH, shape: (t) => -bump(t, 0.5, 0.2, 70) });
    const range = mountainRidge({ seed: 8, y: 440, amp: 110, rough: 0.55, detail: 8, width: PW, bottom: PH });
    const andes = mountainRidge({
      seed: 33,
      y: 612,
      amp: 54,
      rough: 0.64,
      detail: 9,
      width: PW,
      bottom: PH,
      shape: (t) => -bump(t, 0.512, 0.021, 340) - bump(t, 0.476, 0.019, 250) - bump(t, 0.546, 0.024, 225) - bump(t, 0.44, 0.028, 150) - bump(t, 0.585, 0.03, 120) - bump(t, 0.5, 0.07, 70),
    });
    const corcovado = mountainRidge({ seed: 41, y: 650, amp: 20, rough: 0.5, detail: 7, width: PW, bottom: PH, shape: (t) => -bump(t, 0.931, 0.032, 380) - bump(t, 0.975, 0.03, 120) });
    const hill = rollingRidge({ seed: 7, y: 652, amp: 34, waves: 3, width: PW, bottom: PH, shape: (t) => bump(t, 0.5, 0.1, 22) });
    const front = rollingRidge({ seed: 13, y: 718, amp: 26, waves: 4, width: PW, bottom: PH });
    const colWidth = getMonument("colosseum").width;
    const monuments = MONUMENTS.map((m) => ({ ...m, scale: m.id === "colosseum" ? 300 / colWidth : m.scale, y: hill.at(m.x) + 6 }));
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
    ].map((t) => ({ ...t, ...roundTree(t.x, hill.at(t.x) + 22, t.h, t.s) }));
    const flowerRand = mulberry32(77);
    const flowers: Record<string, string> = { "#FFF4DC": "", "#F6B6C1": "", "#FFC876": "", "#FFFFFF": "" };
    const keys = Object.keys(flowers);
    for (let i = 0; i < 340; i++) {
      const x = flowerRand() * PW;
      const y = front.at(x) + 10 + flowerRand() * (PH - front.at(x) - 10);
      flowers[keys[i % keys.length]] += circle(x, y, 1.6 + flowerRand() * 1.8);
    }
    return {
      far: far.d,
      range: range.d,
      andes: andes.d,
      corcovado: corcovado.d,
      christ: { x: CHRIST_X, y: corcovado.at(CHRIST_X) + 3 },
      hill: hill.d,
      hillHatch: hatch(hill.at, 5, 520, 70, 9),
      front: front.d,
      frontHatch: hatch(front.at, 9, 420, 40, 12),
      monuments,
      rounds,
      cypress: [1330, 1356, 1735, 1760].map((x, i) => cypressTree(x, hill.at(x) + 18, 120 + (i % 2) * 26)).join(""),
      pines: [470, 785].map((x, i) => umbrellaPine(x, hill.at(x) + 20, 120 + i * 18, i ? -0.06 : 0.07, 4 + i)).join(""),
      palms: [
        { x: 2290, h: 170, b: -0.18, s: 3 },
        { x: 2350, h: 210, b: 0.12, s: 6 },
        { x: 2210, h: 140, b: 0.2, s: 9 },
      ].map((p) => ({ ...p, y: front.at(p.x) + 6 })),
      flowers,
    };
  }, []);
}

function timing(variant: Variant, beat: PlacedBeat, dur: number) {
  const logoAt = wordFrame(beat, 0) - 22;
  const world = wordMatch(beat, /^world/i, logoAt + 40);
  return {
    pop: variant === "film" ? 9 : 6, // frames between monuments rising
    popStart: 12,
    logoAt,
    wordAt: logoAt + 16,
    taglineAt: world - 4,
    ctaAt: Math.min(world + 30, dur - 40),
  };
}

/** A pop-up-book layer: it springs up from below the horizon. */
function Rise({ at, depth, children }: { at: number; depth: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const s = spr(frame, at, { damping: 15, stiffness: 90, mass: 1 });
  return <g transform={`translate(0 ${(1 - s) * (120 + depth * 260)})`}>{children}</g>;
}

/** "GoRoam. The world is waiting." */
export function Finale({ dur, variant, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, vertical, v } = useFormat();
  const land = useLand();
  const t = timing(variant, beat, dur);

  // Fit the panorama to the frame bottom, then truck the camera across it.
  const scale = v(0.92, 1.36);
  const panoW = PW * scale;
  const top = H - PH * scale;
  const travel = Math.max(0, panoW - W);
  const pan = interpolate(frame, [0, dur], vertical ? [0.05, 0.62] : [0.1, 0.9], { easing: E.inOutSine });
  const camX = -travel * pan;
  const par = (depth: number) => camX * (0.55 + depth * 0.45); // nearer layers slide further

  // Monuments rise in order as the camera finds them.
  const popAt = (x: number, i: number) => {
    if (!vertical) return t.popStart + i * t.pop;
    // In portrait, each rises just before it slides into view.
    const screenX = (f: number) => x * scale - travel * interpolate(f, [0, dur], [0.05, 0.62], { easing: E.inOutSine });
    for (let f = 0; f < dur; f++) if (screenX(f) < W + 60) return Math.max(t.popStart + i * 3, f - 6);
    return dur;
  };

  const logo = prog(frame, t.logoAt, 40, E.outExpo);
  const globe = spr(frame, t.logoAt + 10, BOUNCE);
  const letters = "GoRoam".split("");
  const cta = spr(frame, t.ctaAt);
  const sunY = interpolate(frame, [0, dur], [520, 470]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: `linear-gradient(180deg, #a9dde3 0%, #d7eef0 38%, ${C.paper} 62%, #fde3c4 100%)` }}>
      {/* Sun glow low over the mountains. */}
      <div
        style={{
          position: "absolute",
          left: SUN_X * scale + par(0.1) - 300,
          top: top + sunY * scale - 300,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,243,221,1) 0%, rgba(255,200,118,0.55) 22%, rgba(255,200,118,0) 62%)",
        }}
      />

      <Sky W={W} H={H} frame={frame} birds={1 - logo} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="fin-andes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86BEA9" />
            <stop offset="1" stopColor="#4C8C7A" />
          </linearGradient>
          <linearGradient id="fin-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFDDA9" />
            <stop offset="0.6" stopColor="#8CC294" />
          </linearGradient>
          <linearGradient id="fin-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6DAE88" />
            <stop offset="1" stopColor="#3F8A6C" />
          </linearGradient>
          <linearGradient id="fin-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4F8F9" stopOpacity="0" />
            <stop offset="1" stopColor="#F4F8F9" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <g transform={`translate(${par(0.08)} ${top}) scale(${scale})`}>
          <Rise at={0} depth={0.1}>
            <path d={land.far} fill="#CBE2E1" />
          </Rise>
        </g>
        <g transform={`translate(${par(0.14)} ${top}) scale(${scale})`}>
          <Rise at={3} depth={0.2}>
            <path d={land.range} fill="#AED2CD" />
            <rect y={420} width={PW} height={PH - 420} fill="url(#fin-haze)" />
          </Rise>
        </g>
        <g transform={`translate(${par(0.22)} ${top}) scale(${scale})`}>
          <Rise at={6} depth={0.3}>
            <path d={land.andes} fill="#A7D3BF" transform="translate(-10 4)" />
            <path d={land.andes} fill="url(#fin-andes)" />
          </Rise>
        </g>
        <g transform={`translate(${par(0.3)} ${top}) scale(${scale})`}>
          <Rise at={8} depth={0.4}>
            <path d={land.corcovado} fill="#5E9C82" />
            <Pop x={land.christ.x} y={land.christ.y} at={popAt(CHRIST_X, 8)}>
              <Monument id="christ" x={land.christ.x} y={land.christ.y} scale={1.75} tones={{ body: "#F1EBDF", shade: "#C9BEA9", light: "#FFFFFF" }} detailed light="left" />
            </Pop>
          </Rise>
        </g>
        <g transform={`translate(${par(0.4)} ${top}) scale(${scale})`}>
          <Rise at={10} depth={0.5}>
            <path d={land.hill} fill="url(#fin-hill)" />
            <path d={land.hillHatch} fill="none" stroke="#E2F0C9" strokeOpacity={0.6} strokeWidth={2} strokeLinecap="round" />
            {land.monuments.map((m, i) => (
              <Pop key={m.id} x={m.x} y={m.y} at={popAt(m.x, i)}>
                <Monument id={m.id} x={m.x} y={m.y} scale={m.scale} tones={m.tones} detailed light={m.x > SUN_X ? "left" : "right"} />
              </Pop>
            ))}
          </Rise>
        </g>
        <g transform={`translate(${par(0.5)} ${top}) scale(${scale})`}>
          <Rise at={14} depth={0.6}>
            <path d={land.pines} fill="#3D7F63" />
            <path d={land.cypress} fill="#2F6E58" />
            {land.rounds.map((r) => (
              <g key={r.x}>
                <path d={r.body} fill={r.c} />
                <path d={r.light} fill="#FFFFFF" opacity={0.18} />
              </g>
            ))}
          </Rise>
        </g>
        <g transform={`translate(${par(0.7)} ${top}) scale(${scale})`}>
          <Rise at={16} depth={0.8}>
            <path d={land.front} fill="url(#fin-front)" />
            <path d={land.frontHatch} fill="none" stroke="#9BD0AC" strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />
            {Object.entries(land.flowers).map(([c, d]) => (
              <path key={c} d={d} fill={c} opacity={0.9} />
            ))}
            {land.palms.map((p, i) => (
              <g key={p.x} transform={`rotate(${Math.sin(frame / 22 + i * 1.7) * 1.6} ${p.x} ${p.y})`}>
                <path d={palmTree(p.x, p.y, p.h, p.b, p.s)} fill="#2C6E5A" />
              </g>
            ))}
          </Rise>
        </g>
      </svg>

      {/* Haze behind the logo so it sits clean on the sky. */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${v("50% 46%", "80% 30%")} at 50% ${v("30%", "24%")}, rgba(244,248,249,${0.75 * logo}) 0%, rgba(244,248,249,0) 70%)` }} />

      {/* The mark resolves: orbit draws, globe swells, plane lands in place. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: v(70, 400), display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ opacity: logo > 0 ? 1 : 0, transform: `translateY(${(1 - logo) * 30}px)` }}>
          <Emblem size={v(190, 230)} orbit={logo} globe={globe} theta={PLANE_REST + (1 - logo) * Math.PI * 2.2} halo={logo} plane={logo > 0.05 ? 1 : 0} />
        </div>
        <div style={{ display: "flex", marginTop: v(-28, -30), fontFamily: F.display, fontSize: v(190, 196), lineHeight: 1, color: C.ink, letterSpacing: "-0.02em" }}>
          {letters.map((l, i) => {
            const p = prog(frame, t.wordAt + i * 3, 26);
            return (
              <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.1em" }}>
                <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)`, color: i >= 2 ? C.brand : C.ink, fontStyle: i >= 2 ? "italic" : undefined }}>{l}</span>
              </span>
            );
          })}
        </div>
        <div style={{ opacity: prog(frame, t.taglineAt, 20), transform: `translateY(${(1 - prog(frame, t.taglineAt, 24)) * 16}px)`, marginTop: v(4, 6) }}>
          <Eyebrow color={C.ink2} style={{ fontSize: v(26, 28), letterSpacing: "0.32em" }}>
            The world is waiting
          </Eyebrow>
        </div>
        <div
          style={{
            marginTop: v(30, 40),
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: v("20px 34px", "24px 40px"),
            borderRadius: 999,
            background: C.ink,
            color: C.paper,
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: v(30, 36),
            boxShadow: "0 24px 50px -16px rgba(10,30,44,0.5)",
            transform: `scale(${cta})`,
            opacity: Math.min(1, cta * 2),
          }}
        >
          Plan your first trip free <ArrowRight size={v(30, 36)} color={C.sun2} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Rises a monument out of the ground with a little overshoot. */
function Pop({ x, y, at, children }: { x: number; y: number; at: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const s = spr(frame, at, BOUNCE);
  if (frame < at) return null;
  return <g transform={`translate(${x} ${y}) scale(${lerp(0.6, 1, Math.min(1, s))} ${s}) translate(${-x} ${-y})`}>{children}</g>;
}

/** Clouds drifting and a few birds flapping across the sky. */
function Sky({ W, H, frame, birds }: { W: number; H: number; frame: number; birds: number }) {
  const clouds = [
    { x: 0.05, y: 0.16, w: 420, seed: 3, speed: 0.5 },
    { x: 0.62, y: 0.1, w: 340, seed: 9, speed: 0.35 },
    { x: 0.32, y: 0.3, w: 240, seed: 14, speed: 0.6 },
    { x: 0.82, y: 0.32, w: 280, seed: 21, speed: 0.45 },
  ];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {clouds.map((c, i) => {
        const x = ((c.x * W + frame * c.speed + 400) % (W + 600)) - 400;
        return (
          <g key={i} transform={`translate(${x} ${c.y * H})`}>
            <path d={cloudPath(0, 14, c.w, c.seed)} fill="#F6E4CB" opacity={0.9} />
            <path d={cloudPath(0, 0, c.w, c.seed)} fill="#FFFFFF" opacity={0.95} />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => {
        const x = W * 0.15 + frame * 1.6 + i * 46;
        const y = H * 0.36 + Math.sin(i * 2) * 26 + Math.sin(frame / 30 + i) * 6;
        const flap = 0.6 + 0.4 * Math.sin(frame / 3 + i);
        return <path key={i} d={BIRD_PATH} opacity={birds} transform={`translate(${x} ${y}) scale(2.4 ${2.4 * flap})`} stroke="#3E6170" strokeWidth={1.4} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
}

export const finaleCues = ({ dur, variant, beat }: SceneProps): Cue[] => {
  const t = timing(variant, beat, dur);
  return [
    { at: 0, sfx: "ambience", gain: 0.55 },
    { at: 0, sfx: "riser", gain: 0.5 },
    ...[0, 2, 4, 6].map((i) => ({ at: t.popStart + i * t.pop, sfx: "pop" as const, gain: 0.3 })),
    { at: t.logoAt, sfx: "shimmer", gain: 0.8 },
    { at: t.wordAt, sfx: "hit", gain: 0.9 },
  ];
};
