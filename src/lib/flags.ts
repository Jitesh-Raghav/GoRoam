/**
 * Country flags for destinations. Names are matched against every region name
 * the runtime knows (Intl.DisplayNames), so no country table ships in the bundle.
 */

// Names people write that differ from the official English region name.
const ALIASES: Record<string, string> = {
  usa: "us", "u.s.a": "us", "u.s": "us", us: "us", america: "us", "united states of america": "us",
  uk: "gb", "u.k": "gb", britain: "gb", "great britain": "gb", england: "gb-eng", scotland: "gb-sct", wales: "gb-wls",
  "northern ireland": "gb", uae: "ae", emirates: "ae", dubai: "ae", "abu dhabi": "ae",
  korea: "kr", "south korea": "kr", "north korea": "kp", russia: "ru", vietnam: "vn", "viet nam": "vn", laos: "la",
  "czech republic": "cz", czechia: "cz", holland: "nl", turkiye: "tr", "türkiye": "tr", turkey: "tr",
  "ivory coast": "ci", burma: "mm", myanmar: "mm", "hong kong": "hk", macau: "mo", macao: "mo", taiwan: "tw",
  palestine: "ps", "vatican": "va", "vatican city": "va", bali: "id", "the bahamas": "bs", bahamas: "bs",
  "the netherlands": "nl", "the philippines": "ph", "the maldives": "mv", "st lucia": "lc", "saint lucia": "lc",
  bosnia: "ba", "cape verde": "cv", "east timor": "tl", swaziland: "sz", eswatini: "sz",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z.\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

let byName: Map<string, string> | null = null;

function names() {
  if (byName) return byName;
  byName = new Map();
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const A = 65;
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        const code = String.fromCharCode(A + i, A + j);
        let name: string | undefined;
        try {
          name = dn.of(code);
        } catch {
          continue;
        }
        if (!name || name === code || /unknown/i.test(name)) continue;
        // First code wins, so France is "fr" rather than the retired "fx".
        // "Myanmar (Burma)" is also reachable as "Myanmar".
        for (const n of new Set([name, name.replace(/\s*\(.*\)\s*/, "")])) {
          if (!byName.has(norm(n))) byName.set(norm(n), code.toLowerCase());
        }
      }
    }
  } catch {
    // Very old runtimes: aliases only.
  }
  for (const [k, v] of Object.entries(ALIASES)) byName.set(k, v);
  return byName;
}

const VALID = /^[a-z]{2}(-[a-z]{3})?$/;

/**
 * The flag code for "Kyoto, Japan", "Paris, France" or "Bali". A model-supplied
 * `hint` ("jp") wins when it's a real code. Returns null when unsure.
 */
export function countryCodeFor(place?: string | null, hint?: unknown): string | null {
  const map = names();
  if (typeof hint === "string") {
    const h = hint.trim().toLowerCase();
    if (VALID.test(h) && (h.includes("-") || [...map.values()].includes(h))) return h;
  }
  if (!place) return null;
  const parts = place.split(",").map(norm).filter(Boolean);
  // The country is usually last: "Old Town, Prague, Czechia".
  for (const part of [...parts].reverse()) {
    const hit = map.get(part) ?? map.get(part.replace(/^the /, ""));
    if (hit) return hit;
  }
  return null;
}

/** "Japan" for "jp". */
export function countryName(code: string) {
  if (code.startsWith("gb-")) return { "gb-eng": "England", "gb-sct": "Scotland", "gb-wls": "Wales" }[code] ?? "United Kingdom";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
