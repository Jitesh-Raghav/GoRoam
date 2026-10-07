import { PackageCard } from "@/components/packages/package-card";
import { packageCards } from "@/lib/packages-data";

export const metadata = { title: "Travel packages · GoRoam" };

// Ready-made trips, built once and served as static pages.
export default async function PackagesPage() {
  const cards = await packageCards();
  return (
    <div className="mx-auto max-w-[80rem]">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-stone">Travel packages</p>
          <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[0.92] text-ink">
            Ready when
            <br />
            <span className="italic text-brand">you are.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone">
            Our most-loved trips, planned day by day with real places, honest budgets and local tips. Open one for free, then make it yours.
          </p>
        </div>
        <p className="text-sm text-stone">{cards.length} packages · prices for two, stays included in the budget</p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((pkg, i) => (
          <PackageCard key={pkg.slug} pkg={pkg} index={i} />
        ))}
      </div>
    </div>
  );
}
