// The landing FAQ, shared by the section and its FAQPage structured data.
import { PLANS, freeTrips } from "@/lib/plans";

export const FAQS = [
  {
    q: "How does GoRoam build my itinerary?",
    a: "Tell us where you're starting and going, your dates, who's coming, your budget, pace, where you like to stay and what you love. Our AI drafts a day-by-day plan: a morning, afternoon and evening for every day, each with a real place, timing, a local tip, an estimated cost and directions, plus where to stay, what to pack and the local essentials.",
  },
  {
    q: "What is a credit?",
    a: `One credit creates one complete itinerary. Every new account starts with ${freeTrips()}, and packs of ${PLANS.map((p) => p.credits).join(", ").replace(/, (\d+)$/, " or $1")} credits start at $${PLANS[0].price}.`,
  },
  {
    q: "Do credits expire?",
    a: "Never. Buy them once and use them whenever you're ready to plan your next adventure.",
  },
  {
    q: "Can I take my itinerary offline?",
    a: "Yes. Save any itinerary as a print-ready PDF, download the day maps for offline use, and trips you've opened keep working without signal.",
  },
  {
    q: "Can I book flights and hotels through GoRoam?",
    a: "Yes. Every itinerary comes with booking already filled in: your route, dates and group size go straight to Google Flights, Skyscanner, Booking.com, Airbnb, GetYourGuide and more, so you can compare and book directly with them in a couple of taps. Some of these are affiliate links, so we may earn a small commission at no extra cost to you.",
  },
  {
    q: "Can I share a trip with the people I'm travelling with?",
    a: "Share any itinerary with a private link, and your companions see the full plan without needing an account. You can also add every stop to your calendar in one tap.",
  },
  {
    q: "Which destinations can I plan?",
    a: "Anywhere on Earth. Plan a weekend close to home or an international journey of up to 30 days, solo or for groups of up to 16 adults and 10 children.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. Every credit pack has a 30-day money-back guarantee. Email jitesh@goroam.world within 30 days of buying and we'll refund it in full.",
  },
];
