"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "@/components/site/icons";
import { useEffect, useState } from "react";

/**
 * Registers the offline service worker (production only) and shows a quiet
 * banner while there's no connection, so travellers know they're seeing the
 * saved copy of their trip.
 */
export function OfflineSupport() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          key="offline"
          role="status"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="no-print fixed left-1/2 top-3 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs text-paper shadow-xl"
        >
          <WifiOff className="size-3.5 text-sun-2" /> You&apos;re offline. Showing the trips saved on this device.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
