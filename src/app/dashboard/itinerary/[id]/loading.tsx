"use client";

import { OpeningOverlay } from "@/components/dashboard/generating-overlay";
import DashboardLoading from "../../loading";

// Opening a trip the planner just made keeps its overlay up; any other visit gets the usual skeleton.
export default function Loading() {
  return <OpeningOverlay fallback={<DashboardLoading />} />;
}
