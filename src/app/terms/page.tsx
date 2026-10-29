import type { Metadata } from "next";
import { DocPage } from "@/components/pages/DocPage";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return <DocPage kind="terms" />;
}
