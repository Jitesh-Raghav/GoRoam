import { readFileSync, existsSync } from "node:fs";
import { buildTimeline, EMPTY_MANIFEST, FPS, type Manifest } from "../src/timeline";

/** Print where each beat lands: `npm run timeline`. */
const path = "public/audio/manifest.json";
const manifest: Manifest = existsSync(path) ? { ...EMPTY_MANIFEST, ...JSON.parse(readFileSync(path, "utf8")) } : EMPTY_MANIFEST;
for (const variant of ["film", "teaser"] as const) {
  const t = buildTimeline(variant, manifest);
  console.log(`\n${variant}: ${t.total} frames (${(t.total / FPS).toFixed(1)}s)${manifest.vo[`${variant}-${t.beats[0].beat.id}`] ? "" : " [estimated timings]"}`);
  for (const b of t.beats) console.log(`  ${b.beat.id.padEnd(7)} from ${String(b.from).padStart(4)}  dur ${String(b.dur).padStart(4)}  vo@${b.voFrom}`);
}
