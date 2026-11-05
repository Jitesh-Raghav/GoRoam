import { avatarSvg } from "@/lib/avatar-art";
import { AVATAR_STYLES, cleanSeed, type AvatarStyleId } from "@/lib/avatars";

/**
 * A profile avatar as SVG. The same style and seed always draw the same picture,
 * so it's cached for good by the browser and the CDN.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ style: string; seed: string }> }) {
  const { style, seed } = await params;
  const id = (AVATAR_STYLES.some((a) => a.id === style) ? style : "notionists") as AvatarStyleId;
  const clean = cleanSeed(decodeURIComponent(seed).replace(/\.svg$/, "")) || "traveller";
  return new Response(avatarSvg({ style: id, seed: clean }), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
