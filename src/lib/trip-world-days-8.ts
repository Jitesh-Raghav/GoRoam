import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Utah, Wyoming, the Canadian Rockies and Florida. */
export const WORLD_DAYS_8: Record<string, TripDay[]> = {
  "park-city": [
    ["Arrive and Main Street", "Take the shuttle from Salt Lake City (about 40 minutes) and pick up rental skis in town.", "Walk historic Main Street, lined with 1890s silver-boom buildings, and visit the Park City Museum in the old City Hall.", "Dinner and a local craft beer in a Main Street saloon, then a ride on the free trolley.", "Altitude is about 2,100 m; go easy on the first evening."],
    ["Park City Mountain", "Ski the Park City side's long groomed runs, then ride the Quicksilver Gondola across to the Canyons side.", "Lunch on the mountain with views over the Wasatch range.", "Après around the fire pits at Canyons Village.", "The resort is huge; download the trail map app."],
    ["Deer Valley", "Spend the day at Deer Valley, famous for perfect grooming, short lift lines and ski valets.", "Lunch at Silver Lake Lodge, where the turkey chili is a local legend.", "Dinner in a slopeside lodge restaurant.", "Deer Valley is ski-only: no snowboards."],
    ["Olympic Park and home", "Visit Utah Olympic Park: the Alf Engen Ski Museum and, if running, a bobsled ride on the 2002 Olympic track.", "Lunch at Kimball Junction.", "Shuttle back to Salt Lake City and fly home.", "During Sundance in late January, book everything months ahead."],
  ],
  "jackson-hole": [
    ["Town Square and the elk", "Land at Jackson Hole Airport, inside Grand Teton National Park, and walk the Town Square under its elk-antler arches.", "Take a horse-drawn sleigh ride through the National Elk Refuge among thousands of wintering elk.", "Sit on a saddle bar stool at the Million Dollar Cowboy Bar, then dinner of bison or elk.", "Sleigh rides run from mid-December to early April."],
    ["Rendezvous Mountain", "Ride the aerial tram to the top of Rendezvous Mountain (3,185 m) for huge views of the Tetons.", "Ski the bowls and groomers, and stop for famous waffles at Corbet's Cabin at the summit.", "Après at the Mangy Moose in Teton Village.", "Experts can peek into Corbet's Couloir; it's a 3–6 m drop-in."],
    ["Grand Teton wildlife", "Guided wildlife safari in Grand Teton National Park: moose, bighorn sheep, bald eagles and maybe wolves.", "Snowshoe to Taggart Lake beneath the Grand Teton.", "Dinner back in town.", "Bring binoculars and dress for -15°C."],
    ["Home", "A last morning on the slopes or a dog-sled tour.", "Lunch in town.", "Fly home.", "The airport is small; arrive early in snow."],
  ],
  banff: [
    ["Banff town", "Drive or shuttle from Calgary (about 1.5 hours) into Banff National Park.", "Ride the Banff Gondola up Sulphur Mountain and walk the boardwalk to the weather station.", "Soak in the Banff Upper Hot Springs at dusk with snowy peaks all around.", "Buy gondola tickets online for a discount."],
    ["Ski Sunshine Village", "Ski Banff Sunshine Village, which straddles the Continental Divide and is known for dry, light snow.", "Lunch at the Mad Trapper's Saloon on the mountain.", "Dinner on Banff Avenue.", "The gondola leaves from a car park 15 minutes from town."],
    ["Lake Louise", "Skate on the frozen Lake Louise beneath Victoria Glacier, with the ice castle on the lake.", "Ski the Lake Louise resort, one of the biggest in Canada, with views of the lake.", "Afternoon tea or dinner at the Fairmont Chateau Lake Louise.", "Skates can be rented at the Chateau."],
    ["Johnston Canyon and the Icefields Parkway", "Ice walk through Johnston Canyon on catwalks to the frozen Lower and Upper Falls.", "Drive part of the Icefields Parkway to Peyto Lake's viewpoint.", "Back to Banff for dinner.", "Rent ice cleats; the paths are slippery."],
    ["Home", "Breakfast and a last walk along the Bow River.", "Drive back to Calgary.", "Fly home.", "Winter tyres are required on park roads."],
  ],
  miami: [
    ["South Beach Art Deco", "Join a guided walking tour of the Art Deco district on Ocean Drive, among pastel 1930s hotels.", "Spend the afternoon on Lummus Park beach with its colourful lifeguard towers.", "Dinner and cocktails on Collins Avenue or Española Way.", "The Art Deco Welcome Center runs daily tours."],
    ["Wynwood and the Design District", "Wander the giant murals of Wynwood Walls and the surrounding streets.", "Design District boutiques and the free ICA Miami museum.", "Rooftop drinks downtown with Biscayne Bay views.", "Go to Wynwood in the morning before the heat."],
    ["Little Havana and the Everglades", "Cafecito and pastelitos on Calle Ocho, and watch the domino games at Máximo Gómez Park.", "Airboat tour in the Everglades to see alligators and wading birds.", "Cuban dinner and live salsa at Ball & Chain.", "Choose airboat tours run near the national park."],
    ["Vizcaya and home", "Explore Vizcaya Museum and Gardens, an Italian-style villa on Biscayne Bay.", "Lunch in Coconut Grove.", "Fly home.", "Allow 30–45 minutes to the airport."],
  ],
  orlando: [
    ["Magic Kingdom", "Arrive at rope drop and head straight for Seven Dwarfs Mine Train and TRON Lightcycle / Run.", "Classic rides: Pirates of the Caribbean, the Haunted Mansion and Space Mountain.", "Watch the fireworks over Cinderella Castle.", "Use the My Disney Experience app for wait times."],
    ["Epcot", "Ride Guardians of the Galaxy: Cosmic Rewind and Test Track first thing.", "Eat your way around the 11 World Showcase pavilions.", "Luminous fireworks over the lagoon.", "Epcot hosts seasonal festivals almost all year."],
    ["Universal Orlando", "The Wizarding World of Harry Potter in Islands of Adventure.", "Ride the Hogwarts Express to Diagon Alley at Universal Studios.", "Dinner at CityWalk.", "You need a park-to-park ticket for the train."],
    ["Kennedy Space Center", "Drive an hour east to Kennedy Space Center.", "See the Space Shuttle Atlantis and walk under a Saturn V rocket.", "Back to Orlando.", "Check the launch schedule; you might see one."],
    ["Home", "A last park morning or Disney Springs shopping.", "Lunch.", "Fly home.", "Allow time for airport security."],
  ],
};
