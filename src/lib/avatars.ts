/**
 * Profile avatars drawn by DiceBear, stored on the user's `image` field as
 * "avatar:<style>:<seed>". Anything else there (a Google photo URL, or
 * nothing) falls back to a generated avatar, so no account photo is ever shown.
 */

// The art itself is drawn on the server (lib/avatar-art.ts, /api/avatar) so it never ships to browsers.
export const AVATAR_STYLES = [
  { id: "notionists", label: "Sketch" },
  { id: "adventurer", label: "Adventurer" },
  { id: "lorelei", label: "Lorelei" },
  { id: "micah", label: "Micah" },
  { id: "avataaars", label: "Cartoon" },
  { id: "personas", label: "Personas" },
  { id: "bigSmile", label: "Big smile" },
  { id: "funEmoji", label: "Emoji" },
  { id: "thumbs", label: "Thumbs" },
] as const;

export type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];

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

/** Where the avatar's picture is served from (drawn once on the server, then cached for good). */
export const avatarUri = (choice: AvatarChoice) => `/api/avatar/${choice.style}/${encodeURIComponent(cleanSeed(choice.seed) || "traveller")}`;

/** The user's chosen avatar, or a stable default drawn from who they are. */
export function avatarFor(image: string | null | undefined, fallbackSeed: string | null | undefined) {
  return parseAvatar(image) ?? { style: "notionists" as AvatarStyleId, seed: cleanSeed(fallbackSeed || "traveller") || "traveller" };
}

export const randomSeed = () => Math.random().toString(36).slice(2, 10);
