"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { getPublic } from "@/lib/cms/client";
import { useSettings } from "@/lib/site";
import type { ClassDoc, PolicyDoc, TeacherDoc } from "@/lib/cms/types";

const GROUPS = ["Beginners", "Primary", "Juniors", "Seniors"] as const;

export function AboutPage() {
  const s = useSettings();
  const [teachers, setTeachers] = useState<TeacherDoc[]>([]);
  const [policies, setPolicies] = useState<PolicyDoc[]>([]);
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  useEffect(() => {
    getPublic("teachers").then((t) => setTeachers(t.sort((a, b) => a.order - b.order))).catch(() => {});
    getPublic("policies").then((p) => setPolicies(p.sort((a, b) => a.order - b.order))).catch(() => {});
    getPublic("classes").then((c) => setClasses(c.sort((a, b) => a.order - b.order))).catch(() => {});
  }, []);

  return (
    <div>
      <PageHero eyebrow="About us" title={`Welcome to ${s.siteName}`} intro={s.background} />

      <Container className="mt-16">
        <Reveal className="grid gap-5 md:grid-cols-2">
          <div data-stagger className="rounded-[2rem] bg-sky-soft p-8">
            <div className="text-3xl">🎯</div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl text-navy-900">Our mission</h2>
            <p className="mt-2 leading-7 text-black/70">{s.mission}</p>
          </div>
          <div data-stagger className="rounded-[2rem] bg-navy-900 p-8 text-white">
            <div className="text-3xl">🌅</div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl">Our vision</h2>
            <p className="mt-2 leading-7 text-white/75">{s.vision}</p>
          </div>
        </Reveal>
        <Reveal className="mt-6 flex flex-wrap gap-2">
          {s.values.map((v) => (
            <span key={v} data-stagger className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-soft ring-1 ring-black/5">✦ {v}</span>
          ))}
        </Reveal>
      </Container>

      {/* teachers */}
      <section id="teachers" className="mt-24 scroll-mt-28">
        <Container>
          <SectionHeading eyebrow="Our team" title="Meet the teachers" intro="Trained, caring and approved by church leadership." />
          <Reveal className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => (
              <article key={t.id} data-stagger className="group rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  {t.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo} alt={t.name} className="h-16 w-16 rounded-2xl object-cover" loading="lazy" />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blueBrand-400 to-navy-800 font-[family-name:var(--font-heading)] text-2xl text-white">
                      {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                  )}
                  <div>
                    <div className="font-[family-name:var(--font-heading)] text-xl text-navy-900">{t.name}</div>
                    <div className="text-sm text-blueBrand-700">{t.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/65">{t.bio}</p>
                {t.classIds?.length ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.classIds.map((id) => {
                      const c = classes.find((x) => x.id === id);
                      return c ? (
                        <Link key={id} href={`/classes/view/?id=${id}`} className="rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: c.color }}>
                          {c.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                ) : null}
              </article>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* safety */}
      <section id="safety" className="bg-soft-blue mt-24 scroll-mt-20 py-20">
        <Container>
          <SectionHeading eyebrow="Child safety" title="How we keep every child safe" intro="These policies apply in every class, every week." />
          <Reveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((p) => (
              <div key={p.id} data-stagger className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-blueBrand-100">
                <div className="text-3xl">{p.icon}</div>
                <div className="mt-3 font-[family-name:var(--font-heading)] text-lg text-navy-900">{p.title}</div>
                <p className="mt-1 text-sm leading-6 text-black/65">{p.description}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* age groups */}
      <Container className="mt-20">
        <SectionHeading eyebrow="Age groups" title="Classes for every stage" />
        <Reveal className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => {
            const list = classes.filter((c) => c.group === g);
            return (
              <div key={g} data-stagger className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
                <div className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">{g}</div>
                <ul className="mt-3 grid gap-2">
                  {list.map((c) => (
                    <li key={c.id}>
                      <Link href={`/classes/view/?id=${c.id}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-sky-soft">
                        <span className="flex items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>
                        <span className="text-black/50">{c.ageRange}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </div>
  );
}
