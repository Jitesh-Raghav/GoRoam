/**
 * Re-renders only the soundtrack of each cut and swaps it into the existing
 * video, for mix changes that don't touch the picture (minutes, not a full render).
 * Run `npm run remix`; it also re-runs the finishing step.
 */
import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const CUTS: [string, string][] = [
  ["Film-16x9", "goroam-film-16x9"],
  ["Film-16x9-Captioned", "goroam-film-16x9-captioned"],
  ["Film-9x16", "goroam-film-9x16"],
  ["Teaser-16x9", "goroam-teaser-16x9"],
  ["Teaser-9x16", "goroam-teaser-9x16"],
];
const OUT = join(process.cwd(), "out");
const q = (p: string) => `"${p}"`;

function remotion(args: string[]) {
  const r = spawnSync("npx", ["remotion", ...args], { shell: true, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (r.status !== 0) throw new Error(`remotion ${args[0]} failed:\n${r.stderr?.slice(-1500)}`);
}

for (const [id, name] of CUTS) {
  const video = join(OUT, `${name}.mp4`);
  if (!existsSync(video)) {
    console.log(`- ${name}.mp4 isn't rendered yet; run \`npm run render:all\` first`);
    continue;
  }
  const audio = join(OUT, `audio-${name}.aac`);
  const tmp = join(OUT, `${name}.remix.mp4`);
  remotion(["render", id, q(audio), "--codec=aac", "--log=error"]);
  remotion(["ffmpeg", "-hide_banner", "-y", "-i", q(video), "-i", q(audio), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "copy", "-movflags", "+faststart", q(tmp)]);
  renameSync(tmp, video);
  rmSync(audio);
  console.log(`✓ ${name}.mp4 has the new mix`);
}
