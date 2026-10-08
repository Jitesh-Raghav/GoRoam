"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Compass, CreditCard, LogOut, Luggage, Map as MapIcon, Plane, Plus, Settings, X, Menu } from "@/components/site/icons";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { UserAvatar } from "@/components/site/user-avatar";
import { Scene } from "@/components/scenes/scene";
import { prefetchJson } from "@/lib/cached-json";
import { getLenis } from "@/components/motion/smooth-scroll";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Create a context for credit management

interface CreditContextType {
  credits: number;
  /** False until the balance has been fetched, so 0 isn't mistaken for "out of credits". */
  creditsLoaded: boolean;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | null>(null);

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredits must be used within a DashboardLayout");
  }
  return context;
};

/** Data a page needs, fetched ahead when its link is hovered so it opens ready. */
const PAGE_DATA: Record<string, string> = {
  "/dashboard/itineraries": "/api/itineraries",
  "/dashboard/book": "/api/itineraries",
};

const NAV = [
  { icon: Compass, label: "Plan a trip", href: "/dashboard" },
  { icon: MapIcon, label: "My itineraries", href: "/dashboard/itineraries" },
  { icon: Luggage, label: "Travel packages", href: "/dashboard/packages" },
  { icon: Plane, label: "Book travel", href: "/dashboard/book" },
  { icon: CreditCard, label: "Credits", href: "/dashboard/credits" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

function SidebarContent({ credits, onNavigate, onClose }: { credits: number; onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const warm = (href: string) => {
    router.prefetch(href);
    if (PAGE_DATA[href]) prefetchJson(PAGE_DATA[href]);
  };
  const { data: session } = useSession();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
  const inItinerary = pathname.startsWith("/dashboard/itinerary/");

  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-20 shrink-0 items-center justify-between gap-3 px-6">
        <Logo />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="shrink-0 px-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex h-12 items-center justify-between rounded-2xl bg-ink pl-4 pr-2 text-sm font-medium text-paper transition-colors hover:bg-brand"
        >
          New trip
          <span className="grid size-8 place-items-center rounded-xl bg-paper/10 transition-transform duration-500 ease-out-expo group-hover:rotate-90">
            <Plus className="size-4" />
          </span>
        </Link>
      </div>

      <nav aria-label="Dashboard" className="mt-6 shrink-0 space-y-1 px-4">
        <p className="eyebrow px-3 pb-2 text-[0.62rem] text-stone-2">Menu</p>
        {NAV.map((item) => {
          const active = isActive(item.href) || (item.href === "/dashboard/itineraries" && inItinerary);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              onMouseEnter={() => warm(item.href)}
              onFocus={() => warm(item.href)}
              onTouchStart={() => warm(item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition-colors",
                active ? "text-ink" : "text-ink/60 hover:text-ink"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_8px_24px_-16px_rgba(10,30,44,0.4)] ring-1 ring-line"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <item.icon className={cn("relative size-[18px]", active && "text-brand")} />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 p-4 pt-6">
        <Link
          href="/dashboard/credits"
          onClick={onNavigate}
          className="group relative block overflow-hidden rounded-3xl bg-ink p-5 text-paper"
        >
          <div className="absolute inset-0 opacity-60 transition-opacity duration-700 group-hover:opacity-80">
            <Scene id="peaks" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
          <div className="relative">
            <p className="eyebrow text-[0.62rem] text-paper/60">Credits left</p>
            <p className="display mt-2 text-4xl leading-none">{credits}</p>
            <p className="mt-2 text-xs text-paper/60">1 credit = 1 itinerary</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1.5 text-xs ring-1 ring-inset ring-paper/15 backdrop-blur transition-colors group-hover:bg-paper group-hover:text-ink">
              <Plus className="size-3.5" /> Top up
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 rounded-2xl p-2">
          <UserAvatar user={session?.user} className="size-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{session?.user?.name || "Traveller"}</p>
            <p className="truncate text-xs text-stone">{session?.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
            title="Sign out"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink hover:text-paper"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShellLoading() {
  return (
    <div className="grid min-h-svh place-items-center bg-paper">
      <div className="flex flex-col items-center gap-5">
        <div className="relative size-14">
          <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand/30" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-ink">
            <Compass className="size-6 animate-spin text-paper [animation-duration:2.4s]" />
          </span>
        </div>
        <p className="eyebrow text-stone">Unpacking your dashboard</p>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState(0); // Start with 0, will be fetched from API
  const [creditsLoaded, setCreditsLoaded] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Function to fetch user credits
  const fetchCredits = useCallback(async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch("/api/user/credits");
        const data = await response.json();
        if (data.success) {
          setCredits(data.credits);
          setCreditsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
      }
    }
  }, [session?.user?.email]);

  // Fetch user credits on mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Signed-out visitors go to sign in, then come straight back here.
  useEffect(() => {
    if (status !== "unauthenticated") return;
    const here = `${window.location.pathname}${window.location.search}`;
    router.replace(`/auth?callbackUrl=${encodeURIComponent(here)}`);
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // While the drawer is open the page behind it stays put, and Escape closes it.
  useEffect(() => {
    if (!sidebarOpen) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      html.style.overflow = prev;
      getLenis()?.start();
      window.removeEventListener("keydown", esc);
    };
  }, [sidebarOpen]);

  // Once signed in, fetch the trips list in idle time so "My itineraries" opens with it ready.
  const signedIn = status === "authenticated";
  useEffect(() => {
    if (!signedIn) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => prefetchJson("/api/itineraries"));
    return () => cancel(id);
  }, [signedIn]);

  if (status !== "authenticated" || !session) {
    return <ShellLoading />;
  }

  return (
    <CreditContext.Provider value={{ credits, creditsLoaded, refreshCredits: fetchCredits }}>
      <div className="min-h-svh bg-paper lg:flex">
        {/* Desktop sidebar */}
        <aside className="no-print sticky top-0 hidden h-svh w-72 shrink-0 border-r border-line bg-paper-2/50 lg:block">
          <SidebarContent credits={credits} />
        </aside>

        {/* Mobile top bar */}
        <header className="no-print sticky top-0 z-30 border-b border-line bg-paper/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-3 min-[400px]:px-4">
            <Logo />
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/dashboard/credits" aria-label={`${credits} credits`} className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1.5 text-sm text-ink">
                <CreditCard className="size-3.5 text-brand" />
                {credits}
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                className="grid size-10 place-items-center rounded-full bg-ink text-paper"
              >
                <Menu className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 40 }}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="fixed left-0 top-0 z-50 h-[100dvh] w-full bg-paper pt-[env(safe-area-inset-top)] shadow-2xl min-[400px]:w-[86vw] min-[400px]:max-w-sm lg:hidden"
              >
                <SidebarContent credits={credits} onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="min-w-0 flex-1">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="px-3 py-6 min-[400px]:px-4 min-[400px]:py-8 sm:px-8 lg:px-12 lg:py-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </CreditContext.Provider>
  );
}
