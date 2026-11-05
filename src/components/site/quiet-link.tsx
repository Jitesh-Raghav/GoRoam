"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * A link for long lists and grids. Next.js prefetches every link as it scrolls into view,
 * so a page of a hundred cards would fetch a hundred pages while you scroll; this one
 * prefetches only when a pointer, finger or keyboard heads for it, which still lands
 * before the click.
 */
export function QuietLink({ href, onPointerEnter, onTouchStart, onFocus, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const warm = () => {
    if (typeof href === "string") router.prefetch(href);
  };
  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(e) => {
        warm();
        onPointerEnter?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      {...props}
    />
  );
}
