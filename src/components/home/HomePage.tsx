"use client";

import Link from "next/link";
import { ArrowRight, Gamepad2, GraduationCap, Newspaper, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/site/Container";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { getPublic } from "@/lib/cms/client";
import { splitPair, useSettings } from "@/lib/site";
import { fmtDate, upcoming } from "@/lib/format";
import { resolveArt } from "@/lib/art";
import { lessonsForClass } from "@/components/classes/ClassesList";
import type { ClassDoc, EventDoc, LessonDoc, PolicyDoc, TestimonialDoc } from "@/lib/cms/types";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const QUICK = [
  { href: "/classes/", title: "Classes", text: "Find your child’s class, this week’s lesson and printable worksheets.", icon: GraduationCap, tone: "from-blue-500 to-blue-700" },
  { href: "/games/", title: "Bible Games", text: "Quizzes from Genesis to Acts — earn XP, badges and streaks.", icon: Gamepad2, tone: "from-sky-400 to-blue-600" },
  { href: "/register/", title: "Register", text: "Sign up your child in minutes and track their class.", icon: UserPlus, tone: "from-indigo-500 to-navy-800" },
  { href: "/blog/", title: "Blog", text: "Bible stories, devotionals and guides for parents.", icon: Newspaper, tone: "from-blue-400 to-indigo-600" },
];

export function HomePage() {
  const s = useSettings();
  const heroRef = useRef<HTMLDivElement>(null);
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [lessons, setLessons] = useState<LessonDoc[]>([]);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [policies, setPolicies] = useState<PolicyDoc[]>([]);
  const [quotes, setQuotes] = useState<TestimonialDoc[]>([]);

  useEffect(() => {
    getPublic("classes").then((c) => setClasses(c.sort((a, b) => a.order - b.order))).catch(() => {});
    getPublic("lessons").then(setLessons).catch(() => {});
    getPublic("events").then((e) => setEvents(upcoming(e).slice(0, 3))).catch(() => {});
    getPublic("policies").then((p) => setPolicies(p.sort((a, b) => a.order - b.order).slice(0, 6))).catch(() => {});
    getPublic("testimonials").then((t) => setQuotes(t.sort((a, b) => a.order - b.order))).catch(() => {});
  }, []);

  // GSAP hero entrance
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero='chip']", { y: 16, opacity: 0, duration: 0.5 })
        .from("[data-hero='word']", { y: 40, opacity: 0, rotate: 3, duration: 0.7, stagger: 0.05 }, "-=0.2")
        .from("[data-hero='sub']", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from("[data-hero='cta'] > *", { y: 16, opacity: 0, scale: 0.96, duration: 0.5, stagger: 0.08 }, "-=0.3")
        .from("[data-hero='card']", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.4");
    }, el);
    return () => ctx.revert();
  }, []);

  const weekly = classes
    .map((c) => ({ c, l: lessonsForClass(lessons, c.id).current }))
    .filter((x): x is { c: ClassDoc; l: LessonDoc } => Boolean(x.l));

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section ref={heroRef} className="bg-hero-blue relative overflow-hidden text-white">
        <HeroScene className="pointer-events-none absolute inset-0 opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-900/70 via-navy-900/30 to-transparent" />
        <Container className="relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <div data-hero="chip" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold ring-1 ring-white/20 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sun-400" />
              {s.serviceTimes[0] ?? "Sundays"}
            </div>
            <h1 className="mt-5 font-[family-name:var(--font-heading)] text-4xl leading-[1.05] sm:text-6xl text-balance">
              {s.heroTitle.split(" ").map((w, i) => (
                <span key={i}>
                  <span data-hero="word" className="inline-block">{w}</span>{" "}
                </span>
              ))}
            </h1>
            <p data-hero="sub" className="mt-5 max-w-xl text-lg leading-8 text-white/80">{s.heroSubtitle}</p>
            <div data-hero="cta" className="mt-8 flex flex-wrap gap-3">
              <Link href="/register/" className="rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-navy-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                Register your child
              </Link>
              <Link href="/classes/" className="rounded-full bg-white/10 px-6 py-3.5 text-sm font-bold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20">
                Explore classes →
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {[
              { k: "Ages", v: "2–17", t: "8 classes by age" },
              { k: "Every Sunday", v: "9:00", t: "Bible lessons & worship" },
              { k: "Safe", v: "✓", t: "Secure check-in & vetted teachers" },
              { k: "Play", v: "640+", t: "Bible quiz questions" },
            ].map((x) => (
              <div key={x.k} data-hero="card" className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-md">
                <div className="text-xs font-bold uppercase tracking-widest text-blueBrand-200">{x.k}</div>
                <div className="mt-1 font-[family-name:var(--font-heading)] text-3xl">{x.v}</div>
                <div className="text-sm text-white/70">{x.t}</div>
              </div>
            ))}
          </div>
        </Container>
        <svg className="relative block w-full text-white" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path d="M0 60V30c240-40 480-40 720-10s480 30 720-10v50z" fill="currentColor" />
        </svg>
      </section>

      {/* ---------------- QUICK NAV ---------------- */}
      <Container className="relative -mt-6">
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              data-stagger
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(10,31,68,0.15)]"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${q.tone} text-white shadow-soft transition group-hover:scale-110 group-hover:-rotate-6`}>
                <q.icon className="h-6 w-6" aria-hidden strokeWidth={2} />
              </span>
              <div className="mt-4 font-[family-name:var(--font-heading)] text-xl text-navy-900">{q.title}</div>
              <p className="mt-1 text-sm leading-6 text-black/60">{q.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blueBrand-700 transition group-hover:translate-x-1">Open <ArrowRight className="h-4 w-4" aria-hidden /></span>
            </Link>
          ))}
        </Reveal>
      </Container>

      {/* ---------------- WELCOME VIDEO ---------------- */}
      {s.welcomeVideoUrl ? (
        <Container className="mt-24">
          <Reveal className="grid items-center gap-10 lg:grid-cols-2">
            <div data-stagger>
              <SectionHeading eyebrow="Welcome" title="Come and see what Sundays look like" intro={s.mission} />
            </div>
            <div data-stagger>
              <VideoEmbed url={s.welcomeVideoUrl} title="Welcome to the children’s service" />
            </div>
          </Reveal>
        </Container>
      ) : null}

      {/* ---------------- THIS WEEK ---------------- */}
      <section className="mt-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="This week in class" title="What every class is learning" intro="Each class has its own lesson hub with the Bible story, objectives and printable activities." />
            <Link href="/classes/" className="text-sm font-bold text-blueBrand-700">All classes →</Link>
          </div>
        </Container>
        <div className="mt-8 overflow-x-auto pb-4 [scrollbar-width:none]">
          <Reveal className="flex w-max gap-4 px-[max(1rem,calc((100vw-72rem)/2+1.5rem))]">
            {(weekly.length ? weekly : []).map(({ c, l }) => (
              <Link
                key={c.id}
                href={`/classes/view/?id=${c.id}`}
                data-stagger
                className="group w-72 shrink-0 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5 transition hover:-translate-y-1"
              >
                <div className="relative aspect-[12/6] overflow-hidden" style={{ background: c.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveArt(l.bannerUrl, "banner", l, c)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: c.color }}>
                    {c.name}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">{l.bibleRef}</div>
                  <div className="mt-1 font-[family-name:var(--font-heading)] text-lg leading-snug text-navy-900">{l.title}</div>
                </div>
              </Link>
            ))}
            {!weekly.length ? <div className="h-48 w-72 animate-pulse rounded-3xl bg-sky-soft" /> : null}
          </Reveal>
        </div>
      </section>

      {/* ---------------- EVENTS ---------------- */}
      <section className="bg-soft-blue mt-20 py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Coming up" title="Upcoming events" />
            <Link href="/events/" className="text-sm font-bold text-blueBrand-700">All events →</Link>
          </div>
          <Reveal className="mt-8 grid gap-4 md:grid-cols-3">
            {events.map((e) => {
              const d = new Date(e.date + "T12:00:00");
              return (
                <Link key={e.id} href={`/events/#${e.id}`} data-stagger className="group flex gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-card">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-blueBrand-600 text-center text-white">
                    <div>
                      <div className="text-2xl font-extrabold leading-none">{d.getDate()}</div>
                      <div className="text-[11px] font-bold uppercase">{d.toLocaleDateString("en-GB", { month: "short" })}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-[family-name:var(--font-heading)] text-lg leading-snug text-navy-900">{e.title}</div>
                    <div className="text-sm text-black/55">{e.startTime} • {e.location}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-black/65">{e.description}</p>
                  </div>
                </Link>
              );
            })}
            {!events.length ? <p className="text-sm text-black/50">New events will appear here soon.</p> : null}
          </Reveal>
        </Container>
      </section>

      {/* ---------------- TRUST ---------------- */}
      <section className="py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="For parents" title="Your child is safe with us" intro="Clear policies, trained teachers and open communication — so you can relax and worship too." />
            <Reveal className="mt-8 grid gap-3 sm:grid-cols-2">
              {policies.map((p) => (
                <div key={p.id} data-stagger className="rounded-2xl bg-sky-soft p-4">
                  <div className="text-2xl">{p.icon}</div>
                  <div className="mt-2 font-bold text-navy-900">{p.title}</div>
                  <div className="text-sm leading-6 text-black/60">{p.description}</div>
                </div>
              ))}
            </Reveal>
            <Link href="/about/" className="mt-6 inline-block text-sm font-bold text-blueBrand-700">Read our safety policies →</Link>
          </div>
          <Testimonials quotes={quotes} />
        </Container>
      </section>

      {/* ---------------- GAMES + COLLECTION ---------------- */}
      <Container>
        <Reveal className="grid gap-5 lg:grid-cols-2">
          <Link href="/games/" data-stagger className="group relative overflow-hidden rounded-[2rem] bg-hero-blue p-8 text-white shadow-card sm:p-10">
            <div className="absolute -right-6 -top-6 text-[9rem] opacity-20 transition duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden>🦁</div>
            <div className="text-xs font-bold uppercase tracking-widest text-blueBrand-200">Bible Games</div>
            <div className="mt-2 max-w-sm font-[family-name:var(--font-heading)] text-3xl leading-tight">Play, learn and climb the leaderboard</div>
            <p className="mt-3 max-w-sm text-white/75">Pick a mascot, choose a level and answer questions on 16 Bible stories.</p>
            <span className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-navy-900">Play now</span>
          </Link>
          <Link href="/shop/" data-stagger className="group relative overflow-hidden rounded-[2rem] bg-[#EEEDE8] p-8 shadow-card sm:p-10">
            <div className="absolute right-6 top-6 flex gap-2" aria-hidden>
              {["#F4B6C2", "#14161C", "#F5D33A"].map((c, i) => (
                <span key={c} className="h-16 w-8 origin-top rounded-md shadow transition duration-500 group-hover:rotate-6" style={{ background: c, transitionDelay: `${i * 60}ms` }} />
              ))}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-black/50">The Collection</div>
            <div className="mt-2 max-w-sm font-[family-name:var(--font-heading)] text-3xl leading-tight text-ink-950">Wear your faith — tees & hoodies</div>
            <p className="mt-3 max-w-sm text-black/60">Browse the rack, tap a colour tag and see it change instantly.</p>
            <span className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm font-extrabold text-white">See the collection</span>
          </Link>
        </Reveal>
      </Container>

      {/* ---------------- STATS ---------------- */}
      <Container className="mt-20">
        <Stats items={s.impactStats.map(splitPair)} />
      </Container>

      {/* ---------------- CTA ---------------- */}
      <Container className="mt-20">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_0%,rgba(59,130,246,0.45),transparent_60%)]" />
          <div className="relative">
            <h2 data-stagger className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">Ready to join us this Sunday?</h2>
            <p data-stagger className="mx-auto mt-3 max-w-xl text-white/70">Create a parent account to register your children, follow their class and celebrate their Bible game badges.</p>
            <div data-stagger className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/account/" className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-navy-900">Create parent account</Link>
              <Link href="/contact/" className="rounded-full px-6 py-3 text-sm font-bold ring-1 ring-white/30">Ask a question</Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

function Testimonials({ quotes }: { quotes: TestimonialDoc[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (quotes.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, [quotes.length]);
  const q = quotes[i];
  return (
    <div className="relative flex min-h-80 flex-col justify-between overflow-hidden rounded-[2rem] bg-hero-blue p-8 text-white shadow-card sm:p-10">
      <div className="font-[family-name:var(--font-heading)] text-7xl leading-none text-blueBrand-300/60" aria-hidden>“</div>
      <AnimatePresence mode="wait">
        {q ? (
          <motion.blockquote key={q.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }}>
            <p className="font-[family-name:var(--font-heading)] text-2xl leading-snug sm:text-3xl">{q.quote}</p>
            <footer className="mt-5 text-sm text-white/70">
              <b className="text-white">{q.name}</b> · {q.role}
            </footer>
          </motion.blockquote>
        ) : null}
      </AnimatePresence>
      {quotes.length > 1 ? (
        <div className="mt-6 flex gap-2" role="tablist" aria-label="Testimonials">
          {quotes.map((x, j) => (
            <button key={x.id} type="button" role="tab" aria-selected={i === j} aria-label={`Testimonial ${j + 1}`} onClick={() => setI(j)} className={`h-2 rounded-full transition-all ${i === j ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stats({ items }: { items: { label: string; value: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
        const raw = n.dataset.count ?? "";
        const num = parseFloat(raw);
        if (isNaN(num) || /[–-]/.test(raw)) return;
        const suffix = raw.replace(/^[\d.]+/, "");
        // the real value stays in the markup until the stats scroll into view
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            const o = { v: 0 };
            gsap.to(o, {
              v: num,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                n.textContent = Math.round(o.v) + suffix;
              },
            });
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [items]);
  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((x) => (
        <div key={x.label} className="rounded-3xl bg-sky-soft p-6 text-center">
          <div data-count={x.value} className="font-[family-name:var(--font-heading)] text-4xl text-blueBrand-700">{x.value}</div>
          <div className="mt-1 text-sm font-semibold text-black/60">{x.label}</div>
        </div>
      ))}
    </div>
  );
}
