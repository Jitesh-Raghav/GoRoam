/** Popular places for instant suggestions when Google isn't configured (and for empty-field hints). */
export const POPULAR_PLACES: [string, string][] = [
  ["Tokyo", "Japan"], ["Kyoto", "Japan"], ["Osaka", "Japan"], ["Seoul", "South Korea"], ["Bangkok", "Thailand"], ["Phuket", "Thailand"],
  ["Chiang Mai", "Thailand"], ["Bali", "Indonesia"], ["Singapore", "Singapore"], ["Kuala Lumpur", "Malaysia"], ["Hanoi", "Vietnam"],
  ["Ho Chi Minh City", "Vietnam"], ["Hong Kong", "China"], ["Shanghai", "China"], ["Beijing", "China"], ["Taipei", "Taiwan"],
  ["Manila", "Philippines"], ["Kathmandu", "Nepal"], ["Thimphu", "Bhutan"], ["Colombo", "Sri Lanka"], ["Malé", "Maldives"],
  ["Dubai", "United Arab Emirates"], ["Abu Dhabi", "United Arab Emirates"], ["Doha", "Qatar"], ["Istanbul", "Turkey"],
  ["Cappadocia", "Turkey"], ["Mumbai", "India"], ["New Delhi", "India"], ["Gurgaon", "India"], ["Bengaluru", "India"],
  ["Chennai", "India"], ["Hyderabad", "India"], ["Kolkata", "India"], ["Pune", "India"], ["Ahmedabad", "India"], ["Jaipur", "India"],
  ["Udaipur", "India"], ["Jodhpur", "India"], ["Agra", "India"], ["Varanasi", "India"], ["Rishikesh", "India"], ["Manali", "India"],
  ["Shimla", "India"], ["Leh", "India"], ["Srinagar", "India"], ["Goa", "India"], ["Kochi", "India"], ["Munnar", "India"],
  ["Pondicherry", "India"], ["Darjeeling", "India"], ["Gangtok", "India"], ["Andaman Islands", "India"], ["Coorg", "India"],
  ["Paris", "France"], ["Nice", "France"], ["London", "United Kingdom"], ["Edinburgh", "United Kingdom"], ["Dublin", "Ireland"],
  ["Amsterdam", "Netherlands"], ["Brussels", "Belgium"], ["Berlin", "Germany"], ["Munich", "Germany"], ["Prague", "Czechia"],
  ["Vienna", "Austria"], ["Budapest", "Hungary"], ["Zurich", "Switzerland"], ["Interlaken", "Switzerland"], ["Rome", "Italy"],
  ["Florence", "Italy"], ["Venice", "Italy"], ["Milan", "Italy"], ["Amalfi Coast", "Italy"], ["Barcelona", "Spain"], ["Madrid", "Spain"],
  ["Seville", "Spain"], ["Lisbon", "Portugal"], ["Porto", "Portugal"], ["Athens", "Greece"], ["Santorini", "Greece"], ["Mykonos", "Greece"],
  ["Dubrovnik", "Croatia"], ["Copenhagen", "Denmark"], ["Stockholm", "Sweden"], ["Oslo", "Norway"], ["Reykjavík", "Iceland"],
  ["Helsinki", "Finland"], ["New York", "United States"], ["Los Angeles", "United States"], ["San Francisco", "United States"],
  ["Las Vegas", "United States"], ["Miami", "United States"], ["Chicago", "United States"], ["Honolulu", "United States"],
  ["Toronto", "Canada"], ["Vancouver", "Canada"], ["Banff", "Canada"], ["Mexico City", "Mexico"], ["Cancún", "Mexico"],
  ["Havana", "Cuba"], ["Rio de Janeiro", "Brazil"], ["Buenos Aires", "Argentina"], ["Cusco", "Peru"], ["Santiago", "Chile"],
  ["Cartagena", "Colombia"], ["Cape Town", "South Africa"], ["Marrakech", "Morocco"], ["Cairo", "Egypt"], ["Zanzibar", "Tanzania"],
  ["Nairobi", "Kenya"], ["Mauritius", "Mauritius"], ["Seychelles", "Seychelles"], ["Sydney", "Australia"], ["Melbourne", "Australia"],
  ["Queenstown", "New Zealand"], ["Auckland", "New Zealand"], ["Fiji", "Fiji"],
];

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Local matches: names that start with the query first, then ones that contain it. */
export function matchPlaces(q: string, limit = 6) {
  const n = fold(q.trim());
  if (!n) return [];
  const scored = POPULAR_PLACES.map(([main, secondary]) => {
    const m = fold(main);
    const full = fold(`${main}, ${secondary}`);
    const rank = m.startsWith(n) ? 0 : full.includes(n) ? 1 : -1;
    return { main, secondary, rank };
  }).filter((p) => p.rank >= 0);
  return scored.sort((a, b) => a.rank - b.rank).slice(0, limit).map(({ main, secondary }) => ({ main, secondary }));
}
