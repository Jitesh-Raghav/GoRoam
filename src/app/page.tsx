import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { GlobeSection } from "@/components/landing/globe-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { MobileManifesto, Ticker } from "@/components/landing/ticker";
import { Wonders } from "@/components/landing/wonders";
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
        <Hero />
        <MobileManifesto />
        <Ticker />
        <Wonders />
        <HowItWorks />
        <GlobeSection />
        <Features />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
