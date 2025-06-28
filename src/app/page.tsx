import { Header1 } from "@/components/ui/header";
import { DynamicHeroDemo } from "@/components/landing/dynamic-hero-demo";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/ui/large-name-footer";

export default function Home() {
  return (
    <>
      <Header1 />
      <main className="min-h-screen">
        <DynamicHeroDemo />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
