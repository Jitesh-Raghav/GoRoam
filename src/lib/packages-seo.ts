/**
 * Search-facing copy for each public itinerary page: the title people search
 * for, a meta description, a short intro, who it suits, and trip-specific FAQs.
 * Hand-written; keep every answer concrete (prices, months, distances), never filler.
 */

export type Region = "India" | "Asia" | "Europe" | "Middle East";

export interface PackageSeo {
  seoTitle: string;
  description: string;
  intro: string;
  whoFor: string;
  region: Region;
  /** The destination guide this trip belongs to, if there is one. */
  guide?: string;
  faqs: { q: string; a: string }[];
}

export const PACKAGE_SEO: Record<string, PackageSeo> = {
  "hampi-3-days-couples": {
    seoTitle: "3 Day Hampi Itinerary for Couples (with Costs & Map)",
    description: "A relaxed 3-day Hampi itinerary for couples: Virupaksha, Vittala's stone chariot, a coracle ride, Lotus Mahal and the best sunset spots, with timings, costs and where to stay.",
    intro: "Hampi rewards slow mornings and golden evenings. This plan groups the ruins by area so you're never backtracking, puts the big temples at opening time before the heat, and saves every sunset for a different hilltop or lake.",
    whoFor: "Couples who like history and quiet landscapes more than nightlife; comfortable with early starts and an auto-rickshaw for the day.",
    region: "India",
    guide: "hampi",
    faqs: [
      { q: "Are 3 days enough for Hampi?", a: "Yes. Three days covers the Sacred Centre around Virupaksha, the Vittala complex, the Royal Centre and one evening across the river at Sanapur, without rushing. Add a fourth day for Badami or Anegundi." },
      { q: "What is the best time to visit Hampi?", a: "October to February, when days are 25-30°C and dry. March to May is very hot, and the monsoon (June to September) is green but some boat rides stop." },
      { q: "How do couples get around Hampi?", a: "Hire one auto-rickshaw for the day (about ₹1,000-1,500), or rent a scooter or bicycle. The sites are spread over about 25 km², so walking between all of them isn't practical." },
      { q: "How much does a 3-day Hampi trip cost for two?", a: "Plan on roughly $450 for two: about $60-330 a night for a stay, ₹600 per foreigner (₹40 for Indians) for the combined ASI ticket, coracle rides around ₹400-500, and simple meals of ₹200-500." },
    ],
  },
  "jaipur-2-days": {
    seoTitle: "2 Day Jaipur Itinerary: Amer Fort, City Palace & Bazaars",
    description: "How to spend 2 days in Jaipur: Amer Fort at opening time, Nahargarh at sunset, City Palace, Jantar Mantar, Hawa Mahal and the best old-city food, with timings and costs.",
    intro: "Two days is enough to see Jaipur's highlights if you get the order right: the hill forts on day one while you're fresh, then the walled Pink City on foot on day two.",
    whoFor: "First-time visitors, weekend trips from Delhi, and couples who want history plus great shopping.",
    region: "India",
    guide: "jaipur",
    faqs: [
      { q: "Is 2 days enough for Jaipur?", a: "Two full days covers Amer, Nahargarh, the City Palace, Jantar Mantar, Hawa Mahal and the bazaars. Add a day for Albert Hall Museum, Galta Ji and a cooking class." },
      { q: "What is the Jaipur composite ticket?", a: "A single ticket covering Amer Fort, Nahargarh, Albert Hall, Jantar Mantar, Hawa Mahal and more, valid for two days. It costs much less than buying each entry separately." },
      { q: "When is the best time to visit Jaipur?", a: "October to March. April to June regularly passes 40°C, and July to September is humid with monsoon showers." },
      { q: "What should I eat in Jaipur?", a: "Dal baati churma, pyaaz kachori from Rawat Mishthan Bhandar, lassi in clay cups from Lassiwala on MI Road, and ghewar in winter." },
    ],
  },
  "udaipur-3-days-couples": {
    seoTitle: "3 Day Udaipur Itinerary for Couples (Romantic Plan)",
    description: "A romantic 3-day Udaipur itinerary for couples: City Palace, a sunset boat on Lake Pichola, Monsoon Palace, Eklingji and lakeside dinners, with costs and the best places to stay.",
    intro: "Udaipur is built around its lakes, so this plan is too: palaces in the morning light, the water at sunset, and dinners facing the Lake Palace.",
    whoFor: "Honeymooners and couples celebrating something; travellers who'd rather linger than tick boxes.",
    region: "India",
    guide: "udaipur",
    faqs: [
      { q: "How many days are enough for Udaipur?", a: "Three days lets you see the City Palace, the lakes, Sajjangarh and the old city at a relaxed pace, plus a half-day trip to Eklingji and Nagda." },
      { q: "Which is the best sunset spot in Udaipur?", a: "The palace boat ride on Lake Pichola for sunset on the water, or Sajjangarh Monsoon Palace for a view over every lake from the hills." },
      { q: "Is Udaipur good for a honeymoon?", a: "It's one of India's most romantic cities: lake-view heritage hotels, boat rides, rooftop dinners and a slower pace than Jaipur." },
      { q: "When should couples visit Udaipur?", a: "October to March for pleasant weather; just after the monsoon (September-October) the lakes are fullest." },
    ],
  },
  "manali-4-days-friends": {
    seoTitle: "4 Day Manali Itinerary with Friends (Snow, Rafting & Cafés)",
    description: "A 4-day Manali itinerary for friends: Solang Valley snow, Atal Tunnel to Sissu, Beas river rafting, Jogini Falls and Old Manali café nights, with a budget breakdown.",
    intro: "A friends' trip to Manali needs a mix of adrenaline and long evenings. This plan balances a snow day, a river day and a hike, with Old Manali as your base for nights out.",
    whoFor: "Groups of friends on a budget who want adventure by day and café hangouts by night.",
    region: "India",
    guide: "manali",
    faqs: [
      { q: "Is 4 days enough for Manali?", a: "Four days covers Old Manali, Solang, Atal Tunnel and Sissu, rafting in Kullu and a short hike. Add two days for Kasol or Tirthan Valley." },
      { q: "When is snow in Manali?", a: "Manali town gets snow from about December to February. Solang and the area beyond Atal Tunnel usually have snow from December to April." },
      { q: "How do you get from Delhi to Manali?", a: "Overnight Volvo buses take 12-14 hours. The nearest airport is Bhuntar, about 50 km away, with limited flights." },
      { q: "How much does a 4-day Manali trip cost per person?", a: "Budget travellers in hostels spend roughly ₹12,000-18,000 each including bus fares, stays, local taxis, rafting and food." },
    ],
  },
  "rishikesh-3-days": {
    seoTitle: "3 Day Rishikesh Itinerary: Yoga, Rafting & Ganga Aarti",
    description: "Plan 3 days in Rishikesh: sunrise yoga, Shivpuri rafting, the Beatles Ashram, Neer Garh waterfall and the Ganga Aarti at Parmarth Niketan and Triveni Ghat.",
    intro: "Rishikesh splits neatly into stillness and adrenaline. This plan alternates them: yoga and the aarti at either end of the day, rapids and waterfalls in between.",
    whoFor: "Solo travellers, yoga beginners and anyone wanting a calm weekend that still has some thrill.",
    region: "India",
    guide: "rishikesh",
    faqs: [
      { q: "Which aarti is best in Rishikesh?", a: "Parmarth Niketan's aarti is the most famous, with chanting and music; Triveni Ghat's is larger and more local. This itinerary does one each evening." },
      { q: "When is rafting open in Rishikesh?", a: "Roughly September to June. It closes during the July-August monsoon when the river runs too high." },
      { q: "Can beginners do yoga in Rishikesh?", a: "Yes. Most studios in Tapovan and Laxman Jhula run drop-in classes for all levels for about ₹300-600." },
      { q: "Is alcohol available in Rishikesh?", a: "No. Rishikesh is a vegetarian, alcohol-free town by law." },
    ],
  },
  "varanasi-2-days": {
    seoTitle: "2 Day Varanasi Itinerary: Ghats, Ganga Aarti & Sarnath",
    description: "How to spend 2 days in Varanasi: a sunrise boat along the ghats, Kashi Vishwanath, old-city food, the Dashashwamedh Ganga Aarti, Sarnath and the Banarasi silk weavers.",
    intro: "Varanasi is overwhelming in the best way. This plan anchors each day on the river, at dawn and dusk, and spends the hours between in the old city and at Sarnath.",
    whoFor: "Culture lovers, photographers and first-timers who want a respectful, well-paced introduction to the city.",
    region: "India",
    guide: "varanasi",
    faqs: [
      { q: "Is 2 days enough for Varanasi?", a: "Two days lets you see a sunrise and a sunset on the Ganga, the main temples, the old city and Sarnath. A third day adds Ramnagar Fort and more time on the ghats." },
      { q: "What time is the Ganga Aarti in Varanasi?", a: "The evening aarti at Dashashwamedh Ghat starts around 6:00-7:00 PM depending on the season. Arrive 45 minutes early for a good spot, or watch from a boat." },
      { q: "Can you take photos at the burning ghats?", a: "No. Photographing cremations at Manikarnika and Harishchandra ghats is not allowed and is deeply disrespectful." },
      { q: "When is the best time to visit Varanasi?", a: "October to March. Winter dawns are foggy and atmospheric; Dev Deepawali in November lights every ghat with lamps." },
    ],
  },
  "ladakh-5-days": {
    seoTitle: "5 Day Ladakh Itinerary (Leh, Nubra & Pangong) with Acclimatisation",
    description: "A safe 5-day Ladakh itinerary with an acclimatisation day: Leh monasteries, Khardung La to Nubra, Hunder dunes, Pangong Tso and Chang La, plus permits and packing tips.",
    intro: "Ladakh's biggest risk is altitude, so this plan starts with a real rest day in Leh and climbs gradually: monasteries at 3,500 m before the 5,300 m passes.",
    whoFor: "Couples and small groups who want the classic Leh-Nubra-Pangong circuit by private car without rushing their acclimatisation.",
    region: "India",
    guide: "ladakh",
    faqs: [
      { q: "Is 5 days enough for Ladakh?", a: "Five days covers Leh, Nubra and Pangong by car with one acclimatisation day. Add days for Tso Moriri, Turtuk or Hanle." },
      { q: "Do I need a permit for Nubra and Pangong?", a: "Yes. Indian and foreign visitors need an inner-line or protected-area permit for Nubra, Pangong and other border areas, applied for online through the Leh district portal." },
      { q: "How do I avoid altitude sickness in Ladakh?", a: "Rest completely on your first day in Leh, drink plenty of water, avoid alcohol for 48 hours and ascend gradually. Ask your doctor about acetazolamide before flying." },
      { q: "When is the best time to visit Ladakh?", a: "June to September, when the passes are open. Pangong freezes in winter, and many roads close from November to April." },
    ],
  },
  "goa-3-days-budget": {
    seoTitle: "3 Day Goa Itinerary on a Budget (Under ₹10,000)",
    description: "A budget 3-day Goa itinerary: Old Goa churches, Fontainhas, Palolem and Butterfly Beach, Anjuna flea market and Chapora Fort, with scooter tips and fish thalis for under ₹200.",
    intro: "Goa doesn't have to be expensive. Rent a scooter, eat where locals eat, and split your days between the quiet south, Portuguese Panjim and the north's markets and forts.",
    whoFor: "Backpackers, students and friends travelling on a tight budget.",
    region: "India",
    guide: "goa",
    faqs: [
      { q: "Can you do Goa in ₹10,000 for 3 days?", a: "Yes, per person, staying in hostels or beach huts (₹800-2,000 a night), renting a scooter (₹300-400 a day) and eating fish thalis and shack meals." },
      { q: "North Goa or South Goa for a budget trip?", a: "North Goa has more hostels and nightlife; South Goa has quieter, cleaner beaches and cheap huts at Palolem. This plan does both by scooter." },
      { q: "Which day is the Anjuna flea market?", a: "Wednesdays in season (November to April). Mapusa's Friday market is a good local alternative." },
      { q: "When is Goa cheapest?", a: "The shoulder months of October and March, and the monsoon (June to September), when many shacks close but hotels drop prices sharply." },
    ],
  },
  "goa-3-days": {
    seoTitle: "3 Day Goa Itinerary for Couples (Beaches, Forts & Nightlife)",
    description: "A 3-day Goa itinerary for couples with Fort Aguada, Candolim seafood, Anjuna, sunset beaches and Baga nightlife, with timings, costs and boutique stays.",
    intro: "A comfortable, couple-paced Goa: forts and beaches by day, long seafood lunches, and evenings that range from sunset shacks to Baga's live music.",
    whoFor: "Couples on a mid-range budget who want beaches, food and a bit of nightlife.",
    region: "India",
    guide: "goa",
    faqs: [
      { q: "What is the best month for Goa?", a: "November to February: dry, sunny and 21-32°C. December is busiest and priciest around Christmas and New Year." },
      { q: "Where should couples stay in Goa?", a: "Candolim and Sinquerim for comfort close to the action, Assagao for boutique villas, or Palolem and Agonda in the south for quiet." },
      { q: "How do you get around Goa?", a: "Rent a scooter or car, or use the GoaMiles app and local taxis. Public buses are cheap but slow." },
      { q: "Is 3 days enough for Goa?", a: "Three days gives you the north's forts, beaches and nightlife. Add two days for South Goa's quieter coast." },
    ],
  },
  "kerala-5-days": {
    seoTitle: "5 Day Kerala Itinerary: Munnar, Alleppey Houseboat & Kochi",
    description: "A 5-day Kerala itinerary through Kochi, Munnar's tea hills and an Alleppey backwater houseboat, with costs, travel times and the best season.",
    intro: "Kerala in five days means choosing well: Fort Kochi's history, Munnar's cool tea estates and a night on the backwaters, linked by scenic drives.",
    whoFor: "Couples and families who want nature, food and a slow pace.",
    region: "India",
    guide: "kerala",
    faqs: [
      { q: "Is 5 days enough for Kerala?", a: "Five days covers Kochi, Munnar and Alleppey comfortably. Add Thekkady or Varkala for a 7-day trip." },
      { q: "When is the best time to visit Kerala?", a: "September to March. The monsoon (June to August) is lush and good for Ayurveda but rainy for sightseeing." },
      { q: "Should I stay overnight on a houseboat?", a: "Yes, if you can. Day cruises are cheaper, but an overnight houseboat lets you see the backwaters at sunset and sunrise." },
      { q: "How do you travel between Kochi, Munnar and Alleppey?", a: "A private car is easiest: Kochi to Munnar is about 4 hours, Munnar to Alleppey about 5." },
    ],
  },
  "thailand-3-days": {
    seoTitle: "3 Day Bangkok Itinerary: Temples, Street Food & Rooftops",
    description: "Spend 3 days in Bangkok: the Grand Palace and Wat Pho, Chao Phraya boats, Chinatown street food and rooftop bars, with costs and getting-around tips.",
    intro: "Bangkok works best in early starts and late nights. Temples before the heat, rivers and markets in the afternoon, and street food when the city lights up.",
    whoFor: "First-timers to Thailand and food-focused travellers.",
    region: "Asia",
    faqs: [
      { q: "Is 3 days enough for Bangkok?", a: "Three days covers the main temples, the river, Chinatown and a market. Add a day trip to Ayutthaya if you have four." },
      { q: "What should I wear to the Grand Palace?", a: "Covered shoulders and knees; no sleeveless tops or shorts. Sarongs can be borrowed at the gate." },
      { q: "When is the best time to visit Bangkok?", a: "November to February, when it's cooler and drier." },
      { q: "How do you get around Bangkok?", a: "The BTS Skytrain and MRT for long hops, Chao Phraya Express boats along the river, and Grab for taxis." },
    ],
  },
  "paris-7-days": {
    seoTitle: "7 Day Paris Itinerary: Museums, Neighbourhoods & Day Trips",
    description: "A 7-day Paris itinerary with the Louvre, Musée d'Orsay, Montmartre, Le Marais, the Seine and a day trip to Versailles, with timings and a realistic budget.",
    intro: "A week in Paris lets you go beyond the checklist: one big museum a day at most, a different neighbourhood each afternoon, and long dinners.",
    whoFor: "Art lovers, couples and first-time visitors who want a full week.",
    region: "Europe",
    faqs: [
      { q: "Is a week too long in Paris?", a: "No. Seven days covers the major sights, several neighbourhoods and a day trip to Versailles or Giverny without rushing." },
      { q: "Do I need to book the Louvre in advance?", a: "Yes. Timed tickets are required and often sell out; book a morning slot online." },
      { q: "When is the best time to visit Paris?", a: "April to June and September to October, with mild weather and fewer crowds than summer." },
      { q: "Is the Paris Museum Pass worth it?", a: "If you'll visit three or more paid museums in two days, usually yes, and it lets you skip ticket queues." },
    ],
  },
  "japan-5-days": {
    seoTitle: "5 Day Tokyo & Kyoto Itinerary (First Trip to Japan)",
    description: "A 5-day Japan itinerary covering Tokyo and Kyoto by bullet train: Shibuya, Asakusa, Fushimi Inari, Arashiyama and Gion, with rail pass and budget tips.",
    intro: "Five days is tight for Japan, so this plan splits it between neon Tokyo and temple Kyoto, linked by the shinkansen.",
    whoFor: "First-time visitors to Japan who want both the city and traditional sides.",
    region: "Asia",
    faqs: [
      { q: "Is 5 days enough for Tokyo and Kyoto?", a: "Yes for a first taste: two and a half days in each. Add days for Nara, Hakone or Osaka." },
      { q: "Is the JR Pass worth it for 5 days?", a: "Usually not after the 2023 price rise unless you're making several long trips. A Tokyo-Kyoto return on the shinkansen is often cheaper." },
      { q: "When is the best time to visit Japan?", a: "Late March to April for cherry blossom, and October to November for autumn leaves." },
      { q: "Do I need cash in Japan?", a: "Less than before, but carry some yen for small restaurants, temples and shrines." },
    ],
  },
  "bali-4-days": {
    seoTitle: "4 Day Bali Itinerary: Ubud, Rice Terraces & Beach Sunsets",
    description: "A 4-day Bali itinerary: Ubud's rice terraces and temples, a waterfall morning, Uluwatu cliffs and a beach sunset, with drivers, costs and the best areas to stay.",
    intro: "Four days in Bali means picking two bases: Ubud for jungle and temples, then the south coast for cliffs and sunsets.",
    whoFor: "Couples and friends wanting a mix of culture, nature and beach.",
    region: "Asia",
    faqs: [
      { q: "Is 4 days enough for Bali?", a: "Enough for Ubud and the southern coast. Add days for Nusa Penida or the Gili Islands." },
      { q: "How do you get around Bali?", a: "Hire a private driver for day trips (about $40-50 a day) or use Grab and Gojek for short rides." },
      { q: "When is the best time to visit Bali?", a: "April to October, the dry season." },
      { q: "Where should you stay in Bali?", a: "Ubud for culture and rice terraces, Seminyak or Canggu for cafés and beaches, Uluwatu for cliffs and surf." },
    ],
  },
  "dubai-4-days": {
    seoTitle: "4 Day Dubai Itinerary: Burj Khalifa, Old Dubai & Desert Safari",
    description: "A 4-day Dubai itinerary with the Burj Khalifa, Dubai Mall, Al Fahidi and the souks, an abra ride, a desert safari and Palm Jumeirah, with costs and timings.",
    intro: "Dubai is two cities: old Dubai's creek and souks, and the new skyline. This plan gives each its own day, plus the desert and the beach.",
    whoFor: "Families, couples and first-time visitors who want a polished, easy city break.",
    region: "Middle East",
    faqs: [
      { q: "Is 4 days enough for Dubai?", a: "Yes: four days covers the skyline, old Dubai, a desert safari and a beach or theme-park day." },
      { q: "When is the best time to visit Dubai?", a: "November to March, when it's 20-30°C. Summer regularly passes 40°C." },
      { q: "Should I book Burj Khalifa in advance?", a: "Yes, especially for sunset slots, which are pricier and sell out." },
      { q: "How do you get around Dubai?", a: "The Metro covers most sights; taxis and Careem fill the gaps." },
    ],
  },
  "rome-5-days": {
    seoTitle: "5 Day Rome Itinerary: Colosseum, Vatican & Trastevere",
    description: "A 5-day Rome itinerary covering the Colosseum and Forum, the Vatican Museums and St Peter's, the Pantheon, Trastevere food and a day at Ostia Antica or Tivoli.",
    intro: "Five days in Rome lets you see the ancient city, the Vatican and the centro storico, each on its own day, with time for long Roman lunches.",
    whoFor: "History lovers and food-focused travellers on a first visit.",
    region: "Europe",
    faqs: [
      { q: "Is 5 days enough for Rome?", a: "Yes: ancient Rome, the Vatican, the historic centre, Trastevere and a day trip, at a comfortable pace." },
      { q: "Do I need tickets in advance for the Colosseum?", a: "Yes. Timed tickets are required; book the earliest slot." },
      { q: "When is the best time to visit Rome?", a: "April to June and September to October." },
      { q: "How do you get around Rome?", a: "On foot for the centre, plus the Metro and buses for longer hops." },
    ],
  },
  "switzerland-6-days": {
    seoTitle: "6 Day Switzerland Itinerary: Lucerne, Interlaken & Zermatt",
    description: "A 6-day Switzerland itinerary by train: Lucerne, Interlaken and the Jungfrau region, and Zermatt below the Matterhorn, with Swiss Travel Pass and budget advice.",
    intro: "Switzerland is best by train. This plan uses three bases to keep packing light and puts the mountain excursions on the clearest mornings.",
    whoFor: "Couples and families who love mountains and scenic rail journeys.",
    region: "Europe",
    faqs: [
      { q: "Is the Swiss Travel Pass worth it?", a: "For six days of moving between cities and lake boats, usually yes; it also discounts many mountain railways." },
      { q: "When is the best time to visit Switzerland?", a: "June to September for hiking and lakes; December to March for snow." },
      { q: "Which is better, Interlaken or Zermatt?", a: "Interlaken for variety and easy day trips, Zermatt for the Matterhorn and car-free calm. This plan does both." },
      { q: "How expensive is Switzerland?", a: "It's one of Europe's priciest countries: budget about $250-400 a day for two, mid-range." },
    ],
  },
};

export const seoFor = (slug: string) => PACKAGE_SEO[slug];
