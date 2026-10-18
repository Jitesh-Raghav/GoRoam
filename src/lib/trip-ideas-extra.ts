/**
 * The longer half of each /trips page: an overview, what to eat, how to get
 * around and the weather in season. Kept apart from trip-ideas.ts so the cards
 * on the hub and home page don't carry it.
 */
export interface TripExtra {
  /** A short paragraph on what the place is like. */
  about: string;
  /** Local dishes worth trying: [dish, note]. */
  food: [string, string][];
  /** Getting around once you're there. */
  around: string;
  /** Typical weather in the best months. */
  weather: string;
}

export const TRIP_EXTRA: Record<string, TripExtra> = {
  jaisalmer: {
    about: "Jaisalmer rises out of the Thar Desert like a sandcastle: a 12th-century fort of honey-coloured stone that 3,000 people still live inside, surrounded by an old town of carved merchant havelis. Beyond the city, the dunes of Sam and Khuri are where most visitors spend a night under the stars with folk music and camel rides.",
    food: [["Ker sangri", "Desert beans and berries cooked with spices; the taste of the Thar."], ["Dal baati churma", "Baked wheat balls with lentils and sweet crumble."], ["Ghotua ladoo", "A local sweet made with gram flour and ghee."]],
    around: "The fort and old town are best on foot. Autos cost ₹100–200 across town; hire a jeep or taxi (about ₹2,500–3,500 a day) for Kuldhara and the dunes.",
    weather: "October to February: 22–28°C by day, falling to 5–12°C on desert nights in December and January.",
  },
  jodhpur: {
    about: "Jodhpur's old city is a maze of indigo-blue houses at the foot of Mehrangarh, one of India's most imposing forts. It's compact and easy to enjoy in two days, with great street food, a lively clock-tower market and some of Rajasthan's best heritage hotels.",
    food: [["Mirchi vada", "A big green chilli stuffed with potato and fried."], ["Makhaniya lassi", "Thick, saffron-scented lassi topped with butter."], ["Laal maas", "Fiery Rajasthani mutton curry."]],
    around: "Walk the old city; autos (₹100–250) for Umaid Bhawan and Mandore. The Flying Fox zipline at the fort is a fun extra.",
    weather: "October to March: 24–30°C days, 10–15°C nights in winter.",
  },
  pushkar: {
    about: "Pushkar is a small, holy town around a lake, with ghats, white temples and a famous market lane. It's peaceful most of the year, then transforms during the camel fair into one of India's biggest gatherings of traders, pilgrims and photographers.",
    food: [["Malpua", "Syrup-soaked pancakes from the bazaar sweet shops."], ["Kachori", "Crispy fried pastries with spiced lentils."], ["Rooftop café thalis", "Vegetarian thalis with lake views."]],
    around: "Everything in town is walkable. Ajmer is 15 km away by bus or taxi (about ₹500).",
    weather: "October to March: 22–30°C days, cool 8–14°C nights in mid-winter.",
  },
  ranthambore: {
    about: "Ranthambore is one of the best places in India to see wild tigers. Dry deciduous forest, lakes and the ruins of a 10th-century fort make the safaris as scenic as they are exciting, and it's an easy trip from Delhi or Jaipur.",
    food: [["Lodge buffets", "Most stays include meals: Rajasthani thalis and continental."], ["Kachori and chai", "A quick breakfast at Sawai Madhopur stalls before a safari."], ["Dal baati", "Served in most local restaurants."]],
    around: "Safaris pick you up from your hotel. Autos and taxis connect the town, station and lodges.",
    weather: "October to March: 25–30°C days, 6–12°C at dawn in an open jeep.",
  },
  "rann-of-kutch": {
    about: "The Great Rann is a vast white salt flat that stretches to the horizon, spectacular at sunset and under a full moon. Around it, Kutch's villages are home to some of India's finest crafts: embroidery, block printing, lacquer work and the rare rogan painting.",
    food: [["Kutchi dabeli", "A spiced potato bun, born in Kutch."], ["Bajra rotla with ghee and jaggery", "Village staple in the Banni grasslands."], ["Gujarati thali", "Sweet, sour and spicy dishes in one sitting."]],
    around: "Hire a car or taxi from Bhuj (about ₹3,000 a day); public transport to the villages is sparse.",
    weather: "November to February: 25–30°C days and cold 8–12°C nights on the Rann.",
  },
  gokarna: {
    about: "Gokarna is a temple town on the Karnataka coast with a string of beautiful coves to its south, linked by a cliff-top walking trail. It's quieter and cheaper than Goa, with a mix of pilgrims, backpackers and yoga travellers.",
    food: [["Fish thali", "Coastal Karnataka fish curry, fry and rice."], ["Neer dosa", "Soft, lacy rice crêpes."], ["Beach-shack seafood", "Fresh catch grilled at Om and Kudle."]],
    around: "Walk the beach trail between coves, or take a boat (₹300–500). Autos run between town and Om Beach.",
    weather: "October to March: 28–33°C, sunny and dry, with calm sea.",
  },
  pondicherry: {
    about: "Pondicherry blends a French colonial quarter of pastel villas and quiet streets with a busy Tamil town and the spiritual community of Auroville. Cafés, bakeries and the sea-facing Promenade make it one of South India's most relaxing short breaks.",
    food: [["Crêpes and croissants", "French bakeries all over White Town."], ["Creole fish curry", "Franco-Tamil flavours unique to Pondy."], ["Filter coffee", "Strong South Indian coffee in steel tumblers."]],
    around: "Rent a bicycle (₹100–200 a day) or scooter (₹300–400) for White Town and Auroville.",
    weather: "December to March: 24–30°C and pleasant. October and November bring heavy northeast monsoon rain.",
  },
  andaman: {
    about: "The Andaman Islands sit in the Bay of Bengal, closer to Myanmar than to mainland India. Havelock and Neil have some of Asia's finest beaches, coral reefs for snorkelling and diving, and a slow island pace, while Port Blair holds the moving history of the Cellular Jail.",
    food: [["Grilled fish", "Fresh catch with lime and chilli at beach shacks."], ["Crab curry", "A coastal favourite in Port Blair."], ["Coconut water", "Straight from the shell, everywhere."]],
    around: "Private ferries link Port Blair, Havelock and Neil. On the islands, rent a scooter (₹500–700) or use autos.",
    weather: "November to April: 25–30°C, sunny, with calm seas and clear water.",
  },
  coorg: {
    about: "Coorg (Kodagu) is Karnataka's coffee country: rolling estates under silver oak, waterfalls and the proud Kodava culture with its own cuisine. It's a favourite long-weekend escape from Bengaluru and Mysuru.",
    food: [["Pandi curry", "Dark, tangy pork curry with kachampuli vinegar."], ["Kadambuttu", "Steamed rice balls served with the curry."], ["Coorg coffee", "Buy fresh beans direct from estates."]],
    around: "A car is best: hire a taxi (about ₹2,500 a day). Jeeps take you up to Mandalpatti.",
    weather: "October to March: 15–28°C, misty mornings and cool nights.",
  },
  chikmagalur: {
    about: "Chikmagalur is where coffee first took root in India, in the Baba Budangiri hills. Today it's a quiet hill district of estates, high ridges and waterfalls, with Karnataka's highest peak, Mullayanagiri, close to town.",
    food: [["Akki rotti", "Rice-flour flatbread with chutney."], ["Estate-grown coffee", "Freshly roasted, often served at homestays."], ["Malnad cuisine", "Bamboo-shoot curry and kadubu dumplings."]],
    around: "Self-drive or hire a taxi; jeeps are needed for Hebbe Falls and parts of Baba Budangiri.",
    weather: "October to March: 15–28°C, clear and cool.",
  },
  ooty: {
    about: "Ooty is the classic Nilgiri hill station: tea gardens, eucalyptus forests, lakes and colonial cottages, reached by a famous toy train. Nearby Coonoor is quieter and greener, with some of the best tea estates.",
    food: [["Homemade chocolate", "Ooty's signature, sold everywhere."], ["Nilgiri tea", "Taste it fresh at a tea factory."], ["Varkey", "Flaky Coonoor biscuits to take home."]],
    around: "Taxis are the easiest way between sights; the toy train also links Ooty and Coonoor.",
    weather: "October to May: 15–22°C days, chilly nights, frost in December and January.",
  },
  varkala: {
    about: "Varkala is Kerala's only cliff-backed beach: red laterite cliffs drop to the sea, with a path of cafés, yoga shalas and Ayurveda centres along the top. It's relaxed, social and great for sunsets.",
    food: [["Kerala fish curry", "Tangy with kodampuli."], ["Appam and stew", "Lacy rice pancakes with coconut stew."], ["Banana fritters", "Pazham pori, the perfect tea-time snack."]],
    around: "Walk the cliff; autos for town and the temple. Rent a scooter for Kappil and Edava.",
    weather: "October to March: 27–32°C, sunny with calm seas from December.",
  },
  wayanad: {
    about: "Wayanad is a green highland in northern Kerala of spice plantations, wildlife sanctuaries, waterfalls and prehistoric caves. It's ideal for families and small groups who like easy treks and nature.",
    food: [["Bamboo rice payasam", "A rare local dessert."], ["Malabar biryani", "Fragrant, mild and delicious."], ["Wayanad coffee and pepper", "Buy from local farms."]],
    around: "Hire a car or taxi; the sights are spread out across the district.",
    weather: "October to May: 18–29°C, cool and pleasant.",
  },
  kodaikanal: {
    about: "Kodaikanal is a hill station in the Palani Hills built around a star-shaped lake. Pine forests, cliffs above the plains and cool, misty air make it a long-time favourite for honeymooners and families.",
    food: [["Homemade chocolates", "Kodai's famous souvenir."], ["Plums and pears", "Local fruit from the hill orchards."], ["Hot chocolate", "At the lakeside cafés."]],
    around: "Cycle or walk around the lake; taxis for Pillar Rocks and viewpoints.",
    weather: "October to May: 12–20°C days, cold nights around 8°C in winter.",
  },
  mahabalipuram: {
    about: "Mahabalipuram (Mamallapuram) is a UNESCO-listed group of 7th- and 8th-century Pallava monuments by the sea. Temples carved from single rocks, giant bas-reliefs and a town full of stone carvers make it an easy, rewarding weekend from Chennai.",
    food: [["Seafood platter", "Fresh fish, prawns and squid by the beach."], ["South Indian breakfast", "Idli, vada and pongal."], ["Filter coffee", "Everywhere in town."]],
    around: "Rent a bicycle to hop between monuments; autos for longer runs along ECR.",
    weather: "November to February: 24–30°C and breezy.",
  },
  madurai: {
    about: "Madurai is one of the oldest continuously inhabited cities in the world, built around the vast Meenakshi Amman Temple. It's intense, devout and full of flavour, with a food scene that runs late into the night.",
    food: [["Jigarthanda", "A cold milk, almond gum and ice-cream drink."], ["Kari dosa", "Dosa topped with minced mutton and egg."], ["Bun parotta", "Fluffy layered parotta with salna."]],
    around: "Autos are cheap and everywhere; the temple area is best on foot.",
    weather: "November to February: 22–30°C, warm but bearable.",
  },
  mysore: {
    about: "Mysore was the royal capital of the Wodeyars, and its palace, festivals and gardens still carry that grandeur. It's also known for silk, sandalwood, yoga and the sweet named after the city.",
    food: [["Mysore pak", "The famous ghee sweet."], ["Mysore masala dosa", "With a red chutney spread inside."], ["Mylari dosa", "Soft, buttery dosas at the old Mylari hotel."]],
    around: "Autos and cabs cover the city; hire a taxi for Srirangapatna and Brindavan Gardens.",
    weather: "October to February: 18–29°C and pleasant.",
  },
  kanyakumari: {
    about: "Kanyakumari is the southern tip of the Indian mainland, where the Arabian Sea, the Bay of Bengal and the Indian Ocean meet. It's famous for watching the sun rise and set over water.",
    food: [["Seafood meals", "Fish fry and curries near the shore."], ["Banana chips", "Fresh, in coconut oil."], ["Kerala-style thali", "Served on a banana leaf."]],
    around: "Walk the seafront; ferries to the rock memorial; taxis for Padmanabhapuram.",
    weather: "October to March: 25–31°C, breezy and clear.",
  },
  lakshadweep: {
    about: "Lakshadweep is a scatter of coral atolls off the Kerala coast, with turquoise lagoons, white sand and almost no crowds. Tourism is controlled, so trips are planned through permits and packages.",
    food: [["Tuna curry", "Coconut-based, the islands' staple."], ["Octopus fry", "A local speciality."], ["Fresh coconut", "In every form."]],
    around: "Boats link the islands; most stays include transfers and activities.",
    weather: "October to May: 26–31°C, calm seas and excellent visibility.",
  },
  puri: {
    about: "Puri is one of Hinduism's holiest towns, home to the Jagannath Temple and a long sandy beach. Combine it with the Konark Sun Temple, the painter village of Raghurajpur and Chilika Lake for a rich three-day loop.",
    food: [["Mahaprasad", "Temple food from Ananda Bazaar."], ["Chhena poda", "Odisha's baked cheese dessert."], ["Dalma", "Lentils cooked with vegetables."]],
    around: "Autos and taxis; hire a car for the Konark and Chilika day trips.",
    weather: "October to March: 18–30°C, sunny and pleasant.",
  },
  auli: {
    about: "Auli is a high meadow above Joshimath in the Garhwal Himalaya, with India's best-known ski slopes and big views of Nanda Devi. Outside ski season it's a base for treks through oak forests and bugyals.",
    food: [["Garhwali thali", "Mandua roti, chainsoo and jhangora kheer."], ["Maggi and chai", "The mountain classic between ski runs."], ["Aloo ke gutke", "Spiced hill potatoes."]],
    around: "Shared jeeps and taxis from Joshimath; walk between the slopes.",
    weather: "December to March: -5 to 8°C, with snow from late December.",
  },
  shimla: {
    about: "Shimla was the summer capital of British India, and its Ridge, Mall Road and Gothic church still feel like another era. In winter the hills around it, at Kufri and Narkanda, turn white.",
    food: [["Siddu", "Steamed bread stuffed with poppy-seed or walnut paste."], ["Himachali dham", "A festive meal with rajma and madra."], ["Café Mall Road snacks", "Old-school cafés along the Mall."]],
    around: "The centre is pedestrian; taxis for Kufri and Mashobra. The lift links Cart Road and the Mall.",
    weather: "December to February: -2 to 10°C with chances of snow; October to November: 8–20°C and clear.",
  },
  mcleodganj: {
    about: "McLeod Ganj is home to the Dalai Lama and the Tibetan government-in-exile, perched above Dharamshala below the Dhauladhar range. Monasteries, Tibetan cafés and great treks make it a favourite for slow travellers.",
    food: [["Momos and thukpa", "Tibetan dumplings and noodle soup."], ["Tingmo", "Steamed Tibetan bread."], ["Tibetan butter tea", "Salty and warming."]],
    around: "Walk in town; taxis to Dharamshala, Naddi and Norbulingka.",
    weather: "October to November: 10–22°C and clear; March to June: mild and sunny.",
  },
  mussoorie: {
    about: "Mussoorie sits on a ridge above Dehradun with views of the snow peaks. The busy Mall Road contrasts with Landour above it, a quiet cantonment of colonial cottages, bakeries and forest walks.",
    food: [["Pancakes at Char Dukan", "A Landour tradition."], ["Bun omelette and chai", "Mall Road breakfast."], ["Landour Bakehouse treats", "Cakes and breads in a heritage house."]],
    around: "Walk; taxis for Kempty Falls and Dhanaulti.",
    weather: "October to March: 5–18°C, crisp and clear; occasional snow in January.",
  },
  nainital: {
    about: "Nainital is a lake town in the Kumaon hills, surrounded by forested peaks. Boating on Naini Lake, short hikes to viewpoints and day trips to quieter lakes like Bhimtal and Sattal make it great for families.",
    food: [["Bal mithai", "A brown fudge coated in sugar balls."], ["Kumaoni raita", "Mustard-spiked cucumber raita."], ["Momos on the Mall", "A local favourite."]],
    around: "Walk the Mall; cycle rickshaws along the lake; taxis to Bhimtal and Sattal.",
    weather: "October to November: 10–20°C and clear; December to February: cold with occasional snow.",
  },
  "jim-corbett": {
    about: "Corbett is India's oldest national park, named after the hunter-turned-conservationist Jim Corbett. Grasslands, sal forests and the Ramganga river support tigers, elephants, deer and over 600 bird species.",
    food: [["Kumaoni meals", "Bhatt ki churkani and aloo gutke."], ["Lodge buffets", "Most stays include meals."], ["Chai and pakoras", "Before an afternoon safari."]],
    around: "Safari jeeps from Ramnagar; taxis between lodges and gates.",
    weather: "November to February: 6–24°C, foggy mornings; March onwards warms up.",
  },
  "bir-billing": {
    about: "Bir Billing is India's paragliding capital, with take-off at Billing (2,400 m) and landing in the Tibetan settlement of Bir. Monasteries, cafés and a laid-back vibe make it a great base even if you don't fly.",
    food: [["Momos and thenthuk", "In the Tibetan colony."], ["Café bakes", "Bir's cafés are famous for cakes."], ["Himachali rajma chawal", "Simple and hearty."]],
    around: "Walk around Bir; taxis to Billing (about ₹800) and Baijnath.",
    weather: "October to November: 10–24°C and clear, perfect for flying.",
  },
  chopta: {
    about: "Chopta is a meadow in the Garhwal Himalaya, often called the Mini Switzerland of India. It's the base for the trek to Tungnath, the highest Shiva temple in the world, and Chandrashila peak with its sweeping views.",
    food: [["Maggi and chai", "At every trail stop."], ["Garhwali dal and rice", "In camps and homestays."], ["Pahadi rajma", "Small, flavourful hill beans."]],
    around: "Shared jeeps and taxis from Rishikesh or Ukhimath; everything else is on foot.",
    weather: "October to November: 0–15°C; December to March: below freezing with snow.",
  },
  "tirthan-valley": {
    about: "Tirthan Valley and the village of Jibhi are quiet corners of Himachal with wooden homestays, trout streams and pine forests at the edge of the Great Himalayan National Park. It's perfect for a slow, offbeat mountain break.",
    food: [["Trout", "Fresh from the Tirthan river."], ["Siddu", "Himachali steamed bread."], ["Homestay meals", "Home-cooked rajma, rice and greens."]],
    around: "Local taxis and buses from Aut and Banjar; walk between villages.",
    weather: "October to November: 8–22°C; December to February: cold with snow higher up.",
  },
  darjeeling: {
    about: "Darjeeling is a colonial hill station surrounded by tea gardens, with the world's third-highest peak, Kanchenjunga, filling the skyline on clear mornings. The UNESCO toy train still puffs through the town.",
    food: [["Momos", "Everywhere, steamed or fried."], ["Thukpa", "Hearty noodle soup."], ["First-flush tea", "The 'Champagne of teas', tasted at the estates."]],
    around: "Walk the town; shared jeeps and taxis for Tiger Hill and Ghoom.",
    weather: "October to December: 6–18°C with clear mountain views.",
  },
  gangtok: {
    about: "Gangtok is the capital of Sikkim, a clean, friendly town on a ridge with monasteries and views of Kanchenjunga. Day trips go high into the mountains to glacial lakes and the Nathu La border pass.",
    food: [["Momos and thukpa", "Sikkimese staples."], ["Phagshapa", "Pork with radish and chilli."], ["Sel roti", "A sweet, ring-shaped rice bread."]],
    around: "Shared taxis in town; permits and jeeps for Tsomgo and Nathu La are arranged by agents.",
    weather: "October to December: 5–20°C; snow at higher passes.",
  },
  meghalaya: {
    about: "Meghalaya, the 'abode of clouds', is a state of green plateaus, deep gorges, waterfalls and living root bridges grown by the Khasi people. Shillong is a lively hill capital, while Sohra (Cherrapunji) is one of the wettest places on earth.",
    food: [["Jadoh", "Rice cooked with pork and spices."], ["Dohneiiong", "Pork in a black sesame gravy."], ["Tungrymbai", "Fermented soybean dish."]],
    around: "Hire a taxi for the trip (about ₹3,000–3,500 a day); shared Sumos for budget travel.",
    weather: "October to April: 10–24°C, dry and clear from November.",
  },
  kaziranga: {
    about: "Kaziranga is a UNESCO-listed park on the Brahmaputra floodplains, home to about two-thirds of the world's greater one-horned rhinos. Tigers, wild elephants, water buffalo and huge bird populations live here too.",
    food: [["Assamese thali", "Rice, dal, fish tenga and pitika."], ["Duck curry", "With ash gourd or lentils."], ["Assam tea", "Fresh from nearby estates."]],
    around: "Jeep safaris from Kohora and Bagori; lodges arrange pickups.",
    weather: "November to April: 10–28°C, dry and comfortable.",
  },
  tawang: {
    about: "Tawang lies high in Arunachal Pradesh near the Bhutan and Tibet borders. The road over Sela Pass is one of India's most dramatic drives, ending at a 17th-century monastery overlooking the valley.",
    food: [["Thukpa", "Noodle soup to warm up."], ["Zan", "Millet porridge, a Monpa staple."], ["Butter tea", "Salty and warming at altitude."]],
    around: "Hire a car and driver from Guwahati or Tezpur for the whole trip.",
    weather: "October to November: 2–15°C; March to April: mild with some snow on passes.",
  },
  agra: {
    about: "Agra was a Mughal capital, and it holds three UNESCO sites: the Taj Mahal, Agra Fort and nearby Fatehpur Sikri. It's an easy day or weekend from Delhi, best done early in the morning.",
    food: [["Petha", "Agra's famous translucent sweet."], ["Bedai and jalebi", "A classic breakfast."], ["Mughlai kebabs", "In the old city."]],
    around: "Autos, cabs and e-rickshaws; only electric vehicles are allowed near the Taj.",
    weather: "October to March: 10–28°C, with fog on winter mornings.",
  },
  amritsar: {
    about: "Amritsar is the spiritual home of the Sikh faith. The Golden Temple, glowing on its sacred pool, welcomes everyone and feeds tens of thousands a day for free. The city is also known for its history and its food.",
    food: [["Amritsari kulcha", "Stuffed bread baked in a tandoor, with chole."], ["Lassi", "Huge glasses topped with cream."], ["Amritsari fish", "Spiced, battered and fried."]],
    around: "Walk the old city; e-rickshaws and cabs; taxis to Wagah (about ₹1,000 return).",
    weather: "October to March: 5–25°C, chilly mornings in December and January.",
  },
  khajuraho: {
    about: "Khajuraho's temples, built by the Chandela kings around 1000 CE, are covered in some of the finest stone sculpture in India. The village is small and relaxed, and Panna's tigers are nearby.",
    food: [["Bundelkhandi thali", "Simple local dishes."], ["Poha and jalebi", "A Madhya Pradesh breakfast."], ["Rooftop cafés", "With temple views."]],
    around: "Rent a bicycle for the temple groups; taxis for Panna and Raneh Falls.",
    weather: "October to March: 10–28°C and dry.",
  },
  kanha: {
    about: "Kanha is one of India's finest tiger reserves, with sal forests and open meadows. It saved the barasingha from extinction and is said to have inspired Kipling's The Jungle Book.",
    food: [["Lodge meals", "Mostly all-inclusive."], ["Kodo millet dishes", "Local Gond cuisine."], ["Hot chai", "Welcome after a cold safari."]],
    around: "Safari jeeps from the gates at Khatia, Mukki and Sarhi; lodges arrange transfers.",
    weather: "October to March: 3–28°C, very cold at dawn in December and January.",
  },
  mahabaleshwar: {
    about: "Mahabaleshwar is a hill station in the Sahyadri range, famous for strawberries, valley viewpoints and Shivaji's Pratapgad Fort. Together with nearby Panchgani, it's Pune and Mumbai's favourite weekend escape.",
    food: [["Strawberries and cream", "In season from December."], ["Corn pattice", "A local snack."], ["Chikki and fudge", "Sold in every shop."]],
    around: "Taxis or self-drive for viewpoints; horses at Venna Lake.",
    weather: "October to May: 15–28°C, coolest from December to February.",
  },
  alibaug: {
    about: "Alibaug is a coastal town across the harbour from Mumbai, with sea forts, black and golden sand beaches and weekend villas. The ferry ride from the Gateway of India makes it feel like a proper getaway.",
    food: [["Konkani fish thali", "Surmai or pomfret fry with solkadhi."], ["Prawn koliwada", "Crispy fried prawns."], ["Modak", "Steamed sweet dumplings."]],
    around: "Autos and taxis; rent a scooter (₹400–500) for the beaches.",
    weather: "October to May: 24–33°C, sunny and dry.",
  },
  phuket: {
    about: "Phuket is Thailand's largest island, with lively beaches, a colourful Sino-Portuguese old town and boat trips to the Phi Phi Islands and Phang Nga Bay. It's easy for first-timers abroad and has something for every budget.",
    food: [["Pad thai", "Stir-fried noodles, from street stalls."], ["Tom yum goong", "Hot and sour prawn soup."], ["Mango sticky rice", "The classic Thai dessert."]],
    around: "Grab and Bolt apps or tuk-tuks; scooters only if you're licensed and experienced.",
    weather: "November to April: 27–33°C, sunny with calm seas.",
  },
  krabi: {
    about: "Krabi is a province of dramatic limestone cliffs, islands and beaches on Thailand's Andaman coast. Ao Nang is the main base, and long-tail boats run to Railay and the islands.",
    food: [["Massaman curry", "Rich, mildly spiced curry."], ["Som tam", "Green papaya salad."], ["Seafood at the night market", "Ao Nang and Krabi Town."]],
    around: "Long-tail boats, songthaews and Grab.",
    weather: "November to April: 26–33°C, dry and sunny.",
  },
  "hanoi-halong-bay": {
    about: "Hanoi is Vietnam's characterful capital, with a buzzing Old Quarter, French colonial streets and lakes. A few hours away, Ha Long Bay's limestone islands are best seen from an overnight cruise, and Ninh Binh offers 'Ha Long on land'.",
    food: [["Pho", "Beef or chicken noodle soup."], ["Bun cha", "Grilled pork with noodles."], ["Egg coffee", "Whipped egg yolk over strong coffee."]],
    around: "Walk the Old Quarter; Grab for taxis; buses and tours to Ha Long and Ninh Binh.",
    weather: "October to December: 18–28°C; March to April: mild and pleasant.",
  },
  "phu-quoc": {
    about: "Phu Quoc is Vietnam's largest island, in the Gulf of Thailand, with white beaches, resorts and big new attractions like the Hon Thom cable car and Sunset Town.",
    food: [["Grilled seafood", "At Duong Dong night market."], ["Bun quay", "Freshly made fish-cake noodle soup."], ["Phu Quoc pepper", "Famous across Vietnam."]],
    around: "Grab, taxis and resort shuttles; scooters for experienced riders.",
    weather: "November to April: 25–32°C, dry and sunny.",
  },
  singapore: {
    about: "Singapore is a clean, safe city-state that packs futuristic gardens, theme parks, wildlife and some of the world's best street food into a small area. It's ideal for families and first trips abroad.",
    food: [["Hainanese chicken rice", "Singapore's national dish."], ["Chilli crab", "Messy and delicious."], ["Laksa", "Spicy coconut noodle soup."]],
    around: "The MRT reaches almost everywhere; tap in with a contactless card.",
    weather: "Year round: 25–32°C and humid; November to January is wetter.",
  },
  "kuala-lumpur": {
    about: "Kuala Lumpur is Malaysia's capital, a mix of skyscrapers, colonial buildings, temples and markets. It's affordable, easy and a great food city, with day trips to the hills and historic Malacca.",
    food: [["Nasi lemak", "Coconut rice with sambal."], ["Roti canai", "Flaky flatbread with curry."], ["Satay", "Grilled skewers with peanut sauce."]],
    around: "LRT, monorail and Grab are cheap and easy.",
    weather: "Year round: 24–33°C; short afternoon showers are common.",
  },
  langkawi: {
    about: "Langkawi is a duty-free island in northern Malaysia, with rainforest, mangroves, beaches and the famous Sky Bridge. It's relaxed and great for couples and families.",
    food: [["Nasi campur", "Rice with mixed dishes."], ["Mee goreng", "Spicy fried noodles."], ["Fresh seafood", "At Pantai Cenang."]],
    around: "Rent a car (easy driving) or use Grab.",
    weather: "November to April: 26–33°C, the driest months.",
  },
  "sri-lanka": {
    about: "Sri Lanka packs ancient cities, tea country, wildlife and beaches into one small island. A one-week loop covers Sigiriya, Kandy, the famous hill-country train, and the south coast's forts and beaches.",
    food: [["Rice and curry", "A spread of vegetable, dal and fish curries."], ["Hoppers", "Bowl-shaped rice pancakes, often with an egg."], ["Kottu roti", "Chopped roti stir-fried with vegetables."]],
    around: "Hire a car with driver (about ₹5,000–6,000 a day), or mix trains and tuk-tuks.",
    weather: "December to April: 25–31°C on the coast, 15–22°C in the hills.",
  },
  maldives: {
    about: "The Maldives is a nation of 1,000-plus coral islands in the Indian Ocean. You can splurge on an overwater villa at a private resort, or stay on local islands like Maafushi for a fraction of the cost.",
    food: [["Mas huni", "Tuna and coconut breakfast with roshi bread."], ["Garudhiya", "Clear tuna soup."], ["Fresh reef fish", "Grilled at resorts and guesthouses."]],
    around: "Speedboats and seaplanes; public ferries between some local islands.",
    weather: "November to April: 27–31°C, sunny and calm.",
  },
  nepal: {
    about: "Nepal is home to eight of the world's ten highest mountains. Kathmandu's temple squares and stupas are full of history, while Pokhara offers lakeside calm and sunrise views of the Annapurnas.",
    food: [["Dal bhat", "Lentils, rice and vegetables; refills are free."], ["Momos", "Nepal's favourite dumplings."], ["Newari khaja set", "Beaten rice with spiced sides."]],
    around: "Taxis in cities; tourist buses or short flights between Kathmandu and Pokhara.",
    weather: "October to December: 8–24°C, clear skies and mountain views.",
  },
  bhutan: {
    about: "Bhutan is a Himalayan kingdom that measures success by Gross National Happiness. It's green, peaceful and deeply Buddhist, with fortress-monasteries (dzongs), prayer flags and the iconic Tiger's Nest.",
    food: [["Ema datshi", "Chillies in cheese sauce, the national dish."], ["Red rice", "Nutty and eaten with every meal."], ["Momos", "Called momo here too."]],
    around: "Hire a car and driver (often arranged with your stay); roads are winding and slow.",
    weather: "October to November: 8–22°C, clear and dry.",
  },
  "abu-dhabi": {
    about: "Abu Dhabi, the UAE's capital, is calmer than Dubai, with grand cultural landmarks, beaches and Yas Island's theme parks. Winter is the season for desert safaris and outdoor events.",
    food: [["Machboos", "Spiced rice with meat."], ["Shawarma", "Everywhere and excellent."], ["Luqaimat", "Sweet fried dumplings with date syrup."]],
    around: "Taxis and Uber; buses for budget travel; a car for Yas and the desert.",
    weather: "November to March: 18–30°C, warm days and cool evenings.",
  },
  muscat: {
    about: "Oman offers some of the Arabian Peninsula's best landscapes: mountains, wadis, desert and coastline, with a gentle, traditional culture. Muscat is a calm capital of white buildings between rocks and sea.",
    food: [["Shuwa", "Slow-cooked spiced lamb."], ["Omani halwa", "Sticky sweet with rosewater and saffron."], ["Kahwa and dates", "Served as a welcome."]],
    around: "Rent a car; a 4x4 for the desert and mountain roads.",
    weather: "November to March: 20–30°C, dry and sunny.",
  },
  baku: {
    about: "Baku is Azerbaijan's capital on the Caspian Sea, where a medieval walled city sits below futuristic towers. It's a new favourite with Indian travellers thanks to an easy e-visa and short flights.",
    food: [["Plov", "Saffron rice with meat and dried fruit."], ["Qutab", "Thin stuffed flatbreads."], ["Dolma", "Stuffed vine leaves."]],
    around: "Metro and Bolt taxis are cheap; tours for Gobustan and Shahdag.",
    weather: "October to November: 10–20°C; December to February: 2–8°C and windy.",
  },
  almaty: {
    about: "Almaty is Kazakhstan's largest city, leafy and laid back, with the snow-capped Tian Shan mountains right behind it. Ski slopes, canyons and alpine lakes are all within easy reach.",
    food: [["Beshbarmak", "Boiled meat over flat noodles."], ["Plov", "Rice with meat and carrots."], ["Baursak", "Fried dough puffs."]],
    around: "Metro, buses and Yandex Go taxis; tours or a driver for Charyn and Kolsai.",
    weather: "December to February: -10 to 2°C with snow; summer is warm and sunny.",
  },
  tbilisi: {
    about: "Georgia is a small country with huge mountains, ancient churches and the world's oldest wine tradition. Tbilisi's old town of wooden balconies and sulphur baths is one of the most charming capitals in the region.",
    food: [["Khachapuri", "Cheese-filled bread, often with an egg."], ["Khinkali", "Juicy soup dumplings."], ["Churchkhela", "Walnuts dipped in grape must."]],
    around: "Metro and Bolt in Tbilisi; marshrutkas or a driver for Kazbegi and Kakheti.",
    weather: "October to November: 10–20°C; December to February: 0–8°C with snow in the mountains.",
  },
  istanbul: {
    about: "Istanbul straddles Europe and Asia across the Bosphorus. Byzantine churches, Ottoman mosques and palaces, bazaars and ferries make it one of the world's great city breaks.",
    food: [["Kebabs and köfte", "Grilled meats everywhere."], ["Simit", "Sesame bread rings for breakfast."], ["Baklava and Turkish tea", "Afternoon essentials."]],
    around: "Trams, metro and ferries with an Istanbulkart; walk in Sultanahmet.",
    weather: "October to November: 12–20°C; March to May: mild and pleasant.",
  },
  egypt: {
    about: "Egypt is a journey through 5,000 years of history: the pyramids of Giza, the temples of Luxor, the tombs of the Valley of the Kings and the Nile itself, best seen from a cruise.",
    food: [["Koshari", "Rice, lentils and pasta with tomato sauce."], ["Ful medames", "Stewed fava beans."], ["Ta'ameya", "Egyptian falafel made with fava beans."]],
    around: "Uber in Cairo; short flights or trains between Cairo and Luxor; cruise or taxis in the south.",
    weather: "October to March: 18–28°C in Cairo, warmer in Luxor and Aswan.",
  },
  mauritius: {
    about: "Mauritius is an Indian Ocean island ringed by coral lagoons, with volcanic peaks, waterfalls and a warm multicultural culture with deep Indian roots.",
    food: [["Dholl puri", "Flatbread stuffed with split peas."], ["Gateaux piments", "Chilli fritters."], ["Fish vindaye", "Mustard-turmeric pickled fish."]],
    around: "Rent a car (drive on the left) or hire a driver; buses are cheap but slow.",
    weather: "May to December: 20–27°C, dry; October to December is warm and sunny.",
  },
  vienna: {
    about: "Vienna is Austria's elegant capital of palaces, museums, music and coffee houses. From mid-November its squares fill with Christmas markets, making it one of Europe's most festive winter trips.",
    food: [["Wiener schnitzel", "Breaded veal, Vienna's signature."], ["Sachertorte", "The famous chocolate cake."], ["Punsch and roasted chestnuts", "At the Christmas markets."]],
    around: "U-Bahn, trams and buses; a 72-hour pass covers it all.",
    weather: "November to December: -2 to 8°C, cold and festive.",
  },
};

export const extraFor = (slug: string) => TRIP_EXTRA[slug];
