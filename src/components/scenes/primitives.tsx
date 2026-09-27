import type { CSSProperties, ReactNode } from "react";
import { BIRD_PATH, cloudPath, mulberry32, r1, starField } from "./geometry";
import { getMonument, type MonumentId, type Tone } from "./monuments";

export const VIEW_W = 1600;
export const VIEW_H = 1000;

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * A parallax depth plane. The outer group follows the pointer, the inner group
 * plays the "pop-up book" rise when a scene enters.
 */
export function Layer({ depth, children }: { depth: number; children: ReactNode }) {
  return (
    <g className="scene-layer" style={{ "--d": depth } as Vars}>
      <g className="scene-rise">{children}</g>
    </g>
  );
}

export function Sky({ uid, stops }: { uid: string; stops: [number, string][] }) {
  const id = `${uid}-sky`;
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${id})`} />
    </>
  );
}

export function Sun({
  uid,
  x,
  y,
  r,
  color,
  glow,
  halo = 4.2,
  haloOpacity = 0.5,
}: {
  uid: string;
  x: number;
  y: number;
  r: number;
  color: string;
  glow: string;
  halo?: number;
  haloOpacity?: number;
}) {
  const id = `${uid}-halo-${Math.round(x)}`;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={glow} stopOpacity={haloOpacity} />
          <stop offset="0.35" stopColor={glow} stopOpacity={haloOpacity * 0.35} />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="scene-breathe" cx={x} cy={y} r={r * halo} fill={`url(#${id})`} />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
}

export function Stars({
  seed,
  count,
  color = "#fff",
  maxY = 520,
  opacity = 0.9,
}: {
  seed: number;
  count: number;
  color?: string;
  maxY?: number;
  opacity?: number;
}) {
  const stars = starField(seed, count, VIEW_W, maxY);
  return (
    <g fill={color} opacity={opacity}>
      {stars.map((s) => (
        <circle
          key={s.i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          className={s.twinkle ? "scene-twinkle" : undefined}
          style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          opacity={s.twinkle ? undefined : 0.35 + (s.r / 2) * 0.5}
        />
      ))}
    </g>
  );
}

export function Clouds({
  items,
  color,
  opacity = 0.6,
}: {
  items: { x: number; y: number; w: number; seed: number; speed?: number }[];
  color: string;
  opacity?: number;
}) {
  return (
    <g fill={color} opacity={opacity}>
      {items.map((c, i) => (
        <g key={i} className="scene-drift" style={{ animationDuration: `${c.speed ?? 46}s`, animationDelay: `${-i * 7}s` }}>
          <path d={cloudPath(c.x, c.y, c.w, c.seed)} />
        </g>
      ))}
    </g>
  );
}

export function Monument({
  id,
  x,
  y,
  scale = 1,
  tones,
  className,
}: {
  id: MonumentId;
  x: number;
  y: number;
  scale?: number;
  tones: Partial<Record<Tone, string>>;
  className?: string;
}) {
  const m = getMonument(id);
  return (
    <g transform={`translate(${r1(x)} ${r1(y - m.ground * scale)}) scale(${scale})`} className={className}>
      {m.layers.map((l, i) =>
        l.stroke ? (
          <path key={i} d={l.d} fill="none" stroke={tones[l.tone] ?? tones.body} strokeWidth={l.stroke} />
        ) : (
          <path key={i} d={l.d} fill={tones[l.tone] ?? tones.body} fillRule={l.rule ?? "nonzero"} />
        )
      )}
    </g>
  );
}

/** Mirror children across a horizontal waterline, fading with depth. */
export function Reflection({
  uid,
  y,
  opacity = 0.35,
  children,
}: {
  uid: string;
  y: number;
  opacity?: number;
  children: ReactNode;
}) {
  const id = `${uid}-refl-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y={y} width={VIEW_W} height={VIEW_H - y}>
          <rect x="0" y={y} width={VIEW_W} height={Math.min(VIEW_H - y, 420)} fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <g mask={`url(#${id})`} opacity={opacity}>
        <g className="scene-ripple">
          <g transform={`translate(0 ${2 * y}) scale(1 -1)`}>{children}</g>
        </g>
      </g>
    </g>
  );
}

export function Water({
  uid,
  y,
  top,
  bottom,
  sunX,
  sunColor,
  seed = 7,
  lines = 34,
  lineColor = "#ffffff",
}: {
  uid: string;
  y: number;
  top: string;
  bottom: string;
  sunX?: number;
  sunColor?: string;
  seed?: number;
  lines?: number;
  lineColor?: string;
}) {
  const id = `${uid}-water-${Math.round(y)}`;
  const rand = mulberry32(seed);
  const shimmer = Array.from({ length: lines }, (_, i) => {
    const t = Math.pow(rand(), 1.4);
    const ly = y + 8 + t * (VIEW_H - y - 10);
    return {
      x: r1(rand() * VIEW_W),
      y: r1(ly),
      w: r1(18 + t * 90 + rand() * 30),
      delay: r1(rand() * 5),
      i,
    };
  });
  const column: { y: number; w: number; delay: number }[] = [];
  if (sunX !== undefined) {
    for (let ly = y + 6, k = 0; ly < VIEW_H; ly += 9 + k * 0.7, k++) {
      column.push({ y: r1(ly), w: r1(40 + k * 5 + rand() * 40), delay: r1(rand() * 3) });
    }
  }
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x="0" y={y} width={VIEW_W} height={VIEW_H - y} fill={`url(#${id})`} />
      <g fill={lineColor}>
        {shimmer.map((s) => (
          <rect
            key={s.i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={1.6}
            rx={0.8}
            className="scene-shimmer"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </g>
      {sunX !== undefined && sunColor && (
        <g fill={sunColor}>
          {column.map((c, i) => (
            <rect
              key={i}
              x={sunX - c.w / 2}
              y={c.y}
              width={c.w}
              height={2.6}
              rx={1.3}
              className="scene-shimmer"
              style={{ animationDelay: `${c.delay}s` }}
            />
          ))}
        </g>
      )}
    </g>
  );
}

export function Birds({
  x,
  y,
  count = 4,
  color,
  scale = 1,
  duration = 38,
  delay = 0,
  seed = 5,
}: {
  x: number;
  y: number;
  count?: number;
  color: string;
  scale?: number;
  duration?: number;
  delay?: number;
  seed?: number;
}) {
  const rand = mulberry32(seed);
  const flock = Array.from({ length: count }, (_, i) => ({
    dx: r1(i * 26 + rand() * 18),
    dy: r1((rand() - 0.5) * 34),
    s: r1(0.7 + rand() * 0.6),
    d: r1(rand() * 0.6),
  }));
  return (
    <g className="scene-fly" style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {flock.map((b, i) => (
          <g key={i} transform={`translate(${b.dx} ${b.dy}) scale(${b.s})`}>
            <path
              d={BIRD_PATH}
              className="scene-flap"
              style={{ animationDelay: `${b.d}s` }}
              fill="none"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Horizontal band of mist that slowly breathes and drifts. */
export function Mist({
  uid,
  y,
  h,
  color = "#ffffff",
  opacity = 0.55,
  speed = 40,
}: {
  uid: string;
  y: number;
  h: number;
  color?: string;
  opacity?: number;
  speed?: number;
}) {
  const id = `${uid}-mist-${Math.round(y)}`;
  return (
    <g className="scene-drift" style={{ animationDuration: `${speed}s` }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={-120} y={y - h / 2} width={VIEW_W + 240} height={h} fill={`url(#${id})`} />
    </g>
  );
}
