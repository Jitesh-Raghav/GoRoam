import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Refund Policy · GoRoam",
  description: "GoRoam's 30-day money-back guarantee on credit packs.",
};

const UPDATED = "27 September 2026";

export default function RefundsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Refund policy." updated={UPDATED}>
      <LegalSection title="The short version">
        <p>
          Every credit pack is covered by a <strong>30-day money-back guarantee</strong>. If a pack isn&apos;t working out for you, email us
          within 30 days of buying it and we&apos;ll refund it in full.
        </p>
      </LegalSection>

      <LegalSection title="How it works">
        <ul>
          <li>
            Email <a href="mailto:hello@goroam.com">hello@goroam.com</a> with the pack you bought and roughly when. We don&apos;t need a reason,
            though it helps us improve GoRoam if you share one.
          </li>
          <li>
            Once approved, we refund the <strong>full amount</strong> you paid, through Dodo Payments, back to your original payment method.
          </li>
          <li>
            The credits from that pack are removed from your balance (never taking it below zero — if you&apos;ve already used some, your
            balance just goes to whatever it would otherwise be, not negative). Any itinerary you&apos;ve already generated is yours to keep.
          </li>
          <li>
            Refunds are processed by Dodo Payments as our payment processor. Depending on your bank, card network or UPI provider, it can
            take a few business days to show up after we approve it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="What this doesn't cover">
        <ul>
          <li>The free credit every new account gets — there&apos;s nothing paid to refund.</li>
          <li>
            Anything you spent through a third-party booking link (flights, hotels, tickets, transport) — that payment goes directly to that
            provider, not through GoRoam, so their own refund and cancellation policy applies. See our <a href="/terms">Terms</a>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Chargebacks">
        <p>
          If something&apos;s wrong with a purchase, please email us first — we&apos;d rather sort it out directly and quickly than have your
          bank or card network get involved. Filing a chargeback without contacting us first can result in your account being suspended
          while it&apos;s investigated.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Refund requests and billing questions: <a href="mailto:hello@goroam.com">hello@goroam.com</a>, or see our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
