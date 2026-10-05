import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSerif";
import { Easing } from "remotion";

/** GoRoam's "Lagoon & Golden Hour" tokens, as in src/app/globals.css. */
export const C = {
  paper: "#f4f8f9",
  paper2: "#e7f0f2",
  paper3: "#d4e4e8",
  ink: "#0a1e2c",
  ink2: "#133246",
  night: "#06131b",
  stone: "#54707f",
  stone2: "#8fa6b2",
  line: "rgba(10, 30, 44, 0.09)",
  brand: "#0b8278",
  brand2: "#34d1bf",
  brandSoft: "#d6f3ef",
  sun: "#f4a340",
  sun2: "#ffc876",
  sunSoft: "#fdebd2",
  white: "#ffffff",
  rose: "#f6b6c1",
  red: "#c2362b",
} as const;

const display = loadInstrument("normal", { weights: ["400"], subsets: ["latin"] });
loadInstrument("italic", { weights: ["400"], subsets: ["latin"] });
const serif = loadFraunces("normal", { weights: ["400", "600"], subsets: ["latin"] });
const sans = loadGeist("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const mono = loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const F = {
  display: display.fontFamily,
  serif: serif.fontFamily,
  sans: sans.fontFamily,
  mono: mono.fontFamily,
};

/** The site's own curves (--ease-out-expo, --ease-in-out-quart). */
export const E = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  inOutQuart: Easing.bezier(0.76, 0, 0.24, 1),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  inOutSine: Easing.bezier(0.37, 0, 0.63, 1),
};

export { FPS } from "./timeline";

/** Soft, layered card shadow used across the UI shots. */
export const SHADOW = "0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 6px rgba(10,30,44,0.06), 0 24px 60px -18px rgba(10,30,44,0.28)";
export const SHADOW_DARK = "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset";
