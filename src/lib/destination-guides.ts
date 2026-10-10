/**
 * Hand-written destination guides for /destinations/[slug]. Facts are kept
 * concrete (months, prices in INR, distances) so the pages are genuinely useful.
 */

export interface Attraction {
  name: string;
  description: string;
  tip: string;
  lat: number;
  lng: number;
}

export interface DestinationGuide {
  slug: string;
  name: string;
  state: string;
  /** For the planner prefill. */
  destination: string;
  landscape: "coast" | "mountains" | "desert" | "lakes" | "river" | "forest";
  seoTitle: string;
  description: string;
  tagline: string;
  overview: string[];
  bestTime: { summary: string; months: { label: string; note: string; rating: "best" | "good" | "avoid" }[] };
  gettingThere: { mode: string; detail: string }[];
  whereToStay: { area: string; why: string }[];
  attractions: Attraction[];
  food: { name: string; note: string }[];
  budget: { style: string; perDay: string; note: string }[];
  tips: string[];
  faqs: { q: string; a: string }[];
  /** Slugs of public itineraries for this place. */
  itineraries: string[];
}

export const DESTINATION_GUIDES: DestinationGuide[] = [
  {
    slug: "goa",
    name: "Goa",
    state: "Goa",
    destination: "Goa, India",
    landscape: "coast",
    seoTitle: "Goa Travel Guide 2026: Best Time, Beaches, Where to Stay & Budget",
    description: "Plan a Goa trip: north vs south beaches, the best time to visit, where to stay, Portuguese heritage, food to try and daily budgets, plus ready-made 3-day itineraries.",
    tagline: "Portuguese lanes, palm-fringed coves and the best sunsets on India's west coast.",
    overview: [
      "India's smallest state packs in 100 km of coastline, 450 years of Portuguese history and a food culture all its own. North Goa (Baga, Anjuna, Vagator) is busy, social and built for nightlife; South Goa (Palolem, Agonda, Cola) is slower, greener and quieter.",
      "Inland, Old Goa's baroque churches are a UNESCO World Heritage Site, Panjim's Fontainhas quarter keeps its colour-washed Portuguese houses, and spice plantations line the road to Dudhsagar Falls.",
    ],
    bestTime: {
      summary: "November to February is peak: dry, sunny and 21-32°C. The monsoon (June to September) is lush and cheap, but the sea is rough and many beach shacks close.",
      months: [
        { label: "Nov - Feb", note: "Dry and sunny, peak prices around Christmas and New Year", rating: "best" },
        { label: "Mar - May", note: "Hot and humid, quieter beaches, lower prices", rating: "good" },
        { label: "Jun - Sep", note: "Monsoon: green and dramatic, rough seas, many shacks shut", rating: "avoid" },
        { label: "Oct", note: "Shoulder season, shacks reopening, good deals", rating: "good" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Two airports: Dabolim (GOI) near Vasco, and Manohar International (GOX) at Mopa in the north, closer to the northern beaches." },
      { mode: "Train", detail: "Madgaon (south) and Thivim (north) are on the Konkan Railway, with direct trains from Mumbai (about 9-12 hours)." },
      { mode: "Getting around", detail: "Rent a scooter (₹300-400 a day, licence required), use the GoaMiles app taxis, or hire a car with driver for day trips." },
    ],
    whereToStay: [
      { area: "Candolim & Sinquerim", why: "Comfortable hotels close to Fort Aguada and the north's restaurants, without Baga's noise." },
      { area: "Anjuna & Vagator", why: "Hostels, cafés, cliffs and the Wednesday flea market; the social backpacker base." },
      { area: "Assagao", why: "Boutique villas and some of Goa's best restaurants, a short ride from the beaches." },
      { area: "Palolem & Agonda", why: "Beach huts on calm, swimmable bays in the south; best for couples and quiet." },
      { area: "Panjim (Fontainhas)", why: "Heritage guesthouses in the capital's Latin quarter, for culture and food." },
    ],
    attractions: [
      { name: "Basilica of Bom Jesus", description: "The 16th-century church holding the relics of St Francis Xavier, at the heart of UNESCO-listed Old Goa.", tip: "Free entry; dress modestly and pair it with the Sé Cathedral opposite.", lat: 15.5009, lng: 73.9116 },
      { name: "Fontainhas", description: "Panjim's Latin quarter of narrow lanes, yellow and blue houses and tiled nameplates.", tip: "Go in the morning light and stay for a fish-thali lunch nearby.", lat: 15.4979, lng: 73.8317 },
      { name: "Fort Aguada", description: "A 17th-century Portuguese fort and lighthouse guarding the Mandovi estuary.", tip: "Arrive before 10 AM to beat the heat and the tour buses.", lat: 15.4920, lng: 73.7735 },
      { name: "Chapora Fort", description: "A ruined laterite fort above Vagator, famous from the film Dil Chahta Hai, with sunset views over the river mouth.", tip: "Wear grippy shoes; the path up is loose.", lat: 15.6066, lng: 73.7368 },
      { name: "Palolem Beach", description: "A curved bay of sand and palms in the south, calm enough to swim in winter.", tip: "Take a shared boat to Butterfly Beach from the north end.", lat: 15.0100, lng: 74.0232 },
      { name: "Anjuna Flea Market", description: "A Wednesday market by the beach selling textiles, jewellery and spices since the hippie era.", tip: "It runs November to April; bargain gently.", lat: 15.5735, lng: 73.7410 },
      { name: "Dudhsagar Falls", description: "A four-tiered, 310-metre waterfall on the Karnataka border, at its fullest after the monsoon.", tip: "Jeep safaris run from Collem; the falls are best October to December.", lat: 15.3144, lng: 74.3144 },
      { name: "Cabo de Rama Fort", description: "A clifftop fort and chapel in the south with sweeping sea views and few visitors.", tip: "Combine it with Cola beach on the same ride.", lat: 15.0896, lng: 73.9207 },
    ],
    food: [
      { name: "Fish curry rice", note: "The everyday Goan meal: coconut-tamarind curry with the catch of the day." },
      { name: "Pork vindaloo", note: "Goa's original, sharp with vinegar and garlic, a Portuguese legacy." },
      { name: "Xacuti", note: "Chicken or mushroom in a dark roasted-coconut and spice gravy." },
      { name: "Bebinca", note: "A layered coconut-milk dessert baked one layer at a time." },
      { name: "Feni", note: "The local spirit, distilled from cashew fruit or coconut toddy." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹2,000-3,500", note: "Hostel dorm, scooter, shack meals" },
      { style: "Mid-range", perDay: "₹5,000-9,000", note: "Boutique hotel, restaurants, taxis" },
      { style: "Comfort", perDay: "₹15,000+", note: "Beach resort, fine dining, private car" },
    ],
    tips: [
      "Always wear a helmet on a scooter; police checks are frequent.",
      "Swim only at beaches with lifeguards and flags; currents can be strong.",
      "Many places accept UPI, but carry cash for shacks and markets.",
    ],
    faqs: [
      { q: "North Goa or South Goa: which is better?", a: "North Goa for nightlife, markets and a social scene; South Goa for quieter, cleaner beaches and couples. A 3-4 day trip can comfortably include both." },
      { q: "How many days do you need in Goa?", a: "Three days covers the north's highlights and Panjim; five lets you add the south and Dudhsagar Falls." },
      { q: "Is Goa safe for solo women travellers?", a: "Generally yes. Take normal precautions: avoid empty beaches late at night, use app taxis, and keep an eye on drinks." },
      { q: "Is Goa expensive?", a: "It can be done on ₹2,000-3,500 a day in hostels, but prices roughly double over Christmas and New Year." },
    ],
    itineraries: ["goa-3-days", "goa-3-days-budget"],
  },
  {
    slug: "hampi",
    name: "Hampi",
    state: "Karnataka",
    destination: "Hampi, India",
    landscape: "desert",
    seoTitle: "Hampi Travel Guide: Best Time, Ruins to See, Where to Stay & Budget",
    description: "Everything for planning Hampi: the must-see ruins of the Vijayanagara empire, best time to visit, how to get there from Bengaluru, where to stay and a 3-day itinerary for couples.",
    tagline: "The ruined capital of the Vijayanagara empire, scattered across a landscape of giant boulders.",
    overview: [
      "In the 1500s Hampi was one of the largest cities in the world, the capital of the Vijayanagara empire. Today its 1,600 surviving monuments, a UNESCO World Heritage Site, lie spread across a surreal landscape of granite boulders and banana plantations along the Tungabhadra river.",
      "The area divides into the Sacred Centre around the still-active Virupaksha Temple and Hampi Bazaar, the Royal Centre with its palaces and stepwells, and the riverside path to the Vittala Temple. Across the river, Anegundi and Sanapur offer villages, lakes and climbing boulders.",
    ],
    bestTime: {
      summary: "October to February, with daytime highs of 25-30°C. March to May is extremely hot; the June-September monsoon turns everything green.",
      months: [
        { label: "Oct - Feb", note: "Dry, warm days and cool evenings; peak season", rating: "best" },
        { label: "Mar - May", note: "Very hot (often 38°C+); explore only early and late", rating: "avoid" },
        { label: "Jun - Sep", note: "Monsoon greenery, fewer visitors, some boat rides stop", rating: "good" },
      ],
    },
    gettingThere: [
      { mode: "Train", detail: "Hosapete (Hospet) Junction is 13 km away, with overnight trains from Bengaluru (about 8-9 hours)." },
      { mode: "Air", detail: "The nearest airport with regular flights is Hubballi (about 165 km); JSW's Vidyanagar airport (40 km) has limited flights." },
      { mode: "Getting around", detail: "Hire an auto for the day (₹1,000-1,500), or rent a bicycle or scooter. Electric buggies run to Vittala from the ticket point." },
    ],
    whereToStay: [
      { area: "Hampi Bazaar area", why: "Simple guesthouses walking distance from Virupaksha and Hemakuta Hill." },
      { area: "Kamalapura", why: "Larger hotels and resorts near the Royal Centre, including heritage-style stays." },
      { area: "Anegundi", why: "Village homestays across the river, close to Sanapur Lake and Anjanadri Hill." },
      { area: "Hosapete", why: "City hotels near the railway station, best if you arrive late." },
    ],
    attractions: [
      { name: "Virupaksha Temple", description: "A 7th-century Shiva temple still in daily worship, with a 50-m gopuram over the bazaar.", tip: "Come for the morning puja; the temple elephant gives blessings.", lat: 15.3350, lng: 76.4600 },
      { name: "Vittala Temple and Stone Chariot", description: "Hampi's finest carving, with the stone chariot that appears on the ₹50 note.", tip: "Arrive at opening; the combined ticket also covers Lotus Mahal.", lat: 15.3426, lng: 76.4747 },
      { name: "Hemakuta Hill", description: "A granite hill of early temples and the most popular sunset viewpoint.", tip: "An easy climb from the bazaar; leave before dark.", lat: 15.3343, lng: 76.4590 },
      { name: "Lotus Mahal and Elephant Stables", description: "An Indo-Islamic pavilion and eleven domed stables in the royal women's enclosure.", tip: "Same ticket as Vittala.", lat: 15.3186, lng: 76.4710 },
      { name: "Hazara Rama Temple", description: "The royal chapel, its walls carved with the Ramayana and festival processions.", tip: "Look for the panels of horses and dancers on the outer wall.", lat: 15.3197, lng: 76.4683 },
      { name: "Queen's Bath", description: "A plain exterior hiding an ornate arcaded pool.", tip: "Five minutes from the Royal Enclosure; combine them.", lat: 15.3152, lng: 76.4730 },
      { name: "Matanga Hill", description: "The highest point in Hampi and the best sunrise view over the ruins.", tip: "Start the climb in the dark with a torch and a guide or group.", lat: 15.3365, lng: 76.4683 },
      { name: "Sanapur Lake", description: "A boulder-ringed reservoir across the river, popular for coracle rides at sunset.", tip: "Take the ferry or drive via the bridge near Kamalapura.", lat: 15.3666, lng: 76.4566 },
    ],
    food: [
      { name: "Banana-leaf thali", note: "Unlimited rice, sambar, rasam and vegetables, the best-value meal in Hampi." },
      { name: "Masala dosa", note: "Crisp and served with coconut chutney at breakfast stalls in the bazaar." },
      { name: "Jolada rotti", note: "North-Karnataka sorghum flatbread with spicy brinjal ennegai." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹1,500-2,500", note: "Guesthouse, bicycle, thalis" },
      { style: "Mid-range", perDay: "₹4,000-7,000", note: "Resort, daily auto, guide" },
      { style: "Comfort", perDay: "₹20,000+", note: "Luxury palace resort and private car" },
    ],
    tips: [
      "Hampi Bazaar is a temple town: alcohol isn't served and meat is rare.",
      "Hire an ASI-licensed guide at least once; the stories transform the ruins.",
      "Carry water and a hat; there's little shade between sites.",
    ],
    faqs: [
      { q: "How many days are enough for Hampi?", a: "Two days covers the main ruins; three lets you add Sanapur, Anegundi and sunrise on Matanga Hill without rushing." },
      { q: "How do I reach Hampi from Bengaluru?", a: "Take an overnight train or bus to Hosapete (about 340 km), then an auto or bus 13 km to Hampi." },
      { q: "What is the entry fee for Hampi?", a: "Most monuments are free; the combined ASI ticket for Vittala, Lotus Mahal and the Elephant Stables is about ₹40 for Indians and ₹600 for foreigners." },
      { q: "Is Hampi good for couples?", a: "Very. Sunsets on the boulders, coracle rides and quiet resorts make it one of South India's most romantic trips." },
    ],
    itineraries: ["hampi-3-days-couples"],
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    destination: "Jaipur, India",
    landscape: "desert",
    seoTitle: "Jaipur Travel Guide: Forts, Best Time, Where to Stay & Budget",
    description: "Plan Jaipur, the Pink City: Amer and Nahargarh forts, the City Palace, Hawa Mahal, bazaars, the composite ticket, where to stay and a 2-day itinerary.",
    tagline: "The Pink City: hill forts, royal palaces and some of India's best bazaars.",
    overview: [
      "Rajasthan's capital was laid out in 1727 on a grid by Maharaja Sawai Jai Singh II, and painted terracotta pink in 1876 to welcome the Prince of Wales. Its walled old city is a UNESCO World Heritage Site, along with the Jantar Mantar observatory and Amer Fort.",
      "Jaipur is one point of India's 'Golden Triangle' with Delhi and Agra, about 4-5 hours by road from each, and makes a natural first taste of Rajasthan.",
    ],
    bestTime: {
      summary: "October to March, with warm days and cool nights. April to June regularly passes 40°C.",
      months: [
        { label: "Oct - Mar", note: "Pleasant days; festival season (Diwali, Jaipur Literature Festival in January)", rating: "best" },
        { label: "Apr - Jun", note: "Extreme heat; sightsee only early morning and evening", rating: "avoid" },
        { label: "Jul - Sep", note: "Monsoon showers, green hills around Amer", rating: "good" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Jaipur International Airport (JAI) has direct flights from most Indian metros." },
      { mode: "Train", detail: "The Shatabdi and Vande Bharat from Delhi take about 4-4.5 hours." },
      { mode: "Getting around", detail: "Uber, Ola and autos are cheap; a car with driver for a day of forts costs about ₹2,000-3,000." },
    ],
    whereToStay: [
      { area: "Old City", why: "Heritage havelis walking distance from the bazaars and Hawa Mahal." },
      { area: "C-Scheme", why: "Central, quieter and full of good restaurants." },
      { area: "Amer Road", why: "Palace hotels between the city and Amer Fort." },
    ],
    attractions: [
      { name: "Amer Fort", description: "A hilltop fort-palace with the mirror-work Sheesh Mahal, above Maota Lake.", tip: "Arrive at 8 AM opening; skip the elephant rides.", lat: 26.9855, lng: 75.8513 },
      { name: "City Palace", description: "The royal residence, part of it still home to the former royal family, with museums and painted gates.", tip: "The four seasonal gates of Pritam Niwas Chowk are the highlight.", lat: 26.9258, lng: 75.8237 },
      { name: "Hawa Mahal", description: "The 953-window 'Palace of Winds' built so royal women could watch street life unseen.", tip: "Best viewed from the cafés opposite.", lat: 26.9239, lng: 75.8267 },
      { name: "Jantar Mantar", description: "An 18th-century observatory with the world's largest stone sundial.", tip: "Hire a guide; the instruments make sense when explained.", lat: 26.9248, lng: 75.8246 },
      { name: "Nahargarh Fort", description: "A ridge-top fort with the city's best sunset view.", tip: "Take a cab up; the road is steep.", lat: 26.9374, lng: 75.8156 },
      { name: "Jal Mahal", description: "A palace that appears to float in Man Sagar Lake.", tip: "Viewed from the promenade; the palace itself is closed.", lat: 26.9535, lng: 75.8463 },
      { name: "Albert Hall Museum", description: "Rajasthan's oldest museum, in an Indo-Saracenic building lit up at night.", tip: "Visit at dusk for the illuminations.", lat: 26.9116, lng: 75.8195 },
      { name: "Galta Ji (Monkey Temple)", description: "A temple complex in a mountain pass with natural spring-fed pools.", tip: "Go for sunset; keep food out of sight of the monkeys.", lat: 26.9187, lng: 75.8584 },
    ],
    food: [
      { name: "Dal baati churma", note: "Baked wheat balls with lentils and sweet crumbled churma: Rajasthan on a plate." },
      { name: "Pyaaz kachori", note: "Onion-filled fried pastry, best at Rawat Mishthan Bhandar." },
      { name: "Lassi", note: "Thick and creamy in clay cups at Lassiwala on MI Road." },
      { name: "Laal maas", note: "Fiery mutton curry coloured with Mathania chillies." },
      { name: "Ghewar", note: "A honeycomb sweet soaked in syrup, a winter and monsoon specialty." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹1,800-3,000", note: "Hostel, autos, street food" },
      { style: "Mid-range", perDay: "₹5,000-9,000", note: "Heritage haveli, cabs, restaurants" },
      { style: "Comfort", perDay: "₹20,000+", note: "Palace hotel and private driver" },
    ],
    tips: [
      "Buy the composite ticket: it covers Amer, Nahargarh, Albert Hall, Jantar Mantar, Hawa Mahal and more for two days.",
      "Gem 'investment' offers from friendly strangers are a well-known scam.",
      "Bargain in bazaars; start around half the first price.",
    ],
    faqs: [
      { q: "How many days are enough for Jaipur?", a: "Two days covers the major forts and old city; three adds museums, Galta Ji and a cooking class." },
      { q: "Is Jaipur worth visiting?", a: "Yes: it combines hill forts, palaces, an astronomical observatory and great shopping, all within a compact city." },
      { q: "Delhi to Jaipur: train or road?", a: "The train (about 4-4.5 hours) is quickest and most comfortable; the road takes 5-6 hours depending on traffic." },
      { q: "What is Jaipur famous for shopping?", a: "Block-printed textiles, blue pottery, gemstones, mojari shoes and lac bangles." },
    ],
    itineraries: ["jaipur-2-days"],
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    destination: "Udaipur, India",
    landscape: "lakes",
    seoTitle: "Udaipur Travel Guide: Lakes, Palaces, Best Time & Where to Stay",
    description: "Plan Udaipur, the City of Lakes: the City Palace, Lake Pichola boat rides, Sajjangarh, the best sunset spots, lake-view hotels and a 3-day itinerary for couples.",
    tagline: "The City of Lakes: marble palaces on Pichola, rooftop sunsets and the Aravalli hills.",
    overview: [
      "Founded in 1559 by Maharana Udai Singh II, Udaipur grew up around a chain of man-made lakes. The City Palace rises above Lake Pichola, the white Lake Palace seems to float on it, and the old city's lanes run down to bathing ghats.",
      "It's Rajasthan's most romantic city and the most relaxed: days are for palaces and havelis, evenings for boat rides and rooftop dinners.",
    ],
    bestTime: {
      summary: "October to March for mild weather; September to October when the lakes are fullest after the monsoon.",
      months: [
        { label: "Sep - Mar", note: "Pleasant, full lakes after the monsoon; peak season", rating: "best" },
        { label: "Apr - Jun", note: "Hot (up to 40°C), lower lake levels", rating: "avoid" },
        { label: "Jul - Aug", note: "Monsoon: green hills and dramatic skies", rating: "good" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Maharana Pratap Airport (UDR), 22 km from the city, has direct flights from Delhi, Mumbai and Bengaluru." },
      { mode: "Train", detail: "Udaipur City station connects to Delhi, Jaipur and Ahmedabad." },
      { mode: "Getting around", detail: "Walk the old city; autos for short hops; a cab for Sajjangarh and day trips." },
    ],
    whereToStay: [
      { area: "Lal Ghat & Gangaur Ghat", why: "Lake-view havelis in the heart of the old city." },
      { area: "Hanuman Ghat (Ambrai)", why: "Quieter west bank with views back to the City Palace." },
      { area: "Lake Pichola islands", why: "The Taj Lake Palace and Jagmandir Island Palace for a splurge." },
      { area: "Fateh Sagar", why: "Modern hotels near the promenade, quieter at night." },
    ],
    attractions: [
      { name: "City Palace", description: "A complex of palaces built over 400 years, with peacock mosaics and mirrored halls.", tip: "Take the audio guide; it's a maze.", lat: 24.5764, lng: 73.6835 },
      { name: "Lake Pichola boat ride", description: "Boats from the City Palace jetty stop at the island palace of Jag Mandir.", tip: "Book the sunset departure in the morning.", lat: 24.5675, lng: 73.6799 },
      { name: "Sajjangarh Monsoon Palace", description: "A hilltop palace with views over all of Udaipur's lakes.", tip: "Go for sunset; vehicles stop going up around dusk.", lat: 24.5944, lng: 73.6386 },
      { name: "Jagdish Temple", description: "A carved 17th-century Vishnu temple in the old city.", tip: "Visit at the evening aarti.", lat: 24.5797, lng: 73.6838 },
      { name: "Bagore ki Haveli", description: "An 18th-century mansion museum with a nightly folk dance show.", tip: "The Dharohar show starts around 7 PM.", lat: 24.5797, lng: 73.6819 },
      { name: "Saheliyon ki Bari", description: "A garden of fountains, lotus pools and marble elephants.", tip: "Pair with a walk on Fateh Sagar's promenade.", lat: 24.6022, lng: 73.6866 },
      { name: "Fateh Sagar Lake", description: "A larger lake north of the city with a lively evening promenade.", tip: "Try the boat to Nehru Garden island.", lat: 24.6007, lng: 73.6777 },
      { name: "Eklingji Temple", description: "The Mewar rulers' family temple, 22 km north in the Aravallis.", tip: "No phones or cameras inside.", lat: 24.7469, lng: 73.7207 },
    ],
    food: [
      { name: "Dal baati churma", note: "The Rajasthani classic, at its best in thali restaurants." },
      { name: "Gatte ki sabzi", note: "Gram-flour dumplings in spiced yoghurt gravy." },
      { name: "Mirchi vada", note: "Stuffed green chilli fritters, a street-food favourite." },
      { name: "Malpua", note: "Syrup-soaked pancakes from old-city sweet shops." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹2,000-3,000", note: "Guesthouse, walking, local thalis" },
      { style: "Mid-range", perDay: "₹6,000-10,000", note: "Lake-view haveli, boat rides, rooftop dinners" },
      { style: "Comfort", perDay: "₹40,000+", note: "Lake Palace or Oberoi Udaivilas" },
    ],
    tips: [
      "Reserve lake-edge dinner tables a day ahead on weekends.",
      "Most sights close by 5-6 PM; keep evenings for the lakes.",
      "The Octopussy screenings in old-city cafés are a long-running Udaipur ritual.",
    ],
    faqs: [
      { q: "How many days are enough for Udaipur?", a: "Two days for the main sights; three to add Eklingji, Nagda and a slower pace by the lakes." },
      { q: "Is Udaipur good for a honeymoon?", a: "Yes, it's one of India's most popular honeymoon cities for its lake-view hotels, boat rides and romantic dinners." },
      { q: "Which is better, Jaipur or Udaipur?", a: "Jaipur for forts and shopping, Udaipur for lakes and a relaxed, romantic pace. Many trips combine both." },
      { q: "Can you visit the Taj Lake Palace without staying?", a: "Generally no; access is for hotel guests and restaurant reservations only." },
    ],
    itineraries: ["udaipur-3-days-couples"],
  },
  {
    slug: "kerala",
    name: "Kerala",
    state: "Kerala",
    destination: "Kerala, India",
    landscape: "forest",
    seoTitle: "Kerala Travel Guide: Backwaters, Munnar, Best Time & Budget",
    description: "Plan Kerala: Alleppey houseboats, Munnar tea gardens, Fort Kochi, Thekkady and Varkala, the best season, how to get around and a 5-day itinerary.",
    tagline: "God's Own Country: backwaters, misty tea hills and a spice-scented coast.",
    overview: [
      "A narrow strip between the Arabian Sea and the Western Ghats, Kerala packs in palm-lined backwaters, tea and cardamom hills, wildlife reserves and beaches into a state you can cross by car in a few hours.",
      "Its history as a spice-trading coast shows in Fort Kochi's Chinese fishing nets, Portuguese churches and the old Jewish quarter, and in a cuisine built on coconut, pepper and seafood.",
    ],
    bestTime: {
      summary: "September to March is ideal. The June-August monsoon is heavy but popular for Ayurvedic treatments.",
      months: [
        { label: "Sep - Mar", note: "Dry and pleasant, best for backwaters and hills", rating: "best" },
        { label: "Apr - May", note: "Hot and humid on the coast; hills are cool", rating: "good" },
        { label: "Jun - Aug", note: "Heavy monsoon; lush and quiet, ideal for Ayurveda", rating: "good" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Kochi (COK) and Thiruvananthapuram (TRV) are the main airports, with Kozhikode in the north." },
      { mode: "Train", detail: "Good rail links along the coast; Ernakulam is the hub for Kochi." },
      { mode: "Getting around", detail: "A car with driver is the easiest way to link Kochi, Munnar, Thekkady and Alleppey." },
    ],
    whereToStay: [
      { area: "Fort Kochi", why: "Heritage homestays and boutique hotels in walkable colonial streets." },
      { area: "Munnar", why: "Hillside resorts among tea estates, cool all year." },
      { area: "Alleppey (Alappuzha)", why: "Overnight houseboats or lakeside homestays on the backwaters." },
      { area: "Varkala", why: "Clifftop guesthouses above the beach, good for a relaxed finish." },
    ],
    attractions: [
      { name: "Alleppey backwaters", description: "A network of canals and lakes best seen from a kettuvallam houseboat.", tip: "Book overnight houseboats with a private deck and AC at night.", lat: 9.4981, lng: 76.3388 },
      { name: "Munnar tea gardens", description: "Rolling tea estates at 1,600 m with a working tea museum.", tip: "Go early before the mist and tour buses.", lat: 10.0889, lng: 77.0595 },
      { name: "Eravikulam National Park", description: "Grasslands home to the endangered Nilgiri tahr.", tip: "Closed for the calving season around February-March.", lat: 10.1980, lng: 77.0590 },
      { name: "Fort Kochi Chinese fishing nets", description: "Cantilevered nets on the waterfront, worked by teams of fishermen.", tip: "Sunset is the best time to watch.", lat: 9.9677, lng: 76.2424 },
      { name: "Mattancherry and Jew Town", description: "The Dutch Palace, Paradesi Synagogue and antique shops.", tip: "The synagogue closes on Fridays, Saturdays and Jewish holidays.", lat: 9.9573, lng: 76.2593 },
      { name: "Periyar Tiger Reserve, Thekkady", description: "Boat safaris on Periyar Lake and spice-plantation walks.", tip: "Take the first boat of the day for the best wildlife.", lat: 9.4630, lng: 77.1670 },
      { name: "Varkala Cliff", description: "Red laterite cliffs above a beach, lined with cafés.", tip: "Stay on the North Cliff for sunsets.", lat: 8.7379, lng: 76.7036 },
    ],
    food: [
      { name: "Kerala sadya", note: "A banana-leaf feast of 20+ vegetarian dishes, served at Onam." },
      { name: "Karimeen pollichathu", note: "Pearl-spot fish marinated and grilled in banana leaf." },
      { name: "Appam and stew", note: "Lacy rice pancakes with a mild coconut-milk stew." },
      { name: "Malabar parotta and beef fry", note: "Flaky layered bread with spiced fried beef." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹2,000-3,500", note: "Homestays, buses, local meals" },
      { style: "Mid-range", perDay: "₹6,000-10,000", note: "Resorts, a private car, houseboat night" },
      { style: "Comfort", perDay: "₹18,000+", note: "Luxury resorts and premium houseboats" },
    ],
    tips: [
      "Hire a driver for the hills; Munnar's roads are narrow and winding.",
      "Carry a light rain jacket even outside the monsoon.",
      "Check houseboat licences and ask what's included before you pay.",
    ],
    faqs: [
      { q: "How many days do you need in Kerala?", a: "Five days covers Kochi, Munnar and Alleppey; seven adds Thekkady and Varkala." },
      { q: "Is a houseboat worth it?", a: "Yes. An overnight houseboat is the signature Kerala experience; day cruises are a cheaper alternative." },
      { q: "When is the best time for Kerala backwaters?", a: "September to March, when the weather is dry and the water calm." },
      { q: "Is Kerala good for families?", a: "Very: short drives, gentle activities, wildlife boat rides and child-friendly resorts." },
    ],
    itineraries: ["kerala-5-days"],
  },
  {
    slug: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    destination: "Manali, India",
    landscape: "mountains",
    seoTitle: "Manali Travel Guide: Snow, Best Time, Atal Tunnel & Budget",
    description: "Plan Manali: when to see snow, Solang Valley and Atal Tunnel, Old Manali cafés, rafting in Kullu, how to get there from Delhi and a 4-day itinerary for friends.",
    tagline: "Snow peaks, apple orchards and cedar forests at the head of the Kullu valley.",
    overview: [
      "At 2,050 m on the Beas river, Manali is the gateway to the high Himalaya and one of India's most loved mountain towns. New Manali has the Mall and hotels; Old Manali, across the river, is a village of wooden houses, cafés and guesthouses.",
      "Since the Atal Tunnel opened in 2020, Lahaul's high-altitude valleys are a short drive away, adding year-round snow and Sissu's waterfalls to a Manali trip.",
    ],
    bestTime: {
      summary: "March to June and September to October for pleasant weather; December to February for snow in town.",
      months: [
        { label: "Mar - Jun", note: "Pleasant days, snow up at Solang and beyond the tunnel", rating: "best" },
        { label: "Jul - Aug", note: "Monsoon landslide risk; check roads", rating: "avoid" },
        { label: "Sep - Oct", note: "Clear skies, apple harvest", rating: "best" },
        { label: "Dec - Feb", note: "Snow in town; very cold, some roads closed", rating: "good" },
      ],
    },
    gettingThere: [
      { mode: "Bus", detail: "Overnight Volvo buses from Delhi take 12-14 hours." },
      { mode: "Air", detail: "Bhuntar (KUU), 50 km away, has limited flights; Chandigarh is about 8 hours by road." },
      { mode: "Getting around", detail: "Local taxis (union-registered) for Solang, Atal Tunnel and Kullu; walk within Old Manali." },
    ],
    whereToStay: [
      { area: "Old Manali", why: "Cafés, guesthouses and hostels; the social base." },
      { area: "Mall Road area", why: "Hotels with easy access to buses and restaurants." },
      { area: "Vashisht", why: "Quieter village with hot springs and valley views." },
      { area: "Naggar", why: "A heritage castle village 20 km south, peaceful and scenic." },
    ],
    attractions: [
      { name: "Solang Valley", description: "Snow slopes, ropeway and adventure sports 14 km north.", tip: "Rent snow gear at Solang itself.", lat: 32.3164, lng: 77.1567 },
      { name: "Atal Tunnel and Sissu", description: "A 9-km tunnel under Rohtang to Lahaul's stark valleys.", tip: "Check road status the night before.", lat: 32.4025, lng: 77.1499 },
      { name: "Hidimba Devi Temple", description: "A 1553 wooden pagoda temple in a cedar forest.", tip: "Go early to avoid queues.", lat: 32.2482, lng: 77.1801 },
      { name: "Old Manali", description: "The original village of wooden houses, cafés and the Manu Temple.", tip: "Great for live music evenings.", lat: 32.2590, lng: 77.1756 },
      { name: "Vashisht hot springs", description: "Sulphur hot-spring baths beside an old temple.", tip: "Bring a towel; baths are separate for men and women.", lat: 32.2656, lng: 77.1878 },
      { name: "Jogini Falls", description: "A 3-km hike from Vashisht to a sacred waterfall.", tip: "Wear grippy shoes.", lat: 32.2765, lng: 77.1915 },
      { name: "Rohtang Pass", description: "A 3,978-m pass with snow most of the year; permits required.", tip: "Permits are limited daily; book online.", lat: 32.3716, lng: 77.2466 },
      { name: "Naggar Castle", description: "A 15th-century castle hotel with Roerich's art gallery nearby.", tip: "Combine with Kullu on the way.", lat: 32.1131, lng: 77.1672 },
    ],
    food: [
      { name: "Siddu", note: "Steamed wheat bread stuffed with walnuts or poppy seeds, served with ghee." },
      { name: "Himachali trout", note: "Fresh river trout, pan-fried or grilled." },
      { name: "Thukpa and momos", note: "Tibetan-influenced noodle soup and dumplings." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹1,500-2,500", note: "Hostel, shared taxis, cafés" },
      { style: "Mid-range", perDay: "₹4,000-7,000", note: "Hotel, private taxi, activities" },
      { style: "Comfort", perDay: "₹12,000+", note: "Resort and private car" },
    ],
    tips: [
      "Only Manali-registered taxis can run to Solang and the tunnel; outside cabs can't.",
      "Book overnight buses ahead in May-June and December.",
      "Carry cash: ATMs run dry in peak season.",
    ],
    faqs: [
      { q: "When can I see snow in Manali?", a: "In town from about December to February; at Solang and beyond the Atal Tunnel from December to April." },
      { q: "How many days are enough for Manali?", a: "Three to four days covers Manali, Solang, Atal Tunnel and Kullu; add Kasol or Tirthan for a week." },
      { q: "Do I need a permit for Rohtang Pass?", a: "Yes, an online permit is required for vehicles going to Rohtang; Atal Tunnel and Sissu don't need one." },
      { q: "Is Manali good for a friends' trip?", a: "Yes: hostels, cafés, rafting, paragliding and snow make it one of India's favourite group destinations." },
    ],
    itineraries: ["manali-4-days-friends"],
  },
  {
    slug: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    destination: "Rishikesh, India",
    landscape: "river",
    seoTitle: "Rishikesh Travel Guide: Yoga, Rafting, Ganga Aarti & Best Time",
    description: "Plan Rishikesh: yoga and ashrams, rafting from Shivpuri, the Beatles Ashram, Ganga Aarti timings, where to stay and a 3-day itinerary.",
    tagline: "The yoga capital of the world, where the Ganga leaves the Himalaya.",
    overview: [
      "Rishikesh sits where the Ganga emerges from the Himalayan foothills, about 240 km from Delhi. It's a pilgrimage town of ashrams and temples, and since the Beatles' 1968 visit, a global centre for yoga and meditation.",
      "Beyond the spiritual side it's also India's white-water rafting hub, with rapids just upstream at Shivpuri, plus waterfalls, forest walks and riverside cafés in Tapovan.",
    ],
    bestTime: {
      summary: "October to November and February to April are ideal for weather and rafting. Rafting stops in the July-August monsoon.",
      months: [
        { label: "Oct - Nov", note: "Clear, pleasant, rafting open", rating: "best" },
        { label: "Dec - Jan", note: "Cold mornings, quiet ashrams", rating: "good" },
        { label: "Feb - Apr", note: "Warm, rafting open; International Yoga Festival in March", rating: "best" },
        { label: "Jul - Aug", note: "Monsoon; rafting closed", rating: "avoid" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Dehradun's Jolly Grant Airport (DED) is 35 km away." },
      { mode: "Train", detail: "Haridwar is 25 km away with many trains from Delhi; Yog Nagari Rishikesh station also has services." },
      { mode: "Getting around", detail: "Shared autos run between Ram Jhula, Laxman Jhula and Tapovan; walking between ghats is easy." },
    ],
    whereToStay: [
      { area: "Tapovan", why: "Cafés, yoga schools and hostels above Laxman Jhula." },
      { area: "Swarg Ashram", why: "Ashrams and quiet guesthouses near Parmarth Niketan." },
      { area: "Shivpuri", why: "Riverside camps near the rafting put-in." },
    ],
    attractions: [
      { name: "Parmarth Niketan Ganga Aarti", description: "The famous evening aarti with chanting and lamps.", tip: "Arrive by 5:30 PM for a good seat.", lat: 30.1166, lng: 78.3108 },
      { name: "Beatles Ashram", description: "The ruined ashram where the Beatles stayed, covered in murals.", tip: "Carry ID for the ticket.", lat: 30.1062, lng: 78.3189 },
      { name: "Shivpuri rafting", description: "16 km of grade II-III rapids back to Rishikesh.", tip: "Use a state-licensed operator.", lat: 30.1497, lng: 78.3874 },
      { name: "Triveni Ghat", description: "The town's biggest ghat and a grand evening aarti.", tip: "Float a leaf-boat diya.", lat: 30.1033, lng: 78.2972 },
      { name: "Neer Garh Waterfall", description: "Turquoise pools and falls a short hike from the road.", tip: "Slippery after rain.", lat: 30.1415, lng: 78.3332 },
      { name: "Laxman Jhula and Trimbakeshwar Temple", description: "The iconic bridge area with a 13-storey temple.", tip: "Use the new glass bridge alongside.", lat: 30.1270, lng: 78.3299 },
      { name: "Kunjapuri Temple", description: "A hilltop temple with Himalayan sunrise views.", tip: "Leave at 4:30 AM for sunrise.", lat: 30.1966, lng: 78.3713 },
    ],
    food: [
      { name: "Aloo puri and chole", note: "The classic pilgrim's breakfast at Chotiwala." },
      { name: "Ayurvedic thali", note: "Simple, sattvic meals at ashrams and wellness cafés." },
      { name: "Masala chai and smoothie bowls", note: "Tapovan's café staples." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹1,200-2,000", note: "Hostel, shared autos, café food" },
      { style: "Mid-range", perDay: "₹3,500-6,000", note: "Hotel, rafting, classes" },
      { style: "Comfort", perDay: "₹15,000+", note: "Wellness retreat like Ananda" },
    ],
    tips: [
      "Rishikesh is vegetarian and alcohol-free by law.",
      "Dress modestly at ashrams and ghats.",
      "Book multi-day yoga courses in advance in peak season.",
    ],
    faqs: [
      { q: "How many days do you need in Rishikesh?", a: "Two to three days for yoga, rafting and the aartis; longer for a yoga course or retreat." },
      { q: "When is the Ganga Aarti in Rishikesh?", a: "Every evening around sunset, about 5:30-6:30 PM depending on the season, at Parmarth Niketan and Triveni Ghat." },
      { q: "Is Rishikesh safe for solo travellers?", a: "Yes, it's one of India's most popular solo destinations, with a big community of travellers in Tapovan." },
      { q: "What's the best time for rafting in Rishikesh?", a: "September to November and February to June. It's closed in July and August." },
    ],
    itineraries: ["rishikesh-3-days"],
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    destination: "Varanasi, India",
    landscape: "river",
    seoTitle: "Varanasi Travel Guide: Ghats, Ganga Aarti, Best Time & Where to Stay",
    description: "Plan Varanasi: the ghats and boat rides, Ganga Aarti timings, Kashi Vishwanath, Sarnath, food to try, etiquette at the burning ghats and a 2-day itinerary.",
    tagline: "One of the world's oldest living cities, on the banks of the Ganga.",
    overview: [
      "Varanasi (Kashi, Banaras) has been continuously inhabited for over 3,000 years and is Hinduism's holiest city. Its 80-plus ghats line the western bank of the Ganga, where pilgrims bathe at dawn and cremations take place day and night at Manikarnika.",
      "Behind the river lies a maze of narrow lanes, temples and food stalls, and just north is Sarnath, where the Buddha gave his first sermon.",
    ],
    bestTime: {
      summary: "October to March, with foggy, atmospheric winter mornings. Dev Deepawali in November lights every ghat.",
      months: [
        { label: "Oct - Mar", note: "Cool and pleasant; Dev Deepawali in November", rating: "best" },
        { label: "Apr - Jun", note: "Very hot", rating: "avoid" },
        { label: "Jul - Sep", note: "Monsoon flooding can close ghats and boat rides", rating: "avoid" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Lal Bahadur Shastri Airport (VNS) is about 25 km from the ghats." },
      { mode: "Train", detail: "Varanasi Junction and Banaras stations, with the Vande Bharat from Delhi in about 8 hours." },
      { mode: "Getting around", detail: "Walk along the ghats; e-rickshaws and cycle-rickshaws in the city; boats between ghats." },
    ],
    whereToStay: [
      { area: "Assi Ghat", why: "Relaxed southern end with cafés and guesthouses." },
      { area: "Dashashwamedh area", why: "Central, close to the main aarti and temples." },
      { area: "Ghat-front palaces", why: "Heritage hotels like BrijRama right on the river." },
    ],
    attractions: [
      { name: "Dashashwamedh Ghat Ganga Aarti", description: "The city's grand evening fire ritual by seven priests.", tip: "Watch from a boat to avoid the crush.", lat: 25.3069, lng: 83.0105 },
      { name: "Sunrise boat ride", description: "A dawn row along the ghats as the city wakes.", tip: "Agree the price and route first.", lat: 25.2900, lng: 83.0067 },
      { name: "Kashi Vishwanath Temple", description: "The golden-spired Shiva temple, reached by the new corridor.", tip: "Phones and bags aren't allowed inside.", lat: 25.3109, lng: 83.0107 },
      { name: "Sarnath", description: "The deer park of the Buddha's first sermon, with the Dhamek Stupa.", tip: "The museum is closed on Fridays.", lat: 25.3811, lng: 83.0237 },
      { name: "Manikarnika Ghat", description: "The main cremation ghat, burning day and night.", tip: "No photography; observe respectfully.", lat: 25.3108, lng: 83.0142 },
      { name: "Ramnagar Fort", description: "The Maharaja of Banaras's 18th-century fort and museum across the river.", tip: "Go late afternoon.", lat: 25.2672, lng: 83.0256 },
      { name: "Assi Ghat", description: "The southern ghat with a morning Subah-e-Banaras programme and evening aarti.", tip: "Morning yoga and music start around 5 AM.", lat: 25.2867, lng: 83.0068 },
    ],
    food: [
      { name: "Kachori sabzi", note: "The classic Banarasi breakfast." },
      { name: "Lassi", note: "Thick and topped with malai, at Blue Lassi and others." },
      { name: "Malaiyo", note: "Saffron milk foam, only made in winter." },
      { name: "Banarasi paan", note: "The famous betel-leaf digestive." },
      { name: "Tamatar chaat", note: "A spicy, tangy tomato chaat unique to the city." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹1,200-2,000", note: "Hostel, walking, street food" },
      { style: "Mid-range", perDay: "₹3,500-6,000", note: "Ghat-view hotel, boats, guides" },
      { style: "Comfort", perDay: "₹15,000+", note: "Heritage palace hotel" },
    ],
    tips: [
      "Never photograph cremations.",
      "Expect touts at the ghats; politely decline unwanted guides.",
      "Wear slip-on shoes; you'll remove them often at temples.",
    ],
    faqs: [
      { q: "How many days are enough for Varanasi?", a: "Two days covers the ghats at dawn and dusk, the old city and Sarnath; three is more relaxed." },
      { q: "What time is the Ganga Aarti?", a: "Around sunset, about 6:00-7:00 PM depending on the season, at Dashashwamedh and Assi ghats." },
      { q: "Is Varanasi safe for tourists?", a: "Yes, with normal precautions; crowds and touts are the main nuisance." },
      { q: "When is Dev Deepawali?", a: "On the full moon of Kartik (usually November), when the ghats are lit with over a million lamps." },
    ],
    itineraries: ["varanasi-2-days"],
  },
  {
    slug: "ladakh",
    name: "Ladakh",
    state: "Ladakh",
    destination: "Leh, Ladakh, India",
    landscape: "mountains",
    seoTitle: "Ladakh Travel Guide: Best Time, Permits, Acclimatisation & Itinerary",
    description: "Plan Ladakh: the best months, inner-line permits, how to acclimatise, Leh, Nubra Valley, Pangong Tso and Khardung La, costs and a 5-day itinerary.",
    tagline: "High-altitude desert, Buddhist monasteries and lakes of impossible blue.",
    overview: [
      "Ladakh is a high-altitude desert between the Karakoram and the Himalaya, with Leh at about 3,500 m. Its Tibetan-Buddhist culture lives on in hilltop gompas, prayer flags and whitewashed stupas.",
      "The classic circuit links Leh with the Nubra Valley over Khardung La, and Pangong Tso, a 134-km lake that runs into Tibet. Altitude is the defining factor: plan time to acclimatise.",
    ],
    bestTime: {
      summary: "June to September, when the high passes are open. Winter brings -20°C and the frozen-river Chadar trek.",
      months: [
        { label: "Jun - Sep", note: "Passes open, all routes accessible; peak season", rating: "best" },
        { label: "May, Oct", note: "Shoulder months; some passes may close with snow", rating: "good" },
        { label: "Nov - Apr", note: "Extreme cold; flights only, limited routes", rating: "avoid" },
      ],
    },
    gettingThere: [
      { mode: "Air", detail: "Kushok Bakula Rimpochee Airport (IXL) in Leh has flights from Delhi, Mumbai and Srinagar." },
      { mode: "Road", detail: "The Manali-Leh and Srinagar-Leh highways open roughly June to October; both take two days." },
      { mode: "Getting around", detail: "Hire a Ladakh-registered taxi with driver for Nubra and Pangong; outside taxis can't run between sights." },
    ],
    whereToStay: [
      { area: "Leh (Changspa, Main Bazaar)", why: "Hotels and guesthouses close to restaurants and the market." },
      { area: "Nubra (Hunder, Diskit)", why: "Camps and guesthouses near the dunes." },
      { area: "Pangong (Spangmik, Merak)", why: "Lakeside camps for the night." },
    ],
    attractions: [
      { name: "Pangong Tso", description: "A 134-km lake of shifting blues at about 4,350 m.", tip: "Stay a night for sunrise.", lat: 33.9300, lng: 78.5800 },
      { name: "Khardung La", description: "One of the highest motorable passes, around 5,359 m.", tip: "Stay no longer than 15 minutes at the top.", lat: 34.2787, lng: 77.6047 },
      { name: "Nubra Valley and Hunder dunes", description: "Sand dunes and Bactrian camels between snowy peaks.", tip: "Golden hour on the dunes is the highlight.", lat: 34.5826, lng: 77.4710 },
      { name: "Thiksey Monastery", description: "A 12-storey gompa with a two-storey Maitreya Buddha.", tip: "Arrive for 6 AM prayers.", lat: 34.0560, lng: 77.6670 },
      { name: "Hemis Monastery", description: "Ladakh's richest monastery and host of the Hemis Festival.", tip: "Visit the museum of thangkas.", lat: 33.9126, lng: 77.7039 },
      { name: "Shanti Stupa", description: "A white stupa above Leh with sunset views.", tip: "Drive up on day one.", lat: 34.1734, lng: 77.5747 },
      { name: "Leh Palace", description: "A nine-storey 17th-century royal palace over the old town.", tip: "Walk up through the old town lanes.", lat: 34.1653, lng: 77.5859 },
      { name: "Diskit Monastery", description: "Nubra's oldest gompa with a 32-m Maitreya Buddha.", tip: "Go late afternoon for the valley view.", lat: 34.5434, lng: 77.5566 },
    ],
    food: [
      { name: "Thukpa", note: "Hearty noodle soup, perfect at altitude." },
      { name: "Skyu", note: "A Ladakhi pasta stew of hand-rolled dough and vegetables." },
      { name: "Butter tea (gur gur chai)", note: "Salty tea churned with butter." },
      { name: "Apricots", note: "Fresh in August, dried and as jam all year." },
    ],
    budget: [
      { style: "Backpacker", perDay: "₹2,500-4,000", note: "Guesthouse, shared taxis" },
      { style: "Mid-range", perDay: "₹7,000-12,000", note: "Hotel, private taxi, camps" },
      { style: "Comfort", perDay: "₹20,000+", note: "Heritage hotels and luxury camps" },
    ],
    tips: [
      "Rest completely for 24-36 hours after flying into Leh.",
      "Apply for inner-line permits online before heading to Nubra or Pangong.",
      "Only postpaid SIMs work in Ladakh; carry cash, ATMs are scarce outside Leh.",
    ],
    faqs: [
      { q: "How many days do you need for Ladakh?", a: "At least five days for Leh, Nubra and Pangong with an acclimatisation day; seven to nine for Tso Moriri or Turtuk." },
      { q: "Do Indians need a permit for Ladakh?", a: "Yes, an inner-line permit is needed for Nubra, Pangong and other protected areas, applied for online." },
      { q: "How do I prevent altitude sickness in Ladakh?", a: "Rest on arrival, hydrate, avoid alcohol early, ascend gradually and ask your doctor about acetazolamide." },
      { q: "Which month is best for Pangong Lake?", a: "June to September, when the roads are open and the lake is at its bluest." },
    ],
    itineraries: ["ladakh-5-days"],
  },
];

export const guideBySlug = (slug: string) => DESTINATION_GUIDES.find((g) => g.slug === slug);
