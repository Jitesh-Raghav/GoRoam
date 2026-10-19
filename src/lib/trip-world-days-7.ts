import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Laos, the Philippines, Australia and New Zealand. */
export const WORLD_DAYS_7: Record<string, TripDay[]> = {
  "luang-prabang": [
    ["Monks and temples", "Rise before dawn to watch saffron-robed monks walk the streets collecting alms of sticky rice.", "Visit Wat Xieng Thong, the town's most beautiful temple, with its sweeping roofs and glass mosaics.", "Climb Mount Phousi's 328 steps for sunset over the Mekong, then browse the night market.", "Watch alms giving quietly from a distance and never use flash."],
    ["Kuang Si Falls", "Drive about 45 minutes to Kuang Si Falls, a series of turquoise pools cascading through the jungle.", "Visit the Asiatic black bear rescue centre at the falls' entrance.", "Sunset cruise on the Mekong.", "Swim in the lower pools; the upper falls are for viewing."],
    ["Pak Ou Caves and home", "Take a slow boat up the Mekong to the Pak Ou Caves, filled with thousands of Buddha statues.", "Lunch of laap and sticky rice.", "Fly home.", "The boat takes about 2 hours each way."],
  ],
  "el-nido": [
    ["Arrive in El Nido", "Fly into El Nido's tiny airport from Manila.", "Swim at Las Cabanas beach.", "Watch the sunset at Corong-Corong with the limestone islands in silhouette.", "Book flights early; the airport is small."],
    ["Tour A: the lagoons", "Island-hopping Tour A: kayak into the Big and Small Lagoons, enclosed by towering limestone cliffs.", "Lunch of grilled fish on the boat and snorkelling at Seven Commandos Beach.", "Dinner in El Nido town.", "Kayak rental at the lagoons costs extra."],
    ["Tour C: hidden beaches", "Tour C: Hidden Beach, Secret Beach and Matinloc Shrine.", "Snorkel over coral gardens.", "A relaxed evening.", "Bring water shoes for the rocky entries."],
    ["Nacpan Beach", "Take a tricycle to Nacpan Beach, a 4 km stretch of golden sand.", "Lunch at a beach shack.", "Sunset at a beach bar.", "The ride takes about 45 minutes."],
    ["Home", "A last swim.", "Fly back to Manila.", "Connect home.", "Leave a buffer for weather delays."],
  ],
  sydney: [
    ["The harbour", "Take a guided tour inside the Sydney Opera House.", "Walk around the Royal Botanic Garden to Mrs Macquarie's Chair for the classic view.", "Dinner at Circular Quay as the harbour lights come on.", "Book Opera House tours online."],
    ["Bridge and The Rocks", "Climb the Sydney Harbour Bridge, or walk across it for free.", "Explore The Rocks' markets and old pubs.", "Ferry to Manly for sunset and fish and chips.", "The bridge climb takes about 3 hours."],
    ["Bondi", "Walk the Bondi to Coogee coastal path past ocean pools and sandstone cliffs.", "Swim at Bondi Beach between the flags.", "Dinner in Surry Hills.", "The Icebergs pool at Bondi is iconic."],
    ["Blue Mountains", "Train to Katoomba (about 2 hours) in the Blue Mountains.", "See the Three Sisters and ride Scenic World's cable car and railway.", "Back to Sydney.", "The mountains are cooler; bring a layer."],
    ["Home", "Ferry to Taronga Zoo for koalas with a harbour view.", "Lunch.", "Fly home.", "The airport train takes about 15 minutes."],
  ],
  melbourne: [
    ["Laneways", "Explore Melbourne's street-art laneways: Hosier Lane and AC/DC Lane.", "Graze the Queen Victoria Market for snacks and souvenirs.", "Drinks at a rooftop bar.", "Trams are free inside the CBD."],
    ["Great Ocean Road", "Drive the Great Ocean Road through Torquay, Lorne and Apollo Bay.", "Spot wild koalas in the trees at Kennett River.", "Stay near Port Campbell.", "It's a long, winding drive; stop often."],
    ["Twelve Apostles", "Watch sunrise at the Twelve Apostles, giant limestone stacks in the sea.", "Walk down to Loch Ard Gorge.", "Drive back to Melbourne inland.", "Sunrise is quieter than sunset."],
    ["Phillip Island", "Morning in St Kilda.", "Drive to Phillip Island.", "Watch the Penguin Parade at dusk.", "Photos are not allowed at the parade."],
    ["Home", "Royal Botanic Gardens.", "Lunch.", "Fly home.", "SkyBus runs to the airport every 10 minutes."],
  ],
  queenstown: [
    ["Lake and gondola", "Walk the lakefront of Lake Wakatipu beneath the Remarkables.", "Ride the Skyline Gondola and race down the luge track.", "Dinner, and a Fergburger if the queue allows.", "Sunset from the gondola is spectacular."],
    ["Adrenaline day", "Bungy jump at the Kawarau Bridge, the world's first commercial bungy site.", "Ride the Shotover Jet through a narrow canyon.", "Dinner in historic Arrowtown.", "Book activities in advance."],
    ["Milford Sound", "Take a coach or scenic flight to Milford Sound in Fiordland.", "Cruise beneath sheer cliffs and waterfalls.", "Return to Queenstown.", "Flights are weather-dependent; have a plan B."],
    ["Wine and Glenorchy", "Drive the lakeside road to Glenorchy.", "Wine tasting in the Gibbston Valley.", "Dinner.", "The Glenorchy road is one of New Zealand's most scenic."],
    ["Home", "Morning walk.", "Lunch.", "Fly home.", "The airport is about 15 minutes away."],
  ],
  tasmania: [
    ["Hobart", "Explore Salamanca Place and Battery Point's historic cottages.", "Take the ferry to MONA, a provocative underground museum.", "Dinner on the waterfront.", "Salamanca Market runs on Saturdays."],
    ["Mount Wellington to Freycinet", "Drive up kunanyi/Mount Wellington for views over Hobart.", "Drive to Freycinet National Park (about 2.5 hours).", "Dinner of fresh oysters.", "The summit can be cold even in summer."],
    ["Wineglass Bay", "Hike to the Wineglass Bay lookout, then down to the beach.", "Swim and relax.", "Rest.", "Start early for fewer crowds."],
    ["To Cradle Mountain", "Drive to Cradle Mountain (about 4 hours).", "Walk around Dove Lake.", "Spot wombats at dusk.", "It's a long drive; stop in Launceston."],
    ["Cradle Mountain", "Hike the Dove Lake circuit or climb Marions Lookout.", "Rest.", "Night tour to see Tasmanian devils.", "Weather changes quickly; carry layers."],
    ["Home", "Drive to Launceston.", "Lunch.", "Fly home.", "Allow time for the drive."],
  ],
  cairns: [
    ["Cairns", "Arrive in Cairns.", "Swim at the Esplanade Lagoon.", "Browse the night markets.", "The lagoon is free."],
    ["Outer reef", "Full-day trip to the outer Great Barrier Reef.", "Snorkel or dive among coral and turtles.", "Dinner.", "Seasickness tablets help."],
    ["Kuranda", "Ride the Kuranda Scenic Railway up through the rainforest.", "Return on the Skyrail cable car.", "Dinner.", "Book a combined ticket."],
    ["Daintree", "Drive to the Daintree Rainforest and Cape Tribulation.", "Take a crocodile river cruise.", "Stay in Port Douglas.", "Never swim in rivers or creeks."],
    ["Home", "Four Mile Beach in Port Douglas.", "Lunch.", "Fly home.", "Allow about an hour to Cairns airport."],
  ],
};
