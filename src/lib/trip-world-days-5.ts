import type { TripDay } from "@/lib/trip-days";

/** Full day plans: the Caribbean, the US South and West, and South America. */
export const WORLD_DAYS_5: Record<string, TripDay[]> = {
  "puerto-rico": [
    ["Old San Juan", "Explore Castillo San Felipe del Morro, a 16th-century Spanish fortress guarding the bay.", "Wander Old San Juan's blue cobblestone streets past pastel houses, and stop at La Fortaleza, the governor's mansion.", "Mofongo for dinner, then salsa dancing at a local bar.", "The cobbles are slippery; wear good shoes."],
    ["El Yunque and a glowing bay", "Hike in El Yunque National Forest to waterfalls and a lookout tower.", "Lunch at the Luquillo kiosks, a strip of beachside food stands.", "Kayak through Laguna Grande in Fajardo, where microorganisms glow blue around your paddle.", "Reserve El Yunque road access online; bio bays are best on moonless nights."],
    ["Culebra", "Take the early ferry or a short flight to Culebra.", "Swim at Flamenco Beach, regularly rated one of the best beaches in the world.", "Back to San Juan.", "Ferries sell out; flying is quicker if tickets run short."],
    ["Beach day", "Relax on the beach at Condado or Ocean Park.", "Lunch and a piña colada at Barrachina, which claims to have invented it.", "Evening at La Placita, the market square that turns into a street party on Thursdays.", "Thursday and Friday nights at La Placita are liveliest."],
    ["Home", "Morning swim.", "Lunch.", "Fly home.", "US citizens don't need a passport for Puerto Rico."],
  ],
  "new-orleans": [
    ["French Quarter", "Beignets and café au lait at Café du Monde, then Jackson Square and St Louis Cathedral.", "Walk Royal Street's antiques shops and galleries, and the French Market.", "Live jazz on Frenchmen Street, the locals' alternative to Bourbon Street.", "Bourbon Street is loud and touristy; Frenchmen has better music."],
    ["Garden District", "Ride the historic St Charles streetcar to the Garden District's antebellum mansions.", "Walk Lafayette Cemetery No. 1 and browse Magazine Street's shops.", "Creole dinner at Commander's Palace.", "Cemetery tours run with licensed guides."],
    ["Bayou and history", "Swamp tour to see alligators, herons and cypress trees draped with Spanish moss.", "Spend the afternoon at the National WWII Museum.", "Traditional jazz at Preservation Hall.", "Book Preservation Hall tickets in advance."],
    ["Home", "Jazz brunch with a live band.", "Last shopping for hot sauce and pralines.", "Fly home.", "The airport is about 25 minutes away."],
  ],
  "grand-canyon": [
    ["Sedona", "Drive about 2 hours from Phoenix to Sedona, surrounded by red-rock buttes.", "Hike to Devil's Bridge or around Cathedral Rock.", "Watch the sunset from Airport Mesa, then stargaze in this dark-sky community.", "Start hikes early; trailhead parking fills quickly."],
    ["To the Grand Canyon", "Drive through Oak Creek Canyon's switchbacks to Flagstaff and on to the South Rim.", "Walk the Rim Trail between Mather Point and Yavapai Point.", "Sunset at Hopi Point, reached by the free park shuttle.", "Free shuttles run along Hermit Road."],
    ["Into the canyon", "Hike partway down the Bright Angel Trail to the 1.5-mile or 3-mile resthouse.", "Drive the Desert View road to the Watchtower.", "Continue to Page (about 2.5 hours).", "Never attempt a rim-to-river hike and back in one day."],
    ["Page and home", "Take a Navajo-guided tour of Antelope Canyon's light-filled slot canyons.", "Walk to the Horseshoe Bend overlook above the Colorado River.", "Drive out and fly home from Phoenix or Las Vegas.", "Antelope Canyon tours sell out weeks ahead."],
  ],
  "st-lucia": [
    ["Arrive", "Transfer from Hewanorra airport to your hotel (up to 1.5 hours).", "Swim and settle in.", "Sunset over the Caribbean.", "Arrange transfers in advance."],
    ["Soufrière", "Drive into Sulphur Springs, the world's only drive-in volcano, and bathe in its warm mud pools.", "Visit Diamond Falls and the botanical gardens.", "Dinner with views of the Pitons.", "Wear an old swimsuit to the mud baths."],
    ["The Pitons", "Hike Gros Piton with a local guide (about 4 hours return) for panoramic views.", "Snorkel off Sugar Beach, between the two Pitons.", "Rest and dinner.", "Start the hike early to avoid the heat."],
    ["The north", "Explore Pigeon Island's fort ruins and beaches.", "Lunch at Rodney Bay.", "Join the Friday night street party in Gros Islet.", "The street party is on Friday nights."],
    ["Home", "Morning swim.", "Lunch.", "Fly home.", "Leave a buffer for the drive to the airport."],
  ],
  "buenos-aires": [
    ["The centre", "Start at Plaza de Mayo with the pink Casa Rosada, where Eva Perón addressed the crowds.", "Tour the Teatro Colón, one of the world's great opera houses.", "Steak dinner at a parrilla.", "Book Teatro Colón tours in advance."],
    ["Recoleta and Palermo", "Walk Recoleta Cemetery's grand mausoleums to find Eva Perón's tomb.", "Explore Palermo's parks, rose garden and cafés.", "Watch a tango show.", "Recoleta Cemetery is free to enter."],
    ["La Boca and San Telmo", "See the colourful tin houses of La Boca's Caminito.", "Browse the San Telmo antiques market (biggest on Sundays).", "Dance at a milonga, a local tango hall.", "Visit La Boca by day."],
    ["Home", "Coffee and medialunas at Café Tortoni, open since 1858.", "Lunch.", "Fly home.", "Ezeiza is about 45 minutes away."],
  ],
  "rio-de-janeiro": [
    ["Copacabana", "Arrive and check in near the beach.", "Walk Copacabana's famous wave-patterned promenade.", "Seafood dinner and caipirinhas.", "Use Uber at night."],
    ["Christ and Santa Teresa", "Take the cog train up Corcovado to Christ the Redeemer early, before clouds roll in.", "Explore the bohemian hilltop neighbourhood of Santa Teresa and the tiled Selarón Steps.", "Samba and nightlife in Lapa.", "Clear mornings give the best views."],
    ["Sugarloaf", "Ride the cable cars up Sugarloaf Mountain for views over Guanabara Bay.", "Visit the Botanical Garden's avenue of royal palms.", "Watch the sunset from Arpoador rock, where crowds applaud the sun.", "Sunset at Arpoador is a Rio ritual."],
    ["Ipanema", "Spend the morning on Ipanema beach.", "Hang-gliding from Pedra Bonita, or a favela tour with a local guide.", "Dinner in Leblon.", "Only use licensed, community-run favela tours."],
    ["Home", "A last beach morning.", "Lunch.", "Fly home.", "Allow an hour to Galeão airport."],
  ],
};
