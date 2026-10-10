"use client";

import { useMoney } from "@/lib/money";

/** A USD amount in the visitor's currency, for server-rendered pages ("$1,200" until rates load). */
export function Price({ usd }: { usd: number }) {
  return <>{useMoney().fmt(usd)}</>;
}
