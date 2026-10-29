import type { Metadata } from "next";
import { HistoryPage } from "@/components/history/HistoryPage";

export const metadata: Metadata = {
  title: "History & Constitution",
  description: "The history of our children’s ministry and its constitution: purpose, leadership, rules, code of conduct and class policies.",
};

export default function Page() {
  return <HistoryPage />;
}
