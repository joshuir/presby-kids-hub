"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { TeacherDoc } from "@/lib/cms/types";
import { initials } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/cn";
import { Dropdown } from "@/components/ui/Dropdown";
import { sized } from "@/lib/img";

const TEAMS = ["All", "Beginners", "Primary", "Juniors", "Seniors", "Leadership"];
const AV = ["#FFE7A6", "#DDE8FF", "#FDE2E2", "#D9F5E5", "#EDE9FE"];

export function Avatar({ t, size = 56, i = 0 }: { t: TeacherDoc; size?: number; i?: number }) {
  return t.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sized(t.photo, size * 2, size * 2)} alt="" width={size} height={size} className="shrink-0 rounded-2xl object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-2xl font-display font-extrabold text-ink" style={{ width: size, height: size, background: AV[i % AV.length], fontSize: size * 0.36 }} aria-hidden>
      {initials(t.name)}
    </span>
  );
}

/** Team list with a featured profile; optional filter chips (About page). */
export function Teachers({ filter = false, limit }: { filter?: boolean; limit?: number }) {
  const all = useContent("teachers") ?? [];
  const [team, setTeam] = useState("All");
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("teacher");
    if (q) setSel(q);
  }, []);
  const list = all.filter((t) => team === "All" || t.team === team.toLowerCase());
  const shown = limit ? list.slice(0, limit) : list;
  const current = all.find((t) => t.id === sel) ?? shown[0];
  if (!current) return null;
  const ci = all.indexOf(current);
  return (
    <div>
      {filter ? (
        <Dropdown
          label="Team"
          hideLabel
          testId="teachers-filter"
          className="mb-5 w-full sm:w-72"
          value={team}
          onChange={(x) => { setTeam(x); setSel(null); }}
          options={TEAMS.map((x) => ({ value: x, label: x === "All" ? "Whole team" : x, count: all.filter((t) => x === "All" || t.team === x.toLowerCase()).length }))}
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <AnimatePresence mode="wait">
          <motion.article key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <Avatar t={current} size={84} i={ci} />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blueBrand-600">{current.role}</div>
                <h3 className="font-display text-2xl font-extrabold">{current.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Safeguarding checked
                </span>
              </div>
            </div>
            <p className="mt-5 leading-7 text-ink/70">{current.bio}</p>
            <ul className="mt-4 grid gap-2">
              {current.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-sun" />{h}</li>
              ))}
            </ul>
          </motion.article>
        </AnimatePresence>
        <ul className="grid content-start gap-2">
          {shown.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSel(t.id)}
                aria-pressed={current.id === t.id}
                className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition", current.id === t.id ? "bg-ink text-white" : "bg-white ring-1 ring-ink/5 hover:ring-ink/15")}
              >
                <Avatar t={t} size={44} i={all.indexOf(t)} />
                <span className="min-w-0">
                  <span className="block truncate font-bold">{t.name}</span>
                  <span className={cn("block truncate text-xs", current.id === t.id ? "text-white/65" : "text-ink/55")}>{t.role}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
