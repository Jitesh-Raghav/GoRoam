"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { TripForm } from "@/components/dashboard/trip-form";
import { SplitText } from "@/components/motion/split-text";

function greeting(hour: number) {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Welcome() {
  const { data: session } = useSession();
  const [hello, setHello] = useState("Hello");
  useEffect(() => setHello(greeting(new Date().getHours())), []);
  const first = session?.user?.name?.split(" ")[0];

  return (
    <header className="mb-8 lg:mb-10">
      <p className="eyebrow text-stone">
        {hello}
        {first ? `, ${first}` : ""}
      </p>
      <h1 className="display mt-4 text-[clamp(2.8rem,6vw,5rem)] leading-[0.92] text-ink">
        <SplitText text="Where are we" trigger="mount" className="block" />
        <SplitText segments={[{ text: "headed next?", className: "italic text-brand" }]} trigger="mount" delay={0.12} className="block" />
      </h1>
      <p className="mt-4 max-w-xl text-lg text-stone">Four quick steps and GoRoam crafts a day-by-day plan, with flights, stays and tickets ready to book.</p>
    </header>
  );
}

export default function DashboardPage() {
  const handleFormSubmit = (data: unknown) => {
    console.log("Trip form submitted:", data);
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <Welcome />
      <TripForm onSubmit={handleFormSubmit} />
    </div>
  );
}
