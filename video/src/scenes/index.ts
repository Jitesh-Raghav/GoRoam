import type { SceneId } from "../script";
import type { SceneDef } from "../scene";
import { BookShare, bookCues } from "./BookShare";
import { Build, buildCues } from "./Build";
import { ColdOpen, coldCues } from "./ColdOpen";
import { Finale, finaleCues } from "./Finale";
import { Guide, guideCues } from "./Guide";
import { MapScene, mapCues } from "./MapScene";
import { Prompt, promptCues } from "./Prompt";
import { TabChaos, chaosCues } from "./TabChaos";

export const SCENES: Record<SceneId, SceneDef> = {
  cold: { Component: ColdOpen, cues: coldCues },
  chaos: { Component: TabChaos, cues: chaosCues },
  prompt: { Component: Prompt, cues: promptCues },
  build: { Component: Build, cues: buildCues },
  map: { Component: MapScene, cues: mapCues },
  guide: { Component: Guide, cues: guideCues },
  book: { Component: BookShare, cues: bookCues },
  finale: { Component: Finale, cues: finaleCues },
};
