import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { prog, spr } from "../anim";
import { C, E, F } from "../theme";

/** Film grain and a soft vignette over everything, so flat colour never looks digital. */
export function Grain({ opacity = 0.07, vignette = 0.16 }: { opacity?: number; vignette?: number }) {
  const frame = useCurrentFrame();
  // New grain every other frame, like film.
  const seed = Math.floor(frame / 2) % 97;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, rgba(4,14,20,${vignette}) 100%)` }} />
    </AbsoluteFill>
  );
}

export interface WordsProps {
  text: string;
  /** Frame the first word starts rising. */
  start: number;
  stagger?: number;
  /** Frames each word takes to rise. */
  len?: number;
  style?: CSSProperties;
  /** Words (exact, punctuation included) to set in italic accent colour. */
  accent?: string[];
  accentColor?: string;
  /** Explicit start frame per word, e.g. synced to the voiceover. Overrides start/stagger. */
  at?: number[];
  align?: CSSProperties["textAlign"];
  /** Fade everything out from this frame. */
  exit?: number;
}

/** Kinetic type: each word rises out of its own mask, the way the site's headings reveal. */
export function Words({ text, start, stagger = 3, len = 26, style, accent = [], accentColor = C.sun, at, align = "center", exit }: WordsProps) {
  const frame = useCurrentFrame();
  const lines = text.split("\n");
  let index = 0;
  const gone = exit === undefined ? 0 : prog(frame, exit, 16, E.inOutQuart);
  return (
    <div style={{ textAlign: align, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "block", whiteSpace: "nowrap" }}>
          {line.split(" ").map((word, wi) => {
            const i = index++;
            const s = at?.[i] ?? start + i * stagger;
            const p = prog(frame, s, len);
            const isAccent = accent.includes(word);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.06em 0.04em 0.14em", margin: "-0.06em -0.04em -0.14em" }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${(1 - p) * 110 - gone * 60}%) rotate(${(1 - p) * 6}deg)`,
                    transformOrigin: "0% 100%",
                    opacity: Math.min(1, p * 1.6) * (1 - gone),
                    fontStyle: isAccent ? "italic" : undefined,
                    color: isAccent ? accentColor : undefined,
                  }}
                >
                  {word}
                  {wi < line.split(" ").length - 1 ? " " : ""}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Small uppercase mono label, like the site's eyebrows. */
export function Eyebrow({ children, color = C.stone, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", color, fontWeight: 500, ...style }}>{children}</div>
  );
}

/** A soft coloured glow blob. */
export function Glow({ x, y, r, color, opacity = 1 }: { x: number; y: number; r: number; color: string; opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

/** The macOS pointer, with a press squash. */
export function Cursor({ x, y, press = 0, opacity = 1, scale = 1 }: { x: number; y: number; press?: number; opacity?: number; scale?: number }) {
  const s = scale * (1 - press * 0.16);
  return (
    <svg
      width={44}
      height={56}
      viewBox="0 0 22 28"
      style={{ position: "absolute", left: x - 6, top: y - 4, transform: `scale(${s})`, transformOrigin: "6px 4px", opacity, filter: "drop-shadow(0 6px 10px rgba(10,30,44,0.35))", zIndex: 50 }}
    >
      <path d="M3 2 L3 22 L8 17.5 L11.5 25.5 L15 24 L11.6 16.2 L18 16 Z" fill={C.ink} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

/** A tap ripple where a press lands. */
export function Ripple({ x, y, start, color = C.brand2 }: { x: number; y: number; start: number; color?: string }) {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 22, E.outQuart);
  if (frame < start || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        transform: `scale(${0.2 + p * 1.2})`,
        opacity: 1 - p,
        zIndex: 49,
      }}
    />
  );
}

/** A pill chip that springs in. */
export function Chip({
  start,
  children,
  bg = C.white,
  color = C.ink,
  border = C.line,
  style,
}: {
  start: number;
  children: ReactNode;
  bg?: string;
  color?: string;
  border?: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const s = spr(frame, start);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 24px",
        borderRadius: 999,
        background: bg,
        color,
        border: `1.5px solid ${border}`,
        fontFamily: F.sans,
        fontWeight: 500,
        fontSize: 28,
        whiteSpace: "nowrap",
        transform: `scale(${s}) translateY(${(1 - s) * 16}px)`,
        opacity: Math.min(1, s * 2),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
