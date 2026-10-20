import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Las Vegas, San Diego, Charleston, Chicago and Napa. */
export const WORLD_DAYS_9: Record<string, TripDay[]> = {
  "las-vegas": [
    ["The Strip", "Walk the Strip from the Bellagio's conservatory and its seasonal flower displays to Caesars Palace and the Venetian's canals.", "Lounge at your resort's pool in the dry winter sun.", "Watch the Bellagio fountains, then a big-name show like Cirque du Soleil's 'O'.", "Wear comfortable shoes; the Strip is longer than it looks."],
    ["Red Rock Canyon", "Drive 30 minutes to Red Rock Canyon and its 13-mile scenic loop of red and cream sandstone.", "Hike the Calico Tanks trail to a hidden pool and a view of the city.", "Evening show at the Sphere, the giant LED dome.", "Red Rock needs a timed entry reservation in the busy season."],
    ["Hoover Dam and downtown", "Tour Hoover Dam and walk the bypass bridge for the view.", "Lunch at a local spot in Boulder City.", "Fremont Street Experience: the light canopy, street performers and the SlotZilla zipline.", "Downtown is cheaper for food and drinks."],
    ["Home", "Brunch buffet at Bacchanal in Caesars Palace.", "A last look around the casinos or the Neon Museum.", "Fly home.", "The airport is only 10 minutes from the Strip."],
  ],
  "san-diego": [
    ["Balboa Park and the zoo", "Wander Balboa Park's Spanish Colonial buildings, gardens and the Botanical Building.", "Spend the afternoon at the San Diego Zoo, one of the world's best.", "Dinner in Little Italy.", "Buy zoo tickets online to skip the queue."],
    ["La Jolla", "Watch the sea lions and harbour seals at La Jolla Cove and the Children's Pool.", "Kayak to the seven sea caves of La Jolla.", "Sunset from the cliffs at Torrey Pines.", "Keep your distance from the seals and sea lions."],
    ["Whales and Coronado", "Whale-watching cruise from the harbour to see gray whales migrating (December to April).", "Cross to Coronado for its wide beach and the red-roofed Hotel del Coronado.", "Dinner in the Gaslamp Quarter.", "Morning cruises have calmer seas."],
    ["Old Town and home", "Explore Old Town San Diego State Historic Park, the birthplace of California.", "Mexican lunch in Old Town.", "Fly home.", "The airport is 10 minutes from downtown."],
  ],
  charleston: [
    ["Historic Charleston", "Walk Rainbow Row's pastel houses, the Battery's antebellum mansions and White Point Garden.", "Ferry to Fort Sumter, where the first shots of the Civil War were fired.", "Dinner of shrimp and grits in a historic downtown restaurant.", "Ferries leave from Liberty Square."],
    ["Markets and history", "Browse the Charleston City Market's sweetgrass baskets and crafts.", "Visit the Old Slave Mart Museum and the Aiken-Rhett House to understand the city's history.", "Rooftop drinks on King Street.", "The museum tells a vital part of the city's story."],
    ["Plantations and home", "Visit McLeod Plantation, which focuses on the lives of the enslaved people who worked there, or Magnolia's gardens.", "Lunch and a last walk under the live oaks.", "Fly home.", "Allow 30 minutes to the airport."],
  ],
  chicago: [
    ["Millennium Park", "See your reflection in the Bean (Cloud Gate) and skate at the McCormick Tribune rink.", "Art Institute of Chicago: Seurat's 'A Sunday Afternoon', Hopper's 'Nighthawks' and more.", "Christkindlmarket in Daley Plaza, then deep-dish pizza.", "Buy Art Institute tickets online."],
    ["Skyline and the Magnificent Mile", "Step onto the glass ledge at the Skydeck in Willis Tower.", "Walk the Magnificent Mile for holiday window displays and lights.", "Live blues at Kingston Mines or Buddy Guy's Legends.", "The wind off the lake is bitter; wrap up."],
    ["Museums and home", "Visit the Field Museum to meet SUE the T. rex, or Navy Pier's winter wonderland.", "Lunch of an Italian beef sandwich.", "Fly home.", "Allow 45 minutes to O'Hare by train."],
  ],
  "napa-valley": [
    ["Downtown Napa", "Arrive and browse the Oxbow Public Market for oysters, cheese and coffee.", "Walk to downtown tasting rooms along the river.", "Dinner at a farm-to-table restaurant.", "Downtown tasting rooms don't need a car."],
    ["Balloons and the Wine Train", "Sunrise hot-air balloon ride over the vineyards.", "Lunch on the Napa Valley Wine Train in vintage Pullman cars.", "Dinner in Yountville, home to some of America's top restaurants.", "Book balloons and the train well ahead."],
    ["Calistoga and home", "Soak in a volcanic-ash mud bath in Calistoga.", "Visit Castello di Amorosa, a 13th-century-style Tuscan castle winery.", "Drive back to San Francisco and fly home.", "Allow 2 hours for traffic."],
  ],
};
