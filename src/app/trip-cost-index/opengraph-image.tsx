import { OG_SIZE, renderOgCard } from "@/lib/og";
import { TRIP_IDEAS } from "@/lib/trip-ideas";
import { indexRows, median, money } from "@/lib/trip-index";

export const alt = "GoRoam Trip Cost Index 2026";
export const size = OG_SIZE;
export const contentType = "image/png";

/** The headline numbers: the median day in each index and the cheapest trips. */
export default function Image() {
  const home = indexRows("india").filter((r) => r.country === "India");
  const world = indexRows("world");
  return renderOgCard({
    title: ["What ", `${TRIP_IDEAS.length} trips`, " cost a day"],
    subtitle: `A mid-range day is a median ${money("india", median(home.map((r) => r.mid)))} in India and ${money("world", median(world.map((r) => r.mid)))} worldwide. The GoRoam Trip Cost Index 2026, free to cite.`,
    panel: {
      eyebrow: "TRIP COST INDEX 2026",
      heading: "Cheapest per day",
      stops: [
        { time: money("india", home[0].mid), title: home[0].name },
        { time: money("india", home[1].mid), title: home[1].name },
        { time: money("world", world[0].mid), title: world[0].name },
      ],
      footer: "goroam.world/trip-cost-index",
    },
  });
}
