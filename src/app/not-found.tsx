import { Scene } from "@/components/scenes/scene";
import { Logo } from "@/components/site/logo";
import { PillLink } from "@/components/site/pill";

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0">
        <Scene id="dunes" intro interactive />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
      <div className="relative flex flex-col p-6 sm:p-10">
        <div className="rounded-full bg-paper/90 px-4 py-2 backdrop-blur self-start">
          <Logo />
        </div>
        <div className="mt-auto max-w-2xl pb-6">
          <p className="eyebrow text-paper/70">404 · 0.0000° N, 0.0000° E</p>
          <h1 className="display mt-4 text-[clamp(3.4rem,9vw,8rem)] leading-[0.88]">
            Off the <span className="italic text-brand-2">map.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-paper/75">
            Even the best explorers take a wrong turn. This page doesn&apos;t exist, but your next adventure does.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/" variant="paper">
              Back to home
            </PillLink>
            <PillLink href="/dashboard" variant="glass">
              Plan a trip
            </PillLink>
          </div>
        </div>
      </div>
    </main>
  );
}
