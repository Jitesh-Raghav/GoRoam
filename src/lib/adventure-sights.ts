/**
 * The named places worth seeing on each adventure (Ma Pi Leng Pass on the Ha Giang Loop,
 * Tengboche on the way to Everest…), for the photos on its page: the hero's side photos,
 * the "What you'll see" gallery and the full-screen viewer. Each has its own photo at
 * /adventures/[slug]/photo?s=N, looked up by name like any destination photo.
 */
import { SIGHTS_ASIA } from "@/lib/adventure-sights-asia";
import { SIGHTS_WEST } from "@/lib/adventure-sights-west";
import type { Adventure } from "@/lib/adventures";

/**
 * [name, one line on it, photo query]. The query defaults to "name, country"; give one when
 * that wouldn't find the place, or when the name holds "and" or "&" (the lookup cuts there).
 */
export type SightRow = [name: string, note: string, query?: string];

export interface Sight {
  name: string;
  note: string;
  /** What the photo lookup asks for: "Ma Pi Leng Pass, Vietnam". */
  query: string;
}

const ROWS: Record<string, SightRow[]> = { ...SIGHTS_ASIA, ...SIGHTS_WEST };

export function adventureSights(a: Pick<Adventure, "slug" | "country">): Sight[] {
  return (ROWS[a.slug] ?? []).map(([name, note, query]) => ({ name, note, query: query ?? `${name}, ${a.country}` }));
}
