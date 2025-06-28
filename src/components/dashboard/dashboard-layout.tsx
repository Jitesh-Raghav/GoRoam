"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  onClick?: () => void;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState(0); // Start with 0, will be fetched from API
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Function to fetch user credits
  const fetchCredits = async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch('/api/user/credits');
        const data = await response.json();
        if (data.success) {
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    }
  };

  // Fetch user credits on mount
  useEffect(() => {
    fetchCredits();
  }, [session?.user?.email]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
    },
    {
      icon: MapPin,
      label: "All Itineraries",
      href: "/dashboard/itineraries",
    },
    {
      icon: CreditCard,
      label: "Buy Credits",
      href: "/dashboard/credits",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
    {
      icon: LogOut,
      label: "Logout",
      href: "#",
      onClick: handleSignOut,
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      router.push(item.href);
    }
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <CreditContext.Provider value={{ credits, refreshCredits: fetchCredits }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 lg:flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:flex-shrink-0 lg:sticky lg:top-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
            <Image
                            src="/logo.png"
                            alt="GoRoam Logo"
                            width={40}
                            height={40}
                            className="w-12 h-12"
                        />
              <span className="text-xl font-bold text-orange-600/90 dark:text-white">GoRoam</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={session?.user?.image || ""}
                  alt="Profile"
                  className="h-10 w-10 rounded-full border-2 border-orange-200"
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {credits} credits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                    active
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-orange-600" : "")} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Credits Card */}
          <div className="p-4">
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Credits
                  </p>
                                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {credits}
                </p>
                </div>
                <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                  Free Plan
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:flex lg:flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-orange-500" />
              <span className="font-bold text-gray-900 dark:text-white">GoRoam</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{credits}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
    </CreditContext.Provider>
  );
} 