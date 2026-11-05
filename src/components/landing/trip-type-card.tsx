import { CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { QuietLink } from "@/components/site/quiet-link";
import type { UseCase } from "@/lib/use-cases";
import { cn } from "@/lib/utils";
import { TripPhoto } from "./trip-photo";

/** One kind of trip as a borderless card: a tall photo, then its name and one line about it. */
export function TripTypeCard({ u, className }: { u: UseCase; className?: string }) {
  return (
    <QuietLink href={`/plan/${u.slug}`} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, "aspect-[4/5]")}>
        <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]">
          <TripPhoto slug={u.slug} />
        </div>
      </div>
      <div className="mt-3.5 px-0.5">
        {/* Phones get the short name ("Friends"); wider cards the full one, which is also the link's words. */}
        <span className={cn(CARD_TITLE, "block text-[1.15rem] sm:hidden")}>{u.label}</span>
        <span className={cn(CARD_TITLE, "hidden sm:block")}>{u.h1.replace(/^./, (c) => c.toUpperCase())}</span>
        <span className={cn(CARD_META, "mt-1 line-clamp-2")}>{u.lede}</span>
      </div>
    </QuietLink>
  );
}
