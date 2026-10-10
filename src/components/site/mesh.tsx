import { cn } from "@/lib/utils";

export type MeshTone = "lagoon" | "sunset" | "sand";

/**
 * A soft mesh of blurred colour blobs along a card's right edge, like light
 * through frosted glass. Still at rest; on hovering the card (`mesh-host`)
 * the blobs brighten, swell and drift. Put it first inside a card with
 * `relative isolate overflow-hidden`; it sits behind the content.
 */
export function Mesh({ tone, className }: { tone: MeshTone; className?: string }) {
  return (
    <span aria-hidden className={cn("mesh", `mesh-${tone}`, className)}>
      <i />
      <i />
      <i />
    </span>
  );
}
