"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Download, FileText, Printer } from "lucide-react";
import { Container } from "@/components/site/Container";
import { SplitWords } from "@/components/motion/SplitWords";
import { motionLevel } from "@/components/motion/MotionDirector";
import { downloadUrl } from "@/lib/cms/client";
import { useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { sized } from "@/lib/img";
import type { MilestoneDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

/** Dark "download our full history" pill (reference screenshot 3). Falls back to a print-to-PDF version of this page. */
function printHistory() {
  const el = document.documentElement;
  el.dataset.print = "history";
  const done = () => { delete el.dataset.print; window.removeEventListener("afterprint", done); };
  window.addEventListener("afterprint", done);
  window.print();
}

export function HistoryDownload({ className }: { className?: string }) {
  const s = useSettings();
  const file = s.historyPdf;
  const ext = (file?.split("?")[0].split(".").pop() || "pdf").toUpperCase();
  const inner = (
    <>
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sun text-ink">
        <FileText className="h-7 w-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-display text-lg font-extrabold sm:text-xl">Download our full history</span>
        <span className="block text-sm text-white/65">{file ? `${ext} · the story since 2006` : "Printable PDF · the story since 2006"}</span>
      </span>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-ink transition group-hover:scale-110">
        {file ? <Download className="h-5 w-5" aria-hidden /> : <Printer className="h-5 w-5" aria-hidden />}
      </span>
    </>
  );
  const cls = cn("group no-print flex w-full max-w-xl items-center gap-4 rounded-[1.8rem] bg-ink p-3 pr-4 text-white shadow-[0_24px_50px_-20px_rgba(11,21,48,.6)] transition hover:-translate-y-0.5", className);
  return file ? (
    <a id="history-pdf" href={downloadUrl(file)} className={cls} data-magnetic>{inner}</a>
  ) : (
    <button id="history-pdf" type="button" onClick={printHistory} className={cls} data-magnetic aria-label="Download our full history (opens print — choose Save as PDF)">{inner}</button>
  );
}

function MilestoneRow({ m, i }: { m: MilestoneDoc; i: number }) {
  const left = i % 2 === 0;
  const photo = m.image;
  const extras = (m.images ?? []).slice(0, 3);
  const text = (
    <div data-ms-text className={cn("pb-2", left ? "md:text-right" : "")}>
      <div className="font-display text-5xl font-extrabold leading-none tracking-tight text-blueBrand-600 sm:text-6xl">{m.year}</div>
      <h3 className="mt-3 font-display text-2xl font-extrabold sm:text-[1.7rem]">{m.title}</h3>
      <p className="mt-3 text-[17px] leading-8 text-ink/65">{m.description}</p>
      {extras.length ? (
        <div className={cn("mt-4 flex gap-2", left && "md:justify-end")}>
          {extras.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={sized(u, 180, 180)} alt="" loading="lazy" className="h-16 w-16 rounded-xl object-cover ring-4 ring-white sm:h-20 sm:w-20" />
          ))}
        </div>
      ) : null}
    </div>
  );
  const pic = photo ? (
    <div data-ms-pic className="zoom-img overflow-hidden rounded-[1.8rem] bg-paper shadow-[0_24px_50px_-28px_rgba(11,21,48,.5)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sized(photo, 900, 640)} alt={m.title} loading="lazy" className="aspect-[16/11] w-full object-cover" />
    </div>
  ) : (
    <div data-ms-pic className="hidden md:block" />
  );
  return (
    <li className="relative grid gap-6 pl-16 md:grid-cols-2 md:gap-20 md:pl-0">
      <span
        aria-hidden
        className="absolute left-0 top-1 z-10 grid h-12 w-12 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-white ring-[6px] ring-cream md:left-1/2 md:h-14 md:w-14 md:-translate-x-1/2"
      >
        {m.year.slice(2)}’
      </span>
      {left ? (
        <>
          {text}
          {pic}
        </>
      ) : (
        <>
          <div className="order-2 md:order-1">{pic}</div>
          <div className="order-1 md:order-2">{text}</div>
        </>
      )}
    </li>
  );
}

export function Timeline({ items }: { items: MilestoneDoc[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const s = useSettings();
  useEffect(() => {
    const el = ref.current;
    if (!el || !items.length || motionLevel(s.animationLevel) === "off") return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: el, start: "top 65%", end: "bottom 65%", scrub: true } });
      el.querySelectorAll("li").forEach((li, i) => {
        const fromX = window.innerWidth >= 768 ? (i % 2 ? 60 : -60) : 30;
        gsap.from(li.querySelector("[data-ms-text]"), { x: fromX, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 82%", once: true } });
        gsap.from(li.querySelector("[data-ms-pic]"), { x: -fromX, opacity: 0, scale: 0.94, duration: 1, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 82%", once: true } });
        gsap.from(li.querySelector("span"), { scale: 0, duration: 0.6, ease: "back.out(2)", scrollTrigger: { trigger: li, start: "top 82%", once: true } });
      });
    }, el);
    return () => ctx.revert();
  }, [items.length, s.animationLevel]);
  return (
    <ol ref={ref} className="relative grid gap-16 md:gap-24">
      <span aria-hidden className="absolute bottom-0 left-[22px] top-2 w-[3px] rounded-full bg-ink/10 md:left-1/2 md:-translate-x-1/2" />
      <span aria-hidden data-line className="absolute bottom-0 left-[22px] top-2 w-[3px] rounded-full bg-blueBrand-600 md:left-1/2 md:-translate-x-1/2" />
      {items.map((m, i) => (
        <MilestoneRow key={m.id} m={m} i={i} />
      ))}
    </ol>
  );
}

export function Achievements({ items, title }: { items: MilestoneDoc[]; title: string }) {
  if (!items.length) return null;
  const tones = ["bg-sky-soft", "bg-sun-soft", "bg-[#FFE8E1]", "bg-[#DCFCE7]", "bg-[#EDE9FE]", "bg-white"];
  return (
    <section aria-labelledby="ach-title">
      <h2 id="ach-title" className="text-center font-display text-4xl font-extrabold sm:text-6xl">
        <SplitWords text={title} />
      </h2>
      <ul data-reveal className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <li key={a.id} data-stagger data-tilt="5" className={cn("relative overflow-hidden rounded-[1.8rem] p-6 sm:p-7", tones[i % tones.length], tones[i % tones.length] === "bg-white" && "ring-1 ring-ink/5")}>
            <Award className="absolute right-5 top-5 h-7 w-7 text-ink/15" aria-hidden />
            {a.stat ? <div data-count={a.stat} className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{a.stat}</div> : null}
            <h3 className="mt-2 font-display text-xl font-extrabold">{a.title}</h3>
            <p className="mt-2 leading-7 text-ink/65">{a.description}</p>
            {a.year ? <span className="mt-3 inline-block rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">{a.year}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Timeline, download and achievements — shown as a section of the About page. */
export function HistorySection() {
  const s = useSettings();
  const all = useContent("milestones");
  const timeline = (all ?? []).filter((m) => (m.kind || "milestone") === "milestone").sort((a, b) => a.year.localeCompare(b.year) || a.order - b.order);
  const wins = (all ?? []).filter((m) => m.kind === "achievement");
  return (
    <div className="print-history overflow-x-clip">
      <section id="history" className="scroll-mt-28">
        <Container className="mt-28">
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow">Since 2006</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] sm:text-6xl">
              <SplitWords text={s.historyTitle || "Twenty years of growing faith"} mark="none" />
            </h2>
            {s.historyIntro ? <p data-reveal className="mt-4 max-w-2xl text-lg leading-8 text-ink/65">{s.historyIntro}</p> : null}
            <HistoryDownload className="mt-8" />
          </div>
        </Container>
        <Container className="mt-20 max-w-6xl">
          {all ? <Timeline items={timeline} /> : <div className="h-96 animate-pulse rounded-[2rem] bg-white/60" />}
        </Container>
      </section>
      <section id="achievements" className="scroll-mt-28">
        <Container className="mt-28">
          <Achievements items={wins} title={s.achievementsTitle || "Achievements we give thanks for"} />
        </Container>
      </section>
    </div>
  );
}
