/**
 * GoRoam's copy doesn't use em dashes, and neither should anything the AI writes
 * for it. " — " reads naturally as a comma; a bare one becomes a hyphen.
 */
export function undashText(s: string) {
  return s.includes("—") ? s.replace(/\s+—\s+/g, ", ").replace(/—/g, "-") : s;
}

/** Every string inside a JSON-like value, undashed (objects and arrays are copied). */
export function undash<T>(value: T): T {
  if (typeof value === "string") return undashText(value) as T;
  if (Array.isArray(value)) return value.map(undash) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = undash(v);
    return out as T;
  }
  return value;
}

/** Prompt line for every model call that writes copy. */
export const NO_EM_DASH = "Never use em dashes (—); use commas, colons or full stops instead.";
