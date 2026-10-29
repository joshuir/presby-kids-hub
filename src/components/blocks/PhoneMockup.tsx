"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, CalendarDays, Gamepad2, Home, Newspaper, Signal, Wifi } from "lucide-react";
import { Buddy } from "@/components/games/Mascot";
import { useMotionLevel } from "@/components/motion/MotionDirector";
import { useContent } from "@/lib/useContent";
import { useSettings } from "@/lib/site";
import { classLessons, fmtDate, fmtTime, upcoming } from "@/lib/format";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";

const TABS = [
  { k: "home", label: "Home", Icon: Home },
  { k: "feed", label: "Feed", Icon: Newspaper },
  { k: "events", label: "Events", Icon: CalendarDays },
  { k: "games", label: "Games", Icon: Gamepad2 },
] as const;
type K = (typeof TABS)[number]["k"];

/** Realistic phone with a working tab bar — previews what families see in the app. */
export function PhoneMockup({ compact, className }: { compact?: boolean; className?: string }) {
  const s = useSettings();
  const level = useMotionLevel();
  const lessons = useContent("lessons") ?? [];
  const posts = useContent("posts") ?? [];
  const events = useContent("events") ?? [];
  const teachers = useContent("teachers") ?? [];
  const [tab, setTab] = useState<K>("home");
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || level === "off") return;
    const t = setInterval(() => setTab((x) => TABS[(TABS.findIndex((y) => y.k === x) + 1) % TABS.length].k), 3800);
    return () => clearInterval(t);
  }, [auto, level]);

  const { current } = classLessons(lessons, "primary-2");
  const post = [...posts].filter((p) => p.images?.length).sort((a, b) => b.date.localeCompare(a.date))[0] ?? posts[0];
  const author = teachers.find((t) => t.id === post?.authorId);
  const evs = upcoming(events).slice(0, 3);
  const w = compact ? 250 : 290;

  return (
    <div className={cn("relative mx-auto text-ink", className)} style={{ width: w }}>
      <div className="rounded-[3rem] bg-[#0b0d12] p-[10px] shadow-[0_40px_80px_-30px_rgba(11,21,48,.7),inset_0_0_0_2px_#2a2e38]">
        <div className="relative overflow-hidden rounded-[2.4rem] bg-cream" style={{ height: w * 2.05 }}>
          {/* status bar + dynamic island */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-3 text-[11px] font-bold text-ink">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
            <span className="flex items-center gap-1"><Signal className="h-3 w-3" aria-hidden /><Wifi className="h-3 w-3" aria-hidden /><BatteryFull className="h-3.5 w-3.5" aria-hidden /></span>
          </div>
          <div className="flex items-center gap-2 px-4 pt-3 text-[13px] font-extrabold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="" width={22} height={25} /> {s.siteName}
          </div>

          <div className="relative mt-2 h-[calc(100%-118px)] overflow-hidden px-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.3 }} className="grid gap-2.5">
                {tab === "home" ? (
                  <>
                    {current ? (
                      <div className="rounded-2xl bg-blueBrand-600 p-3.5 text-white">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-white/70">This Sunday · Primary 2</div>
                        <div className="mt-1 font-display text-[17px] font-bold leading-tight">{current.title}</div>
                        <div className="mt-2.5 rounded-xl bg-white/15 p-2 text-[11px] leading-snug">
                          <div className="font-bold text-white/70">Memory verse</div>“{current.memoryVerse}”
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
                      <div className="rounded-xl bg-sun-soft p-3">🎧 Verse audio</div>
                      <div className="rounded-xl bg-sky-soft p-3">📖 Story</div>
                      <div className="rounded-xl bg-[#DCFCE7] p-3">🖍️ Activity</div>
                      <div className="rounded-xl bg-[#FFE8E1] p-3">🙏 Prayer</div>
                    </div>
                  </>
                ) : null}
                {tab === "feed" && post ? (
                  <div className="rounded-2xl bg-white p-3 shadow-soft">
                    <div className="flex items-center gap-2">
                      {author?.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sized(author.photo, 60, 60)} alt="" className="h-7 w-7 rounded-full object-cover" />
                      ) : null}
                      <div className="text-[11px] font-bold leading-tight">{author?.name}<div className="font-normal text-ink/50">{fmtDate(post.date, { day: "numeric", month: "short" })}</div></div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-ink/80">{post.body}</p>
                    {post.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sized(post.images[0], 400, 300)} alt="" className="mt-2 aspect-[4/3] w-full rounded-xl object-cover" />
                    ) : null}
                    <div className="mt-2 flex gap-1 text-[11px] font-bold">
                      {Object.entries(post.reactions ?? {}).slice(0, 3).map(([e, n]) => (
                        <span key={e} className="rounded-full bg-paper px-2 py-0.5">{e} {n}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {tab === "events" ? (
                  <div className="grid gap-2">
                    {evs.map((e) => (
                      <div key={e.id} className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-soft">
                        <span className="block h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2" style={{ ["--tw-ring-color" as string]: e.color || "#2563EB" }}>
                          {e.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sized(e.logo || e.image, 100, 100)} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <div className="min-w-0 text-[11px] leading-tight">
                          <div className="truncate font-bold">{e.title}</div>
                          <div className="text-ink/55">{fmtDate(e.date, { weekday: "short", day: "numeric", month: "short" })} · {fmtTime(e.startTime)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {tab === "games" ? (
                  <div className="grid justify-items-center gap-2 rounded-2xl bg-[#58CC02] p-4 text-white">
                    <Buddy kind="lion" color="#F59E0B" mood="wave" size={110} look={false} />
                    <div className="font-display text-[15px] font-extrabold">Keep your streak going!</div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/30"><div className="h-full w-2/3 rounded-full bg-white" /></div>
                    <div className="text-[11px] font-bold text-white/85">120 / 180 XP to level 3</div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* tab bar */}
          <nav className="absolute inset-x-2 bottom-2 grid grid-cols-4 rounded-[1.6rem] bg-white/95 px-1 pb-3 pt-2 shadow-[0_-6px_20px_-10px_rgba(11,21,48,.25)] backdrop-blur" aria-label="App preview tabs">
            {TABS.map(({ k, label, Icon }) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setTab(k);
                  setAuto(false);
                }}
                aria-pressed={tab === k}
                className={cn("flex flex-col items-center gap-0.5 rounded-xl py-1 text-[10px] font-bold transition", tab === k ? "text-blueBrand-600" : "text-ink/45")}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", tab === k && "bg-sky-soft")}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {label}
              </button>
            ))}
            <span className="absolute bottom-1 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-ink/80" aria-hidden />
          </nav>
        </div>
      </div>
    </div>
  );
}
