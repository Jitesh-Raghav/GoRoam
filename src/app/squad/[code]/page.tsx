import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/seo/public-shell";
import { ArrowRight } from "@/components/site/icons";
import { ShareSquad } from "@/components/squad/share-squad";
import { SquadJoin } from "@/components/squad/squad-join";
import { deckCard, squadWeekends } from "@/lib/squad-match";
import { loadSquad } from "@/lib/squad-store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TONES = ["bg-[#FF8A65]", "bg-[#4FC3F7]", "bg-[#FFD54F]", "bg-[#81C784]", "bg-[#BA68C8]", "bg-[#F48FB1]", "bg-[#90A4AE]"];

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const s = await loadSquad((await params).code);
  if (!s) return { title: "Squad Match", robots: { index: false } };
  const title = `Join "${s.name}" on Squad Match`;
  const description = "Swipe on a few trips, set your budget in secret and tap the weekends you're free. GoRoam finds the trip that fits all of you.";
  return { title, description, robots: { index: false, follow: false }, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

/** A squad's invite: who's in so far, the share buttons, and this friend's 60-second flow. */
export default async function SquadInvitePage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ new?: string }> }) {
  const s = await loadSquad((await params).code);
  if (!s) notFound();
  const fresh = (await searchParams).new === "1";

  return (
    <PublicShell>
      <div className="container-x grid gap-8 pb-24 pt-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <aside className="lg:sticky lg:top-28">
          <p className="eyebrow text-brand">Squad Match</p>
          <h1 className="display mt-3 text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.02] text-ink">{s.name}</h1>
          <p className="mt-3 text-stone">
            {s.members.length === 0 ? "Nobody's in yet. Be the first, then send the link to the group." : `${s.members.length} ${s.members.length === 1 ? "friend is" : "friends are"} in. Swipe, set your secret budget and we'll find the trip that fits everyone.`}
          </p>
          {s.members.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {s.members.map((m, i) => (
                <li key={`${m.name}-${i}`} className="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm text-ink ring-1 ring-line">
                  <span className={cn("grid size-7 place-items-center rounded-full text-xs font-semibold", TONES[i % TONES.length])}>{m.name[0]?.toUpperCase()}</span>
                  {m.name}
                </li>
              ))}
            </ul>
          )}
          <div className={cn("mt-6 rounded-[22px] p-4", fresh ? "bg-sun-soft ring-1 ring-sun/40" : "bg-white ring-1 ring-line")}>
            <p className="text-sm text-ink">{fresh ? "Your squad is ready. Send this link to the group chat:" : "Invite the rest of the group:"}</p>
            <ShareSquad code={s.code} name={s.name} className="mt-3" />
          </div>
          {s.members.length > 0 && (
            <Link href={`/squad/${s.code}/result`} className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand hover:text-ink">
              See the match so far <ArrowRight className="size-4" />
            </Link>
          )}
        </aside>
        <SquadJoin code={s.code} deck={s.deck.map(deckCard)} weekends={squadWeekends(s.createdAt)} />
      </div>
    </PublicShell>
  );
}
