import { MONTH_NAMES, TRIP_IDEAS, tripBySlug, type TripIdea } from "@/lib/trip-ideas";

/**
 * Hub pages that answer the searches people make before they've picked a place:
 * "weekend getaways from Delhi" and "places to visit in December". Each one
 * lists trips from /trips with a line on why it fits, so they also pass links
 * to those pages.
 */

export interface CityHub {
  slug: string;
  city: string;
  intro: string;
  /** [trip slug, how far / how to get there]. */
  picks: [string, string][];
}

export const CITY_HUBS: CityHub[] = [
  {
    slug: "delhi",
    city: "Delhi",
    intro: "From Delhi you can be in the Himalaya, the Rajasthan desert or a tiger reserve in one overnight bus or a short flight. These are the best short trips from Delhi NCR this season.",
    picks: [
      ["agra", "3–4 hours by road or 1 hr 40 min on the Gatimaan Express"],
      ["jim-corbett", "About 6 hours by road to Ramnagar"],
      ["mussoorie", "About 6–7 hours by road, or fly to Dehradun"],
      ["shimla", "Train to Kalka, then the toy train; or 7–8 hours by road"],
      ["mcleodganj", "Overnight Volvo bus, or fly to Kangra"],
      ["ranthambore", "About 5 hours by train to Sawai Madhopur"],
      ["amritsar", "About 6 hours on the Shatabdi, or a 1-hour flight"],
      ["nainital", "Overnight train to Kathgodam"],
      ["tirthan-valley", "Overnight bus to Aut"],
      ["chopta", "Train or bus to Rishikesh, then 7–8 hours by road"],
    ],
  },
  {
    slug: "mumbai",
    city: "Mumbai",
    intro: "Mumbai's best escapes are a ferry ride, a ghat road or a short flight away: beaches on the Konkan, strawberry hills, and quick flights to the islands.",
    picks: [
      ["alibaug", "1-hour ferry from the Gateway of India"],
      ["mahabaleshwar", "About 5–6 hours by road"],
      ["gokarna", "Overnight train on the Konkan line"],
      ["jodhpur", "About 2 hours by flight"],
      ["rann-of-kutch", "Flight or overnight train to Bhuj"],
      ["jaisalmer", "Flight to Jaisalmer in season, or via Jodhpur"],
      ["andaman", "Flight via Chennai to Port Blair"],
    ],
  },
  {
    slug: "bangalore",
    city: "Bangalore",
    intro: "Bangalore sits within a few hours of coffee hills, temple towns and quiet beaches. Leave Friday night and you're in Coorg or Gokarna by breakfast.",
    picks: [
      ["coorg", "About 5–6 hours by road"],
      ["chikmagalur", "About 5 hours by road"],
      ["mysore", "About 2 hours on the Vande Bharat or Shatabdi"],
      ["ooty", "About 7 hours by road via Mysuru"],
      ["wayanad", "About 6 hours by road"],
      ["gokarna", "Overnight bus or train"],
      ["pondicherry", "About 6–7 hours by road"],
      ["kodaikanal", "About 9 hours by road, or fly to Madurai"],
    ],
  },
  {
    slug: "pune",
    city: "Pune",
    intro: "Pune is perfectly placed for the Sahyadri hills and the Konkan coast, and its airport puts Goa, Rajasthan and the south within a short flight.",
    picks: [
      ["mahabaleshwar", "About 3 hours by road"],
      ["alibaug", "About 4 hours by road"],
      ["gokarna", "Overnight bus or train"],
      ["jodhpur", "About 2 hours by flight"],
      ["coorg", "Flight to Bengaluru, then by road"],
      ["rann-of-kutch", "Flight to Bhuj via Mumbai or Ahmedabad"],
    ],
  },
  {
    slug: "hyderabad",
    city: "Hyderabad",
    intro: "From Hyderabad, short flights reach the coffee hills of Karnataka, the beaches of the south and the temple towns of Tamil Nadu.",
    picks: [
      ["coorg", "Flight to Bengaluru or Mysuru, then by road"],
      ["pondicherry", "Flight to Chennai, then 3 hours by road"],
      ["madurai", "About 1.5 hours by flight"],
      ["gokarna", "Flight to Goa, then 3 hours by road"],
      ["andaman", "Direct flights to Port Blair"],
      ["mysore", "Flight to Bengaluru, then the train"],
    ],
  },
  {
    slug: "chennai",
    city: "Chennai",
    intro: "Chennai is the gateway to the temple towns of Tamil Nadu, the French streets of Pondicherry, the Nilgiris and the Andaman Islands.",
    picks: [
      ["mahabalipuram", "About 1 hour along the East Coast Road"],
      ["pondicherry", "About 3 hours by road"],
      ["madurai", "Overnight train or a 1-hour flight"],
      ["kodaikanal", "Overnight train to Kodai Road, then by road"],
      ["ooty", "Overnight train to Mettupalayam, then the toy train"],
      ["andaman", "About 2 hours by flight to Port Blair"],
      ["kanyakumari", "Overnight train"],
    ],
  },
  {
    slug: "kolkata",
    city: "Kolkata",
    intro: "From Kolkata the eastern Himalaya, the Northeast and the Odisha coast are an overnight train or a short flight away.",
    picks: [
      ["darjeeling", "Overnight train to NJP, then 3 hours by road"],
      ["gangtok", "Flight to Bagdogra, then 4–5 hours by road"],
      ["puri", "Overnight train"],
      ["meghalaya", "Flight to Guwahati, then by road to Shillong"],
      ["kaziranga", "Flight to Jorhat or Guwahati"],
      ["andaman", "About 2 hours by flight to Port Blair"],
      ["bhutan", "Flight to Paro, or by road via Phuentsholing"],
    ],
  },
  {
    slug: "ahmedabad",
    city: "Ahmedabad",
    intro: "Ahmedabad is close to the White Rann of Kutch and the forts of Rajasthan, with flights to the beaches and hills further away.",
    picks: [
      ["rann-of-kutch", "About 6–7 hours by road, or fly to Bhuj"],
      ["jodhpur", "About 7 hours by road or train"],
      ["jaisalmer", "Overnight train"],
      ["pushkar", "About 8 hours by road, or train to Ajmer"],
      ["ranthambore", "Overnight train to Sawai Madhopur"],
      ["mahabaleshwar", "Flight to Pune, then by road"],
    ],
  },
];

export interface MonthHub {
  slug: string;
  month: number;
  intro: string;
}

/** The winter months, when most of these trips are searched for. */
export const MONTH_HUBS: MonthHub[] = [
  { slug: "october", month: 10, intro: "October is the start of the travel season: the monsoon has cleared, the hills are green and sharp, and festivals like Dussehra and Diwali light up the country." },
  { slug: "november", month: 11, intro: "November is one of the best months of the year to travel in India: dry, clear and mild almost everywhere, with the Pushkar fair, wildlife parks open and the first snow in the high Himalaya." },
  { slug: "december", month: 12, intro: "December is peak season for beaches, deserts and Christmas markets, and the first proper snow in the hills. Book early around Christmas and New Year." },
  { slug: "january", month: 1, intro: "January brings snow to the mountains, perfect weather to the beaches and deserts, and great value once the New Year rush ends." },
  { slug: "february", month: 2, intro: "February is warm by day and cool by night across most of India: desert festivals, wildlife sightings and the last of the ski season." },
  { slug: "march", month: 3, intro: "March is the last cool month on the plains: hill stations come back to life, Holi colours the north, and beaches are still pleasant." },
];

export const cityHub = (slug: string) => CITY_HUBS.find((c) => c.slug === slug);
export const monthHub = (slug: string) => MONTH_HUBS.find((m) => m.slug === slug);

/** A city's picks with the trips they point to, skipping any that don't exist. */
export const cityTrips = (c: CityHub) =>
  c.picks.map(([slug, how]) => ({ trip: tripBySlug(slug), how })).filter((x): x is { trip: TripIdea; how: string } => !!x.trip);

/** Every trip at its best in a month: India first, then abroad. */
export const monthTrips = (month: number) => {
  const all = TRIP_IDEAS.filter((t) => t.months.includes(month));
  return { india: all.filter((t) => t.country === "India"), abroad: all.filter((t) => t.country !== "India") };
};

export const monthName = (m: number) => MONTH_NAMES[m - 1];

/** The big cities a trip is a short hop from, with how to get there: the "X trip from Delhi" searches. */
export const fromCities = (slug: string) =>
  CITY_HUBS.flatMap((c) => c.picks.filter(([s]) => s === slug).map(([, how]) => ({ city: c.city, hub: c.slug, how })));
