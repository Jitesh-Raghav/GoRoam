import { CloudRain, CreditCard, Flower2, Languages, Lightbulb, Soup, Volume2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { lerp, noise1, prog, rand, spr } from "../anim";
import { Backdrop } from "../components/backdrop";
import { Flag } from "../components/flag";
import { Eyebrow, Glow, Words } from "../components/kit";
import { useFormat } from "../format";
import { wordFrame, wordMatch, type Cue, type SceneProps } from "../scene";
import { C, E, F, SHADOW } from "../theme";
import type { PlacedBeat } from "../timeline";

/** Sakura petals drifting across the frame. */
export function Petals({ count = 26, opacity = 1 }: { count?: number; opacity?: number }) {
  const frame = useCurrentFrame();
  const { W, H } = useFormat();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const speed = 1.6 + rand(i * 3.3) * 2.2;
        const x0 = rand(i * 7.1) * (W + 400) - 200;
        const y = ((rand(i * 1.9) * (H + 200) + frame * speed) % (H + 200)) - 100;
        const x = x0 + Math.sin((frame + i * 20) / 30) * 40 + frame * 0.8;
        const r = 9 + rand(i * 4.4) * 9;
        const spin = frame * (2 + rand(i) * 4) + i * 40;
        return (
          <g key={i} transform={`translate(${x % (W + 200)} ${y}) rotate(${spin}) scale(1 ${0.55 + 0.45 * Math.abs(Math.sin(spin / 40))})`}>
            <path d={`M0 ${-r}C${r * 0.9} ${-r * 0.6} ${r * 0.8} ${r * 0.6} 0 ${r}C${-r * 0.8} ${r * 0.6} ${-r * 0.9} ${-r * 0.6} 0 ${-r}Z`} fill={i % 3 ? "#f6b6c1" : "#fbd3da"} opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

function RamenBowl({ size }: { size: number }) {
  const frame = useCurrentFrame();
  const steam = (k: number) => `M${70 + k * 30} 70 q-14 -18 0 -34 q14 -16 0 -34`;
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 220 172">
      {[0, 1, 2].map((k) => (
        <path key={k} d={steam(k)} stroke="#d9c9b2" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.4 + 0.4 * Math.sin(frame / 8 + k)} transform={`translate(0 ${Math.sin(frame / 10 + k) * 4})`} />
      ))}
      <ellipse cx={110} cy={96} rx={98} ry={26} fill="#e8a25a" />
      <ellipse cx={110} cy={96} rx={88} ry={20} fill="#f3c486" />
      {/* noodles */}
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={`M${40 + k * 10} ${98 - k}q20 -10 40 0t40 0t40 0`} stroke="#f8e0a6" strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      <rect x={140} y={74} width={34} height={30} rx={4} fill="#20352b" transform="rotate(-12 157 89)" />
      <ellipse cx={82} cy={90} rx={20} ry={13} fill="#fff8ea" />
      <ellipse cx={82} cy={90} rx={9} ry={7} fill="#f2a33a" />
      <ellipse cx={122} cy={86} rx={16} ry={9} fill="#d77f6b" />
      <circle cx={104} cy={102} r={4} fill="#5ba06a" />
      <circle cx={112} cy={99} r={3.5} fill="#5ba06a" />
      <path d="M12 96 Q20 168 110 168 Q200 168 208 96 Z" fill={C.ink2} />
      <path d="M30 120 Q110 140 190 120" stroke="#c0503e" strokeWidth={6} fill="none" opacity={0.85} />
      <path d="M150 10 L196 116 M166 6 L206 114" stroke="#8a5a32" strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

function Card({ children, bg = C.white, color = C.ink, w, h }: { children: ReactNode; bg?: string; color?: string; w: number; h: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 34, background: bg, color, boxShadow: SHADOW, padding: 34, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {children}
    </div>
  );
}

function Tag({ icon: Icon, children, color = C.stone }: { icon: LucideIcon; children: ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={22} color={color} />
      <Eyebrow color={color} style={{ fontSize: 19 }}>
        {children}
      </Eyebrow>
    </div>
  );
}

function cardsTiming(beat: PlacedBeat) {
  // Each card lifts as the narrator names it.
  const phrases = wordMatch(beat, /^phrases/i, 40);
  const food = wordMatch(beat, /^food/i, phrases + 14);
  const gems = wordMatch(beat, /^gems/i, food + 14);
  const trip = wordMatch(beat, /^trip/i, gems + 18);
  return [phrases, food, gems, trip];
}

/** "Plus a local guide. Phrases, food, hidden gems, written for your trip." */
export function Guide({ dur, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, vertical, v } = useFormat();
  const named = cardsTiming(beat);
  const cw = 352;
  const ch = 500;
  const center = vertical ? { x: W / 2, y: 1040 } : { x: 1312, y: 600 };
  const spread = v(256, 0);
  const deckScale = 1.45;
  const fanAt = 8;
  const bars = (k: number) => 0.3 + 0.7 * Math.abs(Math.sin(frame / 4 + k * 1.3));

  const cards: ReactNode[] = [
    <Card key="phrase" w={cw} h={ch}>
      <Tag icon={Languages} color={C.brand}>
        Say it like a local
      </Tag>
      <div style={{ fontFamily: '"Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif', fontWeight: 600, fontSize: 42, lineHeight: 1.2, marginTop: 34, color: C.ink }}>ありがとう ございます</div>
      <div style={{ fontFamily: F.display, fontStyle: "italic", fontSize: 44, marginTop: 14, color: C.brand }}>Arigatō gozaimasu</div>
      <div style={{ fontFamily: F.sans, fontSize: 24, color: C.stone, marginTop: 8 }}>Thank you, politely</div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderRadius: 999, background: C.brandSoft, alignSelf: "flex-start" }}>
        <Volume2 size={26} color={C.brand} />
        <div style={{ display: "flex", gap: 5, alignItems: "center", height: 28 }}>
          {Array.from({ length: 9 }, (_, k) => (
            <div key={k} style={{ width: 5, height: 28 * bars(k), borderRadius: 3, background: C.brand }} />
          ))}
        </div>
      </div>
    </Card>,
    <Card key="dish" w={cw} h={ch}>
      <Tag icon={Soup} color="#c8741f">
        Eat this
      </Tag>
      <div style={{ display: "flex", justifyContent: "center", margin: "18px 0 6px", background: C.sunSoft, borderRadius: 24, padding: "18px 0 8px" }}>
        <RamenBowl size={200} />
      </div>
      <div style={{ fontFamily: F.display, fontSize: 50, lineHeight: 1, marginTop: 10 }}>Tonkotsu ramen</div>
      <div style={{ fontFamily: F.sans, fontSize: 22, color: C.stone, marginTop: 10, lineHeight: 1.3 }}>Rich pork-bone broth. Try it at Ichiran, Shibuya.</div>
    </Card>,
    <Card key="event" w={cw} h={ch} bg="linear-gradient(160deg, #fde3e8 0%, #f8c9d3 60%, #f2b3c2 100%)">
      <Tag icon={Flower2} color="#b2475f">
        While you&apos;re there
      </Tag>
      <div style={{ fontFamily: F.display, fontSize: 70, lineHeight: 0.95, marginTop: 40, color: "#5a1f2e" }}>
        Hanami
        <br />
        <span style={{ fontStyle: "italic" }}>season</span>
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 23, color: "#7a3b4b", marginTop: 18, lineHeight: 1.35 }}>Cherry-blossom picnics in Ueno Park, peaking the week you land.</div>
      <div style={{ marginTop: "auto", fontFamily: F.mono, fontSize: 19, letterSpacing: "0.14em", color: "#b2475f" }}>LATE MAR – EARLY APR</div>
    </Card>,
    <Card key="tip" w={cw} h={ch} bg={C.ink} color={C.paper}>
      <Tag icon={Lightbulb} color={C.sun2}>
        Insider tip
      </Tag>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, padding: "16px 16px", borderRadius: 22, background: "rgba(255,255,255,0.07)" }}>
        <CloudRain size={34} color={C.brand2} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 24, whiteSpace: "nowrap" }}>18° · rain at 4 pm</div>
          <div style={{ fontFamily: F.sans, fontSize: 20, color: C.stone2 }}>Day 2 · pack a compact umbrella</div>
        </div>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 42, lineHeight: 1.05, marginTop: 28 }}>
        Tap one <span style={{ fontStyle: "italic", color: C.sun2 }}>Suica</span> card for every train and konbini.
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, fontFamily: F.sans, fontSize: 21, color: C.stone2 }}>
        <CreditCard size={22} color={C.sun2} /> Saves ~20 min a day
      </div>
    </Card>,
  ];

  const headlineAt = Math.max(0, wordFrame(beat, 0) - 6);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop warm />
      <Glow x={center.x} y={center.y} r={v(700, 640)} color="rgba(246,182,193,0.45)" />
      <Glow x={W * 0.1} y={H * 0.15} r={v(500, 420)} color="rgba(244,163,64,0.25)" />
      <Petals count={vertical ? 22 : 30} />

      <div style={{ position: "absolute", left: v(120, 0), right: vertical ? 0 : undefined, top: v(300, 250), textAlign: vertical ? "center" : "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: vertical ? "center" : "flex-start", opacity: prog(frame, headlineAt, 16) }}>
          <Flag size={40} />
          <Eyebrow color="#b8741f">Local guide · Japan</Eyebrow>
        </div>
        <Words
          text={vertical ? "A local guide, written\nfor your trip." : "A local guide,\nwritten for\nyour trip."}
          start={headlineAt + 4}
          stagger={3}
          accent={["local", "your"]}
          accentColor="#c8741f"
          align={vertical ? "center" : "left"}
          style={{ fontFamily: F.display, fontSize: v(104, 92), lineHeight: 1.0, color: C.ink, marginTop: 22, letterSpacing: "-0.015em" }}
        />
        {!vertical && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40, maxWidth: 640 }}>
            {["Phrases", "Food", "Etiquette", "Events", "Hidden gems", "Souvenirs"].map((t, i) => {
              const s = spr(frame, headlineAt + 24 + i * 3);
              return (
                <div key={t} style={{ padding: "10px 20px", borderRadius: 999, border: "1.5px solid rgba(184,116,31,0.3)", background: "rgba(255,255,255,0.6)", fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: "#8a5a1f", transform: `scale(${s})`, opacity: s }}>
                  {t}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cards.map((card, i) => {
        const rise = spr(frame, fanAt + i * 3, { damping: 18, stiffness: 110 });
        const float = noise1(frame / 40, i) * 8;
        if (vertical) {
          // A swipeable deck: each card the narrator names comes to the front, the last one flicks to the back.
          const swipes = [1, 2, 3].map((k) => spr(frame, named[k] - 6, { damping: 20, stiffness: 120 }));
          const S = swipes.reduce((a, b) => a + b, 0);
          const own = i < 3 ? swipes[i] : 0;
          const rank = i - S + 4 * own;
          const away = Math.sin(own * Math.PI);
          const rots = [0, -5, 5, -3];
          const rr = Math.max(0, Math.min(3, rank));
          const rot = lerp(rots[Math.floor(rr)], rots[Math.ceil(rr)], rr - Math.floor(rr)) - away * 16;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: center.x - cw / 2 - away * 760,
                top: center.y - ch / 2 - rank * 46 + (1 - rise) * H * 0.8 + float,
                transform: `rotate(${rot}deg) scale(${deckScale * (1 - rank * 0.06)})`,
                transformOrigin: "50% 50%",
                zIndex: Math.round(40 - rank * 10),
                filter: `drop-shadow(0 30px 40px rgba(90,50,10,${0.22 - rank * 0.04}))`,
              }}
            >
              {card}
            </div>
          );
        }
        // Rise as a stack, then fan out like a hand of cards; the named card lifts to the front.
        const fan = spr(frame, fanAt + 18, { damping: 16, stiffness: 90 });
        const k = i - 1.5;
        const lift = interpolate(frame, [named[i] - 4, named[i] + 8, named[i] + 34], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E.outQuart });
        const x = center.x + k * spread * fan - cw / 2;
        const y = center.y - ch / 2 + Math.abs(k) * 26 * fan + (1 - rise) * (H * 0.8) - lift * 60 + float;
        const rot = k * 7 * fan + (1 - rise) * (rand(i) * 20 - 10);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `rotate(${rot * (1 - lift * 0.6)}deg) scale(${lerp(0.96, 1.06, lift)})`,
              transformOrigin: "50% 100%",
              zIndex: Math.round(lift * 10) + i,
              filter: `drop-shadow(0 ${20 + lift * 30}px ${30 + lift * 20}px rgba(90,50,10,${0.15 + lift * 0.15}))`,
            }}
          >
            {card}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

export const guideCues = ({ beat }: SceneProps): Cue[] => {
  const named = cardsTiming(beat);
  return [{ at: 6, sfx: "fan", gain: 0.9 }, ...named.map((at) => ({ at: at - 4, sfx: "pop" as const, gain: 0.4 }))];
};
