"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { tokenKey } from "./squad-join";

/** The match percentage, counting up as the card lands. */
export function CountUp({ to, suffix = "%" }: { to: number; suffix?: string }) {
  const v = useMotionValue(0);
  const shown = useTransform(v, (n) => `${Math.round(n)}${suffix}`);
  useEffect(() => {
    const a = animate(v, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 });
    return () => a.stop();
  }, [to, v]);
  return <motion.span>{shown}</motion.span>;
}

/** Re-reads the squad every few seconds for ten minutes, so the match updates as friends join. */
export function LiveRefresh({ every = 8000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started > 10 * 60 * 1000) clearInterval(id);
      else if (document.visibilityState === "visible") router.refresh();
    }, every);
    return () => clearInterval(id);
  }, [router, every]);
  return null;
}

/** Shows its children only to people who haven't added their answers on this device yet. */
export function IfNotJoined({ code, children }: { code: string; children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(tokenKey(code)));
    } catch {
      setShow(true);
    }
  }, [code]);
  return show ? <>{children}</> : null;
}

export function PlanLink({ href, people, className, children }: { href: string; people: number; className?: string; children: ReactNode }) {
  return (
    <Link href={href} onClick={() => track("squad_planned", { people })} className={className}>
      {children}
    </Link>
  );
}

/** Lands the reveal: rises and settles. */
export function Rise({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}
