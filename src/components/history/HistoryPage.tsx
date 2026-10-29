"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/ui/Reveal";
import { RichText } from "@/components/ui/RichText";
import { downloadUrl, getPublic } from "@/lib/cms/client";
import { useSettings } from "@/lib/site";
import type { ConstitutionDoc, MilestoneDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

export function HistoryPage() {
  const s = useSettings();
  const [milestones, setMilestones] = useState<MilestoneDoc[]>([]);
  const [sections, setSections] = useState<ConstitutionDoc[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPublic("milestones").then((m) => setMilestones(m.sort((a, b) => a.order - b.order))).catch(() => {});
    getPublic("constitution").then((c) => {
      const sorted = c.sort((a, b) => a.order - b.order);
      setSections(sorted);
      setOpen(sorted[0]?.id ?? null);
    }).catch(() => {});
  }, []);

  // timeline line draws as you scroll; items slide in from alternating sides
  useEffect(() => {
    const el = lineRef.current;
    if (!el || !milestones.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: true } });
      el.querySelectorAll<HTMLElement>("[data-ms]").forEach((item, i) => {
        gsap.from(item, { x: i % 2 ? 40 : -40, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 85%", once: true } });
        gsap.from(item.querySelector("[data-dot]"), { scale: 0, duration: 0.5, ease: "back.out(3)", scrollTrigger: { trigger: item, start: "top 80%", once: true } });
      });
    }, el);
    return () => ctx.revert();
  }, [milestones]);

  const printConstitution = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    w.document.write(`<!doctype html><title>Constitution — ${esc(s.siteName)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.7;color:#111}h1{font-size:28px}h2{font-size:19px;margin-top:28px}</style><h1>${esc(s.siteName)} — Constitution</h1><p>${esc(s.churchName)}</p>${sections.map((c, i) => `<h2>${i + 1}. ${esc(c.title)}</h2><p>${esc(c.body).replace(/\n\n/g, "</p><p>")}</p>`).join("")}<script>print()</script>`);
    w.document.close();
  };

  return (
    <div>
      <PageHero eyebrow="Governance & transparency" title="History & Constitution" intro="How our ministry began, how it has grown, and the rules that guide how we care for every child.">
        <div className="flex flex-wrap gap-2">
          <a href="#history" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-navy-900">Our history</a>
          <a href="#constitution" className="rounded-full px-5 py-2.5 text-sm font-bold ring-1 ring-white/40">Constitution</a>
          {s.constitutionPdf ? (
            <a href={downloadUrl(s.constitutionPdf)} className="rounded-full px-5 py-2.5 text-sm font-bold ring-1 ring-white/40">Download PDF ↓</a>
          ) : (
            <button type="button" onClick={printConstitution} className="rounded-full px-5 py-2.5 text-sm font-bold ring-1 ring-white/40">Save as PDF ↓</button>
          )}
        </div>
      </PageHero>

      {/* timeline */}
      <section id="history" className="scroll-mt-24 py-20">
        <Container>
          <SectionHeading eyebrow="Our story" title="Ministry history" intro={s.historyIntro} center />
          <div ref={lineRef} className="relative mx-auto mt-14 max-w-4xl">
            <div className="absolute bottom-0 left-5 top-0 w-1 rounded-full bg-blueBrand-100 md:left-1/2 md:-translate-x-1/2" />
            <div data-line className="absolute bottom-0 left-5 top-0 w-1 rounded-full bg-gradient-to-b from-blueBrand-400 to-navy-800 md:left-1/2 md:-translate-x-1/2" />
            <ol className="grid gap-10">
              {milestones.map((m, i) => (
                <li key={m.id} data-ms className={cn("relative grid pl-14 md:grid-cols-2 md:pl-0", i % 2 === 1 && "md:[&>div]:col-start-2")}>
                  <span data-dot className="absolute left-5 top-6 z-10 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full bg-white ring-4 ring-blueBrand-500 md:left-1/2" />
                  <div className={cn("rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5", i % 2 ? "md:ml-10" : "md:mr-10")}>
                    <div className="font-[family-name:var(--font-heading)] text-3xl text-blueBrand-600">{m.year}</div>
                    <div className="mt-1 font-[family-name:var(--font-heading)] text-xl text-navy-900">{m.title}</div>
                    <p className="mt-2 text-sm leading-6 text-black/65">{m.description}</p>
                    {m.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image} alt="" loading="lazy" className="mt-4 aspect-video w-full rounded-2xl object-cover" />
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* constitution */}
      <section id="constitution" className="bg-soft-blue scroll-mt-24 py-20">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="Governance" title="Constitution of the children’s ministry" intro="Tap a section to read it in full." />
          <div className="mt-8 grid gap-3">
            {sections.map((c, i) => {
              const isOpen = open === c.id;
              return (
                <div key={c.id} className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : c.id)}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left"
                  >
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold", isOpen ? "bg-blueBrand-600 text-white" : "bg-sky-soft text-blueBrand-700")}>{i + 1}</span>
                    <span className="flex-1 font-[family-name:var(--font-heading)] text-lg text-navy-900">{c.title}</span>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-2xl text-blueBrand-600" aria-hidden>+</motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-6 pb-6 pl-[4.75rem] text-black/75">
                          <RichText text={c.body} />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
}
