"use client";

import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";
import { Analytics } from "./analytics";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {/* Honour the OS "reduce motion" setting across every animation. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <Analytics />
    </SessionProvider>
  );
}
