import { BedDouble, CalendarCheck, Check, Copy, Link2, Plane, Sparkles, TrainFront, type LucideIcon } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { lerp, prog, spr } from "../anim";
import { Backdrop } from "../components/backdrop";
import { Glow } from "../components/kit";
import { STAY } from "../data";
import { useFormat } from "../format";
import { wordMatch, type Cue, type SceneProps } from "../scene";
import { C, E, F, SHADOW } from "../theme";
import type { PlacedBeat } from "../timeline";

interface Ticket {
  icon: LucideIcon;
  tone: string;
  title: string;
  detail: string;
  filled: string;
  partners: string;
}

const TICKETS: Ticket[] = [
  { icon: Plane, tone: C.brand, title: "SFO → HND", detail: "Round trip · 2 adults", filled: "Thu, Apr 2", partners: "Google Flights · Skyscanner · Kayak" },
  { icon: BedDouble, tone: "#c8741f", title: STAY.name, detail: `${STAY.nights} nights · 2 guests`, filled: "Apr 2 – 6", partners: "Booking.com · Expedia · Airbnb" },
  { icon: TrainFront, tone: C.ink2, title: "Shinkansen to Kyoto", detail: "Nozomi · 2 reserved seats", filled: "Sat, Apr 4", partners: "Klook · GetYourGuide · Viator" },
];

const CREW = [
  { i: "MK", c: "#0b8278" },
  { i: "AR", c: "#c8741f" },
  { i: "JS", c: "#7a5cc2" },
];

function beats(beat: PlacedBeat, dur: number) {
  const book = wordMatch(beat, /^book/i, 10);
  const share = wordMatch(beat, /^share/i, book + 40);
  const go = wordMatch(beat, /^go\b/i, share + 40);
  return { book, share, go: Math.min(go, dur - 30) };
}

/** "Book it. Share it with the crew. Go." */
export function BookShare({ dur, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, vertical, v } = useFormat();
  const b = beats(beat, dur);

  const words = [
    { t: "Book it.", at: b.book - 4 },
    { t: "Share it.", at: b.share - 4 },
    { t: "Go.", at: b.go - 4 },
  ];
  const goPulse = interpolate(frame, [b.go - 2, b.go + 6, b.go + 22], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const colX = v(980, 72);
  const colW = v(820, W - 144);
  const ticketsTop = v(170, 660);
  const ticketH = v(168, 168);
  const shareTop = ticketsTop + 3 * (ticketH + 18) + v(16, 10);

  const copyAt = b.share + 10;
  const copied = prog(frame, copyAt, 8);
  const crewAt = b.share + 22;
  const calAt = b.share + 34;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <Glow x={W * 0.25} y={H * 0.5} r={v(620, 540)} color="rgba(52,209,191,0.2)" />
      <Glow x={W * 0.8} y={H * 0.2} r={v(560, 480)} color="rgba(244,163,64,0.18)" />

      {/* Book it. Share it. Go. */}
      <div style={{ position: "absolute", left: v(120, 0), right: vertical ? 0 : undefined, top: v(250, 250), textAlign: vertical ? "center" : "left" }}>
        {words.map((w, i) => {
          const p = prog(frame, w.at, 22);
          const s = spr(frame, w.at);
          const isGo = i === 2;
          return (
            <div
              key={w.t}
              style={{
                fontFamily: F.display,
                fontSize: v(170, 116),
                lineHeight: v(1.0, 0.98),
                letterSpacing: "-0.02em",
                color: isGo ? C.brand : C.ink,
                fontStyle: isGo ? "italic" : undefined,
                transform: `translateY(${(1 - p) * 60}px) scale(${(0.92 + s * 0.08) * (1 + (isGo ? goPulse * 0.12 : 0))})`,
                transformOrigin: vertical ? "50% 50%" : "0% 50%",
                opacity: p,
                whiteSpace: "nowrap",
              }}
            >
              {w.t}
            </div>
          );
        })}
      </div>

      {/* Bookings, prefilled */}
      {TICKETS.map((t, i) => {
        const at = b.book + 2 + i * 5;
        const s = spr(frame, at, { damping: 17, stiffness: 120 });
        const fill = prog(frame, at + 12, 14, E.inOutSine);
        const Icon = t.icon;
        return (
          <div
            key={t.title}
            style={{
              position: "absolute",
              left: colX,
              top: ticketsTop + i * (ticketH + 18),
              width: colW,
              height: ticketH,
              borderRadius: 30,
              background: C.white,
              boxShadow: SHADOW,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 30px",
              transform: vertical ? `translateY(${(1 - s) * 200}px)` : `translateX(${(1 - s) * 900}px) rotate(${(1 - s) * 4}deg)`,
              opacity: frame < at ? 0 : Math.min(1, s * 1.5),
            }}
          >
            <div style={{ width: 76, height: 76, borderRadius: 24, background: t.tone, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={38} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: i === 0 ? F.mono : F.sans, fontWeight: 600, fontSize: i === 0 ? 34 : 30, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, fontFamily: F.sans, fontSize: 22, color: C.stone, whiteSpace: "nowrap" }}>
                {/* The date fills itself in. */}
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: `rgba(52,209,191,${0.28 * (1 - Math.max(0, fill - 0.7) / 0.3) * Math.min(1, fill * 3)})`,
                    color: C.ink,
                    fontWeight: 600,
                  }}
                >
                  {t.filled.slice(0, Math.round(t.filled.length * fill)) || " "}
                </span>
                {t.detail}
              </div>
              {!vertical && <div style={{ marginTop: 8, fontFamily: F.sans, fontSize: 19, color: C.stone2 }}>{t.partners}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: F.mono, fontSize: 16, letterSpacing: "0.12em", color: C.brand, opacity: fill }}>
                <Sparkles size={16} /> PREFILLED
              </div>
              <div style={{ padding: "12px 28px", borderRadius: 999, background: C.ink, color: C.paper, fontFamily: F.sans, fontWeight: 600, fontSize: 24 }}>Book</div>
            </div>
          </div>
        );
      })}

      {/* Share with the crew */}
      {(() => {
        const s = spr(frame, b.share - 6, { damping: 17, stiffness: 120 });
        return (
          <div
            style={{
              position: "absolute",
              left: colX,
              top: shareTop,
              width: colW,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 18px 18px 28px",
              borderRadius: 999,
              background: C.ink,
              color: C.paper,
              boxShadow: "0 24px 50px -18px rgba(10,30,44,0.6)",
              transform: `translateY(${(1 - s) * 80}px) scale(${0.94 + s * 0.06})`,
              opacity: frame < b.share - 6 ? 0 : Math.min(1, s * 1.5),
            }}
          >
            <Link2 size={30} color={C.brand2} />
            <div style={{ fontFamily: F.mono, fontSize: v(26, 24), flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>goroam · tokyo-kyoto-for-two</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 26px",
                borderRadius: 999,
                background: copied > 0 ? C.brand2 : C.paper,
                color: C.ink,
                fontFamily: F.sans,
                fontWeight: 600,
                fontSize: 24,
                transform: `scale(${1 - Math.max(0, 1 - Math.abs(frame - copyAt) / 4) * 0.08})`,
              }}
            >
              {copied > 0 ? <Check size={22} strokeWidth={3} /> : <Copy size={22} />}
              {copied > 0 ? "Copied" : "Copy link"}
            </div>
          </div>
        );
      })()}

      {/* The crew joins, the calendar syncs */}
      <div style={{ position: "absolute", left: colX, top: shareTop + v(118, 112), display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex" }}>
          {CREW.map((p, i) => {
            const s = spr(frame, crewAt + i * 4);
            return (
              <div
                key={p.i}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  marginLeft: i ? -14 : 0,
                  background: p.c,
                  border: `4px solid ${C.paper}`,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontFamily: F.sans,
                  fontWeight: 700,
                  fontSize: 22,
                  transform: `scale(${s})`,
                }}
              >
                {p.i}
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 24, color: C.ink2, opacity: prog(frame, crewAt + 8, 12), whiteSpace: "nowrap" }}>joined the trip</div>
        <div
          style={{
            marginLeft: v(30, 10),
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 999,
            background: C.white,
            border: `1.5px solid ${C.line}`,
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: 22,
            color: C.ink,
            transform: `scale(${spr(frame, calAt)})`,
            whiteSpace: "nowrap",
          }}
        >
          <CalendarCheck size={22} color={C.brand} /> {vertical ? "Calendar synced" : "15 stops added to Calendar"}
        </div>
      </div>

      {/* "Go." — a light burst that opens into the finale. */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,240,214,${lerp(0, 0.9, prog(frame, dur - 18, 18, E.inExpo))}) 0%, transparent 70%)` }} />
    </AbsoluteFill>
  );
}

export const bookCues = ({ dur, beat }: SceneProps): Cue[] => {
  const b = beats(beat, dur);
  return [
    ...[0, 1, 2].map((i) => ({ at: b.book + 2 + i * 5, sfx: "snap" as const, gain: 0.5 })),
    { at: b.share + 10, sfx: "click", gain: 0.8 },
    ...[0, 1, 2].map((i) => ({ at: b.share + 22 + i * 4, sfx: "pop" as const, gain: 0.35 })),
    { at: b.go - 4, sfx: "whoosh", gain: 0.7 },
  ];
};
