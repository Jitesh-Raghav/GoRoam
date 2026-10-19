import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Kenya, Jordan, Mexico and Costa Rica. */
export const WORLD_DAYS_4: Record<string, TripDay[]> = {
  "masai-mara": [
    ["Fly into the Mara", "Take a light aircraft from Nairobi's Wilson Airport to a Mara airstrip (about 45 minutes), where your guide meets you with a game-drive vehicle.", "First game drive on the way to camp: zebra, giraffe and elephant on the open plains.", "Sundowners by the fire and dinner at camp, listening to lions and hyenas at night.", "Small planes usually allow only 15 kg of luggage in soft bags."],
    ["Full-day safari", "Leave at dawn, the best time to find lions, leopards and cheetahs hunting.", "Bush picnic lunch, then drive to the Mara River: from July to October, wildebeest crossings past waiting crocodiles.", "Dinner and stories back at camp.", "Crossings need patience; guides may wait hours."],
    ["Balloon and Maasai village", "Hot-air balloon flight at sunrise over the plains, followed by a champagne bush breakfast.", "Visit a Maasai village to learn about their traditions, homes and jumping dance.", "Final evening game drive.", "Book the balloon flight well in advance."],
    ["Home", "A short morning game drive.", "Fly back to Nairobi.", "Connect home.", "Leave time for small-plane delays."],
  ],
  petra: [
    ["Amman", "Explore the Amman Citadel, with Roman and Umayyad ruins and city views, then the 6,000-seat Roman Theatre.", "Walk Rainbow Street and have falafel at Hashem, a city institution.", "Drive about 3 hours south to Wadi Musa, the town at Petra's gates.", "The Jordan Pass covers your visa and Petra entry."],
    ["Petra", "Enter at 6 AM and walk the narrow, winding Siq gorge until the Treasury appears through the gap.", "Continue to the Street of Facades, the Royal Tombs and the Roman-era colonnaded street.", "Petra by Night (Monday, Wednesday and Thursday): the Siq and Treasury lit by 1,500 candles.", "Wear sturdy shoes; you'll walk 15 km or more."],
    ["The Monastery", "Climb about 850 rock-cut steps to the Monastery, Petra's largest monument, and continue to the viewpoint beyond.", "Lunch inside the site, then drive about 1.5 hours to Wadi Rum.", "Arrive at your desert camp for sunset.", "Start the climb early to avoid the heat."],
    ["Wadi Rum", "Jeep tour through Wadi Rum's red-sand canyons, rock arches and the Lawrence of Arabia sites.", "Camel ride or sandboarding on the dunes.", "Bedouin dinner cooked underground (zarb) and a night under spectacular stars.", "Desert nights are cold; bring warm layers."],
    ["The Dead Sea", "Drive to the Dead Sea, the lowest point on earth at about 430 m below sea level.", "Float in the salty water and coat yourself in mineral mud.", "Fly home from Amman.", "Don't shave before swimming; the salt stings."],
  ],
  "cancun-tulum": [
    ["Cancún", "Arrive at Cancún airport and settle into your hotel.", "Swim on the white-sand beaches of the Hotel Zone, with water that shades from turquoise to deep blue.", "Dinner of tacos al pastor in downtown Cancún, where locals eat.", "Agree taxi fares before getting in."],
    ["Isla Mujeres", "Ferry to Isla Mujeres (about 20 minutes) and rent a golf cart to explore the island.", "Swim at Playa Norte, one of Mexico's best beaches, and visit Punta Sur's cliffs.", "Back to Cancún for dinner.", "Playa Norte is calm and shallow, great for children."],
    ["Chichén Itzá and cenotes", "Leave early for Chichén Itzá, one of the New Seven Wonders, before the tour buses arrive.", "Swim in Cenote Ik Kil, a deep sinkhole draped with vines.", "Dinner in Valladolid, a pastel colonial town.", "Arrive at opening (8 AM) to beat heat and crowds."],
    ["Tulum", "Explore the Tulum ruins on a cliff above the Caribbean.", "Snorkel in the Gran Cenote's clear water with turtles.", "Sunset at a Tulum beach club.", "The ruins close in early afternoon."],
    ["Home", "A final swim.", "Lunch of ceviche.", "Fly home from Cancún.", "Allow 2 hours to Cancún airport from Tulum."],
  ],
  "mexico-city": [
    ["Centro Histórico", "Start at the Zócalo, one of the world's largest squares, and the Metropolitan Cathedral.", "See the ruins of the Aztec Templo Mayor and Diego Rivera's murals in the Palacio Nacional.", "Dinner in Roma, the city's leafy restaurant district.", "The city sits at 2,240 m; drink water and take it slow."],
    ["Teotihuacán", "Early trip (about 1 hour) to Teotihuacán, an ancient city older than the Aztecs.", "Climb the Pyramid of the Sun and walk the Avenue of the Dead to the Pyramid of the Moon.", "Back to the city for mezcal in Condesa.", "Hot-air balloons fly over the pyramids at dawn."],
    ["Coyoacán and Xochimilco", "Visit the Frida Kahlo Museum, the Blue House where she lived and worked.", "Float on a trajinera boat through the canals of Xochimilco with mariachis drifting by.", "Day of the Dead events (late October to 2 November): altars, marigolds and parades.", "Book Frida Kahlo Museum tickets online well ahead."],
    ["Chapultepec and home", "Spend the morning at the National Museum of Anthropology, home of the Aztec Sun Stone.", "Lunch of mole.", "Fly home.", "The museum needs at least 3 hours."],
  ],
  "costa-rica": [
    ["San José to Arenal", "Land in San José and drive about 3 hours to La Fortuna, at the foot of Arenal Volcano.", "Hike down to La Fortuna Waterfall and swim in its pool.", "Soak in volcanic hot springs at Tabacón or a free river spot.", "Rent a 4x4; mountain roads can be rough."],
    ["Arenal", "Hike in Arenal Volcano National Park across old lava flows.", "Cross the Arenal Hanging Bridges through the rainforest canopy.", "Night wildlife walk to spot red-eyed tree frogs and sloths.", "Guides spot far more wildlife than you will alone."],
    ["To Monteverde", "Drive around Lake Arenal to Monteverde (about 3.5 hours).", "Walk the Monteverde Cloud Forest Reserve, looking for the resplendent quetzal.", "Night tour to see tarantulas and kinkajous.", "Monteverde is cool; bring a layer."],
    ["Monteverde", "Zipline over the cloud-forest canopy.", "Coffee and chocolate farm tour.", "Dinner in Santa Elena.", "Bring a rain jacket; mist is common."],
    ["To Manuel Antonio", "Drive to the Pacific coast (about 4 hours).", "Afternoon on the beach.", "Sunset over the Pacific.", "Stop at the Tárcoles bridge to see giant crocodiles."],
    ["Manuel Antonio", "Visit Manuel Antonio National Park with a guide to see sloths, monkeys and iguanas.", "Swim at the park's beaches.", "Seafood dinner.", "The park is closed on Tuesdays."],
    ["Home", "Morning swim.", "Drive back to San José.", "Fly home.", "Allow 3–4 hours to the airport."],
  ],
};
