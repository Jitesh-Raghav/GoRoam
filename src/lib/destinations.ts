import type { SceneId } from "@/components/scenes/scenes";

export interface Destination {
  slug: string;
  scene: SceneId;
  /** The landmark. */
  name: string;
  /** City / region and country, as shown to people. */
  place: string;
  /** What the trip planner is pre-filled with. */
  query: string;
  lat: number;
  lng: number;
  bestTime: string;
  days: string;
  blurb: string;
  /** A signature itinerary moment for this place. */
  moment: { slot: "Morning" | "Afternoon" | "Evening"; time: string; title: string };
}

export const DESTINATIONS: Destination[] = [
  {
    slug: "taj-mahal",
    scene: "taj",
    name: "Taj Mahal",
    place: "Agra, India",
    query: "Agra, India",
    lat: 27.1751,
    lng: 78.0421,
    bestTime: "Oct – Mar",
    days: "2–3 days",
    blurb: "Ivory marble that blushes pink at dawn — see it again at dusk from Mehtab Bagh across the Yamuna.",
    moment: { slot: "Morning", time: "6:00 AM", title: "Sunrise at the Taj Mahal" },
  },
  {
    slug: "eiffel-tower",
    scene: "eiffel",
    name: "Eiffel Tower",
    place: "Paris, France",
    query: "Paris, France",
    lat: 48.8584,
    lng: 2.2945,
    bestTime: "Apr – Jun",
    days: "4–5 days",
    blurb: "After dark the tower sparkles for five minutes every hour. The best seat is the steps of Trocadéro.",
    moment: { slot: "Evening", time: "9:00 PM", title: "The hourly sparkle from Trocadéro" },
  },
  {
    slug: "colosseum",
    scene: "colosseum",
    name: "Colosseum",
    place: "Rome, Italy",
    query: "Rome, Italy",
    lat: 41.8902,
    lng: 12.4922,
    bestTime: "Apr – May",
    days: "3–4 days",
    blurb: "Nearly two thousand years old and still the loudest silence in Rome. Go early, go underground.",
    moment: { slot: "Morning", time: "9:30 AM", title: "Underground tour of the arena" },
  },
  {
    slug: "pyramids-of-giza",
    scene: "pyramids",
    name: "Pyramids of Giza",
    place: "Giza, Egypt",
    query: "Cairo, Egypt",
    lat: 29.9792,
    lng: 31.1342,
    bestTime: "Oct – Apr",
    days: "3–4 days",
    blurb: "The last standing wonder of the ancient world, best approached across the sand at golden hour.",
    moment: { slot: "Afternoon", time: "4:30 PM", title: "Camel ride across the Giza plateau" },
  },
  {
    slug: "mount-fuji",
    scene: "fuji",
    name: "Mount Fuji",
    place: "Fujiyoshida, Japan",
    query: "Kyoto & Mount Fuji, Japan",
    lat: 35.5012,
    lng: 138.8014,
    bestTime: "Late Mar – Apr",
    days: "2–3 days",
    blurb: "Climb the 398 steps to the Chureito Pagoda for Japan's most famous view, framed in cherry blossom.",
    moment: { slot: "Morning", time: "5:45 AM", title: "Chureito Pagoda at first light" },
  },
  {
    slug: "santorini",
    scene: "santorini",
    name: "Santorini",
    place: "Oia, Greece",
    query: "Santorini, Greece",
    lat: 36.4618,
    lng: 25.3753,
    bestTime: "May – Jun",
    days: "4 days",
    blurb: "Whitewashed Oia turns gold as the sun drops into the caldera. Windmills, blue domes, silence.",
    moment: { slot: "Evening", time: "8:15 PM", title: "Sunset from the Oia castle walls" },
  },
  {
    slug: "machu-picchu",
    scene: "machupicchu",
    name: "Machu Picchu",
    place: "Cusco Region, Peru",
    query: "Cusco & Machu Picchu, Peru",
    lat: -13.1631,
    lng: -72.545,
    bestTime: "May – Sep",
    days: "4–5 days",
    blurb: "A citadel in the clouds. Take the first bus up and watch the mist lift off Huayna Picchu.",
    moment: { slot: "Morning", time: "5:30 AM", title: "First bus up to the citadel" },
  },
  {
    slug: "christ-the-redeemer",
    scene: "rio",
    name: "Christ the Redeemer",
    place: "Rio de Janeiro, Brazil",
    query: "Rio de Janeiro, Brazil",
    lat: -22.9519,
    lng: -43.2105,
    bestTime: "Dec – Mar",
    days: "4–5 days",
    blurb: "Thirty metres of concrete and soapstone watching over the bay from the summit of Corcovado.",
    moment: { slot: "Morning", time: "8:00 AM", title: "Cog train up Corcovado" },
  },
  {
    slug: "sydney-opera-house",
    scene: "sydney",
    name: "Sydney Opera House",
    place: "Sydney, Australia",
    query: "Sydney, Australia",
    lat: -33.8568,
    lng: 151.2153,
    bestTime: "Sep – Nov",
    days: "4 days",
    blurb: "More than a million roof tiles and a harbour that glows at blue hour. Arrive by ferry.",
    moment: { slot: "Evening", time: "6:30 PM", title: "Harbour ferry at blue hour" },
  },
  {
    slug: "statue-of-liberty",
    scene: "newyork",
    name: "Statue of Liberty",
    place: "New York, USA",
    query: "New York City, USA",
    lat: 40.6892,
    lng: -74.0445,
    bestTime: "Apr – Jun",
    days: "5 days",
    blurb: "Green copper, golden torch — and the best view is from the free Staten Island Ferry.",
    moment: { slot: "Evening", time: "7:00 PM", title: "Staten Island Ferry at dusk" },
  },
  {
    slug: "big-ben",
    scene: "london",
    name: "Big Ben",
    place: "London, United Kingdom",
    query: "London, United Kingdom",
    lat: 51.5007,
    lng: -0.1246,
    bestTime: "May – Sep",
    days: "4 days",
    blurb: "The Great Bell has rung the hour over Westminster since 1859. The clock here keeps London time.",
    moment: { slot: "Evening", time: "7:30 PM", title: "Walk the South Bank at dusk" },
  },
  {
    slug: "burj-khalifa",
    scene: "dubai",
    name: "Burj Khalifa",
    place: "Dubai, UAE",
    query: "Dubai, UAE",
    lat: 25.1972,
    lng: 55.2744,
    bestTime: "Nov – Mar",
    days: "3–4 days",
    blurb: "828 metres of glass and steel, with the desert stretching away on the horizon.",
    moment: { slot: "Evening", time: "6:00 PM", title: "Sunset from the 148th floor" },
  },
  {
    slug: "golden-gate-bridge",
    scene: "sanfrancisco",
    name: "Golden Gate Bridge",
    place: "San Francisco, USA",
    query: "San Francisco, USA",
    lat: 37.8199,
    lng: -122.4783,
    bestTime: "Sep – Nov",
    days: "3 days",
    blurb: "International Orange, rising out of the fog since 1937. Walk it end to end.",
    moment: { slot: "Morning", time: "7:30 AM", title: "Walk the bridge in the fog" },
  },
  {
    slug: "angkor-wat",
    scene: "angkor",
    name: "Angkor Wat",
    place: "Siem Reap, Cambodia",
    query: "Siem Reap, Cambodia",
    lat: 13.4125,
    lng: 103.867,
    bestTime: "Nov – Feb",
    days: "3 days",
    blurb: "Five lotus towers doubled in the reflecting pool as the sun comes up behind them.",
    moment: { slot: "Morning", time: "5:30 AM", title: "Sunrise over the lotus pond" },
  },
];

export const destinationBySlug = (slug: string) => DESTINATIONS.find((d) => d.slug === slug);

/** The ten wonders featured in the landing gallery. */
export const WONDERS = DESTINATIONS.slice(0, 10);

/** Scenes that rotate through the hero window. */
export const HERO_SEQUENCE = ["taj-mahal", "eiffel-tower", "mount-fuji", "santorini", "colosseum", "machu-picchu", "sydney-opera-house", "statue-of-liberty"].map(
  (s) => destinationBySlug(s)!
);

export function formatCoords(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

/* -------------------------------------------------------------------------- */
/*                     Pick a poster for any destination                      */
/* -------------------------------------------------------------------------- */

// Ordered: specific places first, broad countries last.
const RULES: [SceneId, string[]][] = [
  ["coast", ["beach", "island", "islands", "goa", "bali", "maldives", "phuket", "krabi", "hawaii", "kerala", "caribbean", "cancun", "seychelles", "mauritius", "fiji", "boracay", "andaman", "zanzibar", "miami", "sri lanka", "lakshadweep", "pondicherry", "gokarna", "tahiti", "bora bora", "langkawi", "palawan", "amalfi"]],
  ["aurora", ["iceland", "reykjavik", "norway", "tromso", "finland", "lapland", "alaska", "greenland", "sweden", "svalbard", "aurora", "northern lights"]],
  ["dunes", ["desert", "sahara", "morocco", "marrakech", "jaisalmer", "wadi rum", "jordan", "petra", "namibia", "oman", "atacama", "thar"]],
  ["peaks", ["mountain", "mountains", "trek", "himalaya", "himalayas", "ladakh", "leh", "manali", "shimla", "kashmir", "srinagar", "sikkim", "darjeeling", "rishikesh", "nepal", "kathmandu", "everest", "bhutan", "tibet", "switzerland", "zermatt", "interlaken", "alps", "dolomites", "patagonia", "new zealand", "queenstown", "banff", "colorado", "scotland", "yosemite", "spiti"]],
  ["fuji", ["japan", "tokyo", "kyoto", "osaka", "nara", "hokkaido", "fuji", "hakone", "hiroshima"]],
  ["santorini", ["greece", "santorini", "oia", "athens", "mykonos", "crete", "cyclades"]],
  ["machupicchu", ["peru", "cusco", "machu", "lima", "andes", "bolivia", "ecuador"]],
  ["rio", ["rio", "brazil", "sao paulo", "buenos aires", "argentina", "colombia"]],
  ["sydney", ["sydney", "australia", "melbourne", "brisbane", "perth"]],
  ["sanfrancisco", ["san francisco", "california", "los angeles", "seattle", "vancouver", "san diego"]],
  ["newyork", ["new york", "nyc", "manhattan", "brooklyn", "boston", "chicago", "washington", "usa", "united states", "america", "toronto", "canada"]],
  ["london", ["london", "england", "united kingdom", "uk", "britain", "edinburgh", "dublin", "ireland", "amsterdam", "netherlands", "belgium", "brussels"]],
  ["dubai", ["dubai", "uae", "abu dhabi", "emirates", "qatar", "doha", "saudi", "riyadh", "bahrain", "singapore", "hong kong", "shanghai"]],
  ["angkor", ["cambodia", "siem reap", "angkor", "vietnam", "hanoi", "ha long", "thailand", "bangkok", "chiang mai", "laos", "myanmar", "bagan", "indonesia", "yogyakarta"]],
  ["pyramids", ["egypt", "cairo", "giza", "luxor", "aswan"]],
  ["colosseum", ["rome", "italy", "florence", "venice", "milan", "naples", "tuscany", "sicily", "spain", "madrid", "barcelona", "portugal", "lisbon"]],
  ["eiffel", ["paris", "france", "lyon", "nice", "provence", "germany", "berlin", "munich", "vienna", "austria", "prague", "budapest", "europe"]],
  ["taj", ["india", "agra", "delhi", "jaipur", "udaipur", "jodhpur", "varanasi", "mumbai", "hyderabad", "lucknow", "rajasthan", "kolkata", "bengaluru", "bangalore", "chennai", "amritsar", "mysore", "pakistan", "lahore"]],
];

export function sceneForDestination(destination: string): SceneId {
  const text = ` ${destination.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")} `;
  for (const [scene, words] of RULES) {
    for (const w of words) {
      if (new RegExp(`[^a-z]${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^a-z]`).test(text)) return scene;
    }
  }
  return "peaks";
}
