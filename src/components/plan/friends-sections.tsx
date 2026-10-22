import Link from "next/link";
import { TripCard } from "@/components/seo/trip-card";
import { ArrowRight } from "@/components/site/icons";
import { TRIP_IDEAS } from "@/lib/trip-ideas";
import { CrewBudget, type BudgetTrip } from "./crew-budget";
import { CrewSplit } from "./crew-split";
import { VotePreview } from "./vote-preview";

const GROUP_TAGS = ["adventure", "beach", "weekend", "festival"] as const;

export const GROUP_HOWTO = [
  { name: "Agree on a month, then poll dates", text: "Share two or three date options in the group chat and go with the most yeses. Long weekends book out first." },
  { name: "Set a budget per head", text: "Agree what each person spends, not counting travel, so nobody is priced out later. The calculator above shows what it buys." },
  { name: "Pick the place together", text: "Shortlist three places that fit the budget and season, and let everyone vote." },
  { name: "Book the stay early", text: "Villas and big hostel rooms for groups go fast. Book as soon as dates and the place are fixed." },
  { name: "Plan the days and vote on stops", text: "Plan the trip in GoRoam, share the link and let everyone upvote what they want to do. Swap the rest." },
  { name: "Track spending and settle up", text: "Log who paid for what in the trip wallet and settle with the fewest transfers at the end." },
];

function Heading({ eyebrow, title, id, children }: { eyebrow: string; title: string; id: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow text-brand">{eyebrow}</p>
        <h2 id={id} className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

/** The friends page's extra sections: the group features in motion, a budget calculator, trip ideas, a cost splitter and a how-to. */
export function FriendsSections({ body }: { body: string[] }) {
  const group = TRIP_IDEAS.filter((t) => t.tags.some((x) => (GROUP_TAGS as readonly string[]).includes(x)));
  const india = group.filter((t) => t.country === "India").slice(0, 4);
  const abroad = group.filter((t) => t.country !== "India").slice(0, 4);
  const budgetTrips: BudgetTrip[] = group.map((t) => ({ slug: t.slug, name: t.name, destination: t.destination, india: t.country === "India", low: t.budget[0], mid: t.budget[1] }));

  return (
    <>
      <section className="mt-16" aria-labelledby="group-h">
        <Heading eyebrow="Built for groups" title="One plan the whole group actually agrees on" id="group-h" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="space-y-4 text-[1.05rem] leading-relaxed text-stone">
            {body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <VotePreview />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="budget-h">
        <Heading eyebrow="Group budget calculator" title="What your group's money buys" id="budget-h" />
        <p className="mt-3 max-w-2xl text-stone">Slide in your group size, days and budget each. See the cost per head per day, what kind of stay you can afford, and trips that fit.</p>
        <div className="mt-6">
          <CrewBudget trips={budgetTrips} />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="ideas-h">
        <Heading eyebrow="Trip ideas for friends" title="Where groups are going this season" id="ideas-h">
          <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-ink">
            All trending trips <ArrowRight className="size-4" />
          </Link>
        </Heading>
        <h3 className="mt-6 text-sm font-medium text-stone">In India</h3>
        <ul className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {india.map((t) => (
            <li key={t.slug}>
              <TripCard t={t} />
            </li>
          ))}
        </ul>
        <h3 className="mt-8 text-sm font-medium text-stone">Abroad</h3>
        <ul className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {abroad.map((t) => (
            <li key={t.slug}>
              <TripCard t={t} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16" aria-labelledby="split-h">
        <Heading eyebrow="Free trip cost splitter" title="Who owes whom, in the fewest payments" id="split-h" />
        <p className="mt-3 max-w-2xl text-stone">Add your friends and what each paid. GoRoam works out the fair share and the simplest way to settle up. Free, no sign-up; it remembers your list on this device.</p>
        <div className="mt-6">
          <CrewSplit />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="howto-h">
        <Heading eyebrow="Step by step" title="How to plan a trip with friends" id="howto-h" />
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUP_HOWTO.map((s, i) => (
            <li key={s.name} className="rounded-[22px] bg-white p-5 ring-1 ring-line">
              <span className="font-mono text-xs text-brand">0{i + 1}</span>
              <h3 className="mt-2 text-lg text-ink">{s.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
