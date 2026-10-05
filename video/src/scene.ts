import type { ComponentType } from "react";
import type { Variant } from "./script";
import { FPS, type PlacedBeat } from "./timeline";

export interface SceneProps {
  /** Scene length in frames (it stretches to fit the voiceover). */
  dur: number;
  variant: Variant;
  beat: PlacedBeat;
}

/** A sound effect, at a frame local to its scene. */
export interface Cue {
  at: number;
  sfx: SfxName;
  /** Linear gain, 1 = as generated. */
  gain?: number;
}

export interface SceneDef {
  Component: ComponentType<SceneProps>;
  cues: (p: SceneProps) => Cue[];
}

export type SfxName =
  | "whoosh"
  | "riser"
  | "flutter"
  | "implode"
  | "keys"
  | "click"
  | "pop"
  | "snap"
  | "chime"
  | "pin"
  | "swoosh"
  | "fan"
  | "shimmer"
  | "hit"
  | "ambience";

/** Local frame where the scene's nth spoken word starts. */
export function wordFrame(beat: PlacedBeat, index: number) {
  const w = beat.words[Math.max(0, Math.min(index, beat.words.length - 1))];
  return beat.voFrom - beat.from + Math.round((w?.start ?? 0) * FPS);
}

/** Local frame of the first spoken word matching `re` (after `from`), or `fallback`. */
export function wordMatch(beat: PlacedBeat, re: RegExp, fallback: number, from = 0) {
  const i = beat.words.findIndex((w, k) => k >= from && re.test(w.text));
  return i < 0 ? fallback : wordFrame(beat, i);
}
