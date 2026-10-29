import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: { absolute: "Presby Children Service — Sunday school & kids Bible lessons in Accra" },
  description:
    "A safe, joyful children’s church: Bible-centred Sunday school classes for ages 2–17, kids Bible lessons, games, events and resources for parents.",
};

export default function Page() {
  return <HomePage />;
}
