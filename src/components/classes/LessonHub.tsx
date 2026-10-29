"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { ClassDoc, LessonDoc } from "@/lib/cms/types";
import { resolveArt } from "@/lib/art";
import { downloadUrl } from "@/lib/cms/client";
import { cn } from "@/lib/cn";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

const kindIcon: Record<string, string> = {
  notes: "📘",
  worksheet: "📝",
  activity: "🎨",
  other: "📎",
};

export function LessonHub({
  current,
  archive,
  accent,
  cls,
}: {
  current: LessonDoc;
  archive: LessonDoc[];
  accent: string;
  cls: ClassDoc;
}) {
  const [selectedId, setSelectedId] = useState(current.id);
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => [current, ...archive], [current, archive]);
  const lesson = all.find((l) => l.id === selectedId) ?? current;
  const isArchived = lesson.id !== current.id;
  const banner = resolveArt(lesson.bannerUrl, "banner", lesson, cls);
  const flyer = resolveArt(lesson.flyerUrl, "flyer", lesson, cls);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.07,
        clearProps: "transform,opacity",
      });
    }, el);
    return () => ctx.revert();
  }, [selectedId]);

  const filtered = archive.filter((l) =>
    (l.title + " " + l.bibleRef).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={rootRef} className="grid gap-8">
      {isArchived ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-amber-50 px-5 py-3 text-sm ring-1 ring-amber-200">
          <span>
            You’re viewing an archived lesson from <b>{lesson.lessonDate}</b>.
          </span>
          <button
            type="button"
            className="rounded-full bg-ink-950 px-4 py-1.5 font-semibold text-white"
            onClick={() => setSelectedId(current.id)}
          >
            Back to this week
          </button>
        </div>
      ) : null}

      {/* Banner */}
      <div data-reveal className="relative overflow-hidden rounded-[2rem] shadow-card ring-1 ring-black/5" style={{ background: accent }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner} alt={`${lesson.title} banner`} className="aspect-[12/5] w-full object-cover" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <section data-reveal>
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: accent }}>
              {lesson.bibleRef} • {lesson.lessonDate}
            </div>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">{lesson.title}</h2>
            <p className="mt-3 text-base leading-7 text-black/70">{lesson.description}</p>
          </section>

          {lesson.introVideoUrl ? (
            <section data-reveal>
              <h3 className="mb-3 font-[family-name:var(--font-heading)] text-xl">Introduction video</h3>
              <VideoEmbed url={lesson.introVideoUrl} title={`${lesson.title} introduction`} />
            </section>
          ) : null}

          <section data-reveal className="rounded-[2rem] p-6 text-white shadow-card" style={{ background: `linear-gradient(135deg, ${accent}, #0B0F19)` }}>
            <div className="text-xs font-bold uppercase tracking-widest text-white/70">Main thrust</div>
            <p className="mt-2 font-[family-name:var(--font-heading)] text-2xl leading-snug sm:text-3xl">{lesson.mainThrust}</p>
            {lesson.memoryVerse ? (
              <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6">📖 {lesson.memoryVerse}</p>
            ) : null}
          </section>

          <section data-reveal className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h3 className="font-[family-name:var(--font-heading)] text-xl">Learning objectives</h3>
            <ul className="mt-3 grid gap-2">
              {lesson.objectives.map((o, i) => (
                <li key={i} className="flex gap-3 text-sm leading-6 text-black/75">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: accent }}>
                    {i + 1}
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </section>

          {lesson.storyMedia.length ? (
            <section data-reveal>
              <h3 className="mb-3 font-[family-name:var(--font-heading)] text-xl">Bible story pictures & videos</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {lesson.storyMedia.map((m, i) =>
                  m.type === "video" ? (
                    <figure key={i} className="sm:col-span-2">
                      <VideoEmbed url={m.url} title={m.caption ?? lesson.title} />
                      {m.caption ? <figcaption className="mt-2 text-sm text-black/60">{m.caption}</figcaption> : null}
                    </figure>
                  ) : (
                    <figure key={i}>
                      <button type="button" onClick={() => setLightbox(resolveArt(m.url, "scene", lesson, cls))} className="block w-full overflow-hidden rounded-3xl ring-1 ring-black/5 focus-visible:outline-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveArt(m.url, "scene", lesson, cls)} alt={m.caption ?? lesson.title} loading="lazy" className="aspect-[10/7] w-full object-cover transition duration-500 hover:scale-105" />
                      </button>
                      {m.caption ? <figcaption className="mt-2 text-sm text-black/60">{m.caption}</figcaption> : null}
                    </figure>
                  ),
                )}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="grid content-start gap-6">
          {flyer ? (
            <div data-reveal className="overflow-hidden rounded-[2rem] shadow-card ring-1 ring-black/5">
              <button type="button" onClick={() => setLightbox(flyer)} className="block w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flyer} alt={`${lesson.title} flyer`} className="aspect-[4/5] w-full object-cover" />
              </button>
            </div>
          ) : null}

          <div data-reveal className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-black/5">
            <h3 className="font-[family-name:var(--font-heading)] text-xl">Downloads</h3>
            <ul className="mt-3 grid gap-2">
              {lesson.resources.length === 0 ? (
                <li className="text-sm text-black/50">No downloads for this lesson yet.</li>
              ) : (
                lesson.resources.map((r, i) => {
                  const printable = r.url.startsWith("/worksheet/");
                  return (
                  <li key={i}>
                    <a
                      href={printable ? r.url : downloadUrl(r.url)}
                      target={printable ? "_blank" : undefined}
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ring-1 ring-black/10 transition hover:bg-blueBrand-50"
                    >
                      <span className="text-lg">{kindIcon[r.kind] ?? "📎"}</span>
                      <span className="flex-1">{r.label}</span>
                      <span aria-hidden>{printable ? "🖨" : "⬇"}</span>
                    </a>
                    {!printable ? (
                      <a href={r.url} target="_blank" rel="noreferrer" className="ml-11 text-xs text-black/50 underline">open in browser</a>
                    ) : (
                      <span className="ml-11 text-xs text-black/45">opens a printable page — save as PDF</span>
                    )}
                  </li>
                  );
                })
              )}
            </ul>
          </div>
        </aside>
      </div>

      {/* Archive */}
      <section className="rounded-[2rem] bg-[#F8F8F8] p-6 ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">Lesson archive</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search past lessons…"
            aria-label="Search past lessons"
            className="w-full rounded-full bg-white px-4 py-2 text-sm ring-1 ring-black/10 sm:w-64"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">No archived lessons yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setSelectedId(l.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={cn(
                  "flex gap-3 rounded-3xl bg-white p-3 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-soft",
                  l.id === selectedId && "ring-2 ring-blueBrand-500",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveArt(l.flyerUrl, "flyer", l, cls)} alt="" className="h-20 w-16 shrink-0 rounded-2xl object-cover" loading="lazy" />
                <span>
                  <span className="block text-xs font-semibold text-black/50">{l.lessonDate}</span>
                  <span className="block font-semibold leading-snug">{l.title}</span>
                  <span className="block text-xs text-black/60">{l.bibleRef}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {lightbox ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-[90dvh] max-w-full rounded-3xl" />
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-bold">Close ✕</button>
        </div>
      ) : null}
    </div>
  );
}
