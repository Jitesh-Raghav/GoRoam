// Entry rules for the adventures, written for US, EU, UK and Australian passports.
// Rules move often; every adventure page adds a line telling readers to check official sources.

export const VISA = {
  vietnam:
    "US and Australian passports need an e-visa (about $25 for a single entry, valid up to 90 days); apply only on the official Vietnamese government portal. UK passports and many EU ones (including Germany, France, Italy, Spain and the Nordic countries) get 45 days visa-free; other EU passports use the e-visa.",
  cambodia:
    "US, EU, UK and Australian passports need a visa: a 30-day tourist e-visa from the official evisa.gov.kh site (about $36), or a visa on arrival at the airports and main land borders (about $30, in cash). Cambodia has moved its arrival card online, so fill it in before you travel if asked.",
  laos:
    "US, EU, UK and Australian passports can get a visa on arrival at the airports and main land borders (roughly $30–$50 depending on passport, paid in US dollars; bring a passport photo), or the official Laos e-visa for the airports and main crossings.",
  thailand:
    "US, EU, UK and Australian passports can enter visa-free (60 days under the rules in force since 2024; Thailand has discussed cutting it back to 30, so check). Everyone must fill in the free Thailand Digital Arrival Card online in the three days before arriving.",
  indonesia:
    "US, EU, UK and Australian passports get a visa on arrival (about $32, IDR 500,000, for 30 days, extendable once). Buy it in advance as an e-VOA on the official immigration site to skip the queue, and fill in the official digital arrival card before you land.",
  philippines:
    "US, EU, UK and Australian passports get 30 days visa-free on arrival (it can be extended). Register on the free official eTravel site within 72 hours before your flight, and ignore look-alike sites that charge.",
  nepal:
    "US, EU, UK and Australian passports get a visa on arrival at Kathmandu airport and the main land borders: $30 for 15 days, $50 for 30 days, $125 for 90 days. Filling in the online form before you fly speeds things up.",
  india:
    "US, EU, UK and Australian passports need a visa: the official e-Visa (e-Tourist) comes in 30-day, 1-year and 5-year versions, with fees depending on your passport and the season. Apply only on the official Indian government site; look-alike sites charge extra.",
  sriLanka:
    "Everyone needs an ETA, applied for online before arriving. Sri Lanka waived the fee for many countries, including the US, UK, Australia and much of the EU, from late 2024, but the rules and fees have changed several times, so apply through the official ETA site and check the current position.",
  kyrgyzstan: "US, EU, UK and Australian passports can stay up to 60 days visa-free, with no registration needed for a short stay.",
  tajikistan:
    "US, EU, UK and Australian passports need a visa: apply for the official e-visa online (it takes a few days) and add the GBAO permit if you're going to the Pamirs. Together they cost roughly $50–$70.",
  uzbekistan:
    "UK, Australian and most EU passports get 30 days visa-free; US passports can use the official e-visa if they still need one, so check the current list. Hotels and guesthouses register you with the authorities; keep the registration slips.",
  kazakhstan: "US, EU, UK and Australian passports can stay up to 30 days visa-free.",
  mongolia:
    "US passports can stay up to 90 days visa-free. EU, UK and Australian passports have had a temporary visa waiver (up to 30 days) since 2023: check whether it's still in force, and if not, apply for the e-visa before you go.",
  georgia:
    "US, EU, UK and Australian passports can stay up to a year visa-free. Georgia has brought in a requirement for visitors to hold travel health insurance, so carry proof of yours.",
  jordan:
    "US, EU, UK and Australian passports can get a visa on arrival (40 JD, about $56). Buying the Jordan Pass online before you fly is better value: it covers the visa fee if you stay at least three nights, plus entry to Petra, Wadi Rum and dozens of other sites.",
  oman: "US, EU, UK and Australian passports can visit visa-free for up to 14 days (with a return ticket, a hotel booking and insurance). For longer, apply for the official e-visa.",
  bolivia:
    "EU, UK and Australian passports can enter visa-free (usually for 30–90 days). US passports have needed a visa (about $160, on arrival or in advance), though Bolivia has been reviewing that rule, so check before you go.",
  peru: "US, EU, UK and Australian passports can visit visa-free. Immigration usually gives up to 90 days (183 at most), so ask for the days you need.",
  colombia: "US, EU, UK and Australian passports can visit visa-free for up to 90 days. Fill in the free Check-MIG form online in the 72 hours before your flight.",
  guatemala:
    "US, EU, UK and Australian passports can visit visa-free for up to 90 days. That 90 days covers Guatemala, El Salvador, Honduras and Nicaragua together (the CA-4 agreement).",
  ecuador: "US, EU, UK and Australian passports can visit visa-free for up to 90 days a year. Ecuador uses the US dollar.",
} as const;
