import { useVideoConfig } from "remotion";

/**
 * Layout for the current aspect ratio. Every scene is composed for both 16:9 and
 * 9:16 rather than cropped; vertical keeps content clear of the platform UI
 * (handle and caption at the top, actions and description at the bottom).
 */
export function useFormat() {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return {
    W: width,
    H: height,
    vertical,
    cx: width / 2,
    cy: height / 2,
    /** Content-safe insets. */
    safe: vertical ? { top: 250, bottom: 560, x: 72 } : { top: 90, bottom: 90, x: 120 },
    /** Pick a value per format. */
    v: <T,>(landscape: T, portrait: T) => (vertical ? portrait : landscape),
  };
}

export type Format = ReturnType<typeof useFormat>;
