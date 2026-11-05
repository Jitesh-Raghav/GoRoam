import { Mail, Plus } from "@/components/site/icons";
import { FAQS } from "@/lib/faq-data";
import { SectionHeading } from "./section-heading";

/**
 * Questions as native disclosure rows: every answer is in the HTML (and readable without
 * JavaScript), one stays open at a time (`name`), and they open with a short CSS ease
 * where the browser supports it.
 */
export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-10 py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading label="Questions" size="md" title={[[{ text: "Questions," }], [{ text: "answered.", className: "accent" }]]} />
          <div className="mt-10 max-w-sm border-t border-line pt-6">
            <p className="text-[1.05rem] text-ink">Something we didn&apos;t cover?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone">Questions about a trip, your account or a payment: write to us and a real person replies.</p>
            <a href="mailto:jitesh@goroam.world" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-ink">
              <Mail className="size-4" /> jitesh@goroam.world
            </a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="border-t border-line">
            {FAQS.map((f, i) => (
              <details key={f.q} name="faq" open={i === 0} className="faq group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left outline-none focus-visible:text-brand sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="display text-[1.15rem] leading-snug text-ink transition-colors group-hover:text-brand sm:text-[1.35rem]">{f.q}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full text-ink ring-1 ring-inset ring-line transition-[transform,background-color,color] duration-300 ease-out-expo group-hover:ring-ink group-open:rotate-45 group-open:bg-ink group-open:text-paper group-open:ring-ink">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-12 text-[1.0625rem] leading-relaxed text-stone">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
