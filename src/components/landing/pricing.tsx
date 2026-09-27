import { Check, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { PillLink } from "@/components/site/pill";
import { FREE_CREDITS, PLANS, perTrip } from "@/lib/plans";
import { SectionHeading } from "./section-heading";

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-10 bg-paper py-24 lg:py-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            index="08"
            label="Pricing"
            title={[[{ text: "Pay once." }], [{ text: "Wander ", className: "italic text-brand" }, { text: "for ages." }]]}
            description="No subscriptions and no hidden fees. Buy credits once and use them whenever you're ready — they never expire."
          />
          <Reveal delay={0.2} className="lg:mb-2">
            <p className="flex items-center gap-2 text-sm text-stone">
              <ShieldCheck className="size-4 text-brand" /> 30-day money-back guarantee on every plan
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-[32px] p-8 sm:p-10",
                  p.popular
                    ? "bg-ink text-paper shadow-[0_50px_100px_-50px_rgba(217,85,1,0.55)]"
                    : "bg-white/80 text-ink ring-1 ring-line"
                )}
              >
                {p.popular && (
                  <>
                    <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/30 blur-3xl" />
                    <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white">
                      <Sparkles className="size-3.5" /> Most popular
                    </span>
                  </>
                )}
                <p className={cn("eyebrow", p.popular ? "text-paper/60" : "text-stone")}>{p.name}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="display text-7xl leading-none">${p.price}</span>
                  <span className={cn("text-sm", p.popular ? "text-paper/60" : "text-stone")}>one-time</span>
                </div>
                <p className={cn("mt-4 font-medium", p.popular ? "text-brand-2" : "text-brand")}>
                  {p.credits} credits<span className={cn("ml-2 font-normal", p.popular ? "text-paper/50" : "text-stone")}>≈ {perTrip(p)} per itinerary</span>
                </p>
                <p className={cn("mt-2", p.popular ? "text-paper/70" : "text-stone")}>{p.tagline}</p>

                <PillLink
                  href={`/dashboard/credits?plan=${p.id}`}
                  variant={p.popular ? "brand" : "ink"}
                  size="lg"
                  className="mt-8 w-full justify-between"
                >
                  Get {p.name}
                </PillLink>

                <div className={cn("my-8 h-px", p.popular ? "bg-paper/12" : "bg-line")} />
                <ul className="space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", p.popular ? "bg-paper/10 text-brand-2" : "bg-brand-soft text-brand")}>
                        <Check className="size-3" />
                      </span>
                      <span className={p.popular ? "text-paper/85" : "text-ink/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-4 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-white/80 p-6 ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Gift className="size-5" />
              </span>
              <div>
                <p className="display text-3xl leading-none text-ink">Start free.</p>
                <p className="mt-1.5 text-stone">Every new account gets {FREE_CREDITS} credits — plan {FREE_CREDITS} full trips before you pay a cent.</p>
              </div>
            </div>
            <PillLink href="/auth" variant="outline" className="w-full justify-between sm:w-auto">
              Claim {FREE_CREDITS} free credits
            </PillLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-10 text-center text-sm text-stone">
            Need a custom plan for your business?{" "}
            <a href="mailto:hello@goroam.com" className="text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand">
              Contact us
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
