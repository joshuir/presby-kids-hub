"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/blocks/PostCard";
import { Loading } from "@/components/site/LoadState";
import { Socials } from "@/components/blocks/Socials";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/cn";

const FILTERS = [
  ["all", "All"],
  ["verse", "Verses"],
  ["photo", "Photos"],
  ["video", "Videos"],
  ["news", "News"],
] as const;

export function FeedPage() {
  const posts = useContent("posts");
  const teachers = useContent("teachers") ?? [];
  const events = useContent("events") ?? [];
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const list = useMemo(
    () =>
      [...(posts ?? [])]
        .filter((p) => f === "all" || p.kind === f || (f === "news" && p.kind === "event"))
        .sort((a, b) => (b.pinned === "yes" ? 1 : 0) - (a.pinned === "yes" ? 1 : 0) || b.date.localeCompare(a.date)),
    [posts, f],
  );
  return (
    <div>
      <PageHero eyebrow="Feed" title="What's happening this week" intro="Photos, verses and news from our teachers." />
      <Container className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter posts">
            {FILTERS.map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={f === k} onClick={() => setF(k)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold", f === k ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10")}>
                {l}
              </button>
            ))}
          </div>
          {!posts ? <Loading label="Loading the feed…" /> : null}
          <div className="mt-5 grid gap-4">
            {list.map((p, i) => (
              <PostCard key={p.id} post={p} author={teachers.find((t) => t.id === p.authorId)} event={events.find((e) => e.id === p.eventId)} index={i} />
            ))}
            {posts && !list.length ? <p className="card p-6 text-ink/60">No posts here yet.</p> : null}
          </div>
        </div>
        <aside className="grid gap-4 lg:sticky lg:top-28">
          <div className="rounded-[1.6rem] bg-[#DCFCE7] p-5">
            <ShieldCheck className="h-7 w-7 text-[#15803D]" aria-hidden />
            <div className="mt-2 font-display text-lg font-bold">A safe space for families.</div>
            <p className="mt-1 text-sm leading-6 text-ink/70">Posts come only from verified teachers and are approved by a ministry administrator before they appear.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">From our social channels</h2>
            <p className="mb-3 text-sm text-ink/55">The latest from YouTube, Instagram, TikTok and Facebook.</p>
            <div className="[&_ul]:!grid-cols-1"><Socials /></div>
          </div>
        </aside>
      </Container>
    </div>
  );
}
