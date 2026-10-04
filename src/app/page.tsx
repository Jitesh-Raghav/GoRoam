import { BookingSection } from "@/components/landing/booking";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { GlobeSection } from "@/components/landing/globe-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { MobileManifesto, Ticker } from "@/components/landing/ticker";
import { PanoramaHero } from "@/components/landing/panorama-hero";
import { Wonders } from "@/components/landing/wonders";
import { GuideRails, SectionRule } from "@/components/landing/guides";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Intro } from "@/components/site/intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function Home() {
  return (
    <>
      <Intro />
      <SmoothScroll />
      <SiteHeader />
      <main>
        <PanoramaHero />
        {/* Everything below the panorama sits on hairline rails, YC-style. */}
        <div className="relative">
          <GuideRails />
          <Ticker />
          <Hero />
          <MobileManifesto />
          <Wonders />
          <SectionRule label="48.8584° N · 2.2945° E" />
          <HowItWorks />
          <SectionRule label="27.1751° N · 78.0421° E" />
          <GlobeSection />
          <SectionRule label="41.8902° N · 12.4922° E" />
          <Features />
          <SectionRule label="29.9792° N · 31.1342° E" />
          <BookingSection />
          <Testimonials />
          <SectionRule label="13.4125° N · 103.8670° E" />
          <Pricing />
          <SectionRule label="22.9519° S · 43.2105° W" />
          <Faq />
          <SectionRule label="36.4618° N · 25.3753° E" />
          <FinalCta />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
