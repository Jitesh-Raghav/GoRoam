/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { adventurePhoto, adventurePhotoSet } from "@/components/seo/adventure-card";
import { KindIcon } from "@/components/seo/adventure-kind";
import { FilterLink } from "@/components/seo/trip-filter";
import { Mountain } from "@/components/site/icons";
import { ScrollRow } from "@/components/site/scroll-row";
import { SectionHead } from "@/components/site/section-head";
import { KIND_LABEL, type Adventure, type AdventureKind } from "@/lib/adventures";

/** Eight tiles across a laptop, five and a half on tablets, two and a half on phones. */
const ITEM = "w-[38vw] max-w-[11rem] shrink-0 snap-start sm:w-[calc((100%-5*1.25rem)/5.5)] sm:max-w-none lg:w-[calc((100%-7*1.25rem)/8)]";

/**
 * Every kind of adventure as a small photo tile (its most popular guide's photo), with its
 * icon and how many guides it has. A tile jumps to the full list below with that kind picked;
 * without script it's a plain link to the list.
 */
export function KindRow({ kinds, className }: { kinds: { kind: AdventureKind; count: number; a: Adventure }[]; className?: string }) {
  return (
    <ScrollRow
      className={className}
      label="Kinds of adventure"
      head={<SectionHead kicker="By kind" title="How do you want to travel?" intro={`${kinds.length} kinds of adventure, from hitchhiking to horseback. Pick one to see its guides.`} />}
    >
      {kinds.map(({ kind, count, a }) => (
        <li key={kind} className={ITEM}>
          <FilterLink filter={kind} className="group block outline-none">
            <span className="relative isolate block aspect-[3/4] overflow-hidden rounded-card bg-paper-2 ring-offset-2 ring-offset-paper transition-[transform,box-shadow] duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-[0_20px_36px_-22px_rgb(14_31_59/0.6)] group-focus-visible:ring-2 group-focus-visible:ring-brand motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
              <Mountain className="absolute left-1/2 top-1/2 -z-10 size-6 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
              <img
                data-photo=""
                referrerPolicy="no-referrer"
                src={adventurePhoto(a.slug, 480)}
                srcSet={adventurePhotoSet(a.slug, undefined, [320, 480, 720])}
                sizes="(min-width: 1024px) 170px, (min-width: 640px) 18vw, 38vw"
                alt=""
                width={480}
                height={640}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05] motion-reduce:transition-none"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
              <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-brand shadow-[0_6px_16px_-8px_rgb(14_31_59/0.55)]">
                <KindIcon kind={kind} className="size-[18px]" />
              </span>
              <span className="absolute inset-x-3 bottom-3 text-paper">
                <span className="block text-[15px] font-medium leading-tight">{KIND_LABEL[kind]}</span>
                <span className="mt-0.5 block text-xs text-paper/75">
                  {count} {count === 1 ? "guide" : "guides"}
                </span>
              </span>
            </span>
          </FilterLink>
        </li>
      ))}
    </ScrollRow>
  );
}
