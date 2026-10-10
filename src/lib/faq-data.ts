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
    a: "Yes. Every itinerary has a print-ready layout: hit Download and save it as a PDF, or print it for the road.",
  },
  {
    q: "Can I book flights and hotels through GoRoam?",
    a: "Yes. Every itinerary comes with booking already filled in: your route, dates and group size go straight to Google Flights, Skyscanner, Booking.com, Airbnb, GetYourGuide and more, so you can compare and book with trusted partners in a couple of taps.",
  },
  {
    q: "Can I share a trip with the people I'm travelling with?",
    a: "Share any itinerary with a private link, and your companions see the full plan without needing an account. You can also add every stop to your calendar in one tap.",
  },
  {
    q: "Which destinations can I plan?",
    a: "Anywhere on Earth. Plan a national weekend getaway or an international journey of up to 30 days, for up to 20 travellers.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer a 30-day money-back guarantee if you're not satisfied with our service. Contact support and we'll sort it out.",
  },
];
