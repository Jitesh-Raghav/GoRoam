import type { TripDay } from "@/lib/trip-days";

/** Full day plans for European trips (they replace the short ones in trip-world-*.ts). */
export const WORLD_DAYS_1: Record<string, TripDay[]> = {
  seville: [
    ["Cathedral and Alcázar", "Start at Seville Cathedral, the largest Gothic cathedral in the world and home to Columbus's tomb, then climb the ramps (not stairs) of the Giralda tower for views over the old town.", "Spend the afternoon in the Real Alcázar, wandering its tiled Moorish halls, the Mercury pool and the orange-tree gardens that starred in Game of Thrones.", "Tapas crawl through the Santa Cruz quarter's whitewashed lanes: espinacas con garbanzos at El Rinconcillo (open since 1670), then jamón and sherry at a corner bar.", "Book cathedral and Alcázar tickets online; queues can top an hour."],
    ["Plaza de España and Triana", "Walk María Luisa Park to the Plaza de España, a sweeping semicircle of tiled alcoves for every Spanish province; rent a rowing boat on the canal.", "Cross the Isabel II bridge to Triana, the old potters' and sailors' quarter: browse ceramics on Calle Alfarería and graze at the Triana food market.", "Watch a flamenco show at an intimate tablao such as Casa de la Memoria, then late dinner by the river.", "Shows sell out; book a day ahead."],
    ["Setas and the river", "Morning coffee and churros, then the Archivo de Indias, which holds the records of Spain's empire in the Americas.", "Climb Las Setas, the giant wooden 'mushrooms' of Plaza de la Encarnación, for a rooftop walkway, then a boat cruise on the Guadalquivir.", "Sunset drinks on a rooftop facing the Giralda before you leave.", "Las Setas is most dramatic at sunset."],
  ],
  tenerife: [
    ["Arrive on the south coast", "Land at Tenerife South and pick up a rental car; base yourself in Costa Adeje or Los Cristianos for the sunniest weather.", "Spend the afternoon on the golden sand of Playa del Duque, or swim in the calm water at Playa de las Vistas.", "Seafood dinner at a harbour restaurant in Los Cristianos, with papas arrugadas and mojo sauces.", "Even in winter the sun is strong here; pack high-factor sunscreen."],
    ["Mount Teide", "Drive up through pine forest into Teide National Park, a moonscape of lava fields and colourful rock at 2,000 m.", "Take the cable car to 3,555 m for views across the Canaries; walk the short Roques de García trail on the way down.", "Join a guided stargazing tour: Teide has some of the clearest skies in Europe.", "The summit path above the cable car needs a free permit booked weeks ahead."],
    ["Los Gigantes and Masca", "Board a boat from Los Gigantes under 600-metre sea cliffs to watch pilot whales and dolphins, which live here year round.", "Drive the hairpin road to Masca, a hamlet clinging to the side of a deep gorge, for lunch with a view.", "Sunset over the island of La Gomera from the Mirador de Cherfe.", "Masca's road is narrow and winding; take it slowly."],
    ["The green north", "Explore San Cristóbal de La Laguna, a UNESCO town of colourful colonial houses and Spain's first unfortified city.", "Hike in the Anaga mountains' laurel forest, among the oldest forests in Europe.", "Dinner in Puerto de la Cruz by the Lago Martiánez seawater pools.", "The north is cooler and cloudier; bring a layer."],
    ["Last swim and home", "A final swim at El Médano or a coffee overlooking the sea.", "Lunch of grilled fish and pick up local wine and mojo sauces.", "Return the car and fly home from Tenerife South.", "Allow time; the airport is busy in winter."],
  ],
  madeira: [
    ["Funchal", "Explore Funchal's old town and the Mercado dos Lavradores, full of exotic fruit and the day's catch of black scabbardfish.", "Ride the cable car up to Monte, visit the tropical gardens, then come down the traditional way in a wicker toboggan steered by two men in straw hats.", "Dinner in the Zona Velha, where every door on Rua de Santa Maria is painted by an artist.", "Try a glass of poncha, the local rum, honey and lemon drink."],
    ["Above the clouds", "Drive up in the dark to Pico do Arieiro (1,818 m) for sunrise above a sea of clouds.", "Hike part of the spectacular ridge trail towards Pico Ruivo, Madeira's highest peak, through tunnels and along knife-edge paths.", "Rest, then a quiet dinner of espetada beef skewers.", "Check trail status; parts close after storms."],
    ["Levada walks", "Walk the Levada das 25 Fontes, following an old irrigation channel through laurel forest to a pool fed by 25 springs.", "Lunch in Rabaçal, then the short Risco waterfall walk.", "Back to Funchal for a sunset drink on the seafront.", "Bring a torch; some levada paths go through tunnels."],
    ["The wild northwest", "Drive to Porto Moniz to swim in natural volcanic rock pools filled by the Atlantic.", "Stop at Seixal's black-sand beach and the Véu da Noiva waterfall viewpoint.", "Wind back over the Paúl da Serra plateau to Funchal.", "Swim in the pools only when the sea is calm."],
    ["Home", "Morning at the Monte Palace or Botanical Garden.", "Lunch and pick up Madeira wine.", "Fly home from Funchal's famous clifftop runway.", "Window seats give great views on take-off."],
  ],
  malta: [
    ["Valletta", "Start at St John's Co-Cathedral, gilded inside, to see Caravaggio's huge 'Beheading of St John the Baptist'.", "Walk Valletta's grid of honey-coloured streets to the Upper Barrakka Gardens for views of the Grand Harbour and the noon gun salute.", "Dinner in a Valletta wine bar on the steep lanes of Strait Street.", "The saluting battery fires at noon and 4 PM."],
    ["Mdina and Rabat", "Explore Mdina, the 'silent city', a walled medieval capital of narrow lanes and palaces.", "Next door in Rabat, walk through St Paul's Catacombs, an underground Roman cemetery.", "Stay for sunset on Mdina's bastions and cake at Fontanella Tea Garden.", "Mdina is magical after the day-trippers leave."],
    ["Comino and Gozo", "Early boat to the Blue Lagoon on Comino for gin-clear water before the crowds arrive.", "Continue to Gozo to see the Citadel in Victoria and the cliffs of Dwejra.", "Ferry back to Malta for dinner.", "In October the sea is still warm enough to swim."],
    ["The Three Cities", "Cross the Grand Harbour by traditional dghajsa boat to Birgu, the Knights' first base.", "Lunch of rabbit stew or pastizzi, then pick up local honey and lace.", "Fly home.", "Boats across the harbour cost just a few euros."],
  ],
  marrakech: [
    ["The medina", "Begin at Bahia Palace's painted ceilings and courtyards, then the Saadian Tombs.", "Dive into the souks with a guide: leather, lanterns, spices, carpets and the dyers' souk.", "As night falls, Jemaa el-Fnaa fills with storytellers, musicians and food stalls; eat at a numbered stall.", "Hire an official guide for your first souk walk to avoid getting lost."],
    ["Gardens and hammam", "Visit the cobalt-blue Jardin Majorelle and the Yves Saint Laurent Museum next door.", "Wander Le Jardin Secret, a restored riad garden in the medina, then mint tea on a rooftop.", "Unwind in a traditional hammam with a black-soap scrub.", "Book Majorelle online for a timed entry."],
    ["Atlas Mountains", "Day trip to Imlil or the Ourika Valley in the High Atlas, about 1.5 hours away.", "Walk through Berber villages and walnut groves; lunch of tagine with a local family.", "Back to Marrakech for dinner in a riad courtyard.", "Wear walking shoes; paths are rocky."],
    ["Madrasa and souvenirs", "Ben Youssef Madrasa, a former Quranic school with stunning tilework and carved cedar.", "Last shopping for argan oil, lanterns and rugs.", "Fly home.", "Haggling is expected; start at about a third of the asking price."],
  ],
  prague: [
    ["Old Town", "Watch the Astronomical Clock strike the hour in Old Town Square, then climb the Old Town Hall tower.", "Walk the Jewish Quarter's synagogues and the Old Jewish Cemetery.", "Christmas market on Old Town Square: svařák (mulled wine), trdelník and carols beneath the tree.", "The clock show draws crowds; stand by the Town Hall."],
    ["Castle district", "Cross to Prague Castle at opening to see St Vitus Cathedral and the Old Royal Palace.", "Walk Golden Lane's tiny houses, then down through Malá Strana's baroque streets to St Nicholas Church.", "Dinner of svíčková and pilsner in a traditional beer hall.", "Arrive early; the castle is busy by 11 AM."],
    ["Charles Bridge and the river", "Cross Charles Bridge at dawn, when it's empty and misty.", "River cruise on the Vltava and coffee at the Café Louvre, where Kafka once drank.", "A classical concert in a candlelit church.", "Book concert tickets in advance."],
    ["Vyšehrad and home", "Visit Vyšehrad fortress and its cemetery for river views few tourists see.", "Lunch and last markets at Wenceslas Square.", "Fly home.", "The airport bus from Veleslavín is quick and cheap."],
  ],
  budapest: [
    ["Pest", "Tour the Hungarian Parliament, home of the Holy Crown.", "St Stephen's Basilica and climb to its dome, then the Shoes on the Danube memorial.", "Christmas market at Vörösmarty Square: lángos, chimney cake and mulled wine.", "Book Parliament tours online; they sell out."],
    ["Buda", "Funicular up to Castle Hill: Fisherman's Bastion and Matthias Church.", "Buda Castle and the Hungarian National Gallery.", "Evening Danube cruise past the lit-up Parliament.", "Fisherman's Bastion is free early in the morning."],
    ["Baths and ruin bars", "Soak in the steaming outdoor pools of the Széchenyi Baths, even when it's snowing.", "Walk Andrássy Avenue to Heroes' Square and City Park's ice rink.", "Ruin bars in District VII, starting with Szimpla Kert.", "Bring flip-flops and a towel to the baths."],
    ["Great Market Hall", "Browse the Central Market Hall for paprika, salami and Tokaji wine.", "Lunch of goulash.", "Fly home.", "The 100E bus goes straight to the airport."],
  ],
  strasbourg: [
    ["Cathedral and markets", "Visit Strasbourg Cathedral, a pink sandstone Gothic masterpiece, and its astronomical clock.", "Wander the Christkindelsmärik, France's oldest Christmas market, around the cathedral and Place Broglie.", "Dinner of choucroute in a traditional winstub.", "The astronomical clock's figures perform at 12:30."],
    ["Petite France", "Stroll Petite France's half-timbered houses and canals.", "Take a boat tour around the Grande Île.", "More markets and vin chaud blanc.", "Go early to avoid crowds."],
    ["Colmar", "Train to Colmar (30 minutes), a storybook town.", "Little Venice's canals and Christmas markets.", "Back to Strasbourg and leave.", "Colmar's markets are smaller and cosier."],
  ],
  munich: [
    ["Old town", "See the Glockenspiel's dancing figures at Marienplatz at 11 AM, then climb St Peter's Church tower.", "Wander the Viktualienmarkt for sausages and Bavarian specialities.", "Christmas market at Marienplatz, then a beer at the Hofbräuhaus.", "Climb St Peter's for the best view of the Frauenkirche."],
    ["Neuschwanstein", "Day trip to Neuschwanstein, the fairy-tale castle that inspired Disney.", "Visit Hohenschwangau castle and the Marienbrücke viewpoint.", "Back to Munich for dinner.", "Book timed tickets online."],
    ["Museums and parks", "Visit the Residenz, the former royal palace, or the Deutsches Museum.", "Walk the English Garden and watch the Eisbach surfers.", "Dinner at a beer hall.", "The surfers ride the river wave all year."],
    ["Nymphenburg and home", "Nymphenburg Palace and gardens.", "Lunch.", "Fly home.", "Allow 45 minutes on the S-Bahn to the airport."],
  ],
  amsterdam: [
    ["Museumplein", "Rijksmuseum at opening to see Rembrandt's The Night Watch and Vermeer's The Milkmaid.", "Van Gogh Museum, then a walk through Vondelpark.", "Evening canal cruise past the Amsterdam Light Festival's illuminated artworks.", "Book Van Gogh tickets online; there are no door sales."],
    ["Canals and Jordaan", "Visit the Anne Frank House, the secret annexe where she wrote her diary.", "Wander the Jordaan's cafés and the Nine Streets' boutiques.", "Bitterballen and jenever in a brown café.", "Anne Frank House tickets are released six weeks ahead."],
    ["Markets and home", "Albert Cuyp market for stroopwafels and herring.", "Lunch.", "Fly home.", "Trains to Schiphol run every few minutes."],
  ],
  rovaniemi: [
    ["Santa Claus Village", "Arrive and get kitted out in thermal suits.", "Visit Santa Claus Village on the Arctic Circle: meet Santa, cross the line and send postcards from his post office.", "First northern lights hunt by minibus away from city lights.", "Book Santa visits early in December."],
    ["Huskies and reindeer", "Drive your own husky sled through snowy forest.", "Visit a reindeer farm and take a sleigh ride with Sámi herders.", "Finnish sauna and a dinner of sautéed reindeer.", "Wear thick mittens; it gets very cold."],
    ["Snowmobiles and the Arktikum", "Snowmobile safari across frozen rivers and forests.", "Visit the Arktikum museum to learn about Arctic life and the aurora.", "Spend the night in a glass igloo watching for the lights.", "Snowmobile drivers need a licence."],
    ["Home", "Breakfast and a last walk.", "Pick up Finnish design and treats.", "Fly home.", "Allow buffer for snow delays."],
  ],
  tromso: [
    ["City and cable car", "Arrive and visit Polaria aquarium.", "See the Arctic Cathedral and ride the Fjellheisen cable car at dusk.", "Northern lights chase with a guide.", "Dress warmer than you think."],
    ["Whales", "Whale safari in the fjords to see orcas and humpbacks.", "Lunch on board.", "Rest.", "Seasickness tablets help."],
    ["Huskies", "Dog sledding in the mountains.", "Sámi reindeer camp.", "Aurora camp under the stars.", "Book combined tours."],
    ["Home", "Breakfast.", "Shopping.", "Fly home.", "Flights can be delayed by snow."],
  ],
};
