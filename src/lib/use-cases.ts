/**
 * "Plan a trip for…" landing pages: one per kind of trip people search for
 * ("couple trip planner", "family vacation planner", "road trip planner").
 * Each has its own title, copy, a prompt to start from, sample itineraries
 * and FAQs, so search engines see distinct, useful pages worth linking to.
 */
export interface UseCase {
  slug: string;
  /** Short label for cards, menus and the footer: "Couples". */
  label: string;
  /** The phrase people search, used as the H1: "Couple trip planner". */
  h1: string;
  /** <title>, under ~60 characters with " · GoRoam" appended. */
  title: string;
  /** Meta description, ~150 characters. */
  description: string;
  /** One line under the H1. */
  lede: string;
  /** What GoRoam does for this kind of trip, a few short paragraphs. */
  body: string[];
  /** What the composer starts with. */
  prompt: string;
  /** Three things the planner does especially for this trip. */
  perks: { title: string; text: string }[];
  /** Sample itineraries (package slugs), best match first. */
  samples: string[];
  faqs: { q: string; a: string }[];
}

export const USE_CASES: UseCase[] = [
  {
    slug: "couples",
    label: "Couples",
    h1: "Couple trip planner",
    title: "Couple Trip Planner: AI Romantic & Honeymoon Itineraries",
    description:
      "Plan a trip for two in seconds. GoRoam's AI couple trip planner builds romantic, day-by-day itineraries for honeymoons, anniversaries and getaways, with an honest budget.",
    lede: "Honeymoons, anniversaries and long weekends for two, planned day by day in under a minute.",
    body: [
      "Tell GoRoam where you'd like to go and what the two of you love, and it plans the whole trip: slow mornings, the sights worth it, a sunset spot for each evening and dinners worth dressing up for, with the times and the cost of each.",
      "Plans for couples keep an easy pace, leave room to wander and group the day by neighbourhood so you aren't crossing the city twice. Stays lean boutique and romantic, and the budget is for two people, so there are no surprises.",
      "Share the plan with your partner, let them vote on stops, swap anything you don't love, and keep the bookings, the wallet and the day's plan in one place on the trip.",
    ],
    prompt: "A 5-day honeymoon in Bali with sunsets, a spa day, great seafood and a relaxed pace.",
    perks: [
      { title: "Paced for two", text: "Late starts, one big sight a day and time to wander. No 7 AM tour buses." },
      { title: "Evenings that matter", text: "A sunset spot and a dinner worth booking on every day of the trip." },
      { title: "Budget for two", text: "Every stop, meal and stay costed for the pair of you, in your currency." },
    ],
    samples: ["udaipur-3-days-couples", "hampi-3-days-couples", "bali-4-days", "paris-7-days", "switzerland-6-days"],
    faqs: [
      { q: "Can GoRoam plan a honeymoon itinerary?", a: "Yes. Mention it's a honeymoon or anniversary and GoRoam paces the trip for two, picks romantic stays and adds a sunset spot and a special dinner to each day." },
      { q: "Is the budget for one person or two?", a: "For the two of you. Tell GoRoam your total budget and it plans stays, food, tickets and transport to fit, showing the cost of each stop." },
      { q: "Can my partner see and change the plan?", a: "Share a link and they can view the plan and vote on stops. You can swap any stop, edit days freely, and both get the day's plan on WhatsApp." },
      { q: "Is it free?", a: "Your first full itinerary is free, with no card needed. Credit packs after that start at a few dollars a trip." },
    ],
  },
  {
    slug: "family",
    label: "Families",
    h1: "Family vacation planner",
    title: "Family Vacation Planner: AI Trip Itineraries with Kids",
    description:
      "Plan a family vacation with kids in seconds. GoRoam's AI family trip planner builds day-by-day itineraries with kid-friendly stops, rest breaks, family stays and a clear budget.",
    lede: "Day-by-day family trips with kid-friendly stops, breaks built in and a budget for everyone.",
    body: [
      "Tell GoRoam who's coming (two adults and two kids, say) and it plans the trip around them: fewer stops a day, places the kids will enjoy, food everyone can eat and time to rest in the afternoon.",
      "Family plans keep travel between stops short, favour family rooms and apartments, and flag what's worth booking ahead so you're not queuing with tired children. Dietary needs like vegetarian or no pork are respected at every meal.",
      "Everything lives in one place on the trip: the day's plan, the weather, a packing list for the kids, a shared wallet and the bookings, and it works offline when you land.",
    ],
    prompt: "10 days in Rajasthan with two kids: forts, palaces, a camel ride and vegetarian food.",
    perks: [
      { title: "A gentler pace", text: "Fewer stops a day, short hops between them and a rest in the afternoon." },
      { title: "Kid-friendly picks", text: "Places children enjoy, family stays and food everyone will eat." },
      { title: "One shared plan", text: "Packing lists, bookings, a wallet and the day's plan for the whole family." },
    ],
    samples: ["kerala-5-days", "goa-3-days", "switzerland-6-days", "dubai-4-days", "jaipur-2-days"],
    faqs: [
      { q: "Can GoRoam plan a trip with kids?", a: "Yes. Tell it how many adults and children are coming and it plans a family pace with kid-friendly places, rest time and family-sized stays." },
      { q: "Does it handle dietary needs?", a: "Yes. Vegetarian, vegan, halal, Jain, no pork and more are respected for every meal suggestion in the plan." },
      { q: "How is the family budget worked out?", a: "The budget covers everyone travelling: stays, food, tickets and transport, with the cost of each stop shown so you can trim as you go." },
      { q: "Can we change the plan once it's made?", a: "Edit any day freely: drag stops between days, add your own places, swap a stop with AI or replan a rainy day in one tap." },
    ],
  },
  {
    slug: "friends",
    label: "Friends",
    h1: "Group trip planner for friends",
    title: "Group Trip Planner for Friends: Ideas, Budget & Cost Splitter",
    description:
      "Plan a trip with friends in seconds: a day-by-day itinerary everyone votes on, a group budget calculator, a free cost splitter and the plan on WhatsApp each morning.",
    lede: "One plan for the whole group: vote on stops, split the costs and get each day on WhatsApp.",
    body: [
      "Group chats are where trips go to die. Describe the trip once and GoRoam plans every day: the sights, the food, the nights out and the hostel or villa that fits the group's budget.",
      "Share one link and everyone votes on the stops they like. Swap the ones nobody wants, move things between days, and log who paid for what in the trip wallet, which works out who owes whom at the end.",
      "Each morning of the trip, the day's plan with stops, times, weather and a map link lands in everyone's WhatsApp, so nobody asks 'what are we doing today?' again.",
    ],
    prompt: "A 4-day trip to Goa with five friends: beaches, nightlife, water sports and around ₹15,000 each.",
    perks: [
      { title: "Everyone votes", text: "Share a link and friends upvote the stops they want. Swap the rest." },
      { title: "Split costs", text: "A trip wallet that tracks who paid and settles up at the end." },
      { title: "Plans on WhatsApp", text: "The day's plan in the group every morning, with a map link." },
    ],
    samples: ["manali-4-days-friends", "goa-3-days-budget", "thailand-3-days", "rishikesh-3-days", "ladakh-5-days"],
    faqs: [
      { q: "Can my friends vote on the plan?", a: "Yes. Share the trip link and anyone can react to stops. You see the votes on each day and can swap what the group doesn't like." },
      { q: "How do we split costs?", a: "Each trip has a wallet. Log who paid for what and GoRoam works out the fairest way to settle up." },
      { q: "Does the plan go to our WhatsApp group?", a: "On Explorer and Adventurer, the day's plan is sent to everyone's WhatsApp each morning. Anyone can send a day to WhatsApp by hand for free." },
      { q: "Can it plan for a big group on a budget?", a: "Yes. Set the group size and a per-trip budget and GoRoam picks hostels, street food and free sights to fit." },
      { q: "How much does a trip with friends cost in India?", a: "A budget trip runs about ₹1,500–2,500 per person a day with hostels and street food, and ₹4,000–6,000 a day with a shared villa and restaurant meals, not counting travel. Use the budget calculator above to see what your group's money buys." },
      { q: "What are the best places in India for a trip with friends?", a: "Goa for beaches and nightlife, Manali and Kasol for the mountains, Rishikesh for rafting and camping, Gokarna for quieter beaches, and Jaisalmer for a desert camp night. All are covered in GoRoam's ready-made trips." },
      { q: "How do you split trip costs fairly between friends?", a: "Have one person pay for each shared thing, note who paid what, then work out each person's fair share and settle with the fewest transfers. The free cost splitter on this page does exactly that, and every GoRoam trip has a wallet that does it as you go." },
      { q: "How do we pick dates that work for everyone?", a: "Agree on a month first, share two or three date options in the group and pick the one with the most yes votes. Long weekends sell out early, so book stays as soon as dates are fixed." },
      { q: "Is a villa cheaper than hotel rooms for a group?", a: "For five or more people it often is: a villa splits into a lower cost per head than separate rooms, and you get a kitchen, a pool and space to hang out together." },
      { q: "Can GoRoam plan a bachelor or bachelorette trip?", a: "Yes. Mention it in the prompt and GoRoam leans into nightlife, group activities, a big dinner and a villa or party-friendly stay, all within your budget." },
    ],
  },
  {
    slug: "solo",
    label: "Solo",
    h1: "Solo travel planner",
    title: "Solo Travel Planner: Safe, Social AI Trip Itineraries",
    description:
      "Plan a solo trip in seconds. GoRoam's AI solo travel planner builds day-by-day itineraries with safe areas to stay, social hostels, local tips and an honest budget.",
    lede: "Your own pace, safe areas to stay and places to meet people, planned day by day.",
    body: [
      "Travelling alone means every choice is yours, and so is all the planning. GoRoam takes that part: tell it where you're going and what you're into, and get a day-by-day plan with times, costs and a map.",
      "Solo plans pick stays in well-reviewed, central areas, suggest social hostels or boutique rooms to fit your budget, and add walking tours and food markets where it's easy to meet people.",
      "The trip comes with a local guide (phrases with audio, etiquette, scams to avoid and emergency numbers) and works offline, so you're covered even without data.",
    ],
    prompt: "A 7-day solo trip to Japan in spring: temples, ramen, a day hike and a social hostel.",
    perks: [
      { title: "Safe places to stay", text: "Central, well-reviewed areas, with hostels or boutique rooms to fit the budget." },
      { title: "Easy to meet people", text: "Walking tours, food markets and social spots worked into the days." },
      { title: "A guide in your pocket", text: "Phrases, etiquette, scams to avoid and emergency numbers, offline." },
    ],
    samples: ["rishikesh-3-days", "varanasi-2-days", "japan-5-days", "thailand-3-days", "ladakh-5-days"],
    faqs: [
      { q: "Is GoRoam good for solo travel?", a: "Yes. Choose 'Solo' and GoRoam plans for one, with safe central stays, social spots and a guide covering scams, etiquette and emergency numbers." },
      { q: "Does it work without data abroad?", a: "Once opened, your trip is saved for offline use, with the plan, the map links and the guide." },
      { q: "Can it plan on a backpacker budget?", a: "Set a budget and a 'savvy' spend level and GoRoam picks hostels, street food, free sights and public transport." },
      { q: "Can I change plans on the road?", a: "Swap any stop, replan a day for rain in one tap, or ask the AI concierge about your trip." },
    ],
  },
  {
    slug: "road-trip",
    label: "Road trips",
    h1: "AI road trip planner",
    title: "AI Road Trip Planner: Routes, Stops & Drive Times",
    description:
      "Plan a road trip in seconds. GoRoam's AI road trip planner maps your route city by city with stops along the way, drive times, travel days and where to stay each night.",
    lede: "City-by-city routes with stops along the way, drive times and where to sleep each night.",
    body: [
      "Name where you start and where you're heading, add the stops in between, and GoRoam plans the route day by day: what to see in each place, how long to stay and what the drive between them looks like.",
      "Travel days come with a transfer card covering the road option locals use, roughly how long it takes, what it costs and when to leave, and the rest of the day is kept light. Stays are suggested for each city on the route.",
      "Optimise any day so the stops run in the shortest order, open the whole route in Google Maps, and get each morning's plan on WhatsApp.",
    ],
    prompt: "A 7-day road trip from Delhi to Jaipur and Udaipur, with forts, lakes and good food on the way.",
    perks: [
      { title: "Stops along the route", text: "Add cities between start and finish; each gets its days and its sights." },
      { title: "Real travel days", text: "Drive times, costs and when to leave, with a lighter plan that day." },
      { title: "Shortest order", text: "Optimise any day by distance and open the route in Google Maps." },
    ],
    samples: ["ladakh-5-days", "switzerland-6-days", "kerala-5-days", "manali-4-days-friends", "udaipur-3-days-couples"],
    faqs: [
      { q: "Can GoRoam plan a multi-stop road trip?", a: "Yes. Add stops between your start and your destination, choose the days in each, and GoRoam plans each city plus the travel days in between." },
      { q: "Does it show drive times?", a: "Travel days show the realistic option (drive, train or flight) with an approximate duration, cost and departure time." },
      { q: "Can I open the route in Google Maps?", a: "Every day has a map and a link that opens all its stops in Google Maps, in order." },
      { q: "Does it suggest where to stay?", a: "Yes, stays are suggested for each city on the route, matched to your budget and stay style." },
    ],
  },
  {
    slug: "weekend-getaway",
    label: "Weekend getaways",
    h1: "Weekend getaway planner",
    title: "Weekend Getaway Planner: Last-Minute AI Trip Ideas",
    description:
      "Plan a weekend getaway or last-minute escape in seconds. GoRoam suggests where to go from your city, then builds a 2–3 day itinerary with stays and an honest budget.",
    lede: "Last-minute escapes from your city: where to go, and a two or three day plan to go with it.",
    body: [
      "Not sure where to go this weekend? Tell GoRoam where you're starting from, your budget and what you're in the mood for, and 'Inspire me' suggests places that fit the season and the time you have.",
      "Pick one and get a tight two or three day plan that makes the most of a short trip: no wasted mornings, the best of the place, and a stay that's easy to book at short notice.",
      "Plans fit long weekends and public holidays too, with dates suggested around the holidays in your country.",
    ],
    prompt: "A weekend getaway from Mumbai this Friday: hills, waterfalls and good food, under ₹10,000.",
    perks: [
      { title: "Inspire me", text: "Places that suit the season, your budget and the days you have." },
      { title: "Made for short trips", text: "Two or three tight days with the best of the place, nothing wasted." },
      { title: "Long-weekend aware", text: "Dates suggested around public holidays in your country." },
    ],
    samples: ["goa-3-days", "rishikesh-3-days", "jaipur-2-days", "varanasi-2-days", "thailand-3-days"],
    faqs: [
      { q: "Can GoRoam suggest where to go for a weekend?", a: "Yes. Use 'Inspire me' in the planner with your starting city, budget and interests, and it suggests destinations that fit the season." },
      { q: "How fast is it?", a: "A full two or three day itinerary takes about a minute, ready to share and book." },
      { q: "Does it plan around public holidays?", a: "The planner highlights long weekends in your country so you can make the most of your leave." },
      { q: "Is my first trip free?", a: "Yes, your first itinerary is free with no card needed." },
    ],
  },
  {
    slug: "multi-city",
    label: "Multi-city trips",
    h1: "Multi-city trip planner",
    title: "Multi-City Trip Planner: AI Itineraries Across Cities",
    description:
      "Plan a multi-city trip like Delhi → Jaipur → Udaipur or Tokyo → Kyoto in seconds. GoRoam builds each city's days, the travel days between them and stays in every stop.",
    lede: "Delhi → Jaipur → Udaipur, Tokyo → Kyoto, Paris → Rome: every city and every travel day, planned.",
    body: [
      "Most AI planners treat a trip as one place. Real trips aren't like that. Add your stops on the way to the final destination, set the days in each, and GoRoam plans every city and the journeys between them.",
      "The first day in each new city is a travel day with the train, flight or road option locals actually use, with times and costs and a lighter plan around it. Weather, photos and stays are per city.",
      "Type it in one line too: 'Delhi, Jaipur and Udaipur in 8 days' is understood and turned into a route you can tweak.",
    ],
    prompt: "8 days across Delhi, Jaipur and Udaipur: forts, bazaars, a lake sunset and good food.",
    perks: [
      { title: "Any number of stops", text: "Add cities on the way, reorder them and set the days in each." },
      { title: "Travel days done right", text: "Trains, flights or roads with times and costs between cities." },
      { title: "Per-city everything", text: "Weather, stays and photos for each city on the route." },
    ],
    samples: ["japan-5-days", "jaipur-2-days", "udaipur-3-days-couples", "switzerland-6-days", "kerala-5-days"],
    faqs: [
      { q: "Can GoRoam plan a trip across several cities?", a: "Yes. Add stops before your final destination and choose the days in each. GoRoam plans every city plus the travel days between them." },
      { q: "How are travel days handled?", a: "Each move to a new city shows the realistic option (train, flight or road) with departure time, duration and cost, and keeps that day light." },
      { q: "Can I just type the route?", a: "Yes. Type something like 'Tokyo then Kyoto for 6 days' on the home page and the planner fills in the route for you." },
      { q: "Are stays suggested for each city?", a: "Yes, stays are grouped by city and matched to your budget and style." },
    ],
  },
  {
    slug: "budget",
    label: "Budget trips",
    h1: "Budget trip planner",
    title: "Budget Trip Planner: AI Itineraries That Fit Your Budget",
    description:
      "Plan a trip on a budget in seconds. GoRoam's AI budget travel planner builds day-by-day itineraries with the honest cost of every stop, cheap eats, free sights and good-value stays.",
    lede: "Set your budget in your own currency and get a plan that actually fits it, stop by stop.",
    body: [
      "Most itineraries quietly assume you'll spend more than you planned. GoRoam starts from your budget, in rupees, dollars, euros or your own currency, and plans stays, food, tickets and transport to fit inside it.",
      "Every stop shows what it costs, so you can see where the money goes and trim as you like. Savvy plans favour free sights, street food, hostels and public transport, without skipping what the place is known for.",
      "On the trip, the wallet tracks what you've actually spent against the plan, with a live currency converter for local prices.",
    ],
    prompt: "5 days in Thailand on a budget: islands, street food and temples, under $600 including stays.",
    perks: [
      { title: "Your currency", text: "Set the budget in rupees, dollars, euros and more." },
      { title: "The cost of every stop", text: "See where the money goes and trim as you like." },
      { title: "Spend vs plan", text: "A trip wallet and a live converter keep you on budget." },
    ],
    samples: ["goa-3-days-budget", "rishikesh-3-days", "thailand-3-days", "varanasi-2-days", "manali-4-days-friends"],
    faqs: [
      { q: "Can GoRoam plan within a fixed budget?", a: "Yes. Set a total budget in your currency and GoRoam plans stays, food, tickets and transport to fit it, with the cost of each stop shown." },
      { q: "Which currencies does it support?", a: "Budgets can be set in INR, USD, EUR, GBP and many more, with prices shown in your local currency." },
      { q: "How accurate are the costs?", a: "Costs are realistic estimates for the season and spend level you pick. Check live prices when you book." },
      { q: "Is GoRoam itself free?", a: "Your first itinerary is free. After that, packs cost a few dollars per trip, with a 30-day money-back guarantee." },
    ],
  },
];

export const tripTypeBySlug = (slug: string) => USE_CASES.find((u) => u.slug === slug);
