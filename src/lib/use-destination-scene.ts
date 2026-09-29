import { useEffect, useState } from "react";
import type { SceneId } from "@/components/scenes/scenes";
import { isLandscape, sceneForDestination, sceneIsCertain } from "@/lib/destinations";

// One classifier call per destination for the whole session.
const resolved = new Map<string, Promise<SceneId | null>>();

function classify(destination: string) {
  const key = destination.toLowerCase();
  let hit = resolved.get(key);
  if (!hit) {
    hit = fetch(`/api/destination-scene?q=${encodeURIComponent(destination)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (typeof d?.scene === "string" ? (d.scene as SceneId) : null))
      .catch(() => null);
    resolved.set(key, hit);
  }
  return hit;
}

/**
 * The poster scene for a destination. Answers instantly from keywords (or the
 * trip's stored landscape); when neither is sure, asks the classifier once and
 * refines. `pending` is true until that answer is in.
 */
export function useDestinationScene(destination: string, landscape?: string | null) {
  const q = destination.replace(/\s+/g, " ").trim();
  const local = sceneForDestination(q, landscape);
  const settled = !q || isLandscape(landscape) || sceneIsCertain(q);
  const [answer, setAnswer] = useState<{ q: string; scene: SceneId | null } | null>(null);

  useEffect(() => {
    if (settled) return;
    let live = true;
    // Short pause so a destination being typed isn't classified letter by letter.
    const t = window.setTimeout(() => classify(q).then((scene) => live && setAnswer({ q, scene })), resolved.has(q.toLowerCase()) ? 0 : 400);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [q, settled]);

  const done = settled || answer?.q === q;
  return { scene: (!settled && answer?.q === q && answer.scene) || local, pending: !done };
}
