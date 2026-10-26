import { Banknote, Car, Clock3, Droplets, HandCoins, Languages, Plug, Siren, Wifi } from "@/components/site/icons";
import { utcOffset, type CountryFacts } from "@/lib/country-facts";
import { cn } from "@/lib/utils";
import { LocalTime } from "./local-time";

function Tile({ icon: Icon, label, children, className }: { icon: typeof Plug; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col rounded-card bg-white p-5 ring-1 ring-line", className)}>
      <dt className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-stone">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-4" />
        </span>
        {label}
      </dt>
      <dd className="mt-3 leading-snug text-ink">{children}</dd>
    </div>
  );
}

/** Know before you go: money, words, plugs, the time, who to call, the roads, tipping, water and data. */
export function Essentials({ facts, place }: { facts: CountryFacts; place: string }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {facts.phrases && (
        <div className="relative overflow-hidden rounded-card bg-[linear-gradient(150deg,var(--ink),var(--ink-2))] p-5 text-paper sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand/40 blur-3xl" />
          <dt className="relative flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-paper/60">
            <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-sun-2">
              <Languages className="size-4" />
            </span>
            Say it like a local
          </dt>
          <dd className="relative mt-5 space-y-5">
            <p>
              <span className="block text-xs text-paper/55">Hello</span>
              <span className="display mt-1 block text-[1.6rem] leading-tight">{facts.phrases[0]}</span>
            </p>
            <p>
              <span className="block text-xs text-paper/55">Thank you</span>
              <span className="display mt-1 block text-[1.6rem] leading-tight">{facts.phrases[1]}</span>
            </p>
            <p className="border-t border-white/10 pt-4 text-sm text-paper/70">Spoken here: {facts.language}</p>
          </dd>
        </div>
      )}
      <Tile icon={Banknote} label="Money">
        {facts.currency}
      </Tile>
      <Tile icon={Clock3} label="Time zone">
        {utcOffset(facts.zone)}
        <LocalTime zone={facts.zone} place={place} />
      </Tile>
      <Tile icon={Plug} label="Plugs">
        {facts.plugs}
      </Tile>
      <Tile icon={Siren} label="Emergency">
        {facts.emergency}
      </Tile>
      {!facts.phrases && (
        <Tile icon={Languages} label="Language">
          {facts.language}
        </Tile>
      )}
      <Tile icon={Car} label="Driving">
        Drive on the {facts.drive}
      </Tile>
      <Tile icon={HandCoins} label="Tipping">
        <span className="text-[0.95rem] text-ink/85">{facts.tipping}</span>
      </Tile>
      <Tile icon={Droplets} label="Tap water">
        <span className="text-[0.95rem] text-ink/85">{facts.water}</span>
      </Tile>
      <Tile icon={Wifi} label="Getting online" className={facts.phrases ? "sm:col-span-2 lg:col-span-3" : "sm:col-span-2 lg:col-span-1"}>
        <span className="text-[0.95rem] text-ink/85">{facts.sim}</span>
      </Tile>
    </dl>
  );
}
