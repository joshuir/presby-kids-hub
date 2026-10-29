import type { Metadata } from "next";
import { DocPage } from "@/components/pages/DocPage";

export const metadata: Metadata = { title: "Child Safety & Safeguarding" };

export default function Page() {
  return <DocPage kind="safeguarding" />;
}
