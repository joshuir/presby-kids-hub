"use client";

import Link from "next/link";
import { ArrowRight, Eye, Heart, Sparkles, Star, Sun } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { TeamRoster } from "@/components/blocks/TeamRoster";
import { AppPromo } from "@/components/blocks/AppPromo";
import { HistoryDownload } from "@/components/history/HistoryPage";
import { parts, useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { sized } from "@/lib/img";

function HistoryTeaser() {
  const s = useSettings();
  const ms = (useContent("milestones") ?? []).filter((m) => (m.kind || "milestone") === "milestone").sort((a, b) => a.year.localeCompare(b.year));
  const pick = [ms[0], ms[Math.floor(ms.length / 2)], ms[ms.length - 1]].filter((m, i, a) => m && a.indexOf(m) === i);
  return (
    <section id="history" className="scroll-mt-28">
      <Container className="mt-28">
        <SectionHeading eyebrow="Our history" title={s.historyTitle} intro={s.historyIntro} tone="sun" action={{ href: "/about/history/", label: "Full timeline" }} />
        <ul data-reveal className="mt-8 grid gap-4 md:grid-cols-3">
          {pick.map((m) => (
            <li key={m!.id} data-stagger>
              <Link href="/about/history/" className="group card block overflow-hidden">
                {m!.image ? (
                  <div className="zoom-img aspect-[16/10]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(m!.image, 700, 440)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="font-display text-4xl font-extrabold text-blueBrand-600">{m!.year}</div>
                  <h3 className="mt-1 font-display text-xl font-bold">{m!.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/60">{m!.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center"><HistoryDownload /></div>
      </Container>
    </section>
  );
}

export function AboutPage() {
  const s = useSettings();
  return (
    <div>
      <PageHero page="about" eyebrow="About us" title={s.aboutTitle} intro={s.aboutSubtitle}>
        <ul className="flex flex-wrap gap-2">
          {[
            ["Love", Heart, "bg-[#FFE8E1] text-[#C2410C]"],
            ["Faith", Star, "bg-sky-soft text-blueBrand-700"],
            ["Joy", Sun, "bg-sun-soft text-[#9A6400]"],
            ["Since 2006", Sparkles, "bg-[#DCFCE7] text-[#15803D]"],
          ].map(([l, I, c]) => {
            const Icon = I as typeof Heart;
            return (
              <li key={l as string} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-extrabold ${c}`}>
                <Icon className="h-4 w-4" aria-hidden /> {l as string}
              </li>
            );
          })}
        </ul>
      </PageHero>

      <Container className="mt-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white sm:p-10" >
            <Eye className="h-10 w-10 text-sun" aria-hidden />
            <h2 className="mt-4 font-display text-3xl font-extrabold">Our vision</h2>
            <p className="mt-3 text-xl leading-8 text-white/80">{s.vision}</p>
          </Reveal>
          <div className="card p-7 sm:p-10">
            <h2 className="font-display text-3xl font-extrabold">Our mission</h2>
            <p className="mt-2 text-ink/60">{s.missionIntro}</p>
            <Reveal as="ol" className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.missionItems.map(parts).map(([t, d], i) => (
                <li key={t} data-stagger className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blueBrand-600 font-display text-lg font-extrabold text-white shadow-[0_3px_0_#173EA8]">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{t}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink/60">{d}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </Container>

      <section id="teachers" className="scroll-mt-28">
        <Container className="mt-28">
          <TeamRoster limit={5} filter={false} />
          <div className="mt-10 flex justify-center">
            <Link href="/about/team/" className="btn btn-dark" data-magnetic>Meet the whole team <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </Container>
      </section>

      <HistoryTeaser />

      <AppPromo />
    </div>
  );
}
