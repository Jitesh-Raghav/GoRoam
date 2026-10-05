import { CalendarDays, Coffee, Flower2, MapPin, Soup, Sparkles, type LucideIcon } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { lerp, prog, spr } from "../anim";
import { Emblem } from "../components/emblem";
import { Cursor, Eyebrow, Glow, Ripple, Words } from "../components/kit";
import { Backdrop } from "../components/backdrop";
import { useFormat } from "../format";
import { wordFrame, type Cue, type SceneProps } from "../scene";
import type { Variant } from "../script";
import { C, E, F, SHADOW } from "../theme";

const TEXT = "5 days in Japan. Cherry blossoms, ramen and slow mornings.";
const CHIPS: { label: string; icon: LucideIcon; after: string; tone: string }[] = [
  { label: "5 days", icon: CalendarDays, after: "5 days", tone: C.brand },
  { label: "Japan", icon: MapPin, after: "Japan", tone: C.red },
  { label: "Cherry blossoms", icon: Flower2, after: "blossoms", tone: "#d45d84" },
  { label: "Food lover", icon: Soup, after: "ramen", tone: C.sun },
  { label: "Slow pace", icon: Coffee, after: "mornings", tone: C.ink2 },
];

/** Card geometry, shared with the iris that opens the next scene from the Generate button. */
export function promptLayout(vertical: boolean) {
  return vertical
    ? { cardX: 64, cardY: 560, cardW: 952, button: { x: 540, y: 1300, w: 860, h: 112 } }
    : { cardX: 300, cardY: 380, cardW: 1320, button: { x: 1370, y: 760, w: 380, h: 96 } };
}

function timing(variant: Variant, dur: number) {
  const typeStart = 12;
  const cps = variant === "film" ? 0.78 : 1.05; // characters per frame
  const typeEnd = typeStart + TEXT.length / cps;
  const press = Math.min(typeEnd + 30, dur - 30);
  return { typeStart, cps, typeEnd, press };
}

/** "With GoRoam, you just say it." */
export function Prompt({ dur, variant, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, vertical, v } = useFormat();
  const L = promptLayout(vertical);
  const { typeStart, cps, typeEnd, press } = timing(variant, dur);

  const typed = Math.max(0, Math.min(TEXT.length, Math.floor((frame - typeStart) * cps)));
  const text = TEXT.slice(0, typed);
  const caretOn = frame < typeStart || frame > typeEnd ? Math.floor(frame / 15) % 2 === 0 : true;

  const card = spr(frame, 0, { damping: 18, stiffness: 110 });
  const pressS = spr(frame, press, { damping: 10, stiffness: 260, mass: 0.5 });
  const pressDown = frame >= press ? Math.max(0, 1 - pressS) : 0;
  const lit = prog(frame, press, 14);

  // The cursor glides in from the bottom corner to the button.
  const cIn = prog(frame, press - 26, 24, E.outQuart);
  const cursorX = lerp(W + 80, L.button.x + v(40, 120), cIn);
  const cursorY = lerp(H + 60, L.button.y + 10, cIn);

  // Camera: a slow push, then a lean towards the button as it fires.
  const push = interpolate(frame, [0, dur], [1, 1.04]) + prog(frame, press + 4, dur - press, E.inExpo) * 0.12;
  const headlineAt = wordFrame(beat, Math.max(0, beat.words.length - 3)) - 6;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${L.button.x}px ${L.button.y}px` }}>
        <Glow x={L.cardX + L.cardW * 0.2} y={L.cardY} r={v(520, 480)} color="rgba(52,209,191,0.28)" />
        <Glow x={L.cardX + L.cardW * 0.85} y={L.cardY + 300} r={v(460, 440)} color="rgba(244,163,64,0.24)" />

        <div style={{ position: "absolute", left: 0, right: 0, top: v(150, 330), display: "flex", justifyContent: "center" }}>
          <Words
            text={variant === "film" ? "Just say it." : "Say where."}
            start={headlineAt}
            stagger={4}
            accent={["say", "where."]}
            accentColor={C.brand}
            style={{ fontFamily: F.display, fontSize: v(150, 140), lineHeight: 1, color: C.ink, letterSpacing: "-0.015em" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: L.cardX,
            top: L.cardY,
            width: L.cardW,
            borderRadius: 40,
            background: "rgba(255,255,255,0.92)",
            boxShadow: SHADOW,
            border: "1.5px solid rgba(255,255,255,0.9)",
            padding: v("40px 48px 44px", "40px 44px 44px"),
            transform: `translateY(${(1 - card) * 120}px) scale(${0.94 + card * 0.06})`,
            opacity: Math.min(1, card * 1.6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
            <Emblem size={52} tile={1} halo={0} />
            <Eyebrow>Plan a trip</Eyebrow>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: C.brandSoft, color: C.brand, fontFamily: F.sans, fontWeight: 600, fontSize: 22 }}>
              <Sparkles size={20} /> GoRoam AI
            </div>
          </div>

          <div style={{ fontFamily: F.sans, fontSize: v(54, 58), lineHeight: 1.25, color: C.ink, minHeight: v(140, 290), letterSpacing: "-0.01em", fontWeight: 500 }}>
            {typed === 0 ? (
              <span style={{ color: C.stone2 }}>
                <Caret on={caretOn} />
                Where, how long, who&apos;s coming and what you love…
              </span>
            ) : (
              <>
                {text}
                <Caret on={caretOn} />
              </>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 30, minHeight: v(64, 150), paddingRight: v(400, 0) }}>
            {CHIPS.map((chip) => {
              const idx = TEXT.indexOf(chip.after) + chip.after.length;
              const at = typeStart + idx / cps + 2;
              if (frame < at) return null;
              const s = spr(frame, at);
              const Icon = chip.icon;
              return (
                <div
                  key={chip.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 22px",
                    borderRadius: 999,
                    background: C.paper,
                    border: `1.5px solid ${C.line}`,
                    fontFamily: F.sans,
                    fontWeight: 600,
                    fontSize: 26,
                    color: C.ink,
                    transform: `scale(${s}) translateY(${(1 - s) * 14}px)`,
                    opacity: Math.min(1, s * 2),
                  }}
                >
                  <Icon size={26} color={chip.tone} strokeWidth={2.2} />
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate itinerary */}
        <div
          style={{
            position: "absolute",
            left: L.button.x - L.button.w / 2,
            top: L.button.y - L.button.h / 2,
            width: L.button.w,
            height: L.button.h,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            overflow: "hidden",
            background: `linear-gradient(90deg, ${C.ink} 0%, ${C.ink2} 100%)`,
            color: C.paper,
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 32,
            boxShadow: `0 20px 40px -12px rgba(11,130,120,${0.25 + lit * 0.5}), 0 0 0 ${lit * 10}px rgba(52,209,191,${0.25 * (1 - lit)})`,
            transform: `scale(${(1 - pressDown * 0.08) * (0.9 + card * 0.1)})`,
            opacity: Math.min(1, card * 1.6),
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${C.brand}, ${C.brand2})`, opacity: lit }} />
          {/* A sheen sweeps across as it fires. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 120,
              left: `${lerp(-30, 130, prog(frame, press, 20, E.inOutSine))}%`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
          <Sparkles size={30} style={{ position: "relative" }} />
          <span style={{ position: "relative" }}>Generate itinerary</span>
        </div>

        <Ripple x={L.button.x + v(40, 120)} y={L.button.y + 10} start={press} />
        <Cursor x={cursorX} y={cursorY} press={pressDown} opacity={cIn} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Caret({ on }: { on: boolean }) {
  return <span style={{ display: "inline-block", width: 4, height: "1.05em", marginLeft: 4, marginRight: 2, verticalAlign: "-0.15em", background: C.brand, opacity: on ? 1 : 0 }} />;
}

export const promptCues = ({ dur, variant }: SceneProps): Cue[] => {
  const t = timing(variant, dur);
  const chips = CHIPS.map((c) => ({ at: Math.round(t.typeStart + (TEXT.indexOf(c.after) + c.after.length) / t.cps + 2), sfx: "pop" as const, gain: 0.45 }));
  return [
    { at: t.typeStart, sfx: "keys", gain: 0.8 },
    ...chips,
    { at: t.press, sfx: "click", gain: 1 },
    { at: t.press + 4, sfx: "riser", gain: 0.6 },
  ];
};
