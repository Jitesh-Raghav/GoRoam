import { PackageCard } from "@/components/packages/package-card";
import type { PackageCardData } from "@/lib/packages-data";
import { PACKAGE_SEO, type Region } from "@/lib/packages-seo";
import { cn } from "@/lib/utils";

export const REGION_ORDER: Region[] = ["India", "Asia", "Middle East", "Europe"];

/**
 * The ready-made trips, grouped by region. Shared by the public gallery and the
 * dashboard's copy of it, which opens each trip inside the dashboard.
 */
/** "Middle East" → "region-middle-east", for the section's anchor. */
export const regionId = (r: Region) => `region-${r.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function GalleryGrid({ cards, hrefBase = "/itineraries", hook = false, className }: { cards: PackageCardData[]; hrefBase?: string; hook?: boolean; className?: string }) {
  const byRegion = REGION_ORDER.map((r) => ({ region: r, cards: cards.filter((c) => (PACKAGE_SEO[c.slug]?.region ?? "Asia") === r) })).filter((g) => g.cards.length);
  return (
    <div className={className}>
      {byRegion.map((g, gi) => (
        <section key={g.region} id={regionId(g.region)} className={cn("scroll-mt-24", gi > 0 && "mt-16")} aria-labelledby={`${regionId(g.region)}-h`}>
          <h2 id={`${regionId(g.region)}-h`} className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
            {g.region} <span className="ml-1 font-sans text-base font-normal tracking-normal text-stone">{g.cards.length} trips</span>
          </h2>
          <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {g.cards.map((pkg, i) => (
              <PackageCard key={pkg.slug} pkg={pkg} index={i} href={`${hrefBase}/${pkg.slug}`} hook={hook} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
