import type { Metadata } from "next";
import { TeamPage } from "@/components/pages/TeamPage";

export const metadata: Metadata = {
  title: "Our team",
  description: "Meet the background-checked, safeguarding-trained teachers who lead every Children's Ministry class.",
};

export default function Page() {
  return <TeamPage />;
}
