/**
 * Builds GoRoam's ready-made travel packages: one full itinerary per entry in
 * src/lib/packages.ts, written to src/data/packages/<slug>.json with every
 * stop's photo already found (so the pages need no lookups at runtime).
 *
 *   npx tsx --env-file=.env.local scripts/generate-packages.ts            # missing ones
 *   npx tsx --env-file=.env.local scripts/generate-packages.ts --force    # rebuild all
 *   npx tsx --env-file=.env.local scripts/generate-packages.ts rome-5-days
 *   npx tsx --env-file=.env.local scripts/generate-packages.ts --photos   # re-find photos only
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import OpenAI from "openai";
import { SYSTEM_PROMPT, constructPrompt, parseItinerary, type ItineraryRequest } from "../src/lib/itinerary-ai";
import { PACKAGES, type TravelPackage } from "../src/lib/packages";
import { isGooglePhoto, resolveTripPhotos } from "../src/lib/place-photos";
import { normalizePreferences, type ItineraryData } from "../src/lib/trip";

const OUT = path.join(process.cwd(), "src", "data", "packages");
const file = (slug: string) => path.join(OUT, `${slug}.json`);
const args = process.argv.slice(2);
const force = args.includes("--force");
const photosOnly = args.includes("--photos");
const only = args.filter((a) => !a.startsWith("--"));

async function attachPhotos(pkg: TravelPackage, data: ItineraryData) {
  data.photos = {};
  const { photos } = await resolveTripPhotos(data, data.summary.destination || pkg.destination);
  // Google's links expire, so only the openly licensed sources are stored.
  data.photos = Object.fromEntries(Object.entries(photos).filter(([, p]) => p.url && !isGooglePhoto(p)));
  writeFileSync(file(pkg.slug), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`✓ ${pkg.slug}: ${data.itinerary.length} days, ${Object.keys(data.photos).length} stop photos, landscape=${data.summary.landscape}`);
}

async function build(pkg: TravelPackage, openai: OpenAI | null) {
  if (photosOnly || !openai) {
    return attachPhotos(pkg, JSON.parse(readFileSync(file(pkg.slug), "utf8")));
  }
  const prefs = normalizePreferences({
    companions: "couple",
    adults: 2,
    spend: pkg.spend,
    stay: pkg.stay,
    pace: pkg.pace,
    transport: pkg.transport,
    occasion: "first",
  });
  const request: ItineraryRequest = {
    source: "",
    destination: pkg.destination,
    startDate: pkg.season,
    numberOfDays: pkg.days,
    budget: pkg.budget,
    numberOfPeople: 2,
    tripType: prefs.companions,
    interests: pkg.interests,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: constructPrompt(request, prefs) },
    ],
    temperature: 0.7,
    max_tokens: 12000,
    response_format: { type: "json_object" },
  });
  const reply = completion.choices[0]?.message?.content;
  if (!reply) throw new Error("empty reply");

  const data = parseItinerary(reply, request);
  data.trip = { source: "", preferences: prefs };
  if (data.itinerary.length !== pkg.days) throw new Error(`expected ${pkg.days} days, got ${data.itinerary.length}`);
  await attachPhotos(pkg, data);
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const todo = PACKAGES.filter((p) =>
    only.length ? only.includes(p.slug) : photosOnly ? existsSync(file(p.slug)) : force || !existsSync(file(p.slug))
  );
  const openai = photosOnly ? null : process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  if (!photosOnly && !openai) {
    console.error("OPENAI_API_KEY is missing. Run with: npx tsx --env-file=.env.local scripts/generate-packages.ts");
    process.exit(1);
  }
  console.log(`Building ${todo.length} package(s)…`);
  // One at a time: each package already looks up its stops in parallel, and more
  // than that trips Wikipedia's rate limit (which quietly costs stops their photos).
  for (const pkg of todo) {
    await build(pkg, openai).catch((error) => {
      console.error(`✗ ${pkg.slug}: ${error instanceof Error ? error.message : error}`);
      process.exitCode = 1;
    });
  }
})();
