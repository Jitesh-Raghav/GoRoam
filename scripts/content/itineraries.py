"""
Hand-written long-tail itineraries for GoRoam's public trip gallery.
Run: python3 scripts/content/itineraries.py   (writes src/data/packages/<slug>.json)
Costs are USD for two people; coordinates are the places' real locations.
"""
import json, os

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "packages")

def stop(time, name, area, lat, lng, desc, dur, cost, cat, tip):
    return {"time": time, "place": {"name": name, "description": desc, "area": area, "lat": lat, "lng": lng},
            "duration": dur, "estimatedCost": cost, "category": cat, "tip": tip}

M, A, E = "Morning", "Afternoon", "Evening"

def day(n, date, theme, summary, m, a, e, tip=None):
    d = {"day": n, "date": date, "theme": theme, "summary": summary, "morning": m, "afternoon": a, "evening": e,
         "totalDayCost": m["estimatedCost"] + a["estimatedCost"] + e["estimatedCost"]}
    if tip: d["dayTip"] = tip
    return d

def trip(slug, dest, landscape, cc, overview, highlights, days, stays, essentials, packing, prefs):
    total = sum(d["totalDayCost"] for d in days)
    data = {"itinerary": days, "stays": stays, "essentials": essentials, "packing": packing,
            "summary": {"totalCost": total, "totalDays": len(days), "destination": dest, "overview": overview,
                        "landscape": landscape, "countryCode": cc, "highlights": highlights},
            "trip": {"source": "", "preferences": prefs}, "photos": {}}
    with open(os.path.join(OUT, f"{slug}.json"), "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False); f.write("\n")
    print(f"✓ {slug}: {len(days)} days, ${total}")

def prefs(companions, adults, spend, stay, pace, transport, occasion="first"):
    return {"companions": companions, "adults": adults, "children": 0, "spend": spend, "stay": stay, "pace": pace,
            "diet": [], "transport": transport, "occasion": occasion, "notes": ""}

INR = "Indian Rupee (INR). UPI and cards work in towns; carry cash for small temples, coracles and rural stalls."

# ------------------------------------------------------------------ Hampi
trip("hampi-3-days-couples", "Hampi, India", "desert", "in",
 "Three unhurried days among the boulder fields and temple ruins of the Vijayanagara capital, timed so you catch the soft light at sunrise and sunset, with a coracle ride on the Tungabhadra and quiet dinners for two.",
 ["Sunset over the ruins from Hemakuta Hill", "The stone chariot at Vittala Temple", "A round coracle ride on the Tungabhadra", "Lotus Mahal and the royal Elephant Stables"],
 [
  day(1, "2026-11-12", "Bazaar, temples and a hilltop sunset", "Ease in around Hampi Bazaar, the living Virupaksha Temple and the boulder-strewn Hemakuta Hill.",
      stop("9:00 AM - 11:30 AM", "Virupaksha Temple", "Hampi Bazaar", 15.3350, 76.4600, "Still in worship after 1,300 years, its 50-metre gopuram anchors the old bazaar. Inside, Lakshmi the temple elephant blesses visitors most mornings, and a pinhole in one hall projects an inverted image of the tower.", "2.5 hours", 2, "culture", "Shoulders and knees covered, shoes left at the gate; arrive before 9:30 to see the morning puja."),
      stop("12:30 PM - 3:30 PM", "Hampi Bazaar and the Kadalekalu Ganesha", "Hampi Bazaar", 15.3346, 76.4610, "Walk the kilometre-long colonnade where traders once sold gems by the heap, then climb to the giant monolithic Ganesha and the smaller Sasivekalu Ganesha on the hill's flank. Lunch on a banana-leaf thali at one of the bazaar's family kitchens.", "3 hours", 12, "sight", "Midday is hot on the rocks; carry at least a litre of water each."),
      stop("5:15 PM - 7:00 PM", "Hemakuta Hill sunset", "Hemakuta Hill", 15.3343, 76.4590, "A low granite hill scattered with early temples, where the whole valley turns gold at dusk. It's an easy ten-minute climb from the bazaar and the best first view of Hampi.", "1.75 hours", 0, "nature", "Sit facing west on the slabs behind the twin-tower temples; leave before full dark, the path has no lights.")),
  day(2, "2026-11-13", "Vittala's stone chariot and the river", "The grandest temple complex in Hampi, then a coracle out on the Tungabhadra.",
      stop("8:00 AM - 11:00 AM", "Vittala Temple and Stone Chariot", "Vittala", 15.3426, 76.4747, "The finest carving in Hampi: musical pillars that ring when tapped (now roped off), and the stone chariot pictured on India's ₹50 note. Early light is softest and crowds are thin.", "3 hours", 14, "sight", "The combined ASI ticket also covers Lotus Mahal and the Elephant Stables, so keep it for tomorrow."),
      stop("12:00 PM - 2:30 PM", "Coracle ride on the Tungabhadra", "Riverside below Vittala", 15.3417, 76.4692, "Spin downriver in a bamboo-and-tarp basket boat past riverside shrines and carvings you can't reach on foot. Boatmen gather near the Kodandarama ghat and the path from Vittala.", "1 hour", 10, "activity", "Agree the price and route before you step in; life jackets are usually on board, ask for them."),
      stop("5:00 PM - 7:30 PM", "Malyavanta Raghunatha Temple at dusk", "Kamalapura road", 15.3236, 76.4936, "A hilltop temple to Rama, far quieter than Matanga, with carved fish and sea creatures on the boulders and a wide sunset view east of the ruins.", "2.5 hours", 0, "culture", "Have your auto driver wait; return autos are scarce after dark."),
      tip="Hire one auto-rickshaw for the day (around ₹1,000-1,500); distances between sites are bigger than they look."),
  day(3, "2026-11-14", "The royal centre", "Palaces, the queen's bath and a last sunset by a lake.",
      stop("8:30 AM - 11:30 AM", "Lotus Mahal and Elephant Stables", "Zenana Enclosure", 15.3186, 76.4710, "An Indo-Islamic pavilion of arches and lotus-bud domes inside the walled women's quarter, next to the eleven domed stables built for the royal elephants.", "3 hours", 0, "sight", "Same ticket as Vittala Temple yesterday."),
      stop("12:00 PM - 3:00 PM", "Hazara Rama Temple and Queen's Bath", "Royal Centre", 15.3197, 76.4683, "The palace chapel's walls are a stone comic strip of the Ramayana and royal processions. Ten minutes away, the Queen's Bath is a plain-fronted building hiding a carved arcaded pool.", "3 hours", 6, "culture", "Lunch at a Kamalapura dhaba on the way; it's the closest village to the royal centre."),
      stop("5:00 PM - 7:30 PM", "Sanapur Lake", "Sanapur", 15.3666, 76.4566, "Across the river, a reservoir ringed by boulders where locals swim and couples watch the sun drop behind the rocks. A calm, green contrast to the ruins.", "2.5 hours", 8, "nature", "Swimming isn't safe in all seasons; enjoy it from the rocks unless locals confirm it's calm.")),
 ],
 [{"name": "Heritage Resort Hampi", "area": "Kamalapura road", "type": "Resort", "why": "Cottages with gardens a short drive from the royal centre; quiet for couples.", "pricePerNight": 70},
  {"name": "Evolve Back Kamalapura Palace", "area": "Kamalapura", "type": "Luxury resort", "why": "A palace-style splurge with a pool and guided heritage walks for a special occasion.", "pricePerNight": 330},
  {"name": "Anegundi homestays", "area": "Anegundi", "type": "Homestay", "why": "Simple village rooms across the river, close to Sanapur Lake and Anjanadri Hill.", "pricePerNight": 30}],
 {"currency": INR, "language": "Kannada; Hindi and English understood in Hampi", "plugs": "Type C/D, 230V", "tipping": "Not expected; round up for guides and drivers", "weather": "Oct-Feb is dry and warm (15-30°C). Mar-May is very hot; Jun-Sep brings monsoon green but some closures.", "gettingAround": "Hosapete is the nearest railhead (13 km). Autos and rented bicycles or scooters cover the sites.", "phrase": "Namaskara (ನಮಸ್ಕಾರ): Hello"},
 ["Light cotton clothes that cover knees and shoulders", "Wide-brim hat and sunscreen", "Shoes with grip for granite", "Reusable water bottle", "Small torch for sunset walks back"],
 prefs("couple", 2, "comfort", "resort", "relaxed", "rides", "anniversary"))

# ------------------------------------------------------------------ Jaipur
trip("jaipur-2-days", "Jaipur, India", "desert", "in",
 "A tight, well-paced 48 hours in the Pink City: the hill fort of Amer at opening time, the City Palace and Jantar Mantar, old-city bazaars, and a rooftop dinner facing Hawa Mahal.",
 ["Amer Fort at opening time", "Jantar Mantar's giant sundials", "Sunset from Nahargarh Fort", "Lassi and kachori in the old city"],
 [
  day(1, "2026-12-03", "Forts on the ridge", "Amer Fort early, Jal Mahal on the way back, and the city lights from Nahargarh.",
      stop("8:00 AM - 11:30 AM", "Amer Fort", "Amer", 26.9855, 75.8513, "A honey-coloured fort-palace above Maota Lake, with the mirror-work Sheesh Mahal and courtyards that light up in the early sun. Arriving at 8 means you see it before the tour buses.", "3.5 hours", 12, "sight", "Walk or take a jeep up; skip the elephant rides. The composite ticket also covers Nahargarh, Albert Hall and Jantar Mantar."),
      stop("12:30 PM - 3:00 PM", "Jal Mahal and lunch on Amer Road", "Man Sagar Lake", 26.9535, 75.8463, "A photo stop at the palace that seems to float on Man Sagar Lake, then lunch nearby on dal baati churma, Rajasthan's signature baked wheat balls with lentils.", "2.5 hours", 15, "food", "The palace itself is closed to visitors; the promenade is the view."),
      stop("5:00 PM - 8:00 PM", "Nahargarh Fort sunset", "Aravalli ridge", 26.9374, 75.8156, "The ridge-top fort looks straight down on the whole city. Stay for sunset as Jaipur's lights come on, then eat at the fort's terrace café.", "3 hours", 20, "sight", "Book a cab both ways; the road up is steep and winding.")),
  day(2, "2026-12-04", "Inside the Pink City", "The royal city centre, bazaars and a rooftop view of Hawa Mahal.",
      stop("9:30 AM - 12:30 PM", "City Palace and Jantar Mantar", "Old City", 26.9258, 75.8237, "The royal family still lives in part of the City Palace; the museum rooms and the four seasonal gates of Pritam Niwas Chowk are open to visitors. Next door, Jantar Mantar's 18th-century instruments include the world's largest stone sundial.", "3 hours", 20, "culture", "Hire a licensed guide at Jantar Mantar; the instruments make much more sense explained."),
      stop("1:00 PM - 4:00 PM", "Johari and Bapu Bazaar", "Old City", 26.9196, 75.8264, "Block-printed textiles, mojari slippers and silver along the pink arcades. Stop at Lassiwala on MI Road for a clay cup of thick lassi and at Rawat Mishthan Bhandar for pyaaz kachori.", "3 hours", 25, "shopping", "Prices are open to bargaining; start at around half of the first quote."),
      stop("5:30 PM - 8:30 PM", "Hawa Mahal and a rooftop dinner", "Badi Chaupar", 26.9239, 75.8267, "See the 953-window 'Palace of Winds' from the front, then climb to one of the cafés opposite for a rooftop dinner looking straight at its façade.", "3 hours", 30, "food", "The best view is from the cafés across the road, not from inside the palace.")),
 ],
 [{"name": "Samode Haveli", "area": "Old City", "type": "Heritage hotel", "why": "A 19th-century haveli with painted rooms and a pool, walkable to the old city.", "pricePerNight": 160},
  {"name": "Alsisar Haveli", "area": "Sansar Chandra Road", "type": "Heritage hotel", "why": "Rajput architecture and courtyards at a mid-range price.", "pricePerNight": 90},
  {"name": "Zostel Jaipur", "area": "Hathroi Fort area", "type": "Hostel", "why": "Social, central and budget-friendly, with private rooms too.", "pricePerNight": 25}],
 {"currency": INR, "language": "Hindi and Rajasthani; English widely understood", "plugs": "Type C/D, 230V", "tipping": "5-10% in sit-down restaurants", "weather": "Oct-Mar is pleasant (8-28°C); Apr-Jun is fierce heat above 40°C.", "gettingAround": "Uber, Ola and autos are cheap; agree the auto fare first.", "phrase": "Khamma ghani: a warm Rajasthani hello"},
 ["Comfortable walking shoes", "Scarf for sun and temple visits", "Sunglasses", "Layer for cool winter evenings"],
 prefs("couple", 2, "comfort", "boutique", "balanced", "rides"))

# ------------------------------------------------------------------ Udaipur
trip("udaipur-3-days-couples", "Udaipur, India", "lakes", "in",
 "Udaipur for two: lake palaces, a sunset boat on Lake Pichola, old-city lanes and a day trip into the Aravalli hills, with candlelit dinners on the water.",
 ["Sunset boat ride on Lake Pichola", "The City Palace's mirror and peacock halls", "Dinner facing the Lake Palace", "Monsoon Palace at dusk"],
 [
  day(1, "2027-01-14", "Palaces on Lake Pichola", "The City Palace, then a sunset boat to Jag Mandir.",
      stop("9:30 AM - 1:00 PM", "City Palace", "Lake Pichola east bank", 24.5764, 73.6835, "A cascade of palaces built over four centuries, with the Mor Chowk peacock mosaics and the mirrored Sheesh Mahal. The terraces frame Lake Pichola and the Lake Palace hotel below.", "3.5 hours", 20, "sight", "Rent the audio guide; the palace is a maze and the stories are the point."),
      stop("1:30 PM - 3:30 PM", "Lunch at Ambrai Ghat", "Hanuman Ghat", 24.5797, 73.6799, "Cross to the quieter west bank for a lakeside lunch looking back at the City Palace, the classic Udaipur view.", "2 hours", 30, "food", "Ask for a table on the ghat edge; it's the same view as the postcards."),
      stop("4:30 PM - 6:30 PM", "Sunset boat to Jag Mandir", "Lake Pichola", 24.5675, 73.6799, "The palace boat ride stops at Jag Mandir, the island palace said to have inspired the Taj Mahal, and times the return for sunset.", "2 hours", 24, "activity", "Book the last sunset departure at the City Palace jetty in the morning; it sells out.")),
  day(2, "2027-01-15", "Old city and a royal sunset", "Lanes, havelis, a folk show, and the hilltop Monsoon Palace.",
      stop("9:00 AM - 12:00 PM", "Jagdish Temple and old-city lanes", "Old City", 24.5797, 73.6838, "A carved 17th-century Vishnu temple at the heart of the old city, then the lanes around it full of miniature-painting studios and silver shops.", "3 hours", 5, "culture", "Many studios run short painting demos; a good way to buy a genuine miniature."),
      stop("1:00 PM - 4:00 PM", "Saheliyon ki Bari", "Fateh Sagar area", 24.6022, 73.6866, "The 'garden of the maidens', with marble elephants, lotus pools and fountains fed by gravity from Fateh Sagar Lake.", "2 hours", 3, "nature", "Pair it with a walk along Fateh Sagar's promenade afterwards."),
      stop("5:00 PM - 7:30 PM", "Sajjangarh Monsoon Palace", "Bansdara Hill", 24.5944, 73.6386, "A white hilltop palace above the city, built to watch monsoon clouds. At sunset you see every lake in Udaipur at once.", "2.5 hours", 15, "sight", "Vehicles go up from the sanctuary gate; the last one usually leaves around sunset, so don't linger past it.")),
  day(3, "2027-01-16", "Into the Aravallis", "A morning in the hills and a farewell dinner on the lake.",
      stop("8:00 AM - 12:30 PM", "Eklingji and Nagda temples", "Kailashpuri", 24.7469, 73.7207, "Twenty kilometres north, Eklingji is the Mewar rulers' family temple, still in worship. Nearby Nagda's 10th-century Sas-Bahu temples sit quietly by a lake.", "4.5 hours", 25, "culture", "No phones or cameras inside Eklingji; leave them in the car."),
      stop("1:30 PM - 4:00 PM", "Bagore ki Haveli", "Gangaur Ghat", 24.5797, 73.6819, "An 18th-century minister's mansion turned museum, with rooms of puppets, costumes and the world's 'largest turban'.", "2 hours", 4, "culture", "Come back at 7 PM for the Dharohar folk dance show in the courtyard (tickets at the gate)."),
      stop("7:30 PM - 10:00 PM", "Candlelit dinner facing the Lake Palace", "Lake Pichola", 24.5752, 73.6800, "End with dinner on a lakeside terrace looking at the illuminated Lake Palace, a fitting last night.", "2.5 hours", 70, "food", "Reserve a lake-edge table a day ahead for a weekend night."),
      tip="Most sights close by 6 PM; keep evenings for the lake."),
 ],
 [{"name": "Taj Lake Palace", "area": "Lake Pichola", "type": "Luxury hotel", "why": "The floating marble palace itself, reached only by boat; the ultimate couples' splurge.", "pricePerNight": 650},
  {"name": "Jagat Niwas Palace", "area": "Lal Ghat", "type": "Heritage hotel", "why": "Lake-view havelis with jharokha windows in the heart of the old city.", "pricePerNight": 110},
  {"name": "Amet Haveli", "area": "Hanuman Ghat", "type": "Boutique hotel", "why": "Quiet west-bank rooms facing the City Palace across the water.", "pricePerNight": 130}],
 {"currency": INR, "language": "Hindi and Mewari; English widely understood", "plugs": "Type C/D, 230V", "tipping": "5-10% in restaurants", "weather": "Oct-Mar is mild (10-28°C). Lakes are fullest after the Jul-Sep monsoon.", "gettingAround": "Autos for the old city; book a cab for Sajjangarh and Eklingji.", "phrase": "Padharo mhare des: welcome to my land"},
 ["Smart-casual outfit for lakeside dinners", "Light jacket for winter evenings on the water", "Walking shoes for old-city lanes", "Scarf for temple visits"],
 prefs("couple", 2, "comfort", "boutique", "relaxed", "rides", "honeymoon"))

# ------------------------------------------------------------------ Manali
trip("manali-4-days-friends", "Manali, India", "mountains", "in",
 "Four days in the Kullu valley with your crew: Old Manali cafés, a day in the snow at Solang and Atal Tunnel, river rafting in Kullu and a hike to Jogini Falls.",
 ["Snow at Solang Valley and through Atal Tunnel", "Old Manali's cafés and live music", "White-water rafting on the Beas", "The Jogini Falls hike from Vashisht"],
 [
  day(1, "2027-04-08", "Old Manali and the deodars", "Settle in with temples, cedar forest and café-hopping.",
      stop("10:00 AM - 12:30 PM", "Hidimba Devi Temple", "Dhungri", 32.2482, 77.1801, "A four-tiered wooden pagoda temple from 1553, set in a forest of giant deodar cedars. The carvings around the doorway are the finest in the valley.", "2 hours", 0, "culture", "Queues build after 11; go straight after breakfast."),
      stop("1:00 PM - 4:00 PM", "Old Manali café crawl", "Old Manali", 32.2590, 77.1756, "Cross the Manalsu bridge into the old village for slow lunches of trout and Israeli plates, apple-wood houses and Himalayan views from café terraces.", "3 hours", 30, "food", "Most cafés are cash or UPI; card machines are hit and miss."),
      stop("6:00 PM - 10:00 PM", "Live music night in Old Manali", "Old Manali", 32.2603, 77.1750, "Old Manali's cafés host acoustic sets and open-mic nights through the season, the easiest way to meet other travellers.", "4 hours", 35, "nightlife", "Places close by 11 PM under local rules; plan your walk back down.")),
  day(2, "2027-04-09", "Snow day", "Atal Tunnel to Sissu, then snow play at Solang Valley.",
      stop("7:30 AM - 12:30 PM", "Atal Tunnel and Sissu", "Lahaul", 32.4025, 77.1499, "Drive through the 9-km Atal Tunnel under the Rohtang Pass into Lahaul's stark valley, with frozen waterfalls and snow fields around Sissu.", "5 hours", 50, "nature", "Hire a local taxi; private Manali taxis are the only ones with valley permits. Check road status the night before."),
      stop("1:30 PM - 4:30 PM", "Solang Valley", "Solang", 32.3164, 77.1567, "Snow slopes for sledging, skiing lessons and paragliding in season, with the ropeway climbing to 3,200 m.", "3 hours", 60, "activity", "Rent snow boots and jackets at Solang, not in Manali; it's cheaper and you avoid carrying them."),
      stop("7:00 PM - 9:30 PM", "Dinner on the Mall Road", "Mall Road", 32.2431, 77.1892, "Back in town, walk the pedestrian Mall and eat Himachali siddu and trout at one of the dhabas off the main strip.", "2.5 hours", 25, "food", "Siddu, a steamed stuffed bread with ghee, is the local dish to order.")),
  day(3, "2027-04-10", "River day", "Rafting on the Beas and hot springs at Vashisht.",
      stop("9:00 AM - 1:00 PM", "White-water rafting on the Beas", "Pirdi, Kullu", 31.9567, 77.1162, "A 14-km run of grade II-III rapids from Pirdi, the classic Kullu rafting stretch, with guides and gear included.", "4 hours", 40, "activity", "Rafting runs roughly Mar-Jun and Sep-Oct; it stops during the monsoon."),
      stop("2:00 PM - 4:30 PM", "Kullu shawl weavers", "Bhuttico, Kullu", 31.9706, 77.1104, "Stop at the Bhuttico weavers' co-operative to see handlooms and buy a genuine Kullu shawl with its geometric border.", "2 hours", 30, "shopping", "Co-op prices are fixed and the wool is genuine, unlike many roadside shops."),
      stop("6:00 PM - 8:30 PM", "Vashisht hot springs", "Vashisht", 32.2656, 77.1878, "Soak in the sulphur hot-spring baths beside the old Vashisht temple, then dinner in the village.", "2.5 hours", 5, "wellness", "The public baths are separate for men and women; bring a towel.")),
  day(4, "2027-04-11", "Waterfall hike", "A half-day hike to Jogini Falls before heading home.",
      stop("8:00 AM - 12:30 PM", "Jogini Falls hike", "Vashisht", 32.2765, 77.1915, "A 3-km trail from Vashisht through apple orchards and pine forest to a 150-m waterfall sacred to the local goddess.", "4.5 hours", 0, "nature", "Wear proper shoes; the last stretch is rocky and slippery."),
      stop("1:00 PM - 3:00 PM", "Manu Temple and Old Manali lunch", "Old Manali", 32.2617, 77.1747, "The temple to the sage Manu, who gave Manali its name, sits at the top of the old village. One more café lunch before the road.", "2 hours", 25, "culture", "Book overnight Volvo buses to Delhi a few days ahead in peak season."),
      stop("4:00 PM - 6:00 PM", "Van Vihar riverside walk", "Mall Road", 32.2430, 77.1880, "A deodar park along the Beas for a last easy walk and paddle-boating on the small lake before your evening bus.", "2 hours", 5, "nature", "Overnight buses leave from the private bus stand near the Mall around 5-7 PM.")),
 ],
 [{"name": "Zostel Manali", "area": "Old Manali", "type": "Hostel", "why": "The social hub for friend groups, with dorms and private rooms and a big common area.", "pricePerNight": 30},
  {"name": "Johnson Lodge", "area": "Circuit House Road", "type": "Hotel", "why": "Comfortable rooms and a well-loved restaurant, walkable to the Mall.", "pricePerNight": 90},
  {"name": "Old Manali homestays", "area": "Old Manali", "type": "Homestay", "why": "Wooden village houses with orchard views, good value for a group.", "pricePerNight": 35}],
 {"currency": INR, "language": "Hindi and Kullui; English widely understood", "plugs": "Type C/D, 230V", "tipping": "Round up; tip rafting guides ₹100-200 each", "weather": "Apr is crisp (5-20°C) with snow above Solang. Dec-Feb is freezing; Jul-Aug brings landslide risk.", "gettingAround": "Overnight Volvo from Delhi (12-14 h) or fly to Bhuntar (50 km). Local taxis for Solang and Atal Tunnel.", "phrase": "Ram Ram: the everyday Himachali hello"},
 ["Warm layers and a down jacket", "Waterproof shoes with grip", "Sunglasses for snow glare", "Motion-sickness tablets for mountain roads", "Power bank"],
 prefs("friends", 4, "savvy", "hostel", "packed", "rides"))

# ------------------------------------------------------------------ Rishikesh
trip("rishikesh-3-days", "Rishikesh, India", "mountains", "in",
 "Three days in the yoga capital on the Ganga: sunrise yoga, the Beatles Ashram, rafting through the Shivpuri rapids and the Ganga Aarti at Triveni Ghat and Parmarth Niketan.",
 ["Evening Ganga Aarti at Parmarth Niketan", "Rafting from Shivpuri", "The graffiti-covered Beatles Ashram", "Sunrise yoga by the river"],
 [
  day(1, "2026-10-15", "The bridges and the aarti", "Walk the riverside between Laxman Jhula and Ram Jhula and end at the evening aarti.",
      stop("9:00 AM - 12:00 PM", "Laxman Jhula and Tapovan", "Tapovan", 30.1270, 78.3299, "The suspension-bridge stretch of Rishikesh, with the 13-storey Trimbakeshwar temple and a strip of cafés and yoga schools along the river.", "3 hours", 10, "sight", "The old Laxman Jhula bridge is closed to traffic; the new glass bridge alongside is the crossing."),
      stop("12:30 PM - 3:30 PM", "Beatles Ashram (Chaurasi Kutia)", "Rajaji National Park", 30.1062, 78.3189, "The abandoned Maharishi Mahesh Yogi ashram where the Beatles stayed in 1968, now a forest ruin of meditation domes covered in murals.", "3 hours", 15, "culture", "Foreigners pay a higher ticket; carry ID. Go at midday when the light falls through the domes."),
      stop("5:30 PM - 7:30 PM", "Ganga Aarti at Parmarth Niketan", "Swarg Ashram", 30.1166, 78.3108, "The ashram's riverside aarti with chanting, drums and lamps circled over the Ganga at dusk, open to everyone.", "2 hours", 0, "culture", "Arrive by 5:30 to sit on the ghat steps; the best seats fill early.")),
  day(2, "2026-10-16", "Rapids and cliff-side cafés", "Rafting in the morning, a slow afternoon in Tapovan.",
      stop("8:00 AM - 12:00 PM", "Rafting from Shivpuri", "Shivpuri", 30.1497, 78.3874, "The classic 16-km run from Shivpuri back to Rishikesh through rapids like Roller Coaster and Golf Course, with a cliff-jump stop.", "4 hours", 30, "activity", "Book an operator licensed by the state; rafting closes in the Jul-Aug monsoon."),
      stop("1:00 PM - 4:00 PM", "Lunch and a sound-healing session", "Tapovan", 30.1250, 78.3270, "A long lunch at a cliff-top café, then a singing-bowl sound-healing session at one of Tapovan's studios.", "3 hours", 40, "wellness", "Most sessions are drop-in; ask at the studio in the morning."),
      stop("5:30 PM - 7:30 PM", "Triveni Ghat aarti", "Triveni Ghat", 30.1033, 78.2972, "The town's biggest ghat, where locals float leaf-boat diyas on the river during a grand evening aarti.", "2 hours", 2, "culture", "Buy a diya boat from the stalls for a few rupees and float it yourself.")),
  day(3, "2026-10-17", "Sunrise and the waterfall", "Morning yoga, then a forest walk to a waterfall.",
      stop("6:30 AM - 9:00 AM", "Sunrise yoga by the Ganga", "Tapovan", 30.1260, 78.3285, "A drop-in hatha class on a riverside deck as the sun comes over the hills, the way to start a day in Rishikesh.", "1.5 hours", 12, "wellness", "Drop-in classes cost ₹300-600; bring nothing but water."),
      stop("10:00 AM - 1:30 PM", "Neer Garh Waterfall", "Badrinath Road", 30.1415, 78.3332, "A short climb through forest to a series of turquoise pools and falls, cool and quiet compared with the town.", "3.5 hours", 6, "nature", "The path is slippery after rain; wear shoes, not sandals."),
      stop("3:00 PM - 6:00 PM", "Café afternoon and the Ram Jhula market", "Ram Jhula", 30.1225, 78.3150, "A last masala chai on a terrace and a wander through Ram Jhula's stalls for rudraksha beads, singing bowls and yoga wear.", "3 hours", 20, "shopping", "Rishikesh is vegetarian and alcohol-free by law; meat and alcohol aren't sold in town.")),
 ],
 [{"name": "Aloha on the Ganges", "area": "Tapovan", "type": "Hotel", "why": "River-view rooms, a pool and yoga classes on site.", "pricePerNight": 120},
  {"name": "Parmarth Niketan", "area": "Swarg Ashram", "type": "Ashram", "why": "Simple ashram rooms with daily yoga and the aarti on your doorstep.", "pricePerNight": 25},
  {"name": "Zostel Rishikesh", "area": "Tapovan", "type": "Hostel", "why": "Hillside hostel with a café and views, popular with solo travellers.", "pricePerNight": 20}],
 {"currency": INR, "language": "Hindi and Garhwali; English common in Tapovan", "plugs": "Type C/D, 230V", "tipping": "Not expected; tip rafting guides", "weather": "Oct-Nov and Feb-Apr are ideal (15-30°C). Rafting stops in Jul-Aug.", "gettingAround": "Shared autos run between Ram Jhula, Laxman Jhula and Tapovan; Dehradun airport is 35 km.", "phrase": "Hari Om: the common greeting"},
 ["Yoga clothes", "Quick-dry outfit and spare clothes for rafting", "Modest clothing for ashrams and ghats", "Sandals plus walking shoes"],
 prefs("solo", 1, "savvy", "hostel", "balanced", "transit"))

# ------------------------------------------------------------------ Varanasi
trip("varanasi-2-days", "Varanasi, India", "river", "in",
 "Two intense, beautiful days in one of the world's oldest living cities: a dawn boat along the ghats, the Kashi Vishwanath corridor, old-city food lanes, the Ganga Aarti at Dashashwamedh and a quiet morning at Sarnath.",
 ["Dawn boat ride along the ghats", "The Ganga Aarti at Dashashwamedh Ghat", "Kachori and malaiyo in the old lanes", "Sarnath, where the Buddha first taught"],
 [
  day(1, "2026-11-20", "River and fire", "A sunrise boat, the old city, and the evening aarti.",
      stop("5:45 AM - 8:30 AM", "Sunrise boat along the ghats", "Assi Ghat to Manikarnika", 25.2900, 83.0067, "Row from Assi Ghat downstream at dawn as bathers, priests and washermen start the day, past Manikarnika, the burning ghat that never goes out.", "2.5 hours", 10, "culture", "Agree the boat price and route at Assi the night before; photography at the cremation ghats is not allowed."),
      stop("10:00 AM - 1:30 PM", "Kashi Vishwanath and the old lanes", "Vishwanath Gali", 25.3109, 83.0107, "Walk the rebuilt corridor to the golden-spired Shiva temple, then lose yourself in the galis for kachori-sabzi and lassi at Blue Lassi.", "3.5 hours", 10, "culture", "Phones, bags and pens aren't allowed inside the temple; use the lockers near the gate."),
      stop("5:30 PM - 7:30 PM", "Ganga Aarti at Dashashwamedh Ghat", "Dashashwamedh", 25.3069, 83.0105, "Seven priests perform the fire ritual in unison with lamps, conch shells and chants. Watch from the steps or from a boat on the river.", "2 hours", 8, "culture", "A boat view (₹100-200 each) avoids the crush on the steps."),
      tip="Wear slip-on shoes; you'll take them off often."),
  day(2, "2026-11-21", "Sarnath and the silk weavers", "The Buddha's first sermon site, silk workshops, and a last walk on the ghats.",
      stop("8:30 AM - 12:00 PM", "Sarnath", "Sarnath", 25.3811, 83.0237, "Ten kilometres north, the deer park where the Buddha gave his first teaching, with the great Dhamek Stupa and a museum holding the Lion Capital, India's national emblem.", "3.5 hours", 10, "culture", "The museum is closed on Fridays."),
      stop("1:00 PM - 3:30 PM", "Banarasi silk weavers", "Madanpura", 25.3020, 83.0040, "Visit a family handloom workshop to see Banarasi brocade being woven thread by thread, and buy direct from the weavers.", "2.5 hours", 40, "shopping", "Ask to see the GI tag for genuine Banarasi silk."),
      stop("5:00 PM - 8:00 PM", "Assi Ghat evening", "Assi Ghat", 25.2867, 83.0068, "A gentler aarti and evening music at Assi Ghat, then dinner at a rooftop café overlooking the river.", "3 hours", 20, "culture", "Try malaiyo, saffron milk foam, if you're here Nov-Feb; it's only made in winter.")),
 ],
 [{"name": "BrijRama Palace", "area": "Darbhanga Ghat", "type": "Heritage hotel", "why": "An 18th-century palace right on the ghats, reached by boat.", "pricePerNight": 260},
  {"name": "Ganges View Hotel", "area": "Assi Ghat", "type": "Boutique hotel", "why": "A long-loved guesthouse with river-facing rooms and music evenings.", "pricePerNight": 70},
  {"name": "Zostel Varanasi", "area": "Bangali Tola", "type": "Hostel", "why": "Budget beds close to the ghats.", "pricePerNight": 15}],
 {"currency": INR, "language": "Hindi and Bhojpuri; English understood in tourist areas", "plugs": "Type C/D, 230V", "tipping": "Small tips for boatmen and guides", "weather": "Oct-Mar is best (8-28°C); winter mornings are foggy and atmospheric.", "gettingAround": "Walk the ghats; cycle-rickshaws and e-ricks for the city; a cab for Sarnath.", "phrase": "Har Har Mahadev: the city's greeting to Shiva"},
 ["Slip-on shoes", "Warm layer for dawn boats in winter", "Scarf", "Hand sanitiser"],
 prefs("couple", 2, "comfort", "hotel", "balanced", "rides"))

# ------------------------------------------------------------------ Ladakh
trip("ladakh-5-days", "Leh, Ladakh, India", "mountains", "in",
 "Five carefully paced days in Ladakh, with a full rest day for acclimatisation built in, monasteries above the Indus, the Nubra valley over Khardung La, and the blue sweep of Pangong Tso.",
 ["Pangong Tso's shifting blues", "Nubra's sand dunes and Diskit monastery", "Thiksey monastery's morning prayers", "Sunset at Shanti Stupa"],
 [
  day(1, "2027-06-10", "Arrive and acclimatise", "Rest is the plan: Leh sits at 3,500 m.",
      stop("10:00 AM - 1:00 PM", "Rest and hydrate at your hotel", "Leh", 34.1642, 77.5848, "Flying straight to 3,500 m means your body needs a full day to adjust. Sleep, drink water and skip exertion today; it's what makes the rest of the trip work.", "3 hours", 0, "wellness", "Avoid alcohol for the first 48 hours; ask your doctor about acetazolamide before you fly."),
      stop("3:30 PM - 5:30 PM", "Leh Main Bazaar stroll", "Main Bazaar", 34.1649, 77.5857, "A gentle walk through the bazaar for apricot jam, pashmina and Ladakhi butter tea, with the Leh Palace above.", "2 hours", 15, "shopping", "Walk slowly; the stairs feel steep at this altitude."),
      stop("6:00 PM - 7:30 PM", "Shanti Stupa sunset", "Changspa", 34.1734, 77.5747, "A white Japanese-built stupa above the town; drive to the top rather than climb the 500 steps on day one.", "1.5 hours", 5, "sight", "Take a cab up; save the steps for later in the week.")),
  day(2, "2027-06-11", "Monasteries of the Indus", "Thiksey, Shey and Hemis along the river.",
      stop("6:30 AM - 9:30 AM", "Thiksey Monastery morning prayers", "Thiksey", 34.0560, 77.6670, "A 12-storey monastery stacked up a hill, often compared to the Potala. Arrive for morning prayers with horns and chanting, then see the two-storey Maitreya Buddha.", "3 hours", 6, "culture", "Prayers start around 6 AM; arrive quietly and sit at the back."),
      stop("10:30 AM - 1:30 PM", "Hemis Monastery", "Hemis", 33.9126, 77.7039, "Ladakh's richest monastery, hidden in a side valley, with a fine museum of thangkas and ritual objects.", "3 hours", 6, "culture", "Lunch at the small café by the gate."),
      stop("3:00 PM - 5:30 PM", "Shey Palace", "Shey", 34.0710, 77.6366, "The old summer palace of Ladakh's kings, with a giant seated copper Buddha and views over the Indus wetlands.", "2.5 hours", 4, "sight", "Back in Leh, apply for your inner-line permits online today for Nubra and Pangong.")),
  day(3, "2027-06-12", "Over Khardung La to Nubra", "A high pass, then dunes and a valley of orchards.",
      stop("7:30 AM - 12:00 PM", "Khardung La pass", "Khardung La", 34.2787, 77.6047, "One of the highest motorable passes at about 5,359 m, with prayer flags and views across the Karakoram.", "4.5 hours", 60, "nature", "Stop for 15 minutes at most at the top; the altitude is serious."),
      stop("1:30 PM - 4:00 PM", "Diskit Monastery", "Diskit", 34.5434, 77.5566, "The oldest monastery in Nubra, with a 32-m Maitreya Buddha looking down the valley.", "2.5 hours", 4, "culture", "Overnight in a Hunder or Diskit camp; Nubra is warmer and lower than Leh."),
      stop("4:30 PM - 6:30 PM", "Hunder sand dunes", "Hunder", 34.5826, 77.4710, "Cold-desert dunes between the mountains, with double-humped Bactrian camels.", "2 hours", 20, "nature", "The camel ride is short; the dunes at golden hour are the real show.")),
  day(4, "2027-06-13", "To Pangong Tso", "Through the Shyok valley to the great lake.",
      stop("7:00 AM - 1:00 PM", "Shyok valley drive", "Shyok", 34.1784, 78.1584, "The direct route along the Shyok river from Nubra to Pangong, through some of Ladakh's wildest scenery.", "6 hours", 70, "nature", "Road conditions change; your driver will confirm the Shyok route that morning."),
      stop("2:00 PM - 5:00 PM", "Pangong Tso shore", "Spangmik", 33.9300, 78.5800, "The 134-km lake that runs into Tibet, changing from turquoise to deep blue as the light moves.", "3 hours", 0, "nature", "Wind picks up in the afternoon; bring your warmest layer."),
      stop("7:00 PM - 9:00 PM", "Stargazing at the lake", "Spangmik", 33.9320, 78.5850, "With no towns nearby, Pangong's night sky is one of the darkest in India.", "2 hours", 0, "nature", "Camps run on generators; electricity often stops around 11 PM.")),
  day(5, "2027-06-14", "Back over Chang La", "A sunrise at the lake and the drive back to Leh.",
      stop("6:00 AM - 8:00 AM", "Sunrise at Pangong", "Spangmik", 33.9300, 78.5800, "The lake at dawn is glassy and silent, the best light of the trip.", "2 hours", 0, "nature", "Pack the night before so you leave by 9."),
      stop("9:00 AM - 2:00 PM", "Chang La pass", "Chang La", 34.0475, 77.9294, "Back to Leh over Chang La at about 5,360 m, with a tea stop at the army café on top.", "5 hours", 70, "nature", "Keep water and snacks in the car; there's little on the way."),
      stop("5:00 PM - 8:00 PM", "Farewell dinner in Leh", "Changspa", 34.1700, 77.5780, "Celebrate with thukpa and skyu (Ladakhi pasta stew) at a garden restaurant in Changspa.", "3 hours", 30, "food", "Flights out of Leh leave early; most need you at the airport by 6 AM.")),
 ],
 [{"name": "The Grand Dragon Ladakh", "area": "Leh", "type": "Hotel", "why": "Heated rooms and oxygen on request, reassuring for the first nights at altitude.", "pricePerNight": 170},
  {"name": "Stok Palace Heritage", "area": "Stok", "type": "Heritage hotel", "why": "Stay in the royal family's palace, 15 km from Leh.", "pricePerNight": 200},
  {"name": "Pangong lakeside camps", "area": "Spangmik", "type": "Camp", "why": "Insulated tents right by the water for the lake night.", "pricePerNight": 80}],
 {"currency": INR, "language": "Ladakhi; Hindi and English widely understood", "plugs": "Type C/D, 230V", "tipping": "Tip your driver about ₹500 a day", "weather": "Jun-Sep is the season (Leh 10-25°C, nights near freezing at the lakes).", "gettingAround": "Hire a local Ladakh taxi with driver for Nubra and Pangong; outside taxis can't operate between sights. Inner-line permits are applied for online.", "phrase": "Julley: hello, thank you and goodbye"},
 ["Down jacket and thermals", "High-SPF sunscreen and lip balm", "Sunglasses (UV protection)", "Prescribed altitude medication", "Power bank and cash (ATMs are scarce outside Leh)"],
 prefs("couple", 2, "comfort", "hotel", "relaxed", "car"))

# ------------------------------------------------------------------ Goa budget
trip("goa-3-days-budget", "Goa, India", "coast", "in",
 "Goa on a backpacker budget: scooter-hopping between the quieter south beaches, Portuguese lanes in Panjim's Fontainhas, a flea market, and fish thalis that cost less than a coffee back home.",
 ["Scootering to Palolem and Butterfly Beach", "The colour-washed lanes of Fontainhas", "Anjuna flea market on Wednesday", "Fish thali for under ₹200"],
 [
  day(1, "2027-01-20", "Old Goa and Panjim", "Churches, Latin-quarter lanes and a riverside sunset.",
      stop("9:00 AM - 12:00 PM", "Basilica of Bom Jesus and Old Goa", "Old Goa", 15.5009, 73.9116, "UNESCO-listed churches from Goa's Portuguese capital, including the Basilica holding St Francis Xavier's relics and the vast Sé Cathedral.", "3 hours", 0, "culture", "Free entry; dress modestly."),
      stop("12:30 PM - 4:00 PM", "Fontainhas Latin Quarter", "Panjim", 15.4979, 73.8317, "Walk the yellow, blue and red houses of Panjim's old Portuguese quarter, then a fish-thali lunch at a local canteen.", "3.5 hours", 6, "sight", "Ritz Classic and Anandashram are local favourites for fish thali."),
      stop("5:30 PM - 7:30 PM", "Miramar Beach sunset", "Panjim", 15.4823, 73.8070, "The city's beach where the Mandovi meets the sea; locals come for evening walks and corn-on-the-cob carts.", "2 hours", 2, "nature", "Rent a scooter for the trip today (₹300-400 a day) and keep your licence handy.")),
  day(2, "2027-01-21", "The quiet south", "Cabo de Rama, Palolem and a boat to Butterfly Beach.",
      stop("8:30 AM - 11:30 AM", "Cabo de Rama Fort", "Canacona", 15.0896, 73.9207, "A crumbling clifftop fort with a little church and huge views over the Arabian Sea, rarely busy.", "3 hours", 0, "sight", "The road is quiet but winding; ride carefully."),
      stop("12:30 PM - 3:30 PM", "Palolem Beach", "Palolem", 15.0100, 74.0232, "A crescent of sand lined with palms and huts, calm enough for swimming in winter.", "3 hours", 10, "nature", "Lunch at a beach shack; prices drop the further you walk from the main entrance."),
      stop("4:00 PM - 6:30 PM", "Boat to Butterfly Beach", "Palolem", 15.0222, 73.9984, "Share a fishing boat to a hidden cove reachable only by sea, with dolphin sightings often on the way.", "2.5 hours", 10, "activity", "Shared boats are cheapest; negotiate at the north end of Palolem.")),
  day(3, "2027-01-22", "North Goa markets and forts", "Fort Aguada, the Anjuna flea market and Vagator's cliffs.",
      stop("9:00 AM - 11:30 AM", "Fort Aguada", "Sinquerim", 15.4920, 73.7735, "A 17th-century Portuguese fort and lighthouse guarding the Mandovi estuary.", "2.5 hours", 2, "sight", "Go early before the heat and the tour buses."),
      stop("12:30 PM - 4:00 PM", "Anjuna Flea Market", "Anjuna", 15.5735, 73.7410, "The Wednesday market by the beach: textiles, silver, spices and a mix of traders from across India.", "3.5 hours", 15, "shopping", "It runs on Wednesdays in season (Nov-Apr); on other days, Mapusa's Friday market is the local alternative."),
      stop("5:00 PM - 7:30 PM", "Chapora Fort and Vagator", "Vagator", 15.6066, 73.7368, "Climb to the 'Dil Chahta Hai' fort for sunset over Vagator's red cliffs and the Chapora river.", "2.5 hours", 0, "nature", "Wear grippy shoes; the laterite path is loose.")),
 ],
 [{"name": "Zostel Goa (Anjuna)", "area": "Anjuna", "type": "Hostel", "why": "Social hostel near the flea market, with dorms and private rooms.", "pricePerNight": 15},
  {"name": "Palolem beach huts", "area": "Palolem", "type": "Beach hut", "why": "Simple huts steps from the sand, the classic budget south-Goa stay.", "pricePerNight": 25},
  {"name": "Panjim Inn", "area": "Fontainhas", "type": "Heritage hotel", "why": "A 19th-century mansion in the Latin quarter, good value for a splurge night.", "pricePerNight": 70}],
 {"currency": INR, "language": "Konkani; English and Hindi widely spoken", "plugs": "Type C/D, 230V", "tipping": "Round up at shacks; 5-10% in restaurants", "weather": "Nov-Feb is peak and dry (21-32°C). Jun-Sep is monsoon; many shacks close.", "gettingAround": "Rent a scooter (₹300-400/day) and wear a helmet; GoaMiles app taxis for longer hops.", "phrase": "Dev borem korum: thank you (Konkani)"},
 ["Driving licence for scooter rental", "Swimwear and a sarong", "Reef-safe sunscreen", "Light rain jacket if travelling at season edges"],
 prefs("friends", 2, "savvy", "hostel", "balanced", "rides"))
