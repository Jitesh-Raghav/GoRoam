"use client";

/* eslint-disable @next/next/no-img-element -- a local data: URI, nothing to optimise. */

import { useMemo } from "react";
import { avatarFor, avatarUri, type AvatarChoice } from "@/lib/avatars";
import { cn } from "@/lib/utils";

/** The traveller's GoRoam avatar. Pass the session user, or an explicit `choice` (the picker's previews). */
export function UserAvatar({
  user,
  choice,
  className,
}: {
  user?: { image?: string | null; email?: string | null; name?: string | null } | null;
  choice?: AvatarChoice;
  className?: string;
}) {
  const resolved = choice ?? avatarFor(user?.image, user?.email ?? user?.name);
  const src = useMemo(() => avatarUri(resolved), [resolved.style, resolved.seed]); // eslint-disable-line react-hooks/exhaustive-deps
  return <img src={src} alt="" draggable={false} className={cn("rounded-full bg-brand-soft object-cover", className)} />;
}
