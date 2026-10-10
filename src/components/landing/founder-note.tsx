/* eslint-disable @next/next/no-img-element -- a small local portrait, already sized */
import Link from "next/link";
import { ArrowRight, Mail, Twitter } from "@/components/site/icons";
import { Reveal } from "@/components/motion/reveal";
import { COMPANY, SOCIALS } from "@/lib/company";

/**
 * A short, signed note from the person behind GoRoam, in place of testimonials
 * until real traveller quotes come in: who built it, why, and how to reach him.
 */
export function FounderNote() {
  const founder = COMPANY.founder;
  const x = SOCIALS.find((s) => s.id === "x" && s.href);
  return (
    <section aria-labelledby="founder-note-title" className="container-x py-20 lg:py-28">
      <Reveal y={16} duration={0.9}>
        <div className="grid gap-10 rounded-panel bg-white p-7 shadow-card ring-1 ring-line sm:p-10 lg:grid-cols-12 lg:gap-16 lg:p-14">
          <div className="lg:col-span-4">
            <p id="founder-note-title" className="eyebrow text-brand">
              A note from the founder
            </p>
            <div className="mt-7 flex items-center gap-4">
              {founder.photo ? (
                <img src={founder.photo} alt={founder.name} width={64} height={64} className="size-16 rounded-full object-cover ring-1 ring-line" />
              ) : (
                <span aria-hidden className="display grid size-16 place-items-center rounded-full bg-ink text-xl text-paper">
                  {founder.initials}
                </span>
              )}
              <div>
                <p className="font-medium text-ink">{founder.name}</p>
                <p className="text-sm text-stone">Founder, GoRoam · Gurgaon, India</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-2 text-ink/80 transition-colors hover:text-brand">
                  <Mail className="size-4 text-brand" /> {COMPANY.email}
                </a>
              </li>
              {x && (
                <li>
                  <a href={x.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-ink/80 transition-colors hover:text-brand">
                    <Twitter className="size-4 text-brand" /> {x.handle} on X
                  </a>
                </li>
              )}
            </ul>
          </div>

          <figure className="lg:col-span-8">
            <blockquote>
              <p className="display text-[clamp(1.6rem,2.7vw,2.3rem)] leading-[1.2] tracking-[-0.025em] text-ink">
                &ldquo;I started GoRoam because planning a trip shouldn&apos;t take longer than <span className="accent">the trip itself.</span>&rdquo;
              </p>
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-stone sm:text-lg">
                Every plan uses real places, sensible timings and honest costs, and GoRoam gets better every week from what travellers tell me. If anything in
                your plan looks off, or you have an idea, write to me. I read every email myself.
              </p>
            </blockquote>
            <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <span className="text-sm text-stone">
                <span className="font-medium text-ink">{founder.name}</span>, {founder.role}
              </span>
              <Link href="/about" className="group inline-flex items-center gap-2 text-sm font-medium text-brand">
                Read our story
                <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
              </Link>
            </figcaption>
          </figure>
        </div>
      </Reveal>
    </section>
  );
}
