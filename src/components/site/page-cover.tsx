/* eslint-disable @next/next/no-img-element -- our own photo routes (or a stored CDN photo), already sized */
import type { ReactNode } from "react";
import { ArrowRight, Mountain } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { cn } from "@/lib/utils";

export interface CoverPhoto {
  src: string;
  srcSet?: string;
  href: string;
  /** The place's name, shown on the photo and used for its link. */
  label: string;
}

/**
 * The top of an index page (trips, guides, itineraries, hubs): the words on the left and a
 * three-photo mosaic of real places on the right, each photo a way in. Phones stack the
 * words over a mosaic of the same photos. Server-rendered; the lead photo loads first.
 */
export function PageCover({
  eyebrow,
  title,
  lede,
  stats = [],
  links = [],
  photos,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  stats?: { value: string; label: string }[];
  links?: { href: string; label: string }[];
  photos: CoverPhoto[];
  children?: ReactNode;
  className?: string;
}) {
  const [lead, ...rest] = photos.slice(0, 3);
  return (
    <section className={cn("grid items-end gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14", className)}>
      <div className="min-w-0 lg:pb-2">
        <p className="eyebrow text-brand">{eyebrow}</p>
        <h1 className="display mt-5 text-[clamp(2.5rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.035em] text-ink">{title}</h1>
        <div className="mt-6 max-w-xl text-lg leading-relaxed text-stone">{lede}</div>
        {stats.length > 0 && (
          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-x-5 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="display block text-[1.65rem] leading-none tabular-nums text-ink sm:text-[2rem]">{s.value}</span>
                  <span className="mt-1.5 block text-xs leading-snug text-stone sm:text-sm">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
        {links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <QuietLink href={l.href} className="group inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
                  {l.label}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </QuietLink>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>

      {lead && (
        <div className="grid h-[22rem] grid-cols-2 grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 sm:h-[28rem] lg:h-[34rem] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:grid-rows-2">
          {[lead, ...rest].map((p, i) => (
            <QuietLink
              key={p.href + i}
              href={p.href}
              className={cn("group relative isolate overflow-hidden rounded-[1.5rem] bg-paper-2 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper", i === 0 && "col-span-2 lg:col-span-1 lg:row-span-2")}
            >
              <Mountain className="absolute left-1/2 top-1/2 -z-10 size-8 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
              <img
                src={p.src}
                srcSet={p.srcSet}
                sizes={i === 0 ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-[0_6px_16px_-10px_rgb(14_31_59/0.6)]">{p.label}</span>
            </QuietLink>
          ))}
        </div>
      )}
    </section>
  );
}
