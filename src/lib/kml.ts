import { cityOf, isoDay } from "./booking";
import type { ItineraryDetails } from "./trip";

/**
 * Every stop as a KML map, one folder (and pin colour) per day. Import it into
 * Google My Maps, Organic Maps or Maps.me and the whole trip works offline.
 */

// KML colours are aabbggrr. A palette that tells days apart on any base map.
const DAY_COLOURS = ["ff78820b", "ff40a3f4", "ffbfd134", "ff5c3cd9", "ff2dc3f4", "ffb06a7a", "ff3f8f2f", "ffd17aa6"];

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function buildKml(it: ItineraryDetails) {
  const days = it.itineraryData?.itinerary ?? [];
  const title = it.itineraryData?.summary?.destination || it.destination;
  const styles = DAY_COLOURS.map(
    (c, i) => `<Style id="d${i}"><IconStyle><color>${c}</color><scale>1.1</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href></Icon></IconStyle></Style>`
  ).join("");
  const folders = days
    .map((d, i) => {
      const pins = (["morning", "afternoon", "evening"] as const)
        .map((k) => d[k])
        .filter((s) => s?.place?.name && Number.isFinite(s.place.lat) && Number.isFinite(s.place.lng) && (s.place.lat !== 0 || s.place.lng !== 0))
        .map(
          (s, n) => `<Placemark><name>${esc(`${n + 1}. ${s.place.name}`)}</name><styleUrl>#d${i % DAY_COLOURS.length}</styleUrl><description>${esc(
            [s.time, s.place.area, s.place.description, s.tip ? `Tip: ${s.tip}` : ""].filter(Boolean).join("\n")
          )}</description><Point><coordinates>${s.place.lng},${s.place.lat},0</coordinates></Point></Placemark>`
        )
        .join("");
      return pins ? `<Folder><name>${esc(`Day ${i + 1} · ${isoDay(it.startDate, i)} · ${d.theme ?? ""}`)}</name>${pins}</Folder>` : "";
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${esc(`${title} · GoRoam`)}</name>${styles}${folders}</Document></kml>`;
}

export const hasMappableStops = (it: ItineraryDetails) =>
  (it.itineraryData?.itinerary ?? []).some((d) => [d.morning, d.afternoon, d.evening].some((s) => Number.isFinite(s?.place?.lat) && Number.isFinite(s?.place?.lng) && (s.place.lat !== 0 || s.place.lng !== 0)));

export function downloadKml(it: ItineraryDetails) {
  const blob = new Blob([buildKml(it)], { type: "application/vnd.google-earth.kml+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cityOf(it.destination).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "trip"}-goroam-map.kml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
