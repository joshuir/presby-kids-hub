"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, DoorOpen, User } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { GroupArt } from "@/components/art/Illustrations";
import { Loading } from "@/components/site/LoadState";
import { classLessons } from "@/lib/format";
import { parts, useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";

export function ClassesPage() {
  const s = useSettings();
  const classes = useContent("classes");
  const lessons = useContent("lessons") ?? [];
  const teachers = useContent("teachers") ?? [];
  const groups = s.groups.map(parts);
  return (
    <div>
      <PageHero page="classes" eyebrow="Classes" title="Find your child's class" intro="Ages 3 to 13, grouped so every lesson fits.">
        <nav aria-label="Age groups" className="flex flex-wrap gap-2">
          {groups.map(([key, label, ages]) => (
            <a key={key} href={`#${key}`} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold shadow-soft ring-1 ring-ink/5 transition hover:-translate-y-0.5">
              {label} <span className="font-semibold text-ink/50">· {ages}</span>
            </a>
          ))}
        </nav>
      </PageHero>
      {!classes ? <Loading label="Loading classes…" /> : null}
      <div className="grid gap-20">
        {groups.map(([key, label, ages, desc]) => {
          const list = (classes ?? []).filter((c) => c.group === key);
          return (
            <section key={key} id={key} aria-labelledby={`h-${key}`} className="scroll-mt-28">
              <Container>
                <div className="grid items-end gap-6 lg:grid-cols-[1fr_360px]">
                  <div>
                    <span className="eyebrow bg-sky-soft text-blueBrand-700">{ages}</span>
                    <h2 id={`h-${key}`} className="mt-3 font-display text-5xl font-extrabold">{label}</h2>
                    <p className="mt-2 max-w-xl text-lg text-ink/65">{desc}</p>
                  </div>
                  <GroupArt group={key} className="hidden aspect-[16/9] w-full rounded-[1.6rem] lg:block" />
                </div>
                <Reveal watch={list.length} className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((c) => {
                    const { current } = classLessons(lessons, c.id);
                    const names = c.teacherIds.map((id) => teachers.find((t) => t.id === id)?.name).filter(Boolean);
                    return (
                      <Link key={c.id} data-stagger href={`/classes/view/?c=${c.id}`} className="group card flex flex-col p-5 transition hover:-translate-y-1 sm:p-6">
                        <div className="flex items-center justify-between">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl font-display text-2xl font-extrabold text-white" style={{ background: c.color }}>{c.number}</span>
                          <span className="rounded-full bg-paper px-3 py-1 text-xs font-extrabold">{c.ageRange}</span>
                        </div>
                        <h3 className="mt-4 font-display text-2xl font-extrabold">{c.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-ink/60">{c.description}</p>
                        {current ? (
                          <div className="mt-4 rounded-2xl bg-sky-soft p-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blueBrand-600"><BookOpen className="h-3.5 w-3.5" aria-hidden /> This Sunday</div>
                            <div className="mt-1 font-display text-lg font-bold">{current.title}</div>
                            <div className="text-sm text-ink/55">{current.bibleRef}</div>
                          </div>
                        ) : null}
                        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm text-ink/60">
                          {names.length ? <span className="inline-flex items-center gap-1"><User className="h-4 w-4" aria-hidden /> With {names.join(" & ")}</span> : null}
                          <span className="inline-flex items-center gap-1"><DoorOpen className="h-4 w-4" aria-hidden /> {c.room}</span>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-blueBrand-700">Open class page <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
                      </Link>
                    );
                  })}
                </Reveal>
              </Container>
            </section>
          );
        })}
      </div>
    </div>
  );
}
