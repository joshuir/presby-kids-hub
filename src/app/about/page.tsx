import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "Our mission, vision, teachers, child safety policies and age groups.",
};

export default function Page() {
  return <AboutPage />;
}
