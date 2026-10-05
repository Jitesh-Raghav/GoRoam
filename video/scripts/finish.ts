/**
 * After `remotion render`: loudness-normalises the cuts for social (-14 LUFS),
 * then exports the landing page's film (16:9, captions burned in) into the
 * Next app's public/video/:
 *   goroam-film.mp4 / .webm   the 53s film
 *   goroam-film-poster.jpg    a still of the itinerary
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { EMPTY_MANIFEST, buildTimeline, type Manifest } from "../src/timeline";

const OUT = join(process.cwd(), "out");
const SITE = join(process.cwd(), "..", "public", "video");
const CUTS = ["goroam-film-16x9", "goroam-film-16x9-captioned", "goroam-film-9x16", "goroam-teaser-16x9", "goroam-teaser-9x16"];

function run(cmd: string, args: string[], quiet = false) {
  const r = spawnSync("npx", ["remotion", cmd, ...args], { shell: true, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")}\n${r.stderr?.slice(-2000)}`);
  if (!quiet) process.stdout.write(".");
  return `${r.stdout ?? ""}${r.stderr ?? ""}`;
}
const q = (p: string) => `"${p}"`;

function hasAudio(file: string) {
  const out = run("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type", "-of", "csv=p=0", q(file)], true);
  return out.includes("audio");
}

/** Two-pass EBU R128 normalisation to -14 LUFS / -1.5 dBTP; video is copied untouched. */
function loudnorm(file: string) {
  const target = "I=-14:TP=-1.5:LRA=11";
  const measure = run("ffmpeg", ["-hide_banner", "-i", q(file), "-vn", "-af", `loudnorm=${target}:print_format=json`, "-c:a", "pcm_s16le", "-f", "null", "-"], true);
  const json = JSON.parse(measure.slice(measure.lastIndexOf("{"), measure.lastIndexOf("}") + 1));
  // Already on target: leave it alone rather than re-encode the audio again.
  if (Math.abs(Number(json.input_i) + 14) <= 0.5) return { before: Number(json.input_i), file, skipped: true };
  const tmp = file.replace(/\.mp4$/, ".norm.mp4");
  const filter = `loudnorm=${target}:measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=true`;
  run("ffmpeg", ["-hide_banner", "-y", "-i", q(file), "-c:v", "copy", "-af", filter, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", q(tmp)]);
  return { before: Number(json.input_i), file: replace(tmp, file), skipped: false };
}

/** Swap the new file in; if the old one is open (e.g. in a video player), keep both. */
function replace(tmp: string, file: string) {
  try {
    renameSync(tmp, file);
    return file;
  } catch {
    const alt = file.replace(/\.mp4$/, "-final.mp4");
    if (existsSync(alt)) rmSync(alt);
    renameSync(tmp, alt);
    console.warn(`\n  ! ${basename(file)} is open in another app (a video player?). Saved as ${basename(alt)}; close it and run \`npm run finish\` to replace it.`);
    return alt;
  }
}

function main() {
  const manifestPath = join(process.cwd(), "public", "audio", "manifest.json");
  const manifest: Manifest = existsSync(manifestPath) ? { ...EMPTY_MANIFEST, ...JSON.parse(readFileSync(manifestPath, "utf8")) } : EMPTY_MANIFEST;

  console.log("Loudness (-14 LUFS)");
  let film = join(OUT, "goroam-film-16x9-captioned.mp4");
  for (const cut of CUTS) {
    const file = join(OUT, `${cut}.mp4`);
    if (!existsSync(file)) {
      console.log(`  - ${cut}.mp4 not rendered, skipped`);
      continue;
    }
    if (!hasAudio(file)) {
      console.log(`  - ${cut}.mp4 has no audio yet (run \`npm run audio\` first)`);
      continue;
    }
    const { before, file: done, skipped } = loudnorm(file);
    if (cut === "goroam-film-16x9-captioned") film = done;
    console.log(skipped ? `  ✓ ${basename(done)}  already ${before.toFixed(1)} LUFS` : `\n  ✓ ${basename(done)}  ${before.toFixed(1)} → -14 LUFS`);
  }

  if (!existsSync(film)) {
    console.log("\nRun `npm run render:web` first to export the landing page film.");
    return;
  }
  mkdirSync(SITE, { recursive: true });
  console.log("\nLanding page film → public/video/");
  // Lighter web encodes of the captioned master (the masters stay in out/ for socials).
  // Remotion's frames are full-range (JPEG) colour; GPU decoders reject full-range VP9
  // ("video decode error", frozen on frame one), so web files are converted to standard TV-range BT.709.
  const tv = ["-vf", "scale=out_range=tv:out_color_matrix=bt709", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709"];
  run("ffmpeg", ["-hide_banner", "-y", "-i", q(film), ...tv, "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-profile:v", "high", "-level", "4.1", "-c:a", "copy", "-movflags", "+faststart", q(join(SITE, "goroam-film.mp4"))]);
  run("ffmpeg", ["-hide_banner", "-y", "-i", q(film), ...tv, "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "3", "-c:a", "libopus", "-b:a", "128k", q(join(SITE, "goroam-film.webm"))]);

  // Poster: the finished itinerary, just before the camera dives into Day 1.
  const build = buildTimeline("film", manifest).beats.find((b) => b.beat.id === "build")!;
  run("still", ["Film-16x9-Captioned", q(join(SITE, "goroam-film-poster.jpg")), `--frame=${build.from + build.dur - 40}`, "--image-format=jpeg", "--jpeg-quality=86", "--log=error"]);

  // Earlier landing exports this script no longer makes.
  for (const old of ["goroam-film-vertical.mp4", "goroam-film-vertical.webm", "goroam-film-vertical-poster.jpg", "goroam-film.vtt", "goroam-loop.mp4"]) rmSync(join(SITE, old), { force: true });
  console.log("\n  ✓ goroam-film.mp4, .webm, -poster.jpg");
}

main();
