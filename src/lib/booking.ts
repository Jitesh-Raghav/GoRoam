/**
 * Booking deep links. Every partner opens its own search with the trip's route,
 * dates and party size already filled in, so booking is a couple of taps.
 *
 * Affiliate IDs are optional; set them in the environment to earn commission:
 *   NEXT_PUBLIC_BOOKING_AID          Booking.com affiliate id (aid)
 *   NEXT_PUBLIC_GYG_PARTNER_ID       GetYourGuide partner id
 *   NEXT_PUBLIC_SKYSCANNER_ASSOCIATE Skyscanner associate id
 */

export type BookingKind = "flights" | "stays" | "experiences" | "transport";

export interface BookingQuery {
  origin?: string;
  destination: string;
  /** YYYY-MM-DD */
  checkIn: string;
  /** YYYY-MM-DD */
  checkOut: string;
  adults: number;
  children?: number;
  stay?: string;
}

export interface Partner {
  id: string;
  name: string;
  kind: BookingKind;
  href: string;
  blurb: string;
}

const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID;
const GYG_PARTNER = process.env.NEXT_PUBLIC_GYG_PARTNER_ID;
const SKY_ASSOCIATE = process.env.NEXT_PUBLIC_SKYSCANNER_ASSOCIATE;

const enc = encodeURIComponent;
const qs = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${enc(String(v))}`)
    .join("&");

/** The city part of "Kyoto, Japan". */
export const cityOf = (place: string) => place.split(",")[0].trim();

/* ------------------------------ Airport codes ------------------------------ */

// City (or country) → main airport or metro code, for partners that need one.
const IATA: Record<string, string> = {
  // India
  mumbai: "BOM", bombay: "BOM", delhi: "DEL", "new delhi": "DEL", bangalore: "BLR", bengaluru: "BLR", chennai: "MAA",
  kolkata: "CCU", hyderabad: "HYD", pune: "PNQ", ahmedabad: "AMD", goa: "GOI", jaipur: "JAI", kochi: "COK",
  kerala: "COK", lucknow: "LKO", amritsar: "ATQ", udaipur: "UDR", varanasi: "VNS", leh: "IXL", ladakh: "IXL",
  srinagar: "SXR", kashmir: "SXR", agra: "AGR", chandigarh: "IXC", india: "DEL",
  // Asia & Middle East
  tokyo: "TYO", kyoto: "KIX", osaka: "KIX", japan: "TYO", seoul: "SEL", "south korea": "SEL", beijing: "BJS",
  shanghai: "SHA", "hong kong": "HKG", taipei: "TPE", singapore: "SIN", bangkok: "BKK", phuket: "HKT",
  "chiang mai": "CNX", thailand: "BKK", bali: "DPS", jakarta: "JKT", "kuala lumpur": "KUL", malaysia: "KUL",
  hanoi: "HAN", "ho chi minh": "SGN", vietnam: "HAN", "siem reap": "SAI", cambodia: "PNH", manila: "MNL",
  kathmandu: "KTM", nepal: "KTM", colombo: "CMB", "sri lanka": "CMB", maldives: "MLE", male: "MLE",
  dubai: "DXB", "abu dhabi": "AUH", uae: "DXB", doha: "DOH", qatar: "DOH", istanbul: "IST", turkey: "IST",
  // Europe
  london: "LON", "united kingdom": "LON", uk: "LON", edinburgh: "EDI", dublin: "DUB", ireland: "DUB",
  paris: "PAR", france: "PAR", nice: "NCE", lyon: "LYS", amsterdam: "AMS", netherlands: "AMS", brussels: "BRU",
  berlin: "BER", munich: "MUC", frankfurt: "FRA", hamburg: "HAM", cologne: "CGN", germany: "BER",
  zurich: "ZRH", geneva: "GVA", switzerland: "ZRH", vienna: "VIE", austria: "VIE", prague: "PRG",
  budapest: "BUD", warsaw: "WAW", krakow: "KRK", copenhagen: "CPH", stockholm: "STO", oslo: "OSL",
  helsinki: "HEL", reykjavik: "REK", iceland: "REK", rome: "ROM", milan: "MIL", venice: "VCE", florence: "FLR",
  naples: "NAP", italy: "ROM", madrid: "MAD", barcelona: "BCN", seville: "SVQ", spain: "MAD", lisbon: "LIS",
  porto: "OPO", portugal: "LIS", athens: "ATH", santorini: "JTR", mykonos: "JMK", greece: "ATH",
  // Africa
  cairo: "CAI", egypt: "CAI", marrakech: "RAK", morocco: "RAK", "cape town": "CPT", johannesburg: "JNB",
  nairobi: "NBO", kenya: "NBO", zanzibar: "ZNZ", mauritius: "MRU", seychelles: "SEZ",
  // Americas & Oceania
  "new york": "NYC", nyc: "NYC", "los angeles": "LAX", "san francisco": "SFO", chicago: "CHI", miami: "MIA",
  "las vegas": "LAS", boston: "BOS", seattle: "SEA", washington: "WAS", hawaii: "HNL", honolulu: "HNL",
  usa: "NYC", "united states": "NYC", toronto: "YTO", vancouver: "YVR", montreal: "YMQ", canada: "YTO",
  "mexico city": "MEX", cancun: "CUN", mexico: "MEX", lima: "LIM", cusco: "CUZ", peru: "LIM", rio: "RIO",
  "rio de janeiro": "RIO", "sao paulo": "SAO", brazil: "RIO", "buenos aires": "BUE", argentina: "BUE",
  santiago: "SCL", bogota: "BOG", sydney: "SYD", melbourne: "MEL", australia: "SYD", auckland: "AKL",
  queenstown: "ZQN", "new zealand": "AKL",
};

/** Best-effort airport code for free text like "Kyoto, Japan"; null when unsure. */
export function airportCode(place?: string) {
  if (!place) return null;
  const clean = place.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/^[a-z]{3}$/.test(clean.trim())) return clean.trim().toUpperCase();
  const parts = clean.split(",").map((p) => p.trim());
  for (const part of parts) if (IATA[part]) return IATA[part];
  return null;
}

/* ------------------------------- Link builders ------------------------------ */

const yymmdd = (iso: string) => iso.slice(2).replace(/-/g, "");

export function flightPartners(q: BookingQuery): Partner[] {
  const from = q.origin?.trim();
  const people = q.adults + (q.children ?? 0);
  const phrase = `Flights ${from ? `from ${from} ` : ""}to ${q.destination} on ${q.checkIn} through ${q.checkOut}`;
  const list: Partner[] = [
    {
      id: "google-flights",
      name: "Google Flights",
      kind: "flights",
      href: `https://www.google.com/travel/flights?${qs({ q: phrase, curr: "USD" })}`,
      blurb: `Price graph & date grid · ${people} ${people === 1 ? "traveller" : "travellers"}`,
    },
  ];
  const a = airportCode(from);
  const b = airportCode(q.destination);
  if (a && b && a !== b) {
    list.push(
      {
        id: "skyscanner",
        name: "Skyscanner",
        kind: "flights",
        href: `https://www.skyscanner.net/transport/flights/${a.toLowerCase()}/${b.toLowerCase()}/${yymmdd(q.checkIn)}/${yymmdd(q.checkOut)}/?${qs({
          adultsv2: q.adults,
          childrenv2: q.children ? Array(q.children).fill(8).join("|") : undefined,
          associateid: SKY_ASSOCIATE,
        })}`,
        blurb: "Compare every airline",
      },
      {
        id: "kayak",
        name: "Kayak",
        kind: "flights",
        href: `https://www.kayak.com/flights/${a}-${b}/${q.checkIn}/${q.checkOut}/${q.adults}adults${q.children ? `/children-${Array(q.children).fill(8).join("-")}` : ""}`,
        blurb: "Price alerts & flexible dates",
      }
    );
  } else {
    list.push({
      id: "skyscanner",
      name: "Skyscanner",
      kind: "flights",
      href: `https://www.skyscanner.net/?${qs({ associateid: SKY_ASSOCIATE })}`,
      blurb: "Compare every airline",
    });
  }
  return list;
}

export function stayPartners(q: BookingQuery, search = q.destination): Partner[] {
  const booking: Partner = {
    id: "booking",
    name: "Booking.com",
    kind: "stays",
    href: `https://www.booking.com/searchresults.html?${qs({
      ss: search,
      checkin: q.checkIn,
      checkout: q.checkOut,
      group_adults: q.adults,
      group_children: q.children ?? 0,
      no_rooms: 1,
      aid: BOOKING_AID,
    })}`,
    blurb: "Free cancellation on most stays",
  };
  const airbnb: Partner = {
    id: "airbnb",
    name: "Airbnb",
    kind: "stays",
    href: `https://www.airbnb.com/s/${enc(search)}/homes?${qs({ checkin: q.checkIn, checkout: q.checkOut, adults: q.adults, children: q.children || undefined })}`,
    blurb: "Homes & apartments",
  };
  const expedia: Partner = {
    id: "expedia",
    name: "Expedia",
    kind: "stays",
    href: `https://www.expedia.com/Hotel-Search?${qs({ destination: search, startDate: q.checkIn, endDate: q.checkOut, adults: q.adults })}`,
    blurb: "Bundle with flights",
  };
  const hostelworld: Partner = {
    id: "hostelworld",
    name: "Hostelworld",
    kind: "stays",
    href: `https://www.hostelworld.com/search?${qs({ search_keywords: search, from: q.checkIn, to: q.checkOut, guests: q.adults + (q.children ?? 0) })}`,
    blurb: "Hostels & guesthouses",
  };
  if (q.stay === "apartment") return [airbnb, booking, expedia];
  if (q.stay === "hostel") return [hostelworld, booking, airbnb];
  return [booking, expedia, airbnb];
}

export function experiencePartners(q: BookingQuery, search = cityOf(q.destination)): Partner[] {
  return [
    {
      id: "getyourguide",
      name: "GetYourGuide",
      kind: "experiences",
      href: `https://www.getyourguide.com/s/?${qs({ q: search, date_from: q.checkIn, date_to: q.checkOut, partner_id: GYG_PARTNER })}`,
      blurb: "Skip-the-line tickets & tours",
    },
    {
      id: "viator",
      name: "Viator",
      kind: "experiences",
      href: `https://www.viator.com/searchResults/all?${qs({ text: search })}`,
      blurb: "Day trips & local guides",
    },
    {
      id: "klook",
      name: "Klook",
      kind: "experiences",
      href: `https://www.klook.com/en-US/search/result/?${qs({ query: search })}`,
      blurb: "Passes, rail & attractions",
    },
  ];
}

export function transportPartners(q: BookingQuery): Partner[] {
  const from = q.origin?.trim();
  const list: Partner[] = [];
  if (from) {
    list.push({
      id: "rome2rio",
      name: "Rome2Rio",
      kind: "transport",
      href: `https://www.rome2rio.com/map/${enc(cityOf(from))}/${enc(cityOf(q.destination))}`,
      blurb: "Trains, buses & ferries compared",
    });
  }
  list.push({
    id: "kayak-cars",
    name: "Kayak Cars",
    kind: "transport",
    href: `https://www.kayak.com/cars/${enc(cityOf(q.destination))}/${q.checkIn}/${q.checkOut}`,
    blurb: "Pick up on arrival",
  });
  return list;
}

/** A tickets & tours search for one specific place. */
export const ticketsFor = (place: string, destination: string) =>
  `https://www.getyourguide.com/s/?${qs({ q: `${place} ${cityOf(destination)}`, partner_id: GYG_PARTNER })}`;

/** Google Maps directions through every stop of a day, in order. */
export function dayRouteUrl(stops: string[], destination: string, mode: "walking" | "transit" | "driving" = "transit") {
  const full = stops.filter(Boolean).map((s) => `${s}, ${cityOf(destination)}`);
  if (full.length === 0) return null;
  const origin = full[0];
  const dest = full[full.length - 1];
  const waypoints = full.slice(1, -1).join("|");
  return `https://www.google.com/maps/dir/?${qs({ api: 1, origin, destination: dest, waypoints: waypoints || undefined, travelmode: mode })}`;
}

export const mapsSearchUrl = (place: string, destination: string) =>
  `https://www.google.com/maps/search/?${qs({ api: 1, query: `${place}, ${destination}` })}`;

/** YYYY-MM-DD for a start date plus an offset in days (UTC-safe). */
export function isoDay(startIso: string, offset = 0) {
  const d = new Date(startIso);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
