import type { ReactNode } from "react";
import { Banknote, Car, Clock3, Droplets, HandCoins, Plug, Siren, Wifi } from "@/components/site/icons";
import { utcOffset, type CountryFacts } from "@/lib/country-facts";
import { LocalTime } from "./local-time";

/** The numbers in "191 police, 1669 ambulance" set large in mono, so they can be found at a glance. */
function Numbers({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d{2,5})/).map((part, i) =>
        /^\d{2,5}$/.test(part) ? (
          <span key={i} className="font-mono text-[1.2rem] tracking-tight text-ink">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/**
 * Know before you go: the local words on one side, and the practical facts on the
 * other as a ruled sheet, like the data page of a passport.
 */
export function Essentials({ facts, place }: { facts: CountryFacts; place: string }) {
  const rows: { icon: typeof Plug; k: string; v: ReactNode }[] = [
    { icon: Banknote, k: "Money", v: facts.currency },
    {
      icon: Clock3,
      k: "Time",
      v: (
        <>
          <span className="font-mono text-[1.05rem] text-ink">{utcOffset(facts.zone)}</span>
          <LocalTime zone={facts.zone} place={place} />
        </>
      ),
    },
    { icon: Plug, k: "Plugs", v: <span className="font-mono text-[0.95rem] text-ink">{facts.plugs}</span> },
    { icon: Siren, k: "Emergency", v: <Numbers text={facts.emergency} /> },
    { icon: Car, k: "Driving", v: `On the ${facts.drive}` },
    { icon: HandCoins, k: "Tipping", v: facts.tipping },
    { icon: Droplets, k: "Tap water", v: facts.water },
    { icon: Wifi, k: "Getting online", v: facts.sim },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <div className="flex flex-col rounded-panel bg-ink p-7 text-paper sm:p-8 lg:self-start">
        {facts.phrases ? (
          <>
            <p className="text-sm text-paper/60">Say it like a local</p>
            <div className="mt-8 space-y-7">
              {(["Hello", "Thank you"] as const).map((label, i) => (
                <div key={label}>
                  <p className="text-xs text-paper/50">{label}</p>
                  <p className="display mt-1.5 text-[clamp(1.9rem,3.6vw,2.5rem)] leading-[1.05] tracking-[-0.015em]">{facts.phrases![i]}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-paper/60">The language</p>
            <p className="display mt-8 text-[clamp(1.9rem,3.6vw,2.5rem)] leading-[1.05] tracking-[-0.015em]">{facts.language}</p>
          </>
        )}
        <p className="mt-10 border-t border-white/15 pt-4 text-sm leading-relaxed text-paper/70">
          {facts.phrases ? `Spoken here: ${facts.language}` : `Signs and menus in ${place} are in ${facts.language.split(/,| and | \(/)[0]}.`}
        </p>
      </div>

      <dl className="divide-y divide-line border-y border-line">
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <dt className="flex items-start gap-2 pt-0.5 text-sm text-stone">
              <r.icon className="mt-0.5 size-4 shrink-0 text-stone-2" />
              {r.k}
            </dt>
            <dd className="leading-relaxed text-ink/85">{r.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
