import type { Metadata } from "next";
import { SplitText } from "@/components/motion/split-text";
import { GalleryGrid } from "@/components/packages/gallery-grid";
import { packageCards } from "@/lib/packages-data";

// The public /itineraries gallery, inside the dashboard, so the sidebar stays put.
export const metadata: Metadata = {
  title: "Trip gallery",
  robots: { index: false, follow: true },
  alternates: { canonical: "/itineraries" },
};

export default async function DashboardGalleryPage() {
  const cards = await packageCards();
  return (
    <div className="mx-auto max-w-[80rem]">
      <header>
        <p className="eyebrow text-stone">Trip gallery</p>
        <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[1] text-ink">
          <SplitText text="Ready-made trips," trigger="mount" className="block" />
          <SplitText segments={[{ text: "day by " }, { text: "day.", className: "accent" }]} trigger="mount" delay={0.12} className="block" />
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone">
          Real places, timings and honest budgets. Open one free, follow it as is, or make it yours with your own dates, budget and crew.
        </p>
      </header>
      <GalleryGrid cards={cards} hrefBase="/dashboard/gallery" className="mt-12" />
    </div>
  );
}
