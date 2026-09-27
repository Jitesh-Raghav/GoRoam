function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");

/** Linear blend of two hex colours (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number) {
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return `#${toHex(ar + (br - ar) * t)}${toHex(ag + (bg - ag) * t)}${toHex(ab + (bb - ab) * t)}`;
}

/** Evenly spaced atmospheric-perspective tones from haze (far) to ink (near). */
export function ramp(haze: string, ink: string, steps: number, curve = 1) {
  return Array.from({ length: steps }, (_, i) => mix(haze, ink, Math.pow((i + 1) / (steps + 1), curve)));
}
