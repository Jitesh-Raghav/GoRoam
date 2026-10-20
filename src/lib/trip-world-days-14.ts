import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Australia, New Zealand and the Pacific. */
export const WORLD_DAYS_14: Record<string, TripDay[]> = {
  whitsundays: [
    ["Airlie Beach", "Arrive and settle into Airlie Beach.", "Swim in the stinger-free lagoon on the foreshore.", "Dinner by the marina.", "The lagoon is free and safe all year."],
    ["Whitehaven and Hill Inlet", "Boat to Whitehaven Beach's pure white silica sand.", "Walk to the Hill Inlet lookout for the swirling sands, then snorkel.", "Back to Airlie.", "Go at low tide for the best swirls."],
    ["Heart Reef", "Scenic flight over Heart Reef and the Great Barrier Reef.", "Afternoon on the beach.", "Sunset sail.", "Flights depend on the weather."],
    ["Home", "Morning swim.", "Lunch.", "Fly home.", "Allow buffer for transfers."],
  ],
  uluru: [
    ["Sunset at Uluru", "Fly into Ayers Rock Airport and settle into Yulara.", "Visit the Uluru-Kata Tjuta Cultural Centre to learn Anangu stories.", "Watch Uluru glow red at sunset, then walk among the 50,000 lights of the Field of Light.", "Book the Field of Light ahead."],
    ["Sunrise and the base walk", "Watch sunrise over Uluru.", "Walk part of the 10 km base walk past waterholes and rock art.", "Sounds of Silence dinner under the desert stars.", "Walk early before the heat."],
    ["Kata Tjuta and home", "Hike the Valley of the Winds among Kata Tjuta's domes.", "Lunch.", "Fly home.", "The trail closes on very hot days."],
  ],
  "perth-margaret-river": [
    ["Perth", "Walk Kings Park for views over the city and the Swan River.", "Elizabeth Quay and the city centre.", "Dinner in Northbridge.", "Kings Park is one of the world's largest city parks."],
    ["Rottnest Island", "Ferry to Rottnest Island and rent a bike.", "Cycle between turquoise bays and meet the quokkas.", "Back to Perth.", "Don't feed or touch the quokkas."],
    ["Fremantle and south", "Fremantle Markets and the historic prison.", "Drive about 3 hours south.", "Arrive in Margaret River.", "Break the drive at Busselton Jetty."],
    ["Wine country", "Cellar-door tastings at Margaret River wineries.", "Visit Lake Cave or Mammoth Cave.", "Dinner at a winery restaurant.", "Hire a driver if tasting."],
    ["Home", "Morning at Surfers Point.", "Drive back to Perth.", "Fly home.", "Allow time for the drive."],
  ],
  "auckland-bay-of-islands": [
    ["Auckland", "Ride up the Sky Tower and walk the Viaduct Harbour.", "Climb Mount Eden volcano for city views.", "Dinner at the waterfront.", "Mount Eden is a short bus ride from the centre."],
    ["Waiheke", "Ferry to Waiheke Island (40 minutes).", "Vineyard tastings and a swim at Onetangi Beach.", "Ferry back to Auckland.", "Book the ferry ahead on weekends."],
    ["Bay of Islands", "Drive north (about 3 hours) to Paihia.", "Visit the Waitangi Treaty Grounds.", "Dinner by the bay.", "Stop at Whangarei Falls on the way."],
    ["Dolphins", "Cruise to the Hole in the Rock, often with dolphins.", "Ferry to Russell's historic town.", "Sunset.", "Swimming with dolphins depends on conditions."],
    ["Home", "Drive back to Auckland.", "Lunch.", "Fly home.", "Allow time for traffic."],
  ],
  rotorua: [
    ["Te Puia", "Visit Te Puia to see the Pōhutu geyser erupt and Māori carvers at work.", "Walk the Redwoods Treewalk among giant trees.", "Hāngī dinner and a Māori cultural performance.", "Book the evening experience ahead."],
    ["Wai-O-Tapu", "See Wai-O-Tapu's colourful Champagne Pool and the Lady Knox geyser.", "Soak in the Polynesian Spa by the lake.", "Dinner in town.", "Lady Knox erupts daily at 10:15 AM."],
    ["Hobbiton and home", "Tour the Hobbiton movie set in Matamata.", "Lunch at the Green Dragon Inn.", "Drive to Auckland.", "Hobbiton is about an hour from Rotorua."],
  ],
  fiji: [
    ["Nadi", "Land in Nadi and relax.", "Sabeto Mud Pools and the Garden of the Sleeping Giant's orchids.", "Dinner at Port Denarau.", "Most flights arrive early morning."],
    ["To the islands", "Ferry or seaplane to a Mamanuca island.", "Snorkel the house reef.", "Sunset and a kava ceremony.", "Bring cash for island extras."],
    ["Cloud 9", "Boat to Cloud 9, the floating bar on the reef.", "Swim and snorkel.", "Dinner on the beach.", "Cloud 9 gets busy by afternoon."],
    ["Yasawas", "Ferry to the Yasawa Islands.", "Swim with manta rays in season.", "Village visit with a sevusevu ceremony.", "Mantas are seen from May to October."],
    ["Beach day", "Hike to a lookout.", "Snorkelling.", "Lovo feast cooked in an earth oven.", "Bring reef-safe sunscreen."],
    ["Home", "Ferry back to Nadi.", "Lunch.", "Fly home.", "Allow buffer for ferries."],
  ],
  "bora-bora": [
    ["Arrive", "Boat transfer from the airport motu to your resort.", "Swim from your bungalow deck.", "Sunset dinner facing Mount Otemanu.", "Transfers are by boat."],
    ["Lagoon tour", "Snorkel with blacktip reef sharks and stingrays.", "Coral gardens and a picnic on a motu.", "Dinner at the resort.", "Book a tour that includes lunch."],
    ["Matira and the island", "Morning at Matira Beach, the island's best public beach.", "4x4 tour of the island's WWII cannons and viewpoints.", "Polynesian dance show.", "Rent a bike on the main island."],
    ["Relax", "Spa morning.", "Paddleboard on the lagoon.", "Sunset drinks.", "Calm mornings are best for paddling."],
    ["Home", "Morning swim.", "Boat transfer to the airport.", "Fly home via Tahiti.", "Allow time for connections in Papeete."],
  ],
};
