import { GuideCover } from "@/components/seo/guide-media";
import { MapPin, Users } from "@/components/site/icons";
import { TripComposer } from "@/components/site/trip-composer";
import { cn } from "@/lib/utils";
import { CREW } from "./crew";

const POSTCARDS = [
  { place: "Goa", destination: "Goa, India", landscape: "coast" as const, tilt: "-rotate-6", pos: "left-0 top-6" },
  { place: "Manali", destination: "Manali, India", landscape: "mountains" as const, tilt: "rotate-3", pos: "right-0 top-0" },
  { place: "Thailand", destination: "Phuket, Thailand", landscape: "coast" as const, tilt: "rotate-6", pos: "left-6 bottom-0" },
  { place: "Bali", destination: "Bali, Indonesia", landscape: "forest" as const, tilt: "-rotate-3", pos: "right-4 bottom-8" },
];


/** Round initials in a row, overlapping like a group chat. */
export function AvatarStack({ size = "size-9", className }: { size?: string; className?: string }) {
  return (
    <span className={cn("flex -space-x-2.5", className)}>
      {CREW.map((c) => (
        <span key={c.name} title={c.name} className={cn("grid place-items-center rounded-full text-xs font-semibold text-ink ring-2 ring-white", size, c.tone)}>
          {c.name[0]}
        </span>
      ))}
    </span>
  );
}

/** The friends page hero: the search phrase and the composer, beside a scatter of trip postcards. */
export function GroupHero({ lede, prompt }: { lede: string; prompt: string }) {
  return (
    <header className="relative overflow-hidden rounded-panel bg-[linear-gradient(150deg,#1B2C66_0%,#3550B0_45%,#7C9BEA_100%)] px-5 pb-10 pt-10 text-paper sm:px-10 sm:pb-14 sm:pt-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_30%_40%,#000_25%,transparent_75%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-sun-2/25 blur-3xl" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full bg-white/12 py-1.5 pl-1.5 pr-4 ring-1 ring-white/20 backdrop-blur">
            <AvatarStack size="size-7" />
            <span className="text-sm text-paper/90">5 friends, one plan</span>
          </div>
          <h1 className="display mt-6 text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.03em] [&_.accent]:!text-sun-2">
            Group trip planner <span className="accent">for friends</span>
          </h1>
          <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-paper/80 sm:text-lg">{lede}</p>
          <ul className="mt-5 flex flex-wrap gap-2 text-sm">
            {["Vote on every stop", "Split costs fairly", "Plans on WhatsApp", "Budget per head"].map((x) => (
              <li key={x} className="rounded-full bg-white/10 px-3 py-1 text-paper/85 ring-1 ring-white/15">
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 text-left">
            <TripComposer seed={prompt} />
          </div>
        </div>

        {/* Postcards from trips friends love. */}
        <div aria-hidden className="relative mx-auto hidden h-[30rem] w-full max-w-[28rem] lg:block">
          {POSTCARDS.map((p) => (
            <div key={p.place} className={cn("absolute w-56 rounded-[20px] bg-white p-2 shadow-[0_30px_60px_-25px_rgba(10,20,50,0.6)] transition-transform duration-500 hover:z-10 hover:rotate-0 hover:scale-105", p.tilt, p.pos)}>
              <GuideCover destination={p.destination} landscape={p.landscape} width={500} credit={false} className="h-36 rounded-[14px]" />
              <p className="flex items-center gap-1.5 px-1.5 pb-1 pt-2 text-sm text-ink">
                <MapPin className="size-3.5 text-brand" /> {p.place}
              </p>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-ink/85 px-4 py-3 text-paper shadow-2xl ring-1 ring-white/15 backdrop-blur">
            <p className="flex items-center gap-2 text-xs text-paper/70">
              <Users className="size-4 text-sun-2" /> Group vote
            </p>
            <p className="mt-1 text-sm">Goa wins, 4 votes to 1 🏖️</p>
          </div>
        </div>
      </div>
    </header>
  );
}
