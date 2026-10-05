import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { lerp, noise1, prog, rand, spr } from "../anim";
import { Eyebrow, Glow } from "../components/kit";
import { useFormat } from "../format";
import { wordFrame, type Cue, type SceneProps } from "../scene";
import { C, E, F } from "../theme";

type Kind = "tab" | "sheet" | "chat" | "note";

const TABS = [
  "cheap flights to tokyo",
  "hotels near shibuya",
  "Kyoto in 5 days? : r/JapanTravel",
  "is the JR Pass worth it",
  "best ramen tokyo 2026",
  "ryokan vs hotel kyoto",
  "cherry blossom forecast",
  "Tsukiji or Toyosu?",
  "tokyo weather april",
  "yen to usd",
  "fushimi inari crowds",
  "teamLab tickets sold out",
  "Booking.com · Tokyo",
  "Google Maps",
];
const CHATS = [
  ["who's paying for the hotel?", "not me lol"],
  ["is Kyoto even worth it??"],
  ["flights went up AGAIN", "ugh"],
  ["ok but what about Osaka"],
  ["can we decide tonight pls"],
];
const NOTES = ["pack adapters??", "book shinkansen!!", "visa??"];
const FAVICONS = ["#4285F4", "#FF4500", "#0B8278", "#003580", "#F4A340", "#EA4335", "#34A853"];

const KINDS: Kind[] = ["tab", "tab", "chat", "tab", "sheet", "tab", "note", "tab", "chat", "tab", "tab", "chat", "tab", "sheet", "tab", "note", "tab", "chat", "tab", "tab", "chat", "tab", "note", "tab"];

function Tab({ i }: { i: number }) {
  const title = TABS[i % TABS.length];
  const fav = FAVICONS[i % FAVICONS.length];
  return (
    <div style={{ width: 430, borderRadius: 18, background: C.white, overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 0", background: "#e9eef1" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
        ))}
        <div style={{ marginLeft: 10, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: C.white, borderRadius: "10px 10px 0 0", maxWidth: 300 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: fav, flexShrink: 0 }} />
          <div style={{ fontFamily: F.sans, fontSize: 17, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        </div>
      </div>
      <div style={{ padding: "14px 18px 20px" }}>
        <div style={{ height: 26, borderRadius: 13, background: C.paper2, marginBottom: 16, fontFamily: F.mono, fontSize: 13, color: C.stone, padding: "5px 14px" }}>
          {`https://www.google.com/search?q=${title.split(" ").slice(0, 3).join("+").toLowerCase()}`}
        </div>
        {[0.92, 0.7, 0.84, 0.55].map((w, k) => (
          <div key={k} style={{ height: 13, width: `${w * 100}%`, borderRadius: 7, background: k === 0 ? "#c8d8f6" : C.paper3, marginBottom: 11 }} />
        ))}
      </div>
    </div>
  );
}

function Sheet({ i }: { i: number }) {
  const red = new Set([7, 13, 22, 26]);
  return (
    <div style={{ width: 470, borderRadius: 16, background: C.white, overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#1e7a46", color: C.white, fontFamily: F.sans, fontSize: 18, fontWeight: 600 }}>
        <div style={{ width: 18, height: 22, borderRadius: 3, background: "#fff", opacity: 0.9 }} />
        {i % 2 ? "Japan budget (old).xlsx" : "Japan trip FINAL v7.xlsx"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", fontFamily: F.mono, fontSize: 14 }}>
        {Array.from({ length: 30 }, (_, k) => (
          <div key={k} style={{ height: 30, borderRight: `1px solid ${C.paper3}`, borderBottom: `1px solid ${C.paper3}`, padding: "6px 8px", color: red.has(k) ? C.red : C.stone, background: k < 5 ? C.paper2 : C.white, fontWeight: k < 5 ? 600 : 400 }}>
            {k < 5 ? ["Day", "Where", "Cost", "Who", "??"][k] : red.has(k) ? "#REF!" : k % 5 === 2 ? `$${(k * 37) % 400}` : k % 5 === 0 ? `${Math.floor(k / 5)}` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chat({ i }: { i: number }) {
  const msgs = CHATS[i % CHATS.length];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: i % 2 ? "flex-end" : "flex-start" }}>
      {msgs.map((m, k) => (
        <div
          key={k}
          style={{
            padding: "16px 24px",
            borderRadius: 28,
            background: (i + k) % 2 ? "#2f7cf6" : "#e9eef1",
            color: (i + k) % 2 ? C.white : C.ink,
            fontFamily: F.sans,
            fontSize: 27,
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 20px 40px -16px rgba(0,0,0,0.55)",
          }}
        >
          {m}
        </div>
      ))}
    </div>
  );
}

function Note({ i }: { i: number }) {
  return (
    <div
      style={{
        width: 230,
        height: 210,
        padding: 24,
        background: "#ffe58a",
        boxShadow: "0 24px 40px -18px rgba(0,0,0,0.6)",
        fontFamily: F.display,
        fontStyle: "italic",
        fontSize: 40,
        lineHeight: 1.05,
        color: "#5a4300",
      }}
    >
      {NOTES[i % NOTES.length]}
    </div>
  );
}

const render: Record<Kind, (i: number) => ReactNode> = {
  tab: (i) => <Tab i={i} />,
  sheet: (i) => <Sheet i={i} />,
  chat: (i) => <Chat i={i} />,
  note: (i) => <Note i={i} />,
};

/** "Not twenty-three tabs, a spreadsheet, and a group chat that never decides." */
export function TabChaos({ dur, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, cx, cy, vertical, v } = useFormat();
  const cols = v(6, 3);
  const rows = Math.ceil(KINDS.length / cols);
  const implodeAt = dur - 42;

  const items = KINDS.map((kind, i) => {
    // Jittered grid so the pile covers the frame without clumping.
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = ((col + 0.5) / cols) * W + (rand(i * 4.1) - 0.5) * (W / cols) * 0.7;
    const y = ((row + 0.5) / rows) * H + (rand(i * 2.7) - 0.5) * (H / rows) * 0.6;
    const order = Math.floor(rand(i * 9.3) * 1000);
    return { kind, i, x, y, order, rot: (rand(i * 5.5) - 0.5) * 22 };
  })
    .sort((a, b) => a.order - b.order)
    .map((it, k) => ({ ...it, enter: 2 + k * 2.1 }));

  const opened = items.filter((it) => frame >= it.enter).length;
  // Anxiety builds: the jitter grows until everything gets sucked away.
  const nerves = interpolate(frame, [0, implodeAt], [0.4, 1.6], { extrapolateRight: "clamp" });

  const lines = [
    { n: "23", rest: " tabs.", at: wordFrame(beat, 1) - 4 },
    { n: "1", rest: " spreadsheet.", at: wordFrame(beat, 4) - 4 },
    { n: "0", rest: " decisions.", at: wordFrame(beat, 10) - 4 },
  ];
  const textGone = prog(frame, implodeAt - 4, 16, E.inOutQuart);
  const flash = prog(frame, dur - 16, 14, E.outQuart);
  const scrim = prog(frame, lines[0].at - 6, 20);

  const dof = scrim * (1 - textGone);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${C.ink2} 0%, ${C.night} 75%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: dof > 0.01 ? `blur(${dof * 7}px) brightness(${1 - dof * 0.38})` : undefined }}>
      {items.map((it) => {
        const s = spr(frame, it.enter, { damping: 15, stiffness: 140, mass: 0.8 });
        const from = { x: it.x + (it.x - cx) * 1.4, y: it.y + (it.y - cy) * 1.4 };
        const jx = noise1(frame / 6, it.i) * 7 * nerves;
        const jy = noise1(frame / 6, it.i + 50) * 7 * nerves;
        const jr = noise1(frame / 8, it.i + 99) * 2.4 * nerves;
        // Implosion: further items go a beat later, then all accelerate into the centre.
        const dist = Math.hypot(it.x - cx, it.y - cy) / Math.hypot(cx, cy);
        const pull = prog(frame, implodeAt + dist * 6, 18, E.inExpo);
        const x = lerp(lerp(from.x, it.x, s) + jx, cx, pull);
        const y = lerp(lerp(from.y, it.y, s) + jy, cy, pull);
        const scale = lerp(0.6 + s * 0.4, 0.02, pull) * v(0.92, 0.82);
        return (
          <div
            key={it.i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${it.rot * (1 - s * 0.4) + jr + pull * 160}deg) scale(${scale})`,
              opacity: frame < it.enter ? 0 : Math.min(1, s * 1.5) * (1 - pull * 0.3),
              filter: pull > 0.2 ? `blur(${pull * 6}px)` : undefined,
            }}
          >
            {render[it.kind](it.i)}
          </div>
        );
      })}
      </AbsoluteFill>

      {/* Darken the pile behind the type. */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${v("55% 60%", "90% 42%")} at 50% 50%, rgba(6,19,27,0.8) 0%, rgba(6,19,27,0.45) 55%, transparent 85%)`, opacity: dof }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: v(4, 10) }}>
        {lines.map((l, k) => {
          const p = prog(frame, l.at, 22);
          const s = spr(frame, l.at);
          return (
            <div
              key={k}
              style={{
                fontFamily: F.display,
                fontSize: v(150, 136),
                lineHeight: 1,
                color: C.paper,
                transform: `translateY(${(1 - p) * 50 - textGone * 40}px) scale(${0.9 + s * 0.1})`,
                opacity: p * (1 - textGone),
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: k === 2 ? C.sun2 : C.brand2, fontStyle: "italic" }}>{l.n}</span>
              {l.rest}
            </div>
          );
        })}
      </AbsoluteFill>

      <div style={{ position: "absolute", left: v(64, 56), top: v(52, 200), padding: "12px 20px", borderRadius: 999, background: "rgba(6,19,27,0.75)", border: "1px solid rgba(255,255,255,0.1)", opacity: 1 - textGone }}>
        <Eyebrow color={C.paper}>
          Tabs open · <span style={{ color: C.sun2 }}>{Math.min(23, opened)}</span>
        </Eyebrow>
      </div>

      {/* Everything collapses into a point of light. */}
      {frame >= dur - 16 && (
        <>
          <Glow x={cx} y={cy} r={40 + flash * v(700, 600)} color="rgba(255,240,214,0.95)" opacity={1 - flash * 0.4} />
          <div
            style={{
              position: "absolute",
              left: cx - 300,
              top: cy - 300,
              width: 600,
              height: 600,
              borderRadius: "50%",
              border: `5px solid ${C.sun2}`,
              boxShadow: `0 0 40px ${C.sun}, inset 0 0 40px ${C.sun}`,
              transform: `scale(${0.05 + flash * 2.6})`,
              opacity: 1 - flash,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
}

export const chaosCues = ({ dur, beat }: SceneProps): Cue[] => [
  { at: 0, sfx: "flutter", gain: 0.8 },
  { at: wordFrame(beat, 1) - 4, sfx: "pop", gain: 0.6 },
  { at: wordFrame(beat, 4) - 4, sfx: "pop", gain: 0.6 },
  { at: wordFrame(beat, 10) - 4, sfx: "pop", gain: 0.7 },
  { at: dur - 40, sfx: "implode", gain: 1 },
];
