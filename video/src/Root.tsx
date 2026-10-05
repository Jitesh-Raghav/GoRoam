import { Composition, getStaticFiles, staticFile, type CalculateMetadataFunction } from "remotion";
import { Film, type FilmProps } from "./Film";
import { FPS, EMPTY_MANIFEST, buildTimeline, type Manifest } from "./timeline";

/** Reads what `npm run audio` produced; before that, the film renders silent on estimated timings. */
async function loadManifest(): Promise<Manifest> {
  try {
    if (!getStaticFiles().some((f) => f.name === "audio/manifest.json")) return EMPTY_MANIFEST;
    const res = await fetch(staticFile("audio/manifest.json"));
    if (!res.ok) return EMPTY_MANIFEST;
    return { ...EMPTY_MANIFEST, ...(await res.json()) };
  } catch {
    return EMPTY_MANIFEST;
  }
}

const fit: CalculateMetadataFunction<FilmProps> = async ({ props }) => {
  const manifest = await loadManifest();
  return { durationInFrames: buildTimeline(props.variant, manifest).total, props: { ...props, manifest } };
};

const SIZES = {
  "16x9": { width: 1920, height: 1080, captions: false },
  "9x16": { width: 1080, height: 1920, captions: true },
} as const;

export function Root() {
  return (
    <>
      {(["film", "teaser"] as const).flatMap((variant) =>
        (Object.keys(SIZES) as (keyof typeof SIZES)[]).map((size) => (
          <Composition
            key={`${variant}-${size}`}
            id={`${variant === "film" ? "Film" : "Teaser"}-${size}`}
            component={Film}
            fps={FPS}
            width={SIZES[size].width}
            height={SIZES[size].height}
            durationInFrames={buildTimeline(variant).total}
            defaultProps={{ variant, manifest: EMPTY_MANIFEST, captions: SIZES[size].captions }}
            calculateMetadata={fit}
          />
        ))
      )}
      {/* The landing page's cut: widescreen, with the captions burned in. */}
      <Composition
        id="Film-16x9-Captioned"
        component={Film}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={buildTimeline("film").total}
        defaultProps={{ variant: "film", manifest: EMPTY_MANIFEST, captions: true }}
        calculateMetadata={fit}
      />
    </>
  );
}
