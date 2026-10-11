import Link from "next/link";
import { ArrowUpRight } from "@/components/site/icons";
import { USE_CASES } from "@/lib/use-cases";
import { FALLBACK_ICON, USE_CASE_ICON } from "@/lib/use-case-icons";
import { SectionHeading } from "./section-heading";

/** "Plan any kind of trip": links to each trip-type page, rendered on the server so crawlers follow them. */
export function TripTypes() {
  return (
    <section id="trip-types" className="relative py-20 lg:py-28" aria-label="Plan any kind of trip">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            label="For every kind of trip"
            size="md"
            title={[[{ text: "Plan any kind " }], [{ text: "of " }, { text: "trip", className: "accent" }, { text: "." }]]}
            description="Honeymoons, family holidays, friends in Goa or a solo month in Japan. Each one paced and budgeted for who's going."
          />
          <Link href="/plan" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-ink ring-1 ring-line-strong transition-colors hover:bg-ink hover:text-paper">
            All trip types <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {USE_CASES.map((u) => {
            const Icon = USE_CASE_ICON[u.slug] ?? FALLBACK_ICON;
            return (
              <li key={u.slug}>
                <Link
                  href={`/plan/${u.slug}`}
                  className="group flex h-full flex-col rounded-[22px] bg-white p-4 ring-1 ring-line transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(14,31,59,0.5)] sm:p-5"
                >
                  <span className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand transition-colors duration-500 group-hover:bg-ink group-hover:text-sun-2">
                      <Icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 text-stone-2 transition-colors group-hover:text-ink" />
                  </span>
                  <span className="mt-4 text-[0.98rem] leading-snug text-ink sm:text-lg">{u.h1.replace(/^./, (c) => c.toUpperCase())}</span>
                  <span className="mt-1.5 hidden text-sm leading-relaxed text-stone sm:block">{u.lede}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
