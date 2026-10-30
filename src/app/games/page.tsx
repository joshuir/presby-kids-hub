import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { BibleQuest } from "@/components/games/BibleQuest";
import { PageLayout } from "@/components/site/PageLayout";

export const metadata: Metadata = {
  title: "Bible Games",
  description: "Climb the Bible path: story units with four levels each, streaks, badges, a leaderboard and a mascot who cheers you on.",
};

export default function GamesPage() {
  return (
    <div className="pb-10">
      <PageLayout
        page="games"
        sections={{
          hero: <PageHero page="games" eyebrow="Kids Zone" title="Bible *Games*" intro="Pick a mascot, follow the path through Bible stories from Genesis to Acts, and unlock harder levels as you go. Earn XP, badges and keep your streak alive!" />,
          game: (
            <div id="play" className="scroll-mt-28">
              <Container className="pt-4">
                <BibleQuest />
              </Container>
            </div>
          ),
        }}
      />
    </div>
  );
}
