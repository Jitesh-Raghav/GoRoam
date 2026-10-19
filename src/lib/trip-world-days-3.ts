import type { TripDay } from "@/lib/trip-days";

/** Full day plans: the Alps, Whistler, Cape Town and Zanzibar. */
export const WORLD_DAYS_3: Record<string, TripDay[]> = {
  chamonix: [
    ["Arrive under Mont Blanc", "Transfer from Geneva airport (about 1 hour) and check in; pick up your Carte d'Hôte guest card for free valley buses and trains.", "Rent ski gear and walk the town centre, past the statue of Saussure pointing at Mont Blanc.", "Dinner of tartiflette or fondue savoyarde, then a génépi nightcap.", "Book ski hire online for a discount and less queueing."],
    ["Aiguille du Midi", "Take the first cable car up the Aiguille du Midi to 3,842 m for close-up views of Mont Blanc and the Vallée Blanche.", "Step into the Void, a glass box over a 1,000-metre drop, then ski Les Grands Montets or Brévent in the afternoon.", "Après-ski in a lively bar on Rue des Moulins.", "Altitude can cause headaches; move slowly at the top."],
    ["Mer de Glace", "Ride the red Montenvers rack railway to the Mer de Glace, France's largest glacier, and walk down to its ice cave.", "Ski Flégère and Brévent, which face Mont Blanc across the valley, with lunch on a sunny terrace.", "Dinner in Argentière, a quieter village up the valley.", "Experienced skiers can do the 20 km Vallée Blanche off-piste only with a mountain guide."],
    ["Home", "A last morning on the slopes, or a walk on the snowy Petit Balcon Sud trail.", "Lunch and pick up Savoyard cheese and charcuterie.", "Transfer to Geneva and fly home.", "Allow extra time for weekend traffic to Geneva."],
  ],
  dolomites: [
    ["Arrive in the mountains", "Transfer from Venice or Innsbruck (about 2.5 hours) into Val Gardena or Alta Badia.", "Pick up ski gear and buy a Dolomiti Superski pass, which covers 1,200 km of linked pistes.", "Dinner of canederli dumplings and speck in a family-run stube.", "Book ski hire online before you arrive."],
    ["The Sella Ronda", "Ski the Sella Ronda, a 40 km circuit around the Sella massif linking four valleys by lifts and pistes.", "Stop for lunch at a rifugio for pasta, polenta and apple strudel with mountain views.", "Après-ski as the pale peaks glow pink at sunset, a phenomenon called enrosadira.", "Start by 9 AM; the full loop takes about 6 hours."],
    ["Cortina d'Ampezzo", "Drive to Cortina, host of events at the 2026 Winter Olympics, and ski the Tofana slopes.", "Browse Corso Italia's chic shops and cafés.", "Dinner in Cortina.", "Cortina is about 1.5 hours from Val Gardena by road."],
    ["Seceda and Val Gardena", "Take the cable car up Seceda for one of the most famous views in the Alps: jagged ridges dropping away to the valley.", "Ski Val Gardena's long Saslong run, a World Cup downhill course.", "Sunset over the peaks and a farewell dinner.", "Seceda is busy at midday; go early."],
    ["Home", "A final morning run or a walk in Ortisei's pedestrian centre.", "Lunch of speck and strudel.", "Transfer to the airport and fly home.", "Allow time for mountain roads."],
  ],
  whistler: [
    ["The Sea to Sky", "Drive or shuttle from Vancouver along the Sea to Sky Highway, stopping at Shannon Falls and the Sea to Sky Gondola.", "Check in and collect ski gear in the car-free village.", "Dinner and drinks in Whistler Village's lively squares.", "Winter tyres are required on the highway."],
    ["Whistler Mountain", "Ski Whistler Mountain from the Whistler Village Gondola, with its wide alpine bowls.", "Lunch at the Roundhouse Lodge with views across the Coast Mountains.", "Après-ski at the Garibaldi Lift Company bar at the base.", "Upper runs can be in cloud; check the forecast."],
    ["Peak 2 Peak", "Ride the Peak 2 Peak Gondola, a record-breaking 4.4 km span, across to Blackcomb.", "Ski Blackcomb's glacier bowls and the Spanky's Ladder area for experts.", "Unwind at Scandinave Spa's outdoor hot pools in the forest.", "The spa is a silent space; leave your phone behind."],
    ["Off the slopes", "Try snowshoeing, ziplining or a snowmobile tour through the forest.", "Visit the Audain Art Museum for First Nations and British Columbian art.", "Fondue dinner, or vodka tasting in the Bearfoot Bistro's ice room.", "Snowmobile tours at dusk are spectacular."],
    ["Home", "A last morning run on the slopes.", "Drive back to Vancouver along the coast.", "Fly home.", "Allow 2–3 hours for the drive in snow."],
  ],
  "cape-town": [
    ["City and waterfront", "Wander the colourful houses of the Bo-Kaap and learn about Cape Malay culture at the Bo-Kaap Museum.", "Visit the V&A Waterfront and the Zeitz MOCAA, a contemporary African art museum in a converted grain silo.", "Watch the sunset from Signal Hill with the city lights coming on below.", "The 'Cape Doctor' wind can be strong; bring a jacket."],
    ["Table Mountain", "Take the cable car up Table Mountain early before clouds form, or hike up via Platteklip Gorge (about 2 hours).", "Visit Kirstenbosch Botanical Garden and walk its 'Boomslang' canopy walkway.", "Dinner in Camps Bay with the Twelve Apostles mountains behind.", "The cable car closes in high winds; check its status."],
    ["Cape Peninsula", "Drive the cliff-hugging Chapman's Peak to Hout Bay.", "See African penguins at Boulders Beach, then walk to the lighthouse at Cape Point.", "Seafood dinner in the fishing village of Kalk Bay.", "Allow a full day for the peninsula loop."],
    ["Winelands", "Drive about an hour to Stellenbosch, with Cape Dutch architecture and world-class wineries.", "Ride the Franschhoek Wine Tram between tasting estates.", "Dinner at a wine estate restaurant.", "Arrange a driver if you're tasting."],
    ["Robben Island", "Ferry to Robben Island, where Nelson Mandela was imprisoned for 18 years; tours are led by former political prisoners.", "Lunch at the Waterfront.", "Free evening on Clifton's beaches at sunset.", "Book Robben Island tickets well ahead."],
    ["Home", "A last beach morning at Clifton or Muizenberg.", "Lunch and souvenirs.", "Fly home.", "Allow 45 minutes to the airport."],
  ],
  zanzibar: [
    ["Stone Town", "Walk Stone Town's maze of alleys and carved wooden doors with a local guide.", "Visit the Old Fort, the House of Wonders and the memorial at the former slave market.", "Eat at Forodhani Gardens' night food market: Zanzibar pizza, skewers and sugarcane juice.", "Cover shoulders and knees in Stone Town."],
    ["Spices and Prison Island", "Spice farm tour to taste cloves, cinnamon, vanilla and nutmeg growing on the trees.", "Boat to Prison Island to meet giant Aldabra tortoises, some over 100 years old.", "Sunset dhow cruise along the Stone Town waterfront.", "Spice tours usually include a Swahili lunch."],
    ["North coast", "Drive about an hour to Nungwi or Kendwa on the north coast.", "Afternoon on the white sand and turquoise water.", "Sunset on Kendwa beach, then dinner on the sand.", "Kendwa is swimmable at all tides."],
    ["Mnemba Atoll", "Snorkel at Mnemba Atoll with turtles, reef fish and wild dolphins.", "Lunch and a lazy afternoon on the beach.", "Beach dinner under the stars.", "Choose operators who don't chase dolphins."],
    ["Home", "A last swim.", "Transfer to the airport.", "Fly home.", "Allow an hour to the airport."],
  ],
};
