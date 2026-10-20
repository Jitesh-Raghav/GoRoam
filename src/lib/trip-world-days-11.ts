import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Mexico, Ecuador, Belize and Berlin. */
export const WORLD_DAYS_11: Record<string, TripDay[]> = {
  "cabo-san-lucas": [
    ["Médano Beach", "Arrive and check in near Médano Beach, the one beach in Cabo that's safe to swim.", "Afternoon on the sand with water sports and beach bars.", "Dinner and margaritas at the marina.", "Ignore timeshare touts at the airport exit."],
    ["El Arco and whales", "Glass-bottom boat to El Arco, the rock arch at Land's End, and Lover's Beach.", "Whale-watching tour to see humpbacks breaching (December to April).", "Sunset sail along the coast.", "Whale numbers peak from January to March."],
    ["Todos Santos", "Drive an hour north to Todos Santos, a bohemian town of galleries and the famous Hotel California.", "Lunch and a walk through the town's art studios.", "Join a sea turtle hatchling release at sunset (seasonal), then drive back.", "Book turtle releases with local conservation groups."],
    ["San José and home", "Morning in San José del Cabo's colonial plaza and art district.", "Lunch of fish tacos.", "Fly home.", "Arrive early; Los Cabos airport gets busy."],
  ],
  oaxaca: [
    ["The centro", "Visit the Templo de Santo Domingo, dripping in gold leaf, and the cultural museum in its former monastery.", "Lunch in the smoky grill aisle of Mercado 20 de Noviembre, where you pick meat to be grilled.", "Mezcal tasting in a centro bar.", "Try chapulines (toasted grasshoppers) if you're brave."],
    ["Monte Albán", "Explore Monte Albán, a Zapotec city built on a flattened mountaintop with valley views.", "Visit the alebrije (painted wooden animal) workshops in San Martín Tilcajete.", "Watch a Day of the Dead comparsa parade through the streets (late October to 2 November).", "Go to Monte Albán early for the light and cool."],
    ["Hierve el Agua", "Drive to Hierve el Agua's petrified waterfalls and mineral pools on a cliff edge.", "Visit a palenque to see mezcal being made in earth pits.", "Join the candlelit cemetery vigil at Xoxocotlán on Day of the Dead nights.", "Be respectful at the cemetery and ask before photographing."],
    ["Home", "Shop for textiles and black pottery.", "Lunch of mole negro.", "Fly home.", "The airport is about 20 minutes away."],
  ],
  galapagos: [
    ["Santa Cruz", "Fly into Baltra and cross by ferry and bus to Santa Cruz.", "See giant tortoises roaming wild at El Chato reserve in the highlands.", "Fish market and dinner in Puerto Ayora.", "Pay the national park fee in cash on arrival."],
    ["Darwin and Tortuga Bay", "Visit the Charles Darwin Research Station's tortoise breeding centre.", "Walk to Tortuga Bay to snorkel with marine iguanas and reef sharks.", "Dinner on Charles Binford street's food stalls.", "The walk to Tortuga Bay takes about 45 minutes."],
    ["North Seymour", "Day boat to North Seymour island.", "Watch blue-footed boobies dance and frigatebirds puff their red throats.", "Back to Santa Cruz to rest.", "Boats leave early; book a day ahead."],
    ["San Cristóbal", "Ferry to San Cristóbal (about 2 hours).", "Meet the sea lions sprawled on the beach at La Lobería.", "Sunset at Playa Mann.", "The ferry crossing can be rough."],
    ["Kicker Rock", "Boat trip to snorkel around Kicker Rock with sea turtles, rays and reef sharks.", "Lunch on board.", "Dinner in town.", "The sharks here are harmless reef sharks."],
    ["Home", "A last swim.", "Fly to the mainland.", "Connect home.", "Allow buffer for island flights."],
  ],
  belize: [
    ["San Pedro", "Short flight to Ambergris Caye and settle into San Pedro.", "Explore the island by golf cart.", "Dinner at a beach bar.", "Golf carts are the main transport."],
    ["Hol Chan", "Snorkel Hol Chan Marine Reserve and Shark Ray Alley with nurse sharks and stingrays.", "Lunch and an afternoon on the dock.", "Sunset drinks.", "Bring reef-safe sunscreen."],
    ["The Great Blue Hole", "Dive the Great Blue Hole, or take a scenic flight over it for the full view.", "Lunch on a remote caye.", "Rest.", "Scenic flights are great for non-divers."],
    ["San Ignacio", "Fly or drive inland to San Ignacio.", "Explore Xunantunich's Maya temples, reached by a hand-cranked river ferry.", "Dinner at your jungle lodge.", "Climb El Castillo for jungle views."],
    ["ATM Cave", "Join a licensed guide into Actun Tunichil Muknal, a cave with Maya skeletons and pottery.", "Lunch.", "Rest at the lodge.", "No cameras are allowed in the cave."],
    ["Home", "Morning birdwatching.", "Drive to Belize City.", "Fly home.", "Allow 2 hours to the airport."],
  ],
  berlin: [
    ["Mitte", "Brandenburg Gate and the Reichstag's glass dome (free, book ahead).", "The Memorial to the Murdered Jews of Europe and Unter den Linden.", "Gendarmenmarkt's elegant Christmas market.", "Reichstag visits need advance registration."],
    ["The Wall", "Berlin Wall Memorial on Bernauer Strasse, with its watchtower and preserved death strip.", "East Side Gallery's murals along the river.", "Dinner in Kreuzberg.", "The memorial's visitor centre has a viewing platform."],
    ["Museums and palaces", "Museum Island: the Neues Museum's bust of Nefertiti and the Altes Museum.", "Berlin Cathedral and its dome walk.", "Charlottenburg Palace Christmas market.", "Buy a Museum Island day pass."],
    ["Home", "Checkpoint Charlie and the Topography of Terror.", "Lunch of currywurst.", "Fly home.", "Allow 45 minutes to the airport."],
  ],
};
