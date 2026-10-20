import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Lofoten, the Cotswolds, Bath, York and the Gold Coast. */
export const WORLD_DAYS_13: Record<string, TripDay[]> = {
  lofoten: [
    ["Svolvær", "Fly into Svolvær and settle in.", "Walk the harbour among drying racks of stockfish.", "Aurora hunt under clear skies.", "Check the aurora forecast app."],
    ["Henningsvær", "Drive to Henningsvær, a fishing village spread across small islands.", "See its famous football pitch on the rocks and the galleries.", "Dinner of Arctic fish soup.", "The pitch is one of Norway's most photographed spots."],
    ["Reine", "Drive west to Reine and the red cabins at Hamnøy bridge.", "Short walks and photos along the fjords.", "Overnight in a traditional rorbu cabin.", "Daylight is short in winter; plan stops."],
    ["Beaches and Vikings", "Visit Haukland and Uttakleiv beaches beneath snowy peaks.", "Lofotr Viking Museum's reconstructed longhouse.", "Final aurora watch.", "Bring warm layers for the night."],
    ["Home", "Morning walk.", "Fly out.", "Connect home.", "Allow time for weather delays."],
  ],
  cotswolds: [
    ["Northern villages", "Explore Chipping Campden's golden-stone high street and market hall.", "Climb Broadway Tower for views over 16 counties, then visit Snowshill village.", "Pub dinner by a log fire.", "Broadway Tower has a café and deer park."],
    ["Water and stone", "Walk Bourton-on-the-Water's little bridges over the River Windrush.", "Follow the footpath through Lower and Upper Slaughter (about 1.5 hours).", "Cream tea in Stow-on-the-Wold.", "Wear boots for the muddy fields."],
    ["Blenheim and home", "Tour Blenheim Palace, Churchill's birthplace, and its Christmas light trail in season.", "Lunch in Bibury by Arlington Row.", "Drive home.", "Book the light trail early."],
  ],
  bath: [
    ["Roman Baths", "Tour the Roman Baths, where steaming water still flows into the 2,000-year-old pool.", "Visit Bath Abbey and the Christmas market around it.", "Soak in the rooftop pool at Thermae Bath Spa at dusk.", "Book spa sessions online."],
    ["Georgian Bath and home", "Walk the sweeping Royal Crescent and the Circus.", "Jane Austen Centre and Pulteney Bridge.", "Train home.", "Pulteney Bridge is lovely at sunset."],
  ],
  york: [
    ["Minster and the Shambles", "Visit York Minster and climb its central tower's 275 steps.", "Walk the Shambles and the St Nicholas Fair Christmas market.", "Join a ghost walk and dinner in a medieval pub.", "Ghost walks start outside the Minster in the evening."],
    ["Walls and Vikings", "Walk the city walls, the most complete in England.", "Jorvik Viking Centre, then tea at Bettys.", "Train home.", "Bettys queues are long; go early."],
  ],
  "gold-coast": [
    ["Surfers Paradise", "Hit the beach at Surfers Paradise.", "Take a surf lesson at a beginner-friendly break.", "Sunset from the SkyPoint observation deck.", "Swim between the red and yellow flags."],
    ["Theme parks", "Spend the day at Movie World, Dreamworld or Sea World.", "Afternoon rides and shows.", "Dinner in Broadbeach.", "Arrive at opening to beat the queues."],
    ["Hinterland", "Drive into Springbrook National Park's rainforest and waterfalls.", "Walk to the Natural Bridge.", "Watch the glow-worms after dark.", "Glow-worms are best on a dark, still night."],
    ["Home", "Walk the headland at Burleigh Heads.", "Lunch.", "Fly home.", "The airport is 25 minutes from Burleigh."],
  ],
};
