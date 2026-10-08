import { OG_SIZE, renderOgCard, siteCard } from "@/lib/og";

export const alt = "GoRoam: day-by-day AI trip plans with real places and honest budgets";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard(siteCard());
}
