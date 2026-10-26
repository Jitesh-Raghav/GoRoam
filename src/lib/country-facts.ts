import type { TripIdea } from "@/lib/trip-ideas";

/**
 * The practical things people look up before a trip, per country: money,
 * language, plugs, the time, who to call, which side of the road, tipping,
 * the tap water and getting online. Trip pages show them as "Know before you
 * go". Time zones are IANA names, so offsets and summer time are worked out
 * by Intl rather than written down here.
 */
export interface CountryFacts {
  currency: string;
  language: string;
  /** Plug types and voltage. */
  plugs: string;
  zone: string;
  emergency: string;
  drive: "left" | "right";
  tipping: string;
  water: string;
  sim: string;
  /** "Hello" and "thank you" in the local language, with a pronunciation where it isn't obvious. */
  phrases?: [hello: string, thanks: string];
}

const EU_SIM = "Your SIM from anywhere in the EU works here at home prices. Otherwise, an eSIM bought before you fly is easiest.";
const ESIM = (local: string) => `An eSIM bought before you fly is easiest; at the airport, ${local} sell tourist SIMs (bring your passport).`;
const SAFE = "Safe to drink from the tap.";
const BOTTLED = "Drink bottled or filtered water; most hotels give you some free.";
const EURO_TIP = "Service is often included; round up or leave 5–10% for good service.";

const f = (
  currency: string,
  language: string,
  plugs: string,
  zone: string,
  emergency: string,
  drive: "left" | "right",
  tipping: string,
  water: string,
  sim: string,
  phrases?: [string, string],
): CountryFacts => ({ currency, language, plugs, zone, emergency, drive, tipping, water, sim, phrases });

export const COUNTRY_FACTS: Record<string, CountryFacts> = {
  India: f("Indian rupee (₹, INR)", "Hindi and English, plus the state's own language", "C, D, M · 230V", "Asia/Kolkata", "112 for any emergency", "left", "Not expected; round up, or 5–10% at sit-down restaurants.", BOTTLED, "Jio and Airtel have the best coverage; foreigners need a passport, visa and photo for a SIM, and an eSIM is quicker.", ["Namaste", "Dhanyavaad"]),
  "United States": f("US dollar ($, USD)", "English", "A, B · 120V", "America/New_York", "911", "right", "18–20% at restaurants, $1–2 a drink at bars, and tip guides, drivers and housekeeping.", SAFE, "An eSIM before you fly is easiest; T-Mobile and AT&T prepaid SIMs are sold in their stores."),
  Canada: f("Canadian dollar ($, CAD)", "English and French", "A, B · 120V", "America/Toronto", "911", "right", "15–20% at restaurants and for taxis and guides.", SAFE, "Mobile data is pricey; an eSIM before you fly usually works out cheaper than a local SIM."),
  "United Kingdom": f("Pound sterling (£, GBP)", "English", "G · 230V", "Europe/London", "999 (112 also works)", "left", "10–12.5% if service isn't already on the bill; nothing at the pub bar.", SAFE, "EE, Vodafone, O2 and Three sell pay-as-you-go SIMs in any high-street shop; eSIMs work too."),
  Portugal: f("Euro (€, EUR)", "Portuguese", "C, F · 230V", "Europe/Lisbon", "112", "right", EURO_TIP, SAFE, EU_SIM, ["Olá", "Obrigado (said by men) / Obrigada (by women)"]),
  Spain: f("Euro (€, EUR)", "Spanish", "C, F · 230V", "Europe/Madrid", "112", "right", "Not expected; round up or leave a euro or two, 5–10% for a great meal.", SAFE, EU_SIM, ["Hola", "Gracias"]),
  France: f("Euro (€, EUR)", "French", "C, E · 230V", "Europe/Paris", "112", "right", "Service is included by law; leave a few euros for great service.", SAFE, EU_SIM, ["Bonjour", "Merci"]),
  Italy: f("Euro (€, EUR)", "Italian", "C, F, L · 230V", "Europe/Rome", "112", "right", "A cover charge (coperto) is normal; round up or leave a euro or two.", SAFE, EU_SIM, ["Buongiorno", "Grazie"]),
  Germany: f("Euro (€, EUR)", "German", "C, F · 230V", "Europe/Berlin", "112", "right", "Round up or add 5–10%, told to the waiter as you pay.", SAFE, EU_SIM, ["Hallo", "Danke"]),
  Austria: f("Euro (€, EUR)", "German", "C, F · 230V", "Europe/Vienna", "112", "right", "Round up or add 5–10%, told to the waiter as you pay.", SAFE, EU_SIM, ["Grüß Gott", "Danke"]),
  Switzerland: f("Swiss franc (CHF)", "German, French, Italian and Romansh", "C, J · 230V", "Europe/Zurich", "112 (144 ambulance)", "right", "Service is included; round up for good service.", SAFE, "Switzerland isn't in the EU, so EU roaming may not apply; an eSIM is the easy fix.", ["Grüezi", "Merci vielmal"]),
  Netherlands: f("Euro (€, EUR)", "Dutch (almost everyone speaks English)", "C, F · 230V", "Europe/Amsterdam", "112", "right", "Round up or leave 5–10%.", SAFE, EU_SIM, ["Hallo", "Dank je wel"]),
  Belgium: f("Euro (€, EUR)", "Dutch (Flemish), French and German", "C, E · 230V", "Europe/Brussels", "112", "right", "Service is included; round up for good service.", SAFE, EU_SIM, ["Hallo", "Dank u wel"]),
  Denmark: f("Danish krone (kr, DKK)", "Danish (English is widely spoken)", "C, E, F, K · 230V", "Europe/Copenhagen", "112", "right", "Service is included; tipping is not expected.", SAFE, EU_SIM, ["Hej", "Tak"]),
  Sweden: f("Swedish krona (kr, SEK)", "Swedish (English is widely spoken)", "C, F · 230V", "Europe/Stockholm", "112", "right", "Not expected; round up for good service. Cards work almost everywhere.", SAFE, EU_SIM, ["Hej", "Tack"]),
  Norway: f("Norwegian krone (kr, NOK)", "Norwegian (English is widely spoken)", "C, F · 230V", "Europe/Oslo", "112 police, 113 ambulance", "right", "Not expected; round up for good service. Cards work almost everywhere.", SAFE, "Norway follows EU roaming rules, so an EU SIM works here; otherwise get an eSIM.", ["Hei", "Takk"]),
  Finland: f("Euro (€, EUR)", "Finnish and Swedish (English is widely spoken)", "C, F · 230V", "Europe/Helsinki", "112", "right", "Not expected; service is included.", SAFE, EU_SIM, ["Hei / Moi", "Kiitos (KEE-tos)"]),
  Iceland: f("Icelandic króna (kr, ISK)", "Icelandic (everyone speaks English)", "C, F · 230V", "Atlantic/Reykjavik", "112", "right", "Not expected; service is included.", "Some of the best tap water in the world.", "Iceland follows EU roaming rules; Síminn and Vodafone sell SIMs at Keflavík.", ["Halló", "Takk"]),
  "Czech Republic": f("Czech koruna (Kč, CZK)", "Czech", "C, E · 230V", "Europe/Prague", "112", "right", "Round up or leave about 10%, told to the waiter as you pay.", SAFE, EU_SIM, ["Dobrý den", "Děkuji (DYEH-koo-yee)"]),
  Hungary: f("Hungarian forint (Ft, HUF)", "Hungarian", "C, F · 230V", "Europe/Budapest", "112", "right", "10–15% unless a service charge is on the bill.", SAFE, EU_SIM, ["Szia", "Köszönöm (KUR-sur-nurm)"]),
  Greece: f("Euro (€, EUR)", "Greek", "C, F · 230V", "Europe/Athens", "112", "right", "Round up or leave 5–10%.", "Safe in Athens; on small islands most people drink bottled.", EU_SIM, ["Yia sas", "Efharistó (ef-ha-ree-STO)"]),
  Malta: f("Euro (€, EUR)", "Maltese and English", "G · 230V", "Europe/Malta", "112", "left", "5–10% at restaurants.", "Safe but salty-tasting; most people drink bottled.", EU_SIM, ["Bonġu", "Grazzi"]),
  Turkey: f("Turkish lira (₺, TRY)", "Turkish", "C, F · 230V", "Europe/Istanbul", "112", "right", "5–10% at restaurants; round up taxi fares.", BOTTLED, "Turkcell has the best coverage; foreign phones need registering after 120 days, so short trips are fine.", ["Merhaba", "Teşekkürler (teh-shek-kur-LER)"]),
  Georgia: f("Georgian lari (₾, GEL)", "Georgian (Russian and English in cities)", "C, F · 220V", "Asia/Tbilisi", "112", "right", "A 10–18% service charge is often added; otherwise leave 10%.", "Usually fine in Tbilisi; bottled water is cheap.", ESIM("Magti and Silknet"), ["Gamarjoba", "Madloba"]),
  Azerbaijan: f("Azerbaijani manat (₼, AZN)", "Azerbaijani (Russian widely understood)", "C, F · 220V", "Asia/Baku", "112", "right", "Around 10% at restaurants if service isn't added.", BOTTLED, ESIM("Azercell and Bakcell"), ["Salam", "Sağ ol"]),
  Kazakhstan: f("Kazakhstani tenge (₸, KZT)", "Kazakh and Russian", "C, F · 220V", "Asia/Almaty", "112", "right", "A 10–15% service charge is often added; round up otherwise.", BOTTLED, ESIM("Beeline and Kcell"), ["Sälem", "Rakhmet"]),
  "United Arab Emirates": f("UAE dirham (AED)", "Arabic (English everywhere)", "G · 230V", "Asia/Dubai", "999 police, 998 ambulance", "right", "10–15% at restaurants if service isn't included.", "Safe, but most people drink bottled.", ESIM("du and e& (Etisalat)"), ["Marhaba", "Shukran"]),
  Oman: f("Omani rial (OMR)", "Arabic (English widely spoken)", "G · 240V", "Asia/Muscat", "9999", "right", "Not expected; 10% for good service.", "Safe, but most people drink bottled.", ESIM("Omantel and Ooredoo"), ["Marhaba", "Shukran"]),
  Jordan: f("Jordanian dinar (JOD)", "Arabic (English in tourist areas)", "C, D, F, G · 230V", "Asia/Amman", "911", "right", "10% at restaurants; tip guides and drivers.", BOTTLED, ESIM("Zain and Orange"), ["Marhaba", "Shukran"]),
  Egypt: f("Egyptian pound (E£, EGP)", "Arabic", "C, F · 220V", "Africa/Cairo", "122 police, 123 ambulance", "right", "Tipping (baksheesh) is expected everywhere; carry small notes.", BOTTLED, ESIM("Vodafone and Orange"), ["Ahlan", "Shukran"]),
  Morocco: f("Moroccan dirham (MAD)", "Arabic, Amazigh and French", "C, E · 220V", "Africa/Casablanca", "19 police, 15 ambulance", "right", "10% at restaurants; small tips for guides and porters.", BOTTLED, ESIM("Maroc Telecom, Orange and inwi"), ["Salam", "Shukran"]),
  Thailand: f("Thai baht (฿, THB)", "Thai", "A, B, C, O · 230V", "Asia/Bangkok", "191 police, 1669 ambulance, 1155 tourist police", "left", "Not expected; round up, or 20–50 baht for good service.", BOTTLED, "AIS and True sell tourist SIMs at the airport arrivals hall.", ["Sawasdee krub (men) / ka (women)", "Khop khun krub / ka"]),
  Vietnam: f("Vietnamese dong (₫, VND)", "Vietnamese", "A, C · 220V", "Asia/Ho_Chi_Minh", "113 police, 115 ambulance", "right", "Not expected; small tips for guides and good service are welcome.", BOTTLED, "Viettel has the best coverage; SIMs are sold at the airport.", ["Xin chào", "Cảm ơn (gahm uhn)"]),
  Malaysia: f("Malaysian ringgit (RM, MYR)", "Malay (English widely spoken)", "G · 240V", "Asia/Kuala_Lumpur", "999", "left", "A 10% service charge is usually added; tipping isn't expected.", "Treated, but most people boil or filter it.", ESIM("Maxis and CelcomDigi"), ["Selamat pagi", "Terima kasih"]),
  Singapore: f("Singapore dollar (S$, SGD)", "English, Malay, Mandarin and Tamil", "G · 230V", "Asia/Singapore", "999 police, 995 ambulance", "left", "Not expected; a 10% service charge is already on most bills.", SAFE, "Singtel and StarHub sell tourist SIMs at Changi."),
  Japan: f("Japanese yen (¥, JPY)", "Japanese", "A, B · 100V", "Asia/Tokyo", "110 police, 119 ambulance", "left", "No tipping; it can cause confusion.", SAFE, "Physical SIMs are hard to get; buy a data eSIM or rent a pocket Wi-Fi at the airport.", ["Konnichiwa", "Arigatō"]),
  "South Korea": f("South Korean won (₩, KRW)", "Korean", "C, F · 220V", "Asia/Seoul", "112 police, 119 ambulance", "right", "No tipping.", "Safe, though most people drink filtered.", ESIM("KT and SK Telecom"), ["Annyeonghaseyo", "Gamsahamnida (gam-sa-ham-NEE-da)"]),
  China: f("Hong Kong dollar (HK$, HKD)", "Cantonese and English", "G · 220V", "Asia/Hong_Kong", "999", "left", "A 10% service charge is usually added; round up taxis.", "Safe, though locals usually boil it.", ESIM("CSL and 3HK"), ["Nei hou", "M goi"]),
  "Sri Lanka": f("Sri Lankan rupee (Rs, LKR)", "Sinhala and Tamil (English widely spoken)", "D, G · 230V", "Asia/Colombo", "119 police, 1990 ambulance", "left", "A 10% service charge is usually added; tip drivers and guides.", BOTTLED, "Dialog and Mobitel have free tourist SIM counters at the airport.", ["Ayubowan", "Istuti (iss-TOO-tee)"]),
  Maldives: f("Maldivian rufiyaa (MVR); US dollars accepted", "Dhivehi (English widely spoken)", "D, G · 230V", "Indian/Maldives", "119 police, 102 ambulance", "left", "A 10% service charge is added; tip resort staff a few dollars a day.", "Resorts provide filtered or bottled water.", ESIM("Dhiraagu and Ooredoo"), ["Assalaamu alaikum", "Shukuriyya"]),
  Nepal: f("Nepalese rupee (Rs, NPR)", "Nepali (English in tourist areas)", "C, D, M · 230V", "Asia/Kathmandu", "100 police, 1144 tourist police", "left", "10% at restaurants; tip trekking guides and porters well.", BOTTLED, "Ncell and Nepal Telecom sell SIMs at the airport and in Thamel.", ["Namaste", "Dhanyabad"]),
  Bhutan: f("Bhutanese ngultrum (Nu, BTN); Indian rupees accepted", "Dzongkha (English widely spoken)", "D, F, G · 230V", "Asia/Thimphu", "113 police, 112 ambulance", "left", "Not expected; tip your guide and driver at the end.", BOTTLED, ESIM("B-Mobile and TashiCell"), ["Kuzuzangpo la", "Kadrinchey la (ka-DRIN-chey la)"]),
  Cambodia: f("Cambodian riel (KHR); US dollars used everywhere", "Khmer", "A, C, G · 230V", "Asia/Phnom_Penh", "117 police, 119 ambulance", "right", "Not expected; $1–2 for good service and tip tuk-tuk drivers.", BOTTLED, ESIM("Smart and Cellcard"), ["Choum reap suor", "Arkoun"]),
  Laos: f("Lao kip (₭, LAK)", "Lao", "A, B, C, E, F · 230V", "Asia/Vientiane", "191 police, 195 ambulance", "right", "Not expected; small tips are welcome.", BOTTLED, ESIM("Unitel and Lao Telecom"), ["Sabaidee", "Khop chai"]),
  Philippines: f("Philippine peso (₱, PHP)", "Filipino and English", "A, B, C · 220V", "Asia/Manila", "911", "right", "10% unless a service charge is added.", BOTTLED, ESIM("Globe and Smart"), ["Kumusta", "Salamat"]),
  Kenya: f("Kenyan shilling (KSh, KES)", "Swahili and English", "G · 240V", "Africa/Nairobi", "999 or 112", "left", "10% at restaurants; about $10–20 a day per group for safari guides.", BOTTLED, "Safaricom covers even the parks; SIMs at the airport with your passport.", ["Jambo", "Asante"]),
  Tanzania: f("Tanzanian shilling (TSh, TZS); US dollars widely used", "Swahili and English", "D, G · 230V", "Africa/Dar_es_Salaam", "112", "left", "10% at restaurants; tip guides and drivers.", BOTTLED, ESIM("Vodacom and Airtel"), ["Jambo", "Asante"]),
  "South Africa": f("South African rand (R, ZAR)", "11 official languages; English everywhere", "M, N (C fits) · 230V", "Africa/Johannesburg", "10111 police, 10177 ambulance, 112 from mobiles", "left", "10–15% at restaurants; tip car guards a few rand.", "Safe in Cape Town and the main cities.", ESIM("Vodacom and MTN"), ["Molo (Xhosa)", "Enkosi"]),
  Mauritius: f("Mauritian rupee (Rs, MUR)", "Mauritian Creole, French and English", "C, G · 230V", "Indian/Mauritius", "999 police, 114 ambulance", "left", "Not expected; 5–10% for good service.", BOTTLED, ESIM("my.t and Emtel"), ["Bonzour", "Mersi"]),
  Australia: f("Australian dollar ($, AUD)", "English", "I · 230V", "Australia/Sydney", "000", "left", "Not expected; 10% for great service.", SAFE, "Telstra has by far the best outback coverage; SIMs at airports and supermarkets.", ["G'day", "Cheers"]),
  "New Zealand": f("New Zealand dollar ($, NZD)", "English and te reo Māori", "I · 230V", "Pacific/Auckland", "111", "left", "Not expected; 10% for great service.", SAFE, "One NZ and Spark sell SIMs at the airport.", ["Kia ora", "Kia ora / Ngā mihi"]),
  Fiji: f("Fijian dollar ($, FJD)", "English, Fijian and Fiji Hindi", "I · 240V", "Pacific/Fiji", "917 police, 911 ambulance", "left", "Not expected; many resorts have a staff Christmas fund instead.", BOTTLED, ESIM("Vodafone Fiji and Digicel"), ["Bula", "Vinaka"]),
  "French Polynesia": f("CFP franc (XPF)", "French and Tahitian", "A, B, E · 220V", "Pacific/Tahiti", "17 police, 15 ambulance", "right", "Not expected.", "Safe in Papeete; bottled on the outer islands.", ESIM("Vini"), ["Ia ora na", "Māuruuru"]),
  Mexico: f("Mexican peso ($, MXN)", "Spanish", "A, B · 127V", "America/Mexico_City", "911", "right", "10–15% at restaurants; small tips for porters and guides.", BOTTLED, "Telcel has the best coverage; SIMs at OXXO shops.", ["Hola", "Gracias"]),
  Colombia: f("Colombian peso ($, COP)", "Spanish", "A, B · 110V", "America/Bogota", "123", "right", "A 10% propina is suggested on the bill; you can decline it.", "Safe in Bogotá and Medellín; bottled on the coast.", ESIM("Claro and Movistar"), ["Hola", "Gracias"]),
  Peru: f("Peruvian sol (S/, PEN)", "Spanish and Quechua", "A, C · 220V", "America/Lima", "105 police, 106 ambulance", "right", "10% at restaurants; tip trekking guides and porters.", BOTTLED, ESIM("Claro and Movistar"), ["Hola", "Gracias"]),
  Chile: f("Chilean peso ($, CLP)", "Spanish", "C, L · 220V", "America/Punta_Arenas", "133 police, 131 ambulance", "right", "A 10% propina is suggested on the bill.", "Safe in cities; Patagonian stream water is famous, but ask first.", ESIM("Entel and Movistar"), ["Hola", "Gracias"]),
  Argentina: f("Argentine peso ($, ARS)", "Spanish", "I · 220V", "America/Argentina/Buenos_Aires", "911 police, 107 ambulance", "right", "10% in cash at restaurants.", "Safe in Buenos Aires.", ESIM("Personal and Claro"), ["Hola", "Gracias"]),
  Brazil: f("Brazilian real (R$, BRL)", "Portuguese", "C, N · 127V in Rio", "America/Sao_Paulo", "190 police, 192 ambulance", "right", "A 10% service charge is usually added.", BOTTLED, ESIM("Claro, Vivo and TIM"), ["Oi / Olá", "Obrigado (men) / Obrigada (women)"]),
  Ecuador: f("US dollar ($, USD)", "Spanish", "A, B · 120V", "Pacific/Galapagos", "911", "right", "A 10% service charge is added; tip naturalist guides and boat crews.", BOTTLED, "Coverage is patchy on the islands; buy a Claro SIM on the mainland.", ["Hola", "Gracias"]),
  "Costa Rica": f("Costa Rican colón (₡, CRC); US dollars widely used", "Spanish", "A, B · 120V", "America/Costa_Rica", "911", "right", "A 10% service charge is included; extra for guides.", "Safe in most towns; bottled in remote areas.", ESIM("Kölbi and Liberty"), ["¡Pura vida!", "Gracias"]),
  Belize: f("Belize dollar (BZ$, BZD); US dollars accepted", "English, Spanish and Kriol", "A, B, G · 110V", "America/Belize", "911", "right", "10–15% if not added.", BOTTLED, ESIM("Digi and Smart")),
  Jamaica: f("Jamaican dollar ($, JMD); US dollars accepted", "English and Jamaican Patois", "A, B · 110V", "America/Jamaica", "119 police, 110 ambulance", "left", "10–15% unless included; resorts are often all-inclusive.", "Treated and generally safe; resorts filter it.", ESIM("Digicel and Flow"), ["Wah gwaan", "Big up / Tanks"]),
  Bahamas: f("Bahamian dollar ($, BSD), level with the US dollar", "English", "A, B · 120V", "America/Nassau", "919 or 911", "left", "15% is often added; check before you tip.", BOTTLED, ESIM("BTC and Aliv")),
  Barbados: f("Barbados dollar (BBD$); US dollars accepted", "English and Bajan", "A, B · 115V", "America/Barbados", "211 police, 511 ambulance", "left", "A 10% service charge is usually added.", SAFE, ESIM("Digicel and Flow")),
  "Saint Lucia": f("East Caribbean dollar (EC$, XCD); US dollars accepted", "English and Kwéyòl", "G · 240V", "America/St_Lucia", "999 or 911", "left", "A 10% service charge is usually added.", BOTTLED, ESIM("Digicel and Flow"), ["Bonjou", "Mèsi"]),
  Aruba: f("Aruban florin (Afl, AWG); US dollars accepted", "Dutch and Papiamento (English everywhere)", "A, B, F · 127V", "America/Aruba", "911", "right", "A 10–15% service charge is usually added.", "Some of the purest desalinated tap water anywhere.", ESIM("Digicel and SETAR"), ["Bon dia", "Danki"]),
  "Turks and Caicos Islands": f("US dollar ($, USD)", "English", "A, B · 120V", "America/Grand_Turk", "911", "left", "A 10–15% service charge is usually added.", BOTTLED, ESIM("Digicel and Flow")),
};

/** Destinations whose time zone, language or phrases differ from the country's main one. */
const BY_SLUG: Record<string, Partial<CountryFacts>> = {
  // United States
  "new-orleans": { zone: "America/Chicago" },
  chicago: { zone: "America/Chicago" },
  "grand-canyon": { zone: "America/Phoenix" },
  maui: { zone: "Pacific/Honolulu", language: "English and Hawaiian", phrases: ["Aloha", "Mahalo"] },
  "puerto-rico": { zone: "America/Puerto_Rico", language: "Spanish and English", phrases: ["Hola", "Gracias"] },
  aspen: { zone: "America/Denver" },
  "park-city": { zone: "America/Denver" },
  "jackson-hole": { zone: "America/Denver" },
  "las-vegas": { zone: "America/Los_Angeles" },
  "san-diego": { zone: "America/Los_Angeles" },
  "palm-springs": { zone: "America/Los_Angeles" },
  "napa-valley": { zone: "America/Los_Angeles" },
  // Australia
  "gold-coast": { zone: "Australia/Brisbane" },
  whitsundays: { zone: "Australia/Brisbane" },
  cairns: { zone: "Australia/Brisbane" },
  uluru: { zone: "Australia/Darwin" },
  "perth-margaret-river": { zone: "Australia/Perth" },
  "adelaide-barossa": { zone: "Australia/Adelaide" },
  melbourne: { zone: "Australia/Melbourne" },
  tasmania: { zone: "Australia/Hobart" },
  // Canada
  whistler: { zone: "America/Vancouver" },
  banff: { zone: "America/Edmonton" },
  "quebec-city": { language: "French (English in the tourist areas)", phrases: ["Bonjour", "Merci"] },
  // Mexico
  "cancun-tulum": { zone: "America/Cancun" },
  "cabo-san-lucas": { zone: "America/Mazatlan" },
  // Europe
  tenerife: { zone: "Atlantic/Canary" },
  madeira: { zone: "Atlantic/Madeira" },
  zermatt: { phrases: ["Grüezi", "Merci vielmal"] },
};

/** Indian states and territories: the local language and how to say hello and thank you there. */
const INDIA_REGIONS: Record<string, { language: string; phrases: [string, string] }> = {
  Rajasthan: { language: "Hindi and Rajasthani (Marwari)", phrases: ["Khamma ghani", "Dhanyavaad"] },
  Gujarat: { language: "Gujarati and Hindi", phrases: ["Kem cho", "Aabhar"] },
  Karnataka: { language: "Kannada (Hindi and English widely understood)", phrases: ["Namaskara", "Dhanyavaadagalu"] },
  Kerala: { language: "Malayalam (English widely understood)", phrases: ["Namaskaram", "Nanni"] },
  "Tamil Nadu": { language: "Tamil (English widely understood)", phrases: ["Vanakkam", "Nandri"] },
  Puducherry: { language: "Tamil, with French still on street signs", phrases: ["Vanakkam", "Nandri (or merci in the French Quarter)"] },
  Goa: { language: "Konkani (Hindi and English everywhere)", phrases: ["Namaskar", "Dev borem korum"] },
  Maharashtra: { language: "Marathi and Hindi", phrases: ["Namaskar", "Dhanyavaad"] },
  Odisha: { language: "Odia and Hindi", phrases: ["Namaskar", "Dhanyabaad"] },
  "West Bengal": { language: "Nepali in the hills, Bengali on the plains", phrases: ["Namaste", "Dhanyabad"] },
  Sikkim: { language: "Nepali (Hindi and English widely understood)", phrases: ["Namaste", "Dhanyabad"] },
  Meghalaya: { language: "Khasi and Garo (English is official)", phrases: ["Khublei", "Khublei shibun"] },
  Assam: { language: "Assamese", phrases: ["Nomoskar", "Dhonyobad"] },
  "Arunachal Pradesh": { language: "Monpa around Tawang; Hindi everywhere", phrases: ["Tashi delek", "Dhanyavaad"] },
  "Himachal Pradesh": { language: "Hindi and Pahari", phrases: ["Namaste", "Dhanyavaad"] },
  Uttarakhand: { language: "Hindi, Garhwali and Kumaoni", phrases: ["Namaste", "Dhanyavaad"] },
  "Uttar Pradesh": { language: "Hindi and Urdu", phrases: ["Namaste / Adaab", "Shukriya"] },
  Punjab: { language: "Punjabi and Hindi", phrases: ["Sat Sri Akal", "Dhanvaad"] },
  "Madhya Pradesh": { language: "Hindi", phrases: ["Namaste", "Dhanyavaad"] },
  "Andaman & Nicobar": { language: "Hindi, Bengali and Tamil (English widely understood)", phrases: ["Namaste", "Dhanyavaad"] },
  Lakshadweep: { language: "Malayalam (Jeseri dialect)", phrases: ["Assalamu alaikum", "Nanni"] },
};

/** The facts for a trip's destination, or null for a country not covered. */
export function factsFor(t: Pick<TripIdea, "slug" | "country" | "region">): CountryFacts | null {
  const base = COUNTRY_FACTS[t.country];
  if (!base) return null;
  const region = t.country === "India" ? INDIA_REGIONS[t.region] : undefined;
  return { ...base, ...(region ?? {}), ...(BY_SLUG[t.slug] ?? {}) };
}

/** "UTC+5:30" for a zone right now, so summer time is always right. */
export function utcOffset(zone: string, at = new Date()) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  return name.replace("GMT", "UTC").replace(/^UTC$/, "UTC+0");
}
