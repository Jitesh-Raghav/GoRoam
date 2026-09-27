import type { Metadata } from "next";
import { Mail, MessageCircleQuestion, Receipt } from "lucide-react";
import { LegalLayout } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Contact · GoRoam",
  description: "Get in touch with GoRoam.",
};

const ROUTES = [
  {
    icon: MessageCircleQuestion,
    title: "General & support",
    body: "Questions about planning a trip, a bug, or anything else — we read every email.",
    action: { label: "hello@goroam.com", href: "mailto:hello@goroam.com" },
  },
  {
    icon: Receipt,
    title: "Billing & refunds",
    body: "For a purchase, a refund, or anything about your credits — see our refund policy for how it works.",
    action: { label: "See refund policy", href: "/refunds" },
  },
];

export default function ContactPage() {
  return (
    <LegalLayout eyebrow="Get in touch" title="We're a small team — say hello.">
      <p>Every message reaches a real person. We usually reply within a couple of business days.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {ROUTES.map((r) => (
          <div key={r.title} className="rounded-[24px] bg-white/80 p-6 ring-1 ring-line">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <r.icon className="size-5" />
            </span>
            <p className="display mt-4 text-2xl leading-none text-ink">{r.title}</p>
            <p className="mt-2 text-sm text-stone">{r.body}</p>
            <a href={r.action.href} className="mt-4 inline-flex items-center gap-2 text-sm text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand">
              {r.action.label}
            </a>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] bg-ink p-6 text-paper">
        <p className="eyebrow flex items-center gap-2 text-paper/60">
          <Mail className="size-3.5" /> Registered business
        </p>
        <p className="mt-3 text-paper/85">
          GoRoam is operated by <strong className="text-paper">[legal entity or individual name]</strong>, <strong className="text-paper">[registered address]</strong>.
        </p>
      </div>

      <p className="text-sm text-stone">
        Payment-specific inquiries can also be handled directly by <a href="https://dodopayments.com" target="_blank" rel="noreferrer">Dodo Payments</a>, our payment processor and merchant of record, through the receipt emailed after your purchase.
      </p>
    </LegalLayout>
  );
}
