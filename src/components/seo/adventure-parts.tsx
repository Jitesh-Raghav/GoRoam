/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import type { ReactNode } from "react";
import { adventurePhoto, adventurePhotoSet } from "@/components/seo/adventure-card";
import { Check, MapPin } from "@/components/site/icons";
import { GalleryOpen } from "@/components/trip/gallery";
import type { Sight } from "@/lib/adventure-sights";
import { DIFFICULTIES, daysText, usd, type Adventure, type Difficulty } from "@/lib/adventures";
import { cn } from "@/lib/utils";

// The visual pieces of an adventure page: its sights' photos, the at-a-glance meters, the
// route line, a photo break and the packing tiles. All server-rendered; the motion is CSS on
// scroll timelines (globals.css, "Adventure pages"), off for anyone who prefers less.

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** A sight's photo from the adventure's photo route, filling its frame. Hidden if it fails, so the frame's pin shows. */
function SightImg({ a, i, alt, sizes, widths, className }: { a: Adventure; i: number; alt: string; sizes: string; widths?: number[]; className?: string }) {
  return (
    <img
      data-photo=""
      referrerPolicy="no-referrer"
      src={adventurePhoto(a.slug, 720, i)}
      srcSet={adventurePhotoSet(a.slug, i, widths)}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("absolute inset-0 size-full object-cover", className)}
    />
  );
}

/** The pin a photo frame shows while its picture loads, or if there's none. */
const FramePin = () => <MapPin className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />;

const ZOOM = "transition-transform duration-700 ease-out-expo group-hover:scale-[1.04] motion-reduce:transition-none";

/** The first two sights beside the hero photo, on wide screens; each opens the photo viewer. */
export function HeroSights({ a, sights }: { a: Adventure; sights: Sight[] }) {
  return (
    <div className="hidden gap-3 lg:grid lg:grid-rows-2">
      {sights.slice(0, 2).map((s, i) => (
        <figure key={s.name} className="group relative isolate overflow-hidden rounded-panel bg-paper-2">
          <FramePin />
          <SightImg a={a} i={i} alt={`${s.name}, ${a.country}`} sizes="19rem" className={ZOOM} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <GalleryOpen index={i + 1} label={`Open the photo of ${s.name}`} />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-paper">
            <span className="font-mono text-[11px] text-paper/60">{pad(i)}</span>
            <span className="display mt-1 block text-xl leading-tight">{s.name}</span>
            <span className="mt-1 line-clamp-2 block text-sm text-paper/75">{s.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

const BIG_SIZES = "(min-width: 1280px) 560px, (min-width: 1024px) 600px, (min-width: 640px) 92vw, 78vw";
const SMALL_SIZES = "(min-width: 1280px) 280px, (min-width: 1024px) 300px, (min-width: 640px) 46vw, 78vw";

/**
 * "What you'll see": every sight as a photo, the first one large. An editorial mosaic from
 * tablets up; a row you swipe on phones. A photo opens the full-screen viewer at that sight.
 */
export function SightsMosaic({ a, sights }: { a: Adventure; sights: Sight[] }) {
  const four = sights.length === 4;
  return (
    <ul
      aria-label={`Sights on ${a.title}`}
      className="reveal no-scrollbar -mx-[clamp(1rem,4vw,3rem)] flex snap-x snap-mandatory scroll-px-[clamp(1rem,4vw,3rem)] gap-3 overflow-x-auto px-[clamp(1rem,4vw,3rem)] sm:mx-0 sm:grid sm:auto-rows-[13rem] sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3"
    >
      {sights.map((s, i) => {
        const big = i === 0;
        // With four sights the last one runs the full width of the mosaic; with five, two-thirds.
        const wide = i === 3 && (four ? "sm:col-span-2 xl:col-span-3" : "xl:col-span-2");
        return (
          <li
            key={s.name}
            className={cn(
              "group relative isolate aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-card bg-paper-2 sm:aspect-auto sm:w-auto",
              big && "sm:col-span-2 sm:row-span-2",
              wide
            )}
          >
            <FramePin />
            <SightImg a={a} i={i} alt={`${s.name}, ${a.country}`} sizes={big || wide ? BIG_SIZES : SMALL_SIZES} className={ZOOM} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
            <GalleryOpen index={i + 1} label={`Open the photo of ${s.name}`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-paper sm:p-6">
              <span className="font-mono text-[11px] text-paper/60">{pad(i)}</span>
              <h3 className={cn("display mt-1 leading-tight", big ? "text-2xl sm:text-[2rem]" : "text-xl")}>{s.name}</h3>
              <p className={cn("mt-1.5 text-paper/80", big ? "max-w-md text-[0.95rem] leading-relaxed" : "line-clamp-3 text-[13px] leading-snug")}>{s.note}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// What each level asks of you, across every kind of adventure.
const LEVEL_NOTE: Record<Difficulty, string> = {
  Easy: "Fine for a first adventure: no experience needed, and an easy pace.",
  Moderate: "Some long or rough days; reasonable fitness, but no special skills.",
  Challenging: "Long, tough days that need real fitness; some experience helps.",
  Hard: "Big altitude or steep climbs: go fit, go prepared, and be ready to turn back.",
};

/** The days meter runs to five weeks, a little past the longest adventure here. */
const WEEKS = 5;
const TIER_SHORT = ["Shoestring", "Mid-range", "Comfortable"];

/** One at-a-glance tile: what it measures, the figure, a meter, and a line on what it means. Its meters fill as it scrolls in. */
function Tile({ label, value, note, children }: { label: string; value: ReactNode; note: string; children: ReactNode }) {
  return (
    <div className="meters flex flex-col rounded-card bg-paper-2 p-5 sm:p-6">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-stone">{label}</p>
      <p className="display mt-2.5 text-[1.65rem] leading-none tracking-[-0.01em] text-ink">{value}</p>
      <div className="mt-5">{children}</div>
      <p className="mt-4 text-sm leading-relaxed text-stone">{note}</p>
    </div>
  );
}

/**
 * The adventure at a glance, drawn: how hard (four steps), how long (on a five-week scale:
 * the least it takes, then the comfortable stretch) and what a day costs at each budget.
 */
export function Glance({ a }: { a: Adventure }) {
  const level = DIFFICULTIES.indexOf(a.difficulty) + 1;
  const scale = WEEKS * 7;
  const [d0, d1] = a.days;
  const top = a.budget[2];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Tile label="Difficulty" value={a.difficulty} note={LEVEL_NOTE[a.difficulty]}>
        <div role="img" aria-label={`${a.difficulty}: level ${level} of ${DIFFICULTIES.length}`} className="grid grid-cols-4 gap-1">
          {DIFFICULTIES.map((d, i) => (
            <span key={d} className="h-2 overflow-hidden rounded-full bg-ink/10">
              {i < level && <span className="meter-fill block h-full rounded-full bg-ink" />}
            </span>
          ))}
        </div>
        <div aria-hidden className="mt-1.5 flex justify-between text-[10px] text-stone">
          <span>Easy</span>
          <span>Hard</span>
        </div>
      </Tile>

      <Tile label="Time needed" value={daysText(a)} note={d0 === d1 ? `Plan on ${d0} days.` : `${d0} days at a push; ${d1} to take it slower.`}>
        <div role="img" aria-label={`${daysText(a)}, on a scale of ${WEEKS} weeks`} className="relative h-2 overflow-hidden rounded-full bg-ink/10">
          {/* The comfortable stretch, then the least it takes over it, both from day 0. */}
          <span className="meter-fill absolute inset-y-0 left-0 rounded-full bg-ink/35" style={{ width: `${(d1 / scale) * 100}%` }} />
          <span className="meter-fill absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${(d0 / scale) * 100}%` }} />
          {/* A gap at each week. */}
          {Array.from({ length: WEEKS - 1 }, (_, w) => (
            <span key={w} className="absolute inset-y-0 w-0.5 bg-paper-2" style={{ left: `${((w + 1) / WEEKS) * 100}%` }} />
          ))}
        </div>
        <div aria-hidden className="relative mt-1.5 h-3 text-[10px] text-stone">
          <span className="absolute left-0">0</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${100 / WEEKS}%` }}>
            1 week
          </span>
          <span className="absolute right-0">{WEEKS} weeks</span>
        </div>
      </Tile>

      <Tile label="Daily budget" value={`From ${usd(a.budget[0])}`} note="Per person a day, in US dollars, before flights.">
        <dl className="space-y-2">
          {TIER_SHORT.map((tier, i) => (
            <div key={tier} className="grid grid-cols-[5.25rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 text-xs">
              <dt className="text-stone">{tier}</dt>
              <dd className="h-2 overflow-hidden rounded-full bg-ink/10">
                <span className="meter-fill block h-full rounded-full bg-ink" style={{ width: `${(a.budget[i] / top) * 100}%` }} />
              </dd>
              <dd className="text-right tabular-nums text-ink">
                {usd(a.budget[i])}
                {i === 2 && "+"}
              </dd>
            </div>
          ))}
        </dl>
      </Tile>
    </div>
  );
}

/**
 * The route, stage by stage, on a line that draws itself down to just past the middle of the
 * screen as you read; each numbered stop pops in as the line reaches it. The line is one
 * segment per gap between stops, so it starts and ends exactly on them.
 */
export function RouteLine({ route }: { route: Adventure["route"] }) {
  const last = route.length - 1;
  return (
    <ol>
      {route.map(([stage, detail], i) => (
        <li key={stage} className={cn("relative pl-12 sm:pl-14", i < last && "pb-10")}>
          {i < last && (
            <>
              <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-line" />
              <span aria-hidden className="route-draw absolute bottom-0 left-[15px] top-8 w-0.5 bg-brand" />
            </>
          )}
          <span aria-hidden className="dot-pop absolute left-0 top-0 grid size-8 place-items-center rounded-full bg-ink font-mono text-[11px] text-paper ring-4 ring-paper">
            {pad(i)}
          </span>
          <h3 className="pt-1 text-lg font-medium leading-snug text-ink">{stage}</h3>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-stone">{detail}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * A break between sections: a full-width photo of the last sight with the first tip from the
 * road over it, large. The photo drifts slower than the page.
 */
export function PhotoBreak({ a, sights }: { a: Adventure; sights: Sight[] }) {
  const i = sights.length - 1;
  const s = sights[i];
  const tip = a.tips[0];
  if (!s || !tip) return null;
  return (
    <figure className="photo-band relative isolate grid min-h-[22rem] items-end overflow-hidden rounded-panel bg-ink text-paper sm:min-h-[28rem]">
      <img
        data-photo=""
        referrerPolicy="no-referrer"
        src={adventurePhoto(a.slug, 1080, i)}
        srcSet={adventurePhotoSet(a.slug, i, [720, 1080, 1600])}
        sizes="(min-width: 1440px) 900px, (min-width: 1024px) 62vw, 100vw"
        alt={`${s.name}, ${a.country}`}
        loading="lazy"
        decoding="async"
        className="parallax-drift absolute inset-x-0 -top-[12%] -z-10 h-[124%] w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink/50" />
      <figcaption className="p-7 sm:p-12">
        <p className="eyebrow text-paper/70">From the road</p>
        <p className="display mt-4 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-0.015em]">{tip}</p>
        <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-paper/75">
          <MapPin className="duo-paper size-4" /> {s.name}, {a.country}
        </p>
      </figcaption>
    </figure>
  );
}

/** The packing list as tiles, each with a tick. */
export function PackingTiles({ gear }: { gear: string[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {gear.map((g) => (
        <li key={g} className="reveal flex items-start gap-3.5 rounded-2xl bg-paper-2 px-4 py-3.5 leading-relaxed text-ink">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-brand ring-1 ring-line">
            <Check className="size-3.5" />
          </span>
          {g}
        </li>
      ))}
    </ul>
  );
}
