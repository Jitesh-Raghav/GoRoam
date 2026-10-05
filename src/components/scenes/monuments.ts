/**
 * Hand-authored monument silhouettes.
 *
 * Every monument lives in its own local space: x is centred on 0 and the
 * ground line sits at `ground`. Layers reference palette tones so each scene
 * can light the same monument differently (dawn, dusk, night…), and the same
 * paths double as line-art for the drawing animations.
 */
import {
  C,
  L,

  PathBuilder,
  Q,
  circle,
  mulberry32,
  pointedArch,
  r1,
  rect,
  roundArch,
  symmetric,
  type Pt,
} from "./geometry";

export type Tone = "body" | "shade" | "light" | "glow" | "accent";

export interface MonumentLayer {
  d: string;
  tone: Tone;
  rule?: "evenodd" | "nonzero";
  /** Render as a stroke of this width instead of a fill. */
  stroke?: number;
  /** Skip in line-art mode (tiny details that turn into noise). */
  noLine?: boolean;
  /** Fine architectural detail, drawn only when a monument is shown large (`<Monument detailed>`). */
  detail?: boolean;
  opacity?: number;
}

export interface Monument {
  id: MonumentId;
  name: string;
  width: number;
  height: number;
  ground: number;
  layers: MonumentLayer[];
}

export type MonumentId =
  | "eiffel"
  | "taj"
  | "colosseum"
  | "pyramids"
  | "pagoda"
  | "christ"
  | "opera"
  | "liberty"
  | "bigben"
  | "burj"
  | "goldengate"
  | "angkor"
  | "brandenburg";

/* --------------------------------- detail kit -------------------------------- */

/** Points along a cubic Bézier, for reading an edge's x at a given y. */
function cubicPts(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 24): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}

/** x of a polyline edge at height y (linear between samples, clamped at the ends). */
function edgeAt(pts: Pt[], y: number) {
  const s = [...pts].sort((a, b) => a[1] - b[1]);
  if (y <= s[0][1]) return s[0][0];
  for (let i = 1; i < s.length; i++) {
    if (y <= s[i][1]) {
      const [x0, y0] = s[i - 1];
      const [x1, y1] = s[i];
      return x0 + ((x1 - x0) * (y - y0)) / Math.max(y1 - y0, 1e-6);
    }
  }
  return s[s.length - 1][0];
}

/** X-bracing between two edges, from y0 to y1: the riveted lattice of iron towers and bridges. */
function lattice(a: (y: number) => number, b: (y: number) => number, y0: number, y1: number, step: number, mirror = true) {
  let d = "";
  const one = (sx: number) => {
    let z1 = "";
    let z2 = "";
    let k = 0;
    for (let y = y0; y <= y1 + 0.01; y += step, k++) {
      const p = k % 2 ? [b(y), y] : [a(y), y];
      const q = k % 2 ? [a(y), y] : [b(y), y];
      z1 += `${k ? "L" : "M"}${r1(p[0] * sx)} ${r1(p[1])}`;
      z2 += `${k ? "L" : "M"}${r1(q[0] * sx)} ${r1(q[1])}`;
      d += `M${r1(a(y) * sx)} ${r1(y)}L${r1(b(y) * sx)} ${r1(y)}`;
    }
    d += z1 + z2;
  };
  one(1);
  if (mirror) one(-1);
  return d;
}

/** An open polyline. */
function polyline(pts: Pt[]) {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join("");
}

/** Evenly spaced short verticals: railings, balusters, louvres. */
function ticks(x0: number, x1: number, y0: number, y1: number, gap: number) {
  let d = "";
  for (let x = x0; x <= x1 + 0.01; x += gap) d += `M${r1(x)} ${r1(y0)}V${r1(y1)}`;
  return d;
}

/* ---------------------------------- Eiffel --------------------------------- */

function eiffel(): Monument {
  const outline = symmetric(
    [0, 0],
    [
      L(1.6, 0),
      L(2.6, 50),
      L(6, 54),
      L(6, 78),
      L(10, 82),
      L(10, 95),
      L(14, 97),
      L(14, 102),
      L(10.5, 104),
      C(13, 190, 20, 310, 33, 378),
      L(40, 380),
      L(40, 392),
      L(35, 394),
      C(40, 430, 49, 468, 58, 489),
      L(69, 491),
      L(69, 505),
      L(62, 507),
      C(76, 540, 92, 575, 114, 600),
      L(68, 600),
      L(61, 578),
      C(50, 545, 27, 531, 0, 530),
    ]
  );
  const openings =
    "M-44 486C-30 445-14 424 0 418C14 424 30 445 44 486Z" +
    "M-19 374L-2.5 262L2.5 262L19 374Z";
  // Faint cross-bracing hints on the legs.
  const bracing =
    "M-96 588L-74 548L-70 551L-91 590Z M96 588L74 548L70 551L91 590Z" +
    "M-52 481L-44 452L-41 454L-48 482Z M52 481L44 452L41 454L48 482Z";
  // Fine detail: riveted X-lattice in every section, platform railings and the lace under level one.
  const legOut = cubicPts([62, 507], [76, 540], [92, 575], [114, 600]);
  const legIn = [[68, 600] as Pt, ...cubicPts([61, 578], [50, 545], [27, 531], [0, 530])];
  const midOut = cubicPts([35, 394], [40, 430], [49, 468], [58, 489]);
  const hole = cubicPts([44, 486], [30, 445], [14, 424], [0, 418]);
  const topOut = cubicPts([10.5, 104], [13, 190], [20, 310], [33, 378]);
  const slit = (y: number) => 2.5 + ((19 - 2.5) * (y - 262)) / (374 - 262);
  const legs = lattice(
    (y) => edgeAt(legOut, y) - 3,
    (y) => Math.max(edgeAt(legIn, y) + 3, edgeAt(legOut, y) - 34),
    540,
    594,
    9
  );
  const mid = lattice((y) => edgeAt(midOut, y) - 2.5, (y) => edgeAt(hole, y) + 2.5, 424, 484, 8);
  const upperA = lattice((y) => edgeAt(topOut, y) - 1.5, () => 1.2, 112, 256, 12);
  const upperB = lattice((y) => edgeAt(topOut, y) - 2, (y) => slit(y) + 2, 268, 372, 9);
  const rails = ticks(-67, 67, 492, 504, 3.4) + ticks(-38, 38, 381, 391, 3) + ticks(-13, 13, 96, 101, 2.6);
  const lace = cubicPts([61, 572], [50, 539], [27, 525], [0, 524]);
  const archLace = polyline(lace) + polyline(lace.map(([px, py]) => [-px, py] as Pt));
  const level = rect(-69, 497, 138, 1.6) + rect(-40, 386, 80, 1.4);
  return {
    id: "eiffel",
    name: "Eiffel Tower",
    width: 228,
    height: 600,
    ground: 600,
    layers: [
      { d: outline + openings, tone: "body", rule: "evenodd" },
      { d: bracing, tone: "shade", noLine: true },
      { d: legs + mid + upperA + upperB, tone: "shade", stroke: 1.3, detail: true, opacity: 0.85 },
      { d: rails, tone: "shade", stroke: 1, detail: true },
      { d: archLace, tone: "shade", stroke: 1.4, detail: true, opacity: 0.8 },
      { d: level, tone: "light", detail: true, opacity: 0.7 },
    ],
  };
}

/* -------------------------------- Taj Mahal -------------------------------- */

function taj(): Monument {
  // Right half, traced from the finial down to the ground.
  const minaretLeft: Pt[] = [
    [255, 458],
    [255.9, 393],
    [251, 393],
    [251, 386],
    [256.4, 384],
    [256.9, 319],
    [252, 319],
    [252, 312],
    [257.4, 310],
    [258, 246],
    [253, 246],
    [253, 239],
    [258, 238],
    [258, 222],
    [255, 222],
    [255, 219],
    [259, 219],
  ];
  const mx = 268;
  const segs = [
    L(1.6, 0),
    L(1.6, 28),
    C(5.5, 29, 5.5, 37, 2.5, 39),
    L(2.5, 43),
    C(7, 44, 7, 52, 3, 54),
    L(3, 58),
    C(8, 60, 14, 64, 18, 71),
    // onion dome
    C(46, 84, 80, 112, 79, 160),
    C(78.5, 192, 66, 214, 57, 224),
    L(62, 226),
    L(62, 233),
    L(59, 234),
    L(59, 246),
    // pishtaq parapet + pinnacle
    L(62, 246),
    L(63, 236),
    L(65.5, 222),
    L(68, 236),
    L(69, 246),
    L(71, 246),
    L(71, 284),
    // roof to chhatri (cx = 120)
    L(96, 284),
    L(96, 279),
    L(98, 279),
    L(98, 259),
    L(95, 259),
    L(95, 255),
    L(101, 255),
    C(100, 241, 110, 233, 118, 229),
    L(119, 222),
    L(120, 213),
    L(121, 222),
    L(122, 229),
    C(130, 233, 140, 241, 139, 255),
    L(145, 255),
    L(145, 259),
    L(142, 259),
    L(142, 279),
    L(144, 279),
    L(144, 284),
    // corner guldasta
    L(160, 284),
    L(161, 266),
    L(163, 255),
    L(165, 266),
    L(166, 284),
    L(172, 284),
    L(172, 458),
    // plinth to minaret
    ...minaretLeft.map(([x, y]) => L(x, y)),
    C(259, 210, 264, 205, 267, 203),
    L(mx, 191),
    L(mx + 1, 203),
    C(mx + 4, 205, mx + 9, 210, 2 * mx - 259, 219),
    ...minaretLeft
      .slice()
      .reverse()
      .slice(1)
      .map(([x, y]) => L(2 * mx - x, y)),
    L(296, 458),
    L(296, 500),
    L(0, 500),
  ];
  const outline = symmetric([0, 0], segs);
  const openings = [-130.5, -109.5, 109.5, 130.5]
    .map((cx) => pointedArch(cx, 279, 7.5, 266, 261))
    .concat([-268, 268].map((cx) => pointedArch(cx, 238, 5.5, 229, 225)))
    .join("");

  const recesses = [
    pointedArch(0, 458, 40, 338, 296),
    ...[-122, 122].flatMap((cx) => [pointedArch(cx, 458, 20, 406, 386), pointedArch(cx, 372, 18, 336, 318)]),
    ...[-158, 158].flatMap((cx) => [pointedArch(cx, 458, 7, 412, 400), pointedArch(cx, 374, 6.5, 342, 332)]),
  ].join("");
  // Band where the drum meets the dome + plinth line.
  const bands = rect(-59, 238, 118, 3) + rect(-296, 462, 592, 3);
  // Detail: the pishtaq's calligraphy frame, framed side bays, the plinth's blind arcade,
  // the dome's lotus crown, minaret rings and chhatri columns.
  const frames =
    rect(-62, 290, 124, 168) + rect(-55, 297, 110, 161) +
    [-122, 122].map((cx) => rect(cx - 27, 380, 54, 80) + rect(cx - 25, 300, 50, 76)).join("") +
    [-158, 158].map((cx) => rect(cx - 10, 392, 20, 68) + rect(cx - 9, 326, 18, 52)).join("");
  let arcade = "";
  for (let x = -284; x <= 284; x += 24) arcade += pointedArch(x, 498, 7, 480, 472);
  const lotus = "M-18 71Q-9 64 0 70Q9 64 18 71M-12 74Q-6 69 0 73Q6 69 12 74";
  const rings = [-268, 268].map((x) => [300, 350, 420].map((y) => `M${x - 8} ${y}H${x + 8}`).join("") + `M${x} 226V456`).join("");
  const chhatri = [-120, 120].map((cx) => ticks(cx - 18, cx + 18, 261, 278, 6)).join("");

  return {
    id: "taj",
    name: "Taj Mahal",
    width: 592,
    height: 500,
    ground: 500,
    layers: [
      { d: outline + openings, tone: "body", rule: "evenodd" },
      { d: recesses, tone: "shade" },
      { d: bands, tone: "shade", noLine: true },
      { d: frames, tone: "shade", stroke: 1.3, detail: true, opacity: 0.7 },
      { d: arcade, tone: "shade", detail: true, opacity: 0.55 },
      { d: lotus + rings + chhatri, tone: "shade", stroke: 1.2, detail: true, opacity: 0.7 },
    ],
  };
}

/* -------------------------------- Colosseum -------------------------------- */

function colosseum(): Monument {
  const R = 300;
  const D = 820;
  const eye = 36;
  const lv = [0, 54, 108, 160, 210];
  const H = 232;
  const tMax = 1.12;
  const dT = 0.1;
  const rand = mulberry32(21);

  const depthOf = (t: number, extra = 0, rr = R) => D / (D + extra + rr * (1 - Math.cos(t)));
  const proj = (t: number, h: number, extra = 0, rr = R): Pt => {
    const k = depthOf(t, extra, rr);
    return [rr * Math.sin(t) * k, H - (eye + (h - eye) * k)];
  };

  // Height of the outer wall along the ring – full on the left, ruined on the right.
  const breakStart = 0.16;
  const breakEnd = 0.52;
  const steps: { t: number; h: number }[] = [];
  for (let t = -tMax; t <= tMax + 1e-6; t += dT / 2) {
    let h = lv[4];
    if (t > breakStart) {
      const k = Math.min((t - breakStart) / (breakEnd - breakStart), 1);
      h = lv[4] - k * (lv[4] - lv[2] - 12) + (rand() - 0.5) * 16 * Math.min(k * 2, 1);
      if (t > breakEnd) h = lv[2] + 6 + rand() * 12;
    }
    steps.push({ t, h });
  }
  const topAt = (t: number) => {
    let best = steps[0];
    for (const s of steps) if (Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
    return best.h;
  };

  const b = new PathBuilder();
  const start = proj(-tMax, 0);
  b.M(start[0], start[1]);
  steps.forEach((s, i) => {
    const p = proj(s.t, s.h);
    if (i > 0 && s.t > breakStart) {
      // stepped, broken masonry
      const prev = steps[i - 1];
      const mid = proj(s.t - dT * 0.2, prev.h);
      b.L(mid[0], mid[1]);
    }
    b.L(p[0], p[1]);
  });
  for (let t = tMax; t >= -tMax - 1e-6; t -= dT / 2) {
    const p = proj(t, 0);
    b.L(p[0], p[1]);
  }
  b.Z();
  const outer = b.toString();

  // Inner ring visible through the ruined section.
  const ib = new PathBuilder();
  const iStart = proj(0.05, lv[2], R * 0.2, R * 0.8);
  ib.M(iStart[0], iStart[1]);
  for (let t = 0.05; t <= 1.02; t += dT / 2) {
    const h = lv[3] - 6 - (t - 0.05) * 38 + (rand() - 0.5) * 10;
    const p = proj(t, h, R * 0.2, R * 0.8);
    ib.L(p[0], p[1]);
  }
  for (let t = 1.02; t >= 0.05; t -= dT / 2) {
    const p = proj(t, lv[1], R * 0.2, R * 0.8);
    ib.L(p[0], p[1]);
  }
  ib.Z();
  const inner = ib.toString();

  // Arcades.
  let arches = "";
  let innerArches = "";
  for (let k = 0; k < 3; k++) {
    for (let t = -tMax + dT / 2; t < tMax; t += dT) {
      if (topAt(t) < lv[k + 1] - 4) continue;
      const hw = 0.3 * dT;
      const [xl] = proj(t - hw, 0);
      const [xr] = proj(t + hw, 0);
      const [, yb] = proj(t, lv[k] + 5);
      const [, ys] = proj(t, lv[k + 1] - 22);
      const rise = (xr - xl) / 2;
      if (xr - xl < 2) continue;
      arches += roundArch((xl + xr) / 2, yb, (xr - xl) / 2, ys, rise * 1.05);
    }
  }
  // attic windows
  for (let t = -tMax + dT; t < tMax; t += dT * 2) {
    if (topAt(t) < lv[4] - 6) continue;
    const [xl, yt] = proj(t - 0.06, lv[3] + 30);
    const [xr, yb] = proj(t + 0.06, lv[3] + 18);
    arches += rect(xl, yt, xr - xl, yb - yt);
  }
  for (let t = 0.12; t < 0.98; t += dT) {
    const hw = 0.3 * dT;
    const [xl] = proj(t - hw, 0, R * 0.2, R * 0.8);
    const [xr] = proj(t + hw, 0, R * 0.2, R * 0.8);
    const [, yb] = proj(t, lv[2] + 4, R * 0.2, R * 0.8);
    const [, ys] = proj(t, lv[3] - 26, R * 0.2, R * 0.8);
    innerArches += roundArch((xl + xr) / 2, yb, (xr - xl) / 2, ys, (xr - xl) / 2);
  }

  // Cornice bands between the storeys.
  let cornices = "";
  for (const h of [lv[1], lv[2], lv[3]]) {
    const cb = new PathBuilder();
    let open = false;
    const pts: Pt[] = [];
    for (let t = -tMax; t <= tMax + 1e-6; t += dT / 4) {
      if (topAt(t) >= h + 2) pts.push([t, h]);
      else if (pts.length) break;
    }
    if (pts.length > 1) {
      pts.forEach(([t], i) => {
        const p = proj(t, h);
        if (i === 0) cb.M(p[0], p[1]);
        else cb.L(p[0], p[1]);
        open = true;
      });
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = proj(pts[i][0], h - 4);
        cb.L(p[0], p[1]);
      }
      if (open) cb.Z();
      cornices += cb.toString();
    }
  }

  // Detail: engaged half-columns between the arches, the attic's corbels, and weathered stone.
  let pilasters = "";
  for (let k = 0; k < 4; k++) {
    for (let t = -tMax + dT; t < tMax; t += dT) {
      const top = k < 3 ? lv[k + 1] - 4 : lv[4] - 4;
      if (topAt(t) < top + 2) continue;
      const [x0, y0] = proj(t, lv[k] + 4);
      const [x1, y1] = proj(t, top);
      if (Math.abs(x1 - x0) > 40) continue;
      pilasters += `M${r1(x0)} ${r1(y0)}L${r1(x1)} ${r1(y1)}`;
    }
  }
  let corbels = "";
  for (let t = -tMax + dT / 2; t < tMax; t += dT / 2) {
    if (topAt(t) < lv[4] - 6) continue;
    const [x, y] = proj(t, lv[4] - 10);
    corbels += `M${r1(x)} ${r1(y)}v4`;
  }
  let weather = "";
  for (let i = 0; i < 220; i++) {
    const t = -tMax + rand() * tMax * 2;
    const h = 6 + rand() * (topAt(t) - 10);
    const [x, y] = proj(t, h);
    weather += rect(x, y, 1.6 + rand() * 3, 1 + rand() * 1.4);
  }
  return {
    id: "colosseum",
    name: "Colosseum",
    width: 2 * R * Math.sin(tMax),
    height: H,
    ground: H - eye + eye * depthOf(0),
    layers: [
      { d: inner, tone: "shade" },
      { d: innerArches, tone: "body", noLine: true },
      { d: outer, tone: "body" },
      { d: cornices, tone: "light", noLine: true },
      { d: arches, tone: "shade" },
      { d: pilasters, tone: "shade", stroke: 1.6, detail: true, opacity: 0.55 },
      { d: corbels, tone: "shade", stroke: 1.4, detail: true, opacity: 0.6 },
      { d: weather, tone: "shade", detail: true, opacity: 0.35 },
    ],
  };
}

/* --------------------------------- Pyramids -------------------------------- */

function pyramids(): Monument {
  const g = 300;
  const off = -140;
  const pyr = (x0: number, x1: number, ax: number, ay: number, rx: number) => ({
    body: `M${x0 + off} ${g}L${ax + off} ${ay}L${x1 + off} ${g}Z`,
    shade: `M${rx + off} ${g}L${ax + off} ${ay}L${x1 + off} ${g}Z`,
  });
  const khufu = pyr(-420, 40, -180, 32, -125);
  const khafre = pyr(-40, 390, 165, 18, 222);
  const menkaure = pyr(330, 560, 442, 186, 470);
  const queens = [pyr(556, 620, 588, 262, 596), pyr(606, 664, 635, 266, 643), pyr(652, 706, 679, 270, 686)];
  // Khafre still wears a cap of its original casing.
  const cap = `M${165 + off - 21} 60L${165 + off} 18L${165 + off + 21} 60L${165 + off + 12} 64L${165 + off} 56L${165 + off - 13} 63Z`;

  // The Sphinx, resting in front.
  const sx = -490;
  const sphinx = new PathBuilder()
    .M(sx, g)
    .L(sx, g - 12)
    .Q(sx + 2, g - 23, sx + 16, g - 25)
    .L(sx + 90, g - 29)
    .L(sx + 95, g - 37)
    .L(sx + 98, g - 51)
    .Q(sx + 105, g - 58, sx + 113, g - 57)
    .L(sx + 117, g - 50)
    .L(sx + 118, g - 42)
    .L(sx + 115, g - 38)
    .L(sx + 121, g - 29)
    .L(sx + 127, g - 25)
    .L(sx + 129, g - 8)
    .L(sx + 158, g - 7)
    .L(sx + 160, g)
    .Z()
    .toString();

  return {
    id: "pyramids",
    name: "Pyramids of Giza",
    width: 1140,
    height: g,
    ground: g,
    layers: [
      { d: khufu.body, tone: "body" },
      { d: khufu.shade, tone: "shade" },
      { d: khafre.body, tone: "body" },
      { d: khafre.shade, tone: "shade" },
      { d: cap, tone: "light", noLine: true },
      { d: menkaure.body, tone: "body" },
      { d: menkaure.shade, tone: "shade" },
      ...queens.flatMap((q) => [
        { d: q.body, tone: "body" as const },
        { d: q.shade, tone: "shade" as const },
      ]),
      { d: sphinx, tone: "shade" },
    ],
  };
}

/* ------------------------------ Chureito Pagoda ----------------------------- */

function pagoda(): Monument {
  const bw = [50, 44, 39, 34, 29];
  const rw = [94, 86, 78, 71, 64];
  // y where each body's top edge sits (roof underside) and body bottoms
  const bodyBottom = [488, 418, 364, 314, 268];
  const bodyTop = [444, 388, 336, 288, 244];
  const segs = [];
  // Hōju jewel + sōrin rings
  segs.push(C(4, 109, 6, 114, 3, 119), L(2, 121));
  for (let y = 128; y <= 200; y += 9) segs.push(L(2, y - 2.5), L(6.5, y - 2), L(6.5, y + 1.5), L(2, y + 2));
  segs.push(L(2, 208), L(7, 209), L(7, 214), L(10, 216));
  // Top roof (tier 4) descends from the sōrin base.
  let prevX = 10;
  let prevY = 216;
  for (let i = 4; i >= 0; i--) {
    const eaveY = bodyTop[i];
    const tipX = rw[i] + 4;
    const tipY = eaveY - 12;
    segs.push(C(prevX + 16, prevY + 4, rw[i] - 16, eaveY - 12, tipX, tipY));
    segs.push(L(rw[i] - 1, eaveY - 5));
    segs.push(Q(bw[i] + (rw[i] - bw[i]) * 0.45, eaveY + 1, bw[i], eaveY));
    segs.push(L(bw[i], bodyBottom[i]));
    // balcony rail under the roof above
    if (i > 0) {
      segs.push(L(bw[i] + 7, bodyBottom[i] - 2), L(bw[i] + 7, bodyBottom[i]));
      prevX = bw[i] + 7;
      prevY = bodyBottom[i];
    }
  }
  segs.push(L(72, 488), L(72, 500), L(0, 500));
  const outline = symmetric([0, 107], segs);
  let details = "";
  for (let i = 0; i < 5; i++) {
    const h = bodyBottom[i] - bodyTop[i];
    // latticed doors on each storey
    details += rect(-bw[i] * 0.42, bodyTop[i] + h * 0.28, bw[i] * 0.84, h * 0.56);
  }
  let lines = "";
  for (let i = 0; i < 5; i++) lines += rect(-bw[i] * 0.02 - 0.6, bodyTop[i] + 3, 1.2, bodyBottom[i] - bodyTop[i] - 6);
  // Detail: tile ends along every eave, bracket rows, corner posts, balcony balusters.
  let tiles = "";
  let brackets = "";
  let posts = "";
  let rails = "";
  for (let i = 0; i < 5; i++) {
    tiles += ticks(-rw[i] + 6, rw[i] - 6, bodyTop[i] - 11, bodyTop[i] - 5, 3.4);
    brackets += ticks(-bw[i] + 2, bw[i] - 2, bodyTop[i] + 1, bodyTop[i] + 4, 3);
    posts += `M${-bw[i] + 3} ${bodyTop[i] + 4}V${bodyBottom[i]}M${bw[i] - 3} ${bodyTop[i] + 4}V${bodyBottom[i]}`;
    if (i > 0) rails += ticks(-bw[i] - 6, bw[i] + 6, bodyBottom[i] - 6, bodyBottom[i], 3) + `M${-bw[i] - 7} ${bodyBottom[i] - 6}H${bw[i] + 7}`;
  }
  const base = [492, 496].map((y) => `M-72 ${y}H72`).join("");
  return {
    id: "pagoda",
    name: "Chureito Pagoda",
    width: 196,
    height: 500,
    ground: 500,
    layers: [
      { d: outline, tone: "body" },
      { d: details, tone: "glow" },
      { d: lines, tone: "body", noLine: true },
      { d: tiles, tone: "shade", stroke: 1.1, detail: true, opacity: 0.8 },
      { d: brackets + rails, tone: "shade", stroke: 1, detail: true },
      { d: posts, tone: "shade", stroke: 1.6, detail: true, opacity: 0.6 },
      { d: base, tone: "shade", stroke: 1, detail: true },
    ],
  };
}

/* ---------------------------- Christ the Redeemer --------------------------- */

function christ(): Monument {
  const outline = symmetric(
    [0, 2.5],
    [
      C(2.4, 2.5, 3.9, 4.2, 3.9, 6.6),
      C(3.9, 8.8, 3, 10.2, 2, 10.8),
      L(2.2, 12.2),
      Q(4.2, 13.2, 7, 13.4),
      L(36, 14),
      Q(39.4, 14.2, 39.4, 16.2),
      Q(39.4, 18.2, 36.6, 18.6),
      L(24, 19.2),
      Q(14, 24, 7.4, 37),
      L(7, 44),
      L(7.3, 62),
      Q(7.7, 76, 9.4, 84),
      L(10.4, 84),
      L(10.4, 86.5),
      L(9.4, 86.5),
      L(9.4, 100),
      L(0, 100),
    ]
  );
  const sash = "M-6.9 45L6.9 45L7 47.4L-7 47.4Z";
  // Detail: the robe's long folds and the creases along the outstretched arms.
  const folds = "M-4.6 48Q-4 66-5.6 83M-1.6 48Q-1 66-1.8 83M1.8 48Q2.4 66 2 83M5 48Q5.6 66 6.8 83M-3 22Q-2 32-3 44M2.6 22Q3 32 2.4 44";
  const creases = "M10 16.2H34M12 17.6H30M-10 16.2H-34M-12 17.6H-30";
  return {
    id: "christ",
    name: "Christ the Redeemer",
    width: 76,
    height: 100,
    ground: 100,
    layers: [
      { d: outline, tone: "body" },
      { d: sash, tone: "shade", noLine: true },
      { d: folds, tone: "shade", stroke: 0.45, detail: true, opacity: 0.8 },
      { d: creases, tone: "shade", stroke: 0.35, detail: true, opacity: 0.7 },
    ],
  };
}

/* ------------------------------ Sydney Opera House ------------------------------ */

function opera(): Monument {
  const base = 225;
  /** A shell: base from bx0 (open end) to bx1 (back), tip at (tx, ty). Works in both directions. */
  const sail = (bx0: number, bx1: number, tx: number, ty: number) => {
    const h = base - ty;
    const w = bx1 - bx0;
    const b = new PathBuilder();
    b.M(bx0, base)
      .C(bx0 - (bx0 - tx) * 0.05, base - h * 0.45, tx + (bx0 - tx) * 0.2, ty + h * 0.2, tx, ty)
      .C(tx + (bx1 - tx) * 0.62, ty + h * 0.01, bx1 - w * 0.02, base - h * 0.62, bx1, base)
      .Z();
    // shaded open end (the glazed mouth of each shell)
    const mouth = new PathBuilder()
      .M(bx0, base)
      .C(bx0 - (bx0 - tx) * 0.05, base - h * 0.45, tx + (bx0 - tx) * 0.2, ty + h * 0.2, tx, ty)
      .C(tx + w * 0.1, ty + h * 0.3, bx0 + w * 0.16, base - h * 0.35, bx0 + w * 0.2, base)
      .Z();
    // chevron ribs fanning up to the tip
    let ribs = "";
    for (const f of [0.42, 0.62, 0.82]) {
      const x = bx0 + w * f;
      const rb = new PathBuilder();
      rb.M(x - 0.7, base)
        .Q(tx + (x - tx) * 0.58, ty + h * 0.3, tx + w * 0.03, ty + h * 0.04)
        .Q(tx + (x - tx) * 0.58 + 1.4, ty + h * 0.3, x + 0.7, base)
        .Z();
      ribs += rb.toString();
    }
    return { d: b.toString(), mouth: mouth.toString(), ribs };
  };
  // Drawn back-to-front so the smaller, nearer shells overlap the taller ones.
  const shells = [
    // concert hall (largest group, right)
    sail(352, 250, 366, 122),
    sail(118, 318, 106, 34),
    sail(46, 214, 34, 72),
    sail(-18, 118, -30, 112),
    // opera theatre (left)
    sail(-40, -122, -26, 142),
    sail(-190, -30, -202, 70),
    sail(-252, -120, -264, 104),
    sail(-306, -206, -318, 140),
    // restaurant pair
    sail(-322, -372, -310, 184),
    sail(-418, -350, -428, 168),
  ];
  const podium = new PathBuilder()
    .M(-452, 262)
    .L(-438, 236)
    .L(-420, 228)
    .L(-400, 225)
    .L(372, 225)
    .L(388, 236)
    .L(396, 262)
    .Z()
    .toString();
  const steps = "M-430 244L380 244L382 248L-432 248Z M-436 254L386 254L388 258L-438 258Z";
  return {
    id: "opera",
    name: "Sydney Opera House",
    width: 850,
    height: 262,
    ground: 262,
    layers: [
      { d: podium, tone: "body" },
      { d: steps, tone: "shade", noLine: true },
      ...shells.flatMap((s) => [
        { d: s.d, tone: "light" as const },
        { d: s.mouth, tone: "glow" as const, noLine: true },
        { d: s.ribs, tone: "accent" as const, noLine: true },
      ]),
    ],
  };
}

/* ------------------------------ Statue of Liberty ------------------------------ */

function liberty(): Monument {
  const pedestal = symmetric(
    [0, 300],
    [
      L(40, 300),
      L(40, 306),
      L(46, 308),
      L(46, 322),
      L(52, 324),
      L(52, 334),
      L(58, 336),
      L(58, 348),
      L(54, 350),
      L(54, 520),
      L(62, 524),
      L(62, 540),
      L(72, 544),
      L(72, 560),
      L(98, 562),
      L(98, 574),
      L(150, 577),
      L(150, 600),
      L(0, 600),
    ]
  );
  const figure = new PathBuilder()
    .M(-34, 300)
    .C(-33, 270, -31, 240, -30, 215)
    .C(-29.5, 195, -28, 176, -26, 160)
    .L(-30, 152)
    .C(-34, 130, -38, 110, -39, 90)
    .C(-40, 75, -41, 62, -41, 52)
    .L(-43, 50)
    .L(-43, 44)
    .L(-41, 41)
    .L(-47, 36)
    .L(-47, 30)
    .L(-30, 30)
    .L(-30, 36)
    .L(-35, 41)
    .L(-35, 44)
    .C(-34, 60, -32, 80, -30, 100)
    .C(-28, 118, -24, 135, -17, 142)
    .L(-9, 138)
    .L(4, 137)
    .C(12, 140, 20, 144, 24, 150)
    .L(27, 164)
    .L(39, 159)
    .L(46, 238)
    .L(32, 244)
    .C(33, 262, 34, 282, 35, 300)
    .Z()
    .toString();
  const head = circle(-3.5, 124, 11.5);
  const cx = -3.5;
  const cy = 121;
  let crown = "";
  for (const deg of [165, 140, 115, 90, 65, 40, 15]) {
    const a = (deg * Math.PI) / 180;
    const w = (7 * Math.PI) / 180;
    const tip: Pt = [cx + Math.cos(a) * 30, cy - Math.sin(a) * 30];
    const b1: Pt = [cx + Math.cos(a - w) * 10, cy - Math.sin(a - w) * 10];
    const b2: Pt = [cx + Math.cos(a + w) * 10, cy - Math.sin(a + w) * 10];
    crown += `M${r1(b1[0])} ${r1(b1[1])}L${r1(tip[0])} ${r1(tip[1])}L${r1(b2[0])} ${r1(b2[1])}Z`;
  }
  const flame = "M-45 31C-49 20-44 9-40 0C-37 8-31 18-32 31Z";
  const folds =
    "M-22 298Q-20 250-16 214L-14 214Q-17 252-19 298Z" +
    "M-4 298Q-3 262 0 226L2 226Q-0.5 262-1 298Z" +
    "M14 298Q14 262 18 236L20 236Q16.5 264 17 298Z";
  const panels = [-38, -13, 12].map((x) => rect(x, 364, 26, 52)).join("") + rect(-50, 352, 100, 5);
  // Detail: more robe folds, the tablet's edge, the torch cup, granite courses on the pedestal.
  const robe = "M-28 250Q-26 200-24 170M-12 296Q-10 240-6 196M6 296Q6 250 10 206M24 296Q24 262 26 236M-20 160Q-6 150 12 156M-22 186Q-4 176 16 182";
  const tablet = "M30 168L39 164L44 234L34 238Z";
  const torch = "M-46 41H-30M-44 47H-32";
  let granite = "";
  for (let y = 432; y < 520; y += 11) granite += `M-54 ${y}H54`;
  for (let y = 528; y < 600; y += 9) granite += `M${y < 544 ? -62 : y < 562 ? -72 : -150} ${y}H${y < 544 ? 62 : y < 562 ? 72 : 150}`;
  return {
    id: "liberty",
    name: "Statue of Liberty",
    width: 300,
    height: 600,
    ground: 600,
    layers: [
      { d: pedestal + figure + head + crown, tone: "body" },
      { d: folds + panels, tone: "shade", noLine: true },
      { d: flame, tone: "glow" },
      { d: robe + tablet + torch, tone: "shade", stroke: 1.3, detail: true, opacity: 0.85 },
      { d: granite, tone: "shade", stroke: 1, detail: true, opacity: 0.6 },
    ],
  };
}

/* ---------------------------------- Big Ben --------------------------------- */

function bigben(): Monument {
  const outline = symmetric(
    [0, 0],
    [
      L(1.2, 0),
      L(1.6, 16),
      L(4, 20),
      L(4, 28),
      L(9, 34),
      L(9, 60),
      L(13, 62),
      C(20, 96, 34, 140, 44, 164),
      L(47, 166),
      L(47, 172),
      L(43, 172),
      L(43, 214),
      L(48, 216),
      L(48, 222),
      L(46, 222),
      L(46, 290),
      L(49, 292),
      L(49, 298),
      L(40, 300),
      L(38, 556),
      L(44, 560),
      L(44, 600),
      L(0, 600),
    ]
  );
  const pinnacles = [-45, 45]
    .map((x) => `M${x - 3.5} 172L${x - 3.5} 150L${x} 132L${x + 3.5} 150L${x + 3.5} 172Z`)
    .join("");
  const belfry = [-22, 0, 22].map((x) => pointedArch(x, 208, 6, 190, 180)).join("");
  let panels = "";
  for (const x of [-27, -9, 9, 27]) {
    for (let y = 316; y < 540; y += 56) panels += pointedArch(x, y + 44, 4.5, y + 8, y);
  }
  const face = circle(0, 256, 27);
  const rim = circle(0, 256, 30) + circle(0, 256, 27);
  // Detail: hour marks and hands, gothic panelling, belfry louvres, spire ribs and stone courses.
  let marks = "";
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const r0 = h % 3 ? 22.5 : 20;
    marks += `M${r1(Math.sin(a) * r0)} ${r1(256 - Math.cos(a) * r0)}L${r1(Math.sin(a) * 25.5)} ${r1(256 - Math.cos(a) * 25.5)}`;
  }
  const hands = `M0 256L${r1(Math.sin(-1.05) * 12)} ${r1(256 - Math.cos(-1.05) * 12)}M0 256L${r1(Math.sin(0.35) * 19)} ${r1(256 - Math.cos(0.35) * 19)}`;
  const mullions = [-36, -18, 0, 18, 36].map((x) => `M${x} 304V552`).join("") + [312, 368, 424, 480, 536].map((y) => `M-39 ${y}H39`).join("");
  const louvres = [-22, 0, 22].map((x) => [193, 197.5, 202].map((y) => `M${x - 4} ${y}H${x + 4}`).join("")).join("");
  const spire = [-40, -26, -12, 12, 26, 40].map((x) => `M0 64L${x} 164`).join("") + "M-30 120H30M-20 96H20";
  const courses = [566, 574, 582, 590].map((y) => `M-44 ${y}H44`).join("") + ticks(-40, 40, 222, 228, 4);
  return {
    id: "bigben",
    name: "Big Ben",
    width: 98,
    height: 600,
    ground: 600,
    layers: [
      { d: outline + pinnacles, tone: "body" },
      { d: belfry + panels, tone: "shade" },
      { d: rim, tone: "shade", rule: "evenodd", noLine: true },
      { d: face, tone: "glow" },
      { d: marks, tone: "shade", stroke: 1.4, detail: true },
      { d: hands, tone: "shade", stroke: 2, detail: true },
      { d: mullions + courses, tone: "shade", stroke: 1, detail: true, opacity: 0.7 },
      { d: louvres, tone: "light", stroke: 1.2, detail: true },
      { d: spire, tone: "shade", stroke: 1, detail: true, opacity: 0.75 },
    ],
  };
}

/* ------------------------------- Burj Khalifa ------------------------------- */

function burj(): Monument {
  const right: Pt[] = [
    [0.7, 0],
    [1.4, 70],
    [3, 132],
    [5, 166],
    [5, 196],
    [9, 198],
    [9, 246],
    [13.5, 249],
    [13.5, 302],
    [18.5, 305],
    [18.5, 362],
    [23.5, 366],
    [23.5, 422],
    [29, 426],
    [29, 482],
    [35, 486],
    [35, 540],
    [42, 546],
    [42, 600],
  ];
  const left: Pt[] = [
    [-42, 600],
    [-42, 522],
    [-37, 518],
    [-37, 458],
    [-31, 454],
    [-31, 396],
    [-25.5, 392],
    [-25.5, 334],
    [-20.5, 330],
    [-20.5, 276],
    [-15.5, 272],
    [-15.5, 224],
    [-11, 220],
    [-11, 180],
    [-6.5, 176],
    [-3.2, 140],
    [-1.4, 70],
    [-0.7, 0],
  ];
  const b = new PathBuilder().M(0, 0);
  for (const [x, y] of right) b.L(x, y);
  for (const [x, y] of left) b.L(x, y);
  b.Z();
  // Vertical light strips.
  const rand = mulberry32(8);
  let lights = "";
  for (let y = 206; y < 596; y += 7) {
    const w = y < 300 ? 8 : y < 420 ? 20 : 34;
    for (let x = -w; x < w; x += 6) if (rand() > 0.62) lights += rect(x, y, 2.2, 2.6);
  }
  // Detail: the central spine, the setback edges carried down each wing, and floor bands.
  let fins = "M0 140V600";
  for (const [x, y] of right) if (x > 4) fins += `M${r1(x - 2)} ${y}V600M${r1(-x + 2)} ${y}V600`;
  let floors = "";
  for (let y = 206; y < 600; y += 12) {
    const w = right.find(([, ry]) => ry >= y)?.[0] ?? 42;
    floors += `M${r1(-w + 1)} ${y}H${r1(w - 1)}`;
  }
  const spireRings = [30, 56, 84, 110].map((y) => `M-2.4 ${y}H2.4`).join("");
  return {
    id: "burj",
    name: "Burj Khalifa",
    width: 84,
    height: 600,
    ground: 600,
    layers: [
      { d: b.toString(), tone: "body" },
      { d: lights, tone: "glow", noLine: true },
      { d: fins, tone: "shade", stroke: 1.1, detail: true, opacity: 0.7 },
      { d: floors, tone: "light", stroke: 0.7, detail: true, opacity: 0.6 },
      { d: spireRings, tone: "shade", stroke: 1, detail: true },
    ],
  };
}

/* ---------------------------- Golden Gate Bridge ---------------------------- */

function goldengate(): Monument {
  const deck = 420;
  const towerX = 260;
  const tower = (cx: number) => {
    const legs = [cx - 24, cx + 12];
    let d = "";
    for (const x of legs) {
      d += new PathBuilder()
        .M(x, deck + 90)
        .L(x, 52)
        .L(x + 2, 44)
        .L(x + 4, 38)
        .L(x + 8, 38)
        .L(x + 10, 44)
        .L(x + 12, 52)
        .L(x + 12, deck + 90)
        .Z()
        .toString();
    }
    for (const y of [70, 150, 230, 320]) d += rect(cx - 14, y, 28, y === 70 ? 18 : 12);
    return d;
  };
  const top = 44;
  const anchorX = 560;
  const anchorY = deck - 2;
  // Main span: quadratic whose midpoint dips to just above the deck.
  const mainCtrl = 2 * (deck - 10) - top;
  const sideCtrl: Pt = [towerX + (anchorX - towerX) * 0.45, anchorY - 24];
  const main =
    `M${-towerX} ${top}Q0 ${mainCtrl} ${towerX} ${top}` +
    `M${-anchorX} ${anchorY}Q${-sideCtrl[0]} ${sideCtrl[1]} ${-towerX} ${top}` +
    `M${towerX} ${top}Q${sideCtrl[0]} ${sideCtrl[1]} ${anchorX} ${anchorY}`;
  const quadAt = (p0: Pt, p1: Pt, p2: Pt, x: number) => {
    // Solve x(t) for t by bisection, then return y(t).
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const t = (lo + hi) / 2;
      const xt = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
      if ((xt < x) === p0[0] < p2[0]) lo = t;
      else hi = t;
    }
    const t = (lo + hi) / 2;
    return (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
  };
  let hangers = "";
  for (let x = -towerX + 14; x < towerX - 6; x += 14) {
    hangers += `M${x} ${r1(quadAt([-towerX, top], [0, mainCtrl], [towerX, top], x))}V${deck}`;
  }
  for (let x = towerX + 14; x < anchorX - 20; x += 14) {
    const y = r1(quadAt([towerX, top], sideCtrl, [anchorX, anchorY], x));
    hangers += `M${x} ${y}V${deck}M${-x} ${y}V${deck}`;
  }
  const deckPath = rect(-640, deck, 1280, 12) + rect(-640, deck + 12, 1280, 5);
  return {
    id: "goldengate",
    name: "Golden Gate Bridge",
    width: 1200,
    height: deck + 90,
    ground: deck + 90,
    layers: [
      { d: hangers, tone: "accent", stroke: 1, noLine: true },
      { d: main, tone: "accent", stroke: 4 },
      { d: deckPath, tone: "accent" },
      { d: tower(-towerX) + tower(towerX), tone: "accent" },
    ],
  };
}

/* -------------------------------- Angkor Wat -------------------------------- */

function angkor(): Monument {
  const tower = (cx: number, baseY: number, h: number, w: number) => {
    const tiers = 7;
    const segs = [];
    for (let i = 0; i <= tiers; i++) {
      const t = i / tiers;
      const y = baseY - h + h * t;
      const bulge = Math.sin(Math.min(t * 1.25, 1) * Math.PI * 0.5);
      const hw = Math.max(w * (0.12 + 0.88 * bulge) * (1 - t * 0.06), 1.5);
      if (i === 0) segs.push(C(hw * 0.4, y + 2, hw * 0.9, y + h * 0.05, hw, y + h * 0.1));
      else segs.push(L(hw, y), L(hw * 0.9, y + 3));
    }
    segs.push(L(w * 0.98, baseY), L(0, baseY));
    return symmetric([0, baseY - h - 6], segs, cx);
  };
  const galleries = symmetric(
    [0, 190],
    [
      L(118, 190),
      L(122, 198),
      L(190, 198),
      L(196, 236),
      L(258, 236),
      L(264, 262),
      L(340, 262),
      L(346, 300),
      L(0, 300),
    ]
  );
  let colonnade = "";
  for (let x = -330; x <= 330; x += 11) colonnade += rect(x, 272, 5, 20);
  for (let x = -250; x <= 250; x += 11) colonnade += rect(x, 244, 5, 14);
  for (let x = -184; x <= 184; x += 11) colonnade += rect(x, 206, 5, 22);
  // Detail: tier lines on the towers, roof tiles on each gallery, and the great central stair.
  const tierLines = (cx: number, baseY: number, h: number, w: number) => {
    let d = "";
    for (let i = 1; i < 7; i++) {
      const y = baseY - h + (h * i) / 7;
      const hw = w * (0.12 + 0.88 * Math.sin(Math.min((i / 7) * 1.25, 1) * Math.PI * 0.5)) * 0.92;
      d += `M${r1(cx - hw)} ${r1(y + 1.5)}H${r1(cx + hw)}`;
    }
    return d + `M${cx} ${baseY - h + 4}V${baseY}`;
  };
  const towerDetail = tierLines(0, 196, 196, 36) + tierLines(-158, 206, 124, 27) + tierLines(158, 206, 124, 27) + tierLines(-96, 200, 118, 26) + tierLines(96, 200, 118, 26);
  const roofTiles = ticks(-340, 340, 263, 270, 4) + ticks(-258, 258, 237, 243, 4) + ticks(-190, 190, 199, 205, 4);
  let stair = "";
  for (let y = 204; y < 300; y += 4) stair += `M-9 ${y}H9`;
  return {
    id: "angkor",
    name: "Angkor Wat",
    width: 692,
    height: 300,
    ground: 300,
    layers: [
      {
        d: tower(-96, 200, 118, 26) + tower(96, 200, 118, 26),
        tone: "shade",
      },
      {
        d: galleries + tower(0, 196, 196, 36) + tower(-158, 206, 124, 27) + tower(158, 206, 124, 27),
        tone: "body",
      },
      { d: colonnade, tone: "shade", noLine: true },
      { d: towerDetail, tone: "shade", stroke: 1.2, detail: true, opacity: 0.75 },
      { d: roofTiles, tone: "shade", stroke: 1, detail: true, opacity: 0.6 },
      { d: stair, tone: "light", stroke: 1.2, detail: true },
    ],
  };
}


/* ----------------------------- Brandenburg Gate ----------------------------- */

function brandenburg(): Monument {
  const G = 220; // ground line (the standard tops out at y = 0)
  const cols = [-80, -48, -16, 16, 48, 80];
  // The shadowed passages behind the front colonnade.
  const interior = rect(-92, G - 92, 184, 84) + rect(-146, G - 40, 40, 34) + rect(106, G - 40, 40, 34);
  let body = "";
  // Stylobate (two steps).
  body += rect(-100, G - 4, 200, 4) + rect(-96, G - 8, 192, 4);
  // Doric columns with a base and a capital.
  for (const x of cols) {
    body += rect(x - 5, G - 92, 10, 84);
    body += rect(x - 6.5, G - 96, 13, 4) + rect(x - 6, G - 11, 12, 3);
  }
  // Entablature: architrave, frieze, cornice.
  body += rect(-92, G - 104, 184, 8) + rect(-93, G - 112, 186, 8) + rect(-96, G - 116, 192, 4);
  // Stepped attic and the raised centre carrying the quadriga.
  body += rect(-82, G - 130, 164, 14) + rect(-40, G - 138, 80, 8) + rect(-44, G - 140, 88, 3);
  // Side wings: little Doric temples with a low pediment.
  for (const dir of [-1, 1]) {
    const x0 = dir < 0 ? -150 : 104;
    body += rect(x0, G - 6, 46, 6) + rect(x0 + 2, G - 48, 42, 8);
    body += `M${x0} ${G - 48}L${x0 + 23} ${G - 60}L${x0 + 46} ${G - 48}Z`;
    for (const cx of [x0 + 6, x0 + 23, x0 + 40]) body += rect(cx - 3, G - 40, 6, 34);
  }
  // Triglyphs in the frieze and the relief panel on the attic.
  let detail = "";
  for (let x = -88; x <= 84; x += 8) detail += rect(x, G - 111, 2.4, 6);
  detail += rect(-72, G - 127, 144, 8);

  // Quadriga: four horses stepping out in echelon, the chariot and Victoria with her standard.
  const q = new PathBuilder();
  const top = G - 140;
  const horse: Pt[] = [
    [0, 0], [2, 0], [2.6, -7], [4.4, -10.5], [3.6, -14.5], [-6, -16.5], [-10, -19.5], [-12, -26.5], [-14.6, -30],
    [-15.6, -28], [-17.4, -27.4], [-21, -23], [-19.6, -21.2], [-15, -21.6], [-13.4, -17.6], [-18, -16.6], [-21.4, -12.4],
    [-19.6, -11], [-15.6, -13.2], [-11.4, -11], [-4.6, -10.4], [-3, -6], [-1.6, 0],
  ];
  for (const [i, x] of [-12, -2, 8, 18].entries()) {
    const dy = i % 2 ? 1.5 : 0;
    q.M(x + horse[0][0], top + horse[0][1]);
    for (const [hx, hy] of horse.slice(1)) q.L(x + hx, top + hy - dy);
    q.Z();
    // Tail.
    q.M(x + 4, top - 12 - dy).Q(x + 8, top - 9 - dy, x + 6.4, top - 3 - dy).L(x + 4.6, top - 5 - dy).Z();
  }
  // Chariot box.
  q.M(20, top).L(20, top - 12).L(36, top - 14).L(38, top).Z();
  // Victoria: robed figure, raised arm and the staff with wreath and eagle.
  q.M(24, top - 12).C(24, top - 24, 26, top - 32, 28.6, top - 37).L(33.4, top - 37).C(35, top - 30, 36, top - 22, 36, top - 13).Z();
  // Wings sweeping up behind her shoulders.
  q.M(29, top - 34).C(24, top - 40, 21, top - 48, 22, top - 56).C(25, top - 50, 28, top - 44, 32, top - 38).Z();
  q.M(33, top - 34).L(40, top - 46).L(42, top - 45).L(36, top - 32).Z();
  let quad = q.toString();
  const head = circle(31, top - 40, 2.8);
  quad += rect(40, top - 67, 2, 23);
  quad += `M34 ${top - 80}L41 ${top - 76}L48 ${top - 80}L44 ${top - 74}L38 ${top - 74}Z`;
  const wreath = circle(41, top - 72, 5) + circle(41, top - 72, 2.6);

  return {
    id: "brandenburg",
    name: "Brandenburg Gate",
    width: 300,
    height: G,
    ground: G,
    layers: [
      { d: interior, tone: "shade", noLine: true },
      { d: body, tone: "body" },
      { d: detail, tone: "shade", noLine: true },
      { d: quad, tone: "accent" },
      { d: head, tone: "accent", noLine: true },
      { d: wreath, tone: "accent", rule: "evenodd" },
    ],
  };
}

/* ---------------------------------------------------------------------------- */

const builders: Record<MonumentId, () => Monument> = {
  eiffel,
  taj,
  colosseum,
  pyramids,
  pagoda,
  christ,
  opera,
  liberty,
  bigben,
  burj,
  goldengate,
  angkor,
  brandenburg,
};

const cache = new Map<MonumentId, Monument>();

export function getMonument(id: MonumentId): Monument {
  let m = cache.get(id);
  if (!m) {
    m = builders[id]();
    // Detail never belongs in the line drawings.
    m.layers = m.layers.map((l) => (l.detail ? { ...l, noLine: true } : l));
    cache.set(id, m);
  }
  return m;
}

export const MONUMENT_IDS = Object.keys(builders) as MonumentId[];
