import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardReturn } from "@/components/seo/dashboard-return";
import { Plus } from "@/components/site/icons";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

/** The public content pages (trip gallery, destination guides): site header, footer and a breadcrumb trail. */
export function PublicShell({ crumbs, children }: { crumbs?: { name: string; href: string }[]; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-svh bg-paper pt-24 sm:pt-28">
        {crumbs && crumbs.length > 0 && (
          <div className="container-x flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <nav aria-label="Breadcrumb">
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
            <DashboardReturn />
          </div>
        )}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

/**
 * A FAQ list as open hairline rows of native details/summary: every answer is in the HTML
 * and readable without JavaScript, and opens with the homepage FAQ's CSS ease.
 */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {faqs.map((f) => (
        <details key={f.q} className="faq group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left outline-none focus-visible:text-brand [&::-webkit-details-marker]:hidden">
            <h3 className="text-[1.05rem] font-medium leading-snug text-ink transition-colors group-hover:text-brand sm:text-[1.1rem]">{f.q}</h3>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full text-ink ring-1 ring-inset ring-line transition-[transform,background-color,color] duration-300 ease-out-expo group-open:rotate-45 group-open:bg-ink group-open:text-paper group-open:ring-ink">
              <Plus className="size-3.5" />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 pr-10 leading-relaxed text-stone">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
