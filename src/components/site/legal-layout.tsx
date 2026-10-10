import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const NAV = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Refunds", href: "/refunds" },
  { label: "Contact", href: "/contact" },
];

/**
 * Shared shell for the policy pages: the site's own header and footer around a
 * readable single column, with a lightweight nav between the pages a payment
 * processor (or a traveller) goes looking for.
 */
export function LegalLayout({ eyebrow, title, updated, children }: { eyebrow: string; title: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-svh bg-paper pb-24 pt-28 sm:pt-32">
        <div className="container-x">
          <div className="mx-auto max-w-[720px]">
            <nav aria-label="Legal pages" className="no-scrollbar flex gap-1.5 overflow-x-auto pb-10">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm text-ink/75 ring-1 ring-line transition-colors hover:bg-ink hover:text-paper">
                  {n.label}
                </Link>
              ))}
            </nav>

            <p className="eyebrow text-brand">{eyebrow}</p>
            <h1 className="display mt-5 text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] text-ink">{title}</h1>
            {updated && <p className="mt-4 text-sm text-stone">Last updated {updated}</p>}

            <div className="legal-copy mt-10 space-y-9 text-[1.05rem] leading-relaxed text-ink/85">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** One numbered/titled section of a policy. */
export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="display text-[1.3rem] leading-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
