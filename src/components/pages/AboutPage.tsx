"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Download, Eye, Heart, Sparkles, Star, Sun } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { Teachers } from "@/components/blocks/Teachers";
import { AppPromo } from "@/components/blocks/AppPromo";
import { HeroArt } from "@/components/art/Illustrations";
import { downloadUrl } from "@/lib/cms/client";
import { parts, useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";

gsap.registerPlugin(ScrollTrigger);

function Timeline() {
  const items = useContent("milestones") ?? [];
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 70%", scrub: true } });
      el.querySelectorAll("[data-ms]").forEach((m) => {
        gsap.from(m, { x: 30, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: m, start: "top 85%", once: true } });
      });
    }, el);
    return () => ctx.revert();
  }, [items.length]);
  return (
    <ol ref={ref} className="relative mt-10 grid gap-6 pl-16 sm:pl-24">
      <span aria-hidden className="absolute bottom-0 left-[27px] top-0 w-1 rounded-full bg-ink/10 sm:left-[43px]" />
      <span aria-hidden data-line className="absolute bottom-0 left-[27px] top-0 w-1 rounded-full bg-blueBrand-600 sm:left-[43px]" />
      {items.map((m) => (
        <li key={m.id} data-ms className="relative">
          <span className="absolute -left-16 top-2 grid h-14 w-14 place-items-center rounded-2xl bg-ink font-display text-lg font-extrabold text-white sm:-left-24 sm:h-[86px] sm:w-[86px] sm:text-2xl">
            {m.year.slice(2)}’
          </span>
          <div className="card p-5 sm:p-6">
            <div className="text-sm font-extrabold text-blueBrand-600">{m.year}</div>
            <h3 className="mt-1 font-display text-2xl font-bold">{m.title}</h3>
            <p className="mt-2 leading-7 text-ink/65">{m.description}</p>
            {m.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.image} alt="" loading="lazy" className="mt-4 aspect-[16/8] w-full rounded-2xl object-cover" />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AboutPage() {
  const s = useSettings();
  return (
    <div>
      <PageHero eyebrow="About us" title={s.aboutTitle} intro={s.aboutSubtitle} art={<HeroArt className="w-full" />}>
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
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white sm:p-10">
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
        <Container className="mt-24">
          <SectionHeading eyebrow="Our team" title="Meet the team behind every Sunday" intro="Trained, background-checked and known by name." action={{ href: "/contact/", label: "Get in touch" }} tone="mint" />
          <div className="mt-8"><Teachers filter /></div>
        </Container>
      </section>

      <section id="history" className="scroll-mt-28">
        <Container className="mt-24 max-w-4xl">
          <SectionHeading eyebrow="Our history" title={s.historyTitle} tone="sun" />
          {s.historyPdf ? (
            <a href={downloadUrl(s.historyPdf)} className="card mt-6 inline-flex items-center gap-3 p-4 pr-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun-soft text-[#9A6400]"><Download className="h-5 w-5" aria-hidden /></span>
              <span><span className="block font-bold">Download our full history</span><span className="text-sm text-ink/55">PDF · the story since 2006</span></span>
            </a>
          ) : null}
          <Timeline />
        </Container>
      </section>

      <AppPromo />
    </div>
  );
}
