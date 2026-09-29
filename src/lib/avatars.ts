import { createAvatar } from "@dicebear/core";
import { adventurer, avataaars, bigSmile, funEmoji, lorelei, micah, notionists, personas, thumbs } from "@dicebear/collection";

/**
 * Profile avatars drawn by DiceBear, stored on the user's `image` field as
 * "avatar:<style>:<seed>". Anything else there (a Google photo URL, or
 * nothing) falls back to a generated avatar, so no account photo is ever shown.
 */

export const AVATAR_STYLES = [
  { id: "notionists", label: "Sketch", style: notionists },
  { id: "adventurer", label: "Adventurer", style: adventurer },
  { id: "lorelei", label: "Lorelei", style: lorelei },
  { id: "micah", label: "Micah", style: micah },
  { id: "avataaars", label: "Cartoon", style: avataaars },
  { id: "personas", label: "Personas", style: personas },
  { id: "bigSmile", label: "Big smile", style: bigSmile },
  { id: "funEmoji", label: "Emoji", style: funEmoji },
  { id: "thumbs", label: "Thumbs", style: thumbs },
] as const;

export type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];

// Soft tints from the site palette: lagoon, sand, mist, aqua, golden hour.
const BACKGROUNDS = ["d6f3ef", "fdebd2", "e7f0f2", "c9ece6", "ffe3b0"];
const PREFIX = "avatar:";

export interface AvatarChoice {
  style: AvatarStyleId;
  seed: string;
}

const isStyle = (s: string): s is AvatarStyleId => AVATAR_STYLES.some((a) => a.id === s);

export const cleanSeed = (seed: string) => seed.replace(/[^\w.@+-]/g, "").slice(0, 64);

export function parseAvatar(image: string | null | undefined): AvatarChoice | null {
  if (!image?.startsWith(PREFIX)) return null;
  const [style, ...rest] = image.slice(PREFIX.length).split(":");
  const seed = cleanSeed(rest.join(":"));
  return isStyle(style) && seed ? { style, seed } : null;
}

export const formatAvatar = ({ style, seed }: AvatarChoice) => `${PREFIX}${style}:${cleanSeed(seed)}`;

const uris = new Map<string, string>();

/** A data: URI for an avatar, memoised because the same few are drawn on every page. */
export function avatarUri(choice: AvatarChoice) {
  const key = `${choice.style}:${choice.seed}`;
  let uri = uris.get(key);
  if (!uri) {
    const def = AVATAR_STYLES.find((a) => a.id === choice.style) ?? AVATAR_STYLES[0];
    // Each style has its own options type; the shared ones are all we set.
    uri = createAvatar(def.style as typeof notionists, { seed: choice.seed, backgroundColor: BACKGROUNDS, backgroundType: ["solid"] }).toDataUri();
    uris.set(key, uri);
  }
  return uri;
}

/** The user's chosen avatar, or a stable default drawn from who they are. */
export function avatarFor(image: string | null | undefined, fallbackSeed: string | null | undefined) {
  return parseAvatar(image) ?? { style: "notionists" as AvatarStyleId, seed: cleanSeed(fallbackSeed || "traveller") || "traveller" };
}

export const randomSeed = () => Math.random().toString(36).slice(2, 10);
