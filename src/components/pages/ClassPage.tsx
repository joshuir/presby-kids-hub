"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, CalendarClock, DoorOpen, ShieldCheck, Target, User } from "lucide-react";
import { Container } from "@/components/site/Container";
import { Loading } from "@/components/site/LoadState";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { GroupArt } from "@/components/art/Illustrations";
import { Avatar } from "@/components/blocks/Teachers";
import { AlbumCard } from "@/components/blocks/AlbumCard";
import { classLessons, fmtDate } from "@/lib/format";
import { useContent } from "@/lib/useContent";

export function ClassPage() {
  const sp = useSearchParams();
  const id = sp.get("c") ?? sp.get("id") ?? "";
  const classes = useContent("classes");
  const lessons = useContent("lessons") ?? [];
  const teachers = useContent("teachers") ?? [];
  const gallery = useContent("gallery") ?? [];
  if (!classes) return <Loading label="Loading class…" />;
  const c = classes.find((x) => x.id === id);
  if (!c) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Class not found</h1>
        <Link href="/classes/" className="btn btn-primary mt-6">See all classes</Link>
      </Container>
    );
  }
  const { current, previous } = classLessons(lessons, c.id);
  const team = c.teacherIds.map((tid) => teachers.find((t) => t.id === tid)).filter(Boolean) as typeof teachers;
  const lessonHref = (slug: string) => `/classes/lesson/?c=${c.id}&l=${slug}`;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div aria-hidden className="dot-grid absolute inset-0 [mask-image:linear-gradient(180deg,#000_30%,transparent)]" />
        <Container className="relative grid items-center gap-8 py-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <nav aria-label="Breadcrumb" data-ph style={{ "--i": 0 } as React.CSSProperties} className="text-sm font-bold text-ink/50">
              <Link href="/classes/" className="hover:text-ink">Classes</Link> <span aria-hidden>›</span> <Link href={`/classes/#${c.group}`} className="capitalize hover:text-ink">{c.group}</Link>
            </nav>
            <div data-ph style={{ "--i": 1 } as React.CSSProperties} className="mt-4 flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl font-display text-3xl font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,.15)]" style={{ background: c.color }}>{c.number}</span>
              <h1 className="font-display text-5xl font-extrabold sm:text-6xl">{c.name}</h1>
            </div>
            <p data-ph style={{ "--i": 2 } as React.CSSProperties} className="mt-4 max-w-xl text-lg leading-8 text-ink/65">{c.description}</p>
            <ul data-ph style={{ "--i": 3 } as React.CSSProperties} className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-soft"><User className="h-4 w-4 text-blueBrand-600" aria-hidden />{c.ageRange}</li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-soft"><DoorOpen className="h-4 w-4 text-blueBrand-600" aria-hidden />{c.room}</li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-soft"><CalendarClock className="h-4 w-4 text-blueBrand-600" aria-hidden />{c.schedule}</li>
            </ul>
          </div>
          {current ? (
            <Link href={lessonHref(current.slug)} data-cursor="Open" data-hero-img style={{ "--i": 1 } as React.CSSProperties} className="group relative overflow-hidden rounded-[2rem] bg-blueBrand-600 p-6 text-white shadow-[0_6px_0_#173EA8] transition hover:-translate-y-1 sm:p-7">
              <div className="text-xs font-extrabold uppercase tracking-wider text-white/70">Current lesson · {fmtDate(current.lessonDate, { day: "numeric", month: "short" })}</div>
              <div className="mt-2 font-display text-3xl font-extrabold">{current.title}</div>
              <div className="text-white/75">{current.bibleRef}</div>
              <div className="mt-4 rounded-2xl bg-white/15 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-white/70">Memory verse</div>
                <div className="mt-1 font-display text-lg font-bold">“{current.memoryVerse}” <span className="font-sans text-sm font-semibold text-white/70">{current.memoryRef}</span></div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 font-extrabold">Open full lesson <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          ) : (
            <GroupArt group={c.group} className="aspect-[16/9] w-full rounded-[2rem]" />
          )}
        </Container>
      </section>

      {current ? (
        <Container className="mt-6">
          <h2 className="font-display text-3xl font-extrabold">This week at a glance</h2>
          <Reveal className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Lesson topic", current.topic, BookOpen, "bg-sky-soft text-blueBrand-700"],
              ["Lesson objective", current.objective, Target, "bg-sun-soft text-[#9A6400]"],
              ["Bible verse", current.bibleRef, BookOpen, "bg-[#DCFCE7] text-[#15803D]"],
            ].map(([label, value, I, tone]) => {
              const Icon = I as typeof BookOpen;
              return (
                <div key={label as string} data-stagger className="card p-5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden /></span>
                  <div className="mt-3 text-xs font-extrabold uppercase tracking-wider text-ink/45">{label as string}</div>
                  <div className="mt-1 font-semibold leading-7">{value as string}</div>
                </div>
              );
            })}
          </Reveal>
        </Container>
      ) : null}

      {team.length ? (
        <Container className="mt-16">
          <h2 className="font-display text-3xl font-extrabold">{team.length > 1 ? "Your teachers" : "Your teacher"}</h2>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {team.map((t, i) => (
              <Link key={t.id} href={`/about/?teacher=${t.id}#team`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
                <Avatar t={t} size={64} i={i} />
                <div>
                  <div className="font-display text-xl font-bold">{t.name}</div>
                  <div className="text-sm text-ink/60">{t.role}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[#15803D]"><ShieldCheck className="h-3 w-3" aria-hidden />Safeguarding checked</span>
                    <span className="rounded-full bg-paper px-2 py-0.5">Since {t.since}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="mt-16">
        <h2 className="font-display text-3xl font-extrabold">Previous lessons</h2>
        <p className="mt-1 text-ink/60">Missed a Sunday? Every lesson stays here with its story, questions and resources.</p>
        {previous.length ? (
          <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3">
            {previous.map((l) => {
              const d = new Date(l.lessonDate + "T12:00");
              return (
                <li key={l.id}>
                  <Link href={lessonHref(l.slug)} data-cursor="Open" className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-paper text-center leading-none">
                      <span><span className="block font-display text-xl font-extrabold">{d.getDate()}</span><span className="text-[10px] font-extrabold uppercase">{d.toLocaleDateString("en-GB", { month: "short" })}</span></span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-bold">{l.title}</span>
                      <span className="block truncate text-sm text-ink/55">{l.bibleRef} · {l.topic}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-ink/40" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="card mt-5 p-6 text-ink/55">Older lessons will appear here.</p>
        )}
      </Container>

      <Container className="mt-16">
        <SectionHeading title="Class gallery" intro="Group moments only — we never name or tag children." action={{ href: "/gallery/", label: "See the full gallery" }} className="[&_h2]:!text-3xl" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {gallery.slice(0, 4).map((a, i) => (
            <Link key={a.id} href={`/gallery/?album=${a.id}`}><AlbumCard a={a} i={i} /></Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
