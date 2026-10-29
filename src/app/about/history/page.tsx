import type { Metadata } from "next";
import { HistoryPage } from "@/components/history/HistoryPage";

export const metadata: Metadata = {
  title: "History & achievements",
  description: "How the Presbyterian Children's Ministry grew from twelve children in 2006 — milestones, photos, achievements and our full history to download.",
};

export default function Page() {
  return <HistoryPage />;
}
