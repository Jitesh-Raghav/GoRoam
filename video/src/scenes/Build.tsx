import { CalendarDays, Check, Moon, Sun, Sunrise, Users, Coffee, type LucideIcon } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { lerp, prog, spr } from "../anim";
import { Backdrop } from "../components/backdrop";
import { Emblem } from "../components/emblem";
import { Flag } from "../components/flag";
import { Eyebrow, Glow } from "../components/kit";
import { BUDGET, CATEGORY, DAYS, TOTAL, dayCost, usd, type Day } from "../data";
import { useFormat } from "../format";
import { wordMatch, type Cue, type SceneProps } from "../scene";
import type { Variant } from "../script";
import { C, E, F, SHADOW } from "../theme";
import type { PlacedBeat } from "../timeline";

const SLOT_ICONS: LucideIcon[] = [Sunrise, Sun, Moon];
const STATUS = ["Reading your vibe", "Scouting temples & tea houses", "Grouping stops by neighbourhood", "Balancing a $2,400 budget"];

/** A 0→1→0 pulse, for spotlighting things as the narrator names them. */
const pulse = (frame: number, at: number, len = 30) => {
  if (frame < at - 4 || frame > at + len) return 0;
  return interpolate(frame, [at - 4, at + 6, at + len], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

function beats(variant: Variant, beat: PlacedBeat, dur: number) {
  const think = variant === "film" ? 44 : 24;
  const cardsAt = think + 10;
  const cardGap = variant === "film" ? 6 : 4;
  const places = wordMatch(beat, /^places/i, cardsAt + 60);
  const costs = wordMatch(beat, /^costs/i, places + 20);
  return {
    think,
    cardsAt,
    cardGap,
    places,
    costs,
    budgetAt: Math.min(costs - 4, dur - 60),
    tod: [wordMatch(beat, /^mornings/i, -999), wordMatch(beat, /^afternoons/i, -999), wordMatch(beat, /^evenings/i, -999)],
    flow: wordMatch(beat, /^flow/i, -999),
    zoomAt: dur - 34, // the dive lands as the map fades in over it
  };
}

/** "GoRoam's AI plans every day. Real places, real costs, and mornings, afternoons and evenings that actually flow." */
export function Build({ dur, variant, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, cx, cy, vertical, v } = useFormat();
  const b = beats(variant, beat, dur);

  // Layout per format.
  const pad = v(110, 64);
  const days = vertical ? DAYS.slice(0, 3) : DAYS;
  const gridTop = v(330, 676);
  const gap = 20;
  const colW = vertical ? W - pad * 2 : (W - pad * 2 - gap * 4) / 5;
  const cardH = v(650, 228);
  const cardPos = (i: number) => (vertical ? { x: pad, y: gridTop + i * (cardH + gap) } : { x: pad + i * (colW + gap), y: gridTop });
  const day1 = cardPos(0);
  const zoomOrigin = { x: day1.x + colW / 2, y: day1.y + cardH / 2 };

  // The logo-loader flies from centre stage into the header.
  const handoff = prog(frame, b.think - 6, 22, E.inOutQuart);
  const loaderSize = lerp(v(300, 340), 64, handoff);
  const headerIcon = { x: pad + 32, y: v(122, 282) };
  const loaderX = lerp(cx, headerIcon.x, handoff);
  const loaderY = lerp(cy - v(40, 60), headerIcon.y, handoff);
  const status = Math.min(STATUS.length - 1, Math.floor((frame / b.think) * STATUS.length));
  const statusP = prog(frame, (status * b.think) / STATUS.length, 8);

  const header = spr(frame, b.think - 2);
  const total = interpolate(frame, [b.budgetAt, b.budgetAt + 40], [0, TOTAL], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E.outQuart });
  const within = spr(frame, b.budgetAt + 40);

  // Camera: a slow push, then a dive into Day 1 to cut to its map.
  const zoom = prog(frame, b.zoomAt, 34, E.inOutQuart);
  const camScale = interpolate(frame, [0, dur], [1, 1.035]) * (1 + zoom * v(2.2, 1.5));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <AbsoluteFill style={{ transform: `scale(${camScale})`, transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`, filter: zoom > 0.05 ? `blur(${zoom * 8}px)` : undefined }}>
        <Glow x={W * 0.15} y={H * 0.2} r={v(600, 520)} color="rgba(52,209,191,0.18)" />
        <Glow x={W * 0.9} y={H * 0.85} r={v(600, 520)} color="rgba(244,163,64,0.16)" />

        {/* Thinking: status lines tick past under the loader. */}
        {frame < b.think + 10 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: cy + v(140, 160), textAlign: "center", opacity: 1 - handoff }}>
            <div
              style={{
                fontFamily: F.sans,
                fontSize: v(40, 44),
                fontWeight: 500,
                color: C.ink2,
                transform: `translateY(${(1 - statusP) * 24}px)`,
                opacity: statusP,
              }}
            >
              {STATUS[status]}
              <span style={{ color: C.brand }}>{".".repeat(1 + (Math.floor(frame / 5) % 3))}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ position: "absolute", left: pad + 80, top: v(96, 252), opacity: Math.min(1, header * 1.5), transform: `translateY(${(1 - header) * 30}px)` }}>
          <Eyebrow color={C.brand}>Your itinerary · ready in 8 seconds</Eyebrow>
        </div>
        <div style={{ position: "absolute", left: pad, top: v(150, 330), opacity: Math.min(1, header * 1.5), transform: `translateY(${(1 - header) * 40}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: F.display, fontSize: v(92, 104), lineHeight: 1, color: C.ink, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>
            Tokyo &amp; Kyoto{vertical ? "" : ", Japan"}
            <Flag size={v(56, 64)} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {(
              [
                [CalendarDays, "5 days · Apr 2–6"],
                [Users, "2 travellers"],
                ...(vertical ? [] : [[Coffee, "Slow pace"]]),
              ] as [LucideIcon, string][]
            ).map(([Icon, label], i) => {
              const s = spr(frame, b.think + 4 + i * 3);
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: C.white, border: `1.5px solid ${C.line}`, fontFamily: F.sans, fontSize: 24, fontWeight: 500, color: C.ink2, transform: `scale(${s})`, opacity: s }}>
                  <Icon size={22} color={C.brand} /> {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div
          style={{
            position: "absolute",
            ...(vertical ? { left: pad, right: pad, top: 520 } : { right: pad, top: 96, width: 560 }),
            padding: vertical ? "22px 28px" : "20px 28px 18px",
            borderRadius: 28,
            background: C.white,
            boxShadow: SHADOW,
            opacity: Math.min(1, header * 1.5),
            transform: `translateY(${(1 - header) * 30}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <Eyebrow>Trip total</Eyebrow>
            <div style={{ marginLeft: "auto", fontFamily: F.display, fontSize: 64, lineHeight: 0.9, color: C.ink }}>{usd(total)}</div>
            <div style={{ fontFamily: F.sans, fontSize: 24, color: C.stone }}>of {usd(BUDGET)}</div>
          </div>
          <div style={{ position: "relative", height: 14, borderRadius: 7, background: C.paper2, marginTop: 16, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${(total / BUDGET) * 100}%`, borderRadius: 7, background: `linear-gradient(90deg, ${C.brand}, ${C.brand2})` }} />
          </div>
          {!vertical && (
            <div style={{ display: "flex", marginTop: 14, fontFamily: F.sans, fontSize: 22, color: C.stone, gap: 8, alignItems: "center" }}>
              Stays, food & tickets
              <WithinBudget s={within} />
            </div>
          )}
          {vertical && (
            <div style={{ position: "absolute", right: 28, top: -26 }}>
              <WithinBudget s={within} />
            </div>
          )}
        </div>

        {days.map((d, i) => (
          <DayCard key={d.day} d={d} i={i} b={b} frame={frame} {...cardPos(i)} w={colW} h={cardH} vertical={vertical} />
        ))}
      </AbsoluteFill>

      {/* Loader: the logo, its plane circling while the AI works. */}
      {handoff < 1 && (
        <div style={{ position: "absolute", left: loaderX - loaderSize / 2, top: loaderY - loaderSize / 2, opacity: handoff > 0.95 ? 0 : 1 }}>
          <Emblem size={loaderSize} theta={0.69 - frame * 0.22} halo={1 - handoff} />
        </div>
      )}
      {handoff >= 1 && (
        <div style={{ position: "absolute", left: headerIcon.x - 32, top: headerIcon.y - 32, transform: `scale(${camScale})`, transformOrigin: `${zoomOrigin.x - headerIcon.x + 32}px ${zoomOrigin.y - headerIcon.y + 32}px`, opacity: 1 - zoom }}>
          <Emblem size={64} tile={1} halo={0} theta={0.69 - Math.min(frame, b.think + 16) * 0.22} />
        </div>
      )}
    </AbsoluteFill>
  );
}

function WithinBudget({ s }: { s: number }) {
  return (
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        background: "#dff5e8",
        color: "#167a47",
        fontFamily: F.sans,
        fontWeight: 600,
        fontSize: 22,
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        whiteSpace: "nowrap",
      }}
    >
      <Check size={20} strokeWidth={3} /> Within budget
    </div>
  );
}

function DayCard({
  d,
  i,
  b,
  frame,
  x,
  y,
  w,
  h,
  vertical,
}: {
  d: Day;
  i: number;
  b: ReturnType<typeof beats>;
  frame: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vertical: boolean;
}) {
  const at = b.cardsAt + i * b.cardGap;
  const s = spr(frame, at, { damping: 16, stiffness: 130 });
  const highlight = i === 0 ? prog(frame, b.zoomAt - 30, 20) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 30,
        background: C.white,
        boxShadow: highlight ? `${SHADOW}, 0 0 0 ${3 + highlight * 3}px rgba(52,209,191,${highlight})` : SHADOW,
        padding: vertical ? "22px 26px" : "26px 24px",
        transform: `translateY(${(1 - s) * 90}px) scale(${0.9 + s * 0.1}) rotate(${(1 - s) * (i % 2 ? 3 : -3)}deg)`,
        opacity: frame < at ? 0 : Math.min(1, s * 1.8),
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 500, letterSpacing: "0.14em", color: C.brand }}>DAY {d.day}</div>
        <div style={{ marginLeft: vertical ? 0 : "auto", fontFamily: F.sans, fontSize: 20, color: C.stone }}>{d.date}</div>
        {vertical && <div style={{ marginLeft: "auto", fontFamily: F.serif, fontSize: 28, color: C.ink }}>{d.theme}</div>}
      </div>
      {!vertical && <div style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 1.12, color: C.ink, marginTop: 10, minHeight: 68 }}>{d.theme}</div>}
      <div style={{ height: 1, background: C.line, margin: vertical ? "16px 0 14px" : "16px 0 6px" }} />
      <div style={{ display: "flex", flexDirection: vertical ? "row" : "column", gap: vertical ? 18 : 0, flex: 1 }}>
        {d.stops.map((stop, k) => (
          <Slot key={k} stop={stop} k={k} at={at + 8 + k * 5} frame={frame} b={b} vertical={vertical} />
        ))}
      </div>
      {!vertical && (
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.sans, fontSize: 20, color: C.stone, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          <span>Day total</span>
          <span style={{ color: C.ink, fontWeight: 600 }}>{usd(dayCost(d))}</span>
        </div>
      )}
    </div>
  );
}

function Slot({ stop, k, at, frame, b, vertical }: { stop: Day["stops"][number]; k: number; at: number; frame: number; b: ReturnType<typeof beats>; vertical: boolean }) {
  const loaded = prog(frame, at + 6, 14);
  const cat = CATEGORY[stop.cat];
  const Tod = SLOT_ICONS[k];
  const CatIcon = cat.icon;
  const place = pulse(frame, b.places + k * 3, 34);
  const cost = pulse(frame, b.costs + k * 3, 34);
  const tod = pulse(frame, b.tod[k], 26);
  const shimmer = interpolate((frame * 3) % 100, [0, 100], [-60, 160]);
  return (
    <div style={{ position: "relative", flex: 1, padding: vertical ? 0 : "12px 0", minWidth: 0 }}>
      {/* Skeleton until the stop "arrives". */}
      {loaded < 1 && (
        <div style={{ position: "absolute", inset: vertical ? "0" : "12px 0", opacity: 1 - loaded, overflow: "hidden", borderRadius: 14 }}>
          {[0.5, 0.92, 0.7].map((wd, n) => (
            <div key={n} style={{ height: n === 1 ? 22 : 15, width: `${wd * 100}%`, marginBottom: 10, borderRadius: 8, background: C.paper2 }} />
          ))}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${shimmer - 30}%, rgba(255,255,255,0.8) ${shimmer}%, transparent ${shimmer + 30}%)` }} />
        </div>
      )}
      <div style={{ opacity: loaded, transform: `translateY(${(1 - loaded) * 10}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              display: "grid",
              placeItems: "center",
              background: tod > 0 ? C.sun2 : C.sunSoft,
              transform: `scale(${1 + tod * 0.35})`,
            }}
          >
            <Tod size={19} color={tod > 0.3 ? C.ink : "#b8741f"} />
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.stone }}>{stop.time}</div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 20,
              padding: "4px 12px",
              borderRadius: 999,
              background: cost > 0 ? C.brand : C.paper,
              color: cost > 0 ? C.white : stop.cost ? C.ink : "#167a47",
              transform: `scale(${1 + cost * 0.18})`,
            }}
          >
            {stop.cost ? usd(stop.cost) : "Free"}
          </div>
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: vertical ? 25 : 25,
            lineHeight: 1.18,
            color: C.ink,
            marginTop: 10,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            backgroundImage: `linear-gradient(transparent 62%, rgba(52,209,191,${0.45 * place}) 62%)`,
          }}
        >
          {stop.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, fontFamily: F.sans, fontSize: 19, color: C.stone, whiteSpace: "nowrap" }}>
          <CatIcon size={18} color={cat.color} />
          {stop.area}
        </div>
      </div>
    </div>
  );
}

export const buildCues = ({ dur, variant, beat }: SceneProps): Cue[] => {
  const b = beats(variant, beat, dur);
  const n = variant === "film" ? 5 : 5;
  return [
    { at: 2, sfx: "shimmer", gain: 0.4 },
    ...Array.from({ length: n }, (_, i) => ({ at: b.cardsAt + i * b.cardGap, sfx: "snap" as const, gain: 0.55 })),
    { at: b.budgetAt + 40, sfx: "chime", gain: 0.7 },
    { at: b.zoomAt + 4, sfx: "swoosh", gain: 0.8 },
  ];
};
