"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useSession } from "next-auth/react";
import { ArrowRight } from "@/components/site/icons";
import { UserAvatar } from "./user-avatar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Scene } from "@/components/scenes/scene";
import { Logo } from "./logo";
import { PillLink } from "./pill";
import { useIntro } from "./use-intro";

const LINKS = [
  { href: "/itineraries", label: "Trips" },
  { href: "/destinations", label: "Guides" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const { data: session } = useSession();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const intro = useIntro();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (y < 480) setHidden(false);
    else if (y > prev + 1) setHidden(true);
    else if (y < prev - 1) setHidden(false);
  });

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={intro.ready ? { y: hidden && !open ? -110 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: intro.ready && !scrolled ? intro.delay + 0.2 : 0 }}
        className="fixed inset-x-0 top-0 z-50 no-print"
      >
        <div
          className={cn(
            "transition-[background-color,box-shadow,backdrop-filter] duration-500",
            scrolled && !open ? "bg-paper/85 shadow-[0_1px_0_rgba(10,28,39,0.08)] backdrop-blur-md" : "bg-transparent"
          )}
        >
          <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
            <Logo />

            <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group relative py-2 text-[0.94rem] font-medium text-ink/70 transition-colors duration-300 hover:text-ink"
                >
                  {l.label}
                  <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {session ? (
                <>
                  <PillLink href="/dashboard" size="md" className="hidden sm:inline-flex">
                    Dashboard
                  </PillLink>
                  <Link href="/dashboard/settings" aria-label="Your account" className="hidden sm:block">
                    <UserAvatar user={session.user} className="size-10 ring-2 ring-paper" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="hidden rounded-full px-3 py-2 text-[0.94rem] font-medium text-ink/75 transition-colors duration-300 hover:text-ink sm:inline-flex"
                  >
                    Sign in
                  </Link>
                  <PillLink href="/dashboard" size="md" className="hidden sm:inline-flex">
                    Plan a trip
                  </PillLink>
                </>
              )}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative grid size-11 place-items-center rounded-full bg-ink text-paper lg:hidden"
              >
                <span className={cn("absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-out-expo", open ? "rotate-45" : "-translate-y-[3px]")} />
                <span className={cn("absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-out-expo", open ? "-rotate-45" : "translate-y-[3px]")} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            data-lenis-prevent
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-paper pt-[72px] lg:hidden"
          >
            <nav aria-label="Mobile" className="container-x flex flex-col gap-1 pt-8">
              {[...LINKS, { href: session ? "/dashboard" : "/auth", label: session ? "Dashboard" : "Sign in" }].map((l, i) => (
                <div key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.06 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-line py-4"
                    >
                      <span className="display text-[2rem] leading-none">{l.label}</span>
                      <ArrowRight aria-hidden className="size-5 text-stone" />
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <div className="container-x mt-8">
              <PillLink href="/dashboard" variant="brand" size="lg" onClick={() => setOpen(false)} className="w-full justify-between">
                Plan a trip
              </PillLink>
            </div>
            <div className="relative mt-auto h-56 w-full overflow-hidden">
              <Scene id="santorini" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
