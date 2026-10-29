import type { Metadata } from "next";
import { MovedTo } from "@/components/site/MovedTo";

export const metadata: Metadata = { title: "History & achievements", robots: { index: false }, alternates: { canonical: "/about/#history" } };

export default function Page() {
  return <MovedTo path="/about/" hash="history" label="History & achievements on the About page" />;
}
