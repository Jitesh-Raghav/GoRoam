import type { CSSProperties, ReactNode } from "react";
import { mix } from "./color";
import {
  PathBuilder,
  canopyBlobs,
  circle,
  cypressTree,
  ellipse,
  forestOnRidge,
  mountainRidge,
  mulberry32,
  palmTree,
  r1,
  rect,
  rollingRidge,
  umbrellaPine,
  type Pt,
} from "./geometry";
import { LondonClock } from "./london-clock";
import { Birds, Clouds, Layer, Mist, Monument, Reflection, Sky, Stars, Sun, VIEW_H, VIEW_W, Water } from "./primitives";

export type SceneId =
  | "taj"
  | "eiffel"
  | "colosseum"
  | "pyramids"
  | "fuji"
  | "santorini"
  | "machupicchu"
  | "rio"
  | "sydney"
  | "newyork"
  | "london"
  | "dubai"
  | "sanfrancisco"
  | "angkor"
  | "peaks"
  | "coast"
  | "aurora"
  | "dunes"
  | "berlin"
  | "hills"
  | "lake"
  | "city"
  | "journey";

export interface SceneDef {
  id: SceneId;
  /** Dominant colour, used for UI accents around the scene. */
  tint: string;
  /** Whether the upper sky is dark (light text reads well on it). */
  dark: boolean;
  render: (uid: string) => ReactNode;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

/** t at which a monotonic cubic reaches y. */
const bezAtY = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, y: number) => {
  let lo = 0;
  let hi = 1;
  const rising = p3[1] > p0[1];
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const my = bez(p0, p1, p2, p3, mid)[1];
    if (my < y === rising) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

const poly = (pts: Pt[], close = true) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join("") + (close ? "Z" : "");

function parisRoofs(seed: number, y: number, from: number, to: number, minH: number, maxH: number, windows?: number) {
  const rand = mulberry32(seed);
  let body = "";
  let lit = "";
  let x = from;
  while (x < to) {
    const w = 46 + rand() * 64;
    const h = minH + rand() * (maxH - minH);
    const top = y - h;
    const rh = 14 + rand() * 10;
    body += rect(x, top, w + 1, VIEW_H - top);
    body += `M${r1(x)} ${r1(top)}L${r1(x + 7)} ${r1(top - rh)}L${r1(x + w - 7)} ${r1(top - rh)}L${r1(x + w)} ${r1(top)}Z`;
    const chimneys = Math.floor(rand() * 3);
    for (let k = 0; k < chimneys; k++) body += rect(x + 10 + rand() * (w - 26), top - rh - 9, 6, 12);
    if (windows) {
      for (let wy = top + 10; wy < y - 6; wy += 16) {
        for (let wx = x + 8; wx < x + w - 10; wx += 14) if (rand() < windows) lit += rect(wx, wy, 5, 8);
      }
    }
    x += w;
  }
  return { body, lit };
}

function skyline(seed: number, y: number, from: number, to: number, minH: number, maxH: number, windows = 0.1) {
  const rand = mulberry32(seed);
  let body = "";
  let lit = "";
  let x = from;
  while (x < to) {
    const w = 18 + rand() * 40;
    const tall = rand() > 0.8;
    const h = tall ? maxH * (0.7 + rand() * 0.3) : minH + rand() * (maxH - minH) * 0.55;
    const top = y - h;
    body += rect(x, top, w + 0.5, VIEW_H - top);
    if (tall && rand() > 0.4) body += rect(x + w / 2 - 1.2, top - 24, 2.4, 26);
    if (rand() > 0.7) body += rect(x + 4, top - 8, w - 8, 9);
    for (let wy = top + 8; wy < y - 4; wy += 9) {
      for (let wx = x + 4; wx < x + w - 4; wx += 7) if (rand() < windows) lit += rect(wx, wy, 3, 4);
    }
    x += w + rand() * 5;
  }
  return { body, lit };
}

function camel(x: number, y: number, s: number) {
  const p = (dx: number, dy: number) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  return (
    `M${p(-14, 0)}L${p(-13, -12)}Q${p(-17, -16)} ${p(-12, -20)}Q${p(-6, -28)} ${p(0, -21)}` +
    `Q${p(4, -19)} ${p(8, -20)}L${p(13, -27)}Q${p(16, -31)} ${p(20, -28)}L${p(19, -25)}L${p(15, -23)}` +
    `L${p(11, -14)}L${p(11.5, 0)}L${p(9.5, 0)}L${p(8, -11)}L${p(-8, -11)}L${p(-9.5, 0)}Z`
  );
}

function sailboat(x: number, y: number, s: number) {
  const p = (dx: number, dy: number) => `${r1(x + dx * s)} ${r1(y + dy * s)}`;
  return (
    `M${p(-24, 0)}L${p(24, 0)}L${p(17, 8)}L${p(-17, 8)}Z` +
    `M${p(1, -3)}L${p(1, -58)}L${p(24, -5)}Z` +
    `M${p(-2, -52)}L${p(-2, -5)}L${p(-20, -7)}Z`
  );
}

function blossomTree(x: number, y: number, h: number, dir: 1 | -1, seed: number) {
  const b = new PathBuilder();
  const tw = h * 0.05;
  const topX = x + dir * h * 0.28;
  const topY = y - h * 0.62;
  b.M(x - tw, y)
    .C(x - tw, y - h * 0.3, topX - tw * 0.4, topY + h * 0.2, topX - 2, topY)
    .L(topX + 2, topY)
    .C(topX + tw * 0.4, topY + h * 0.22, x + tw, y - h * 0.3, x + tw, y)
    .Z();
  const branches: [Pt, Pt][] = [
    [[x + dir * h * 0.08, y - h * 0.4], [x + dir * h * 0.62, y - h * 0.72]],
    [[x + dir * h * 0.16, y - h * 0.52], [x - dir * h * 0.08, y - h * 0.86]],
    [[topX, topY], [topX + dir * h * 0.3, topY - h * 0.28]],
  ];
  for (const [a, e] of branches) {
    b.M(a[0] - 2.5, a[1] + 3)
      .Q((a[0] + e[0]) / 2, (a[1] + e[1]) / 2 - h * 0.05, e[0], e[1])
      .Q((a[0] + e[0]) / 2 + 3, (a[1] + e[1]) / 2 - h * 0.03, a[0] + 3, a[1] - 2)
      .Z();
  }
  const blooms = [
    ...canopyBlobs(x + dir * h * 0.6, y - h * 0.74, h * 0.24, 24, seed),
    ...canopyBlobs(x - dir * h * 0.06, y - h * 0.86, h * 0.2, 18, seed + 1),
    ...canopyBlobs(topX + dir * h * 0.28, topY - h * 0.3, h * 0.22, 20, seed + 2),
  ];
  return { wood: b.toString(), blooms };
}

function Petals({ seed, count, color }: { seed: number; count: number; color: string }) {
  const rand = mulberry32(seed);
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => (
        <ellipse
          key={i}
          cx={r1(rand() * VIEW_W)}
          cy={-20}
          rx={5}
          ry={3}
          className="scene-petal"
          style={
            {
              "--sway": `${r1((rand() - 0.3) * 260)}px`,
              animationDuration: `${r1(9 + rand() * 8)}s`,
              animationDelay: `${r1(-rand() * 16)}s`,
            } as Vars
          }
        />
      ))}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Scenes                                    */
/* -------------------------------------------------------------------------- */

const taj: SceneDef = {
  id: "taj",
  tint: "#2F7C84",
  dark: true,
  render: (uid) => {
    const far = rollingRidge({ seed: 3, y: 744, amp: 16, waves: 4 });
    const mid = mountainRidge({ seed: 12, y: 774, amp: 16, rough: 0.64, detail: 8 });
    const ground = 792;
    const vx = 800;
    const trees = [0.07, 0.15, 0.25, 0.37, 0.51, 0.67, 0.85, 1.06].map((t) => ({
      t,
      y: ground + t * 208,
      dx: 46 + 372 * t,
      h: 22 + 292 * t,
    }));
    const pool = `M${vx - 14} ${ground + 4}L${vx + 14} ${ground + 4}L${vx + 110} 1000L${vx - 110} 1000Z`;
    const walk = `M${vx - 30} ${ground + 4}L${vx + 30} ${ground + 4}L${vx + 260} 1000L${vx - 260} 1000Z`;
    const tones = { body: "#DCE8E4", shade: "#A9C6C2", light: "#F7FBF9", glow: "#FFE6B8" };
    return (
      <>
        <Sky uid={uid} stops={[[0, "#0F2F42"], [0.34, "#1F6475"], [0.66, "#5FA8A6"], [0.88, "#CFE3CF"], [1, "#F6D9A6"]]} />
        <Layer depth={0.1}>
          <Sun uid={uid} x={912} y={410} r={88} color="#FFF3D6" glow="#FFC876" />
        </Layer>
        <Clouds color="#D9F0EB" opacity={0.4} items={[{ x: 170, y: 250, w: 300, seed: 4, speed: 70 }, { x: 1120, y: 180, w: 240, seed: 9, speed: 90 }]} />
        <Birds x={980} y={300} count={5} color="#0F3140" scale={0.9} duration={46} delay={-8} />
        <Layer depth={0.2}>
          <path d={far.d} fill="#7FB5AF" />
        </Layer>
        <Layer depth={0.35}>
          <path d={mid.d} fill="#5A9791" />
        </Layer>
        <Layer depth={0.5}>
          <Monument id="taj" x={vx} y={ground} scale={1} tones={tones} detailed />
        </Layer>
        <Layer depth={0.7}>
          <rect x="0" y={ground} width={VIEW_W} height={1000 - ground} fill="#1F5654" />
          <path d={walk} fill="#C9DDD6" />
          <defs>
            <clipPath id={`${uid}-pool`}>
              <path d={pool} />
            </clipPath>
          </defs>
          <path d={pool} fill="#8FCBC4" />
          <g clipPath={`url(#${uid}-pool)`}>
            <Reflection uid={uid} y={ground + 4} opacity={0.5}>
              <Monument id="taj" x={vx} y={ground} scale={1} tones={tones} />
            </Reflection>
          </g>
          {trees
            .slice()
            .reverse()
            .map((tr) => (
              <g key={tr.t} fill={mix("#4E8F86", "#0C2E32", Math.min(tr.t * 1.1, 1))}>
                <path d={cypressTree(vx - tr.dx, tr.y, tr.h)} />
                <path d={cypressTree(vx + tr.dx, tr.y, tr.h)} />
              </g>
            ))}
        </Layer>
      </>
    );
  },
};

const eiffel: SceneDef = {
  id: "eiffel",
  tint: "#A56488",
  dark: true,
  render: (uid) => {
    const farRoofs = parisRoofs(31, 812, -20, 1640, 22, 62);
    const nearRoofs = parisRoofs(7, 910, -20, 1640, 30, 78, 0.16);
    const rand = mulberry32(4);
    const sparkles = Array.from({ length: 80 }, (_, i) => {
      const ly = 70 + rand() * 440;
      const hw = ly < 104 ? 9 : ly < 380 ? 10 + ((ly - 104) / 276) * 22 : ly < 394 ? 38 : ly < 490 ? 35 + ((ly - 394) / 96) * 22 : 60;
      return { x: r1((rand() * 2 - 1) * hw * 0.85), y: r1(ly), d: r1(rand() * 4), i };
    });
    const s = 0.98;
    const baseY = 860;
    const topY = baseY - 600 * s;
    return (
      <>
        <Sky uid={uid} stops={[[0, "#27244C"], [0.3, "#534378"], [0.55, "#A06088"], [0.78, "#E68F7F"], [1, "#F6BD93"]]} />
        <Stars seed={9} count={70} maxY={420} opacity={0.75} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1120} y={780} r={58} color="#FFE3B6" glow="#FFA27C" />
        </Layer>
        <Clouds color="#F2A796" opacity={0.28} items={[{ x: 120, y: 420, w: 420, seed: 2, speed: 80 }, { x: 980, y: 330, w: 360, seed: 6, speed: 95 }]} />
        <g transform={`translate(800 ${r1(topY + 40)})`} opacity={0.5}>
          <defs>
            <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFF1C8" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFF1C8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="scene-beacon">
            <path d="M0 0L1300 -30L1300 30Z" fill={`url(#${uid}-beam)`} />
          </g>
        </g>
        <Layer depth={0.25}>
          <path d={farRoofs.body} fill="#7C4E74" />
        </Layer>
        <Layer depth={0.45}>
          <Monument id="eiffel" x={800} y={baseY} scale={s} tones={{ body: "#241D3D", shade: "#191330" }} detailed />
          <g transform={`translate(800 ${r1(topY)}) scale(${s})`} fill="#FFE9B0">
            {sparkles.map((p) => (
              <circle key={p.i} cx={p.x} cy={p.y} r={1.9} className="scene-sparkle" style={{ animationDelay: `${p.d}s` }} />
            ))}
          </g>
        </Layer>
        <Layer depth={0.7}>
          <path d={nearRoofs.body} fill="#35264A" />
          <path d={nearRoofs.lit} fill="#FFC98A" opacity={0.85} />
          {canopyBlobs(150, 930, 90, 14, 3)
            .concat(canopyBlobs(1470, 940, 100, 14, 8))
            .map((c, i) => (
              <circle key={i} cx={r1(c.cx)} cy={r1(c.cy)} r={r1(c.r)} fill="#221933" />
            ))}
        </Layer>
      </>
    );
  },
};

const colosseum: SceneDef = {
  id: "colosseum",
  tint: "#C77B4E",
  dark: false,
  render: (uid) => {
    const far = rollingRidge({ seed: 5, y: 730, amp: 34, waves: 3 });
    const pines = rollingRidge({ seed: 8, y: 772, amp: 14, waves: 4 });
    const rand = mulberry32(19);
    let pineRow = "";
    for (let x = 20; x < 1600; x += 70 + rand() * 90) {
      if (x > 470 && x < 1130 && rand() > 0.3) continue;
      pineRow += rand() > 0.72 ? cypressTree(x, pines.at(x) + 4, 44 + rand() * 30) : umbrellaPine(x, pines.at(x) + 4, 40 + rand() * 34, (rand() - 0.5) * 0.2, Math.floor(x));
    }
    const front = rollingRidge({ seed: 2, y: 846, amp: 12, waves: 2 });
    const grass = rollingRidge({ seed: 23, y: 912, amp: 26, waves: 2 });
    return (
      <>
        <Sky uid={uid} stops={[[0, "#EDB97E"], [0.4, "#F3CB94"], [0.75, "#F8DDB4"], [1, "#FAE8CB"]]} />
        <Layer depth={0.1}>
          <Sun uid={uid} x={1150} y={380} r={84} color="#FFF8E4" glow="#FFD08C" />
        </Layer>
        <Clouds color="#FBE3BF" opacity={0.6} items={[{ x: 160, y: 210, w: 320, seed: 11, speed: 75 }, { x: 1250, y: 150, w: 200, seed: 3, speed: 85 }]} />
        <Birds x={260} y={330} count={6} color="#9A5B38" scale={0.8} duration={42} />
        <Layer depth={0.2}>
          <path d={far.d} fill="#E8BD86" />
          <path d={`M1300 ${far.at(1300) + 2}q24-40 58-40t58 40Z`} fill="#E8BD86" />
        </Layer>
        <Layer depth={0.32}>
          <path d={pines.d + pineRow} fill="#D6A06D" />
        </Layer>
        <Layer depth={0.5}>
          <Monument id="colosseum" x={800} y={834} scale={1.26} tones={{ body: "#CB8052", shade: "#8B4A2E", light: "#E9B07C" }} detailed />
        </Layer>
        <Layer depth={0.72}>
          <path d={front.d} fill="#9A5B39" />
          <path d={grass.d} fill="#7F4A2E" />
        </Layer>
        <Layer depth={0.9}>
          <path
            d={umbrellaPine(120, 1000, 330, 0.12, 4) + umbrellaPine(1500, 1000, 300, -0.14, 9) + cypressTree(1330, 1000, 250) + cypressTree(300, 1000, 200)}
            fill="#5A2F1F"
          />
        </Layer>
      </>
    );
  },
};

const pyramids: SceneDef = {
  id: "pyramids",
  tint: "#D59A5E",
  dark: false,
  render: (uid) => {
    const far = rollingRidge({ seed: 4, y: 770, amp: 20, waves: 3 });
    const mid = rollingRidge({ seed: 9, y: 862, amp: 30, waves: 2 });
    const near = rollingRidge({ seed: 14, y: 930, amp: 42, waves: 2 });
    const plain = 806;
    const caravan = [0, 1, 2, 3, 4].map((i) => camel(300 + i * 30, plain + 2, 0.72)).join("");
    return (
      <>
        <Sky uid={uid} stops={[[0, "#E6AC74"], [0.4, "#EEC28E"], [0.75, "#F5D8AE"], [1, "#F9E6CA"]]} />
        <Layer depth={0.1}>
          <Sun uid={uid} x={1180} y={420} r={92} color="#FFF8E8" glow="#FFD39A" />
        </Layer>
        <Clouds color="#FAE2BE" opacity={0.5} items={[{ x: 140, y: 280, w: 280, seed: 21, speed: 80 }]} />
        <Birds x={1010} y={250} count={3} color="#A9703F" scale={0.8} duration={52} delay={-20} />
        <Layer depth={0.22}>
          <path d={far.d} fill="#E7BA84" />
          {[70, 118, 150].map((x, i) => (
            <path key={i} d={palmTree(x, far.at(x) + 6, 46 + i * 8, 0.12 - i * 0.08, i + 2)} fill="#C9935C" />
          ))}
        </Layer>
        <Layer depth={0.45}>
          <Monument id="pyramids" x={800} y={plain - 10} scale={0.76} tones={{ body: "#D69B5F", shade: "#AE6D3D", light: "#F4CF98" }} />
          <rect x="0" y={plain - 12} width={VIEW_W} height={VIEW_H - plain + 12} fill="#DDA66B" />
          <g className="scene-walk">
            <path d={caravan} fill="#9A5C2C" />
          </g>
        </Layer>
        <Layer depth={0.62}>
          <path d={mid.d} fill="#CD9053" />
        </Layer>
        <Layer depth={0.85}>
          <path d={near.d} fill="#B27037" />
        </Layer>
      </>
    );
  },
};

const fuji: SceneDef = {
  id: "fuji",
  tint: "#D98DA0",
  dark: false,
  render: (uid) => {
    const base = 772;
    const top = 290;
    const L0: Pt = [230, base];
    const L1: Pt = [500, base - 64];
    const L2: Pt = [792, top + 132];
    const L3: Pt = [902, top];
    const R0: Pt = [1018, top];
    const R1: Pt = [1128, top + 132];
    const R2: Pt = [1420, base - 64];
    const R3: Pt = [1690, base];
    const summit = `L${L3[0] + 22} ${top + 7}L${L3[0] + 46} ${top - 3}L${L3[0] + 76} ${top + 6}L${R0[0]} ${top}`;
    const mountain = `M${L0[0]} ${base}C${L1.join(" ")} ${L2.join(" ")} ${L3.join(" ")}${summit}C${R1.join(" ")} ${R2.join(" ")} ${R3.join(" ")}Z`;
    const shadeFace = `M962 ${top + 4}L${R0[0]} ${top}C${R1.join(" ")} ${R2.join(" ")} ${R3.join(" ")}L1080 ${base}Q990 ${top + 250} 962 ${top + 4}Z`;
    // Snow cap with dripping lower edge.
    const snowY = 440;
    const tl = bezAtY(L0, L1, L2, L3, snowY);
    const tr = bezAtY(R0, R1, R2, R3, snowY);
    const pts: Pt[] = [];
    for (let t = tl; t <= 1; t += 0.05) pts.push(bez(L0, L1, L2, L3, t));
    pts.push(L3, [L3[0] + 22, top + 7], [L3[0] + 46, top - 3], [L3[0] + 76, top + 6], R0);
    for (let t = 0.05; t <= tr; t += 0.05) pts.push(bez(R0, R1, R2, R3, t));
    const right = bez(R0, R1, R2, R3, tr);
    const left = bez(L0, L1, L2, L3, tl);
    pts.push(right);
    const rand = mulberry32(17);
    for (let x = right[0] - 14; x > left[0] + 10; x -= 16 + rand() * 20) {
      const drip = 12 + rand() * 70 * Math.sin(((x - left[0]) / (right[0] - left[0])) * Math.PI);
      pts.push([x, snowY + drip], [x - 7 - rand() * 6, snowY + 4]);
    }
    pts.push(left);
    const snow = poly(pts);
    const ridge = mountainRidge({ seed: 6, y: 712, amp: 48, rough: 0.55 });
    const hill = `M0 1000L0 836C220 812 470 772 700 770C930 768 1150 806 1600 842L1600 1000Z`;
    const hillAt = (x: number) => (x < 700 ? 836 - ((x / 700) * 66) : 770 + ((x - 700) / 900) * 72);
    const left1 = blossomTree(90, 1010, 520, 1, 3);
    const right1 = blossomTree(1540, 1010, 480, -1, 11);
    const blossomColors = ["#F7C6D0", "#EFA3B6", "#FBDDE3"];
    return (
      <>
        <Sky uid={uid} stops={[[0, "#E2AEBF"], [0.35, "#EDC2C9"], [0.7, "#F6D8D6"], [1, "#FAE8E2"]]} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1230} y={250} r={52} color="#FFF6F3" glow="#FFD5DD" haloOpacity={0.45} />
        </Layer>
        <Clouds color="#FBE4E6" opacity={0.6} items={[{ x: 220, y: 230, w: 300, seed: 13, speed: 70 }]} />
        <Layer depth={0.14}>
          <path d={mountain} fill="#A9A2C6" />
          <path d={shadeFace} fill="#968FB6" />
          <path d={snow} fill="#FBF5F6" />
          <path d={shadeFace} fill="#DCD6E8" opacity={0.35} clipPath={`url(#${uid}-snowclip)`} />
          <defs>
            <clipPath id={`${uid}-snowclip`}>
              <path d={snow} />
            </clipPath>
          </defs>
        </Layer>
        <Mist uid={uid} y={660} h={130} opacity={0.6} speed={50} />
        <Layer depth={0.3}>
          <path d={ridge.d + forestOnRidge(ridge, { seed: 4, density: 0.09, minH: 14, maxH: 34 })} fill="#9C88A8" />
        </Layer>
        <Layer depth={0.48}>
          <path d={hill + forestOnRidge({ d: "", at: hillAt }, { seed: 9, from: 0, to: 1600, density: 0.05, minH: 20, maxH: 46, gapChance: 0.35 })} fill="#6F5470" />
          <Monument id="pagoda" x={690} y={782} scale={0.9} tones={{ body: "#AB4A43", shade: "#7A2E33", glow: "#FFDDBE" }} detailed />
        </Layer>
        <Layer depth={0.85}>
          {[left1, right1].map((tree, i) => (
            <g key={i}>
              <path d={tree.wood} fill="#4B2C3B" />
              {tree.blooms.map((c, j) => (
                <circle key={j} cx={r1(c.cx)} cy={r1(c.cy)} r={r1(c.r)} fill={blossomColors[Math.floor(c.k * 3)]} />
              ))}
            </g>
          ))}
        </Layer>
        <Petals seed={31} count={18} color="#F2AFC0" />
      </>
    );
  },
};

function santoriniVillage(seed: number) {
  const rand = mulberry32(seed);
  const edge: Pt[] = [
    [-20, 516],
    [110, 524],
    [240, 542],
    [380, 570],
    [520, 604],
    [640, 642],
    [760, 690],
    [860, 740],
    [940, 796],
    [1000, 862],
    [1040, 940],
    [1056, 1000],
  ].map(([x, y], i) => [x, y + (i > 0 && i < 11 ? (rand() - 0.5) * 10 : 0)] as Pt);
  const edgeAt = (x: number) => {
    for (let i = 1; i < edge.length; i++) {
      if (x <= edge[i][0]) {
        const [x0, y0] = edge[i - 1];
        const [x1, y1] = edge[i];
        return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
      }
    }
    return edge[edge.length - 1][1];
  };
  const cliff = poly([[-20, 1000], ...edge, [1056, 1000]]);
  let strata = "";
  for (const off of [70, 150, 240, 330]) {
    strata += poly(
      edge.map(([x, y]) => [x - off * 0.12, y + off] as Pt).concat(edge.slice().reverse().map(([x, y]) => [x - off * 0.12, y + off + 7] as Pt))
    );
  }
  let walls = "";
  let shade = "";
  let windows = "";
  let doors = "";
  const rows = [
    { dy: 12, from: 150, to: 900 },
    { dy: 70, from: 40, to: 760 },
    { dy: 132, from: 0, to: 640 },
    { dy: 196, from: 0, to: 480 },
  ];
  for (const row of rows) {
    let x = row.from;
    while (x < row.to) {
      const w = 36 + rand() * 30;
      const h = 30 + rand() * 30;
      const by = edgeAt(x + w / 2) + row.dy;
      const top = by - h;
      walls += rect(x, top, w, h + 26);
      if (rand() > 0.55) walls += `M${r1(x)} ${r1(top)}A${r1(w / 2)} ${r1(10 + rand() * 6)} 0 0 1 ${r1(x + w)} ${r1(top)}Z`;
      shade += rect(x, top, w * 0.2, h + 26);
      if (rand() > 0.35) windows += rect(x + w * 0.45, top + h * 0.3, 6, 8);
      if (rand() > 0.5) doors += `M${r1(x + w * 0.66)} ${r1(by)}V${r1(by - 13)}A5 5 0 0 1 ${r1(x + w * 0.66 + 10)} ${r1(by - 13)}V${r1(by)}Z`;
      x += w + (rand() > 0.8 ? 14 : 2);
    }
  }
  // Blue-domed churches and a bell tower.
  let domes = "";
  let domeLight = "";
  let crosses = "";
  for (const [cx, dy] of [
    [300, 18],
    [560, 28],
    [205, 132],
  ] as Pt[]) {
    const by = edgeAt(cx) + dy;
    walls += rect(cx - 26, by - 36, 52, 60) + rect(cx - 18, by - 44, 36, 9);
    domes += `M${cx - 21} ${r1(by - 44)}A21 25 0 0 1 ${cx + 21} ${r1(by - 44)}Z`;
    domeLight += `M${cx + 4} ${r1(by - 66)}A21 25 0 0 1 ${cx + 21} ${r1(by - 44)}L${cx + 13} ${r1(by - 44)}A15 21 0 0 0 ${cx + 4} ${r1(by - 66)}Z`;
    crosses += rect(cx - 1.2, by - 80, 2.4, 14) + rect(cx - 5, by - 76, 10, 2.4);
  }
  const bx = 346;
  const bby = edgeAt(bx) + 20;
  walls += rect(bx - 12, bby - 74, 24, 96) + `M${bx - 12} ${r1(bby - 74)}A12 12 0 0 1 ${bx + 12} ${r1(bby - 74)}Z`;
  windows += `M${bx - 6} ${r1(bby - 40)}V${r1(bby - 52)}A6 6 0 0 1 ${bx + 6} ${r1(bby - 52)}V${r1(bby - 40)}Z`;
  windows += `M${bx - 6} ${r1(bby - 16)}V${r1(bby - 28)}A6 6 0 0 1 ${bx + 6} ${r1(bby - 28)}V${r1(bby - 16)}Z`;
  // Bougainvillea
  const flowers = canopyBlobs(470, edgeAt(470) + 60, 16, 9, 4).concat(canopyBlobs(150, edgeAt(150) + 84, 14, 8, 9));
  // Windmill
  const mx = 92;
  const mby = edgeAt(mx) + 6;
  const mill = `M${mx - 17} ${r1(mby)}L${mx - 14} ${r1(mby - 64)}L${mx + 14} ${r1(mby - 64)}L${mx + 17} ${r1(mby)}Z`;
  const roof = `M${mx - 17} ${r1(mby - 62)}Q${mx} ${r1(mby - 92)} ${mx + 17} ${r1(mby - 62)}Z`;
  const hub: Pt = [mx, mby - 70];
  let blades = "";
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const ex = Math.cos(a) * 58;
    const ey = Math.sin(a) * 58;
    const nx = -Math.sin(a) * 9;
    const ny = Math.cos(a) * 9;
    blades += `M0 0L${r1(ex)} ${r1(ey)}L${r1(ex * 0.9 + nx)} ${r1(ey * 0.9 + ny)}L${r1(nx * 0.3)} ${r1(ny * 0.3)}Z`;
  }
  return { cliff, strata, walls, shade, windows, doors, domes, domeLight, crosses, flowers, mill, roof, hub, blades };
}

const santorini: SceneDef = {
  id: "santorini",
  tint: "#E98A7C",
  dark: false,
  render: (uid) => {
    const v = santoriniVillage(5);
    const sea = 716;
    return (
      <>
        <Sky uid={uid} stops={[[0, "#5C5C9D"], [0.34, "#A5719F"], [0.6, "#EC8C7C"], [0.8, "#F7B386"], [1, "#FBD29E"]]} />
        <Stars seed={3} count={24} maxY={200} opacity={0.6} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1250} y={684} r={62} color="#FFE7BC" glow="#FFA880" />
        </Layer>
        <Clouds color="#F7B39B" opacity={0.35} items={[{ x: 820, y: 400, w: 380, seed: 8, speed: 90 }]} />
        <Birds x={900} y={420} count={3} color="#6E4A6F" scale={0.9} duration={48} delay={-12} />
        <Layer depth={0.18}>
          <path d={`M860 ${sea}C940 690 1010 682 1080 686C1180 690 1300 700 1600 694L1600 ${sea}Z`} fill="#8A6A93" />
        </Layer>
        <Layer depth={0.3}>
          <Water uid={uid} y={sea} top="#9A77A2" bottom="#3E4886" sunX={1250} sunColor="#FFD9A6" lines={40} />
          <g className="scene-drift" style={{ animationDuration: "70s" }}>
            <path d={sailboat(1040, 790, 0.8)} fill="#3B2F5A" />
          </g>
        </Layer>
        <Layer depth={0.55}>
          <path d={v.cliff} fill="#56344F" />
          <defs>
            <clipPath id={`${uid}-cliff`}>
              <path d={v.cliff} />
            </clipPath>
          </defs>
          <path d={v.strata} fill="#6B4461" opacity={0.7} clipPath={`url(#${uid}-cliff)`} />
          <path d={v.walls} fill="#F8F0EA" />
          <path d={v.shade} fill="#E2CFCB" />
          <path d={v.windows} fill="#6E5277" />
          <path d={v.doors} fill="#3D63A8" />
          <path d={v.domes} fill="#2F5CA8" />
          <path d={v.domeLight} fill="#5383CC" />
          <path d={v.crosses} fill="#F8F0EA" />
          {v.flowers.map((f, i) => (
            <circle key={i} cx={r1(f.cx)} cy={r1(f.cy)} r={r1(f.r)} fill={f.k > 0.5 ? "#D2477F" : "#B9346D"} />
          ))}
          <path d={v.mill} fill="#F4ECE6" />
          <path d={v.roof} fill="#8B6557" />
          <g transform={`translate(${r1(v.hub[0])} ${r1(v.hub[1])})`}>
            <g className="scene-spin" style={{ animationDuration: "14s" }}>
              <path d={v.blades} fill="#F6EFE9" opacity={0.92} />
              <circle r={4} fill="#8B6557" />
            </g>
          </g>
        </Layer>
      </>
    );
  },
};

const machupicchu: SceneDef = {
  id: "machupicchu",
  tint: "#5E8F7B",
  dark: false,
  render: (uid) => {
    const far = mountainRidge({ seed: 3, y: 540, amp: 280, rough: 0.5, shape: (t) => -Math.sin(t * Math.PI) * 30 });
    const far2 = mountainRidge({ seed: 8, y: 650, amp: 220, rough: 0.52 });
    const peak =
      "M600 780C660 720 736 560 776 420C798 344 832 282 880 272C928 262 956 292 972 340C996 420 1040 600 1120 700L1190 780Z";
    const peakShade = "M900 276C928 268 956 292 972 340C996 420 1040 600 1120 700L1190 780L1000 780C990 640 950 420 900 276Z";
    const una = "M500 800C540 740 590 650 632 628C660 614 684 640 700 690L740 800Z";
    const saddle = "M170 1000L170 868C290 826 410 776 540 756L1080 750C1180 764 1300 806 1450 866L1450 1000Z";
    const leftX = (y: number) => 540 - ((y - 756) * 370) / 112;
    const rightX = (y: number) => 1080 + ((y - 750) * 370) / 116;
    let terraces = "";
    let terraceShadow = "";
    for (let y = 770; y < 900; y += 15) {
      const xl = leftX(y);
      terraces += rect(xl, y, 200, 3);
      terraceShadow += rect(xl, y + 3, 200, 4);
      const xr = rightX(y);
      terraces += rect(xr - 170, y, 170, 3);
      terraceShadow += rect(xr - 170, y + 3, 170, 4);
    }
    const rand = mulberry32(12);
    let stone = "";
    let stoneShade = "";
    let slits = "";
    for (let x = 560; x < 1060; x += 30 + rand() * 36) {
      const w = 26 + rand() * 34;
      const h = 12 + rand() * 14;
      const by = 752 + rand() * 6;
      stone += rect(x, by - h, w, h + 6);
      if (rand() > 0.4) stone += `M${r1(x + w - 16)} ${r1(by - h)}L${r1(x + w - 8)} ${r1(by - h - 11)}L${r1(x + w)} ${r1(by - h)}Z`;
      stoneShade += rect(x, by - h, 5, h + 6);
      if (rand() > 0.3) slits += `M${r1(x + w * 0.4)} ${r1(by - 3)}L${r1(x + w * 0.4 + 1.5)} ${r1(by - h + 4)}L${r1(x + w * 0.4 + 5.5)} ${r1(by - h + 4)}L${r1(x + w * 0.4 + 7)} ${r1(by - 3)}Z`;
    }
    const llama = (x: number, y: number) =>
      `M${x} ${y}L${x} ${y - 9}Q${x + 1} ${y - 14} ${x + 8} ${y - 14}L${x + 17} ${y - 14}L${x + 18} ${y - 26}L${x + 20} ${y - 30}L${x + 21} ${y - 27}L${x + 23} ${y - 26}L${x + 21} ${y - 22}L${x + 21} ${y - 11}L${x + 20} ${y}L${x + 18} ${y}L${x + 17} ${y - 8}L${x + 5} ${y - 8}L${x + 3} ${y}Z`;
    return (
      <>
        <Sky uid={uid} stops={[[0, "#A9C8C3"], [0.45, "#CBDFD7"], [1, "#E8F0E8"]]} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1260} y={220} r={48} color="#FFFCF2" glow="#FFF0D0" haloOpacity={0.45} />
        </Layer>
        <Birds x={560} y={340} count={1} color="#3E5A52" scale={1.6} duration={70} delay={-30} />
        <Layer depth={0.12}>
          <path d={far.d} fill="#B6CFC6" />
        </Layer>
        <Mist uid={uid} y={560} h={140} opacity={0.6} speed={55} />
        <Layer depth={0.22}>
          <path d={far2.d} fill="#98BAAE" />
        </Layer>
        <Mist uid={uid} y={690} h={120} opacity={0.5} speed={45} />
        <Layer depth={0.38}>
          <path d={una} fill="#4B7766" />
          <path d={peak} fill="#4E7C69" />
          <path d={peakShade} fill="#416C5B" />
        </Layer>
        <Mist uid={uid} y={772} h={90} opacity={0.55} speed={38} />
        <Layer depth={0.58}>
          <path d={saddle} fill="#6E9A75" />
          <path d={terraceShadow} fill="#557C5D" />
          <path d={terraces} fill="#94BA8E" />
          <path d={stone} fill="#D8D0BD" />
          <path d={stoneShade} fill="#B2A994" />
          <path d={slits} fill="#6A6556" />
          <path d={llama(470, 800) + llama(500, 803)} fill="#F1E9DA" />
        </Layer>
        <Layer depth={0.9}>
          <path d="M0 1000L0 700C80 760 170 860 240 1000Z" fill="#2E5245" />
          <path d="M1600 1000L1600 760C1520 820 1450 900 1400 1000Z" fill="#355B4D" />
        </Layer>
      </>
    );
  },
};

const rio: SceneDef = {
  id: "rio",
  tint: "#3F7C86",
  dark: true,
  render: (uid) => {
    const sugar = "M1290 772C1302 650 1332 566 1386 560C1442 556 1472 626 1494 772Z";
    const urca = "M1140 772C1162 708 1194 668 1228 666C1262 664 1290 704 1302 772Z";
    const corcovado =
      "M380 820C500 776 628 650 712 520C744 470 766 440 788 432C810 426 826 452 838 488C858 566 904 648 986 706C1066 756 1160 784 1260 812L1260 1000L380 1000Z";
    const left = mountainRidge({ seed: 11, y: 760, amp: 150, rough: 0.5, width: 700 });
    const rand = mulberry32(2);
    const lights = Array.from({ length: 70 }, (_, i) => ({
      x: r1(260 + rand() * 1200),
      y: r1(794 + rand() * 12),
      d: r1(rand() * 5),
      i,
    }));
    return (
      <>
        <Sky uid={uid} stops={[[0, "#1C3A54"], [0.35, "#2E6A7B"], [0.62, "#6E9F8D"], [0.82, "#E6A379"], [1, "#F4C895"]]} />
        <Stars seed={21} count={40} maxY={300} opacity={0.7} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1240} y={700} r={46} color="#FFE5B4" glow="#FFB07C" />
        </Layer>
        <Clouds color="#F2B998" opacity={0.3} items={[{ x: 200, y: 360, w: 340, seed: 5, speed: 85 }]} />
        <Layer depth={0.2}>
          <path d={urca} fill="#2F5F67" />
          <path d={sugar} fill="#2C5A63" />
          <path d="M1232 664L1384 560" stroke="#1B3B42" strokeWidth={1.4} />
          <g className="scene-cable">
            <rect x={1226} y={666} width={10} height={7} rx={1.5} fill="#F2D59A" />
          </g>
        </Layer>
        <Layer depth={0.34}>
          <path d={left.d} fill="#244E55" />
        </Layer>
        <Layer depth={0.5}>
          <path d={corcovado} fill="#1C4448" />
          <defs>
            <radialGradient id={`${uid}-halo2`}>
              <stop offset="0" stopColor="#FFF6E2" stopOpacity="0.5" />
              <stop offset="1" stopColor="#FFF6E2" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={790} cy={350} r={120} fill={`url(#${uid}-halo2)`} className="scene-breathe" />
          <Monument id="christ" x={790} y={436} scale={1.55} tones={{ body: "#EFE7D6", shade: "#CFC4AF" }} detailed />
        </Layer>
        <Layer depth={0.64}>
          <Water uid={uid} y={800} top="#3E7580" bottom="#16333D" sunX={1240} sunColor="#FFD2A0" lines={30} />
          <g fill="#FFD48E">
            {lights.map((l) => (
              <circle key={l.i} cx={l.x} cy={l.y} r={1.6} className="scene-twinkle" style={{ animationDelay: `${l.d}s` }} />
            ))}
          </g>
        </Layer>
        <Layer depth={0.9}>
          <path d={palmTree(110, 1010, 420, 0.22, 4) + palmTree(1520, 1010, 360, -0.2, 8) + palmTree(1440, 1010, 280, -0.1, 12)} fill="#0F272B" />
        </Layer>
      </>
    );
  },
};

function harbourBridge(x0: number, x1: number, deckY: number, archTop: number) {
  const mid = (x0 + x1) / 2;
  const upperCtrl = 2 * archTop - deckY;
  const lowerTop = archTop + 34;
  const lowerCtrl = 2 * lowerTop - deckY;
  const arch = `M${x0} ${deckY}Q${mid} ${upperCtrl} ${x1} ${deckY}L${x1 - 34} ${deckY}Q${mid} ${lowerCtrl} ${x0 + 34} ${deckY}Z`;
  let truss = "";
  const qy = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
  for (let t = 0.06; t < 0.95; t += 0.045) {
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mid + t * t * x1;
    const yU = qy(deckY, upperCtrl, deckY, t);
    const yL = qy(deckY, lowerCtrl, deckY, t);
    truss += `M${r1(x)} ${r1(yU)}L${r1(x)} ${r1(Math.max(yL, yU))}`;
    if (yL < deckY - 6) truss += `M${r1(x)} ${r1(yL)}L${r1(x)} ${deckY}`;
  }
  const pylons = rect(x0 - 64, deckY - 60, 40, 150) + rect(x1 + 24, deckY - 60, 40, 150) + rect(x0 - 58, deckY - 70, 28, 12) + rect(x1 + 30, deckY - 70, 28, 12);
  const deck = rect(x0 - 200, deckY, x1 - x0 + 400, 9);
  return { arch, truss, pylons, deck };
}

const sydney: SceneDef = {
  id: "sydney",
  tint: "#7E77A4",
  dark: true,
  render: (uid) => {
    const bridge = harbourBridge(990, 1480, 716, 600);
    const city = skyline(14, 742, 1180, 1640, 30, 150, 0.14);
    const cityL = skyline(3, 760, -20, 330, 20, 90, 0.1);
    const tones = { body: "#5E5673", shade: "#4A4460", light: "#F4EDE1", glow: "#FFD6A0", accent: "#CFC6BA" };
    return (
      <>
        <Sky uid={uid} stops={[[0, "#1A2646"], [0.32, "#334479"], [0.58, "#7C76A3"], [0.8, "#E39F8A"], [1, "#F2C29E"]]} />
        <Stars seed={12} count={60} maxY={380} opacity={0.8} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1300} y={800} r={40} color="#FFE2B8" glow="#FFB08E" halo={6} />
        </Layer>
        <Layer depth={0.2}>
          <path d={city.body + cityL.body} fill="#3A4574" />
          <path d={city.lit + cityL.lit} fill="#FFD39A" opacity={0.7} />
          <path d={bridge.arch + bridge.pylons + bridge.deck} fill="#44507E" />
          <path d={bridge.truss} stroke="#44507E" strokeWidth={2} />
        </Layer>
        <Layer depth={0.45}>
          <Monument id="opera" x={700} y={800} scale={0.8} tones={tones} detailed />
        </Layer>
        <Layer depth={0.6}>
          <Water uid={uid} y={800} top="#303F70" bottom="#161E3E" lines={40} lineColor="#FFE2C0" />
          <Reflection uid={uid} y={800} opacity={0.18}>
            <Monument id="opera" x={700} y={800} scale={0.8} tones={tones} />
          </Reflection>
          <g className="scene-sail" style={{ animationDuration: "64s" }}>
            <path d="M0 880h86l-8 12h-70z" fill="#1E2A4A" />
            <path d="M12 866h58v14h-58z" fill="#2E3F66" />
            <path d="M18 870h8v5h-8zM32 870h8v5h-8zM46 870h8v5h-8z" fill="#FFD48E" />
            <path d="M26 856h14v10h-14z" fill="#1E2A4A" />
          </g>
        </Layer>
      </>
    );
  },
};

function manhattan() {
  const base = skyline(41, 792, 960, 1640, 40, 170, 0.12);
  const west = skyline(5, 796, -20, 420, 30, 120, 0.1);
  const empire =
    "M1270 792V640H1276V600H1284V575H1291V558H1296L1298 528L1299 500H1301L1302 528L1304 558H1309V575H1316V600H1324V640H1330V792Z";
  const wtc = "M1062 792V752L1072 540L1082 520H1098L1108 540L1118 752V792ZM1088.8 520V452H1091.2V520Z";
  return { body: base.body + west.body + empire + wtc, lit: base.lit + west.lit };
}

const newyork: SceneDef = {
  id: "newyork",
  tint: "#5B5E8C",
  dark: true,
  render: (uid) => {
    const city = manhattan();
    const tones = { body: "#1F4047", shade: "#152C32", glow: "#FFC66B" };
    const island = "M470 806C520 788 640 780 760 780C880 780 980 788 1040 806Z";
    return (
      <>
        <Sky uid={uid} stops={[[0, "#0D1A33"], [0.35, "#213860"], [0.6, "#5A5D8C"], [0.82, "#DA8D6B"], [1, "#EFB888"]]} />
        <Stars seed={44} count={70} maxY={360} opacity={0.8} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={380} y={780} r={44} color="#FFE0B0" glow="#FF9F7A" halo={5} />
        </Layer>
        <Layer depth={0.22}>
          <path d={city.body} fill="#27335A" />
          <path d={city.lit} fill="#FFD08A" opacity={0.75} />
        </Layer>
        <Layer depth={0.36}>
          <Water uid={uid} y={800} top="#34467A" bottom="#101A33" lines={34} lineColor="#FFD9B0" />
        </Layer>
        <Layer depth={0.5}>
          <path d={island} fill="#152634" />
          <defs>
            <radialGradient id={`${uid}-torch`}>
              <stop offset="0" stopColor="#FFD27A" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={724} cy={236} r={60} fill={`url(#${uid}-torch)`} className="scene-breathe" />
          <Monument id="liberty" x={760} y={792} scale={0.92} tones={tones} detailed />
          <Reflection uid={uid} y={804} opacity={0.22}>
            <Monument id="liberty" x={760} y={792} scale={0.92} tones={tones} />
          </Reflection>
        </Layer>
        <Layer depth={0.7}>
          <g className="scene-sail" style={{ animationDuration: "58s", animationDelay: "-20s" }}>
            <path d="M0 902h120l-10 16h-100z" fill="#D9683A" />
            <path d="M14 884h92v18h-92z" fill="#E98A55" />
            <path d="M22 889h9v6h-9zM38 889h9v6h-9zM54 889h9v6h-9zM70 889h9v6h-9zM86 889h9v6h-9z" fill="#FFE2A8" />
          </g>
        </Layer>
      </>
    );
  },
};

function westminster(x0: number, x1: number, baseY: number) {
  let d = rect(x0, baseY - 86, x1 - x0, 200);
  for (let x = x0 + 6; x < x1 - 6; x += 17) d += `M${x - 3} ${baseY - 86}L${x} ${baseY - 106}L${x + 3} ${baseY - 86}Z`;
  // central tower & Victoria Tower
  const cx = (x0 + x1) / 2 - 60;
  d += rect(cx - 16, baseY - 150, 32, 70) + `M${cx - 16} ${baseY - 150}L${cx} ${baseY - 196}L${cx + 16} ${baseY - 150}Z`;
  const vx = x1 - 70;
  d += rect(vx - 34, baseY - 270, 68, 190);
  for (const px of [vx - 34, vx - 12, vx + 12, vx + 34]) d += `M${px - 5} ${baseY - 270}L${px} ${baseY - 300}L${px + 5} ${baseY - 270}Z`;
  let lit = "";
  for (let x = x0 + 12; x < x1 - 12; x += 17) lit += rect(x, baseY - 60, 4, 10) + rect(x, baseY - 36, 4, 10);
  return { d, lit };
}

function londonEye(cx: number, cy: number, r: number) {
  let spokes = "";
  let pods = "";
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    spokes += `M${cx} ${cy}L${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)}`;
  }
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2;
    pods += ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 3);
  }
  const legs = `M${cx - 3} ${cy}L${cx - 48} ${cy + r + 30}L${cx - 40} ${cy + r + 30}L${cx + 3} ${cy + 6}Z`;
  return { ring: circle(cx, cy, r) + circle(cx, cy, r - 4), spokes, pods, legs };
}

const london: SceneDef = {
  id: "london",
  tint: "#A98AA6",
  dark: false,
  render: (uid) => {
    const palace = westminster(812, 1600, 826);
    const eye = londonEye(300, 640, 124);
    const city = skyline(8, 780, 470, 900, 20, 90, 0);
    const bb = { x: 760, y: 830, s: 0.9 };
    const clock = { cx: bb.x, cy: bb.y - (600 - 256) * bb.s, r: 27 * bb.s };
    const bridge = (() => {
      const top = 858;
      const b = new PathBuilder().M(-20, top).L(780, top).L(780, 900);
      const spans = [780, 620, 460, 300, 140, -20];
      for (let i = 0; i < spans.length - 1; i++) {
        const a = spans[i] - 12;
        const e = spans[i + 1] + 12;
        b.L(a, 900).L(a, 890).Q((a + e) / 2, 866, e, 890).L(e, 900);
      }
      b.L(-20, 900).Z();
      return b.toString();
    })();
    const tones = { body: "#2E2641", shade: "#211B30", glow: "#FFE7B0" };
    return (
      <>
        <Sky uid={uid} stops={[[0, "#595E92"], [0.4, "#A788A5"], [0.72, "#ECAD91"], [1, "#F6CFA7"]]} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1110} y={560} r={66} color="#FFEBC8" glow="#FFB894" />
        </Layer>
        <Clouds color="#F4C0AA" opacity={0.4} items={[{ x: 540, y: 300, w: 460, seed: 14, speed: 90 }, { x: 1180, y: 220, w: 300, seed: 2, speed: 70 }]} />
        <Birds x={1020} y={380} count={4} color="#6D5570" scale={0.8} duration={44} delay={-15} />
        <Layer depth={0.2}>
          <path d={city.body} fill="#9B7F9D" />
          <g stroke="#8C7090" fill="none" strokeWidth={2}>
            <g className="scene-spin" style={{ animationDuration: "160s" }}>
              <path d={eye.ring} strokeWidth={3} />
              <path d={eye.spokes} strokeWidth={0.8} />
              <path d={eye.pods} fill="#8C7090" stroke="none" />
            </g>
          </g>
          <path d={eye.legs} fill="#8C7090" />
        </Layer>
        <Layer depth={0.4}>
          <path d={palace.d} fill="#3B3251" />
          <path d={palace.lit} fill="#FFD9A0" opacity={0.55} />
          <Monument id="bigben" x={bb.x} y={bb.y} scale={bb.s} tones={tones} detailed />
          <LondonClock cx={clock.cx} cy={clock.cy} r={clock.r} color="#2E2641" />
        </Layer>
        <Layer depth={0.58}>
          <Water uid={uid} y={836} top="#8E7D9F" bottom="#3A3252" sunX={1110} sunColor="#FFD1A6" lines={30} />
          <Reflection uid={uid} y={836} opacity={0.25}>
            <Monument id="bigben" x={bb.x} y={bb.y} scale={bb.s} tones={tones} />
          </Reflection>
        </Layer>
        <Layer depth={0.75}>
          <path d={bridge} fill="#2A2238" />
          <g className="scene-bus">
            <rect x={0} y={834} width={40} height={24} rx={4} fill="#C8323A" />
            <path d="M4 838h32v5h-32zM4 847h32v4h-32z" fill="#FFE2B8" opacity={0.8} />
            <circle cx={10} cy={858} r={3.4} fill="#1C1726" />
            <circle cx={31} cy={858} r={3.4} fill="#1C1726" />
          </g>
        </Layer>
      </>
    );
  },
};

const dubai: SceneDef = {
  id: "dubai",
  tint: "#6C3A66",
  dark: true,
  render: (uid) => {
    const city = skyline(77, 856, -20, 1640, 30, 150, 0.14);
    const cityFar = skyline(12, 830, -20, 1640, 30, 110, 0);
    const dunes = rollingRidge({ seed: 6, y: 800, amp: 24, waves: 3 });
    const front = rollingRidge({ seed: 15, y: 930, amp: 30, waves: 2 });
    const arab = "M1386 850V600C1430 620 1470 700 1476 850ZM1383 604V560H1387V604Z";
    return (
      <>
        <Sky uid={uid} stops={[[0, "#0C0921"], [0.35, "#271849"], [0.62, "#6A3964"], [0.84, "#D07357"], [1, "#EE9F66"]]} />
        <Stars seed={70} count={110} maxY={460} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1250} y={190} r={26} color="#FFF5DD" glow="#FFE1A8" halo={5} haloOpacity={0.35} />
        </Layer>
        <Layer depth={0.2}>
          <path d={dunes.d} fill="#553556" />
        </Layer>
        <Layer depth={0.3}>
          <path d={cityFar.body} fill="#4A2F5A" />
        </Layer>
        <Layer depth={0.4}>
          <path d={city.body + arab} fill="#33234F" />
          <path d={city.lit} fill="#FFCF8C" opacity={0.6} />
        </Layer>
        <Layer depth={0.5}>
          <Monument id="burj" x={800} y={870} scale={1.14} tones={{ body: "#1B1432", glow: "#FFD9A0" }} detailed />
          <circle cx={800} cy={r1(870 - 600 * 1.14)} r={3.4} fill="#FF4D4D" className="scene-blink" />
        </Layer>
        <Layer depth={0.8}>
          <path d={front.d} fill="#1D1430" />
          <path d={palmTree(120, 1010, 300, 0.2, 3) + palmTree(1500, 1010, 260, -0.18, 7)} fill="#140E22" />
        </Layer>
      </>
    );
  },
};

const sanfrancisco: SceneDef = {
  id: "sanfrancisco",
  tint: "#C4432F",
  dark: false,
  render: (uid) => {
    const marin = mountainRidge({ seed: 19, y: 660, amp: 120, rough: 0.48, width: 820, shape: (t) => t * 90 });
    const city = rollingRidge({ seed: 3, y: 760, amp: 30, waves: 2, shape: (t) => (t < 0.55 ? 90 : 0) });
    return (
      <>
        <Sky uid={uid} stops={[[0, "#E7A58A"], [0.4, "#F1C1A0"], [0.75, "#F7D9BA"], [1, "#FAE7D2"]]} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1250} y={380} r={66} color="#FFF6E6" glow="#FFCB98" />
        </Layer>
        <Birds x={820} y={300} count={5} color="#9A6258" scale={0.85} duration={50} delay={-5} />
        <Layer depth={0.2}>
          <path d={marin.d} fill="#B98A80" />
          <path d={city.d} fill="#AE7F79" />
        </Layer>
        <Clouds color="#FFF4EC" opacity={0.85} items={[{ x: -60, y: 650, w: 520, seed: 4, speed: 60 }, { x: 300, y: 690, w: 420, seed: 9, speed: 50 }, { x: 1120, y: 720, w: 460, seed: 13, speed: 65 }]} />
        <Layer depth={0.36}>
          <Water uid={uid} y={790} top="#8C94AE" bottom="#3E4B68" sunX={1250} sunColor="#FFE0BE" lines={36} />
        </Layer>
        <Layer depth={0.5}>
          <Monument id="goldengate" x={800} y={846} scale={1} tones={{ accent: "#C4432F" }} />
        </Layer>
        <Clouds color="#FFF8F2" opacity={0.7} items={[{ x: 900, y: 610, w: 380, seed: 22, speed: 55 }]} />
        <Layer depth={0.7}>
          <g className="scene-drift" style={{ animationDuration: "80s" }}>
            <path d={sailboat(560, 900, 1)} fill="#3B3448" />
          </g>
        </Layer>
      </>
    );
  },
};

const angkor: SceneDef = {
  id: "angkor",
  tint: "#E0A07A",
  dark: false,
  render: (uid) => {
    const jungle = mountainRidge({ seed: 30, y: 724, amp: 26, rough: 0.72, detail: 8 });
    const tones = { body: "#5C3A3A", shade: "#472C2D" };
    return (
      <>
        <Sky uid={uid} stops={[[0, "#E39E79"], [0.4, "#EFB98B"], [0.75, "#F7D3A7"], [1, "#FAE2C1"]]} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={800} y={500} r={74} color="#FFF3DC" glow="#FFC98E" />
        </Layer>
        <Birds x={420} y={330} count={5} color="#8E5845" scale={0.85} duration={46} />
        <Layer depth={0.2}>
          <path d={jungle.d} fill="#C88B6A" />
        </Layer>
        <Layer depth={0.4}>
          <Monument id="angkor" x={800} y={748} scale={1} tones={tones} detailed />
          <rect x="0" y={744} width={VIEW_W} height={14} fill="#7A4E45" />
        </Layer>
        <Layer depth={0.55}>
          <Water uid={uid} y={758} top="#EFC49A" bottom="#C38A63" sunX={800} sunColor="#FFF0D0" lines={24} />
          <Reflection uid={uid} y={758} opacity={0.45}>
            <Monument id="angkor" x={800} y={748} scale={1} tones={tones} />
          </Reflection>
        </Layer>
        <Layer depth={0.85}>
          <path d="M0 1000L0 900C200 880 420 896 600 930C720 952 780 980 800 1000Z" fill="#3D2826" />
          <path d="M1600 1000L1600 910C1440 896 1260 914 1100 950C1020 968 980 990 970 1000Z" fill="#3D2826" />
          <path d={palmTree(160, 920, 360, 0.05, 2) + palmTree(270, 930, 300, -0.04, 6) + palmTree(1440, 930, 340, -0.06, 9)} fill="#2E1D1C" />
        </Layer>
      </>
    );
  },
};

const peaks: SceneDef = {
  id: "peaks",
  tint: "#E0915E",
  dark: true,
  render: (uid) => {
    const inks = ["#E49A6B", "#B7735A", "#7A5048", "#44363A", "#1F2227"];
    const ridges = [
      mountainRidge({ seed: 2, y: 560, amp: 260, rough: 0.52 }),
      mountainRidge({ seed: 7, y: 650, amp: 200, rough: 0.5 }),
      mountainRidge({ seed: 13, y: 735, amp: 140, rough: 0.5 }),
      mountainRidge({ seed: 21, y: 820, amp: 100, rough: 0.5 }),
      mountainRidge({ seed: 34, y: 920, amp: 60, rough: 0.5 }),
    ];
    return (
      <>
        <Sky uid={uid} stops={[[0, "#1D4B58"], [0.42, "#4B8781"], [0.74, "#E5AE78"], [1, "#F3D29A"]]} />
        <Stars seed={5} count={40} maxY={260} opacity={0.6} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1060} y={540} r={92} color="#FFF1D0" glow="#FFC47E" />
        </Layer>
        <Birds x={700} y={360} count={5} color="#2F4A4C" scale={0.9} duration={44} />
        {ridges.map((r, i) => (
          <Layer key={i} depth={0.15 + i * 0.17}>
            <path
              d={r.d + (i >= 2 ? forestOnRidge(r, { seed: i * 7, density: 0.05 + i * 0.01, minH: 12 + i * 6, maxH: 26 + i * 12 }) : "")}
              fill={inks[i]}
            />
          </Layer>
        ))}
      </>
    );
  },
};

const coast: SceneDef = {
  id: "coast",
  tint: "#3FA3B5",
  dark: false,
  render: (uid) => {
    const sea = 700;
    return (
      <>
        <Sky uid={uid} stops={[[0, "#3E9FB3"], [0.45, "#8DCDCB"], [0.8, "#F4E0B6"], [1, "#FBEACB"]]} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={1140} y={520} r={82} color="#FFFBEB" glow="#FFE3A2" />
        </Layer>
        <Clouds color="#FFFFFF" opacity={0.7} items={[{ x: 160, y: 250, w: 320, seed: 3, speed: 70 }, { x: 900, y: 190, w: 260, seed: 12, speed: 90 }]} />
        <Birds x={600} y={330} count={4} color="#2F6F7C" scale={0.9} duration={40} />
        <Layer depth={0.2}>
          <path d={`M1180 ${sea}Q1250 660 1330 668T1480 ${sea}Z`} fill="#3B8A8C" />
          <path d={palmTree(1300, 676, 70, 0.12, 5) + palmTree(1340, 682, 56, -0.1, 7)} fill="#2F7477" />
        </Layer>
        <Layer depth={0.34}>
          <Water uid={uid} y={sea} top="#39A3B1" bottom="#1A6F86" sunX={1140} sunColor="#FFF4CC" lines={46} />
          <g className="scene-drift" style={{ animationDuration: "80s" }}>
            <path d={sailboat(760, 770, 0.9)} fill="#16505E" />
          </g>
        </Layer>
        <Layer depth={0.62}>
          <path d="M0 1000L0 800C360 820 800 900 1600 880L1600 1000Z" fill="#F0D6A6" />
          <path d="M0 800C360 820 800 900 1600 880" stroke="#FFFFFF" strokeWidth={5} fill="none" className="scene-foam" opacity={0.8} />
        </Layer>
        <Layer depth={0.9}>
          <path d={palmTree(80, 1010, 520, 0.3, 3) + palmTree(210, 1010, 400, 0.18, 6) + palmTree(1530, 1010, 460, -0.28, 9)} fill="#1D4A48" />
        </Layer>
      </>
    );
  },
};

const aurora: SceneDef = {
  id: "aurora",
  tint: "#3E7A73",
  dark: true,
  render: (uid) => {
    const ribbon = (y: number, amp: number, phase: number, h: number) => {
      const top: Pt[] = [];
      const bottom: Pt[] = [];
      for (let i = 0; i <= 40; i++) {
        const x = -100 + (i / 40) * 1800;
        const wave = Math.sin(i * 0.32 + phase) * amp + Math.sin(i * 0.11 + phase * 2) * amp * 0.6;
        bottom.push([x, y + wave]);
        top.push([x + 30, y + wave - h - Math.sin(i * 0.5 + phase) * 40]);
      }
      return poly(top.concat(bottom.reverse()));
    };
    const ridge = mountainRidge({ seed: 9, y: 650, amp: 250, rough: 0.5 });
    const snowRand = mulberry32(4);
    const snowLine: Pt[] = [[0, 0], [1600, 0]];
    for (let x = 1600; x >= 0; x -= 22) snowLine.push([x, 612 + (snowRand() - 0.5) * 34]);
    const snowClip = poly(snowLine);
    const near = mountainRidge({ seed: 3, y: 820, amp: 70, rough: 0.5 });
    return (
      <>
        <Sky uid={uid} stops={[[0, "#06121E"], [0.42, "#0E2837"], [0.78, "#1D4852"], [1, "#3A7670"]]} />
        <Stars seed={14} count={160} maxY={600} />
        <defs>
          <linearGradient id={`${uid}-aur`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8BFFD2" stopOpacity="0" />
            <stop offset="0.7" stopColor="#6CF5C0" stopOpacity="0.45" />
            <stop offset="1" stopColor="#B6FFE4" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`${uid}-aur2`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C58BFF" stopOpacity="0" />
            <stop offset="0.8" stopColor="#8E7BFF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7CF5D0" stopOpacity="0.6" />
          </linearGradient>
          <filter id={`${uid}-blur`} x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <pattern id={`${uid}-rays`} width="9" height="1000" patternUnits="userSpaceOnUse">
            <rect width="4" height="1000" fill="#fff" />
            <rect x="4" width="5" height="1000" fill="#fff" opacity="0.35" />
          </pattern>
          <mask id={`${uid}-raymask`} maskUnits="userSpaceOnUse" x="-200" y="0" width="2000" height="1000">
            <rect x="-200" width="2000" height="1000" fill={`url(#${uid}-rays)`} />
          </mask>
          <clipPath id={`${uid}-snow`}>
            <path d={snowClip} />
          </clipPath>
        </defs>
        <g filter={`url(#${uid}-blur)`} mask={`url(#${uid}-raymask)`}>
          <g className="scene-aurora">
            <path d={ribbon(330, 46, 0, 200)} fill={`url(#${uid}-aur)`} />
          </g>
          <g className="scene-aurora" style={{ animationDuration: "17s", animationDelay: "-6s" }}>
            <path d={ribbon(240, 30, 2, 150)} fill={`url(#${uid}-aur2)`} opacity={0.8} />
          </g>
        </g>
        <Layer depth={0.06}>
          <Sun uid={uid} x={1290} y={170} r={24} color="#F2F6F0" glow="#CFF5E6" halo={5} haloOpacity={0.3} />
        </Layer>
        <Layer depth={0.3}>
          <path d={ridge.d} fill="#2A4A55" />
          <path d={ridge.d} fill="#C6E2DF" clipPath={`url(#${uid}-snow)`} />
        </Layer>
        <Layer depth={0.5}>
          <Water uid={uid} y={800} top="#1C4650" bottom="#0B1C24" lines={30} lineColor="#9FF5D6" />
          <Reflection uid={uid} y={800} opacity={0.3}>
            <path d={ridge.d} fill="#2A4A55" />
            <path d={ridge.d} fill="#C6E2DF" clipPath={`url(#${uid}-snow)`} />
          </Reflection>
        </Layer>
        <Layer depth={0.75}>
          <path d={near.d + forestOnRidge(near, { seed: 12, density: 0.08, minH: 30, maxH: 80 })} fill="#0A1820" clipPath={`url(#${uid}-shore)`} />
          <defs>
            <clipPath id={`${uid}-shore`}>
              <path d="M0 0H1600V1000H0Z" />
            </clipPath>
          </defs>
          <rect x={1180} y={near.at(1200) - 30} width={40} height={26} fill="#0A1820" />
          <path d={`M1174 ${near.at(1200) - 30}L1200 ${near.at(1200) - 52}L1226 ${near.at(1200) - 30}Z`} fill="#0A1820" />
          <rect x={1194} y={near.at(1200) - 22} width={9} height={8} fill="#FFCB7A" className="scene-breathe" />
        </Layer>
      </>
    );
  },
};

const dunes: SceneDef = {
  id: "dunes",
  tint: "#E0915E",
  dark: false,
  render: (uid) => {
    const inks = ["#EAA873", "#D78B55", "#BC6F3E", "#98552F", "#6E3C22"];
    const ridges = [0, 1, 2, 3, 4].map((i) => rollingRidge({ seed: 40 + i * 3, y: 700 + i * 64, amp: 30 + i * 10, waves: 2 + (i % 2) }));
    return (
      <>
        <Sky uid={uid} stops={[[0, "#E48A5A"], [0.4, "#EFAA74"], [0.75, "#F6CA94"], [1, "#FAE0B8"]]} />
        <Layer depth={0.08}>
          <Sun uid={uid} x={800} y={640} r={112} color="#FFF1D6" glow="#FFC07A" />
        </Layer>
        <Birds x={900} y={320} count={3} color="#A45A36" scale={0.9} duration={50} />
        {ridges.map((r, i) => (
          <Layer key={i} depth={0.15 + i * 0.17}>
            <path d={r.d} fill={inks[i]} />
            {i === 1 && (
              <g className="scene-walk">
                <path d={[0, 1, 2].map((k) => camel(420 + k * 34, r.at(420 + k * 34) + 1, 0.9)).join("")} fill="#9C5A30" />
              </g>
            )}
          </Layer>
        ))}
      </>
    );
  },
};


/** Berlin's Fernsehturm: tapering shaft, the steel sphere and a striped antenna. */
function tvTower(x: number, ground: number, h: number) {
  const sphereY = ground - h * 0.66;
  const r = h * 0.052;
  const b = new PathBuilder()
    .M(x - h * 0.02, ground)
    .L(x - h * 0.011, sphereY + r * 0.9)
    .L(x + h * 0.011, sphereY + r * 0.9)
    .L(x + h * 0.02, ground)
    .Z();
  const collar = rect(x - r * 0.62, sphereY + r * 0.78, r * 1.24, r * 0.34);
  const mast = rect(x - h * 0.006, sphereY - r - h * 0.2, h * 0.012, h * 0.2);
  let stripes = "";
  for (let i = 0; i < 5; i++) stripes += rect(x - h * 0.0065, sphereY - r - h * 0.2 + i * h * 0.04, h * 0.013, h * 0.02);
  return {
    body: b.toString() + collar + mast + circle(x, sphereY, r),
    windows: rect(x - r, sphereY - r * 0.12, r * 2, r * 0.24),
    stripes,
    tip: { x, y: sphereY - r - h * 0.2 },
  };
}

const berlin: SceneDef = {
  id: "berlin",
  tint: "#4B4F8C",
  dark: true,
  render: (uid) => {
    const baseY = 872;
    const s = 2.45;
    const tower = tvTower(360, 800, 720);
    const far = skyline(41, 800, -20, 1640, 26, 120, 0.12);
    const near = skyline(17, 900, -20, 1640, 30, 96, 0.2);
    const lamps = [120, 330, 1270, 1480];
    const tones = { body: "#F2C88C", shade: "#4E3A4C", accent: "#2C3A3E" };
    return (
      <>
        <Sky uid={uid} stops={[[0, "#171D44"], [0.38, "#303C78"], [0.66, "#6C66A0"], [0.86, "#D99A8E"], [1, "#F6C597"]]} />
        <Stars seed={21} count={60} maxY={380} opacity={0.7} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1230} y={790} r={46} color="#FFE2B8" glow="#F4A688" />
        </Layer>
        <Clouds color="#B58FA8" opacity={0.3} items={[{ x: 180, y: 330, w: 420, seed: 5, speed: 110 }, { x: 1040, y: 250, w: 360, seed: 12, speed: 90 }]} />
        <Birds x={1050} y={420} count={3} color="#3D3F6E" scale={0.7} duration={48} delay={-20} />
        <Layer depth={0.18}>
          <path d={far.body} fill="#474A7E" />
          <path d={far.lit} fill="#FFD9A0" opacity={0.45} />
          <path d={tower.body} fill="#3A3C6C" />
          <path d={tower.windows} fill="#FFD9A0" opacity={0.8} />
          <path d={tower.stripes} fill="#E9707A" opacity={0.8} />
          <circle cx={tower.tip.x} cy={tower.tip.y} r={4} fill="#FF5A5A" className="scene-blink" />
        </Layer>
        <Layer depth={0.34}>
          <path d={near.body} fill="#2D2F58" />
          <path d={near.lit} fill="#FFC98A" opacity={0.7} />
        </Layer>
        <Layer depth={0.5}>
          <defs>
            <radialGradient id={`${uid}-flood`} cx="0.5" cy="1" r="0.7">
              <stop offset="0" stopColor="#FFD39A" stopOpacity="0.55" />
              <stop offset="1" stopColor="#FFD39A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={800} cy={baseY} rx={560} ry={300} fill={`url(#${uid}-flood)`} />
          <Monument id="brandenburg" x={800} y={baseY} scale={s} tones={tones} />
        </Layer>
        <Layer depth={0.68}>
          <rect x={-40} y={baseY - 2} width={1680} height={200} fill="#231F3A" />
          <path d={`M-40 ${baseY + 6}H1640`} stroke="#F2C88C" strokeOpacity={0.25} strokeWidth={2} />
          <g className="scene-bus" style={{ animationDuration: "30s" }}>
            <g transform={`translate(0 ${baseY + 22}) scale(1.6)`}>
              <rect x={0} y={0} width={96} height={20} rx={5} fill="#F2C230" />
              <path d="M6 4h12v7h-12zM24 4h12v7h-12zM42 4h12v7h-12zM60 4h12v7h-12zM78 4h12v7h-12z" fill="#FFF1C8" opacity={0.85} />
              <rect x={0} y={14} width={96} height={2} fill="#1C1A2E" opacity={0.5} />
            </g>
          </g>
        </Layer>
        <Layer depth={0.82}>
          {lamps.map((x) => (
            <g key={x}>
              <rect x={x - 2.5} y={baseY - 150} width={5} height={210} fill="#15142A" />
              <circle cx={x} cy={baseY - 156} r={34} fill="#FFD9A0" opacity={0.16} />
              <circle cx={x} cy={baseY - 156} r={8} fill="#FFE7C0" />
            </g>
          ))}
          {/* The lindens of Unter den Linden framing the view. */}
          {canopyBlobs(90, 700, 150, 18, 13)
            .concat(canopyBlobs(1520, 690, 160, 18, 22))
            .map((c, i) => (
              <circle key={i} cx={r1(c.cx)} cy={r1(c.cy)} r={r1(c.r)} fill={c.k > 0.7 ? "#1E1D3A" : "#16152C"} />
            ))}
          <path d={`${rect(80, 720, 14, 300)}${rect(1512, 710, 16, 310)}`} fill="#16152C" />
        </Layer>
      </>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                     Landscapes for places without a wonder                 */
/* -------------------------------------------------------------------------- */

const blobs = (x: number, y: number, r: number, count: number, seed: number) =>
  canopyBlobs(x, y, r, count, seed)
    .map((b) => circle(r1(b.cx), r1(b.cy), r1(b.r)))
    .join("");

/** Broadleaf canopy running along a ridge (tropical forest rather than alpine pines). */
function canopyOnRidge(ridge: { at: (x: number) => number }, seed: number, r: number, gap = 0.1) {
  const rand = mulberry32(seed);
  let d = "";
  for (let x = -20; x < 1640; x += r * (0.9 + rand() * 0.8)) {
    if (rand() < gap) continue;
    const size = r * (0.7 + rand() * 0.6);
    d += blobs(x, ridge.at(x) - size * 0.35, size, 4, Math.floor(rand() * 1e6));
  }
  return d;
}

function rainStreaks(seed: number, count: number) {
  const rand = mulberry32(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = rand() * 1760 - 80;
    const y = rand() * 1100 - 100;
    d += `M${r1(x)} ${r1(y)}l-7 ${r1(24 + rand() * 30)}`;
  }
  return d;
}

/** A shikara / long boat with a canopy, sitting on the waterline at (x, y). */
function longBoat(x: number, y: number, s: number) {
  const k = (n: number) => r1(n * s);
  return (
    `M${x - k(90)} ${y - k(10)}Q${x} ${y + k(16)} ${x + k(96)} ${y - k(16)}L${x + k(80)} ${y - k(4)}Q${x} ${y + k(6)} ${x - k(78)} ${y - k(2)}Z` +
    `M${x - k(40)} ${y - k(6)}V${y - k(40)}Q${x} ${y - k(54)} ${x + k(40)} ${y - k(40)}V${y - k(6)}Z`
  );
}

const hills: SceneDef = {
  id: "hills",
  tint: "#4F8A6E",
  dark: false,
  render: (uid) => {
    const inks = ["#9CC4AE", "#72A987", "#4E8C68", "#34704D", "#1F5236"];
    const ridges = [
      rollingRidge({ seed: 3, y: 540, amp: 150, waves: 4 }),
      rollingRidge({ seed: 11, y: 630, amp: 130, waves: 4 }),
      rollingRidge({ seed: 19, y: 720, amp: 110, waves: 3 }),
      rollingRidge({ seed: 27, y: 815, amp: 90, waves: 3 }),
      rollingRidge({ seed: 41, y: 925, amp: 60, waves: 2 }),
    ];
    const fallX = 1060;
    const fallTop = ridges[2].at(fallX) + 6;
    return (
      <>
        <Sky uid={uid} stops={[[0, "#6F95A0"], [0.45, "#A7C4C0"], [0.8, "#D6E6DE"], [1, "#E8F1EB"]]} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={420} y={330} r={70} color="#F5F8F2" glow="#FFFFFF" />
        </Layer>
        <Clouds
          color="#FFFFFF"
          opacity={0.6}
          items={[
            { x: 120, y: 200, w: 420, seed: 4, speed: 90 },
            { x: 820, y: 150, w: 360, seed: 15, speed: 110 },
            { x: 1250, y: 260, w: 300, seed: 22, speed: 80 },
          ]}
        />
        <Birds x={760} y={330} count={4} color="#3E5E58" scale={0.8} duration={46} />
        {ridges.map((r, i) => (
          <Layer key={i} depth={0.12 + i * 0.17}>
            <path d={r.d + (i >= 1 ? canopyOnRidge(r, i * 13, 14 + i * 7, 0.12) : "")} fill={inks[i]} />
            {i === 2 && (
              <>
                <path
                  d={`M${fallX - 7} ${r1(fallTop)}C${fallX - 9} ${r1(fallTop + 60)} ${fallX - 4} ${r1(fallTop + 120)} ${fallX - 6} 830H${fallX + 8}C${fallX + 6} ${r1(fallTop + 120)} ${fallX + 10} ${r1(fallTop + 60)} ${fallX + 7} ${r1(fallTop)}Z`}
                  fill="#EEF6F3"
                  opacity={0.9}
                />
                <path d={`M${fallX - 2} ${r1(fallTop + 10)}V826`} stroke="#FFFFFF" strokeWidth={2} className="scene-shimmer" />
              </>
            )}
            {i < 3 && <Mist uid={`${uid}-h${i}`} y={r.at(800) + 40} h={80} opacity={0.34 - i * 0.08} speed={50 + i * 12} />}
          </Layer>
        ))}
        <Layer depth={0.95}>
          <path d={blobs(60, 820, 190, 9, 5) + blobs(1560, 800, 170, 8, 8) + rect(40, 820, 18, 200) + rect(1545, 800, 16, 220)} fill="#1C3D2E" />
        </Layer>
        <g className="scene-rain" stroke="#FFFFFF" strokeOpacity={0.38} strokeWidth={1.6} strokeLinecap="round">
          <path d={rainStreaks(9, 260)} />
        </g>
      </>
    );
  },
};

const lake: SceneDef = {
  id: "lake",
  tint: "#4E7FA0",
  dark: false,
  render: (uid) => {
    const shore = 700;
    const far = mountainRidge({ seed: 5, y: 470, amp: 240, rough: 0.5 });
    const mid = rollingRidge({ seed: 12, y: 610, amp: 90, waves: 3 });
    const near = rollingRidge({ seed: 23, y: 675, amp: 40, waves: 2 });
    const mountains = (
      <>
        <path d={far.d} fill="#7D98B3" />
        <path d={mid.d + forestOnRidge(mid, { seed: 4, density: 0.07, minH: 14, maxH: 30 })} fill="#4F6F7E" />
        <path d={near.d + forestOnRidge(near, { seed: 9, density: 0.09, minH: 10, maxH: 22 })} fill="#34545E" />
      </>
    );
    return (
      <>
        <Sky uid={uid} stops={[[0, "#5F86B0"], [0.45, "#A9C0D6"], [0.78, "#F1D2B6"], [1, "#F8E4CB"]]} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1120} y={560} r={70} color="#FFF4E0" glow="#FFD9AE" />
        </Layer>
        <Clouds color="#FFFFFF" opacity={0.55} items={[{ x: 200, y: 230, w: 340, seed: 6, speed: 100 }, { x: 980, y: 180, w: 280, seed: 18, speed: 120 }]} />
        <Birds x={640} y={360} count={5} color="#3C5670" scale={0.85} duration={48} />
        <Layer depth={0.2}>{mountains}</Layer>
        <Layer depth={0.32}>
          <Water uid={uid} y={shore} top="#8FB3C9" bottom="#3F6E8A" sunX={1120} sunColor="#FFE9C8" lines={40} />
          <Reflection uid={uid} y={shore} opacity={0.3}>
            {mountains}
          </Reflection>
          <Mist uid={`${uid}-l`} y={shore - 10} h={60} opacity={0.45} speed={70} />
        </Layer>
        <Layer depth={0.55}>
          <g className="scene-drift" style={{ animationDuration: "90s" }}>
            <path d={longBoat(640, 820, 1)} fill="#23343F" />
          </g>
        </Layer>
        <Layer depth={0.9}>
          <path d="M0 1000V880C220 870 380 905 560 1000Z" fill="#22403F" />
          <path d={blobs(-10, 610, 150, 9, 3) + rect(-6, 620, 16, 380)} fill="#1B3434" />
        </Layer>
      </>
    );
  },
};

const city: SceneDef = {
  id: "city",
  tint: "#4A5F86",
  dark: true,
  render: (uid) => {
    const back = skyline(31, 760, -20, 1640, 60, 240, 0);
    const mid = skyline(58, 830, -20, 1640, 70, 330, 0.12);
    const front = skyline(94, 905, -20, 1640, 40, 170, 0.16);
    return (
      <>
        <Sky uid={uid} stops={[[0, "#15223F"], [0.42, "#3E5582"], [0.72, "#C98A7A"], [0.9, "#F2B68A"], [1, "#F8CE9C"]]} />
        <Stars seed={31} count={70} maxY={380} opacity={0.7} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1180} y={700} r={78} color="#FFE9C4" glow="#FFB985" />
        </Layer>
        <Birds x={520} y={420} count={4} color="#26324E" scale={0.8} duration={44} />
        <Layer depth={0.2}>
          <path d={back.body} fill="#5A6A8E" opacity={0.75} />
        </Layer>
        <Layer depth={0.34}>
          <path d={mid.body} fill="#2E3B5C" />
          <path d={mid.lit} fill="#FFD48A" opacity={0.65} />
        </Layer>
        <Layer depth={0.5}>
          <path d={front.body} fill="#1A2440" />
          <path d={front.lit} fill="#FFDFA0" opacity={0.75} />
        </Layer>
        <Layer depth={0.62}>
          <Water uid={uid} y={905} top="#2F3F63" bottom="#141C31" sunX={1180} sunColor="#FFC98F" lines={30} />
        </Layer>
      </>
    );
  },
};

/** Side-view airliner pointing right, centred on (0, 0). */
const AIRLINER =
  "M-62 -3C-64 1 -61 5 -56 5L52 6C60 6 68 3 70 0C66 -5 60 -7 52 -7L-50 -7C-56 -7 -60 -6 -62 -3Z" +
  "M-54 -6L-66 -30H-54L-36 -7Z" +
  "M-6 1L-30 26H-18L20 2Z";

/** A train heading right: locomotive with its nose at x = 0, carriages trailing left; bottom at y = 0. */
function train() {
  let body = "M0 -8C0 -26 -14 -34 -34 -34H-96V0H-2C-1 -2 0 -5 0 -8Z";
  let windows = "M-30 -28H-12C-8 -26 -6 -22 -5 -18H-30Z";
  let stripe = "M-96 -12H-3V-8H-96Z";
  for (let c = 0; c < 4; c++) {
    const x1 = -102 - c * 118;
    const x0 = x1 - 112;
    body += `M${x0 + 6} -34H${x1 - 6}Q${x1} -34 ${x1} -28V0H${x0}V-28Q${x0} -34 ${x0 + 6} -34Z`;
    stripe += `M${x0} -12H${x1}V-8H${x0}Z`;
    for (let wx = x0 + 10; wx < x1 - 14; wx += 19) windows += `M${wx} -27h13v10h-13Z`;
  }
  return { body, windows, stripe };
}

/** A coach bus heading right, wheels touching y = 0 at x = 0..130. */
const COACH = {
  body: "M8 -46H112C122 -46 130 -38 130 -28V-8H0V-38C0 -42 3 -46 8 -46Z",
  windows: "M10 -40H96V-24H10ZM102 -40H114C120 -40 124 -35 124 -28V-24H102Z",
  wheels: "M20 -8a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM92 -8a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z",
};

const journey: SceneDef = {
  id: "journey",
  tint: "#1F6475",
  dark: true,
  render: (uid) => {
    const far = mountainRidge({ seed: 8, y: 455, amp: 110, rough: 0.5 });
    const mid = rollingRidge({ seed: 17, y: 505, amp: 40, waves: 3 });
    const deck = 540;
    const road = 600;
    const t = train();
    let arches = "";
    for (let x = -40; x < 1680; x += 150) arches += `M${x} ${deck + 14}H${x + 150}V720H${x + 132}V${deck + 70}A57 50 0 0 0 ${x + 18} ${deck + 70}V720H${x}Z`;
    return (
      <>
        <Sky uid={uid} stops={[[0, "#0F2F42"], [0.34, "#1F6475"], [0.46, "#6FB3AE"], [0.56, "#F2D2A0"], [1, "#F6D9A6"]]} />
        <Stars seed={12} count={40} maxY={260} opacity={0.6} />
        <Layer depth={0.06}>
          <Sun uid={uid} x={1240} y={495} r={62} color="#FFF3D6" glow="#FFC876" />
        </Layer>
        <Clouds color="#E4F3EF" opacity={0.45} items={[{ x: 180, y: 360, w: 300, seed: 5, speed: 80 }, { x: 980, y: 300, w: 260, seed: 14, speed: 100 }]} />
        <g className="scene-fly" style={{ animationDuration: "30s" }}>
          <g transform="translate(800 412) scale(0.85)">
            <defs>
              <linearGradient id={`${uid}-trail`} gradientUnits="userSpaceOnUse" x1={-70} y1={0} x2={-620} y2={0}>
                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M-66 -1H-620" stroke={`url(#${uid}-trail)`} strokeWidth={4} strokeLinecap="round" />
            <path d="M-62 4H-560" stroke={`url(#${uid}-trail)`} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
            <path d={AIRLINER} fill="#F7FBF9" />
            <path d="M-50 -2H48" stroke="#0B8278" strokeWidth={2.4} />
            <path d="M-54 -6L-66 -30H-54Z" fill="#F4A340" />
          </g>
        </g>
        <Layer depth={0.14}>
          <path d={far.d} fill="#86B3B0" />
        </Layer>
        <Layer depth={0.24}>
          <path d={mid.d + forestOnRidge(mid, { seed: 3, density: 0.05, minH: 12, maxH: 26 })} fill="#4F8B86" />
        </Layer>
        <Layer depth={0.36}>
          <rect x={0} y={deck + 30} width={VIEW_W} height={200} fill="#3B7772" />
          <path d={arches} fill="#D9E6E1" />
          <rect x={-20} y={deck} width={VIEW_W + 40} height={16} fill="#EAF2EF" />
          <rect x={-20} y={deck - 4} width={VIEW_W + 40} height={4} fill="#9DBDB6" />
          <g className="scene-train">
            <path d={t.body} transform={`translate(0 ${deck - 4})`} fill="#F7FBF9" />
            <path d={t.stripe} transform={`translate(0 ${deck - 4})`} fill="#0B8278" />
            <path d={t.windows} transform={`translate(0 ${deck - 4})`} fill="#16324A" />
          </g>
        </Layer>
        <Layer depth={0.55}>
          <rect x={0} y={road - 26} width={VIEW_W} height={400} fill="#2A5A55" />
          <rect x={0} y={road - 14} width={VIEW_W} height={44} fill="#22363F" />
          <path d={`M0 ${road + 8}H${VIEW_W}`} stroke="#F7FBF9" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="26 22" />
          <g className="scene-drive">
            <g transform={`translate(0 ${road + 10})`}>
              <path d={COACH.body} fill="#F4A340" />
              <path d={COACH.windows} fill="#16324A" />
              <path d="M0 -20H130V-16H0Z" fill="#FFFFFF" opacity={0.7} />
              <path d={COACH.wheels} fill="#0F1E28" />
            </g>
          </g>
        </Layer>
        <Layer depth={0.85}>
          <path d={blobs(40, 700, 150, 8, 21) + blobs(1580, 690, 140, 8, 34) + rect(30, 690, 14, 320) + rect(1570, 680, 14, 330)} fill="#173833" />
        </Layer>
      </>
    );
  },
};

export const SCENES: Record<SceneId, SceneDef> = {
  taj,
  eiffel,
  colosseum,
  pyramids,
  fuji,
  santorini,
  machupicchu,
  rio,
  sydney,
  newyork,
  london,
  dubai,
  sanfrancisco,
  angkor,
  peaks,
  coast,
  aurora,
  dunes,
  berlin,
  hills,
  lake,
  city,
  journey,
};
