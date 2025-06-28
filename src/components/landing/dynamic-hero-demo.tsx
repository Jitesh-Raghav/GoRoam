"use client";

import { HeroSection } from "@/components/ui/dynamic-hero";

const DynamicHeroDemo = () => {
  const goRoamNavItems = [
    { 
      id: 'home', 
      label: 'Home', 
      onClick: () => console.info('Home clicked') 
    },
    { 
      id: 'features', 
      label: 'Features', 
      href: '#features-section' 
    },
    { 
      id: 'pricing', 
      label: 'Pricing', 
      href: '#pricing-section' 
    },
    { 
      id: 'get-started', 
      label: 'Get Started', 
      onClick: () => console.info('Get Started clicked') 
    },
  ];

  return (
    <div>
      <HeroSection
        heading="Make perfect itinerary with GoRoam"
        tagline="Experience AI-powered travel planning that creates personalized itineraries, interactive maps, and downloadable guides in seconds."
        buttonText="Start Planning Free"
        imageUrl="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1906&q=80"
        videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        navItems={goRoamNavItems}
      />
    </div>
  );
};

export { DynamicHeroDemo }; 