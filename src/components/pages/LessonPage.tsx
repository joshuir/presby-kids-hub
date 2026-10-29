"use client";

import { VerseChallenge } from "@/components/games/VerseChallenge";
import { Buddy } from "@/components/games/Mascot";
import Link from "next/link";
import { SplitWords } from "@/components/motion/SplitWords";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, FileText, HandHeart, Image as ImageIcon, Music, Printer, Sparkles } from "lucide-react";
import { Container } from "@/components/site/Container";
import { Loading } from "@/components/site/LoadState";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { downloadUrl } from "@/lib/cms/client";
import { classLessons, fmtDate } from "@/lib/format";
import { useContent } from "@/lib/useContent";
import { useAdminLessons } from "./useAdminPreview";
import type { ResourceItem } from "@/lib/cms/types";

const RES_ICON: Record<ResourceItem["kind"], typeof FileText> = { notes: FileText, worksheet: FileText, activity: Sparkles, audio: Music, image: ImageIcon, other: Download };

export function LessonPage() {
  const sp = useSearchParams();
  const cid = sp.get("c") ?? "";
  const slug = sp.get("l") ?? "";
  const preview = sp.get("preview");
  const classes = useContent("classes");
  const pub = useContent("lessons");
  const drafts = useAdminLessons(!!preview);
  if (!classes || !pub) return <Loading label="Loading lesson…" />;
  const all = drafts ?? pub;
  const c = classes.find((x) => x.id === cid);
  const l = all.find((x) => x.classId === cid && (x.slug === slug || x.id === preview));
  if (!c || !l) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Lesson not found</h1>
        <Link href={c ? `/classes/view/?c=${c.id}` : "/classes/"} className="btn btn-primary mt-6">Back to the class</Link>
      </Container>
    );
  }
  const { list } = classLessons(pub, c.id);
  const idx = list.findIndex((x) => x.id === l.id);
  const newer = idx > 0 ? list[idx - 1] : null;
  const older = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const href = (s: string) => `/classes/lesson/?c=${c.id}&l=${s}`;

  return (
    <article>
      {l.status !== "published" && l.status !== "archived" ? (
        <div className="no-print bg-sun px-4 py-2 text-center text-sm font-bold">Preview — this lesson is {l.status} and not visible to families yet.</div>
      ) : null}
      <header className="relative overflow-hidden">
        <div aria-hidden className="dot-grid absolute inset-0 [mask-image:linear-gradient(180deg,#000_20%,transparent)]" />
        <Container className="relative max-w-4xl py-12">
          <nav aria-label="Breadcrumb" data-ph style={{ "--i": 0 } as React.CSSProperties} className="text-sm font-bold text-ink/50">
            <Link href={`/classes/view/?c=${c.id}`} className="hover:text-ink">{c.name}</Link> · {fmtDate(l.lessonDate)}
          </nav>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl text-balance"><SplitWords hero text={l.title} mark="none" /></h1>
          <div data-ph style={{ "--i": 2 } as React.CSSProperties} className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ink px-3.5 py-1.5 text-sm font-bold text-white">{l.bibleRef}</span>
            <span className="rounded-full bg-sun-soft px-3.5 py-1.5 text-sm font-bold text-[#9A6400]">{l.topic}</span>
            <button type="button" onClick={() => window.print()} className="no-print inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-bold shadow-soft ring-1 ring-ink/10">
              <Printer className="h-4 w-4" aria-hidden /> Printable sheet
            </button>
          </div>
        </Container>
      </header>

      <Container className="max-w-4xl">
        {l.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.bannerUrl} alt="" className="mb-6 aspect-[16/6] w-full rounded-[1.6rem] object-cover" />
        ) : null}
        <figure className="rounded-[2rem] bg-blueBrand-600 p-6 text-white sm:p-8">
          <figcaption className="text-xs font-extrabold uppercase tracking-wider text-white/70">Memory verse</figcaption>
          <blockquote className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">“{l.memoryVerse}”</blockquote>
          <p className="mt-2 font-bold text-white/75">{l.memoryRef}</p>
        </figure>

        {l.memoryVerse ? <VerseChallenge verse={l.memoryVerse} reference={l.memoryRef} /> : null}

        {l.introVideoUrl ? <div className="no-print mt-8"><VideoEmbed url={l.introVideoUrl} title={`${l.title} — intro`} /></div> : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-display text-2xl font-bold">Lesson objective</h2>
            <p className="mt-2 leading-7 text-ink/70">{l.objective}</p>
          </section>
          <section className="card p-6">
            <h2 className="font-display text-2xl font-bold">Topic</h2>
            <p className="mt-2 font-semibold">{l.topic}</p>
            <p className="mt-1 text-sm text-ink/55">{l.bibleRef} · taught {fmtDate(l.lessonDate)}</p>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-3xl font-extrabold">The Bible story</h2>
          <div className="mt-4 grid gap-4 text-lg leading-8 text-ink/80">
            {l.story.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <p className="mt-4 font-bold text-blueBrand-700">Read it together: {l.bibleRef}</p>
        </section>

        {l.storyMedia?.length ? (
          <section className="no-print mt-10">
            <h2 className="font-display text-2xl font-bold">Story pictures &amp; videos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {l.storyMedia.map((m, i) => (
                <figure key={i} className="card overflow-hidden">
                  {m.type === "video" ? (
                    /youtu|vimeo/.test(m.url) ? <VideoEmbed url={m.url} title={m.caption || l.title} /> : <video src={m.url} controls preload="metadata" className="aspect-video w-full bg-black" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.caption || ""} loading="lazy" className="aspect-video w-full object-cover" />
                  )}
                  {m.caption ? <figcaption className="p-3 text-sm text-ink/60">{m.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {l.discussion?.length ? (
          <section className="mt-10">
            <h2 className="font-display text-3xl font-extrabold">Discussion questions</h2>
            <ol className="mt-4 grid gap-3">
              {l.discussion.map((q, i) => (
                <li key={i} className="card flex items-start gap-4 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun font-display font-extrabold">{i + 1}</span>
                  <span className="pt-1 text-lg font-semibold">{q}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {l.activitySteps?.length ? (
          <section className="mt-10 rounded-[2rem] bg-[#DCFCE7] p-6 sm:p-8">
            <h2 className="font-display text-3xl font-extrabold">Activity: {l.activityTitle}</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {l.activitySteps.map((st, i) => (
                <li key={i} className="rounded-2xl bg-white p-4">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#15803D]">Step {i + 1}</div>
                  <p className="mt-1 font-semibold leading-6">{st}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {l.prayer ? (
          <section className="mt-10 card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 font-display text-3xl font-extrabold"><HandHeart className="h-7 w-7 text-coral" aria-hidden /> Prayer</h2>
            <p className="mt-3 text-lg italic leading-8 text-ink/75">{l.prayer}</p>
          </section>
        ) : null}

        {l.flyerUrl ? (
          <section className="no-print mt-10">
            <h2 className="font-display text-2xl font-bold">Lesson flyer</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.flyerUrl} alt={`${l.title} flyer`} className="mt-4 w-full max-w-md rounded-2xl shadow-card" />
          </section>
        ) : null}

        <section id="resources" className="no-print mt-10 scroll-mt-28">
          <h2 className="font-display text-3xl font-extrabold">Downloadable resources</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {(l.resources ?? []).map((r, i) => {
              const Icon = RES_ICON[r.kind] ?? Download;
              const isPrint = r.url === "#print";
              const inner = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-soft text-blueBrand-700"><Icon className="h-5 w-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{r.label}</span>
                    <span className="text-xs font-semibold uppercase text-ink/50">{isPrint ? "print / save as PDF" : r.kind}</span>
                  </span>
                  <Download className="h-5 w-5 text-ink/40" aria-hidden />
                </>
              );
              return (
                <li key={i}>
                  {isPrint ? (
                    <button type="button" onClick={() => window.print()} className="card flex w-full items-center gap-3 p-4 text-left">{inner}</button>
                  ) : (
                    <a href={downloadUrl(r.url)} className="card flex items-center gap-3 p-4" target="_blank" rel="noreferrer">{inner}</a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <nav aria-label="More lessons" className="no-print mt-12 grid gap-3 sm:grid-cols-2">
          {older ? (
            <Link href={href(older.slug)} className="card flex items-center gap-3 p-4">
              <ArrowLeft className="h-5 w-5" aria-hidden />
              <span><span className="block text-xs font-bold uppercase text-ink/50">Previous lesson</span><span className="font-bold">{older.title}</span></span>
            </Link>
          ) : <span />}
          {newer ? (
            <Link href={href(newer.slug)} className="card flex items-center justify-end gap-3 p-4 text-right">
              <span><span className="block text-xs font-bold uppercase text-ink/50">Next lesson</span><span className="font-bold">{newer.title}</span></span>
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : null}
        </nav>
        <div className="no-print mt-6 rounded-[1.6rem] bg-[#58CC02] p-5 text-white sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Buddy kind="lion" color="#F59E0B" mood="wave" size={64} look={false} />
            <div>
            <div className="font-display text-xl font-extrabold">Practise with the Bible games</div>
            <div className="text-white/85">Earn XP on stories like this one.</div>
            </div>
          </div>
          <Link href="/games/" className="btn mt-3 bg-white text-[#46A302] sm:mt-0">Play now</Link>
        </div>
      </Container>
    </article>
  );
}
