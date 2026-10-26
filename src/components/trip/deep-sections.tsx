import { Camera, CalendarHeart, Compass, MapPin, Sparkles, TriangleAlert } from "@/components/site/icons";
import type { TripDeep } from "@/lib/trip-deep";

/** What things really cost on the ground, as a two-column price list. */
export function RealPrices({ prices, place }: { prices: TripDeep["prices"]; place: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-card bg-white ring-1 ring-line">
      <p className="flex items-center justify-between gap-3 border-b border-line bg-paper-2/50 px-5 py-3 text-xs text-stone sm:px-6">
        <span className="uppercase tracking-[0.14em]">Real prices in {place}</span>
        <span>About, per person unless noted</span>
      </p>
      <dl className="divide-y divide-line">
        {prices.map(([item, cost]) => (
          <div key={item} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6 sm:px-6">
            <dt className="text-ink/85">{item}</dt>
            <dd className="text-[0.95rem] tabular-nums text-ink sm:text-right">{cost}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Where to stay, area by area, and who each suits. */
export function StayAreas({ areas }: { areas: TripDeep["areas"] }) {
  return (
    <ol className="mb-6 grid gap-3 sm:grid-cols-2">
      {areas.map(([area, note], i) => (
        <li key={area} className="flex gap-4 rounded-card bg-white p-5 ring-1 ring-line">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 font-medium text-ink">
              <MapPin className="size-3.5 text-brand" /> {area}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink/70">{note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** What locals know, the mistakes to skip, and where to take the photo. */
export function Insider({ deep }: { deep: TripDeep }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-panel bg-[linear-gradient(150deg,var(--ink),var(--ink-2))] p-6 text-paper">
          <div aria-hidden className="pointer-events-none absolute -left-12 -top-12 size-48 rounded-full bg-brand/35 blur-3xl" />
          <h3 className="relative flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-sun-2">
            <Sparkles className="size-4" /> Locals know
          </h3>
          <ul className="relative mt-4 space-y-4">
            {deep.secrets.map((s, i) => (
              <li key={s} className="flex gap-3 leading-relaxed text-paper/85">
                <span className="font-mono text-xs text-sun-2/80">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-panel bg-coral-soft/60 p-6 ring-1 ring-coral/20">
          <h3 className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-ink">
            <TriangleAlert className="size-4 text-coral" /> Mistakes to avoid
          </h3>
          <ul className="mt-4 space-y-4">
            {deep.mistakes.map((s) => (
              <li key={s} className="flex gap-3 leading-relaxed text-ink/80">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-coral" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-panel bg-white p-6 ring-1 ring-line">
        <h3 className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-stone">
          <Camera className="size-4 text-brand" /> Where to take the photo
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {deep.photoSpots.map(([spot, when]) => (
            <li key={spot} className="rounded-2xl bg-paper-2/50 p-4">
              <p className="leading-snug text-ink">{spot}</p>
              <p className="mt-2 inline-flex rounded-full bg-sun-soft px-2.5 py-1 text-xs text-ink/80">{when}</p>
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-panel bg-white p-6 ring-1 ring-line">
        <h3 className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-stone">
          <Compass className="size-4 text-brand" /> Day trips
        </h3>
        <ul className="mt-4 divide-y divide-line">
          {deep.dayTrips.map(([place, distance, why]) => (
            <li key={place} className="py-4 first:pt-0 last:pb-0">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="display text-[1.1rem] text-ink">{place}</span>
                <span className="text-xs text-stone">{distance}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{why}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-panel bg-sun-soft/50 p-6 ring-1 ring-sun/25">
        <h3 className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-ink">
          <CalendarHeart className="size-4 text-sun" /> What&apos;s on
        </h3>
        <ol className="relative mt-4 space-y-5 border-l border-sun/40 pl-5">
          {deep.events.map(([name, when, note]) => (
            <li key={name} className="relative">
              <span aria-hidden className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-sun ring-4 ring-sun-soft" />
              <p className="text-xs uppercase tracking-[0.12em] text-ink/60">{when}</p>
              <p className="display mt-1 text-[1.1rem] text-ink">{name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{note}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
