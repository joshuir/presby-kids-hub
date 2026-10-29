"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/blocks/PostCard";
import { Loading } from "@/components/site/LoadState";
import { Socials } from "@/components/blocks/Socials";
import { PhoneMockup } from "@/components/blocks/PhoneMockup";
import { useContent } from "@/lib/useContent";
import { sized } from "@/lib/img";
import { initials } from "@/lib/site";
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
  const teachersRaw = useContent("teachers");
  const teachers = useMemo(() => teachersRaw ?? [], [teachersRaw]);
  const events = useContent("events") ?? [];
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const [who, setWho] = useState<string | null>(null);
  const authors = useMemo(() => teachers.filter((t) => (posts ?? []).some((p) => p.authorId === t.id)), [teachers, posts]);
  const list = useMemo(
    () =>
      [...(posts ?? [])]
        .filter((p) => (f === "all" || p.kind === f || (f === "news" && p.kind === "event")) && (!who || p.authorId === who))
        .sort((a, b) => (b.pinned === "yes" ? 1 : 0) - (a.pinned === "yes" ? 1 : 0) || b.date.localeCompare(a.date)),
    [posts, f, who],
  );
  // jump to a shared post (#id) once posts have loaded
  useEffect(() => {
    if (!posts?.length || !location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  }, [posts]);

  return (
    <div>
      <PageHero page="blog" eyebrow="From our classrooms" title="Stories, verses & *news*" intro="Weekly verses, photos from class and news for families — straight from our teachers." />
      <Container className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div id="feed" className="min-w-0 scroll-mt-28">
          {/* sticky controls — compact on phones */}
          <div className="sticky top-[76px] z-20 -mx-4 bg-cream/90 px-4 pb-3 pt-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-0">
            {authors.length ? (
              <ul className="no-scrollbar flex gap-3 overflow-x-auto pb-2" aria-label="Posts by teacher">
                {authors.map((t) => {
                  const on = who === t.id;
                  return (
                    <li key={t.id} className="shrink-0">
                      <button type="button" onClick={() => setWho(on ? null : t.id)} aria-pressed={on} className="flex w-[68px] flex-col items-center gap-1">
                        <span className={cn("rounded-full p-[3px]", on ? "bg-blueBrand-600" : "bg-gradient-to-tr from-sun via-coral to-blueBrand-500")}>
                          <span className="block h-14 w-14 overflow-hidden rounded-full border-[3px] border-cream bg-white">
                            {t.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sized(t.photo, 120, 120)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="grid h-full w-full place-items-center text-sm font-extrabold">{initials(t.name)}</span>
                            )}
                          </span>
                        </span>
                        <span className={cn("w-full truncate text-center text-xs font-bold", on ? "text-blueBrand-700" : "text-ink/70")}>{t.name.split(" ")[0]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter posts">
              {FILTERS.map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={f === k} onClick={() => setF(k)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition", f === k ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10")}>
                  {l}
                </button>
              ))}
              {who ? (
                <button type="button" onClick={() => setWho(null)} className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-soft px-3 py-2 text-sm font-bold text-blueBrand-700">
                  {teachers.find((t) => t.id === who)?.name.split(" ")[0]} <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
          {!posts ? <Loading label="Loading the feed…" /> : null}
          <div className="-mx-4 mt-3 grid gap-3 sm:mx-0 sm:gap-4">
            {list.map((p, i) => (
              <div key={p.id} data-reveal className="[&_.card]:rounded-none sm:[&_.card]:rounded-[1.75rem]">
                <PostCard post={p} author={teachers.find((t) => t.id === p.authorId)} event={events.find((e) => e.id === p.eventId)} index={i} />
              </div>
            ))}
            {posts && !list.length ? <p className="card p-6 text-ink/60">No posts here yet.</p> : null}
          </div>
        </div>
        <aside className="grid gap-4 lg:sticky lg:top-28">
          <div className="rounded-[1.6rem] bg-[#DCFCE7] p-5">
            <ShieldCheck className="h-7 w-7 text-[#15803D]" aria-hidden />
            <div className="mt-2 font-display text-lg font-bold">A safe space for families.</div>
            <p className="mt-1 text-sm leading-6 text-ink/70">Posts come only from verified teachers. Comments are read by a ministry admin before they appear.</p>
          </div>
          <div className="hidden lg:block">
            <PhoneMockup compact />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Follow along</h2>
            <p className="mb-3 text-sm text-ink/55">The latest from our social channels.</p>
            <div className="[&_ul]:!grid-cols-1"><Socials /></div>
          </div>
        </aside>
      </Container>
    </div>
  );
}
