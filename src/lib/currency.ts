/**
 * Which currency a country uses, so the trip page can convert between the
 * traveller's money and the destination's. Euro countries are listed once.
 */
const EURO = "at be cy de ee es fi fr gr hr ie it lt lu lv mt nl pt si sk mc sm va ad me xk";

const TABLE: Record<string, string> = {
  us: "USD", gb: "GBP", "gb-eng": "GBP", "gb-sct": "GBP", "gb-wls": "GBP", in: "INR", jp: "JPY", cn: "CNY", kr: "KRW", tw: "TWD",
  hk: "HKD", mo: "MOP", sg: "SGD", my: "MYR", th: "THB", id: "IDR", ph: "PHP", vn: "VND", kh: "KHR", la: "LAK", mm: "MMK",
  lk: "LKR", np: "NPR", bt: "BTN", bd: "BDT", pk: "PKR", mv: "MVR", ae: "AED", sa: "SAR", qa: "QAR", om: "OMR", bh: "BHD",
  kw: "KWD", jo: "JOD", il: "ILS", tr: "TRY", eg: "EGP", ma: "MAD", tn: "TND", za: "ZAR", ke: "KES", tz: "TZS", ug: "UGX",
  rw: "RWF", et: "ETB", ng: "NGN", gh: "GHS", sn: "XOF", na: "NAD", bw: "BWP", mu: "MUR", sc: "SCR", mg: "MGA", zm: "ZMW",
  zw: "USD", au: "AUD", nz: "NZD", fj: "FJD", pf: "XPF", nc: "XPF", ca: "CAD", mx: "MXN", cr: "CRC", pa: "PAB", gt: "GTQ",
  bz: "BZD", cu: "CUP", do: "DOP", jm: "JMD", bs: "BSD", bb: "BBD", tt: "TTD", br: "BRL", ar: "ARS", cl: "CLP", pe: "PEN",
  co: "COP", ec: "USD", bo: "BOB", uy: "UYU", py: "PYG", ch: "CHF", li: "CHF", no: "NOK", se: "SEK", dk: "DKK", is: "ISK",
  pl: "PLN", cz: "CZK", hu: "HUF", ro: "RON", bg: "BGN", rs: "RSD", ba: "BAM", mk: "MKD", al: "ALL", md: "MDL", ua: "UAH",
  ru: "RUB", by: "BYN", ge: "GEL", am: "AMD", az: "AZN", kz: "KZT", uz: "UZS", kg: "KGS", tj: "TJS", mn: "MNT", ir: "IRR",
  iq: "IQD", lb: "LBP", sy: "SYP", ye: "YER", af: "AFN", ps: "ILS", gl: "DKK", fo: "DKK",
};
for (const c of EURO.split(" ")) TABLE[c] = "EUR";

export function currencyFor(countryCode?: string | null): string | null {
  return countryCode ? (TABLE[countryCode.toLowerCase()] ?? null) : null;
}

/** The viewer's own currency, read from their browser's locale ("en-IN" → INR). */
export function homeCurrency(): string {
  if (typeof navigator === "undefined") return "USD";
  for (const lang of navigator.languages ?? [navigator.language]) {
    const region = lang.split("-")[1]?.toLowerCase();
    const c = region && currencyFor(region);
    if (c) return c;
  }
  return "USD";
}

/** "¥12,300" in the right style for the currency. */
export function formatMoney(amount: number, currency: string, maxDigits?: number) {
  try {
    const digits = maxDigits ?? (Math.abs(amount) >= 10 ? 0 : 2);
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString("en-US")} ${currency}`;
  }
}
