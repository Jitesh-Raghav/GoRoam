import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "ink" | "paper" | "brand" | "outline" | "glass";
type Size = "md" | "lg";

const base =
  "group/pill relative isolate inline-flex cursor-pointer shrink-0 items-center justify-center gap-3 overflow-hidden rounded-full font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow,transform] duration-500 ease-out-expo active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-paper hover:text-white shadow-[0_10px_30px_-12px_rgba(10,30,44,0.6)]",
  paper: "bg-paper text-ink hover:text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]",
  brand: "bg-brand text-white hover:text-white shadow-[0_14px_34px_-12px_rgba(11,130,120,0.65)]",
  outline: "bg-transparent text-ink ring-1 ring-inset ring-ink/15 hover:text-paper",
  glass: "bg-white/12 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md hover:text-ink",
};

const fills: Record<Variant, string> = {
  ink: "bg-brand",
  paper: "bg-ink",
  brand: "bg-ink",
  outline: "bg-ink",
  glass: "bg-paper",
};

/** Arrow colour: it sits on the fill circle, so it must contrast with the fill. */
const onFill: Record<Variant, string> = {
  ink: "text-white",
  paper: "text-paper",
  brand: "text-white",
  outline: "text-paper",
  glass: "text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-12 pl-6 pr-1.5 text-[0.95rem]",
  lg: "h-14 pl-7 pr-2 text-base",
};

const bubble: Record<Size, string> = {
  md: "size-9",
  lg: "size-10",
};


export function pillClasses(variant: Variant = "ink", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

/** Label + arrow bubble; on hover the bubble floods the whole pill. */
function PillInner({ children, variant, size, icon }: { children: ReactNode; variant: Variant; size: Size; icon?: ReactNode }) {
  return (
    <>
      <span className="relative">{children}</span>
      <span className={cn("relative grid place-items-center rounded-full", bubble[size], onFill[variant])}>
        {/* The fill lives inside the bubble, so it floods outward from wherever the bubble sits. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 rounded-full transition-transform duration-700 ease-out-expo group-hover/pill:scale-[26]",
            fills[variant]
          )}
        />
        {icon ?? <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover/pill:rotate-45" />}
      </span>
    </>
  );
}

export function PillLink({
  variant = "ink",
  size = "md",
  className,
  children,
  icon,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={pillClasses(variant, size, className)} {...props}>
      <PillInner variant={variant} size={size} icon={icon}>
        {children}
      </PillInner>
    </Link>
  );
}

export function PillButton({
  variant = "ink",
  size = "md",
  className,
  children,
  icon,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <button className={pillClasses(variant, size, className)} {...props}>
      <PillInner variant={variant} size={size} icon={icon}>
        {children}
      </PillInner>
    </button>
  );
}
