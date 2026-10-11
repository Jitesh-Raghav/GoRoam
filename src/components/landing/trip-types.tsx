import Link from "next/link";
import { ArrowUpRight } from "@/components/site/icons";
import { USE_CASES } from "@/lib/use-cases";
import { SectionHeading } from "./section-heading";
import { TripTypeCard } from "./trip-type-card";

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
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <li key={u.slug}>
              <TripTypeCard u={u} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
