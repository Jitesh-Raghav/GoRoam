/**
 * First-visit curtain. Pure CSS so it never blocks on JavaScript: the inline
 * script marks returning visitors (same session) before first paint, and CSS
 * hides the curtain for them and for reduced-motion users.
 */
const markSeen = `try{if(sessionStorage.getItem("goroam:intro")){document.documentElement.dataset.intro="done"}else{sessionStorage.setItem("goroam:intro","1")}}catch(e){document.documentElement.dataset.intro="done"}`;

export function Intro() {
  const letters = "GoRoam".split("");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: markSeen }} />
      <div
        aria-hidden
        className="intro-curtain fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-paper after:absolute after:inset-x-[-10%] after:bottom-[-90px] after:h-[180px] after:rounded-b-[50%] after:bg-ink"
      >
        <div className="flex overflow-hidden pb-[0.12em]">
          {letters.map((l, i) => (
            <span key={i} className="intro-word display inline-block text-[clamp(3.82rem,11.9vw,10.2rem)]" style={{ animationDelay: `${0.08 + i * 0.05}s` }}>
              {l}
            </span>
          ))}
        </div>
        <div className="mt-8 flex w-[min(320px,70vw)] flex-col items-center gap-3">
          <div className="h-px w-full overflow-hidden bg-paper/15">
            <div className="intro-bar h-full w-full bg-brand" />
          </div>
          <p className="eyebrow text-paper/60">Planning the extraordinary</p>
        </div>
      </div>
    </>
  );
}
