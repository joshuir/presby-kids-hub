import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { BibleQuest } from "@/components/games/BibleQuest";

export const metadata: Metadata = {
  title: "Bible Games",
  description: "Climb the Bible path: story units with four levels each, streaks, badges, a leaderboard and a mascot who cheers you on.",
};

export default function GamesPage() {
  return (
    <div className="pb-10">
      <Container className="pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="text-sm font-bold text-ink/50">
          <span>Kids Zone</span> <span aria-hidden>›</span> <span className="text-ink">Bible Games</span>
        </nav>
        <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-extrabold sm:text-6xl">Bible Games</h1>
            <p className="mt-3 text-lg leading-8 text-ink/65">
              Pick a mascot, follow the path through Bible stories from Genesis to Acts, and unlock harder levels as you go. Earn XP, badges and keep your streak alive!
            </p>
          </div>
          <Link href="/collection/" className="btn btn-ghost !py-2.5 text-sm">👕 Clothing Collection</Link>
        </div>
        <BibleQuest />
      </Container>
    </div>
  );
}
