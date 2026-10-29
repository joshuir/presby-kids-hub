"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookHeart, BookOpen, Gamepad2, HandHeart, Heart, Music, Quote, Shirt, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/site/Container";
import { Reveal, SectionHeading, Eyebrow } from "@/components/ui/Reveal";
import { GroupArt } from "@/components/art/Illustrations";
import { Buddy } from "@/components/games/Mascot";
import { GalleryRail } from "@/components/gallery/GalleryRail";
import { TeamRoster } from "@/components/blocks/TeamRoster";
import { PhotoWall } from "./PhotoWall";
import { KIDS, kid, sized } from "@/lib/img";
import { MonthCalendar } from "@/components/blocks/MonthCalendar";
import { EventCard } from "@/components/blocks/EventCard";
import { PostCard } from "@/components/blocks/PostCard";
import { AppPromo } from "@/components/blocks/AppPromo";
import { Socials } from "@/components/blocks/Socials";
import { Faqs } from "@/components/blocks/Faqs";
import { Newsletter } from "@/components/blocks/Newsletter";
import { Garment } from "@/components/shop/Garment";
import { Hero } from "./Hero";
import { parts, useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { classLessons } from "@/lib/format";


const STEP_ICONS = [Music, BookHeart, Sparkles, ShieldCheck];
const STEP_TONES = ["bg-sky-soft text-blueBrand-700", "bg-sun-soft text-[#9A6400]", "bg-[#FFE8E1] text-[#C2410C]", "bg-[#DCFCE7] text-[#15803D]"];

/** blue · sun · navy · mint — the original site's stat-card colours */
const STAT_TONES = [
  ["bg-blueBrand-600 text-white", "text-white/75"],
  ["bg-sun text-ink", "text-ink/65"],
  ["bg-ink text-white", "text-white/70"],
  ["bg-[#DCFCE7] text-ink", "text-ink/60"],
] as const;

const STAT_ICONS = [BookOpen, Users, Heart, Sparkles];

/** 2 × 2 grid that fills the space beside the welcome card; numbers scale with the card so nothing overflows. */
function Stats() {
  const s = useSettings();
  return (
    <div data-reveal className="grid h-full grid-cols-2 gap-3 sm:gap-4">
      {s.stats.map(parts).map(([label, value], i) => {
        const Icon = STAT_ICONS[i % 4];
        return (
          <div
            key={label}
            data-stagger
            data-tilt="6"
            data-card
            className={`relative flex min-h-[150px] min-w-0 flex-col justify-between overflow-hidden rounded-[1.6rem] p-5 sm:min-h-[180px] sm:p-6 [container-type:inline-size] ${STAT_TONES[i % 4][0]}`}
          >
            <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
            <Icon className={`relative h-6 w-6 ${STAT_TONES[i % 4][1]}`} aria-hidden />
            <div className="relative">
              <div data-count={value} className="font-display font-extrabold leading-none tracking-tight text-[clamp(2.1rem,24cqw,3.6rem)]">{value}</div>
              <div className={`mt-2 text-sm font-bold leading-snug sm:text-[15px] ${STAT_TONES[i % 4][1]}`}>{label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const GROUP_PHOTOS: Record<string, keyof typeof KIDS> = { beginners: "toddler", primary: "girlSmile", juniors: "boysGreen", seniors: "fiveBoys" };

/** The child's mascot peeks at the cursor on the games card. */
function GamesBuddy() {
  const [hover, setHover] = useState(false);
  return (
    <span onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} className="block">
      <Buddy kind="lion" color="#F59E0B" mood={hover ? "cheer" : "wave"} size={120} />
    </span>
  );
}

export function HomePage() {
  const s = useSettings();
  const classes = useContent("classes") ?? [];
  const lessons = useContent("lessons") ?? [];
  const events = useContent("events") ?? [];
  const postsRaw = useContent("posts");
  const posts = useMemo(() => postsRaw ?? [], [postsRaw]);
  const teachers = useContent("teachers") ?? [];
  const gallery = useContent("gallery") ?? [];
  const products = useContent("products") ?? [];
  const units = useContent("units") ?? [];
  const [month, setMonth] = useState(() => new Date());
  const [day, setDay] = useState<string | null>(null);

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthEvents = events.filter((e) => e.date.startsWith(monthKey));
  const shown = (day ? events.filter((e) => e.date === day) : monthEvents.length ? monthEvents : events.filter((e) => e.date > monthKey).slice(0, 2));
  const featured = lessons.find((l) => l.id === s.featuredLessonId) ?? classLessons(lessons, classes[0]?.id ?? "").current;
  const featuredClass = classes.find((c) => c.id === featured?.classId);
  const feed = useMemo(() => [...posts].sort((a, b) => (b.pinned === "yes" ? 1 : 0) - (a.pinned === "yes" ? 1 : 0) || b.date.localeCompare(a.date)).slice(0, 3), [posts]);
  const albums = gallery.filter((g) => g.featured === "yes");
  const product = products[0];

  return (
    <div>
      <Hero />
      <PhotoWall />

      {/* welcome + stats */}
      <Container className="mt-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <Reveal className="card relative overflow-hidden p-6 sm:p-8" >
            <Quote className="h-10 w-10 text-sun" aria-hidden />
            <h2 className="mt-3 font-display text-3xl font-extrabold">{s.welcomeTitle}</h2>
            <p className="mt-3 text-lg leading-8 text-ink/70">{s.welcomeText}</p>
            <div className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="" width={40} height={45} />
              <div>
                <div className="font-bold">{s.welcomeName}</div>
                <div className="text-sm text-ink/55">{s.welcomeRole}</div>
              </div>
            </div>
          </Reveal>
          <Reveal className="h-full"><Stats /></Reveal>
        </div>
      </Container>

      {/* sunday */}
      <Container className="mt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto aspect-[42/36] w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 right-[16%] overflow-hidden rounded-[2.2rem] shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-parallax="0.12" src={s.sundayImage ? sized(s.sundayImage, 1100, 900) : kid("classroom", 1100, 900)} alt="Children worshipping together on a Sunday" className="h-[118%] w-full object-cover" />
              </div>
              <div data-parallax="-0.35" className="absolute -bottom-6 right-0 w-[40%] overflow-hidden rounded-[1.6rem] border-[6px] border-cream shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kid("girlLaugh", 500, 600)} alt="" className="aspect-[5/6] w-full object-cover" />
              </div>
              <div data-parallax="-0.6" className="absolute -left-3 top-6 rounded-2xl bg-white px-4 py-3 shadow-xl">
                <div className="text-xs font-extrabold uppercase tracking-wider text-blueBrand-600">Every Sunday</div>
                <div className="font-display text-lg font-extrabold">9:00 – 10:45 am</div>
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="Our children's service" title={s.sundayTitle} intro={s.sundayIntro} tone="sun" />
            <Reveal className="mt-6 grid gap-3 sm:grid-cols-2">
              {s.sundaySteps.map(parts).map(([t, d], i) => {
                const Icon = STEP_ICONS[i % 4];
                return (
                  <div key={t} data-stagger data-tilt="6" className="card p-4">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${STEP_TONES[i % 4]}`}><Icon className="h-5 w-5" aria-hidden /></span>
                    <div className="mt-3 font-display text-lg font-bold">{t}</div>
                    <p className="mt-1 text-sm leading-6 text-ink/60">{d}</p>
                  </div>
                );
              })}
            </Reveal>
            <Link href="/about/" className="btn btn-ghost mt-6" data-magnetic>More about us <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </div>
      </Container>

      {/* classes */}
      <Container className="mt-24">
        <SectionHeading eyebrow="Classes" title="A class for every age" intro="Four groups. Nine classes. One Bible story each week." />
        <Reveal watch={classes.length} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.groups.map(parts).map(([key, label, ages, desc, photo]) => (
            <Link key={key} data-stagger data-tilt="5" data-cursor="Explore" href={`/classes/#${key}`} className="group card overflow-hidden">
              <div className="relative">
                {photo || GROUP_PHOTOS[key] ? (
                  <div className="zoom-img aspect-[16/11]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo ? sized(photo, 600, 420) : kid(GROUP_PHOTOS[key], 600, 420)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <GroupArt group={key} className="aspect-[16/9] w-full" />
                )}
                <span className="eyebrow absolute left-3 top-3 bg-white/90 text-ink">{ages}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-extrabold">{label}</h3>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-paper transition group-hover:bg-blueBrand-600 group-hover:text-white"><ArrowRight className="h-4 w-4 -rotate-45" aria-hidden /></span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/60">{desc}</p>
                <div className="mt-3 text-xs font-bold text-ink/45">{classes.filter((c) => c.group === key).length} classes</div>
              </div>
            </Link>
          ))}
        </Reveal>
      </Container>

      {/* events */}
      <Container className="mt-24">
        <SectionHeading eyebrow="Coming up" title="Upcoming activities" intro="Tap a date to see what's on." action={{ href: "/events/", label: "Events calendar" }} tone="coral" />
        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1fr_1.2fr]">
          <MonthCalendar events={events} month={month} onMonth={setMonth} selected={day} onSelect={setDay} compact />
          <div className="grid gap-3">
            <div className="text-sm font-extrabold uppercase tracking-wider text-ink/45">
              {day ? new Date(day + "T12:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : monthEvents.length ? `In ${month.toLocaleDateString("en-GB", { month: "long" })}` : "Next up"}
            </div>
            {shown.map((e) => <EventCard key={e.id} e={e} />)}
            {!shown.length ? <p className="card p-6 text-ink/55">Nothing planned yet — check back soon.</p> : null}
            <Link href="/events/" className="text-sm font-bold text-blueBrand-700">Full calendar →</Link>
          </div>
        </div>
      </Container>

      {/* featured lesson */}
      {featured ? (
        <section className="relative mt-24 overflow-hidden bg-ink py-16 text-white sm:py-24">
          <span aria-hidden className="pointer-events-none absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-blueBrand-600/30 blur-3xl" />
          <span aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-sun/15 blur-3xl" />
          <div aria-hidden className="dot-grid absolute inset-0 opacity-[0.12]" />
          <Container className="relative">
          <Reveal>
            <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <Eyebrow tone="white">Featured Bible lesson · {new Date(featured.lessonDate + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</Eyebrow>
                <h2 className="mt-3 font-display text-4xl font-extrabold sm:text-6xl">{featured.title}</h2>
                <p className="mt-2 text-lg font-semibold text-white/80">{featured.bibleRef} · {featured.topic}</p>
                <p className="mt-3 max-w-lg text-white/75">Every class explores this passage on Sunday. Keep the conversation going at home.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/classes/lesson/?c=${featured.classId}&l=${featured.slug}`} className="btn btn-sun" data-magnetic>Read the lesson</Link>
                </div>
              </div>
              <figure className="rounded-[1.6rem] bg-white p-6 text-ink shadow-[8px_8px_0_#FFC53D] sm:p-8">
                <figcaption className="text-xs font-extrabold uppercase tracking-wider text-blueBrand-600">Memory verse</figcaption>
                <blockquote data-scrub-words className="mt-2 font-display text-3xl font-extrabold leading-tight">
                  {`“${featured.memoryVerse}”`.split(" ").map((w, i) => (
                    <span key={i} data-w className="inline-block pr-[0.22em]">{w}</span>
                  ))}
                </blockquote>
                <p className="mt-3 text-sm font-bold text-ink/55">{featured.memoryRef}{featuredClass ? ` · ${featuredClass.name} version` : ""}</p>
              </figure>
            </div>
          </Reveal>
          </Container>
        </section>
      ) : null}

      {/* kids zone */}
      <Container className="mt-24">
        <SectionHeading eyebrow="Kids Zone" title="Play, learn and wear your faith" intro="Bible games that grow with your child, and a clothing collection you can try in every colour." tone="mint" />
        <Reveal className="mt-8 grid gap-4 lg:grid-cols-2">
          <Link data-stagger data-tilt="4" data-cursor="Play" href="/games/" className="group relative overflow-hidden rounded-[2rem] bg-[#58CC02] p-6 text-white shadow-[0_6px_0_#46A302] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow bg-white/20 text-white"><Gamepad2 className="h-3.5 w-3.5" aria-hidden /> Bible Games</span>
                <h3 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Climb the Bible path</h3>
                <p className="mt-2 max-w-sm text-white/85">{units.length || 6} story units, four levels each, streaks, badges and a mascot who cheers you on.</p>
              </div>
              <span className="-mr-2 -mt-4 shrink-0" aria-hidden><GamesBuddy /></span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
              {units.slice(0, 6).map((u) => (
                <span key={u.id} className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-2xl shadow-[0_4px_0_rgba(0,0,0,.15)]">{u.icon}</span>
              ))}
            </div>
            <span className="btn mt-6 bg-white text-[#46A302]">Start playing <ArrowRight className="h-4 w-4" aria-hidden /></span>
          </Link>
          <Link data-stagger data-tilt="4" data-cursor="Shop" href="/collection/" className="group relative overflow-hidden rounded-[2rem] bg-[#EEEDE8] p-6 sm:p-8">
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_190px]">
              <div>
                <span className="eyebrow bg-white text-ink"><Shirt className="h-3.5 w-3.5" aria-hidden /> Clothing Collection</span>
                <h3 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Wear your faith</h3>
                <p className="mt-2 max-w-sm text-ink/65">Tees and hoodies on the rack — tap a colour tag, flip front and back, or shuffle.</p>
                <span className="btn btn-dark mt-6">See the collection <ArrowRight className="h-4 w-4" aria-hidden /></span>
              </div>
              {product ? (
                <div style={{ ["--garment" as string]: product.colorways[0]?.hex }} className="mx-auto w-40 transition duration-500 group-hover:-rotate-6 sm:w-full">
                  <Garment product={product} side="front" colorway={product.colorways[0]} printHex={product.colorways[0]?.printHex ?? "#fff"} className="w-full drop-shadow-xl" />
                </div>
              ) : null}
            </div>
          </Link>
        </Reveal>
      </Container>

      {/* feed */}
      <Container className="mt-24">
        <SectionHeading eyebrow="From the feed" title="Latest from our classrooms" action={{ href: "/blog/", label: "Open the feed" }} />
        <Reveal watch={feed.length} className="mt-8 grid gap-4 md:grid-cols-3">
          {feed.map((p, i) => (
            <div key={p.id} data-stagger>
              <PostCard post={p} author={teachers.find((t) => t.id === p.authorId)} event={events.find((e) => e.id === p.eventId)} compact index={i} />
            </div>
          ))}
        </Reveal>
      </Container>

      {/* gallery — auto-moving rail */}
      <div className="mt-28">
        <Container>
          <SectionHeading eyebrow="Gallery" title="Moments worth remembering" action={{ href: "/gallery/", label: "View gallery" }} tone="sun" />
        </Container>
        <div className="mt-8">
          <GalleryRail albums={albums.length ? albums : gallery} title="" />
        </div>
      </div>

      {/* teachers */}
      <Container className="mt-24">
        <SectionHeading eyebrow="Our teachers" title="Caring people, trained and checked" intro="Every child known by name." tone="mint" />
        <div className="mt-4"><TeamRoster heading={false} filter={false} limit={5} /></div>
      </Container>

      <AppPromo />

      {/* socials */}
      <Container className="mt-24">
        <SectionHeading eyebrow="Follow our journey" title="Find us everywhere you are" tone="coral" />
        <div className="mt-8"><Socials /></div>
      </Container>

      {/* faqs */}
      <Container className="mt-24">
        <div className="grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading eyebrow="FAQs" title="Questions parents ask" intro="Still wondering about something? Send us a message — a real person will reply." />
            <HandHeart className="mt-8 hidden h-24 w-24 text-blueBrand-200 lg:block" aria-hidden />
          </div>
          <Faqs />
        </div>
      </Container>

      <Newsletter />
    </div>
  );
}
