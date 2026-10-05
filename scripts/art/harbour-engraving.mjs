/**
 * Generates public/art/harbour-engraving.svg: Sydney Harbour as an antique
 * copperplate engraving, cut as fine light lines into the footer's ink.
 *
 *   node scripts/art/harbour-engraving.mjs
 *
 * Everything is deterministic (seeded), so the output only changes when this
 * file does. Tone comes from line density alone: no gradients, no opacity.
 * Swap LINE and BG to print it as ink on paper instead.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LINE = "#5E8790"; // a dim sea-teal: quiet texture under the footer's gold wordmark
const BG = "#0A1E2C"; // the footer's ink

const W = 2400;
const H = 800;
const HY = 600; // waterline

/* --------------------------------- helpers -------------------------------- */

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1788);
const rr = (a, b) => a + rand() * (b - a);
const r = (v) => Math.round(v * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const out = [];
const add = (s) => out.push(s);
const poly = (pts, close = true) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join("L")}${close ? "Z" : ""}`;
const rect = (x, y, w, h) => `M${r(x)} ${r(y)}h${r(w)}v${r(h)}h${r(-w)}Z`;
const line = (x1, y1, x2, y2) => `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`;
const fillBG = (d) => add(`<path d="${d}" fill="${BG}"/>`);
const fillP = (d, p) => add(`<path d="${d}" fill="url(#${p})"/>`);
// Strokes are drawn a touch heavy: the plate is usually shown at about half size.
const WEIGHT = 1.25;
const stroke = (d, w = 1, extra = "") => add(`<path d="${d}" fill="none" stroke="${LINE}" stroke-width="${r(w * WEIGHT)}"${extra}/>`);

/* -------------------------------- patterns -------------------------------- */

function hatchPattern(id, gap, angle, width = 0.85) {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"${angle ? ` patternTransform="rotate(${angle})"` : ""}><path d="M0 ${gap / 2}H${gap}" stroke="${LINE}" stroke-width="${width}"/></pattern>`;
}
const defs = [
  hatchPattern("h3", 3, 0),
  hatchPattern("h4", 4.2, 0),
  hatchPattern("h6", 6, 0, 0.8),
  hatchPattern("h9", 9, 0, 0.75),
  hatchPattern("v3", 3, 90),
  hatchPattern("v5", 5, 90, 0.8),
  hatchPattern("v8", 8, 90, 0.75),
  hatchPattern("d4", 4, 45),
  hatchPattern("d6", 6, 45, 0.8),
  hatchPattern("e4", 4, -45),
  hatchPattern("e7", 7, -45, 0.8),
  // Office windows: short dashes on a grid.
  `<pattern id="win" width="6" height="8" patternUnits="userSpaceOnUse"><path d="M1.2 4H4" stroke="${LINE}" stroke-width="1"/></pattern>`,
  `<pattern id="winf" width="8" height="11" patternUnits="userSpaceOnUse"><path d="M2 5H4.6" stroke="${LINE}" stroke-width="0.9"/></pattern>`,
  // Ashlar coursing for granite: rows with staggered joints.
  `<pattern id="ashlar" width="18" height="12" patternUnits="userSpaceOnUse"><path d="M0 0.5H18M0 6.5H18M5 0.5V6.5M14 6.5V12" stroke="${LINE}" stroke-width="0.8"/></pattern>`,
];

/* ----------------------------------- sky ---------------------------------- */

/** An engraved cloud: a lens of fine parallel strokes. */
function cloud(cx, cy, len, rows, gap = 4.2) {
  let d = "";
  for (let i = 0; i < rows; i++) {
    const k = (i - (rows - 1) / 2) / (rows / 2);
    const l = len * Math.sqrt(Math.max(0, 1 - k * k)) * rr(0.8, 1.05);
    const x = cx - l / 2 + rr(-len * 0.06, len * 0.06) + k * len * 0.08;
    // Break long strokes, as a burin would.
    let at = x;
    while (at < x + l) {
      const seg = Math.min(rr(40, 140), x + l - at);
      d += line(at, cy + i * gap, at + seg, cy + i * gap);
      at += seg + rr(4, 14);
    }
  }
  stroke(d, 0.8);
}

function moon(cx, cy, rad) {
  fillBG(`M${cx - rad} ${cy}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0Z`);
  // Dense horizontal rules read as the bright disc; a few gaps for the seas.
  let d = "";
  let row = 0;
  for (let y = cy - rad + 1.5; y < cy + rad; y += 2.4, row++) {
    const half = Math.sqrt(rad * rad - (y - cy) ** 2);
    // A soft terminator on the left: alternate rules stop short.
    const x0 = row % 2 ? cx - half : cx - half * 0.35;
    d += line(x0, y, cx + half, y);
  }
  stroke(d, 0.9);
  stroke(`M${cx - rad} ${cy}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0Z`, 1.2);
}

function gulls(list) {
  let d = "";
  for (const [x, y, s] of list) d += `M${r(x - 7 * s)} ${r(y - 2 * s)}q${r(3.5 * s)} ${r(-4 * s)} ${r(7 * s)} ${r(2 * s)}q${r(3.5 * s)} ${r(-6 * s)} ${r(7 * s)} ${r(-2 * s)}`;
  stroke(d, 1.2, ' stroke-linecap="round"');
}

/* -------------------------------- skyline --------------------------------- */

const BASE = HY - 3;

function tower(x, w, h, tone, roof) {
  const top = BASE - h;
  const shape = [];
  // Roof profiles.
  if (roof === "step") {
    shape.push([x, BASE], [x, top + 14], [x + w * 0.12, top + 14], [x + w * 0.12, top + 6], [x + w * 0.26, top + 6], [x + w * 0.26, top], [x + w * 0.74, top], [x + w * 0.74, top + 6], [x + w * 0.88, top + 6], [x + w * 0.88, top + 14], [x + w, top + 14], [x + w, BASE]);
  } else if (roof === "slant") {
    shape.push([x, BASE], [x, top + 12], [x + w, top], [x + w, BASE]);
  } else if (roof === "crown") {
    shape.push([x, BASE], [x, top + 10], [x + w * 0.2, top + 10], [x + w * 0.5, top - 6], [x + w * 0.8, top + 10], [x + w, top + 10], [x + w, BASE]);
  } else {
    shape.push([x, BASE], [x, top], [x + w, top], [x + w, BASE]);
  }
  const d = poly(shape);
  fillBG(d);
  // Lit (moon-side, right) face: dense verticals. Shade face: windows or sparse rules.
  const split = x + w * 0.62;
  const lit = rect(split, top + (roof === "flat" || !roof ? 0 : 14), x + w - split, BASE - top);
  const shade = rect(x + 2, top + 16, split - x - 4, BASE - top - 18);
  if (tone === "near") {
    fillP(shade, "win");
    fillP(lit, "v3");
  } else if (tone === "mid") {
    fillP(shade, "winf");
    fillP(lit, "v3");
  } else {
    fillP(shade, "e7");
    fillP(lit, "v5");
  }
  stroke(line(split, top + 14, split, BASE), 0.8);
  stroke(d, tone === "far" ? 0.8 : 1.1);
  if (roof === "mast") stroke(line(x + w * 0.5, top, x + w * 0.5, top - h * 0.18), 1);
}

function sydneyTower(x) {
  const top = BASE - 330;
  // Shaft with its tension cables.
  fillBG(rect(x - 6, top + 30, 12, BASE - top - 30));
  fillP(rect(x, top + 30, 6, BASE - top - 30), "v3");
  stroke(rect(x - 6, top + 30, 12, BASE - top - 30), 1.1);
  let cables = "";
  for (const dx of [-26, -14, 14, 26]) cables += line(x + dx * 0.25, top + 58, x + dx, BASE - 60);
  stroke(cables, 0.7);
  // The golden turret: a drum of banded windows.
  const tw = 50;
  const ty = top;
  const turret = `M${x - tw / 2} ${ty + 6}L${x - tw / 2 + 4} ${ty}H${x + tw / 2 - 4}L${x + tw / 2} ${ty + 6}V${ty + 28}L${x + tw / 2 - 6} ${ty + 34}H${x - tw / 2 + 6}L${x - tw / 2} ${ty + 28}Z`;
  fillBG(turret);
  fillP(rect(x - tw / 2 + 2, ty + 7, tw - 4, 20), "h3");
  fillP(rect(x + 6, ty + 7, tw / 2 - 8, 20), "v3");
  stroke(turret, 1.2);
  stroke(line(x - tw / 2, ty + 17, x + tw / 2, ty + 17), 1);
  // Mast.
  stroke(line(x, ty, x, ty - 46) + line(x - 3, ty - 12, x + 3, ty - 12), 1.2);
}

function skyline() {
  // Back row: taller, fainter. Front row: lower, sharper.
  const back = [
    [1000, 40, 150, "slant"], [1046, 30, 196, "mast"], [1082, 52, 168, "step"], [1140, 34, 232, "crown"],
    [1250, 46, 210, "flat"], [1300, 30, 252, "mast"], [1336, 54, 186, "step"], [1396, 38, 222, "slant"],
    [1440, 48, 172, "flat"], [1494, 34, 204, "crown"], [1534, 56, 160, "step"], [1596, 40, 188, "mast"],
    [1642, 46, 140, "flat"], [1694, 36, 120, "slant"],
  ];
  for (const [x, w, h, roof] of back) tower(x, w, h, "far", roof);
  sydneyTower(1206);
  const front = [
    [1010, 46, 92, "flat"], [1060, 36, 118, "step"], [1100, 58, 104, "flat"], [1164, 40, 140, "slant"],
    [1230, 52, 126, "flat"], [1286, 42, 150, "step"], [1334, 48, 112, "crown"], [1390, 44, 132, "flat"],
    [1640, 52, 96, "flat"], [1698, 40, 84, "step"],
  ];
  for (const [x, w, h, roof] of front) tower(x, w, h, roof === "step" ? "mid" : "near", roof);
  // Far shore under the city: a quiet band of short verticals.
  fillBG(rect(960, BASE - 6, 800, 9));
  fillP(rect(960, BASE - 6, 800, 9), "v3");
  stroke(line(960, BASE - 6, 1760, BASE - 6), 0.9);
}

/* ---------------------------------- water --------------------------------- */

const glints = []; // bright spans: [x0, x1, strength]

function water() {
  fillBG(rect(0, HY, W, H - HY));
  let d = "";
  let y = HY + 2.5;
  while (y < H) {
    const depth = (y - HY) / (H - HY); // 0 at horizon, 1 at the bottom
    const amp = 0.4 + depth * 3.2;
    let x = rr(-40, 0);
    while (x < W) {
      // Reflections under the bright forms make the water busier there.
      let boost = 0;
      for (const [a, b, s] of glints) {
        const spread = (b - a) * (0.12 + depth * 0.5);
        if (x > a - spread && x < b + spread) boost = Math.max(boost, s * (1 - depth * 0.55));
      }
      const density = clamp(0.36 + depth * 0.22 + boost, 0, 0.94);
      const len = rr(14, 60 + depth * 120) * (0.6 + density);
      if (rand() < density) {
        const sag = rr(-amp, amp);
        d += `M${r(x)} ${r(y)}q${r(len / 2)} ${r(sag)} ${r(len)} 0`;
      }
      x += len + rr(4, 26) * (1.3 - density);
    }
    y += 2.6 + depth * 4.6 + rr(-0.3, 0.3);
  }
  stroke(d, 0.85);
  // The bright line of the horizon.
  stroke(line(0, HY + 0.6, W, HY + 0.6), 1);
}

/** Broken vertical reflections: short horizontal ticks under a form. */
function reflection(x0, x1, depthPx, density) {
  let d = "";
  for (let y = HY + 4; y < HY + depthPx; y += 3.2) {
    const k = (y - HY) / depthPx;
    for (let x = x0; x < x1; x += rr(5, 12)) {
      if (rand() < density * (1 - k)) {
        const l = rr(3, 10);
        d += line(x, y, x + l, y);
      }
    }
  }
  stroke(d, 0.9);
}

/* --------------------------------- bridge --------------------------------- */

function bridge() {
  const N = 300; // north pylon centre
  const S = 940; // south pylon centre
  const a0 = 330;
  const a1 = 910;
  const mid = (a0 + a1) / 2;
  const half = (a1 - a0) / 2;
  const par = (x, end, apex) => end - (end - apex) * (1 - ((x - mid) / half) ** 2);
  const bottom = (x) => par(x, 598, 462);
  const top = (x) => par(x, 532, 440);
  const deckTop = 538;
  const deckBot = 549;

  // Approach viaduct on the north shore: granite arches.
  const piers = [28, 118, 208];
  let vd = rect(-10, deckBot, 290, 60);
  fillBG(vd);
  fillP(rect(-10, deckBot, 290, 60), "ashlar");
  let arches = "";
  for (let i = 0; i < piers.length; i++) {
    const x0 = piers[i] + 14;
    const x1 = (piers[i + 1] ?? 268) - 14;
    const cx = (x0 + x1) / 2;
    const rad = (x1 - x0) / 2;
    arches += `M${r(x0)} 609V${r(deckBot + 12 + rad)}A${r(rad)} ${r(rad)} 0 0 1 ${r(x1)} ${r(deckBot + 12 + rad)}V609Z`;
  }
  fillBG(arches);
  fillP(arches, "d6");
  stroke(arches, 1.1);
  stroke(rect(-10, deckBot, 290, 60), 1.1);

  // The arch: fill between the chords, then chords and truss.
  const steps = 80;
  const topPts = [];
  const botPts = [];
  for (let i = 0; i <= steps; i++) {
    const x = a0 + ((a1 - a0) * i) / steps;
    topPts.push([x, top(x)]);
    botPts.push([x, bottom(x)]);
  }
  fillBG(poly([...topPts, ...botPts.slice().reverse()]));
  const chord = (pts, dy) => poly(pts.map(([x, y]) => [x, y + dy]), false);
  stroke(chord(topPts, 0) + chord(topPts, 5), 1.3);
  stroke(chord(botPts, 0) + chord(botPts, -5), 1.3);
  const panels = 28;
  let truss = "";
  for (let i = 0; i <= panels; i++) {
    const x = a0 + ((a1 - a0) * i) / panels;
    truss += line(x, top(x) + 5, x, bottom(x) - 5);
    if (i < panels) {
      const xn = a0 + ((a1 - a0) * (i + 1)) / panels;
      // Diagonals lean towards the crown on each half, Pratt-style.
      if (x < mid) truss += line(x, bottom(x) - 5, xn, top(xn) + 5);
      else truss += line(x, top(x) + 5, xn, bottom(xn) - 5);
    }
  }
  stroke(truss, 1);
  // Moonlit right half of the arch: hatch the top chord band.
  let litBand = "";
  for (let i = steps / 2; i < steps; i++) {
    const [x1, y1] = topPts[i];
    const [x2, y2] = topPts[i + 1];
    litBand += `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}L${r(x2)} ${r(y2 + 5)}L${r(x1)} ${r(y1 + 5)}Z`;
  }
  fillP(litBand, "v3");

  // Hangers from the lower chord down to the deck.
  let hangers = "";
  for (let i = 1; i < panels; i++) {
    const x = a0 + ((a1 - a0) * i) / panels;
    if (bottom(x) < deckTop - 3) hangers += line(x, bottom(x), x, deckTop);
  }
  stroke(hangers, 0.9);

  // Deck, with its railing posts.
  const deck = rect(-10, deckTop, 1030, deckBot - deckTop);
  fillBG(deck);
  fillP(deck, "h3");
  stroke(deck, 1.1);
  let posts = "";
  for (let x = -6; x < 1020; x += 7) posts += line(x, deckTop - 4, x, deckTop);
  stroke(posts + line(-10, deckTop - 4, 1020, deckTop - 4), 0.8);

  // Granite pylons, with an arch where the roadway passes.
  for (const cx of [N, S]) {
    const wB = 58;
    const wT = 48;
    const yT = 494;
    const body = poly([
      [cx - wB / 2, 602], [cx - wT / 2, yT + 18], [cx - wT / 2 - 3, yT + 18], [cx - wT / 2 - 3, yT + 10],
      [cx - wT / 2 + 3, yT + 10], [cx - wT / 2 + 3, yT], [cx + wT / 2 - 3, yT], [cx + wT / 2 - 3, yT + 10],
      [cx + wT / 2 + 3, yT + 10], [cx + wT / 2 + 3, yT + 18], [cx + wT / 2, yT + 18], [cx + wB / 2, 602],
    ]);
    fillBG(body);
    fillP(body, "ashlar");
    // Moon side brighter, shadow side crosshatched.
    fillP(poly([[cx + 6, 602], [cx + 6, yT + 18], [cx + wT / 2, yT + 18], [cx + wB / 2, 602]]), "v3");
    stroke(body, 1.3);
    const ow = 13;
    const opening = `M${cx - ow} ${deckBot + 6}V${deckTop - 6}A${ow} ${ow} 0 0 1 ${cx + ow} ${deckTop - 6}V${deckBot + 6}Z`;
    fillBG(opening);
    fillP(rect(cx - ow, deckTop, ow * 2, deckBot - deckTop), "h3");
    stroke(opening, 1.1);
    stroke(line(cx - wT / 2 + 3, yT + 4, cx + wT / 2 - 3, yT + 4), 0.9);
    // Abutment on the waterline.
    const abut = rect(cx - 46, 596, 92, 10);
    fillBG(abut);
    fillP(abut, "ashlar");
    stroke(abut, 1);
  }
  // A short southern approach running into the city's shore.
  const sa = rect(970, deckBot, 50, 50);
  fillBG(sa);
  fillP(sa, "ashlar");
  stroke(sa, 1);
}

/* ------------------------------- opera house ------------------------------ */

function operaHouse() {
  const podTop = 566;
  // Podium: granite platform with coursing and a balustrade.
  const pod = poly([[1356, 604], [1360, podTop], [1944, podTop], [1952, 604]]);
  fillBG(pod);
  fillP(pod, "h6");
  fillP(poly([[1930, 604], [1930, podTop], [1944, podTop], [1952, 604]]), "v3");
  stroke(pod, 1.2);
  let bal = "";
  for (let x = 1362; x < 1942; x += 5) bal += line(x, podTop - 4, x, podTop);
  stroke(bal + line(1360, podTop - 4, 1944, podTop - 4), 0.8);
  // Broad steps at the near corner.
  let st = "";
  for (let i = 0; i < 6; i++) st += line(1360 - i * 2, podTop + 6 + i * 6, 1420 + i * 8, podTop + 6 + i * 6);
  stroke(st, 0.9);

  /** A sail shell: a concave glazed mouth on the left, a long convex back. */
  function shell(bx, ex, tx, ty, ribs = 22) {
    const by = podTop;
    const h = by - ty;
    const mouthC = [bx + (tx - bx) * 0.25 + 18, by - h * 0.62];
    const b1 = [tx + (ex - tx) * 0.46, ty - h * 0.04];
    const b2 = [ex - (ex - bx) * 0.06, by - h * 0.42];
    const d = `M${r(bx)} ${by}Q${r(mouthC[0])} ${r(mouthC[1])} ${r(tx)} ${r(ty)}C${r(b1[0])} ${r(b1[1])} ${r(b2[0])} ${r(b2[1])} ${r(ex)} ${by}Z`;
    fillBG(d);
    // Tile ribs fanning from the tip to the base, closer together on the lit side.
    let ribD = "";
    for (let k = 1; k < ribs; k++) {
      const t = (k / ribs) ** 0.72;
      const px = bx + (ex - bx) * t;
      const cxp = mouthC[0] + (b1[0] - mouthC[0]) * t + (b2[0] - b1[0]) * t * t * 0.4;
      const cyp = mouthC[1] + (b1[1] - mouthC[1]) * t * 0.7;
      ribD += `M${r(tx)} ${r(ty)}Q${r(cxp)} ${r(cyp)} ${r(px)} ${by}`;
    }
    stroke(ribD, 0.8);
    // Courses across the ribs: the chevron tiling.
    let course = "";
    for (const s of [0.3, 0.5, 0.68, 0.84]) {
      const ax = tx + (bx + (ex - bx) * 0.08 - tx) * s;
      const ay = ty + (by - ty) * s;
      const cx = tx + (b1[0] - tx) * s + (ex - bx) * 0.12 * s;
      const cy = ty + (b1[1] - ty) * s + h * 0.1 * s;
      const qx = tx + (ex - tx) * s;
      const qy = ty + (by - ty) * s * 0.98;
      course += `M${r(ax)} ${r(ay)}Q${r(cx)} ${r(cy)} ${r(qx)} ${r(qy)}`;
    }
    stroke(course, 0.7);
    // Glazed mouth: a crescent of louvred glass.
    const inner = [mouthC[0] + 16, mouthC[1] + 10];
    const mouth = `M${r(bx)} ${by}Q${r(mouthC[0])} ${r(mouthC[1])} ${r(tx)} ${r(ty)}Q${r(inner[0])} ${r(inner[1])} ${r(bx + (ex - bx) * 0.16)} ${by}Z`;
    fillBG(mouth);
    fillP(mouth, "v5");
    stroke(mouth, 0.9);
    stroke(d, 1.4);
  }
  // Back to front: the concert hall group (left) and the theatre group (right).
  shell(1452, 1650, 1474, 432, 24);
  shell(1676, 1862, 1700, 446, 22);
  shell(1414, 1608, 1432, 392, 26);
  shell(1646, 1826, 1664, 410, 24);
  shell(1852, 1932, 1860, 500, 14);
  shell(1384, 1528, 1394, 470, 18);
  shell(1626, 1748, 1636, 480, 16);
}

/* ------------------------------ Fort Denison ------------------------------ */

/** The harbour's little island fort: a Martello tower on a rocky islet. */
function fortDenison(cx) {
  const isl = `M${cx - 70} 612Q${cx - 50} 598 ${cx - 20} 600H${cx + 34}Q${cx + 60} 600 ${cx + 76} 612Z`;
  fillBG(isl);
  fillP(isl, "d6");
  stroke(isl, 1);
  // Barracks with a pitched roof.
  const barracks = rect(cx - 46, 586, 46, 16);
  fillBG(barracks);
  fillP(barracks, "ashlar");
  stroke(barracks + `M${cx - 50} 587L${cx - 23} 576L${cx + 4} 587`, 1);
  // The tower: a stone drum with a crenellated parapet.
  const tw = 30;
  const tower = rect(cx + 6, 566, tw, 36);
  fillBG(tower);
  fillP(tower, "ashlar");
  fillP(rect(cx + 6 + tw * 0.6, 566, tw * 0.4, 36), "v3");
  let cren = `M${cx + 4} 566`;
  for (let i = 0; i < 6; i++) cren += `h${i % 2 ? 6 : 5.7}v${i % 2 ? 5 : -5}`;
  stroke(tower + cren, 1.1);
  stroke(line(cx + 21, 566, cx + 21, 548) + `M${cx + 21} 549h10l-3 3l3 3h-10`, 1);
}

/* ------------------------------ shores & trees ---------------------------- */

/** A tree canopy: a union of puffs with a scalloped contour and moonlit stipple. */
function canopy(blobs, light = 1) {
  const cx = blobs.reduce((a, b) => a + b[0], 0) / blobs.length;
  const cy = blobs.reduce((a, b) => a + b[1], 0) / blobs.length;
  const inside = (x, y) => blobs.some(([bx, by, br]) => (x - bx) ** 2 + (y - by) ** 2 <= br * br);
  const pts = [];
  for (let a = 0; a < 360; a += 2) {
    const t = (a * Math.PI) / 180;
    let last = 0;
    for (let s = 0; s < 260; s += 1) if (inside(cx + Math.cos(t) * s, cy + Math.sin(t) * s)) last = s;
    pts.push([cx + Math.cos(t) * last, cy + Math.sin(t) * last]);
  }
  const outline = poly(pts);
  fillBG(outline);
  const minX = Math.min(...blobs.map((b) => b[0] - b[2]));
  const maxX = Math.max(...blobs.map((b) => b[0] + b[2]));
  const minY = Math.min(...blobs.map((b) => b[1] - b[2]));
  const maxY = Math.max(...blobs.map((b) => b[1] + b[2]));
  const R = Math.max(maxX - minX, maxY - minY) / 2;
  const stipple = [];
  const area = (maxX - minX) * (maxY - minY);
  for (let i = 0; i < area / 10; i++) {
    const x = rr(minX, maxX);
    const y = rr(minY, maxY);
    if (!inside(x, y)) continue;
    // Moonlight from the upper right; each puff also catches its own light.
    let lit = ((x - cx) / R) * 0.55 - ((y - cy) / R) * 0.65;
    for (const [bx, by, br] of blobs) {
      const dd = Math.hypot(x - bx, y - by) / br;
      if (dd < 1) lit = Math.max(lit, ((x - bx) / br) * 0.5 - ((y - by) / br) * 0.6 + 0.15 - dd * 0.2);
    }
    const p = clamp(0.12 + (lit + 0.6) * 0.55 * light, 0.04, 0.92);
    if (rand() < p) stipple.push([x, y]);
  }
  // Engraved foliage: tiny cupped strokes, packed where the moon catches the leaves.
  stroke(stipple.map(([x, y]) => `M${r(x)} ${r(y)}q1.6 2.2 3.4 0`).join(""), 0.9, ' stroke-linecap="round"');
  // Leafy ticks along the rim.
  let ticks = "";
  for (let i = 0; i < pts.length; i += 2) {
    const [x, y] = pts[i];
    const t = Math.atan2(y - cy, x - cx);
    ticks += `M${r(x)} ${r(y)}l${r(Math.cos(t + 0.6) * 4)} ${r(Math.sin(t + 0.6) * 4)}`;
  }
  stroke(ticks, 0.9);
  stroke(outline, 1.2);
}

function trunk(x, yTop, yBot, w, lean = 0) {
  const d = poly([[x - w / 2, yBot], [x - w * 0.3 + lean, yTop], [x + w * 0.3 + lean, yTop], [x + w / 2, yBot]]);
  fillBG(d);
  fillP(poly([[x + w * 0.05, yBot], [x + lean * 0.9, yTop], [x + w * 0.3 + lean, yTop], [x + w / 2, yBot]]), "v3");
  stroke(d, 1.1);
}

function shoreLeft() {
  const land = poly([[-10, 612], [120, 610], [250, 616], [330, 628], [372, 668], [404, 730], [420, 810], [-10, 810]]);
  fillBG(land);
  fillP(land, "e7");
  // Sea wall along the waterline.
  const wall = poly([[250, 616], [330, 628], [372, 668], [380, 690], [354, 676], [318, 646], [246, 632]]);
  fillBG(wall);
  fillP(wall, "ashlar");
  stroke(wall, 1);
  stroke(land, 1.1);
  trunk(96, 610, 700, 26, -6);
  trunk(232, 640, 720, 20, 8);
  canopy([[40, 540, 70], [104, 500, 76], [168, 548, 62], [70, 600, 56], [-20, 560, 60], [140, 600, 50]]);
  canopy([[236, 600, 50], [286, 630, 40], [196, 640, 44], [252, 660, 36]], 1.1);
  // Grass ticks in the foreground.
  let g = "";
  for (let i = 0; i < 220; i++) {
    const x = rr(0, 400);
    const y = rr(700, 800);
    if (x > 420 - (800 - y) * 0.2) continue;
    g += `M${r(x)} ${r(y)}l${r(rr(-2, 2))} ${r(-rr(4, 9))}`;
  }
  stroke(g, 0.9);
}

function shoreRight() {
  const land = poly([[2410, 598], [2210, 604], [2096, 616], [2040, 650], [2008, 712], [1994, 810], [2410, 810]]);
  fillBG(land);
  fillP(land, "e7");
  const wall = poly([[2096, 616], [2040, 650], [2008, 712], [2018, 714], [2050, 660], [2102, 628]]);
  fillBG(wall);
  fillP(wall, "ashlar");
  stroke(wall, 1);
  stroke(land, 1.1);
  trunk(2150, 590, 650, 22, 4);
  trunk(2300, 560, 640, 28, -5);
  canopy([[2128, 540, 56], [2180, 512, 64], [2232, 548, 52], [2150, 586, 44]]);
  canopy([[2290, 486, 74], [2360, 470, 78], [2416, 520, 70], [2330, 540, 62], [2250, 520, 50]]);
  let g = "";
  for (let i = 0; i < 200; i++) {
    const x = rr(2000, 2400);
    const y = rr(700, 800);
    if (x < 1994 + (800 - y) * 0.1) continue;
    g += `M${r(x)} ${r(y)}l${r(rr(-2, 2))} ${r(-rr(4, 9))}`;
  }
  stroke(g, 0.9);
}

/* ---------------------------------- build --------------------------------- */

// No background: the sky stays transparent so the footer's wordmark can rise behind the scene.
// The band where the wordmark stands (x 300 to 2100, y 90 to 520) is kept clear: one small
// cloud at the far left, the moon out past the last letter, the gulls low over the water.
cloud(150, 70, 220, 4);
moon(2290, 150, 34);
gulls([[400, 560, 0.8], [428, 548, 0.6], [2180, 380, 0.7]]);
skyline();

// Bright forms that light the water beneath them.
glints.push([1384, 1932, 0.32], [270, 330, 0.28], [910, 970, 0.28], [430, 820, 0.12], [1010, 1380, 0.14]);
water();
reflection(1390, 1930, 120, 0.45);
reflection(276, 326, 70, 0.6);
reflection(916, 966, 70, 0.6);

// Fort Denison sits forward in the water, so it reads clear of the city behind.
reflection(1104, 1290, 120, 0.55);
add(`<g transform="translate(-660 -330) scale(1.6)">`);
fortDenison(1180);
add(`</g>`);
bridge();
operaHouse();
shoreLeft();
shoreRight();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Sydney Harbour by moonlight, engraved: the Harbour Bridge, the Opera House and the city skyline, with trees on both shores."><defs>${defs.join("")}</defs>${out.join("")}</svg>\n`;

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/art/harbour-engraving.svg");
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, svg);
console.log(`wrote ${file} (${(svg.length / 1024).toFixed(0)} KB)`);
