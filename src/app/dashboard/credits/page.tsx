"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, Crown, Info, Loader2, Plus, Receipt, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import { PLANNER_DRAFT_KEY } from "@/components/dashboard/out-of-credits";
import { CHECKOUT_KEY, useCheckout, type PendingCheckout } from "@/components/dashboard/use-checkout";
import { useCredits } from "@/components/dashboard/dashboard-layout";
import { Scene } from "@/components/scenes/scene";
import { SplitText } from "@/components/motion/split-text";
import { PillButton, PillLink } from "@/components/site/pill";
import { cn } from "@/lib/utils";
import { PLANS, freeTrips, perTrip, type PlanId } from "@/lib/plans";

export default function CreditsPage() {
  return <CreditsPageContent />;
}

const ICONS: Record<PlanId, typeof Zap> = { starter: Zap, explorer: Star, adventurer: Crown };

interface PaymentRow {
  id: string;
  planId: string;
  credits: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

type ReturnState = "idle" | "confirming" | "confirmed" | "delayed" | "cancelled" | "failed";

/** Minor units → "$24.99" / "₹2,099.00" / "¥3,000", respecting each currency's decimals. */
function formatAmount(amount: number, currency: string) {
  try {
    const f = new Intl.NumberFormat("en-US", { style: "currency", currency });
    const digits = f.resolvedOptions().maximumFractionDigits ?? 2;
    return f.format(amount / 10 ** digits);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
}

async function fetchPayments(): Promise<PaymentRow[]> {
  try {
    const d = await (await fetch("/api/payments")).json();
    return d.success ? d.data : [];
  } catch {
    return [];
  }
}

const faqs = [
  {
    q: "How do credits work?",
    a: `Each credit plans one complete itinerary, with bookings, checklists and a shareable link. New accounts start with ${freeTrips()}.`,
  },
  {
    q: "Can I get a refund?",
    a: "Yes, there's a 30-day money-back guarantee. Email hello@goroam.com and we'll refund the pack; its unused credits are removed.",
  },
  {
    q: "Do credits expire?",
    a: "No! Your credits never expire. Use them whenever you're ready to plan your next adventure.",
  },
  {
    q: "How do I pay?",
    a: "Checkout is handled securely by Dodo Payments: cards, UPI and local payment methods, in your currency where available, with an emailed receipt. We never see your card details.",
  },
];

function CreditsPageContent() {
  const { credits, refreshCredits } = useCredits();
  const checkout = useCheckout(credits);
  const [returned, setReturned] = useState<ReturnState>("idle");
  const [added, setAdded] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  // Held in a ref: its identity changes once the session loads, which must not restart the poll below.
  const refresh = useRef(refreshCredits);
  refresh.current = refreshCredits;
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

  useEffect(() => {
    fetchPayments().then(setPayments);
  }, []);

  // Back from Dodo's checkout: wait for the webhook to record the purchase.
  // The query is read once and kept, so a re-run effect can restart the poll.
  const arrival = useRef<{ result: string | null; status: string | null } | null>(null);
  useEffect(() => {
    if (!arrival.current) {
      const url = new URL(window.location.href);
      arrival.current = { result: url.searchParams.get("checkout"), status: url.searchParams.get("status") };
      ["checkout", "status", "payment_id", "subscription_id"].forEach((k) => url.searchParams.delete(k));
      window.history.replaceState(null, "", url.toString());
    }
    const { result, status: dodoStatus } = arrival.current;
    if (!result) return;

    if (result === "cancelled") return setReturned("cancelled");
    if (dodoStatus && !["succeeded", "active", "processing"].includes(dodoStatus)) return setReturned("failed");

    let record: PendingCheckout | null = null;
    try {
      record = JSON.parse(window.sessionStorage.getItem(CHECKOUT_KEY) ?? "null");
    } catch {
      /* ignore */
    }
    const since = (record?.startedAt ?? Date.now() - 30 * 60_000) - 60_000;
    setReturned("confirming");

    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      const rows = await fetchPayments();
      if (cancelled) return;
      const fresh = rows.find((r) => r.status === "succeeded" && new Date(r.createdAt).getTime() >= since);
      if (fresh) {
        setPayments(rows);
        setAdded(fresh.credits);
        setReturned("confirmed");
        await refresh.current();
        try {
          window.sessionStorage.removeItem(CHECKOUT_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      if (++tries >= 20) return setReturned("delayed");
      window.setTimeout(poll, 2000);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1280px]">
      <header>
        <p className="eyebrow text-stone">Credits</p>
        <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[0.92] text-ink">
          <SplitText text="More trips," trigger="mount" className="block" />
          <SplitText segments={[{ text: "fewer spreadsheets.", className: "italic text-brand" }]} trigger="mount" delay={0.12} className="block" />
        </h1>
      </header>

      {savedTrip && returned !== "confirmed" && (
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm text-ink ring-1 ring-brand/20 transition-colors hover:bg-ink hover:text-paper"
        >
          <ArrowLeft className="size-4" /> Your {savedTrip} plan is saved. Back to it
        </Link>
      )}

      <AnimatePresence>
        {returned !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={cn(
              "mt-6 flex flex-col gap-4 rounded-[24px] p-5 sm:flex-row sm:items-center sm:justify-between",
              returned === "confirmed" ? "bg-ink text-paper" : returned === "failed" ? "bg-destructive/10 text-ink" : "bg-white/80 text-ink ring-1 ring-line"
            )}
          >
            <div className="flex items-start gap-3">
              {returned === "confirming" && <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-brand" />}
              {returned === "confirmed" && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-2" />}
              {(returned === "delayed" || returned === "cancelled") && <Info className="mt-0.5 size-5 shrink-0 text-brand" />}
              {returned === "failed" && <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />}
              <div>
                <p className="font-medium">
                  {returned === "confirming" && "Confirming your payment…"}
                  {returned === "confirmed" && `Payment received, ${added} credits added.`}
                  {returned === "delayed" && "Your payment is still being confirmed."}
                  {returned === "cancelled" && "Checkout cancelled. You haven't been charged."}
                  {returned === "failed" && "That payment didn't go through."}
                </p>
                <p className={cn("mt-0.5 text-sm", returned === "confirmed" ? "text-paper/65" : "text-stone")}>
                  {returned === "confirming" && "This usually takes a few seconds."}
                  {returned === "confirmed" && "A receipt is on its way to your inbox."}
                  {returned === "delayed" && "Credits appear automatically as soon as it clears, you can keep browsing. Check your inbox for the receipt."}
                  {returned === "cancelled" && "Pick a pack whenever you're ready."}
                  {returned === "failed" && "You haven't been charged. Try again, or use another card or UPI."}
                </p>
              </div>
            </div>
            {returned === "confirmed" && (
              <PillLink href="/dashboard" variant="brand" className="shrink-0">
                {savedTrip ? `Back to your ${savedTrip} plan` : "Plan a trip"}
              </PillLink>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance */}
      <section className="relative mt-10 overflow-hidden rounded-[32px] bg-ocean text-paper">
        <div className="absolute inset-0 opacity-90">
          <Scene id="santorini" intro />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/10" />
        <div className="relative flex flex-col gap-8 p-8 sm:p-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-paper/60">Current balance</p>
            <p className="display mt-4 text-[clamp(4.25rem,10.2vw,7.65rem)] leading-[0.8]">{credits}</p>
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
          <h2 className="display text-3xl text-ink">Choose a credit pack</h2>
          <p className="text-sm text-stone">One-time payments · no subscription</p>
        </div>

        <AnimatePresence>
          {checkout.error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-soft/60 p-4 text-sm text-ink ring-1 ring-brand/20"
            >
              <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              <p>
                {checkout.error} If it keeps happening, email{" "}
                <a href="mailto:hello@goroam.com" className="font-medium underline underline-offset-4">
                  hello@goroam.com
                </a>
                .
              </p>
              <button type="button" onClick={checkout.clearError} className="ml-auto text-stone hover:text-ink" aria-label="Dismiss">
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
                  plan.popular ? "bg-ink text-paper shadow-[0_50px_100px_-50px_rgba(11,130,120,0.55)]" : "bg-white/80 text-ink ring-1 ring-line",
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
                  <span className="display text-5xl leading-none">${plan.price}</span>
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
                  disabled={checkout.pending !== null}
                  icon={checkout.pending === plan.id ? <Loader2 className="size-4 animate-spin" /> : undefined}
                  onClick={() => checkout.start(plan.id, savedTrip ? "planner" : undefined)}
                >
                  {checkout.pending === plan.id ? "Opening checkout…" : `Buy ${plan.name}`}
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

      {payments.length > 0 && (
        <section className="mt-16">
          <h2 className="display text-3xl text-ink">Purchases</h2>
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[24px] bg-white/80 ring-1 ring-line">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-sm">
                <Receipt className="size-4 shrink-0 text-brand" />
                <span className="min-w-0 flex-1 text-ink">
                  {PLANS.find((x) => x.id === p.planId)?.name ?? p.planId} pack · {p.credits} credits
                </span>
                <span className="text-stone">
                  {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="w-24 text-right font-mono text-ink">{formatAmount(p.amount, p.currency)}</span>
                {p.status !== "succeeded" && <span className="rounded-full bg-paper-2 px-2.5 py-1 text-xs capitalize text-stone">{p.status}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-16 grid gap-3 md:grid-cols-2">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-3xl bg-white/80 p-6 ring-1 ring-line">
            <h3 className="display text-xl text-ink">{f.q}</h3>
            <p className="mt-2 leading-relaxed text-stone">{f.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
