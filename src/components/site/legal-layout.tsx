import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";
import { PillLink } from "./pill";

const NAV = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Refunds", href: "/refunds" },
  { label: "Contact", href: "/contact" },
];

/**
 * Shared shell for the policy pages: a plain header, a readable single
 * column and a lightweight nav between the pages a payment processor (or a
 * traveller) goes looking for.
 */
export function LegalLayout({ eyebrow, title, updated, children }: { eyebrow: string; title: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <div className="min-h-svh bg-paper">
      <header className="container-x flex h-[72px] items-center justify-between">
        <Logo />
        <PillLink href="/" size="md" className="hidden sm:inline-flex">
          Back to GoRoam
        </PillLink>
      </header>

      <main className="container-x pb-24 pt-6 sm:pt-10">
        <div className="mx-auto max-w-[720px]">
          <nav aria-label="Legal pages" className="no-scrollbar flex gap-1.5 overflow-x-auto pb-8">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="shrink-0 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-ink hover:text-paper">
                {n.label}
              </Link>
            ))}
          </nav>

          <p className="eyebrow text-stone">{eyebrow}</p>
          <h1 className="display mt-4 text-[clamp(2.21rem,5.1vw,3.4rem)] leading-[0.95] text-ink">{title}</h1>
          {updated && <p className="mt-4 text-sm text-stone">Last updated {updated}</p>}

          <div className="legal-copy mt-10 space-y-8 text-[1.05rem] leading-relaxed text-ink/85">{children}</div>
        </div>
      </main>
    </div>
  );
}

/** One numbered/titled section of a policy. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="display text-xl leading-none text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
