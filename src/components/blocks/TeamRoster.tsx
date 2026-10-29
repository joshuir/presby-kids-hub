"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Quote, ShieldCheck } from "lucide-react";
import { Avatar } from "./Teachers";
import { SplitWords } from "@/components/motion/SplitWords";
import { useContent } from "@/lib/useContent";
import { initials, useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import type { TeacherDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

const TEAMS = ["All", "Leadership", "Beginners", "Primary", "Juniors", "Seniors"];

function Portrait({ t, className }: { t: TeacherDoc; className?: string }) {
  return t.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sized(t.photo, 800, 1000)} alt={`Portrait of ${t.name}`} className={cn("h-full w-full object-cover", className)} />
  ) : (
    <div className={cn("grid h-full w-full place-items-center bg-gradient-to-br from-sky-soft to-sun-soft font-display text-7xl font-extrabold text-ink/70", className)} aria-label={t.name}>
      {initials(t.name)}
    </div>
  );
}

function Credentials({ t, classNames }: { t: TeacherDoc; classNames: string[] }) {
  return (
    <div className="grid gap-2.5 text-[15px] leading-snug text-ink">
      {t.highlights.map((h) => (
        <p key={h}>{h}</p>
      ))}
      {classNames.length ? <p className="text-ink/60">Teaches {classNames.join(", ")}</p> : null}
      <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#15803D]">
        <ShieldCheck className="h-4 w-4" aria-hidden /> Background-checked & safeguarding-trained
      </p>
    </div>
  );
}

/**
 * Editorial team list (reference: "Meet the team behind the designs"):
 * huge names with roles beside them; the active name turns dark and its portrait,
 * credentials and quote appear on the right. On phones each name opens a portrait card.
 */
export function TeamRoster({ heading = true, limit, filter = true }: { heading?: boolean; limit?: number; filter?: boolean }) {
  const s = useSettings();
  const all = useContent("teachers");
  const classes = useContent("classes") ?? [];
  const [team, setTeam] = useState("All");
  const [sel, setSel] = useState<string | null>(null);
  const [openM, setOpenM] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("teacher");
    if (q) {
      setSel(q);
      setOpenM(q);
    }
  }, []);

  const list = useMemo(() => {
    const l = (all ?? []).filter((t) => team === "All" || t.team === team.toLowerCase());
    return limit ? l.slice(0, limit) : l;
  }, [all, team, limit]);
  const current = list.find((t) => t.id === sel) ?? list[0];
  const clsNames = (t: TeacherDoc) => classes.filter((c) => t.classIds?.includes(c.id)).map((c) => c.name);

  if (!all) return <div className="h-96 animate-pulse rounded-[2rem] bg-white/60" />;
  if (!current) return null;

  return (
    <div>
      {heading ? (
        <h2 className="font-display text-[2.6rem] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] sm:text-7xl lg:text-[6.2rem]">
          <SplitWords text={s.teamTitle || "Meet the team behind the classes"} mark="none" />
        </h2>
      ) : null}

      {filter ? (
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter teachers by team">
          {TEAMS.map((x) => (
            <button
              key={x}
              type="button"
              role="tab"
              aria-selected={team === x}
              onClick={() => {
                setTeam(x);
                setSel(null);
              }}
              className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold transition", team === x ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10 hover:bg-paper")}
            >
              {x}
            </button>
          ))}
        </div>
      ) : null}

      {/* desktop / tablet */}
      <div className="mt-10 hidden gap-10 md:grid md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_300px]">
        <ul className="grid gap-1" data-reveal>
          {list.map((t) => {
            const on = t.id === current.id;
            return (
              <li key={t.id} data-stagger>
                <button
                  type="button"
                  onMouseEnter={() => setSel(t.id)}
                  onFocus={() => setSel(t.id)}
                  onClick={() => setSel(t.id)}
                  aria-pressed={on}
                  className="group grid w-full grid-cols-[minmax(110px,180px)_1fr] items-baseline gap-4 text-left lg:grid-cols-[minmax(160px,240px)_1fr]"
                >
                  <span className={cn("text-right text-sm transition-colors", on ? "text-ink" : "text-ink/40")}>{t.role}</span>
                  <span
                    className={cn(
                      "font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] transition-colors duration-300 lg:text-6xl",
                      on ? "text-ink" : "text-ink/25 group-hover:text-ink/50",
                    )}
                  >
                    {t.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="relative">
          <div className="sticky top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="aspect-[4/5] overflow-hidden bg-paper">
                  <Portrait t={current} />
                </div>
                <div className="mt-4">
                  <Credentials t={current} classNames={clsNames(current)} />
                  {current.quote ? (
                    <blockquote className="mt-4 flex gap-2 border-t border-ink/10 pt-4 text-[15px] italic leading-6 text-ink/70">
                      <Quote className="h-4 w-4 shrink-0 text-sun" aria-hidden /> {current.quote}
                    </blockquote>
                  ) : null}
                  <Link href={`/contact/?subject=${encodeURIComponent("Message for a teacher")}&message=${encodeURIComponent(`Hello ${current.name.split(" ")[0]}, `)}#form-title`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blueBrand-700">
                    Send {current.name.split(" ")[0]} a message <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* phones */}
      <ul className="mt-6 grid gap-3 md:hidden">
        {list.map((t, i) => {
          const open = openM === t.id;
          return (
            <li key={t.id} className="card overflow-hidden">
              <button type="button" onClick={() => setOpenM(open ? null : t.id)} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
                <Avatar t={t} size={56} i={i} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-extrabold leading-tight">{t.name}</span>
                  <span className="block text-sm text-ink/55">{t.role}</span>
                </span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 transition", open && "rotate-180")} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="grid gap-4 px-3 pb-4">
                      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-paper">
                        <Portrait t={t} />
                      </div>
                      <p className="leading-7 text-ink/70">{t.bio}</p>
                      <Credentials t={t} classNames={clsNames(t)} />
                      {t.quote ? <blockquote className="border-l-4 border-sun pl-3 italic text-ink/70">“{t.quote}”</blockquote> : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
