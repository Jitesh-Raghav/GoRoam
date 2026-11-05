import { BookingSection } from "@/components/landing/booking";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PanoramaHero } from "@/components/landing/panorama-hero";
import { Pricing } from "@/components/landing/pricing";
import { ProductFilm } from "@/components/landing/product-film";
import { StartTrips } from "@/components/landing/start-trips";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { FAQS } from "@/lib/faq-data";
import type { Metadata } from "next";
import { JsonLd, faqPage, organization, siteNavigation, softwareApp, website } from "@/lib/seo";

// Set here, not in the root layout, so no other page inherits the home page as its canonical.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// The in-season cards follow the month, so rebuild the page daily.
export const revalidate = 86400;

export default async function Home() {
  return (
    <>
      <JsonLd data={[organization, website, softwareApp, siteNavigation, faqPage(FAQS)]} />
      <SiteHeader />
      <main>
        <PanoramaHero />
        <ProductFilm />
        <HowItWorks />
        <StartTrips />
        <Features />
        <BookingSection />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
