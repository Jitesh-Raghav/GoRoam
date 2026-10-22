import type { Metadata } from "next";
import { AvatarStack } from "@/components/plan/group-hero";
import { RevealPreview } from "@/components/squad/reveal-preview";
import { SquadStart } from "@/components/squad/squad-start";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { Heart, Lock, MapPin, CalendarDays } from "@/components/site/icons";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";

const TITLE = "Squad Match: Decide Where to Go With Friends (Free Group Trip Decider)";
const DESCRIPTION = "Can't agree where to go? Drop one link in the group chat. Everyone swipes on trips, sets a secret budget and taps their free weekends. GoRoam finds the trip that fits the whole squad. Free, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/squad" },
  openGraph: { title: "Squad Match · GoRoam", description: DESCRIPTION, url: "/squad", type: "website" },
  twitter: { card: "summary_large_image", title: "Squad Match · GoRoam", description: DESCRIPTION },
};

const HOW = [
  { icon: Heart, title: "Everyone swipes", text: "Twelve trips in season. Right if you'd go, left if not. Same deck for the whole group." },
  { icon: Lock, title: "Budgets stay secret", text: "Each friend sets the most they'd spend. We plan within the lowest one and never say whose it is." },
  { icon: CalendarDays, title: "Tap free weekends", text: "Pick every Friday that works. We find the one most of you can make." },
  { icon: MapPin, title: "Reveal the match", text: "The trip, the dates, what it costs, each person's way there and everyone's travel personality." },
];

const FAQS = [
  { q: "How do I decide where to go with a group of friends?", a: "Start a Squad Match, send the link to the group and give everyone a minute to swipe on twelve trips, pick their vibes, set a private budget and tap the weekends they're free. GoRoam scores every trip against everyone's answers and shows the one that fits the most people within everyone's budget." },
  { q: "Can my friends see my budget?", a: "No. Your budget is stored privately and never shown to anyone. The result only says the trip fits everyone's budget; it never says whose was the lowest." },
  { q: "Do my friends need to sign up?", a: "No. They open the link, type a name and swipe. Nobody needs an account, and it works on any phone." },
  { q: "How many people can join a squad?", a: "Up to 20. The match updates every time someone new joins, so you can share the result while the slow ones catch up." },
  { q: "What happens after we get a match?", a: "Tap Plan this trip and GoRoam builds the full day-by-day itinerary for your group size, dates and budget, with places to stay and a shared wallet to split costs." },
  { q: "Is Squad Match free?", a: "Yes. Starting a squad, joining one and seeing the match are free. Your first full GoRoam trip plan is free too." },
];

export default function SquadPage() {
  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Squad Match", href: "/squad" }]}>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebApplication", name: "GoRoam Squad Match", url: absolute("/squad"), applicationCategory: "TravelApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: DESCRIPTION },
          faqPage(FAQS),
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Squad Match", path: "/squad" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <header className="relative overflow-hidden rounded-panel bg-[linear-gradient(150deg,#1B2C66_0%,#3550B0_45%,#7C9BEA_100%)] px-5 pb-10 pt-10 text-paper sm:px-10 sm:pb-14 sm:pt-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_30%_40%,#000_25%,transparent_75%)]" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-sun-2/25 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <p className="inline-flex items-center gap-3 rounded-full bg-white/12 py-1.5 pl-1.5 pr-4 text-sm text-paper/90 ring-1 ring-white/20 backdrop-blur">
                <AvatarStack size="size-7" /> New · Squad Match
              </p>
              <h1 className="display mt-6 text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.03em]">
                End the &ldquo;where should we go?&rdquo; chat <span className="text-sun-2">in 60 seconds.</span>
              </h1>
              <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-paper/80 sm:text-lg">
                One link in the group chat. Everyone swipes on trips, sets a <strong className="font-medium text-paper">secret budget</strong> and taps their free weekends. GoRoam reveals the trip that fits the whole squad.
              </p>
              <div className="mt-8 max-w-xl">
                <SquadStart source="squad-page" />
              </div>
              <p className="mt-4 text-sm text-paper/65">Free. Nobody needs to sign up.</p>
            </div>
            <RevealPreview />
          </div>
        </header>

        <section aria-labelledby="how-h" className="mt-16">
          <p className="eyebrow text-brand">How it works</p>
          <h2 id="how-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
            Four taps each. One trip everyone actually wants.
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW.map((s, i) => (
              <li key={s.title} className="rounded-[22px] bg-white p-5 ring-1 ring-line">
                <span className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-stone">0{i + 1}</span>
                </span>
                <h3 className="mt-4 text-lg text-ink">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="why-h" className="mt-16 grid gap-8 rounded-panel bg-ink p-6 text-paper sm:p-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-sun-2">Why group trips die</p>
            <h2 id="why-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08]">
              Nobody wants to be the one who says &ldquo;that&apos;s too expensive for me.&rdquo;
            </h2>
          </div>
          <div className="space-y-4 text-paper/80">
            <p>Most group trips never happen. Five people, five opinions, and the friend who is short on money goes quiet instead of saying so. The chat moves on and the trip dies.</p>
            <p>Squad Match fixes the awkward part. Everyone says what they can spend in private, so the plan fits the tightest budget without anyone having to admit it. Then the vote is a swipe, not a 200-message thread.</p>
          </div>
        </section>

        <section aria-labelledby="faq-h" className="mt-16">
          <h2 id="faq-h" className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
            Questions
          </h2>
          <div className="mt-6">
            <FaqList faqs={FAQS} />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
