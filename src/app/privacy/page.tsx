import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy · GoRoam",
  description: "What GoRoam collects, why, and who it's shared with.",
};

const UPDATED = "27 September 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy policy." updated={UPDATED}>
      <p className="rounded-2xl bg-brand-soft/60 p-4 text-sm text-ink ring-1 ring-brand/20">
        <strong>Placeholder notice:</strong> this page is a starting draft, not legal advice. Fill in your legal entity details where marked,
        and have a lawyer confirm it covers GDPR/UK GDPR if you have EU or UK customers, before going live.
      </p>

      <p>
        This policy explains what <strong>[legal entity or individual name]</strong> (&quot;GoRoam&quot;, &quot;we&quot;) collects when you
        use GoRoam, why, and who we share it with. It applies to goroam.vercel.app and the GoRoam dashboard.
      </p>

      <LegalSection title="1. What we collect">
        <ul>
          <li>
            <strong>Account details</strong>, from Google Sign-In: your name, email address and profile photo.
          </li>
          <li>
            <strong>Trip details you give us</strong>: source and destination, dates, budget, who&apos;s travelling, pace, interests, dietary
            needs, occasion and any notes you type — used to generate your itinerary.
          </li>
          <li>
            <strong>Generated itineraries</strong>: the day-by-day plan, stays, tips and packing lists GoRoam creates for you, stored to your
            account so you can come back to them.
          </li>
          <li>
            <strong>Credit and purchase records</strong>: your credit balance, and for each purchase the pack, amount, currency and status.
            We do not collect or store your card number, UPI ID or other payment credentials — those go directly to Dodo Payments.
          </li>
          <li>
            <strong>Basic technical data</strong>: standard server logs (like IP address and browser type) kept for security and debugging.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Cookies & local storage">
        <p>We keep this deliberately small:</p>
        <ul>
          <li>
            <strong>A session cookie</strong> from our sign-in provider, so you stay signed in. This is essential — GoRoam doesn&apos;t work
            without it.
          </li>
          <li>
            <strong>Your browser&apos;s local storage</strong>, only on your device, for things like a trip&apos;s packing-list progress or an
            in-progress plan while you&apos;re mid-checkout. This never leaves your browser and we can&apos;t read it.
          </li>
        </ul>
        <p>We don&apos;t run third-party advertising or analytics trackers on GoRoam.</p>
      </LegalSection>

      <LegalSection title="3. Who we share it with">
        <ul>
          <li>
            <strong>Google</strong> — to sign you in.
          </li>
          <li>
            <strong>OpenAI</strong> — the trip details you submit are sent to OpenAI&apos;s API to generate your itinerary. OpenAI processes
            this to return the result to us; see{" "}
            <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noreferrer">
              OpenAI&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Dodo Payments</strong> — handles checkout, payment processing and, for supported payment methods, acts as merchant of
            record. They receive your email, name and purchase details to process payment; we never see your card or bank details.
          </li>
          <li>
            <strong>Our hosting and database providers</strong> (Vercel and our database host) — to run the Service and store your data.
          </li>
        </ul>
        <p>We don&apos;t sell your personal data, to anyone, ever.</p>
      </LegalSection>

      <LegalSection title="4. Sharing itineraries">
        <p>
          If you use GoRoam&apos;s share feature, anyone with that link can view the itinerary&apos;s contents without signing in. Don&apos;t
          share a link publicly if the trip contains anything you&apos;d rather keep private.
        </p>
      </LegalSection>

      <LegalSection title="5. How long we keep it">
        <p>
          We keep your account and itineraries for as long as your account exists. Delete your account (see Contact) and we&apos;ll delete
          your personal data and itineraries, except records we&apos;re required to keep for tax, accounting or fraud-prevention purposes —
          typically purchase records, which we retain for as long as the law requires.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export or delete your personal data, or to object to
          certain processing. To exercise any of these, contact us — see below. If you&apos;re in the EU or UK, you also have the right to
          lodge a complaint with your local data protection authority.
        </p>
      </LegalSection>

      <LegalSection title="7. Children">
        <p>GoRoam isn&apos;t directed at children, and you must meet the minimum age to hold a Google account in your country to use it.</p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>We may update this policy as GoRoam changes. Material changes will be reflected here with a new &quot;last updated&quot; date.</p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Questions, or want to exercise a data right? See our <a href="/contact">Contact page</a>, or email{" "}
          <a href="mailto:hello@goroam.com">hello@goroam.com</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
