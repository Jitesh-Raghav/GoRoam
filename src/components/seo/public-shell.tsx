import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

/** The public content pages (trip gallery, destination guides): site header, footer and a breadcrumb trail. */
export function PublicShell({ crumbs, children }: { crumbs?: { name: string; href: string }[]; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-svh bg-paper pt-24 sm:pt-28">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="container-x">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden className="text-stone-2">/</span>}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-ink/80">
                      {c.name}
                    </span>
                  ) : (
                    <Link href={c.href} className="hover:text-ink">
                      {c.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

/** A FAQ list rendered as plain HTML (details/summary), so it's readable without JavaScript. */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[28px] bg-white ring-1 ring-line">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 py-4 sm:px-7 sm:py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.05rem] text-ink">
            <h3 className="font-medium">{f.q}</h3>
            <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-paper-2 text-ink transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 leading-relaxed text-stone">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
