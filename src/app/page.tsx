import { BookingSection } from "@/components/landing/booking";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { FounderNote } from "@/components/landing/founder-note";
import { GlobeSection } from "@/components/landing/globe-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { PanoramaHero } from "@/components/landing/panorama-hero";
import { ProductFilm } from "@/components/landing/product-film";
import { Wonders } from "@/components/landing/wonders";
import { TripGallery } from "@/components/landing/trip-gallery";
import { GuideRails, SectionRule } from "@/components/landing/guides";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { FAQS } from "@/lib/faq-data";
import { JsonLd, faqPage, organization, softwareApp, website } from "@/lib/seo";

export default async function Home() {
  return (
    <>
      <JsonLd data={[organization, website, softwareApp, faqPage(FAQS)]} />
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
          <GlobeSection />
          <TripGallery />
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
      <SiteFooter />
    </>
  );
}
