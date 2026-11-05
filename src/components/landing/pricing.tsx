import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "@/components/site/icons";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { PillLink } from "@/components/site/pill";
import { PackEach, PackPrice } from "@/components/site/pack-price";
import { COMPANY } from "@/lib/company";
import { PLANS, freeTrips } from "@/lib/plans";
import { SectionHeading } from "./section-heading";

/** Best value first: the Year Pass, then the Week Pass. */
const ORDER = [...PLANS].sort((a, b) => Number(!!b.popular) - Number(!!a.popular));

/**
 * The two passes as plain cards (the Year Pass in ink), a quiet "start free" line, and
 * a signed word from the founder in place of testimonials.
 */
export function Pricing() {
  const founder = COMPANY.founder;
  return (
    <section id="pricing" className="relative scroll-mt-10 py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            label="Pricing"
            title={[[{ text: "One price." }], [{ text: "Unlimited " }, { text: "trips.", className: "accent" }]]}
            description="Plan as many trips as you like for a week or a whole year. One-time payment, no subscription, no auto-renew."
          />
          <p className="flex items-center gap-2 text-sm text-stone lg:mb-2">
            <ShieldCheck className="size-4 text-brand" /> 30-day money-back guarantee on every pass
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          {ORDER.map((p, i) => {
            const dark = !!p.popular;
            return (
              <Reveal key={p.id} delay={i * 0.06} className="h-full">
                <div className={cn("flex h-full flex-col rounded-[1.75rem] p-7 sm:p-9", dark ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-line")}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={cn("text-sm", dark ? "text-paper/60" : "text-stone")}>{p.name}</p>
                    {dark && <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-medium text-white">Best value</span>}
                  </div>
                  <div className="mt-6">
                    <PackPrice plan={p} className="text-[3rem]" muted={dark ? "text-paper/55" : "text-stone"} note={`one-time · ${p.period === "week" ? "7 days" : "1 year"}`} />
                  </div>
                  <p className={cn("mt-3", dark ? "text-paper/75" : "text-ink/75")}>
                    Unlimited trips for {p.days} days <span className={dark ? "text-paper/45" : "text-stone"}>· ≈ <PackEach plan={p} /> a day</span>
                  </p>

                  <PillLink href={`/dashboard/credits?plan=${p.id}`} variant={dark ? "brand" : "ink"} size="lg" className="mt-8 w-full justify-between">
                    Get the {p.name}
                  </PillLink>

                  <ul className={cn("mt-8 space-y-2.5 border-t pt-7 text-sm", dark ? "border-paper/10" : "border-line")}>
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className={cn("mt-0.5 size-3.5 shrink-0", dark ? "text-brand-2" : "text-brand")} />
                        <span className={dark ? "text-paper/80" : "text-ink/75"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mx-auto mt-5 flex max-w-5xl flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-paper-2 p-6 sm:flex-row sm:items-center sm:p-7">
          <p className="text-ink/80">
            <span className="font-medium text-ink">Start free.</span> Every new account gets {freeTrips()}: see a complete plan before you pay anything.
          </p>
          <PillLink href="/auth" variant="outline" className="w-full shrink-0 justify-between sm:w-auto">
            Plan my free trip
          </PillLink>
        </div>

        {/* A signed word from the person behind it, in place of testimonials. */}
        <figure className="mx-auto mt-16 max-w-3xl text-center">
          <blockquote className="display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.3] tracking-[-0.02em] text-ink">
            &ldquo;I started GoRoam because planning a trip shouldn&apos;t take longer than the trip itself. I read every email myself.&rdquo;
          </blockquote>
          <figcaption className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-stone">
            <span>
              <span className="text-ink">{founder.name}</span>, {founder.role}
            </span>
            <span aria-hidden>·</span>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-ink">
              {COMPANY.email}
            </a>
            <span aria-hidden>·</span>
            <Link href="/about" className="group inline-flex items-center gap-1 text-ink hover:text-brand">
              Our story <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </figcaption>
        </figure>

        <p className="mt-12 text-center text-sm text-stone">
          Need a custom plan for your business?{" "}
          <a href="mailto:jitesh@goroam.world" className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-brand">
            Contact us
          </a>
        </p>
      </div>
    </section>
  );
}
