import { Check, Gift, ShieldCheck, Sparkles } from "@/components/site/icons";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { Mesh, type MeshTone } from "@/components/site/mesh";
import { PillLink } from "@/components/site/pill";
import { PackEach, PackPrice } from "@/components/site/pack-price";
import { PLANS, freeTrips } from "@/lib/plans";
import { SectionHeading } from "./section-heading";

/** Each pack's look: its card, its liquid colours (which flow on hover) and its accents. */
const LOOK: Record<string, { tone: MeshTone; card: string; badge?: string; check: string; credits: string }> = {
  week: { tone: "azure", card: "bg-white text-ink shadow-card ring-1 ring-line hover:shadow-[0_50px_100px_-50px_rgba(31,111,235,0.45)]", check: "bg-brand-soft text-brand", credits: "text-brand" },
  year: {
    tone: "night",
    card: "bg-ink text-paper shadow-float hover:shadow-[0_60px_120px_-50px_rgba(31,111,235,0.7)]",
    badge: "bg-sun-2 text-ink",
    check: "bg-paper/10 text-brand-2",
    credits: "text-brand-2",
  },
};

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-10 py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            label="Pricing"
            title={[[{ text: "One price." }], [{ text: "Unlimited " }, { text: "trips.", className: "accent" }]]}
            description="Plan as many trips as you like for a week or a whole year. One-time payment, no subscription, no auto-renew."
          />
          <Reveal delay={0.2} className="lg:mb-2">
            <p className="flex items-center gap-2 text-sm text-stone">
              <ShieldCheck className="size-4 text-brand" /> 30-day money-back guarantee on every plan
            </p>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2 md:items-stretch">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  "mesh-host relative isolate flex h-full flex-col overflow-hidden rounded-panel p-8 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1.5 sm:p-10",
                  (LOOK[p.id] ?? LOOK.week).card
                )}
              >
                <Mesh tone={(LOOK[p.id] ?? LOOK.week).tone} seed={i * 7} className="[mask-image:linear-gradient(to_bottom,#000_25%,transparent_70%)]" />
                {LOOK[p.id]?.badge && (
                  <span className={cn("absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm", LOOK[p.id].badge)}>
                    {p.popular ? (
                      <>
                        <Sparkles className="size-3.5" /> Most popular
                      </>
                    ) : (
                      "Best value"
                    )}
                  </span>
                )}
                <p className={cn("eyebrow", p.popular ? "text-paper/60" : "text-stone")}>{p.name}</p>
                <div className="mt-6">
                  <PackPrice plan={p} className="text-[3.25rem]" muted={p.popular ? "text-paper/60" : "text-stone"} note={`one-time · ${p.period === "week" ? "7 days" : "1 year"}`} />
                </div>
                <p className={cn("mt-4 font-medium", (LOOK[p.id] ?? LOOK.week).credits)}>
                  Unlimited trips for {p.days} days<span className={cn("ml-2 font-normal", p.popular ? "text-paper/50" : "text-stone")}>≈ <PackEach plan={p} /> a day</span>
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
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", (LOOK[p.id] ?? LOOK.week).check)}>
                        <Check className="size-3.5" />
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
          <div className="mesh-host relative isolate mt-4 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-panel bg-white p-6 shadow-card ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
            <Mesh tone="azure" seed={30} />
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Gift className="size-5" />
              </span>
              <div>
                <p className="display text-[1.4rem] leading-none text-ink">Start free.</p>
                <p className="mt-1.5 text-stone">Every new account gets {freeTrips()}: see a complete plan before you pay a cent.</p>
              </div>
            </div>
            <PillLink href="/auth" variant="outline" className="w-full justify-between sm:w-auto">
              Plan my free trip
            </PillLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-10 text-center text-sm text-stone">
            Need a custom plan for your business?{" "}
            <a href="mailto:jitesh@goroam.world" className="text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand">
              Contact us
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
