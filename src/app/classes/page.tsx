import type { Metadata } from "next";
import { ClassesPage } from "@/components/pages/ClassesPage";

export const metadata: Metadata = {
  title: "Classes",
  description: "Beginners, Primary, Juniors and Seniors — nine age-based Sunday classes for children aged 3 to 13, each with its own weekly Bible lesson.",
};

export default function Page() {
  return <ClassesPage />;
}
