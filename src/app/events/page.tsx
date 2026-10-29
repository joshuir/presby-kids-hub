import type { Metadata } from "next";
import { EventsPage } from "@/components/pages/EventsPage";

export const metadata: Metadata = {
  title: "Events calendar",
  description: "Children's Ministry events: harvests, parents' days, camps, outreaches and Christmas — add any event to your calendar.",
};

export default function Page() {
  return <EventsPage />;
}
