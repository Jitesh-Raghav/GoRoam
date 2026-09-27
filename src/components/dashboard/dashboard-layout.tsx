"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Compass, CreditCard, LogOut, Map as MapIcon, Plus, Settings, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { Scene } from "@/components/scenes/scene";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Create a context for credit management

interface CreditContextType {
  credits: number;
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

const NAV = [
  { icon: Compass, label: "Plan a trip", href: "/dashboard" },
  { icon: MapIcon, label: "My itineraries", href: "/dashboard/itineraries" },
  { icon: CreditCard, label: "Credits", href: "/dashboard/credits" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

function Avatar({ src, name, className }: { src?: string | null; name?: string | null; className?: string }) {
  if (src) {
    return <Image src={src} alt="" width={40} height={40} className={cn("rounded-full object-cover", className)} />;
  }
  return (
    <span className={cn("grid place-items-center rounded-full bg-brand-soft font-medium text-brand", className)}>
      {(name ?? "T").charAt(0).toUpperCase()}
    </span>
  );
}

function SidebarContent({ credits, onNavigate }: { credits: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
  const inItinerary = pathname.startsWith("/dashboard/itinerary/");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-6">
        <Logo />
      </div>

      <div className="px-4">
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

      <nav aria-label="Dashboard" className="mt-6 space-y-1 px-4">
        <p className="eyebrow px-3 pb-2 text-[0.62rem] text-stone-2">Menu</p>
        {NAV.map((item) => {
          const active = isActive(item.href) || (item.href === "/dashboard/itineraries" && inItinerary);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition-colors",
                active ? "text-ink" : "text-ink/60 hover:text-ink"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_8px_24px_-16px_rgba(21,19,15,0.4)] ring-1 ring-line"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <item.icon className={cn("relative size-[18px]", active && "text-brand")} />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 p-4">
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
            <p className="display mt-2 text-5xl leading-none">{credits}</p>
            <p className="mt-2 text-xs text-paper/60">1 credit = 1 itinerary</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1.5 text-xs ring-1 ring-inset ring-paper/15 backdrop-blur transition-colors group-hover:bg-paper group-hover:text-ink">
              <Plus className="size-3.5" /> Top up
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 rounded-2xl p-2">
          <Avatar src={session?.user?.image} name={session?.user?.name} className="size-10 shrink-0" />
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

  if (status !== "authenticated" || !session) {
    return <ShellLoading />;
  }

  return (
    <CreditContext.Provider value={{ credits, refreshCredits: fetchCredits }}>
      <div className="min-h-svh bg-paper lg:flex">
        {/* Desktop sidebar */}
        <aside className="no-print sticky top-0 hidden h-svh w-72 shrink-0 border-r border-line bg-paper-2/50 lg:block">
          <SidebarContent credits={credits} />
        </aside>

        {/* Mobile top bar */}
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/80 px-4 backdrop-blur-xl lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/dashboard/credits" className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1.5 text-sm text-ink">
              <CreditCard className="size-3.5 text-brand" />
              {credits}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="grid size-10 place-items-center rounded-full bg-ink text-paper"
            >
              <Menu className="size-4" />
            </button>
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
                className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-xs bg-paper shadow-2xl lg:hidden"
              >
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="absolute right-4 top-5 grid size-10 place-items-center rounded-full bg-ink/[0.06] text-ink"
                >
                  <X className="size-4" />
                </button>
                <SidebarContent credits={credits} onNavigate={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="min-w-0 flex-1">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </CreditContext.Provider>
  );
}
