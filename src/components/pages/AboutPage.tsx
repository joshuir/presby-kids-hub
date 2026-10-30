"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Eye, Heart, Sparkles, Star, Sun } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { TeamRoster } from "@/components/blocks/TeamRoster";
import { AppPromo } from "@/components/blocks/AppPromo";
import { HistorySection } from "@/components/history/HistoryPage";
import { parts, useCopy, useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { resolveLayout } from "@/lib/layout";
import { ContentBlock } from "@/components/blocks/ContentBlock";

type SectionId = "about-us" | "team" | "history" | "achievements";
const IDS: SectionId[] = ["about-us", "team", "history", "achievements"];
const DEFAULT_LABEL: Record<SectionId, string> = { "about-us": "Vision & mission", team: "Our team", history: "History", achievements: "Achievements" };

/** Sections in CMS order (Settings → About page → Sections); unknown ids are ignored, missing ones added at the end. */
function useSections(lines?: string[]) {
  const listed = (lines ?? [])
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter(([id]) => IDS.includes(id as SectionId))
    .map(([id, label, show]) => ({ id: id as SectionId, label: label || DEFAULT_LABEL[id as SectionId], show: (show || "yes").toLowerCase() !== "no" }));
  IDS.forEach((id) => { if (!listed.some((x) => x.id === id)) listed.push({ id, label: DEFAULT_LABEL[id], show: true }); });
  return listed.filter((x) => x.show);
}

/** Sticky jump-links for the About page; highlights the section in view. */
function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const SECTIONS = sections.map((x) => [x.id, x.label] as const);
  const [active, setActive] = useState<string>(SECTIONS[0]?.[0] ?? "");
  const bar = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = bar.current;
    const a = ul?.querySelector<HTMLElement>('[aria-current="true"]');
    if (ul && a && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SECTIONS.map((x) => x[0]).join()]);
  return (
    <nav aria-label="On this page" className="print-skip sticky top-[84px] z-30 mt-8 flex justify-center px-4">
      <ul ref={bar} className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-ink/10 bg-white/85 p-1.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,.25)] backdrop-blur">
        {SECTIONS.map(([id, label]) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className={`block rounded-full px-4 py-2 text-sm font-bold transition ${active === id ? "bg-ink text-white" : "text-ink/65 hover:bg-ink/5 hover:text-ink"}`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AboutPage() {
  const s = useSettings();
  const t = useCopy();
  const blocks = useContent("blocks");
  const legacy = useSections(s.aboutSections);
  const labelOf = (id: string) => legacy.find((x) => x.id === id)?.label ?? DEFAULT_LABEL[id as SectionId] ?? id;
  // CMS → Page layouts wins; older sites fall back to Settings → About sections
  const order = resolveLayout("about", s.layouts?.about ?? [{ id: "hero" }, ...legacy.map((x) => ({ id: x.id }))]).filter((x) => !x.hidden);
  const navItems = order.filter((x) => IDS.includes(x.id as SectionId)).map((x) => ({ id: x.id, label: labelOf(x.id) }));
  const chipIcons = [Heart, Star, Sun, Sparkles];
  const chipTones = ["bg-[#FFE8E1] text-[#C2410C]", "bg-sky-soft text-blueBrand-700", "bg-sun-soft text-[#9A6400]", "bg-[#DCFCE7] text-[#15803D]"];
  const chips = t("about.chips").split("|").map((x) => x.trim()).filter(Boolean);
  const hero = (
    <div className="print-skip"><PageHero page="about" eyebrow="About us" title={s.aboutTitle} intro={s.aboutSubtitle}>
      {chips.length ? (
        <ul className="flex flex-wrap gap-2">
          {chips.map((l, i) => {
            const Icon = chipIcons[i % 4];
            return (
              <li key={l + i} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-extrabold ${chipTones[i % 4]}`}>
                <Icon className="h-4 w-4" aria-hidden /> {l}
              </li>
            );
          })}
        </ul>
      ) : null}
    </PageHero></div>
  );
  const firstBuiltIn = order.findIndex((x) => IDS.includes(x.id as SectionId));
  return (
    <div>
      {order.map(({ id }, idx) => {
        if (id === "hero") return <Fragment key={id}>{hero}</Fragment>;
        if (id.startsWith("block:")) {
          const b = blocks?.find((x) => x.id === id.slice(6));
          return b ? <ContentBlock key={id} b={b} /> : null;
        }
        // the jump bar sits just above the first built-in section
        const nav = idx === firstBuiltIn && navItems.length > 1 ? <SectionNav sections={navItems} /> : null;
        const body =
          id === "about-us" ? <VisionMission /> :
          id === "team" ? (
            <section id="team" className="print-skip scroll-mt-28">
              <Container className="mt-28">
                <TeamRoster />
              </Container>
            </section>
          ) : <HistorySection part={id as "history" | "achievements"} />;
        return <Fragment key={id}>{nav}{body}</Fragment>;
      })}

      <div className="print-skip"><AppPromo /></div>
    </div>
  );
}

function VisionMission() {
  const s = useSettings();
  return (
      <section id="about-us" className="print-skip scroll-mt-28">
      <Container className="mt-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white sm:p-10" >
            <Eye className="h-10 w-10 text-sun" aria-hidden />
            <h2 className="mt-4 font-display text-3xl font-extrabold">{s.visionTitle || "Our vision"}</h2>
            <p className="mt-3 text-xl leading-8 text-white/80">{s.vision}</p>
          </Reveal>
          <div className="card p-7 sm:p-10">
            <h2 className="font-display text-3xl font-extrabold">{s.missionTitle || "Our mission"}</h2>
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
      </section>
  );
}
