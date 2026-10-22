import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GuideCover } from "@/components/seo/guide-media";
import { PublicShell } from "@/components/seo/public-shell";
import { ArrowRight, BedDouble, CalendarDays, Lock, MapPin, Users } from "@/components/site/icons";
import { CountUp, IfNotJoined, LiveRefresh, PlanLink, Rise } from "@/components/squad/reveal-bits";
import { ShareSquad } from "@/components/squad/share-squad";
import { isIndia, travelOptionLinks } from "@/lib/booking";
import { plannerHref } from "@/lib/prompt-parse";
import { USD_TO_INR, fridayLabel } from "@/lib/squad-match";
import { loadSquad } from "@/lib/squad-store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TONES = ["bg-[#FF8A65]", "bg-[#4FC3F7]", "bg-[#FFD54F]", "bg-[#81C784]", "bg-[#BA68C8]", "bg-[#F48FB1]", "bg-[#90A4AE]"];
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const usd = (n: number) => `$${Math.round(n / USD_TO_INR).toLocaleString("en-US")}`;
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const s = await loadSquad((await params).code);
  const title = s?.result ? `${s.name}: we're going to ${s.result.best.trip.name}!` : "Squad Match";
  const description = s?.result ? `${s.result.best.matchPct}% match for ${s.members.length} friends. Start your own Squad Match on GoRoam.` : "Find the trip your whole group wants.";
  return { title, description, robots: { index: false, follow: false }, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

/** The reveal: the trip that fits everyone, when, for how much, each person's way there and the squad's personalities. */
export default async function SquadResultPage({ params }: { params: Promise<{ code: string }> }) {
  const s = await loadSquad((await params).code);
  if (!s) notFound();
  if (!s.result) redirect(`/squad/${s.code}`);
  const { best, runnersUp, date, sync, roles } = s.result;
  const t = best.trip;
  const n = s.members.length;
  const depart = date?.iso ?? addDays(new Date().toISOString().slice(0, 10), 14);
  const back = addDays(depart, t.days - 1);
  const plan = plannerHref({
    destination: t.destination,
    days: t.days,
    startDate: depart,
    budget: Math.round(best.perHead * n),
    budgetCurrency: "INR",
    companions: "friends",
    interests: [],
    diet: [],
    notes: `A ${t.days}-day trip for a group of ${n} friends, about ${inr(best.perHead)} each, not counting getting there.`,
  });

  return (
    <PublicShell>
      <LiveRefresh />
      <div className="container-x pb-24 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow text-brand">
            Squad Match · {s.name}
          </p>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-ink ring-1 ring-line">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#25D366] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[#25D366]" />
            </span>
            {n} {n === 1 ? "friend" : "friends"} in · updates live
          </p>
        </div>

        <IfNotJoined code={s.code}>
          <Link href={`/squad/${s.code}`} className="mt-5 flex items-center justify-between gap-3 rounded-[22px] bg-sun-soft px-5 py-4 text-ink ring-1 ring-sun/40">
            <span>
              <span className="font-medium">You haven&apos;t swiped yet.</span> Add your vote and secret budget so the match counts you.
            </span>
            <ArrowRight className="size-5 shrink-0" />
          </Link>
        </IfNotJoined>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Rise>
            <div className="overflow-hidden rounded-panel bg-white ring-1 ring-line">
              <GuideCover destination={t.destination} landscape={t.landscape} width={1200} className="h-72 sm:h-96">
                <div className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-paper/80">{n > 1 ? "Your squad's match" : "Your top pick so far"}</p>
                  <h1 className="display mt-2 text-[clamp(2.8rem,7vw,5rem)] leading-[0.95]">{t.name}</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-paper/85">
                    <MapPin className="size-4" /> {t.region === t.country ? t.country : `${t.region}, ${t.country}`}
                  </p>
                </div>
                <span className="absolute right-5 top-5 rounded-full bg-sun-2 px-4 py-2 text-lg font-semibold text-ink shadow-lg">
                  <CountUp to={best.matchPct} /> match
                </span>
              </GuideCover>
              <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-2xl bg-paper-2/60 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-stone">
                    <CalendarDays className="size-4 text-brand" /> When
                  </p>
                  <p className="mt-1 text-lg text-ink">{date ? fridayLabel(date.iso) : "Pick dates"}</p>
                  <p className="text-sm text-stone">{date ? `${date.free} of ${n} free · ${t.days} days` : `${t.days} days`}</p>
                </div>
                <div className={cn("rounded-2xl p-4", best.fits ? "bg-[#25D366]/10" : "bg-[#FF5A5F]/10")}>
                  <p className="flex items-center gap-1.5 text-xs text-stone">
                    <Lock className="size-4 text-[#1F7A3B]" /> Budget
                  </p>
                  <p className="mt-1 text-lg text-ink">
                    {inr(best.perHead)} <span className="text-sm text-stone">({usd(best.perHead)}) each</span>
                  </p>
                  <p className="text-sm text-stone">{best.fits ? `${best.tier} · fits everyone's budget` : "A stretch for someone. Go budget."}</p>
                </div>
                <div className="rounded-2xl bg-paper-2/60 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-stone">
                    <Users className="size-4 text-brand" /> Votes
                  </p>
                  <p className="mt-1 text-lg text-ink">
                    {best.likedBy} of {n} swiped right
                  </p>
                  <p className="text-sm text-stone">{sync !== null ? `Squad sync ${sync}%` : "Waiting for more friends"}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:items-center sm:p-6">
                <PlanLink href={plan} people={n} className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-paper transition-colors hover:bg-brand">
                  Plan this trip for {n} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </PlanLink>
                <Link href={`/trips/${t.slug}`} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-ink ring-1 ring-line hover:bg-paper-2">
                  <BedDouble className="size-4 text-brand" /> Day plan, stays and costs
                </Link>
              </div>
            </div>
          </Rise>

          <div className="grid content-start gap-6">
            <Rise delay={0.15}>
              <div className="rounded-panel bg-ink p-5 text-paper sm:p-6">
                <p className="eyebrow text-sun-2">The squad</p>
                <ul className="mt-4 space-y-3">
                  {roles.map((r, i) => (
                    <li key={`${r.name}-${i}`} className="flex items-start gap-3">
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-ink", TONES[i % TONES.length])}>{r.name[0]?.toUpperCase()}</span>
                      <span>
                        <span className="text-paper/60">{r.name}</span>
                        <span className="block text-[1.05rem]">
                          {r.emoji} {r.title}
                        </span>
                        <span className="block text-sm text-paper/60">{r.line}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-sm text-paper/70">Show the group:</p>
                  <ShareSquad code={s.code} name={s.name} tone="dark" className="mt-3" />
                </div>
              </div>
            </Rise>

            <Rise delay={0.25}>
              <div className="rounded-panel bg-white p-5 ring-1 ring-line sm:p-6">
                <p className="eyebrow text-brand">Getting there</p>
                <ul className="mt-4 space-y-3">
                  {s.members.map((m, i) => {
                    const mode = isIndia(m.homeCity) && t.country === "India" ? "train" : "flight";
                    const links = travelOptionLinks({ mode, from: m.homeCity, to: t.destination }, { origin: m.homeCity, destination: t.destination, depart, back, people: 1 });
                    return (
                      <li key={`${m.name}-${i}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-ink">
                          {m.name} <span className="text-stone">from {m.homeCity.split(",")[0]}</span>
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          {links.slice(0, 2).map((l) => (
                            <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer sponsored" className="rounded-full bg-paper-2 px-3 py-1 text-xs text-ink hover:bg-brand-soft">
                              {l.name}
                            </a>
                          ))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Rise>
          </div>
        </div>

        {runnersUp.length > 0 && (
          <section aria-labelledby="next-h" className="mt-12">
            <h2 id="next-h" className="display text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
              Close behind
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {runnersUp.map((r) => (
                <li key={r.trip.slug}>
                  <Link href={`/trips/${r.trip.slug}`} className="group block overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
                    <GuideCover destination={r.trip.destination} landscape={r.trip.landscape} width={600} credit={false} className="h-36">
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink">{r.matchPct}%</span>
                    </GuideCover>
                    <p className="flex items-center justify-between p-4 text-ink">
                      {r.trip.name}
                      <span className="text-xs text-stone">{r.fits ? "fits budget" : "over budget"}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 rounded-panel bg-[linear-gradient(150deg,#1B2C66_0%,#3550B0_60%,#7C9BEA_100%)] p-6 text-paper sm:p-10">
          <h2 className="display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05]">Got another group chat that can&apos;t decide?</h2>
          <Link href="/squad" className="mt-5 inline-flex items-center gap-2 rounded-full bg-sun-2 px-6 py-3.5 text-ink hover:bg-white">
            Start a new Squad Match <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
