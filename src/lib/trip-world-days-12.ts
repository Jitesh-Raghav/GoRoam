import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Venice, Barcelona, Athens, the Algarve and St Moritz. */
export const WORLD_DAYS_12: Record<string, TripDay[]> = {
  venice: [
    ["St Mark's", "Visit St Mark's Basilica, glowing with gold mosaics, then climb the Campanile for views over the lagoon.", "Tour the Doge's Palace and cross the Bridge of Sighs into the old prisons.", "Cicchetti crawl through Cannaregio's bacari bars with a spritz.", "Book the Basilica's skip-the-line entry."],
    ["Canals and Carnival", "Ride vaporetto line 1 the full length of the Grand Canal.", "Rialto market and the art of Dorsoduro, including the Peggy Guggenheim Collection.", "Carnival events and masked balls in February, or a gondola ride at dusk.", "Gondola fares are fixed; agree the time before boarding."],
    ["Burano and home", "Boat to Murano's glass furnaces and Burano's colourful fishermen's houses.", "Lunch of risotto in Burano.", "Water bus to the airport and fly home.", "Allow extra time for water transport."],
  ],
  barcelona: [
    ["Gaudí", "Visit the Sagrada Família, Gaudí's still-unfinished basilica, in the morning light.", "See Casa Batlló and Casa Milà (La Pedrera) on Passeig de Gràcia.", "Tapas dinner in the Eixample.", "Book Sagrada Família tickets well ahead."],
    ["Old town", "Wander the Gothic Quarter's lanes to the cathedral and Plaça Reial.", "La Boqueria market, then the El Born district and the Picasso Museum.", "Flamenco show or a vermouth bar.", "Eat away from La Rambla for better food and prices."],
    ["Park Güell and the beach", "Explore Park Güell's mosaics and city views.", "Afternoon at Barceloneta beach.", "Seafood paella by the sea.", "Park Güell needs timed tickets."],
    ["Montjuïc and home", "Ride the cable car up Montjuïc for the castle and views.", "Lunch.", "Fly home.", "Allow 45 minutes to the airport."],
  ],
  athens: [
    ["The Acropolis", "Climb to the Acropolis at opening to see the Parthenon before the heat and crowds.", "Visit the Acropolis Museum and its glass-floored excavations.", "Dinner in Plaka's old lanes below the Acropolis.", "Bring water and a hat even in autumn."],
    ["Agora and markets", "Explore the Ancient Agora and the Temple of Hephaestus.", "Central Market, then flea-market shopping in Monastiraki.", "Rooftop bar with Acropolis views.", "Monastiraki's rooftops have the best views."],
    ["Cape Sounion and home", "Drive the coast road to Cape Sounion's Temple of Poseidon.", "Seafood lunch by the sea.", "Fly home.", "Sunset at Sounion is spectacular if your flight is late."],
  ],
  algarve: [
    ["Lagos", "Explore Lagos's old town and its city walls.", "Kayak or walk the cliffs at Ponta da Piedade's golden rock stacks.", "Dinner of cataplana.", "Kayak tours run from Lagos marina."],
    ["Benagil and the cliffs", "Boat trip to Benagil Cave, the sea cave with a hole in its roof.", "Hike the Seven Hanging Valleys clifftop trail.", "Dinner in Carvoeiro.", "Hike in the morning for the best light."],
    ["Sagres", "Drive to Sagres and Cabo de São Vicente, Europe's southwestern tip.", "Lunch of grilled fish.", "Sunset at the lighthouse.", "It's windy; bring layers."],
    ["Faro and home", "Walk Faro's old town and the bone chapel.", "Lunch.", "Fly home.", "Faro airport is close to town."],
  ],
  "st-moritz": [
    ["Arrive in the Engadine", "Take the train from Zurich up into the Engadine valley.", "Walk around the frozen lake and the town.", "Dinner in St Moritz Dorf.", "The lake hosts horse races in February."],
    ["Corviglia", "Ski the sunny, wide slopes of Corviglia above the town.", "Lunch at a mountain restaurant.", "Après-ski and dinner.", "The slopes face south and get lots of sun."],
    ["Bernina Express", "Ride the UNESCO Bernina Express over the Bernina Pass and glaciers down to Tirano in Italy.", "Lunch in Italy.", "Train back to St Moritz.", "Sit on the right for the best glacier views."],
    ["Home", "A last morning on the slopes.", "Train out.", "Fly home from Zurich.", "Allow time for train connections."],
  ],
};
