import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { ClassesList } from "@/components/classes/ClassesList";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "Multimedia Bible-learning hubs for every class — lesson flyers, videos, objectives, downloads and archives.",
};

export default function ClassesPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Classes"
        title="A learning hub for every class"
        intro="This week’s lesson, story pictures and videos, objectives, the main thrust, downloadable worksheets and an archive of past lessons."
      >
        <Link href="/games/" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-navy-900 shadow-lg transition hover:-translate-y-0.5">
          <Gamepad2 className="h-4 w-4" aria-hidden /> Play Bible games
        </Link>
      </PageHero>
      <Container className="py-10 sm:py-14">
        <ClassesList />
      </Container>
    </div>
  );
}
