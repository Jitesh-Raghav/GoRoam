import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

// One shell for every dashboard page, so the sidebar, credits and session stay
// mounted while you move between pages instead of rebuilding on each click.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
