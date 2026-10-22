import { OG_SIZE, renderOgCard, siteCard } from "@/lib/og";
import { fridayLabel } from "@/lib/squad-match";
import { loadSquad } from "@/lib/squad-store";

export const alt = "GoRoam Squad Match";
export const size = OG_SIZE;
export const contentType = "image/png";

/** The link preview in the group chat: the invite until there's a match, then the match itself. No budgets. */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const s = await loadSquad((await params).code);
  if (!s) return renderOgCard(siteCard());
  const r = s.result;
  if (!r || s.members.length < 2) {
    return renderOgCard({
      title: ["Where should ", s.name, " go?"],
      subtitle: "Swipe on trips, set your budget in secret, tap your free weekends. GoRoam finds the trip that fits all of you.",
      panel: {
        eyebrow: "SQUAD MATCH",
        heading: s.members.length ? `${s.members.length} in so far` : "Be the first in",
        stops: s.deck.slice(0, 4).map((t, i) => ({ time: `0${i + 1}`, title: t.name })),
        footer: "Takes 60 seconds",
      },
    });
  }
  return renderOgCard({
    title: ["We're going to ", r.best.trip.name, "!"],
    subtitle: `${r.best.matchPct}% match for ${s.members.length} friends${r.date ? `, ${fridayLabel(r.date.iso)}` : ""}.${r.best.fits ? " Fits everyone's budget." : ""}`,
    panel: {
      eyebrow: "SQUAD MATCH",
      heading: s.name,
      stops: r.roles.slice(0, 4).map((x) => ({ time: x.name.slice(0, 8), title: x.title })),
      footer: r.sync !== null ? `Squad sync ${r.sync}%` : "goroam.world/squad",
    },
  });
}
