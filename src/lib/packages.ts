import type { Pace, Spend, Stay, Transport } from "@/lib/trip";

/**
 * GoRoam's ready-made travel packages: complete day-by-day trips anyone can open,
 * then make their own in the planner. The full itineraries are generated once by
 * scripts/generate-packages.ts into src/data/packages/<slug>.json.
 */
export interface TravelPackage {
  slug: string;
  /** "5 days in Rome" */
  title: string;
  /** Short name for headings: "Tokyo & Kyoto", "Swiss Alps". */
  name: string;
  /** What the planner is asked for (and pre-filled with). */
  destination: string;
  country: string;
  days: number;
  /** Whole trip for two, in USD. */
  budget: number;
  tagline: string;
  bestTime: string;
  interests: string[];
  pace: Pace;
  spend: Spend;
  stay: Stay;
  transport: Transport;
  /** A start date in a good month, so the plan fits the season. */
  season: string;
}

export const PACKAGES: TravelPackage[] = [
  {
    slug: "thailand-3-days",
    title: "3 days in Bangkok",
    name: "Bangkok",
    destination: "Bangkok, Thailand",
    country: "Thailand",
    days: 3,
    budget: 900,
    tagline: "Gilded temples at dawn, street food at midnight, and a river that never sleeps.",
    bestTime: "Nov – Feb",
    interests: ["landmarks", "food", "nightlife"],
    pace: "balanced",
    spend: "comfort",
    stay: "boutique",
    transport: "transit",
    season: "2026-12-05",
  },
  {
    slug: "paris-7-days",
    title: "7 days in Paris",
    name: "Paris",
    destination: "Paris, France",
    country: "France",
    days: 7,
    budget: 3800,
    tagline: "Galleries, bistros and long walks along the Seine at golden hour.",
    bestTime: "Apr – Jun",
    interests: ["art", "food", "landmarks", "history"],
    pace: "balanced",
    spend: "comfort",
    stay: "boutique",
    transport: "transit",
    season: "2027-05-10",
  },
  {
    slug: "japan-5-days",
    title: "5 days in Tokyo & Kyoto",
    name: "Tokyo & Kyoto",
    destination: "Tokyo and Kyoto, Japan",
    country: "Japan",
    days: 5,
    budget: 3200,
    tagline: "Neon Tokyo, then the bullet train to Kyoto's quiet temples and moss gardens.",
    bestTime: "Mar – May",
    interests: ["landmarks", "food", "history", "photo"],
    pace: "balanced",
    spend: "comfort",
    stay: "hotel",
    transport: "transit",
    season: "2027-04-02",
  },
  {
    slug: "bali-4-days",
    title: "4 days in Bali",
    name: "Bali",
    destination: "Ubud and Seminyak, Bali, Indonesia",
    country: "Indonesia",
    days: 4,
    budget: 1300,
    tagline: "Rice terraces and jungle spas in Ubud, then sunsets on Seminyak's beaches.",
    bestTime: "Apr – Oct",
    interests: ["beach", "wellness", "outdoors", "photo"],
    pace: "relaxed",
    spend: "comfort",
    stay: "resort",
    transport: "rides",
    season: "2027-06-14",
  },
  {
    slug: "dubai-4-days",
    title: "4 days in Dubai",
    name: "Dubai",
    destination: "Dubai, UAE",
    country: "United Arab Emirates",
    days: 4,
    budget: 2600,
    tagline: "Sky-high views, old souks, a desert safari and dinner under the stars.",
    bestTime: "Nov – Mar",
    interests: ["landmarks", "shopping", "thrills", "food"],
    pace: "balanced",
    spend: "comfort",
    stay: "hotel",
    transport: "rides",
    season: "2026-12-12",
  },
  {
    slug: "rome-5-days",
    title: "5 days in Rome",
    name: "Rome",
    destination: "Rome, Italy",
    country: "Italy",
    days: 5,
    budget: 2700,
    tagline: "Two thousand years of history, one perfect plate of cacio e pepe at a time.",
    bestTime: "Apr – Jun",
    interests: ["history", "food", "art", "landmarks"],
    pace: "balanced",
    spend: "comfort",
    stay: "boutique",
    transport: "transit",
    season: "2027-05-03",
  },
  {
    slug: "switzerland-6-days",
    title: "6 days in the Swiss Alps",
    name: "Swiss Alps",
    destination: "Lucerne, Interlaken and Zermatt, Switzerland",
    country: "Switzerland",
    days: 6,
    budget: 4600,
    tagline: "Lakes, cogwheel trains and the Matterhorn, all by panoramic rail.",
    bestTime: "Jun – Sep",
    interests: ["outdoors", "photo", "landmarks"],
    pace: "balanced",
    spend: "comfort",
    stay: "hotel",
    transport: "transit",
    season: "2027-07-08",
  },
  {
    slug: "kerala-5-days",
    title: "5 days in Kerala",
    name: "Kerala",
    destination: "Kochi, Munnar and Alleppey, Kerala, India",
    country: "India",
    days: 5,
    budget: 950,
    tagline: "Spice-town Kochi, misty tea hills in Munnar and a houseboat night on the backwaters.",
    bestTime: "Sep – Mar",
    interests: ["outdoors", "food", "wellness", "history"],
    pace: "relaxed",
    spend: "comfort",
    stay: "boutique",
    transport: "car",
    season: "2026-11-14",
  },
  {
    slug: "goa-3-days",
    title: "3 days in Goa",
    name: "Goa",
    destination: "Goa, India",
    country: "India",
    days: 3,
    budget: 650,
    tagline: "Old Portuguese lanes, beach shacks and the best sunsets on the coast.",
    bestTime: "Nov – Feb",
    interests: ["beach", "nightlife", "food"],
    pace: "relaxed",
    spend: "comfort",
    stay: "boutique",
    transport: "rides",
    season: "2026-12-18",
  },
  // Long-tail Indian itineraries, hand-written (src/data/packages/*.json via scripts/content/itineraries.py).
  { slug: "hampi-3-days-couples", title: "3 days in Hampi for couples", name: "Hampi", destination: "Hampi, India", country: "India", days: 3, budget: 450, tagline: "Boulder-strewn ruins, a coracle on the river and sunsets for two over the Vijayanagara capital.", bestTime: "Oct – Feb", interests: ["history", "outdoors", "art"], pace: "relaxed", spend: "comfort", stay: "resort", transport: "rides", season: "2026-11-12" },
  { slug: "jaipur-2-days", title: "2 days in Jaipur", name: "Jaipur", destination: "Jaipur, India", country: "India", days: 2, budget: 400, tagline: "Amer at opening time, the Pink City's bazaars and a rooftop dinner facing Hawa Mahal.", bestTime: "Oct – Mar", interests: ["landmarks", "history", "shopping", "food"], pace: "balanced", spend: "comfort", stay: "boutique", transport: "rides", season: "2026-12-03" },
  { slug: "udaipur-3-days-couples", title: "3 days in Udaipur for couples", name: "Udaipur", destination: "Udaipur, India", country: "India", days: 3, budget: 750, tagline: "Lake palaces, a sunset boat on Pichola and candlelit dinners on the water.", bestTime: "Oct – Mar", interests: ["landmarks", "history", "food"], pace: "relaxed", spend: "comfort", stay: "boutique", transport: "rides", season: "2027-01-14" },
  { slug: "manali-4-days-friends", title: "4 days in Manali with friends", name: "Manali", destination: "Manali, India", country: "India", days: 4, budget: 700, tagline: "Snow at Solang, rafting the Beas and long café nights in Old Manali.", bestTime: "Mar – Jun, Sep – Oct", interests: ["outdoors", "adventure", "nightlife"], pace: "packed", spend: "savvy", stay: "hostel", transport: "rides", season: "2027-04-08" },
  { slug: "rishikesh-3-days", title: "3 days in Rishikesh", name: "Rishikesh", destination: "Rishikesh, India", country: "India", days: 3, budget: 300, tagline: "Sunrise yoga, Ganga rapids and the evening aarti on the river.", bestTime: "Oct – Nov, Feb – Apr", interests: ["wellness", "adventure", "culture"], pace: "balanced", spend: "savvy", stay: "hostel", transport: "transit", season: "2026-10-15" },
  { slug: "varanasi-2-days", title: "2 days in Varanasi", name: "Varanasi", destination: "Varanasi, India", country: "India", days: 2, budget: 350, tagline: "A dawn boat on the Ganga, the fire aarti and the old city's food lanes.", bestTime: "Oct – Mar", interests: ["culture", "history", "food"], pace: "balanced", spend: "comfort", stay: "hotel", transport: "rides", season: "2026-11-20" },
  { slug: "ladakh-5-days", title: "5 days in Ladakh", name: "Ladakh", destination: "Leh, Ladakh, India", country: "India", days: 5, budget: 1300, tagline: "High passes, Pangong's blues and monasteries above the Indus, paced for altitude.", bestTime: "Jun – Sep", interests: ["outdoors", "culture", "adventure"], pace: "relaxed", spend: "comfort", stay: "hotel", transport: "car", season: "2027-06-10" },
  { slug: "goa-3-days-budget", title: "3 days in Goa on a budget", name: "Goa", destination: "Goa, India", country: "India", days: 3, budget: 200, tagline: "Scooters, south-Goa coves, Fontainhas and fish thalis for under ₹200.", bestTime: "Nov – Feb", interests: ["beach", "food", "history"], pace: "balanced", spend: "savvy", stay: "hostel", transport: "rides", season: "2027-01-20" },
];
export const packageBySlug = (slug: string) => PACKAGES.find((p) => p.slug === slug);
