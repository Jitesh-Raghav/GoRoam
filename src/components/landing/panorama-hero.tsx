import { TripComposer } from "@/components/site/trip-composer";
import { PanoramaLandscape, PanoramaSky } from "./panorama";

/**
 * The home page's first screen: the headline, the trip box, and the illustrated
 * panorama of world wonders, held still. Everything here appears with CSS on the
 * first paint (`.hero-rise`), so nothing waits for JavaScript to show.
 */
export function PanoramaHero() {
  return (
    <section id="top" aria-label="Plan your next trip" className="pano-still cv-block relative isolate flex min-h-[100svh] [contain-intrinsic-size:auto_100svh] flex-col overflow-hidden bg-[#4a69c7] lg:h-[100svh] lg:min-h-[46.25rem]">
      <div className="absolute inset-0 -z-20">
        <PanoramaSky className="size-full" />
      </div>

      <div className="container-x relative z-10 pb-[36svh] pt-32 text-center sm:pt-40 lg:pb-0 lg:pt-[clamp(9rem,19vh,12rem)]">
        <h1 className="hero-rise display mx-auto max-w-[13ch] text-[clamp(2.7rem,7vw,5rem)] leading-[1] tracking-[-0.035em] text-paper [&_.accent]:!text-sun-2 [@media(min-width:1024px)_and_(max-height:860px)]:text-[4.3rem]">
          <span className="block">Where will you</span>
          <span className="block">
            <span className="accent">wander</span> next?
          </span>
        </h1>

        <p className="hero-rise mx-auto mt-4 max-w-[36rem] text-base leading-relaxed text-paper/85 [animation-delay:80ms] sm:text-lg">
          Describe the trip you&apos;re dreaming of. GoRoam turns it into a day-by-day plan: real places, honest budgets and stays ready to book.
        </p>

        <div className="hero-rise mt-7 [animation-delay:160ms]">
          <TripComposer />
        </div>
      </div>

      {/* The panorama. Wider than the screen on phones, where it's centred. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[max(42svh,calc(100vw*0.3167))] overflow-hidden">
        <div className="pano-track relative h-full w-[max(100%,calc(42svh*3.158))] lg:w-full">
          <PanoramaLandscape intro className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
