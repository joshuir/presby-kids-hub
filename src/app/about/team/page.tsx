import type { Metadata } from "next";
import { MovedTo } from "@/components/site/MovedTo";

export const metadata: Metadata = { title: "Our team", robots: { index: false }, alternates: { canonical: "/about/#team" } };

export default function Page() {
  return <MovedTo path="/about/" hash="team" label="Our team on the About page" />;
}
