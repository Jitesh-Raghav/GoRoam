import { Navigation, Route, TrainFront } from "lucide-react";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { lerp, prog, rand, spr, BOUNCE } from "../anim";
import { Cursor, Eyebrow, Ripple } from "../components/kit";
import { CATEGORY, DAYS } from "../data";
import { useFormat } from "../format";
import { wordMatch, type Cue, type SceneProps } from "../scene";
import type { Variant } from "../script";
import { C, E, F, SHADOW_DARK } from "../theme";
import type { PlacedBeat } from "../timeline";

const DAY = DAYS[0];
// Central Tokyo, wide enough for Asakusa, Tsukiji and Shibuya.
const LNG: [number, number] = [139.672, 139.83];
const LAT: [number, number] = [35.638, 35.73];

type Box = { x0: number; y0: number; x1: number; y1: number };
type Pt = [number, number];

const SUMIDA: Pt[] = [
  [139.812, 35.735],
  [139.803, 35.722],
  [139.797, 35.71],
  [139.794, 35.698],
  [139.791, 35.686],
  [139.787, 35.675],
  [139.781, 35.664],
  [139.775, 35.655],
];
// Tokyo Bay's shore, then out around the corner of the frame.
const BAY: Pt[] = [
  [139.745, 35.62],
  [139.758, 35.638],
  [139.769, 35.648],
  [139.776, 35.654],
  [139.79, 35.658],
  [139.81, 35.652],
  [139.84, 35.645],
  [139.95, 35.64],
  [139.95, 35.5],
  [139.7, 35.5],
];
// The Yamanote line, Tokyo's loop.
const YAMANOTE: Pt[] = [
  [139.767, 35.681],
  [139.774, 35.698],
  [139.777, 35.713],
  [139.761, 35.727],
  [139.739, 35.733],
  [139.711, 35.73],
  [139.703, 35.71],
  [139.7, 35.69],
  [139.702, 35.67],
  [139.701, 35.658],
  [139.716, 35.645],
  [139.739, 35.628],
  [139.746, 35.645],
  [139.759, 35.666],
  [139.767, 35.681],
];
const PARKS: { at: Pt; r: number }[] = [
  { at: [139.7528, 35.6852], r: 0.0075 }, // Imperial Palace
  { at: [139.7714, 35.7148], r: 0.0045 }, // Ueno Park
  { at: [139.6949, 35.6717], r: 0.0058 }, // Yoyogi Park
  { at: [139.7101, 35.6852], r: 0.0042 }, // Shinjuku Gyoen
  { at: [139.7613, 35.6595], r: 0.0026 }, // Hama-rikyu
];
const LABELS: { t: string; at: Pt; big?: boolean }[] = [
  { t: "UENO", at: [139.774, 35.7095] },
  { t: "SHINJUKU", at: [139.7005, 35.6955] },
  { t: "HARAJUKU", at: [139.704, 35.6705] },
  { t: "ROPPONGI", at: [139.731, 35.6627] },
  { t: "AKIHABARA", at: [139.7735, 35.6985] },
];

function beats(variant: Variant, beat: PlacedBeat, dur: number) {
  const pinned = wordMatch(beat, /^pinned/i, variant === "film" ? 20 : 8);
  const pinAt = Math.max(10, pinned - 14);
  const route = wordMatch(beat, /^route/i, pinAt + 30);
  const tap = Math.min(wordMatch(beat, /^tap/i, dur - 40), dur - 26);
  return { pinAt, routeAt: Math.min(route - 8, pinAt + 34), tap };
}

/** "Every stop is pinned. The whole day's route, one tap away." */
export function MapScene({ dur, variant, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, vertical, v } = useFormat();
  const b = beats(variant, beat, dur);

  const box: Box = vertical ? { x0: -40, y0: 230, x1: 1120, y1: 1110 } : { x0: 40, y0: 40, x1: 1300, y1: 1040 };
  const proj = ([lng, lat]: Pt): Pt => [
    box.x0 + ((lng - LNG[0]) / (LNG[1] - LNG[0])) * (box.x1 - box.x0),
    box.y1 - ((lat - LAT[0]) / (LAT[1] - LAT[0])) * (box.y1 - box.y0),
  ];
  const line = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${proj(p).map((n) => n.toFixed(1)).join(" ")}`).join("");

  const streets = useMemo(() => {
    // Procedural street grid: short runs whose orientation drifts across the city.
    let minor = "";
    let major = "";
    for (let i = 0; i < 520; i++) {
      const x = rand(i * 1.7) * W;
      const y = rand(i * 3.3) * H;
      const base = Math.sin(x / 400) * 0.5 + Math.cos(y / 300) * 0.4;
      const a = base + (rand(i * 5.1) > 0.5 ? Math.PI / 2 : 0);
      const l = 50 + rand(i * 7.9) * 160;
      minor += `M${(x - Math.cos(a) * l).toFixed(1)} ${(y - Math.sin(a) * l).toFixed(1)}L${(x + Math.cos(a) * l).toFixed(1)} ${(y + Math.sin(a) * l).toFixed(1)}`;
    }
    for (let i = 0; i < 14; i++) {
      const y0 = rand(i * 11.1) * H;
      const x0 = -50;
      let d = `M${x0} ${y0.toFixed(1)}`;
      let y = y0;
      for (let x = 150; x <= W + 200; x += 200) {
        y += (rand(i * 13 + x) - 0.5) * 140;
        d += `Q${(x - 100).toFixed(1)} ${(y + (rand(x + i) - 0.5) * 60).toFixed(1)} ${x} ${y.toFixed(1)}`;
      }
      major += d;
    }
    return { minor, major };
  }, [W, H]);

  const stops = DAY.stops.map((s) => proj([s.lng, s.lat]));
  // A gentle curve between consecutive stops.
  const routeD = stops
    .map((p, i) => {
      if (!i) return `M${p[0]} ${p[1]}`;
      const q = stops[i - 1];
      const mx = (p[0] + q[0]) / 2 + (q[1] - p[1]) * 0.18;
      const my = (p[1] + q[1]) / 2 + (p[0] - q[0]) * 0.18;
      return `Q${mx} ${my} ${p[0]} ${p[1]}`;
    })
    .join("");
  const routeP = prog(frame, b.routeAt, 46, E.inOutQuart);
  const dotT = (frame - b.routeAt) / 60;

  // Camera settles in from a closer, tilted angle, then drifts.
  const settle = prog(frame, 0, 40, E.outExpo);
  const cam = `scale(${lerp(1.28, 1, settle) + interpolate(frame, [40, dur], [0, 0.03], { extrapolateLeft: "clamp" })}) rotate(${lerp(-4, 0, settle)}deg)`;
  const centroid: Pt = [(stops[0][0] + stops[1][0] + stops[2][0]) / 3, (stops[0][1] + stops[1][1] + stops[2][1]) / 3];

  const panel = spr(frame, 14, { damping: 18, stiffness: 120 });
  const press = frame >= b.tap ? Math.max(0, 1 - spr(frame, b.tap, { damping: 10, stiffness: 260, mass: 0.5 })) : 0;
  const button = vertical ? { x: 540, y: 1318 } : { x: 1550, y: 836 };
  const cIn = prog(frame, b.tap - 24, 22, E.outQuart);
  const opened = prog(frame, b.tap + 6, 12);

  return (
    <AbsoluteFill style={{ background: "#0b1d29", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: cam, transformOrigin: `${centroid[0]}px ${centroid[1]}px` }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="map-glow">
              <feGaussianBlur stdDeviation={8} />
            </filter>
            <radialGradient id="map-water" cx="0.7" cy="0.8" r="0.8">
              <stop offset="0" stopColor="#0f3a4f" />
              <stop offset="1" stopColor="#0b2a3a" />
            </radialGradient>
          </defs>
          <path d={streets.minor} stroke="#16384a" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d={streets.major} stroke="#1f4a5f" strokeWidth={5} fill="none" strokeLinecap="round" />
          {PARKS.map((p, i) => {
            const [x, y] = proj(p.at);
            const r = (p.r / (LNG[1] - LNG[0])) * (box.x1 - box.x0);
            return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.82} fill="#123c33" opacity={0.95} />;
          })}
          <path d={`${line(BAY)}Z`} fill="url(#map-water)" />
          <path d={line(SUMIDA)} stroke="#0f3a4f" strokeWidth={v(26, 22)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={line(YAMANOTE)} stroke="#6fbf73" strokeOpacity={0.28} strokeWidth={5} fill="none" strokeDasharray="2 12" strokeLinecap="round" />
          {LABELS.map((l) => {
            const [x, y] = proj(l.at);
            return (
              <text key={l.t} x={x} y={y} fill="#5f8494" fontFamily={F.mono} fontSize={v(19, 20)} letterSpacing="0.22em" textAnchor="middle">
                {l.t}
              </text>
            );
          })}
          {!vertical && <text {...(() => {
            const [x, y] = proj([139.8, 35.643]);
            return { x, y };
          })()} fill="#3f6f84" fontFamily={F.display} fontStyle="italic" fontSize={v(44, 40)} textAnchor="middle">
            Tokyo Bay
          </text>}

          {/* The day's route */}
          <path d={routeD} stroke={C.brand2} strokeWidth={14} fill="none" filter="url(#map-glow)" opacity={0.6} pathLength={1} strokeDasharray={`${routeP} 1`} strokeLinecap="round" />
          <path d={routeD} stroke={C.brand2} strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${routeP} 1`} strokeLinecap="round" />
          {routeP >= 1 && <path d={routeD} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={3} fill="none" strokeDasharray="10 22" strokeDashoffset={-frame * 2} strokeLinecap="round" />}
        </svg>

        {routeP > 0.02 && <TravelDot stops={stops} t={routeP < 1 ? routeP : dotT % 1} W={W} H={H} />}

        {DAY.stops.map((s, i) => {
          const at = b.pinAt + i * 7;
          const drop = spr(frame, at, BOUNCE);
          const [x, y] = stops[i];
          const cat = CATEGORY[s.cat];
          if (frame < at) return null;
          const label = spr(frame, at + 8);
          const left = !vertical && i === 2 ? false : x > (vertical ? 700 : 1000);
          return (
            <div key={s.name}>
              <Ripple x={x} y={y} start={at + 6} color={cat.color} />
              <div style={{ position: "absolute", left: x - 26, top: y - 8, width: 52, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.45)", transform: `scale(${drop})`, filter: "blur(3px)" }} />
              <div style={{ position: "absolute", left: x - 30, top: y - 74 - (1 - drop) * 120, width: 60, height: 74, opacity: Math.min(1, drop * 2) }}>
                <svg width={60} height={74} viewBox="0 0 60 74">
                  <path d="M30 72C30 72 4 44 4 28A26 26 0 1 1 56 28C56 44 30 72 30 72Z" fill={cat.color} stroke="#fff" strokeWidth={4} />
                  <text x={30} y={37} textAnchor="middle" fill="#fff" fontFamily={F.sans} fontWeight={700} fontSize={26}>
                    {i + 1}
                  </text>
                </svg>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: y - 64,
                  ...(left ? { right: W - x + 40 } : { left: x + 40 }),
                  padding: "12px 20px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.96)",
                  boxShadow: "0 16px 36px -12px rgba(0,0,0,0.6)",
                  fontFamily: F.sans,
                  transform: `scale(${label})`,
                  transformOrigin: left ? "right center" : "left center",
                  opacity: label,
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 600, color: C.ink }}>{s.name}</div>
                <div style={{ fontSize: 19, color: C.stone, marginTop: 2 }}>
                  {s.time} · {s.area}
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Edge fade so the map sits in darkness. */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 85% at 45% 50%, transparent 55%, rgba(6,19,27,0.85) 100%)" }} />

      {/* Day panel */}
      <div
        style={{
          position: "absolute",
          ...(vertical ? { left: 56, right: 56, top: 1070 } : { left: 1270, width: 560, top: 150 }),
          borderRadius: 34,
          padding: vertical ? "28px 32px 138px" : "34px 34px 34px",
          background: "rgba(14,38,52,0.82)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: SHADOW_DARK,
          color: C.paper,
          transform: vertical ? `translateY(${(1 - panel) * 300}px)` : `translateX(${(1 - panel) * 640}px)`,
        }}
      >
        <Eyebrow color={C.brand2}>
          Day 1 · {DAY.date} · {DAY.city}
        </Eyebrow>
        <div style={{ fontFamily: F.display, fontSize: v(56, 58), lineHeight: 1.02, marginTop: 12 }}>{DAY.theme}</div>
        {!vertical && (
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 0 }}>
            {DAY.stops.map((s, i) => {
              const r = prog(frame, b.pinAt + i * 7 + 4, 16);
              return (
                <div key={s.name} style={{ opacity: r, transform: `translateX(${(1 - r) * 30}px)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: CATEGORY[s.cat].color, display: "grid", placeItems: "center", fontFamily: F.sans, fontWeight: 700, fontSize: 21, flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 26 }}>{s.name}</div>
                      <div style={{ fontFamily: F.sans, fontSize: 19, color: C.stone2 }}>
                        {s.time} · {s.area}
                      </div>
                    </div>
                  </div>
                  {i < 2 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 8px 19px", paddingLeft: 36, borderLeft: `2px dashed rgba(255,255,255,0.18)`, height: 40, fontFamily: F.sans, fontSize: 19, color: C.stone2 }}>
                      <TrainFront size={18} color={C.brand2} /> {i ? "Hibiya line · 26 min" : "Ginza line · 18 min"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: v(26, 14), fontFamily: F.sans, fontSize: 21, color: C.stone2 }}>
          <Route size={20} color={C.brand2} /> 3 stops · 11.4 km · by transit
        </div>
      </div>

      {/* Open in Google Maps */}
      <div
        style={{
          position: "absolute",
          left: button.x - v(240, 460),
          top: button.y - 48,
          width: v(480, 920),
          height: 96,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: opened > 0 ? `linear-gradient(90deg, ${C.brand}, ${C.brand2})` : C.paper,
          color: opened > 0 ? C.white : C.ink,
          fontFamily: F.sans,
          fontWeight: 600,
          fontSize: 30,
          boxShadow: `0 20px 40px -14px rgba(0,0,0,0.6), 0 0 0 ${opened * 12}px rgba(52,209,191,${0.3 * (1 - opened)})`,
          transform: `${vertical ? `translateY(${(1 - panel) * 300}px)` : `translateX(${(1 - panel) * 640}px)`} scale(${1 - press * 0.07})`,
        }}
      >
        <Navigation size={28} fill={opened > 0 ? C.white : "none"} />
        {opened > 0.5 ? "Opening Google Maps…" : "Open day in Maps"}
      </div>
      <Ripple x={button.x + v(60, 140)} y={button.y + 6} start={b.tap} />
      <Cursor x={lerp(W + 60, button.x + v(60, 140), cIn)} y={lerp(H + 60, button.y + 6, cIn)} press={press} opacity={cIn} />
    </AbsoluteFill>
  );
}

/** Point at t (0..1) along the stop-to-stop quadratic curves. */
function alongRoute(stops: Pt[], t: number): Pt {
  const segs = stops.length - 1;
  const f = Math.max(0, Math.min(0.9999, t)) * segs;
  const i = Math.floor(f);
  const u = f - i;
  const q = stops[i];
  const p = stops[i + 1];
  const c: Pt = [(p[0] + q[0]) / 2 + (q[1] - p[1]) * 0.18, (p[1] + q[1]) / 2 + (p[0] - q[0]) * 0.18];
  const m = 1 - u;
  return [m * m * q[0] + 2 * m * u * c[0] + u * u * p[0], m * m * q[1] + 2 * m * u * c[1] + u * u * p[1]];
}

/** A glowing dot riding the route. */
function TravelDot({ stops, t, W, H }: { stops: Pt[]; t: number; W: number; H: number }) {
  const [x, y] = alongRoute(stops, t);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <circle cx={x} cy={y} r={22} fill={C.brand2} opacity={0.25} />
      <circle cx={x} cy={y} r={10} fill="#fff" stroke={C.brand2} strokeWidth={5} />
    </svg>
  );
}

export const mapCues = ({ dur, variant, beat }: SceneProps): Cue[] => {
  const b = beats(variant, beat, dur);
  return [
    { at: 0, sfx: "whoosh", gain: 0.5 },
    ...[0, 1, 2].map((i) => ({ at: b.pinAt + i * 7, sfx: "pin" as const, gain: 0.7 })),
    { at: b.routeAt, sfx: "swoosh", gain: 0.45 },
    { at: b.tap, sfx: "click", gain: 0.9 },
  ];
};
