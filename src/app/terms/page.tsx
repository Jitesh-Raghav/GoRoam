import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service · GoRoam",
  description: "The terms that apply to using GoRoam and buying credits.",
};

const UPDATED = "27 September 2026";

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms of service." updated={UPDATED}>
      <p className="rounded-2xl bg-brand-soft/60 p-4 text-sm text-ink ring-1 ring-brand/20">
        <strong>Placeholder notice:</strong> this page is a starting draft, not legal advice. Before accepting real payments, fill in your legal
        entity name, registered address and governing law where marked, and have it reviewed by a lawyer familiar with selling digital services
        from India to international customers.
      </p>

      <p>
        These Terms govern your use of GoRoam (the &quot;Service&quot;), operated by <strong>[legal entity or individual name]</strong>, based in{" "}
        <strong>[city, country]</strong> (&quot;GoRoam&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account or using GoRoam, you agree
        to these Terms. If you don&apos;t agree, please don&apos;t use the Service.
      </p>

      <LegalSection title="1. What GoRoam is">
        <p>
          GoRoam uses artificial intelligence to generate travel itineraries from the details you provide — your route, dates, budget, who&apos;s
          coming, your pace and interests, and any notes you add. It also links out to third-party travel providers so you can book flights,
          stays, tickets and transport.
        </p>
        <p>
          Itineraries are AI-generated suggestions. Opening hours, prices, availability and even whether a place still exists can change after
          the plan is made. <strong>Always verify details — especially opening hours, prices and booking requirements — before you rely on
          them or travel.</strong> GoRoam is not a travel agency and doesn&apos;t guarantee the accuracy of anything it generates.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>
          You sign in with Google. You&apos;re responsible for activity on your account and for keeping access to that Google account secure. You
          must be old enough to hold a Google account in your country to use GoRoam.
        </p>
      </LegalSection>

      <LegalSection title="3. Credits and payment">
        <p>
          Every new account gets a small number of free credits. Beyond that, generating an itinerary costs one credit, and credit packs are
          sold as one-time purchases — there&apos;s no subscription. Credits don&apos;t expire.
        </p>
        <p>
          Payments are processed by <strong>Dodo Payments</strong>, who act as our payment processor and, for card and other supported
          payment methods, our authorized reseller and merchant of record. That means your payment is legally made to Dodo Payments, not
          directly to GoRoam, and Dodo Payments — not us — is responsible for processing your payment, applicable taxes on the transaction,
          and payment-related customer service. We never see or store your full card details. See our{" "}
          <a href="/refunds">Refund policy</a> for how refunds work.
        </p>
      </LegalSection>

      <LegalSection title="4. Booking with third parties">
        <p>
          Flight, hotel, activity and transport links on GoRoam take you to third-party sites — Google Flights, Skyscanner, Kayak,
          Booking.com, Expedia, Airbnb, Hostelworld, GetYourGuide, Viator, Klook, Rome2Rio and others. Any booking, payment, cancellation or
          dispute you make through one of them is a contract between you and that provider, governed by their own terms — GoRoam is not a
          party to it and isn&apos;t responsible for what happens there.
        </p>
        <p>Some of these are affiliate links: GoRoam may earn a commission if you book through them, at no extra cost to you.</p>
      </LegalSection>

      <LegalSection title="5. Sharing itineraries">
        <p>
          Sharing an itinerary creates a link that anyone who has it can open and view, without signing in. Don&apos;t share a link anywhere
          public if the trip contains anything you&apos;d rather keep private, and only send it to people you&apos;re happy to have see it.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>Please don&apos;t use GoRoam to:</p>
        <ul>
          <li>break the law, or plan or facilitate illegal activity;</li>
          <li>abuse, overload or try to disrupt the Service or its infrastructure;</li>
          <li>reverse-engineer, scrape at scale, or resell access to the Service;</li>
          <li>use it to generate content that is abusive, deceptive, or infringes someone else&apos;s rights.</li>
        </ul>
        <p>We can suspend or close accounts that do this.</p>
      </LegalSection>

      <LegalSection title="7. Disclaimers & liability">
        <p>
          GoRoam is provided &quot;as is&quot;, without warranties of any kind. To the fullest extent the law allows, GoRoam and its operator
          aren&apos;t liable for indirect, incidental or consequential losses (like a missed flight, a booking made on incorrect information, or
          lost travel plans), and our total liability for anything arising from your use of the Service is limited to the amount you paid us
          in the 12 months before the claim.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update these Terms as GoRoam changes. If a change is material, we&apos;ll do our best to let you know (for example, on this
          page or by email). Continuing to use GoRoam after a change means you accept the new Terms.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>
          These Terms are governed by the laws of <strong>[country/state]</strong>, without regard to conflict-of-law rules, and any dispute
          will be handled in the courts of <strong>[city, country]</strong> — subject to any consumer-protection rights you have where you
          live that can&apos;t be waived by contract.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms? See our <a href="/contact">Contact page</a>, or email{" "}
          <a href="mailto:hello@goroam.com">hello@goroam.com</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
