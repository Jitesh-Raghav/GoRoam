import { AbsoluteFill } from "remotion";
import { useFormat } from "../format";
import { C } from "../theme";

/** The site's paper: cool white, a faint grid and the hairline "guide rails" either side. */
export function Backdrop({ warm = false }: { warm?: boolean }) {
  const { W, v } = useFormat();
  const rail = v(96, 40);
  return (
    <AbsoluteFill
      style={{
        background: warm ? `linear-gradient(180deg, #fbf3e6 0%, ${C.sunSoft} 55%, #f7efe2 100%)` : `linear-gradient(180deg, #f8fbfc 0%, ${C.paper} 50%, ${C.paper2} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: "center center",
          opacity: 0.45,
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />
      {[rail, W - rail].map((x) => (
        <div key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 1, background: "rgba(10,30,44,0.12)" }} />
      ))}
    </AbsoluteFill>
  );
}
