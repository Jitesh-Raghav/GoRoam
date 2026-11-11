/* eslint-disable @next/next/no-img-element -- tiny round thumbnails from our own photo route */
import Link from "next/link";
import { ArrowUpRight } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface CompareRow {
  slug: string;
  name: string;
  place: string;
  days: string;
  from: string;
  mid: string;
  best: string;
  idealFor: string;
  current?: boolean;
}

const COLS = [
  { k: "days", label: "Ideal length" },
  { k: "from", label: "From, a day" },
  { k: "mid", label: "Mid-range, a day" },
  { k: "best", label: "Best time" },
  { k: "idealFor", label: "Ideal for" },
] as const;

/** This trip beside the ones people weigh it against; scrolls sideways on phones with the names pinned. */
export function CompareTrips({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="-mx-4 border-y border-line sm:mx-0">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.12em] text-stone">
              <th scope="col" className="sticky left-0 z-10 bg-paper px-4 py-3.5 font-normal sm:pl-0">
                Trip
              </th>
              {COLS.map((c) => (
                <th key={c.k} scope="col" className="px-4 py-3.5 font-normal">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.slug} className={cn("transition-colors", r.current ? "bg-brand-soft/40" : "hover:bg-paper-2/50")}>
                <th scope="row" className={cn("sticky left-0 z-10 px-4 py-4 font-normal sm:pl-0", r.current ? "bg-[#e9f1fd]" : "bg-paper")}>
                  {r.current ? (
                    <span className="flex items-center gap-3">
                      <img src={`/trips/${r.slug}/photo?w=120&blank=1`} alt="" loading="lazy" referrerPolicy="no-referrer" data-photo="" className="size-10 shrink-0 rounded-xl bg-paper-2 object-cover ring-2 ring-brand" />
                      <span>
                        <span className="block font-medium text-ink">{r.name}</span>
                        <span className="block text-xs text-brand">This trip</span>
                      </span>
                    </span>
                  ) : (
                    <Link href={`/trips/${r.slug}`} className="group flex items-center gap-3">
                      <img src={`/trips/${r.slug}/photo?w=120&blank=1`} alt="" loading="lazy" referrerPolicy="no-referrer" data-photo="" className="size-10 shrink-0 rounded-xl bg-paper-2 object-cover" />
                      <span>
                        <span className="flex items-center gap-1 font-medium text-ink group-hover:text-brand">
                          {r.name} <ArrowUpRight className="size-3.5 opacity-50 transition-opacity group-hover:opacity-100" />
                        </span>
                        <span className="block text-xs text-stone">{r.place}</span>
                      </span>
                    </Link>
                  )}
                </th>
                {COLS.map((c) => (
                  <td key={c.k} className={cn("px-4 py-4 text-ink/85", (c.k === "from" || c.k === "mid") && "tabular-nums")}>
                    {r[c.k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
