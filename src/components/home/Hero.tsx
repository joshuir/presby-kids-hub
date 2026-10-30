"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ArrowRight, BookOpen, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/site/Container";
import { HeroArt } from "@/components/art/Illustrations";
import { parts, useSettings, useCopy } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { classLessons } from "@/lib/format";
import { resolveHeroLayout } from "@/lib/heroLayout";
import { cn } from "@/lib/cn";

const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
}

/**
 * Rotating words after the headline (Know → Love → Live).
 * "type" types and deletes letter by letter; "fade" cross-fades whole words. Devices that ask for
 * reduced motion (common on Windows, Mac and iPad) get the gentle fade instead of a frozen word.
 */
function TypedWord({ words: raw, mode = "type", speed = 1, hold = false, startEmpty = false, onFirst, noCaret = false }: { words: string[]; mode?: string; speed?: number; hold?: boolean; startEmpty?: boolean; onFirst?: () => void; noCaret?: boolean }) {
  const words = (raw ?? []).map((w) => String(w).trim()).filter(Boolean);
  const key = words.join("|");
  const [i, setI] = useState(0);
  const [n, setN] = useState(startEmpty ? 0 : words[0]?.length ?? 0);
  const first = useRef(false);
  const [del, setDel] = useState(false);
  const reduced = useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false);
  const [shown, setShown] = useState(true);

  const effective = mode === "static" || words.length < 2 ? "static" : reduced || mode === "fade" ? "fade" : "type";
  const k = Math.max(0.4, Math.min(3, speed || 1));

  // typing
  useEffect(() => {
    if (effective !== "type" || hold) return;
    const list = key.split("|");
    const w = list[i % list.length] ?? "";
    if (!first.current && !del && n === w.length) {
      first.current = true;
      onFirst?.();
    }
    const t = setTimeout(
      () => {
        if (!del && n < w.length) setN(n + 1);
        else if (!del) setDel(true);
        else if (n > 0) setN(n - 1);
        else {
          setDel(false);
          setI((x) => x + 1);
        }
      },
      (!del && n === w.length ? 1600 : del ? 55 : 105) / k,
    );
    return () => clearTimeout(t);
  }, [effective, i, n, del, key, k, hold, onFirst]);

  // fading
  useEffect(() => {
    if (effective !== "fade") return;
    const out = setTimeout(() => setShown(false), 2200 / k);
    const next = setTimeout(() => { setI((x) => x + 1); setShown(true); }, 2600 / k);
    return () => { clearTimeout(out); clearTimeout(next); };
  }, [effective, i, k]);

  const w = words[i % Math.max(1, words.length)] ?? "";
  return (
    <span className="text-blueBrand-600" data-typed={effective}>
      {effective === "type" ? (
        <>
          <span aria-hidden>{hold ? "" : w.slice(0, n)}</span>
          {hold ? null : <span aria-hidden className="ml-0.5 inline-block w-[3px] animate-pulse bg-blueBrand-600 align-[-0.05em]" style={{ height: "0.85em", visibility: noCaret ? "hidden" : undefined }} />}
        </>
      ) : (
        <span aria-hidden className="inline-block transition-[opacity,transform] duration-300 ease-out" style={{ opacity: shown ? 1 : 0, transform: shown || reduced ? "none" : "translateY(0.12em)" }}>{w}</span>
      )}
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
      // entrances are CSS (globals.css); only the gentle float runs here, after the chips have popped in
      gsap.to("[data-chip]", { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.4, delay: 1.3 });
    }, el);
    return () => ctx.revert();
  }, []);

  const t = useCopy();
  const [title1, ...rest] = s.heroTitle.split(" ");
  const L = resolveHeroLayout(s.heroLayout as never);
  /** Placement on the desktop canvas; phones/tablets use the stacked classes. */
  const place = (id: string, base: string, mobile = "") => {
    const b = L[id];
    return {
      "data-hero-el": id,
      className: cn(base, mobile, "lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:right-auto lg:bottom-auto lg:m-0 lg:[zoom:var(--s)]", b.w !== undefined ? "lg:w-[var(--w)] lg:max-w-none" : "lg:w-max"),
      style: { "--x": `${b.x}%`, "--y": `${b.y}%`, "--w": `${b.w ?? 0}%`, "--s": b.s ?? 1, zIndex: b.z } as React.CSSProperties,
    };
  };
  const show = (id: string) => !L[id].hidden;

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-0 bg-[linear-gradient(180deg,#EAF1FF_0%,#FBFAF7_100%)] [mask-image:linear-gradient(180deg,#000_55%,transparent)]" />
      <Container className="relative pb-16 pt-10 sm:pt-14 lg:pb-20">
        {/* desktop: a fixed-shape canvas (positions in %, text sized to the canvas) */}
        <div data-hero-canvas className="relative lg:aspect-[1216/660] lg:w-full lg:[container-type:inline-size]">
          <div className="lg:contents">
            {show("badge") ? (
              <div {...place("badge", "")}>
                <div data-h style={{ "--i": 0 } as React.CSSProperties} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold shadow-soft ring-1 ring-ink/5">
                  <span className="h-2 w-2 rounded-full bg-blueBrand-500" /> {s.heroBadge}
                </div>
              </div>
            ) : null}
            {show("heading") ? (
              <h1 {...place("heading", "mt-5 font-display text-[2.9rem] font-extrabold leading-[0.98] sm:text-7xl lg:text-[6.2cqw]")}>
                <span data-h style={{ "--i": 1 } as React.CSSProperties} className="block">{[title1, ...rest].join(" ")}</span>
                {/* only the rotating word types (Know → Love → Live) */}
                <span data-h style={{ "--i": 2 } as React.CSSProperties} className="block min-h-[1em]"><TypedWord words={s.heroWords} mode={s.heroWordsEffect} speed={Number(s.heroWordsSpeed) || 1} startEmpty /></span>
                <span data-h style={{ "--i": 3 } as React.CSSProperties} className="block"><span className="squiggle text-blueBrand-600">{t("home.hero.highlight")}</span></span>
              </h1>
            ) : null}
            {show("subtitle") ? (
              <div {...place("subtitle", "mt-6 max-w-lg")}>
                <p data-h style={{ "--i": 4 } as React.CSSProperties} className="text-lg leading-8 text-ink/65 lg:text-[1.5cqw] lg:leading-[1.7]">{s.heroSubtitle}</p>
              </div>
            ) : null}
            {show("buttons") ? (
              <div {...place("buttons", "mt-7")}>
                <div data-h style={{ "--i": 5 } as React.CSSProperties} className="flex flex-wrap gap-3">
                  <Link href={t("home.hero.cta1Url") || "/classes/"} className="btn btn-primary" data-magnetic>{t("home.hero.cta1")} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                  <Link href={t("home.hero.cta2Url") || "/about/#team"} className="btn btn-ghost" data-magnetic>{t("home.hero.cta2")} <Users className="h-4 w-4" aria-hidden /></Link>
                </div>
              </div>
            ) : null}
            {show("times") ? (
              <ul {...place("times", "mt-7 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6")}>
                {s.serviceTimes.map(parts).map(([a, b], i) => (
                  <li key={a} data-h style={{ "--i": 6 + i * 0.3 } as React.CSSProperties} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blueBrand-500" /><span className="font-semibold">{a}</span> <span className="text-ink/55">· {b}</span></li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="relative mx-auto mt-12 w-full max-w-[520px] lg:static lg:contents">
            {show("image") ? (
              <div {...place("image", "relative")}>
                {s.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.heroImage} alt="" className="aspect-[46/42] w-full rounded-[2.5rem] object-cover shadow-card" />
                ) : (
                  <HeroArt className="w-full drop-shadow-[0_24px_40px_rgba(11,21,48,.15)]" />
                )}
              </div>
            ) : null}
            {show("logo") ? (
              <div {...place("logo", "absolute -left-3 -top-4 w-24 sm:-left-6 sm:w-28")}>
                <div data-chip style={{ "--i": 0 } as React.CSSProperties} className="grid aspect-square w-full place-items-center rounded-full bg-white shadow-card ring-4 ring-sun/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logoUrl || "/brand/logo.png"} alt={`${s.siteName} crest`} width={72} height={81} className="h-[72%] w-auto" />
                </div>
              </div>
            ) : null}
            {show("classes") ? (
              <div {...place("classes", "absolute -right-2 top-6 sm:-right-6")}>
                <div data-chip style={{ "--i": 1 } as React.CSSProperties} className="flex items-center gap-2 rounded-2xl bg-ink px-3 py-2.5 text-white shadow-card">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun text-ink"><Users className="h-5 w-5" aria-hidden /></span>
                  <span className="leading-tight"><span className="block whitespace-nowrap font-display text-base font-bold">{classes.length || 9} classes</span><span className="text-[11px] text-white/65">ages 3 to 13</span></span>
                </div>
              </div>
            ) : null}
            {featured && show("lesson") ? (
              <div {...place("lesson", "absolute -left-2 bottom-20 max-w-[220px] sm:-left-8")}>
                <Link data-chip style={{ "--i": 2 } as React.CSSProperties} href={`/classes/lesson/?c=${featured.classId}&l=${featured.slug}`} className="block rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink/5 lg:max-w-[220px]">
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blueBrand-600"><BookOpen className="h-3.5 w-3.5" aria-hidden /> This Sunday</span>
                  <span className="mt-0.5 block font-display text-base font-bold leading-tight">{featured.title}</span>
                  <span className="text-xs text-ink/55">{featured.bibleRef}</span>
                </Link>
              </div>
            ) : null}
            {show("teachers") ? (
              <div {...place("teachers", "absolute -bottom-3 right-6")}>
                <div data-chip style={{ "--i": 3 } as React.CSSProperties} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-sm font-bold shadow-card ring-1 ring-ink/5">
                  <ShieldCheck className="h-4 w-4 text-mint" aria-hidden /> Safe &amp; trained teachers
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
