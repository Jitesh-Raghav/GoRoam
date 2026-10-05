import { interpolate, spring, type SpringConfig } from "remotion";
import { E } from "./theme";
import { FPS } from "./timeline";

type Ease = (t: number) => number;

/** 0→1 over [start, start + len], eased and clamped. */
export const prog = (frame: number, start: number, len: number, ease: Ease = E.outExpo) =>
  interpolate(frame, [start, start + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** 1→0 over the last `len` frames of a `dur`-frame scene. */
export const outro = (frame: number, dur: number, len: number, ease: Ease = E.inOutQuart) => 1 - prog(frame, dur - len, len, ease);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** UI pop: a quick spring with a little overshoot. */
export const POP: Partial<SpringConfig> = { damping: 13, stiffness: 160, mass: 0.7 };
/** Settle: heavier, no wobble. */
export const SETTLE: Partial<SpringConfig> = { damping: 22, stiffness: 90, mass: 1 };
/** Bouncy: monuments, pins. */
export const BOUNCE: Partial<SpringConfig> = { damping: 9, stiffness: 120, mass: 0.8 };

export const spr = (frame: number, start: number, config: Partial<SpringConfig> = POP, durationInFrames?: number) =>
  spring({ frame: frame - start, fps: FPS, config, durationInFrames });

/** Deterministic pseudo-random in [0, 1) for an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth 1-D value noise in [-1, 1], for drift and jitter. */
export const noise1 = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return lerp(rand(i + seed * 101) * 2 - 1, rand(i + 1 + seed * 101) * 2 - 1, u);
};

export const sec = (s: number) => Math.round(s * FPS);
