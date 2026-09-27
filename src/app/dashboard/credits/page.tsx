"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Crown, Info, Plus, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import { PLANNER_DRAFT_KEY } from "@/components/dashboard/out-of-credits";
import { DashboardLayout, useCredits } from "@/components/dashboard/dashboard-layout";
import { Scene } from "@/components/scenes/scene";
import { SplitText } from "@/components/motion/split-text";
import { PillButton, PillLink } from "@/components/site/pill";
import { cn } from "@/lib/utils";
import { PLANS, freeTrips, perTrip, type PlanId } from "@/lib/plans";

export default function CreditsPage() {
  return (
    <DashboardLayout>
      <CreditsPageContent />
    </DashboardLayout>
  );
}

const ICONS: Record<PlanId, typeof Zap> = { starter: Zap, explorer: Star, adventurer: Crown };

const faqs = [
  {
    q: "How do credits work?",
    a: `Each credit plans one complete itinerary, with bookings, checklists and a shareable link. New accounts start with ${freeTrips()}.`,
  },
  {
    q: "Can I get a refund?",
    a: "We offer a 30-day money-back guarantee if you're not satisfied with our service. Contact support for assistance.",
  },
  {
    q: "Do credits expire?",
    a: "No! Your credits never expire. Use them whenever you're ready to plan your next adventure.",
  },
  {
    q: "Need more credits?",
    a: "Contact our sales team for custom enterprise plans with bulk pricing and additional features.",
  },
];

function CreditsPageContent() {
  const { credits } = useCredits();
  const [notice, setNotice] = useState<string | null>(null);
  const [picked, setPicked] = useState<PlanId | null>(null);
  const [savedTrip, setSavedTrip] = useState<string | null>(null);

  // Arriving from a plan link: spotlight that pack. Arriving from the planner's
  // paywall: offer the way back to the trip they were building.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const id = q.get("plan");
    if (PLANS.some((p) => p.id === id)) setPicked(id as PlanId);
    if (q.get("return") === "planner") {
      try {
        const draft = JSON.parse(window.sessionStorage.getItem(PLANNER_DRAFT_KEY) ?? "null");
        setSavedTrip(draft?.formData?.destination?.split(",")[0]?.trim() || "your trip");
      } catch {
        setSavedTrip("your trip");
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-[1280px]">
      <header>
        <p className="eyebrow text-stone">Credits</p>
        <h1 className="display mt-4 text-[clamp(2.8rem,6vw,5rem)] leading-[0.92] text-ink">
          <SplitText text="More trips," trigger="mount" className="block" />
          <SplitText segments={[{ text: "fewer spreadsheets.", className: "italic text-brand" }]} trigger="mount" delay={0.12} className="block" />
        </h1>
      </header>

      {savedTrip && (
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm text-ink ring-1 ring-brand/20 transition-colors hover:bg-ink hover:text-paper"
        >
          <ArrowLeft className="size-4" /> Your {savedTrip} plan is saved — back to it
        </Link>
      )}

      {/* Balance */}
      <section className="relative mt-10 overflow-hidden rounded-[32px] bg-ink text-paper">
        <div className="absolute inset-0 opacity-90">
          <Scene id="santorini" intro />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/10" />
        <div className="relative flex flex-col gap-8 p-8 sm:p-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-paper/60">Current balance</p>
            <p className="display mt-4 text-[clamp(5rem,12vw,9rem)] leading-[0.8]">{credits}</p>
            <p className="mt-4 max-w-sm text-paper/70">
              {credits === 1 ? "credit" : "credits"} left · each credit plans one complete itinerary, and they never expire.
            </p>
          </div>
          <PillLink href="/dashboard" variant="paper" icon={<Plus className="size-4" />}>
            Plan a trip
          </PillLink>
        </div>
      </section>

      {/* Plans */}
      <section className="mt-16">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h2 className="display text-4xl text-ink">Choose a credit pack</h2>
          <p className="text-sm text-stone">One-time payments · no subscription</p>
        </div>

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="status"
              className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-soft/60 p-4 text-sm text-ink ring-1 ring-brand/20"
            >
              <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              <p>
                {notice} Email{" "}
                <a href="mailto:hello@goroam.com" className="font-medium underline underline-offset-4">
                  hello@goroam.com
                </a>{" "}
                and we&apos;ll get you topped up.
              </p>
              <button type="button" onClick={() => setNotice(null)} className="ml-auto text-stone hover:text-ink" aria-label="Dismiss">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const Icon = ICONS[plan.id];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.08 }}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-[32px] p-8",
                  plan.popular ? "bg-ink text-paper shadow-[0_50px_100px_-50px_rgba(217,85,1,0.55)]" : "bg-white/80 text-ink ring-1 ring-line",
                  picked === plan.id && "ring-2 ring-brand"
                )}
              >
                {plan.popular && (
                  <>
                    <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/30 blur-3xl" />
                    <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white">
                      <Sparkles className="size-3.5" /> Most popular
                    </span>
                  </>
                )}
                <span className={cn("grid size-11 place-items-center rounded-2xl", plan.popular ? "bg-paper/10 text-brand-2" : "bg-brand-soft text-brand")}>
                  <Icon className="size-5" />
                </span>
                <p className={cn("eyebrow mt-6", plan.popular ? "text-paper/60" : "text-stone")}>{plan.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="display text-6xl leading-none">${plan.price}</span>
                  <span className={cn("text-sm", plan.popular ? "text-paper/60" : "text-stone")}>one-time</span>
                </div>
                <p className={cn("mt-3 font-medium", plan.popular ? "text-brand-2" : "text-brand")}>
                  {plan.credits} credits
                  <span className={cn("ml-2 font-normal", plan.popular ? "text-paper/50" : "text-stone")}>
                    ≈ {perTrip(plan)} per trip
                  </span>
                </p>
                <p className={cn("mt-1", plan.popular ? "text-paper/70" : "text-stone")}>{plan.tagline}</p>

                <PillButton
                  type="button"
                  variant={plan.popular ? "brand" : "ink"}
                  size="lg"
                  className="mt-8 w-full justify-between"
                  onClick={() => setNotice(`Online checkout for the ${plan.name} pack isn't live yet.`)}
                >
                  Purchase credits
                </PillButton>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", plan.popular ? "bg-paper/10 text-brand-2" : "bg-brand-soft text-brand")}>
                        <Check className="size-3" />
                      </span>
                      <span className={cn("text-sm", plan.popular ? "text-paper/85" : "text-ink/80")}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 grid gap-3 md:grid-cols-2">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-3xl bg-white/80 p-6 ring-1 ring-line">
            <h3 className="display text-2xl text-ink">{f.q}</h3>
            <p className="mt-2 leading-relaxed text-stone">{f.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
