// Server only: draws a profile avatar with DiceBear. Kept out of the client bundle (the
// art for nine styles is ~850 KB); browsers load the finished SVG from /api/avatar.
import { createAvatar } from "@dicebear/core";
import { adventurer, avataaars, bigSmile, funEmoji, lorelei, micah, notionists, personas, thumbs } from "@dicebear/collection";
import type { AvatarChoice, AvatarStyleId } from "./avatars";

const ART: Record<AvatarStyleId, typeof notionists> = {
  notionists,
  adventurer: adventurer as typeof notionists,
  lorelei: lorelei as typeof notionists,
  micah: micah as typeof notionists,
  avataaars: avataaars as typeof notionists,
  personas: personas as typeof notionists,
  bigSmile: bigSmile as typeof notionists,
  funEmoji: funEmoji as typeof notionists,
  thumbs: thumbs as typeof notionists,
};

// Soft tints from the site palette: lagoon, sand, mist, aqua, golden hour.
const BACKGROUNDS = ["d6f3ef", "fdebd2", "e7f0f2", "c9ece6", "ffe3b0"];

/** The avatar as an SVG document. */
export function avatarSvg({ style, seed }: AvatarChoice) {
  return createAvatar(ART[style] ?? notionists, { seed, backgroundColor: BACKGROUNDS, backgroundType: ["solid"] }).toString();
}
