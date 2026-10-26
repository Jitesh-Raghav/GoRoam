/**
 * The deepest layer of a /trips page, written by hand for the flagship trips:
 * what things really cost on the ground, which area to stay in, what locals
 * know, the mistakes people make, where to take the photo, day trips and
 * what's on. Prices are rough guides from recent visits; they move, so the
 * page says "about".
 */
export interface TripDeep {
  /** [what, what it costs]. */
  prices: [item: string, cost: string][];
  /** [area, who it suits]. */
  areas: [area: string, note: string][];
  secrets: string[];
  mistakes: string[];
  /** [spot, when to be there]. */
  photoSpots: [spot: string, when: string][];
  /** [place, how far, why go]. */
  dayTrips: [place: string, distance: string, why: string][];
  /** [event, when, what happens]. */
  events: [name: string, when: string, note: string][];
}

export const TRIP_DEEP: Record<string, TripDeep> = {
  jaisalmer: {
    prices: [
      ["Fort Palace Museum", "about ₹100 Indians · ₹500 foreigners"],
      ["Patwon ki Haveli", "₹100–250"],
      ["Camel ride at Sam dunes (30–45 min)", "₹300–800 per camel"],
      ["Jeep dune bashing", "₹1,500–3,000 per jeep"],
      ["Desert camp night with dinner and folk show", "₹2,000–6,000 per person"],
      ["Gadisar Lake boat (30 min)", "₹100–300"],
      ["Taxi for Kuldhara and Sam (half day)", "₹2,500–3,500"],
      ["Rajasthani thali", "₹200–400"],
    ],
    areas: [
      ["Inside the fort", "Rooftop views of the walls and the most atmosphere, but narrow lanes, no cars and fragile old drainage; pick a well-reviewed guesthouse."],
      ["Old city below the fort", "Around Gandhi Chowk and Hanuman Circle: havelis turned hotels, walkable to everything. The best all-round base."],
      ["Sam or Khuri dunes", "Spend one night here for the desert sky. Camps range from basic tents to luxury ones with private baths."],
    ],
    secrets: [
      "Watch sunset from Vyas Chhatri, the sandstone cenotaphs just west of the fort, instead of the crowded dune viewpoints.",
      "Khuri's dunes are quieter and more village-like than Sam; ask for a camp away from the main strip.",
      "Bada Bagh's royal cenotaphs glow gold at sunrise and are almost empty before 8 am.",
      "Kuldhara, the abandoned Paliwal village, is at its eeriest in the late-afternoon light; see it on the drive out to Sam.",
    ],
    mistakes: [
      "Booking the cheapest desert camp: many blast music all night on crowded dunes. Read recent reviews for the quieter ones.",
      "Packing only summer clothes: desert nights drop to about 5°C in December and January.",
      "Paying the first price for textiles and 'antiques'; start at about half and settle in between.",
    ],
    photoSpots: [
      ["The fort from Gadisar Lake", "Sunrise, when the walls turn gold"],
      ["Patwon ki Haveli's carved façades", "Mid-morning, when light reaches the lane"],
      ["Sam dunes ridgelines", "The last 30 minutes before sunset"],
    ],
    dayTrips: [
      ["Kuldhara and Khaba Fort", "20–40 km west, about 1 hour", "Abandoned 13th-century villages and a hilltop fort with a small fossil museum."],
      ["Lodurva", "15 km, 25 minutes", "Finely carved Jain temples at Jaisalmer's old capital."],
      ["Tanot Mata and Longewala", "120–150 km, 2.5 hours each way", "The border temple and the 1971 war memorial; a full day out."],
    ],
    events: [
      ["Desert Festival", "February, three days ending on the full moon", "Camel races, turban-tying, the Mr Desert contest and folk music on the Sam dunes."],
      ["Diwali", "October or November", "The fort and havelis lit with thousands of lamps."],
      ["New Year at the dunes", "31 December", "Camps throw parties; book weeks ahead and expect prices to double."],
    ],
  },

  rovaniemi: {
    prices: [
      ["Husky safari (about 2 hours)", "€150–250 per person"],
      ["Reindeer sleigh ride", "€90–150 per person"],
      ["Snowmobile safari (2–3 hours)", "€130–200 per person, two to a sled"],
      ["Northern lights tour by minibus", "€80–150 per person"],
      ["Arktikum science museum", "about €20"],
      ["Glass igloo night", "€400–900 per room"],
      ["Meeting Santa", "Free; official photos from about €40"],
      ["Weekday lunch buffet", "€12–18"],
    ],
    areas: [
      ["Rovaniemi town centre", "The cheapest beds and the most restaurants; nearly every tour picks up here."],
      ["Santa Claus Village (8 km north)", "For families who want Santa on the doorstep; quiet once the day visitors leave."],
      ["Forest and riverside cabins", "Darker skies for the aurora, but you'll need a car or transfers."],
    ],
    secrets: [
      "Santa Claus Village is busiest from 10 am to 2 pm; go at opening or after 4 pm and the wait to meet Santa drops from an hour to minutes.",
      "Ounasvaara hill, a short drive from town, is a free aurora spot looking out over forest.",
      "Watch the cloud forecast as closely as the aurora forecast: clear skies matter more than a high KP index.",
      "Crossing the Arctic Circle line is free; get your passport-style certificate stamped at Santa's Main Post Office.",
    ],
    mistakes: [
      "Buying expensive winter gear before you go: most tours lend thermal overalls, boots and mittens, so check first.",
      "Booking every aurora hunt for the first night: spread them out so one cloudy night doesn't cost you the lights.",
      "Forgetting how little daylight there is: in December there are only a few hours of twilight, so put outdoor sights around midday.",
    ],
    photoSpots: [
      ["The Arctic Circle line, Santa Claus Village", "Blue hour, about 2–3 pm in December"],
      ["Lumberjack's Candle Bridge (Jätkänkynttilä)", "Evening, when the bridge is lit"],
      ["Ounasvaara summit", "Clear nights, for the aurora over the town"],
    ],
    dayTrips: [
      ["Ranua Wildlife Park", "80 km, about 1 hour", "Polar bears, lynx, wolverines and moose; a family favourite."],
      ["Korouoma Canyon", "130 km, about 1.5 hours", "A winter hike past frozen waterfalls where ice climbers train."],
      ["Levi", "170 km, about 2.5 hours", "Lapland's biggest ski resort, with slopes lit after dark."],
    ],
    events: [
      ["Christmas season", "Late November to early January", "Santa's busiest weeks; book flights and rooms months ahead."],
      ["Polar night (kaamos)", "Mid-December to early January", "The sun doesn't rise; the days are a soft blue twilight."],
      ["Arctic Lapland Rally", "January", "A winter car rally on frozen forest roads around Rovaniemi."],
    ],
  },

  venice: {
    prices: [
      ["Vaporetto single ticket (75 minutes)", "€9.50"],
      ["Vaporetto 24-hour pass", "about €25"],
      ["Gondola (30 minutes, up to 5 people)", "about €90 by day, €110 after 7 pm"],
      ["Traghetto across the Grand Canal", "€2"],
      ["Doge's Palace", "€25–30"],
      ["St Mark's Basilica", "a few euros with a booked slot; extra for the museum"],
      ["Day-tripper access fee (peak days)", "€5–10 if you're not staying overnight"],
      ["Cicchetti and a spritz", "€2–4 a bite, €3–5 a spritz"],
    ],
    areas: [
      ["San Marco", "Closest to the big sights; the priciest and busiest."],
      ["Cannaregio", "Local and lively at night, with the best cicchetti bars."],
      ["Dorsoduro", "Artsy and calm, near the Accademia and the Guggenheim."],
      ["Mestre (mainland)", "About half the price and 10 minutes away by train, but you miss Venice at night."],
    ],
    secrets: [
      "Cross the Grand Canal on a traghetto, a standing gondola ferry, for €2 instead of €90.",
      "The Scala Contarini del Bovolo, a spiral staircase tower near Campo Manin, has rooftop views without the Campanile queue.",
      "Drink your coffee standing at the bar: it costs a fraction of a table in St Mark's Square.",
      "Foggy winter mornings (nebbia) are the most magical time for photos, and the crowds disappear.",
    ],
    mistakes: [
      "Sitting at a café in St Mark's Square without checking the music surcharge on the menu.",
      "Dragging a big suitcase over the bridges; pack light or use a porter.",
      "Not checking the acqua alta (high water) forecast from November on: bring boots or buy plastic overshoes.",
    ],
    photoSpots: [
      ["Rialto Bridge from the Riva del Vin", "Sunrise, before the crowds"],
      ["Accademia Bridge, looking to Santa Maria della Salute", "Golden hour"],
      ["Burano's painted houses", "Late morning"],
    ],
    dayTrips: [
      ["Murano and Burano", "40–60 minutes by vaporetto", "Glass-blowing furnaces and the coloured fishermen's houses."],
      ["Torcello", "45 minutes by vaporetto", "Venice's first settlement and a cathedral full of mosaics."],
      ["Verona", "About 70 minutes by train", "A Roman arena and Juliet's balcony."],
    ],
    events: [
      ["Festa della Madonna della Salute", "21 November", "A temporary bridge of boats spans the Grand Canal to the Salute church."],
      ["Carnival", "The two weeks before Lent, usually February", "Masks, costumes and balls; book months ahead."],
      ["New Year's Eve", "31 December", "Fireworks over St Mark's Basin at midnight."],
    ],
  },

  gokarna: {
    prices: [
      ["Beach hut on Kudle or Om", "₹800–2,000 a night"],
      ["Shared boat between beaches", "₹200–500 per person"],
      ["Auto from town to Kudle or Om", "₹150–300"],
      ["Scooter rental", "₹300–500 a day"],
      ["Unlimited thali in town", "₹100–200"],
      ["Beach-shack dinner", "₹300–700 per person"],
      ["Mahabaleshwar Temple", "Free (dress code applies)"],
    ],
    areas: [
      ["Kudle Beach", "The social base: cafés, yoga and sunsets, a 10-minute walk from Om."],
      ["Om Beach", "The prettiest bay, a little more upmarket, with water sports by day."],
      ["Gokarna town", "Cheapest, with temple life and thalis, but a ride from the beaches."],
    ],
    secrets: [
      "Walk the cliff trail from Kudle to Om, Half Moon and Paradise in the early morning; it's 2–3 hours one way and the views beat the boat.",
      "The headland between Kudle and Om is the best sunset spot in Gokarna.",
      "Udupi-style restaurants on Car Street serve unlimited banana-leaf thalis for next to nothing.",
      "Weekdays are calm; the Bengaluru and Goa crowds arrive on Friday night.",
    ],
    mistakes: [
      "Hiking the beach trail at midday: it's exposed and hot, so carry plenty of water.",
      "Swimming at Half Moon or Paradise in rough sea; there are no lifeguards.",
      "Walking through the temple town in beachwear; it's a pilgrimage centre.",
    ],
    photoSpots: [
      ["Om Beach from the cliff above", "Late afternoon, when the Om shape is clearest"],
      ["Kudle Beach from the headland", "Sunset"],
      ["Car Street and the temple", "Early morning"],
    ],
    dayTrips: [
      ["Mirjan Fort", "25 km, about 40 minutes", "A moss-covered laterite fort with moats and ramparts."],
      ["Yana Rocks", "60 km, about 1.5 hours", "Towering black karst pinnacles in the forest, reached by a short walk."],
      ["Murudeshwar", "75 km, about 1.5 hours", "A giant Shiva statue and temple tower on the shore."],
    ],
    events: [
      ["Maha Shivaratri", "February or March", "Thousands of pilgrims come to Mahabaleshwar; the town fills up, so book early."],
      ["Rathotsava", "Around Shivaratri", "The temple's huge wooden chariot is pulled down Car Street."],
      ["New Year's Eve", "31 December", "Parties on Kudle and Om; prices jump."],
    ],
  },

  andaman: {
    prices: [
      ["Private ferry, Port Blair to Havelock", "₹1,200–2,500 one way"],
      ["Government ferry", "₹500–1,000 (book well ahead)"],
      ["Beginner scuba dive on Havelock", "₹4,500–6,500"],
      ["Boat and snorkelling at Elephant Beach", "₹1,000–2,000"],
      ["Sea walk at Elephant Beach", "₹3,500–4,000"],
      ["Scooter rental on Havelock", "₹400–600 a day"],
      ["Cellular Jail light-and-sound show", "about ₹300"],
      ["Seafood dinner", "₹500–1,200 per person"],
    ],
    areas: [
      ["Havelock (Swaraj Dweep)", "The best beaches and diving; base most of your trip here."],
      ["Neil (Shaheed Dweep)", "Smaller and slower; one or two nights is plenty."],
      ["Port Blair", "Just a night, for the Cellular Jail and your flights."],
    ],
    secrets: [
      "Book ferries the moment your flights are confirmed; they sell out weeks ahead in December and January.",
      "Kala Patthar beach on Havelock is as pretty as Radhanagar and far emptier.",
      "Carry cash: ATMs on Havelock and Neil run dry, and mobile data is patchy (Airtel and BSNL work best).",
      "Dive and snorkel in the morning, when the sea is calmer and the water clearer.",
    ],
    mistakes: [
      "Flying out on the day you return from Havelock: ferries are cancelled in rough weather.",
      "Expecting fast internet: download maps and tickets before you go.",
      "Taking coral or shells: it's illegal and fines are heavy.",
    ],
    photoSpots: [
      ["Radhanagar Beach", "Sunset"],
      ["Natural Bridge, Neil Island", "Low tide, in the morning"],
      ["Ross Island ruins", "Morning, with the deer and peacocks"],
    ],
    dayTrips: [
      ["Ross Island (Netaji Subhas Chandra Bose Dweep)", "20 minutes by boat from Port Blair", "Colonial ruins taken over by banyan roots."],
      ["North Bay", "30 minutes by boat", "Glass-bottom boats and easy snorkelling."],
      ["Baratang", "About 100 km by road and boat", "Limestone caves through mangrove creeks; leave before dawn."],
    ],
    events: [
      ["Island Tourism Festival", "Usually December or January", "Dance, music and food stalls in Port Blair."],
      ["Christmas and New Year", "Late December", "Peak season: book stays and ferries early."],
    ],
  },

  varkala: {
    prices: [
      ["Ayurvedic massage (60 minutes)", "₹1,500–3,000"],
      ["Drop-in yoga class", "₹500–800"],
      ["Surf lesson", "₹2,000–3,000"],
      ["Auto from the station to North Cliff", "₹150–250"],
      ["Kathakali performance", "₹300–500"],
      ["Seafood dinner on the cliff", "₹600–1,500 per person"],
      ["Kerala meals (rice plate) in town", "₹100–200"],
    ],
    areas: [
      ["North Cliff", "The heart of Varkala: cafés, yoga and sunset views; busy in peak season."],
      ["South Cliff and Papanasam", "Nearer the temple and quieter, with older family guesthouses."],
      ["Odayam and Black Beach", "Calm boutique stays, a 10-minute walk from the cliff."],
      ["Edava and Kappil", "Ayurveda resorts by the backwaters, for a slow week."],
    ],
    secrets: [
      "The fish on display along the cliff is priced by weight: agree the price and how it's cooked before you order.",
      "Black Beach, at the north end of the cliff, is the quietest place to swim.",
      "Go down to Papanasam at dawn to watch pilgrims make offerings for their ancestors.",
      "Paddle the Kappil backwaters at sunset, 10 km north, where the lagoon meets the sea.",
    ],
    mistakes: [
      "Swimming when the red flags are up: the currents are strong and lifeguards cover only part of the beach.",
      "Walking the cliff path at night without a torch; parts of it have no railing.",
      "Wearing swimwear near the temple and Papanasam, which is a holy beach.",
    ],
    photoSpots: [
      ["North Cliff path", "Sunset"],
      ["Papanasam from the helipad", "Morning"],
      ["Kappil, where the backwaters meet the sea", "Golden hour"],
    ],
    dayTrips: [
      ["Jatayu Earth's Center", "40 km, about 1 hour", "A giant bird sculpture on a rock, reached by cable car."],
      ["Thiruvananthapuram", "50 km, about 1.5 hours", "Padmanabhaswamy Temple and the Napier Museum."],
      ["Munroe Island", "50 km, about 1.5 hours", "A canoe through narrow village canals at sunrise."],
    ],
    events: [
      ["Sivagiri pilgrimage", "30 December to 1 January", "Pilgrims in yellow walk to Sivagiri Mutt, the resting place of Sree Narayana Guru."],
      ["Christmas and New Year", "Late December", "Varkala's busiest week; book rooms early."],
    ],
  },

  pondicherry: {
    prices: [
      ["Bicycle rental", "₹100–200 a day"],
      ["Scooter rental", "₹350–500 a day"],
      ["Boat to Paradise Beach from Chunnambar", "about ₹300–400 return"],
      ["Matrimandir inner chamber, Auroville", "Free; book a slot days ahead at the Visitors Centre"],
      ["Surf lesson at Serenity Beach", "₹1,500–2,500"],
      ["Croissant and coffee in White Town", "₹200–350"],
      ["French or Creole dinner", "₹800–1,800 per person"],
    ],
    areas: [
      ["White Town (French Quarter)", "Heritage villas and cafés, a short walk from the promenade."],
      ["Tamil Quarter", "Cheaper, with heritage homestays and everyday local life."],
      ["Serenity Beach and the Auroville road", "Surf, beach cafés and a slower pace."],
    ],
    secrets: [
      "The seafront promenade is closed to cars in the evening and early morning; walk it at sunrise with the locals.",
      "Rent a bicycle: White Town's grid is flat and it's the easiest way to get around.",
      "The Sri Aurobindo Ashram asks for silence and modest clothes; mornings are calmest.",
      "Goubert Market is busiest at dawn, when the fish market comes alive.",
    ],
    mistakes: [
      "Swimming at Promenade Beach: it's rocky and unsafe. Go to Serenity or Paradise.",
      "Turning up at the Matrimandir without a booking: you'll only see it from the viewpoint.",
      "Coming in May or June, when it's very hot and humid.",
    ],
    photoSpots: [
      ["Rue Romain Rolland and Rue Suffren", "Morning, for empty yellow streets and bougainvillea"],
      ["The promenade and old lighthouse", "Sunrise"],
      ["Matrimandir viewpoint", "Late afternoon"],
    ],
    dayTrips: [
      ["Auroville", "12 km, about 25 minutes", "The township, the Matrimandir and organic cafés."],
      ["Mahabalipuram", "100 km, about 2 hours", "The Shore Temple and rock-cut carvings."],
      ["Gingee Fort", "70 km, about 1.5 hours", "A sprawling hill fort with a steep, rewarding climb."],
    ],
    events: [
      ["International Yoga Festival", "Early January", "Classes, talks and performances run by the Puducherry government."],
      ["Pongal", "Mid-January", "The Tamil harvest festival, with kolam drawings outside every home."],
      ["Christmas and New Year", "December", "Midnight mass at the Basilica of the Sacred Heart and parties on the seafront."],
    ],
  },

  coorg: {
    prices: [
      ["Abbey Falls entry", "a small fee (₹15–50)"],
      ["Raja's Seat", "₹10–20"],
      ["Dubare Elephant Camp", "₹50–200 depending on activities"],
      ["Coffee plantation tour", "₹300–800 per person"],
      ["Jeep to Mandalpatti viewpoint", "₹2,000–3,000 per jeep"],
      ["Kodava meal (pandi curry and kadambuttu)", "₹250–500"],
      ["Estate homestay with meals", "₹2,500–6,000 for two"],
    ],
    areas: [
      ["Madikeri", "The town base: close to Raja's Seat, Abbey Falls and restaurants."],
      ["Estate homestays around Madikeri and Virajpet", "The real Coorg: coffee walks, birdsong and home cooking."],
      ["Kushalnagar and Bylakuppe", "Near Dubare and the monastery; handy if you're coming from Mysuru."],
    ],
    secrets: [
      "Leave for Mandalpatti by 5:30 am to stand above the clouds at sunrise.",
      "Ask your homestay host for a walk through their coffee estate; many do it free.",
      "Buy coffee, cardamom, pepper and honey straight from the estates or Madikeri market.",
      "Dubare's elephant activities run only in the morning, so go there first.",
    ],
    mistakes: [
      "Driving the ghat roads after dark: mist and hairpin bends make it slow and risky.",
      "Packing only summer clothes: winter nights drop to about 10°C.",
      "Arriving on a long weekend without a booking; Bengaluru fills Coorg's homestays fast.",
    ],
    photoSpots: [
      ["Mandalpatti", "Sunrise, above the clouds"],
      ["Raja's Seat", "Sunset over the valleys"],
      ["Namdroling's Golden Temple", "Late afternoon, during the monks' prayers"],
    ],
    dayTrips: [
      ["Bylakuppe", "35 km, about 1 hour", "Namdroling Monastery and Tibetan cafés."],
      ["Talakaveri and Bhagamandala", "45 km, about 1.5 hours", "The source of the Kaveri and a temple at a river confluence."],
      ["Iruppu Falls and Nagarhole", "About 90 km", "A forest waterfall and a jeep safari in Nagarhole National Park."],
    ],
    events: [
      ["Kaveri Sankramana", "Around 17 October", "Pilgrims gather at Talakaveri for the moment the spring rises."],
      ["Puthari (Huthri)", "Late November or December, on the full moon", "The Kodava rice-harvest festival with dances and feasts."],
      ["Coffee harvest", "December to February", "The estates are at their busiest; ask to join a picking morning."],
    ],
  },

  meghalaya: {
    prices: [
      ["Shared taxi, Guwahati to Shillong", "₹300–500 a seat"],
      ["Private taxi for a day", "₹3,000–4,500"],
      ["Boat on the Umngot at Dawki", "₹800–1,500 per boat"],
      ["Root bridge trek, Nongriat", "a small entry fee (about ₹20–50)"],
      ["Village and waterfall entries", "small fees of ₹20–100 almost everywhere"],
      ["Homestay with meals", "₹1,500–3,000"],
      ["Jadoh and pork curry", "₹150–300"],
    ],
    areas: [
      ["Shillong", "Cafés, live music and the easiest transport; the base for day trips."],
      ["Sohra (Cherrapunji)", "For the falls and the root-bridge trek; pick a stay with valley views."],
      ["Nongriat village", "One night at the bottom of the trek, to see the bridge without the crowds."],
      ["Dawki and Shnongpdeng", "Riverside camps and clear-water mornings."],
    ],
    secrets: [
      "Spend a night in Nongriat: the double-decker bridge and the Rainbow Falls trail are almost empty early in the morning.",
      "The Umngot is clearest from November to April; go early, before the boats stir it up.",
      "Shillong has one of India's liveliest music scenes; look for weekend gigs.",
      "Laitlum Canyons, near Shillong, are a quieter alternative to the Sohra viewpoints.",
    ],
    mistakes: [
      "Trying to fit the root bridge, Dawki and Mawlynnong into one day: they're in different directions.",
      "Underestimating the 3,500 steps back up from Nongriat; go slowly and carry water.",
      "Starting late: in winter it's dark by about 5 pm.",
    ],
    photoSpots: [
      ["Nohkalikai Falls viewpoint", "Mid-morning, when the pool turns turquoise"],
      ["The Umngot at Shnongpdeng", "8–10 am, for the 'floating boat' shot"],
      ["Laitlum Canyons", "Sunrise"],
    ],
    dayTrips: [
      ["Mawlynnong and the Riwai root bridge", "About 90 km from Shillong", "The famously clean village and a short walk to a single root bridge."],
      ["Mawsmai Cave and Seven Sisters Falls", "In Sohra", "A short lit limestone cave and a row of waterfalls."],
      ["Krang Suri Falls", "About 90 km, near Jowai", "Turquoise pools at the foot of the falls."],
    ],
    events: [
      ["Shillong Cherry Blossom Festival", "Usually November", "Music, food and the city's pink cherry trees."],
      ["Wangala", "November", "The Garo 'hundred drums' harvest festival in the Garo Hills."],
      ["Christmas", "December", "Shillong's churches and streets lit up for the season."],
    ],
  },

  "rann-of-kutch": {
    prices: [
      ["White Rann entry permit", "about ₹100 per person plus a car fee; online or at Bhirandiyara"],
      ["Rann Utsav tent with meals", "₹5,000–15,000 per person a night"],
      ["Bhunga homestay", "₹2,000–4,000 a night"],
      ["Taxi, Bhuj to Dhordo and back", "₹2,500–3,500"],
      ["Camel cart on the salt", "₹100–300"],
      ["Aina Mahal and Prag Mahal", "₹20–100 each"],
      ["Kutchi thali", "₹150–300"],
    ],
    areas: [
      ["Dhordo and Hodka villages", "Closest to the White Rann: bhunga huts and the tent city."],
      ["Bhuj", "Cheaper hotels and more restaurants, but 80 km each way to the Rann."],
      ["Mandvi", "A beach and the Vijay Vilas Palace to end the trip."],
    ],
    secrets: [
      "Time your trip with the full moon, when the salt flat glows white at night.",
      "Stay at the White Rann until after sunset; most tour buses leave just as the colours peak.",
      "In Nirona, the Khatri family has kept rogan painting alive for generations; you can watch them work.",
      "Carry ID: the Rann is near the border and checkposts ask for it.",
    ],
    mistakes: [
      "Coming before November: the Rann is often still wet and the tent city isn't open.",
      "Driving out without a permit; get it online or at the Bhirandiyara checkpost first.",
      "Underestimating the cold: nights drop below 10°C in December and January.",
    ],
    photoSpots: [
      ["The White Rann at Dhordo", "Sunset, then again under a full moon"],
      ["Kalo Dungar", "Late afternoon, looking north over the salt"],
      ["Hodka's painted bhungas", "Morning light"],
    ],
    dayTrips: [
      ["Mandvi", "60 km from Bhuj", "Wooden-ship builders, a beach and the Vijay Vilas Palace."],
      ["Dholavira", "About 250 km, 4–5 hours", "A UNESCO-listed Harappan city on Khadir island."],
      ["India Bridge and Bhirandiyara", "On the way to the Rann", "The last bridge before the border, and the village's famous mawa sweets."],
    ],
    events: [
      ["Rann Utsav", "About November to February", "The tent city, folk music, crafts and full-moon nights on the salt."],
      ["Uttarayan (Kite Festival)", "14 January", "Skies full of kites all over Gujarat."],
    ],
  },

  "sri-lanka": {
    prices: [
      ["Sigiriya Rock", "about US$35 for foreign adults"],
      ["Temple of the Tooth, Kandy", "about LKR 2,000 for foreigners"],
      ["Kandy to Ella train, reserved seat", "LKR 1,000–3,000; book on the official site"],
      ["Tuk-tuk across town", "LKR 300–800"],
      ["Rice and curry lunch", "LKR 600–1,500"],
      ["Jeep safari at Yala or Udawalawe", "US$60–120 per person with entry"],
      ["Car and driver", "US$50–70 a day"],
    ],
    areas: [
      ["Sigiriya and Dambulla", "One night nearby for an early climb."],
      ["Kandy", "The Temple of the Tooth, the lake and the start of the hill-country train."],
      ["Ella", "Tea country, easy hikes and the Nine Arch Bridge; small and cosy."],
      ["Galle and the south coast", "The fort town and beaches; the place to end the trip."],
    ],
    secrets: [
      "Climb Sigiriya at the 7 am opening; by 10 am it's hot and the stairs queue.",
      "Pidurangala rock next door has the famous view of Sigiriya, for far less.",
      "Unreserved carriages on the Kandy–Ella train are fine if you board at Kandy early; the doors stay open for the views.",
      "Ask in Ella's cafés for the train times, then watch one cross the Nine Arch Bridge.",
    ],
    mistakes: [
      "Trying to see the whole island in a week: pick the cultural triangle, the hill country and one coast.",
      "Wearing shorts or hats into temples: cover shoulders and knees and take off your shoes.",
      "Posing with your back to a Buddha statue for a photo; it's considered disrespectful.",
    ],
    photoSpots: [
      ["Pidurangala rock, facing Sigiriya", "Sunrise"],
      ["Nine Arch Bridge, Ella", "When the morning train crosses"],
      ["Galle Fort ramparts and lighthouse", "Sunset"],
    ],
    dayTrips: [
      ["Dambulla Cave Temple", "20 km from Sigiriya", "Five caves of Buddhist murals and statues."],
      ["Little Adam's Peak and Ella Rock", "From Ella", "Two hikes with tea-country views."],
      ["Mirissa", "35 km from Galle", "Whale watching from November to April."],
    ],
    events: [
      ["Duruthu Perahera", "The January full moon", "Elephants, dancers and drummers parade at Kelaniya, near Colombo."],
      ["Sinhala and Tamil New Year", "13–14 April", "Family festivities; shops close and transport is packed."],
      ["Poya days", "Every full moon", "Public holidays when temples fill and alcohol isn't sold."],
    ],
  },

  phuket: {
    prices: [
      ["Phi Phi speedboat day trip", "THB 1,800–3,000, plus the THB 400 park fee"],
      ["Phang Nga Bay sea-canoe tour", "THB 1,500–3,500"],
      ["Big Buddha", "Free (donations welcome)"],
      ["Grab ride across the island", "THB 300–800"],
      ["Scooter rental", "THB 200–300 a day (licence needed)"],
      ["Thai massage (1 hour)", "THB 300–500"],
      ["Street-food dish in Old Town", "THB 50–120"],
    ],
    areas: [
      ["Kata and Karon", "Family-friendly beaches with good restaurants and surf in the low season."],
      ["Patong", "Nightlife and Bangla Road: loud, central and cheaper."],
      ["Old Phuket Town", "Shophouses, cafés and street food; no beach, all character."],
      ["Kamala and Surin", "Quieter, upmarket bays on the west coast."],
    ],
    secrets: [
      "Old Phuket Town's Sunday Walking Street on Thalang Road is the best street-food night of the week.",
      "Pick Phi Phi trips that leave before 8 am to reach Maya Bay ahead of the second wave of boats.",
      "Use Grab or Bolt instead of street taxis; fares are fixed and often half the price.",
      "Promthep Cape is the classic sunset spot; arrive 45 minutes early to get a ledge.",
    ],
    mistakes: [
      "Swimming at red-flag beaches from May to October: the rip currents are serious.",
      "Renting a jet ski without photographing it first; damage scams are common.",
      "Riding a scooter without a licence or helmet: your insurance won't cover you.",
    ],
    photoSpots: [
      ["Promthep Cape", "Sunset"],
      ["Soi Romanee, Old Town", "Morning, before the shops open"],
      ["Karon viewpoint (three beaches)", "Late afternoon"],
    ],
    dayTrips: [
      ["Phi Phi Islands", "1–2 hours by speedboat", "Maya Bay, Pileh Lagoon and snorkelling."],
      ["Phang Nga Bay", "1 hour by road, then by boat", "Limestone towers, sea caves and James Bond Island."],
      ["Similan Islands", "From Khao Lak; open about mid-October to mid-May", "Some of Thailand's best diving and snorkelling."],
    ],
    events: [
      ["Phuket Vegetarian Festival", "The ninth lunar month, usually October", "Processions, firecrackers and an island-wide vegan food fair."],
      ["Loy Krathong", "The November full moon", "Candle-lit floats set adrift on the sea and ponds."],
      ["Songkran", "13–15 April", "Thai New Year's island-wide water fight."],
    ],
  },
};

export const deepFor = (slug: string): TripDeep | undefined => TRIP_DEEP[slug];
