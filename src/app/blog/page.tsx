import type { Metadata } from "next";
import { FeedPage } from "@/components/pages/FeedPage";

export const metadata: Metadata = {
  title: "Blog & Feed",
  description: "News, memory verses, photos and short videos from Children's Ministry teachers — a safe, moderated feed for families.",
};

export default function Page() {
  return <FeedPage />;
}
