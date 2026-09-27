import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { PillLink } from "@/components/site/pill";
import { SectionHeading } from "./section-heading";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    credits: 3,
    perTrip: null,
    description: "Perfect for trying out GoRoam",
    features: ["3 AI-generated itineraries", "Basic map integration", "PDF export", "Email support", "Community access"],
    cta: { label: "Get started free", href: "/auth" },
    featured: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "one-time",
    credits: 20,
    perTrip: "≈ ₹15 per itinerary",
    description: "Great for regular travelers",
    features: [
      "20 AI-generated itineraries",
      "Real-time interactive maps",
      "Premium PDF templates",
      "Priority email support",
      "Advanced customization",
      "Travel recommendations",
    ],
    cta: { label: "Choose Pro", href: "/dashboard/credits" },
    featured: true,
  },
  {
    name: "Premium",
    price: "₹599",
    period: "one-time",
    credits: 50,
    perTrip: "≈ ₹12 per itinerary",
    description: "For travel enthusiasts and agencies",
    features: [
      "50 AI-generated itineraries",
      "Advanced map features",
      "Custom PDF branding",
      "24/7 priority support",
      "Team collaboration",
      "API access",
      "White-label options",
    ],
    cta: { label: "Choose Premium", href: "/dashboard/credits" },
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-10 bg-paper py-24 lg:py-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            index="07"
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
            <Reveal key={p.name} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-[32px] p-8 sm:p-10",
                  p.featured
                    ? "bg-ink text-paper shadow-[0_50px_100px_-50px_rgba(217,85,1,0.55)]"
                    : "bg-white/80 text-ink ring-1 ring-line"
                )}
              >
                {p.featured && (
                  <>
                    <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/30 blur-3xl" />
                    <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white">
                      <Sparkles className="size-3.5" /> Most popular
                    </span>
                  </>
                )}
                <p className={cn("eyebrow", p.featured ? "text-paper/60" : "text-stone")}>{p.name}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="display text-7xl leading-none">{p.price}</span>
                  <span className={cn("text-sm", p.featured ? "text-paper/60" : "text-stone")}>{p.period}</span>
                </div>
                <p className={cn("mt-4 font-medium", p.featured ? "text-brand-2" : "text-brand")}>
                  {p.credits} credits{p.perTrip && <span className={cn("ml-2 font-normal", p.featured ? "text-paper/50" : "text-stone")}>{p.perTrip}</span>}
                </p>
                <p className={cn("mt-2", p.featured ? "text-paper/70" : "text-stone")}>{p.description}</p>

                <PillLink
                  href={p.cta.href}
                  variant={p.featured ? "brand" : "ink"}
                  size="lg"
                  className="mt-8 w-full justify-between"
                >
                  {p.cta.label}
                </PillLink>

                <div className={cn("my-8 h-px", p.featured ? "bg-paper/12" : "bg-line")} />
                <ul className="space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", p.featured ? "bg-paper/10 text-brand-2" : "bg-brand-soft text-brand")}>
                        <Check className="size-3" />
                      </span>
                      <span className={p.featured ? "text-paper/85" : "text-ink/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

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
