import type { ReactElement } from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { SCENES } from "../scenes";
import { FPS, type Manifest, type Timeline } from "../timeline";

/* The mix, as linear gains: VO at full, music bedded under it, SFX as accents. */
const MUSIC_GAP = 0.34; // ~ -9 dB between lines
const MUSIC_UNDER = 0.13; // ~ -18 dB under the voice
const MUSIC_FINALE = 0.48;
const DUCK_RAMP = 8; // frames (~250 ms)
const SFX_BASE = 0.42;

/**
 * Voiceover, music and sound design. Everything comes from the manifest that
 * `npm run audio` writes; whatever isn't there yet is simply silent.
 */
export function Soundtrack({ timeline, manifest }: { timeline: Timeline; manifest: Manifest }) {
  const spans = timeline.beats
    .filter((b) => b.voFile)
    .map((b) => [b.voFrom, b.voFrom + Math.round((manifest.vo[`${timeline.variant}-${b.beat.id}`]?.duration ?? 0) * FPS)] as const);
  const finale = timeline.beats.find((b) => b.beat.id === "finale");
  const finaleVoEnd = spans.length ? spans[spans.length - 1][1] : finale ? finale.voFrom + 60 : timeline.total;

  /** 1 while the narrator speaks, easing to 0 between lines. */
  const duck = (f: number) => {
    let d = 0;
    for (const [a, b] of spans) {
      if (f >= a && f <= b) return 1;
      const dist = f < a ? a - f : f - b;
      d = Math.max(d, 1 - dist / DUCK_RAMP);
    }
    return Math.max(0, d);
  };

  const music = manifest.music[timeline.variant];
  const musicVolume = (f: number) => {
    const gap = f > finaleVoEnd ? MUSIC_FINALE : MUSIC_GAP;
    const level = gap + (MUSIC_UNDER - gap) * duck(f);
    const fadeIn = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [timeline.total - 24, timeline.total - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return level * fadeIn * fadeOut;
  };

  return (
    <>
      {music ? <Html5Audio src={staticFile(music)} volume={musicVolume} /> : <Score timeline={timeline} manifest={manifest} volume={musicVolume} />}
      {timeline.beats.map((b) =>
        b.voFile ? (
          <Sequence key={`vo-${b.beat.id}`} from={b.voFrom} name={`VO ${b.beat.id}`} layout="none">
            <Html5Audio src={staticFile(b.voFile)} />
          </Sequence>
        ) : null
      )}
      {timeline.beats.flatMap((b) =>
        SCENES[b.beat.id]
          .cues({ dur: b.dur, variant: timeline.variant, beat: b })
          .filter((c) => manifest.sfx[c.sfx] && c.at >= 0 && c.at < b.dur + 30)
          .map((c, i) => (
            <Sequence key={`sfx-${b.beat.id}-${i}`} from={b.from + c.at} name={`SFX ${c.sfx}`} layout="none">
              <Html5Audio src={staticFile(manifest.sfx[c.sfx])} volume={SFX_BASE * (c.gain ?? 1)} />
            </Sequence>
          ))
      )}
    </>
  );
}

const XFADE = 24; // frames of crossfade between score cues
/** Generated swells are ~6s of music then a ring-out; land them so the ring-out ends with the film. */
const FINALE_BODY = 7.5;

/**
 * The fallback score: an intro under the opening, a seamless bed looped through
 * the product scenes, and a swell for the finale, crossfaded at the cuts.
 */
function Score({ timeline, manifest, volume }: { timeline: Timeline; manifest: Manifest; volume: (f: number) => number }) {
  const cues = manifest.score;
  if (!cues) return null;
  const at = (id: string) => timeline.beats.find((b) => b.beat.id === id)?.from;
  const bedFrom = at("prompt") ?? 0;
  // The swell starts late enough to carry the logo hold to the last frame; the bed covers until then.
  const finaleFrom = Math.max((at("finale") ?? timeline.total) - 6, timeline.total - Math.round(FINALE_BODY * FPS));
  const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const parts: ReactElement[] = [];
  // Intro, fading out as the bed comes in (the film only; the teaser opens on the product).
  if (cues.intro && bedFrom > 0) {
    const end = bedFrom + XFADE;
    parts.push(
      <Sequence key="intro" from={0} durationInFrames={end} name="Score intro" layout="none">
        <Html5Audio src={staticFile(cues.intro.file)} volume={(f) => volume(f) * (1 - ramp(f, bedFrom, end))} />
      </Sequence>
    );
  }
  // The bed, looped back to back until the finale.
  if (cues.bed) {
    const len = Math.round(cues.bed.seconds * FPS);
    const start = bedFrom > 0 ? bedFrom - XFADE / 2 : 0;
    const end = finaleFrom + XFADE;
    for (let k = 0, from = start; from < end; k++, from += len) {
      const o = from;
      parts.push(
        <Sequence key={`bed-${k}`} from={o} durationInFrames={Math.min(len, end - o)} name={`Score bed ${k + 1}`} layout="none">
          <Html5Audio
            src={staticFile(cues.bed.file)}
            volume={(f) => {
              const t = o + f;
              const fadeIn = bedFrom > 0 ? ramp(t, start, start + XFADE) : 1;
              return volume(t) * fadeIn * (1 - ramp(t, finaleFrom, end));
            }}
          />
        </Sequence>
      );
    }
  }
  // The finale swell, rising out of the bed.
  if (cues.finale) {
    const from = Math.max(0, finaleFrom);
    parts.push(
      <Sequence key="finale" from={from} name="Score finale" layout="none">
        <Html5Audio src={staticFile(cues.finale.file)} volume={(f) => volume(from + f) * ramp(from + f, from, from + 12) * 1.15} />
      </Sequence>
    );
  }
  return <>{parts}</>;
}
