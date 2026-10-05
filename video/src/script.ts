/**
 * The film's script: every beat's scene, voiceover line and pacing. This is the
 * single source of truth for both the picture (src/timeline.ts) and the audio
 * generator (scripts/generate-audio.ts). Edit a line here, run `npm run audio`,
 * and the cut re-times itself around the new read.
 */

export type SceneId = "cold" | "chaos" | "prompt" | "build" | "map" | "guide" | "book" | "finale";
export type Variant = "film" | "teaser";
/** How a scene enters over the one before it. */
export type Transition = "cut" | "iris" | "fade" | "push";

export interface Beat {
  id: SceneId;
  vo: string;
  /** Seconds into the scene before the line starts. */
  lead: number;
  /** Minimum scene length in seconds (the animation needs this long). */
  min: number;
  /** Seconds the scene holds after the line ends. */
  tail: number;
  enter: Transition;
}

export const SCRIPT: Record<Variant, Beat[]> = {
  film: [
    { id: "cold", vo: "Every great trip starts with a feeling.", lead: 0.6, min: 4.4, tail: 0.9, enter: "cut" },
    { id: "chaos", vo: "Not twenty-three tabs, a spreadsheet, and a group chat that never decides.", lead: 0.3, min: 6.2, tail: 1.1, enter: "iris" },
    { id: "prompt", vo: "With GoRoam, you just say it.", lead: 0.5, min: 5.6, tail: 1.6, enter: "iris" },
    {
      id: "build",
      vo: "GoRoam's AI plans every day. Real places, real costs, and mornings, afternoons and evenings that actually flow.",
      lead: 0.5,
      min: 10.5,
      tail: 1.0,
      enter: "iris",
    },
    { id: "map", vo: "Every stop is pinned. The whole day's route, one tap away.", lead: 0.6, min: 6.8, tail: 1.2, enter: "fade" },
    { id: "guide", vo: "Plus a local guide. Phrases, food, hidden gems, written for your trip.", lead: 0.5, min: 7.2, tail: 1.2, enter: "push" },
    { id: "book", vo: "Book it. Share it with the crew. Go.", lead: 0.4, min: 6.0, tail: 1.3, enter: "push" },
    { id: "finale", vo: "GoRoam. The world is waiting.", lead: 3.6, min: 9.6, tail: 3.2, enter: "iris" },
  ],
  teaser: [
    { id: "prompt", vo: "Say where you want to go.", lead: 0.4, min: 4.6, tail: 0.9, enter: "cut" },
    { id: "build", vo: "GoRoam plans every day. Real places, real costs.", lead: 0.3, min: 6.0, tail: 0.6, enter: "iris" },
    { id: "map", vo: "Every stop, one tap away.", lead: 0.3, min: 3.6, tail: 0.6, enter: "fade" },
    { id: "finale", vo: "The world is waiting.", lead: 2.6, min: 6.6, tail: 2.4, enter: "iris" },
  ],
};
