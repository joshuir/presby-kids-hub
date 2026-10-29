import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet the teachers of Presbyterian Children's Ministry, read our story since 2006, and discover the vision and mission behind our Sunday classes.",
};

export default function Page() {
  return <AboutPage />;
}
