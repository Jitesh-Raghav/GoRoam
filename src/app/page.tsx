import { BookingSection } from "@/components/landing/booking";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { FounderNote } from "@/components/landing/founder-note";
import { GlobeSection } from "@/components/landing/globe-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TripTypes } from "@/components/landing/trip-types";
import { Pricing } from "@/components/landing/pricing";
import { PanoramaHero } from "@/components/landing/panorama-hero";
import { ProductFilm } from "@/components/landing/product-film";
import { Wonders } from "@/components/landing/wonders";
import { TripGallery } from "@/components/landing/trip-gallery";
import { TrendingTrips } from "@/components/landing/trending-trips";
import { GuideRails, SectionRule } from "@/components/landing/guides";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { FAQS } from "@/lib/faq-data";
import type { Metadata } from "next";
import { JsonLd, faqPage, organization, siteNavigation, softwareApp, website } from "@/lib/seo";

// Set here, not in the root layout, so no other page inherits the home page as its canonical.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// The trending row follows the month, so rebuild the page daily.
export const revalidate = 86400;

export default async function Home() {
  return (
    <>
      <JsonLd data={[organization, website, softwareApp, siteNavigation, faqPage(FAQS)]} />
      <SmoothScroll />
      <SiteHeader />
      <main>
        <PanoramaHero />
        {/* Everything below the panorama sits between two hairline rails. */}
        <div className="relative isolate">
          <GuideRails />
          <ProductFilm />
          <SectionRule />
          <Wonders />
          <SectionRule />
          <HowItWorks />
          <SectionRule />
          <TripTypes />
          <GlobeSection />
          <TripGallery />
          <SectionRule />
          <TrendingTrips />
          <SectionRule />
          <Features />
          <BookingSection />
          <FounderNote />
          <SectionRule />
          <Pricing />
          <SectionRule />
          <Faq />
          <FinalCta />
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
