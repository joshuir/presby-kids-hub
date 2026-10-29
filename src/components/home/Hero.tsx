"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, BookOpen, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/site/Container";
import { HeroArt } from "@/components/art/Illustrations";
import { parts, useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { classLessons } from "@/lib/format";

/** Types the rotating words: Know → Love → Live. */
function TypedWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(words[0]?.length ?? 0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || words.length < 2) return;
    const w = words[i % words.length];
    const t = setTimeout(
      () => {
        if (!del && n < w.length) setN(n + 1);
        else if (!del) setDel(true);
        else if (n > 0) setN(n - 1);
        else {
          setDel(false);
          setI(i + 1);
        }
      },
      !del && n === w.length ? 1600 : del ? 60 : 110,
    );
    return () => clearTimeout(t);
  }, [i, n, del, words]);
  const w = words[i % words.length] ?? "";
  return (
    <span className="text-blueBrand-600">
      <span aria-hidden>{w.slice(0, n)}</span>
      <span aria-hidden className="ml-0.5 inline-block w-[3px] animate-pulse bg-blueBrand-600 align-[-0.05em]" style={{ height: "0.85em" }} />
      <span className="sr-only">{words.join(", ")}</span>
    </span>
  );
}

export function Hero() {
  const s = useSettings();
  const lessons = useContent("lessons") ?? [];
  const classes = useContent("classes") ?? [];
  const featured = lessons.find((l) => l.id === s.featuredLessonId) ?? classLessons(lessons, classes[0]?.id ?? "").current;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-h]", { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09 });
      gsap.from("[data-chip]", { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.12, delay: 0.5 });
      gsap.to("[data-chip]", { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.4, delay: 1.2 });
      gsap.from("[data-ray]", { scale: 0, transformOrigin: "230px 215px", duration: 0.9, ease: "power2.out", stagger: 0.05, delay: 0.3 });
      gsap.to("[data-kid-left]", { rotation: 4, transformOrigin: "95px 360px", duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, el);
    return () => ctx.revert();
  }, []);

  const [title1, ...rest] = s.heroTitle.split(" ");
  return (
    <section ref={ref} className="relative overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-0 bg-[linear-gradient(180deg,#EAF1FF_0%,#FBFAF7_100%)] [mask-image:linear-gradient(180deg,#000_55%,transparent)]" />
      <Container className="relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:pb-24">
        <div>
          <div data-h className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold shadow-soft ring-1 ring-ink/5">
            <span className="h-2 w-2 rounded-full bg-blueBrand-500" /> {s.heroBadge}
          </div>
          <h1 className="mt-5 font-display text-[2.9rem] font-extrabold leading-[0.98] sm:text-7xl lg:text-[5.4rem]">
            <span data-h className="block">{[title1, ...rest].join(" ")}</span>
            <span data-h className="block min-h-[1em]"><TypedWord words={s.heroWords} /></span>
            <span data-h className="block"><span className="squiggle text-blueBrand-600">God&apos;s Word</span></span>
          </h1>
          <p data-h className="mt-6 max-w-lg text-lg leading-8 text-ink/65">{s.heroSubtitle}</p>
          <div data-h className="mt-7 flex flex-wrap gap-3">
            <Link href="/classes/" className="btn btn-primary" data-magnetic>Explore Our Classes <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <Link href="/about/team/" className="btn btn-ghost" data-magnetic>Meet Our Teachers <Users className="h-4 w-4" aria-hidden /></Link>
          </div>
          <ul data-h className="mt-7 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
            {s.serviceTimes.map(parts).map(([a, b]) => (
              <li key={a} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blueBrand-500" /><span className="font-semibold">{a}</span> <span className="text-ink/55">· {b}</span></li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          {s.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.heroImage} alt="" className="aspect-[46/42] w-full rounded-[2.5rem] object-cover shadow-card" />
          ) : (
            <HeroArt className="w-full drop-shadow-[0_24px_40px_rgba(11,21,48,.15)]" />
          )}
          <div data-chip className="absolute -left-3 -top-4 grid h-24 w-24 place-items-center rounded-full bg-white shadow-card ring-4 ring-sun/60 sm:-left-6 sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Presbyterian Children's Ministry crest" width={72} height={81} className="h-[72%] w-auto" />
          </div>
          <div data-chip className="absolute -right-2 top-6 flex items-center gap-2 rounded-2xl bg-ink px-3 py-2.5 text-white shadow-card sm:-right-6">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun text-ink"><Users className="h-5 w-5" aria-hidden /></span>
            <span className="leading-tight"><span className="block font-display text-base font-bold">{classes.length || 9} classes</span><span className="text-[11px] text-white/65">ages 3 to 13</span></span>
          </div>
          {featured ? (
            <Link data-chip href={`/classes/lesson/?c=${featured.classId}&l=${featured.slug}`} className="absolute -left-2 bottom-20 max-w-[220px] rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink/5 sm:-left-8">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blueBrand-600"><BookOpen className="h-3.5 w-3.5" aria-hidden /> This Sunday</span>
              <span className="mt-0.5 block font-display text-base font-bold leading-tight">{featured.title}</span>
              <span className="text-xs text-ink/55">{featured.bibleRef}</span>
            </Link>
          ) : null}
          <div data-chip className="absolute -bottom-3 right-6 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold shadow-card ring-1 ring-ink/5">
            <ShieldCheck className="h-4 w-4 text-mint" aria-hidden /> Safe &amp; trained teachers
          </div>
        </div>
      </Container>
    </section>
  );
}
