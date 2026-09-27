import { Marquee } from "@/components/motion/marquee";
import { ScrollWords } from "@/components/motion/scroll-words";
import { MANIFESTO } from "@/lib/copy";

const PLACES = ["Kyoto", "Santorini", "Machu Picchu", "Marrakech", "Reykjavík", "Rio de Janeiro", "Udaipur", "Cape Town", "Bali", "Petra", "Queenstown", "Lisbon", "Havana", "Paris"];

const SNIPPETS = [
  "Day 01 · Morning · Fushimi Inari Taisha · Free",
  "Day 02 · Evening · Sunset from Oia · $0",
  "Day 03 · Afternoon · Vatican Museums · $24",
  "Day 01 · Morning · Taj Mahal at sunrise · $13",
  "Day 04 · Evening · Pontocho Alley supper · $60",
  "Day 02 · Morning · First bus to Machu Picchu · $24",
];

export function Ticker() {
  return (
    <section aria-label="Destinations people plan with GoRoam" className="relative overflow-hidden border-y border-line bg-paper py-10 sm:py-14">
      <Marquee duration={60}>
        {PLACES.map((p, i) => (
          <span key={p} className="flex items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
            <span
              className={
                i % 2
                  ? "display text-[clamp(3rem,7.5vw,7rem)] italic leading-none text-transparent [-webkit-text-stroke:1.2px_var(--ink)]"
                  : "display text-[clamp(3rem,7.5vw,7rem)] leading-none text-ink"
              }
            >
              {p}
            </span>
            <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-brand sm:size-8" aria-hidden>
              <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </Marquee>
      <Marquee duration={45} reverse className="mt-8">
        {SNIPPETS.map((s) => (
          <span key={s} className="eyebrow flex items-center gap-6 pr-6 text-stone">
            {s}
            <span className="size-1 rounded-full bg-ink/25" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/** On small screens the manifesto gets its own section (desktop shows it inside the hero). */
export function MobileManifesto() {
  return (
    <section className="container-x py-24 lg:hidden">
      <p className="eyebrow mb-8 text-stone">(01) — Why GoRoam</p>
      <ScrollWords tokens={[MANIFESTO]} className="display text-[clamp(2.2rem,8vw,3.2rem)] leading-[1.06] text-ink" />
    </section>
  );
}
