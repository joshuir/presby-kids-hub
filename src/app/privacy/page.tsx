import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy & cookies", description: "How the children’s ministry website uses your data and cookies." };

export default function Page() {
  return <LegalPage kind="privacy" />;
}
