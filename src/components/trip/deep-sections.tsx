import { Camera, CalendarHeart, Compass, Sparkles, TriangleAlert } from "@/components/site/icons";
import type { TripDeep } from "@/lib/trip-deep";

/** A small label over a column of an open section. */
function Label({ icon: Icon, children }: { icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
      <Icon className="size-4 text-brand" /> {children}
    </h3>
  );
}

/** What things really cost on the ground, as an open two-column price list. */
export function RealPrices({ prices, place }: { prices: TripDeep["prices"]; place: string }) {
  return (
    <div className="mt-10">
      <p className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-ink">Real prices in {place}</span>
        <span className="text-stone">About, per person unless noted</span>
      </p>
      <dl className="mt-3 border-t border-line">
        {prices.map(([item, cost]) => (
          <div key={item} className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6">
            <dt className="text-ink/80">{item}</dt>
            <dd className="text-[0.98rem] tabular-nums text-ink sm:text-right">{cost}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Where to stay, area by area, and who each suits: a numbered open list. */
export function StayAreas({ areas }: { areas: TripDeep["areas"] }) {
  return (
    <ol className="mb-12 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
      {areas.map(([area, note], i) => (
        <li key={area} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-line py-5">
          <span className="pt-0.5 font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 className="font-medium text-ink">{area}</h3>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-ink/70">{note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** What locals know, the mistakes to skip, and where to take the photo: three open columns of lists. */
export function Insider({ deep }: { deep: TripDeep }) {
  return (
    <div className="space-y-12">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <Label icon={Sparkles}>Locals know</Label>
          <ol className="mt-4 border-t border-line">
            {deep.secrets.map((s, i) => (
              <li key={s} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-line py-4 leading-relaxed text-ink/85">
                <span className="pt-1 font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <Label icon={TriangleAlert}>Mistakes to avoid</Label>
          <ul className="mt-4 border-t border-line">
            {deep.mistakes.map((s) => (
              <li key={s} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-line py-4 leading-relaxed text-ink/85">
                <span aria-hidden className="pt-1 font-mono text-xs text-coral">✕</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <Label icon={Camera}>Where to take the photo</Label>
        <ul className="mt-4 grid border-t border-line sm:grid-cols-3 sm:gap-x-8">
          {deep.photoSpots.map(([spot, when]) => (
            <li key={spot} className="border-b border-line py-4">
              <p className="leading-snug text-ink">{spot}</p>
              <p className="mt-1.5 text-sm text-stone">{when}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Day trips from the base, and what's on through the season. */
export function Nearby({ deep }: { deep: TripDeep }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        <Label icon={Compass}>Day trips</Label>
        <ul className="mt-4 border-t border-line">
          {deep.dayTrips.map(([place, distance, why]) => (
            <li key={place} className="border-b border-line py-4">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="display text-[1.12rem] text-ink">{place}</span>
                <span className="text-xs text-stone">{distance}</span>
              </p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink/70">{why}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Label icon={CalendarHeart}>What&apos;s on</Label>
        <ol className="relative mt-5 space-y-6 border-l border-line pl-6">
          {deep.events.map(([name, when, note]) => (
            <li key={name} className="relative">
              <span aria-hidden className="absolute -left-[1.84rem] top-1.5 size-2.5 rounded-full bg-brand ring-4 ring-paper" />
              <p className="text-xs uppercase tracking-[0.12em] text-stone">{when}</p>
              <p className="display mt-1 text-[1.12rem] text-ink">{name}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink/70">{note}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
