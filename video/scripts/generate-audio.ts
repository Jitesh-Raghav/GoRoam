/**
 * Generates the film's voiceover, sound effects and score with ElevenLabs.
 *
 *   npm run audio            generate whatever is missing or changed
 *   npm run voices           list the voices on your account
 *   npm run audio -- --force regenerate everything
 *
 * Needs ELEVENLABS_API_KEY in video/.env. Results land in public/audio/ with a
 * manifest.json the compositions read; the cut re-times itself to the real read.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import "dotenv/config";
import { SCRIPT, type Variant } from "../src/script";
import { EMPTY_MANIFEST, FPS, buildTimeline, voKey, type Manifest, type ScoreCue, type Word } from "../src/timeline";
import type { SfxName } from "../src/scene";

const API = "https://api.elevenlabs.io/v1";
const KEY = process.env.ELEVENLABS_API_KEY?.trim();
const OUT = join(process.cwd(), "public", "audio");
const FORCE = process.argv.includes("--force");

// Warm, unhurried narrators from the default library, in order of preference.
const PREFERRED_VOICES = ["George", "Brian", "Daniel", "Eric", "Chris"];
const FALLBACK_VOICE = "JBFqnCBsd6RMkjVDRZzb"; // George: warm, captivating storyteller
const TTS_MODEL = "eleven_multilingual_v2";
// A calm, confident read: a little expressive, never sing-song.
const VOICE_SETTINGS = { stability: 0.46, similarity_boost: 0.8, style: 0.22, use_speaker_boost: true, speed: 0.96 };

const SFX: Record<SfxName, { prompt: string; seconds: number }> = {
  whoosh: { prompt: "A smooth, airy cinematic whoosh as a small jet glides past the camera, clean, no music", seconds: 2 },
  riser: { prompt: "Soft shimmering cinematic riser swelling for two seconds, warm and magical, no drums", seconds: 2.5 },
  flutter: { prompt: "A rapid flurry of soft browser notification pops and paper flutters overlapping, light and chaotic", seconds: 2.5 },
  implode: { prompt: "Reverse whoosh sucking inward, ending in a deep soft sub thump", seconds: 1.6 },
  keys: { prompt: "Soft, satisfying laptop keyboard typing, close-mic, quiet room", seconds: 3 },
  click: { prompt: "Single soft premium UI button click", seconds: 0.5 },
  pop: { prompt: "Short soft bubbly UI pop, friendly and light", seconds: 0.5 },
  snap: { prompt: "Crisp card snapping into place, soft UI tick", seconds: 0.5 },
  chime: { prompt: "Gentle bright two-note success chime, warm, modern app", seconds: 1.5 },
  pin: { prompt: "Small soft droplet pop for a map pin landing", seconds: 0.6 },
  swoosh: { prompt: "Fast clean air swoosh for a camera move transition", seconds: 1 },
  fan: { prompt: "Quick shuffle of playing cards fanning out on a table", seconds: 1.2 },
  shimmer: { prompt: "Magical soft sparkle shimmer for a logo reveal, airy and bright", seconds: 2 },
  hit: { prompt: "Warm cinematic low boom with a soft long tail, uplifting, not scary", seconds: 3 },
  ambience: { prompt: "Gentle outdoor meadow ambience, soft breeze and distant birdsong, peaceful", seconds: 10 },
};

/**
 * Fallback score when Eleven Music isn't on the plan: three cues from the sound
 * effects model (free tier), crossfaded at scene cuts by the Soundtrack.
 */
const SCORE: Record<ScoreCue, { prompt: string; seconds: number; loop?: boolean }> = {
  intro: {
    prompt: "Cinematic intro music: a soft airy synth pad and a delicate felt piano motif, then a subtle ticking pulse slowly building gentle tension. Instrumental, no vocals, no drums.",
    seconds: 14,
  },
  bed: {
    prompt: "Seamless loop of warm, uplifting travel commercial music: bright felt piano arpeggios, soft plucked guitar, light shaker and a gentle kick, optimistic and modern, 96 BPM. Instrumental, no vocals.",
    seconds: 22,
    loop: true,
  },
  finale: {
    prompt: "Uplifting cinematic music finale: warm strings and piano swell into a big, hopeful major chord, then ring out gently into silence. Instrumental, no vocals.",
    seconds: 12,
  },
};

function musicPrompt(variant: Variant, marks: Record<string, number>) {
  const s = (n: number) => `${Math.round(n)}s`;
  if (variant === "teaser") {
    return [
      "Instrumental only, no vocals. Bright, modern, uplifting travel brand score, 104 BPM.",
      "Starts immediately with a light plucked-guitar and felt-piano groove and soft claps.",
      `Builds energy through the middle, then lifts into a warm, sunlit swell with strings at ${s(marks.finale)}`,
      "and resolves on a clean final chord that rings out. Leave space in the mids for a voiceover.",
    ].join(" ");
  }
  return [
    "Instrumental only, no vocals. Cinematic, emotional, uplifting score for a premium travel app film, 92 BPM.",
    `Opens soft and airy: a warm pad and a single felt-piano motif (0-${s(marks.chaos)}).`,
    `A ticking, slightly anxious pizzicato pulse builds tension (${s(marks.chaos)}-${s(marks.prompt)}).`,
    `Then a bright release into gentle, optimistic momentum with light percussion and plucked guitar (${s(marks.prompt)}-${s(marks.finale)}).`,
    `At ${s(marks.finale)} it swells into a full, sunlit crescendo with strings and soft drums,`,
    "resolving to a warm final chord that rings out to the end. Mixed to sit under a voiceover: no busy mid-range melody.",
  ].join(" ");
}

/* -------------------------------------------------------------------------- */

const hash = (v: unknown) => createHash("sha1").update(JSON.stringify(v)).digest("hex").slice(0, 12);
const cachePath = join(OUT, "cache.json");
const cache: Record<string, string> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
const fresh = (file: string, h: string) => !FORCE && cache[file] === h && existsSync(join(OUT, file));

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { "xi-api-key": KEY!, "Content-Type": "application/json", ...init.headers } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${path}: ${body.slice(0, 300)}`);
  }
  return res;
}

async function listVoices() {
  const res = await call("/voices");
  return ((await res.json()) as { voices: { voice_id: string; name: string; labels?: Record<string, string>; preview_url?: string }[] }).voices;
}

async function pickVoice() {
  const wanted = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (wanted) return wanted;
  try {
    const voices = await listVoices();
    for (const name of PREFERRED_VOICES) {
      const v = voices.find((x) => x.name.toLowerCase().startsWith(name.toLowerCase()));
      if (v) {
        console.log(`Narrator: ${v.name} (${v.voice_id}). Set ELEVENLABS_VOICE_ID to change it; \`npm run voices\` lists options.`);
        return v.voice_id;
      }
    }
  } catch (e) {
    console.warn("Couldn't list voices, using the default narrator:", (e as Error).message);
  }
  return FALLBACK_VOICE;
}

/** Character timings from ElevenLabs → word timings. */
function toWords(chars: string[], starts: number[], ends: number[]): Word[] {
  const words: Word[] = [];
  let cur: Word | null = null;
  chars.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: "", start: starts[i], end: ends[i] };
    cur.text += c;
    cur.end = ends[i];
  });
  if (cur) words.push(cur);
  return words;
}

async function voiceover(manifest: Manifest, voice: string) {
  mkdirSync(join(OUT, "vo"), { recursive: true });
  for (const variant of ["film", "teaser"] as Variant[]) {
    const beats = SCRIPT[variant];
    for (const [i, beat] of beats.entries()) {
      const file = `vo/${variant}-${beat.id}.mp3`;
      const body = {
        text: beat.vo,
        model_id: TTS_MODEL,
        voice_settings: VOICE_SETTINGS,
        // Neighbouring lines keep the intonation continuous across clips.
        previous_text: beats[i - 1]?.vo,
        next_text: beats[i + 1]?.vo,
      };
      const h = hash({ body, voice });
      const key = voKey(variant, beat.id);
      if (fresh(file, h) && manifest.vo[key]) {
        console.log(`  ✓ ${file} (cached)`);
        continue;
      }
      const res = await call(`/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, { method: "POST", body: JSON.stringify(body) });
      const data = (await res.json()) as {
        audio_base64: string;
        alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
      };
      writeFileSync(join(OUT, file), Buffer.from(data.audio_base64, "base64"));
      const a = data.alignment;
      const words = toWords(a.characters, a.character_start_times_seconds, a.character_end_times_seconds);
      const duration = (a.character_end_times_seconds.at(-1) ?? 0) + 0.2;
      manifest.vo[key] = { file: `audio/${file}`, duration, words };
      cache[file] = h;
      console.log(`  ♪ ${file}  ${duration.toFixed(2)}s  "${beat.vo}"`);
    }
  }
}

async function soundEffects(manifest: Manifest) {
  mkdirSync(join(OUT, "sfx"), { recursive: true });
  for (const [name, def] of Object.entries(SFX) as [SfxName, (typeof SFX)[SfxName]][]) {
    const file = `sfx/${name}.mp3`;
    const body = { text: def.prompt, duration_seconds: def.seconds, prompt_influence: 0.45 };
    const h = hash(body);
    if (fresh(file, h)) {
      manifest.sfx[name] = `audio/${file}`;
      console.log(`  ✓ ${file} (cached)`);
      continue;
    }
    try {
      const res = await call("/sound-generation", { method: "POST", body: JSON.stringify(body) });
      writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
      manifest.sfx[name] = `audio/${file}`;
      cache[file] = h;
      console.log(`  ♪ ${file}`);
    } catch (e) {
      console.warn(`  ✗ ${file}: ${(e as Error).message}`);
    }
  }
}

async function score(manifest: Manifest) {
  mkdirSync(join(OUT, "score"), { recursive: true });
  manifest.score ??= {};
  for (const [cue, def] of Object.entries(SCORE) as [ScoreCue, (typeof SCORE)[ScoreCue]][]) {
    const file = `score/${cue}.mp3`;
    const body = { text: def.prompt, duration_seconds: def.seconds, prompt_influence: 0.6, ...(def.loop ? { loop: true, model_id: "eleven_text_to_sound_v2" } : {}) };
    const h = hash(body);
    if (fresh(file, h)) {
      manifest.score[cue] = { file: `audio/${file}`, seconds: def.seconds };
      console.log(`  ✓ ${file} (cached)`);
      continue;
    }
    try {
      let res: Response;
      try {
        res = await call("/sound-generation", { method: "POST", body: JSON.stringify(body) });
      } catch (e) {
        if (!def.loop) throw e;
        // Older accounts/models don't take `loop`; a plain cue still works.
        const { loop: _l, model_id: _m, ...plain } = body as typeof body & { loop?: boolean; model_id?: string };
        res = await call("/sound-generation", { method: "POST", body: JSON.stringify(plain) });
      }
      writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
      manifest.score[cue] = { file: `audio/${file}`, seconds: def.seconds };
      cache[file] = h;
      console.log(`  ♪ ${file}  ${def.seconds}s${def.loop ? " (loop)" : ""}`);
    } catch (e) {
      console.warn(`  ✗ ${file}: ${(e as Error).message}`);
    }
  }
}

async function music(manifest: Manifest) {
  let needScore = false;
  for (const variant of ["film", "teaser"] as Variant[]) {
    // Your own licensed track always wins.
    const own = `music-${variant}.mp3`;
    if (existsSync(join(OUT, own))) {
      manifest.music[variant] = `audio/${own}`;
      console.log(`  ✓ ${own} (your track)`);
      continue;
    }
    const t = buildTimeline(variant, manifest);
    const marks = Object.fromEntries(t.beats.map((b) => [b.beat.id, b.from / FPS]));
    const seconds = t.total / FPS + 1.5;
    const body = { prompt: musicPrompt(variant, marks), music_length_ms: Math.round(seconds * 1000), model_id: "music_v1" };
    const file = `music-${variant}.eleven.mp3`;
    const h = hash(body);
    if (fresh(file, h)) {
      manifest.music[variant] = `audio/${file}`;
      console.log(`  ✓ ${file} (cached)`);
      continue;
    }
    try {
      const res = await call("/music", { method: "POST", body: JSON.stringify(body) });
      writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
      manifest.music[variant] = `audio/${file}`;
      cache[file] = h;
      console.log(`  ♪ ${file}  ${seconds.toFixed(1)}s`);
    } catch (e) {
      const msg = (e as Error).message;
      delete manifest.music[variant];
      needScore = true;
      console.warn(`  - ${file}: ${msg.startsWith("402") ? "Eleven Music needs a paid plan" : msg}`);
    }
  }
  if (needScore) {
    console.log("  Building the score from shorter cues instead (or drop your own track at public/audio/music-film.mp3):");
    await score(manifest);
  }
}

async function main() {
  if (!KEY) {
    console.error("Set ELEVENLABS_API_KEY in video/.env (see .env.example), then run `npm run audio` again.");
    process.exit(1);
  }
  if (process.argv.includes("--list-voices")) {
    for (const v of await listVoices()) {
      const l = v.labels ?? {};
      console.log(`${v.name.padEnd(22)} ${v.voice_id}  ${[l.gender, l.age, l.accent, l.description ?? l.descriptive, l.use_case].filter(Boolean).join(" · ")}`);
    }
    return;
  }
  mkdirSync(OUT, { recursive: true });
  const manifestPath = join(OUT, "manifest.json");
  const manifest: Manifest = existsSync(manifestPath) ? { ...EMPTY_MANIFEST, ...JSON.parse(readFileSync(manifestPath, "utf8")) } : structuredClone(EMPTY_MANIFEST);

  const voice = await pickVoice();
  if (manifest.voice && manifest.voice !== voice) manifest.vo = {}; // new narrator: re-read everything
  manifest.voice = voice;

  console.log("\nVoiceover");
  await voiceover(manifest, voice);
  console.log("\nSound effects");
  await soundEffects(manifest);
  console.log("\nMusic");
  await music(manifest);

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  for (const variant of ["film", "teaser"] as Variant[]) {
    console.log(`\n${variant}: ${(buildTimeline(variant, manifest).total / FPS).toFixed(1)}s with the real read.`);
  }
  console.log("\nDone. Preview with `npm run studio`, or render with `npm run render:all`.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
