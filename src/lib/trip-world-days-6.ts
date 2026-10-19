import type { TripDay } from "@/lib/trip-days";

/** Full day plans: Patagonia, Peru, Korea, Thailand and Cambodia. */
export const WORLD_DAYS_6: Record<string, TripDay[]> = {
  patagonia: [
    ["Puerto Natales", "Fly into Puerto Natales (or Punta Arenas, then a 3-hour bus), the gateway to Torres del Paine.", "Walk the waterfront along the Última Esperanza fjord and pick up any last gear.", "Dinner of slow-roasted Patagonian lamb.", "Buy your Torres del Paine entry online before you go."],
    ["Into Torres del Paine", "Bus into the park and take the catamaran across Lake Pehoé.", "Hike towards Grey Glacier, or take a boat to its blue ice face.", "Night in a refugio or campsite.", "Pack proper rain and wind gear; weather changes in minutes."],
    ["French Valley", "Hike into the French Valley, surrounded by hanging glaciers and granite walls.", "Lunch on the trail at the Británico viewpoint.", "Night at a refugio along the W trek.", "It's a long day of about 8–10 hours."],
    ["The towers", "Pre-dawn hike up to the Base of the Towers to see the granite spires turn red at sunrise.", "Descend and rest your legs.", "Bus back to Puerto Natales.", "Start by 4 AM for sunrise."],
    ["To El Calafate", "Bus across the border to El Calafate in Argentina (about 5–6 hours).", "Wander the town and Laguna Nimez bird reserve.", "Dinner and Patagonian craft beer.", "Border crossings take time; carry snacks."],
    ["Perito Moreno", "Walk the balconies facing Perito Moreno Glacier as chunks of ice crash into the lake.", "Join a 'mini-trekking' tour with crampons on the glacier itself.", "Farewell lamb dinner.", "Book glacier treks in advance."],
    ["Home", "Morning in El Calafate.", "Fly to Buenos Aires.", "Connect home.", "Leave a buffer for weather delays."],
  ],
  "cusco-machu-picchu": [
    ["Arrive in Cusco", "Fly into Cusco (3,400 m) and rest; altitude hits most people on day one.", "A gentle walk around the Plaza de Armas and the cathedral.", "Early dinner and coca tea.", "Drink plenty of water and avoid alcohol the first night."],
    ["Inca Cusco", "Visit Qorikancha, the Inca sun temple with a Spanish convent built on top.", "Explore the zig-zag walls of Sacsayhuamán above the city.", "Browse San Pedro market, then dinner in the San Blas quarter.", "Buy the Cusco tourist ticket for many sites."],
    ["Sacred Valley", "Visit Pisac's market and hilltop terraces.", "Continue to Ollantaytambo, a living Inca town with a temple fortress.", "Stay overnight in the Sacred Valley.", "The valley is lower than Cusco and easier on altitude."],
    ["Machu Picchu", "Take the train to Aguas Calientes and the bus up to Machu Picchu.", "Explore the citadel with a licensed guide.", "Overnight in Aguas Calientes.", "Guides and timed tickets are required."],
    ["Huayna Picchu", "Hike Huayna Picchu or Machu Picchu Mountain for the classic view from above.", "Train back to Cusco.", "Dinner of lomo saltado.", "Book mountain permits weeks ahead."],
    ["Home", "Morning coffee in Cusco.", "Fly to Lima.", "Connect home.", "Allow time for connections in Lima."],
  ],
  seoul: [
    ["Palaces and hanok", "Visit Gyeongbokgung Palace and watch the colourful changing of the guard.", "Wander Bukchon Hanok Village's traditional tiled-roof houses.", "Tea houses and craft shops in Insadong.", "Rent a hanbok for free palace entry."],
    ["Markets and towers", "Eat your way through Gwangjang Market: bindaetteok pancakes and mayak gimbap.", "Ride up to N Seoul Tower on Namsan Mountain for city views.", "Street food and K-beauty shopping in Myeongdong.", "Go to the tower at sunset."],
    ["The DMZ", "Day tour to the Demilitarized Zone between North and South Korea.", "Back to Seoul in the afternoon.", "Nightlife in Hongdae, the university district.", "Bring your passport for the DMZ tour."],
    ["Home", "Visit Changdeokgung's Secret Garden, glorious in autumn colours.", "Lunch of Korean BBQ.", "Fly home.", "The AREX train to Incheon takes about an hour."],
  ],
  "chiang-mai": [
    ["Old City temples", "Visit Wat Chedi Luang's ruined chedi and Wat Phra Singh's golden halls.", "Lunch of khao soi, then a Thai massage.", "Shop at the Sunday Walking Street or the Night Bazaar.", "Cover shoulders and knees in temples."],
    ["Doi Suthep", "Drive up to Wat Phra That Doi Suthep, a golden temple above the city.", "Explore Nimmanhaemin's cafés and galleries.", "Take a Thai cooking class.", "Climb the 306 naga-lined steps for the views."],
    ["Elephants", "Spend the day at an ethical elephant sanctuary watching rescued elephants bathe and feed.", "Lunch at the sanctuary.", "Yi Peng lantern release in November, or a riverside dinner.", "Choose a sanctuary with no riding or shows."],
    ["Home", "Visit Wat Umong, a forest temple with tunnels.", "Lunch.", "Fly home.", "The airport is 15 minutes from the Old City."],
  ],
  "siem-reap": [
    ["Angkor Wat", "Watch sunrise behind the towers of Angkor Wat.", "Explore its galleries and the bas-reliefs of the Churning of the Sea of Milk.", "Dinner and drinks around Pub Street.", "Leave by 4:30 AM for sunrise."],
    ["Angkor Thom and Ta Prohm", "See the Bayon's 200-plus smiling stone faces.", "Explore Ta Prohm, where giant tree roots grip the ruins.", "Watch Phare, the Cambodian circus.", "Ta Prohm is busiest mid-morning."],
    ["Banteay Srei", "Drive to Banteay Srei, a small temple of intricate pink sandstone carving.", "Walk the jungle trail at Kbal Spean, the River of a Thousand Lingas.", "Khmer cooking class.", "Combine both in one trip."],
    ["Tonlé Sap", "Boat trip to a floating village on the Tonlé Sap lake.", "Lunch of fish amok.", "Fly home.", "Choose community-run boat tours."],
  ],
};
