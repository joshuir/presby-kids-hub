import type { Metadata } from "next";
import { EventsPage } from "@/components/events/EventsPage";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming children’s church events, family days and services. Add them to your calendar.",
};

export default function Page() {
  return <EventsPage />;
}
