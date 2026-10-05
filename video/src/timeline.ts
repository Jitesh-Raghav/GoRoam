import { SCRIPT, type Beat, type Variant } from "./script";

/* Pure timing maths, shared by the compositions and the audio generator (no Remotion imports). */

export const FPS = 30;
/** Frames a scene overlaps the one before it when it doesn't hard-cut. */
export const OVERLAP = 14;

export interface Word {
  text: string;
  /** Seconds from the start of the line. */
  start: number;
  end: number;
}

export interface VoClip {
  file: string;
  duration: number;
  words: Word[];
}

export type ScoreCue = "intro" | "bed" | "finale";

/** What `npm run audio` produced; everything is optional so the film renders before there's a key. */
export interface Manifest {
  voice?: string;
  vo: Record<string, VoClip>;
  sfx: Record<string, string>;
  /** A full-length track per cut (Eleven Music, or your own file). */
  music: Partial<Record<Variant, string>>;
  /** Fallback score built from shorter cues, when there's no full track. */
  score?: Partial<Record<ScoreCue, { file: string; seconds: number }>>;
}

export const EMPTY_MANIFEST: Manifest = { vo: {}, sfx: {}, music: {} };

export const voKey = (variant: Variant, id: string) => `${variant}-${id}`;

const WPS = 2.55; // an unhurried, cinematic read

/** Placeholder word timings until a real read exists. */
export function estimateWords(text: string): Word[] {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => w.replace(/[^\w']/g, "").length + 2 + (/[.,]$/.test(w) ? 4 : 0));
  const total = (words.length / WPS) * 1;
  const sum = weights.reduce((a, b) => a + b, 0);
  let t = 0;
  return words.map((text, i) => {
    const len = (weights[i] / sum) * total;
    const w = { text, start: t, end: t + len * 0.92 };
    t += len;
    return w;
  });
}

export interface PlacedBeat {
  beat: Beat;
  index: number;
  from: number;
  dur: number;
  /** Absolute frame where the voiceover starts. */
  voFrom: number;
  voFile?: string;
  words: Word[];
}

export interface Timeline {
  variant: Variant;
  total: number;
  beats: PlacedBeat[];
}

const f = (s: number) => Math.round(s * FPS);

export function buildTimeline(variant: Variant, manifest: Manifest = EMPTY_MANIFEST): Timeline {
  let cursor = 0;
  const beats = SCRIPT[variant].map((beat, index) => {
    const clip = manifest.vo[voKey(variant, beat.id)];
    const words = clip?.words?.length ? clip.words : estimateWords(beat.vo);
    const voDur = clip?.duration ?? words[words.length - 1]?.end ?? 0;
    const dur = Math.max(f(beat.min), f(beat.lead + voDur + beat.tail));
    const from = index === 0 ? 0 : cursor - (beat.enter === "cut" ? 0 : OVERLAP);
    cursor = from + dur;
    return { beat, index, from, dur, voFrom: from + f(beat.lead), voFile: clip?.file, words };
  });
  return { variant, total: cursor, beats };
}

/** Absolute seconds of every spoken word, for captions and the WebVTT file. */
export function allWords(t: Timeline) {
  return t.beats.flatMap((b) => b.words.map((w) => ({ ...w, start: w.start + b.voFrom / FPS, end: w.end + b.voFrom / FPS, beat: b.beat.id })));
}
