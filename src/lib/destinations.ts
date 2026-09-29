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
  /** Three-letter city code for the hero's passport stamp. */
  code: string;
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
    code: "AGR",
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
    code: "PAR",
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
    code: "ROM",
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
    code: "CAI",
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
    code: "FUJ",
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
    code: "JTR",
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
    code: "CUZ",
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
    code: "RIO",
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
    code: "SYD",
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
    code: "NYC",
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
    code: "LON",
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
    code: "DXB",
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
    code: "SFO",
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
    code: "REP",
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

/** What a place looks like, as the itinerary AI (or the classifier) describes it. */
export const LANDSCAPES = ["coast", "mountains", "hills", "lake", "desert", "snow", "city"] as const;
export type Landscape = (typeof LANDSCAPES)[number];

const LANDSCAPE_SCENE: Record<Landscape, SceneId> = {
  coast: "coast",
  mountains: "peaks",
  hills: "hills",
  lake: "lake",
  desert: "dunes",
  snow: "aurora",
  city: "city",
};

export const isLandscape = (v: unknown): v is Landscape => typeof v === "string" && (LANDSCAPES as readonly string[]).includes(v);

// 1. The wonder itself: only when the trip is to the monument's own city or site.
const MONUMENT_CITIES: [SceneId, string[]][] = [
  ["taj", ["agra", "taj mahal"]],
  ["eiffel", ["paris"]],
  ["colosseum", ["rome", "roma", "colosseum"]],
  ["pyramids", ["giza", "cairo", "pyramids"]],
  ["fuji", ["mount fuji", "mt fuji", "fuji", "fujiyoshida", "hakone", "kawaguchiko", "kawaguchi"]],
  ["santorini", ["santorini", "oia", "fira"]],
  ["machupicchu", ["machu picchu", "machupicchu", "cusco", "cuzco", "aguas calientes", "sacred valley"]],
  ["rio", ["rio de janeiro", "rio"]],
  ["sydney", ["sydney"]],
  ["newyork", ["new york", "nyc", "manhattan", "brooklyn"]],
  ["london", ["london"]],
  ["dubai", ["dubai"]],
  ["sanfrancisco", ["san francisco"]],
  ["angkor", ["siem reap", "angkor"]],
  ["berlin", ["berlin"]],
];

// 2. The lie of the land. Ordered: the most distinctive landscapes first.
const GEOGRAPHY: [SceneId, string[]][] = [
  ["aurora", ["iceland", "reykjavik", "tromso", "lapland", "rovaniemi", "svalbard", "greenland", "alaska", "fairbanks", "yellowknife", "northern lights", "aurora", "abisko", "lofoten"]],
  ["dunes", ["desert", "sahara", "jaisalmer", "wadi rum", "petra", "namibia", "sossusvlei", "atacama", "thar", "merzouga", "liwa", "bikaner", "kutch", "rann of kutch", "gobi", "uluru", "marrakech", "morocco", "oman", "jordan"]],
  [
    "hills",
    [
      "shillong", "meghalaya", "cherrapunji", "cherrapunjee", "sohra", "mawlynnong", "dawki", "tura", "assam", "kaziranga", "arunachal", "tawang", "ziro", "nagaland", "kohima",
      "mizoram", "aizawl", "manipur", "imphal", "tripura", "munnar", "wayanad", "coorg", "kodagu", "madikeri", "ooty", "kodaikanal", "coonoor", "chikmagalur", "sakleshpur",
      "lonavala", "mahabaleshwar", "matheran", "panchgani", "araku", "yercaud", "thekkady", "vagamon", "agumbe", "western ghats", "north east", "northeast",
      "ubud", "munduk", "ella", "kandy", "nuwara eliya", "cameron highlands", "sapa", "da lat", "dalat", "chiang rai", "luang prabang",
      "costa rica", "monteverde", "la fortuna", "amazon", "borneo", "sabah", "rwanda", "uganda", "madeira", "azores",
      "rainforest", "tea gardens", "tea estates", "hill station",
    ],
  ],
  [
    "lake",
    [
      "srinagar", "dal lake", "kashmir", "udaipur", "nainital", "bhimtal", "pushkar", "bhopal", "alleppey", "alappuzha", "kumarakom", "backwaters",
      "pokhara", "lake como", "como", "bellagio", "lake garda", "garda", "lake bled", "bled", "hallstatt", "lucerne", "annecy", "geneva", "lake tahoe", "tahoe", "lake louise",
      "plitvice", "ohrid", "inle", "lake titicaca", "titicaca", "loch ness", "lake district", "killarney", "lake",
    ],
  ],
  [
    "peaks",
    [
      "mountain", "mountains", "trek", "himalaya", "himalayas", "ladakh", "leh", "manali", "shimla", "kasol", "spiti", "dharamshala", "mcleodganj", "dalhousie", "kasauli", "mussoorie",
      "auli", "gulmarg", "sonamarg", "pahalgam", "kedarnath", "badrinath", "rishikesh", "uttarakhand", "himachal", "sikkim", "gangtok", "pelling", "darjeeling", "kalimpong", "nepal", "kathmandu", "everest", "annapurna",
      "bhutan", "thimphu", "paro", "tibet", "lhasa", "switzerland", "zermatt", "interlaken", "grindelwald", "st moritz", "chamonix", "alps", "dolomites", "tyrol", "innsbruck",
      "patagonia", "torres del paine", "queenstown", "new zealand", "banff", "jasper", "colorado", "aspen", "yosemite", "rockies", "scottish highlands", "highlands", "skye",
      "tbilisi", "georgia", "kazbegi", "kyrgyzstan", "hunza", "skardu", "gilgit", "andes", "la paz", "quito", "bolivia", "ecuador",
    ],
  ],
  [
    "coast",
    [
      "beach", "beaches", "island", "islands", "coast", "goa", "gokarna", "varkala", "kovalam", "pondicherry", "puducherry", "andaman", "havelock", "lakshadweep", "diu", "daman", "puri",
      "kerala", "bali", "lombok", "gili", "maldives", "phuket", "krabi", "koh samui", "ko samui", "koh phangan", "koh tao", "phi phi", "langkawi", "boracay", "palawan", "el nido", "cebu",
      "caribbean", "cancun", "tulum", "playa del carmen", "bahamas", "barbados", "jamaica", "aruba", "puerto rico", "seychelles", "mauritius", "zanzibar", "fiji", "tahiti", "bora bora",
      "miami", "hawaii", "honolulu", "waikiki", "maui", "kauai", "sri lanka", "amalfi", "positano", "capri", "sardinia", "mallorca", "ibiza", "algarve", "mykonos", "crete", "rhodes", "corfu", "dubrovnik", "split", "hvar",
      "nice", "cannes", "cote d'azur", "riviera", "cape town", "gold coast", "byron bay", "cairns", "great barrier reef", "whitsundays", "nha trang", "da nang", "hoi an", "ha long",
      "halong", "sri lanka south", "mirissa", "unawatuna", "bentota", "trincomalee", "pattaya", "hua hin", "cartagena", "florianopolis", "punta cana",
    ],
  ],
];

// 3. A plain city in a wonder's country borrows that wonder.
const COUNTRY_MONUMENT: [SceneId, string[]][] = [
  ["taj", ["india"]],
  ["fuji", ["japan"]],
  ["colosseum", ["italy"]],
  ["eiffel", ["france"]],
  ["pyramids", ["egypt"]],
  ["machupicchu", ["peru"]],
  ["rio", ["brazil"]],
  ["sydney", ["australia"]],
  ["newyork", ["usa", "united states", "america"]],
  ["london", ["uk", "united kingdom", "england", "britain"]],
  ["dubai", ["uae", "united arab emirates", "emirates"]],
  ["angkor", ["cambodia"]],
  ["berlin", ["germany", "deutschland"]],
  ["santorini", ["greece"]],
];

const normalize = (text: string) => ` ${text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9']+/g, " ")} `;
const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, w: string) => new RegExp(`[^a-z]${escape(w)}[^a-z]`).test(text);

function match(rules: [SceneId, string[]][], text: string): SceneId | null {
  for (const [scene, words] of rules) if (words.some((w) => has(text, w))) return scene;
  return null;
}

/** Landscape from keywords, most specific part first: "Gulmarg, Kashmir" is mountains, not the lake. */
function geography(destination: string): SceneId | null {
  const parts = destination.split(/[,;/(]/).map(normalize);
  for (const part of parts) {
    const scene = match(GEOGRAPHY, part);
    if (scene) return scene;
  }
  return null;
}

/**
 * The poster for a trip. The wonder when you're visiting its own city; otherwise
 * the destination's landscape (from the AI when known); a plain city borrows its
 * country's wonder; anything else gets a city skyline.
 */
export function sceneForDestination(destination: string, landscape?: string | null): SceneId {
  const text = normalize(destination);
  const monument = match(MONUMENT_CITIES, text);
  if (monument) return monument;
  if (isLandscape(landscape)) return landscape === "city" ? match(COUNTRY_MONUMENT, text) ?? "city" : LANDSCAPE_SCENE[landscape];
  return geography(destination) ?? match(COUNTRY_MONUMENT, text) ?? "city";
}

/** Whether keywords alone settle it (a wonder or a known landscape), so the classifier needn't be asked. */
export const sceneIsCertain = (destination: string) => !!(match(MONUMENT_CITIES, normalize(destination)) || geography(destination));
