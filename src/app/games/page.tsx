import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { BibleGame } from "@/components/games/BibleGame";
import { SectionBar } from "@/components/site/SectionNav";

export const metadata: Metadata = {
  title: "Bible Games",
  description: "Play Bible quizzes from the Old and New Testaments — earn XP, keep your streak and climb the leaderboard.",
};

export default function GamesPage() {
  return (
    <div className="bg-[#F8F8F8] pb-28">
      <SectionBar />
      <Container className="py-10 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl tracking-tight sm:text-5xl">Bible Games</h1>
          <p className="mt-3 text-base leading-7 text-black/70">
            Pick a mascot, choose a level and test what you know about stories from Genesis to Acts.
            Earn XP, unlock harder levels and new mascots, and keep your daily streak going!
          </p>
        </div>
        <BibleGame />
      </Container>
    </div>
  );
}
