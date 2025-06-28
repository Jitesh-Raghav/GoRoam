"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TripForm } from "@/components/dashboard/trip-form";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth");
  }

  const handleFormSubmit = (data: any) => {
    console.log("Trip form submitted:", data);
    // TODO: Handle form submission - send to API, etc.
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* <div className="mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Plan Your Next Adventure
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
            Fill out the form below to generate your personalized travel itinerary
          </p>
        </div> */}
        
        <TripForm onSubmit={handleFormSubmit} />
      </div>
    </DashboardLayout>
  );
} 