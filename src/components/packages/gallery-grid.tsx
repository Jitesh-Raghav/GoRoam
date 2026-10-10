import { PackageCard } from "@/components/packages/package-card";
import type { PackageCardData } from "@/lib/packages-data";
import { PACKAGE_SEO, type Region } from "@/lib/packages-seo";
import { cn } from "@/lib/utils";

const ORDER: Region[] = ["India", "Asia", "Middle East", "Europe"];

/**
 * The ready-made trips, grouped by region. Shared by the public gallery and the
 * dashboard's copy of it, which opens each trip inside the dashboard.
 */
export function GalleryGrid({ cards, hrefBase = "/itineraries", className }: { cards: PackageCardData[]; hrefBase?: string; className?: string }) {
  const byRegion = ORDER.map((r) => ({ region: r, cards: cards.filter((c) => (PACKAGE_SEO[c.slug]?.region ?? "Asia") === r) })).filter((g) => g.cards.length);
  return (
    <div className={className}>
      {byRegion.map((g, gi) => (
        <section key={g.region} className={cn(gi > 0 && "mt-14")} aria-labelledby={`region-${g.region}`}>
          <h2 id={`region-${g.region}`} className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
            {g.region} <span className="ml-1 font-sans text-base font-normal tracking-normal text-stone">{g.cards.length} trips</span>
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {g.cards.map((pkg, i) => (
              <PackageCard key={pkg.slug} pkg={pkg} index={i} href={`${hrefBase}/${pkg.slug}`} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
