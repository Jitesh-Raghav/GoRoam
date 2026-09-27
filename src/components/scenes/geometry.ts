/**
 * Geometry toolkit for the illustrated destination scenes.
 *
 * Everything here is deterministic (seeded), so server and client render
 * identical SVG and hydration never mismatches.
 */

export type Pt = [number, number];

/** Round to one decimal to keep path strings compact. */
export const r1 = (n: number) => Math.round(n * 10) / 10;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* -------------------------------------------------------------------------- */
/*                                Path builder                                */
/* -------------------------------------------------------------------------- */

export class PathBuilder {
  private parts: string[] = [];

  M(x: number, y: number) {
    this.parts.push(`M${r1(x)} ${r1(y)}`);
    return this;
  }
  L(x: number, y: number) {
    this.parts.push(`L${r1(x)} ${r1(y)}`);
    return this;
  }
  H(x: number) {
    this.parts.push(`H${r1(x)}`);
    return this;
  }
  V(y: number) {
    this.parts.push(`V${r1(y)}`);
    return this;
  }
  Q(cx: number, cy: number, x: number, y: number) {
    this.parts.push(`Q${r1(cx)} ${r1(cy)} ${r1(x)} ${r1(y)}`);
    return this;
  }
  C(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
    this.parts.push(`C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(x)} ${r1(y)}`);
    return this;
  }
  A(rx: number, ry: number, rot: number, large: 0 | 1, sweep: 0 | 1, x: number, y: number) {
    this.parts.push(`A${r1(rx)} ${r1(ry)} ${rot} ${large} ${sweep} ${r1(x)} ${r1(y)}`);
    return this;
  }
  Z() {
    this.parts.push("Z");
    return this;
  }
  raw(d: string) {
    this.parts.push(d);
    return this;
  }
  toString() {
    return this.parts.join("");
  }
}

/* -------------------------------------------------------------------------- */
/*                      Symmetric outlines (mirror a half)                    */
/* -------------------------------------------------------------------------- */

export type Seg =
  | { t: "L"; p: Pt }
  | { t: "Q"; c: Pt; p: Pt }
  | { t: "C"; c1: Pt; c2: Pt; p: Pt };

export const L = (x: number, y: number): Seg => ({ t: "L", p: [x, y] });
export const Q = (cx: number, cy: number, x: number, y: number): Seg => ({
  t: "Q",
  c: [cx, cy],
  p: [x, y],
});
export const C = (
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  x: number,
  y: number
): Seg => ({ t: "C", c1: [c1x, c1y], c2: [c2x, c2y], p: [x, y] });

/**
 * Build a closed, mirror-symmetric outline around x = cx.
 * `start` and the final segment's end point must sit on the axis (x = 0);
 * the segments describe the right half, top to bottom.
 */
export function symmetric(start: Pt, segs: Seg[], cx = 0): string {
  const b = new PathBuilder();
  b.M(cx + start[0], start[1]);
  const points: Pt[] = [start];
  for (const s of segs) {
    if (s.t === "L") b.L(cx + s.p[0], s.p[1]);
    else if (s.t === "Q") b.Q(cx + s.c[0], s.c[1], cx + s.p[0], s.p[1]);
    else b.C(cx + s.c1[0], s.c1[1], cx + s.c2[0], s.c2[1], cx + s.p[0], s.p[1]);
    points.push(s.p);
  }
  // Walk back up the mirrored left side.
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    const prev = points[i];
    if (s.t === "L") b.L(cx - prev[0], prev[1]);
    else if (s.t === "Q") b.Q(cx - s.c[0], s.c[1], cx - prev[0], prev[1]);
    else b.C(cx - s.c2[0], s.c2[1], cx - s.c1[0], s.c1[1], cx - prev[0], prev[1]);
  }
  b.Z();
  return b.toString();
}

/** A pointed (Mughal / gothic) arch opening, as a closed subpath. */
export function pointedArch(cx: number, bottom: number, halfW: number, springY: number, apexY: number) {
  const b = new PathBuilder();
  b.M(cx - halfW, bottom)
    .L(cx - halfW, springY)
    .C(cx - halfW, springY - (springY - apexY) * 0.55, cx - halfW * 0.35, apexY + (springY - apexY) * 0.2, cx, apexY)
    .C(cx + halfW * 0.35, apexY + (springY - apexY) * 0.2, cx + halfW, springY - (springY - apexY) * 0.55, cx + halfW, springY)
    .L(cx + halfW, bottom)
    .Z();
  return b.toString();
}

/** A round-topped arch opening (optionally elliptical). */
export function roundArch(cx: number, bottom: number, halfW: number, springY: number, rise = halfW) {
  const b = new PathBuilder();
  b.M(cx - halfW, bottom)
    .L(cx - halfW, springY)
    .A(halfW, rise, 0, 0, 1, cx + halfW, springY)
    .L(cx + halfW, bottom)
    .Z();
  return b.toString();
}

export function rect(x: number, y: number, w: number, h: number) {
  return `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
}

export function circle(cx: number, cy: number, r: number) {
  return `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(r * 2)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-r * 2)} 0Z`;
}

/* -------------------------------------------------------------------------- */
/*                             Procedural terrain                             */
/* -------------------------------------------------------------------------- */

export interface Ridge {
  d: string;
  /** Terrain height (svg y) at any x. */
  at: (x: number) => number;
}

export interface RidgeOptions {
  seed: number;
  /** Baseline y of the ridge. */
  y: number;
  /** Vertical range of the displacement. */
  amp: number;
  /** 0..1 – how quickly detail falls off (higher = more jagged). */
  rough?: number;
  /** 2^detail segments. */
  detail?: number;
  width?: number;
  bottom?: number;
  /** Extra shaping, returns a y offset for t in 0..1 (negative = higher). */
  shape?: (t: number) => number;
  /** Clamp the ridge so it never rises above this y. */
  minY?: number;
}

function buildRidge(heights: number[], width: number, bottom: number): Ridge {
  const n = heights.length - 1;
  let d = `M0 ${bottom}L0 ${r1(heights[0])}`;
  for (let i = 1; i <= n; i++) d += `L${r1((i / n) * width)} ${r1(heights[i])}`;
  d += `L${width} ${bottom}Z`;
  const at = (x: number) => {
    const f = Math.min(Math.max(x / width, 0), 1) * n;
    const i = Math.min(Math.floor(f), n - 1);
    const t = f - i;
    return heights[i] * (1 - t) + heights[i + 1] * t;
  };
  return { d, at };
}

/** Jagged mountain ridgeline via midpoint displacement. */
export function mountainRidge({
  seed,
  y,
  amp,
  rough = 0.52,
  detail = 7,
  width = 1600,
  bottom = 1000,
  shape,
  minY,
}: RidgeOptions): Ridge {
  const rand = mulberry32(seed);
  const n = 2 ** detail;
  const pts = new Array<number>(n + 1).fill(0);
  pts[0] = (rand() - 0.5) * amp;
  pts[n] = (rand() - 0.5) * amp;
  let step = n;
  let scale = amp;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      pts[i] = (pts[i - half] + pts[i + half]) / 2 + (rand() - 0.5) * scale;
    }
    scale *= rough;
    step = half;
  }
  const heights = pts.map((p, i) => {
    let v = y + p + (shape ? shape(i / n) : 0);
    if (minY !== undefined) v = Math.max(v, minY);
    return v;
  });
  return buildRidge(heights, width, bottom);
}

/** Smooth rolling hills / dunes from a handful of sine waves. */
export function rollingRidge({
  seed,
  y,
  amp,
  width = 1600,
  bottom = 1000,
  shape,
  waves = 3,
  samples = 120,
}: RidgeOptions & { waves?: number; samples?: number }): Ridge {
  const rand = mulberry32(seed);
  const comps = Array.from({ length: waves }, (_, k) => ({
    f: (k + 1) * (0.6 + rand() * 0.9),
    a: amp / (k + 1.2),
    p: rand() * Math.PI * 2,
  }));
  const heights: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    let v = y;
    for (const c of comps) v += Math.sin(t * Math.PI * 2 * c.f + c.p) * c.a * 0.5;
    if (shape) v += shape(t);
    heights.push(v);
  }
  return buildRidge(heights, width, bottom);
}

/* -------------------------------------------------------------------------- */
/*                                   Flora                                    */
/* -------------------------------------------------------------------------- */

/** Layered pine / fir silhouette with its base at (x, y). */
export function pineTree(x: number, y: number, h: number, w = h * 0.34) {
  const b = new PathBuilder();
  const tiers = 4;
  b.M(x, y - h);
  // right side, zig-zagging down
  for (let i = 1; i <= tiers; i++) {
    const ty = y - h + (h * 0.92 * i) / tiers;
    const tw = (w / 2) * (0.35 + (0.65 * i) / tiers);
    b.L(x + tw, ty);
    if (i < tiers) b.L(x + tw * 0.55, ty - h * 0.02);
  }
  b.L(x + w * 0.06, y - h * 0.08).L(x + w * 0.06, y).L(x - w * 0.06, y).L(x - w * 0.06, y - h * 0.08);
  for (let i = tiers; i >= 1; i--) {
    const ty = y - h + (h * 0.92 * i) / tiers;
    const tw = (w / 2) * (0.35 + (0.65 * i) / tiers);
    if (i < tiers) b.L(x - tw * 0.55, ty - h * 0.02);
    b.L(x - tw, ty);
  }
  b.Z();
  return b.toString();
}

/** Tall, flame-shaped cypress (Mughal gardens, Tuscany). */
export function cypressTree(x: number, y: number, h: number, w = h * 0.22) {
  const b = new PathBuilder();
  b.M(x, y)
    .C(x + w * 0.9, y - h * 0.12, x + w * 0.62, y - h * 0.72, x, y - h)
    .C(x - w * 0.62, y - h * 0.72, x - w * 0.9, y - h * 0.12, x, y)
    .Z();
  return b.toString();
}

export function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(rx * 2)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-rx * 2)} 0Z`;
}

/** Italian stone pine: slim leaning trunk with a flat, cloud-like crown. */
export function umbrellaPine(x: number, y: number, h: number, lean = 0.08, seed = 1) {
  const rand = mulberry32(seed);
  const w = h * 1.15;
  const crownBottom = y - h * 0.6;
  const crownH = h * 0.4;
  const cx = x + h * lean;
  const tw = Math.max(h * 0.028, 1.6);
  const b = new PathBuilder();
  b.M(x - tw, y)
    .Q(x + h * lean * 0.25 - tw, y - h * 0.4, cx - tw * 0.7, crownBottom + 2)
    .L(cx + tw * 0.7, crownBottom + 2)
    .Q(x + h * lean * 0.25 + tw, y - h * 0.4, x + tw, y)
    .Z();
  // fork into the crown
  b.M(cx - tw * 0.6, crownBottom + 4)
    .L(cx - w * 0.22, crownBottom - crownH * 0.1)
    .L(cx - w * 0.2, crownBottom - crownH * 0.22)
    .L(cx, crownBottom - 2)
    .Z();
  let d = b.toString();
  const puffs = 6;
  for (let i = 0; i < puffs; i++) {
    const t = i / (puffs - 1);
    const ex = cx - w * 0.36 + t * w * 0.72 + (rand() - 0.5) * w * 0.05;
    const lift = Math.sin(Math.PI * t) * 0.35 + 0.35;
    const ey = crownBottom - crownH * lift;
    d += ellipse(ex, ey, w * (0.15 + rand() * 0.05), crownH * (0.36 + rand() * 0.14));
  }
  d += ellipse(cx, crownBottom - crownH * 0.28, w * 0.44, crownH * 0.3);
  return d;
}

/** Coconut palm: curved trunk and drooping fronds. */
export function palmTree(x: number, y: number, h: number, bend = 0.25, seed = 3) {
  const rand = mulberry32(seed);
  const topX = x + h * bend;
  const topY = y - h;
  const b = new PathBuilder();
  b.M(x - 5, y)
    .Q(x + h * bend * 0.2 - 4, y - h * 0.55, topX - 2.5, topY)
    .L(topX + 2.5, topY)
    .Q(x + h * bend * 0.2 + 4, y - h * 0.55, x + 5, y)
    .Z();
  const fronds = 10;
  for (let i = 0; i < fronds; i++) {
    // Fan the fronds from left to right; each arches out, then droops.
    const a = -Math.PI * 0.98 + (Math.PI * 0.96 * i) / (fronds - 1) + (rand() - 0.5) * 0.2;
    const dx = Math.cos(a);
    const up = -Math.sin(a); // 0 (sideways) .. 1 (straight up)
    const len = h * (0.3 + rand() * 0.1) * (1 - up * 0.3);
    const p0: Pt = [topX, topY];
    const p1: Pt = [topX + dx * len * 0.55, topY - len * (0.18 + up * 0.4)];
    const p2: Pt = [topX + dx * len, topY + len * (0.6 - up * 0.7)];
    const at = (t: number): Pt => [
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
    ];
    const steps = 9;
    const spine = Array.from({ length: steps + 1 }, (_, k) => at(k / steps));
    b.M(spine[0][0], spine[0][1] - 1.5);
    for (let k = 1; k <= steps; k++) b.L(spine[k][0], spine[k][1] - 1.5 * (1 - k / steps));
    // feathery leaflets hanging from the spine, walked back to the crown
    for (let k = steps - 1; k >= 1; k--) {
      const t = k / steps;
      const [sx, sy] = spine[k];
      const [nx0, ny0] = spine[k + 1];
      const tx = nx0 - sx;
      const ty = ny0 - sy;
      const tl = Math.hypot(tx, ty) || 1;
      const leaf = len * 0.2 * Math.sin(Math.PI * Math.min(t * 1.15, 1));
      b.L(sx + (tx / tl) * leaf * 0.45, sy + (ty / tl) * leaf * 0.45 + leaf * 0.9);
      b.L(sx - (tx / tl) * 1.5, sy + 1.2);
    }
    b.Z();
  }
  // crown knot / coconuts
  b.raw(ellipse(topX, topY + 3, 5.5, 4.5));
  return b.toString();
}

/** Round-canopy tree built from overlapping circles (returns circles for blossom tinting). */
export function canopyBlobs(x: number, y: number, r: number, count: number, seed: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r;
    return { cx: x + Math.cos(a) * d * 1.25, cy: y + Math.sin(a) * d * 0.7, r: r * (0.32 + rand() * 0.3), k: rand() };
  });
}

/** A forest of pines standing on a ridge. */
export function forestOnRidge(
  ridge: Ridge,
  { seed, from = 0, to = 1600, density = 0.06, minH = 18, maxH = 48, gapChance = 0.12 }: {
    seed: number;
    from?: number;
    to?: number;
    density?: number;
    minH?: number;
    maxH?: number;
    gapChance?: number;
  }
) {
  const rand = mulberry32(seed);
  let d = "";
  let x = from;
  while (x < to) {
    const h = minH + rand() * (maxH - minH);
    if (rand() > gapChance) d += pineTree(x, ridge.at(x) + 3, h);
    x += (1 / density) * (0.4 + rand() * 0.9);
  }
  return d;
}

/* -------------------------------------------------------------------------- */
/*                                Sky details                                 */
/* -------------------------------------------------------------------------- */

export function starField(seed: number, count: number, width = 1600, maxY = 560) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    x: r1(rand() * width),
    y: r1(Math.pow(rand(), 1.6) * maxY),
    r: r1(0.5 + rand() * 1.3),
    twinkle: rand() > 0.55,
    delay: r1(rand() * 6),
    i,
  }));
}

/** Soft, flat-bottomed cloud outline. */
export function cloudPath(x: number, y: number, w: number, seed: number) {
  const rand = mulberry32(seed);
  const bumps = 3 + Math.floor(rand() * 3);
  const b = new PathBuilder();
  const h = w * 0.16;
  b.M(x, y);
  let cx = x;
  for (let i = 0; i < bumps; i++) {
    const seg = (w / bumps) * (0.8 + rand() * 0.4);
    const nx = i === bumps - 1 ? x + w : Math.min(cx + seg, x + w);
    const bumpH = h * (0.55 + rand() * 0.9) * Math.sin((Math.PI * (i + 0.5)) / bumps + 0.2);
    b.C(cx, y - bumpH * 1.25, nx, y - bumpH * 1.25, nx, y - (i === bumps - 1 ? 0 : bumpH * 0.25));
    cx = nx;
  }
  b.Q(x + w + h * 0.3, y + h * 0.18, x + w - h * 0.2, y + h * 0.22)
    .L(x + h * 0.2, y + h * 0.22)
    .Q(x - h * 0.3, y + h * 0.18, x, y)
    .Z();
  return b.toString();
}

/** A gull silhouette (stroke) centred on 0,0. */
export const BIRD_PATH = "M-7 0Q-3.5 -4 0 0Q3.5 -4 7 0";
