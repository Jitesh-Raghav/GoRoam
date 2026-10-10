"use client";

import { useEffect, useState } from "react";

/** `value`, once it has stopped changing for `ms`: for lookups driven by typing. */
export function useDebounced<T>(value: T, ms = 400): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return settled;
}
