"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ClassDoc, ClassGroupKey } from "@/lib/cms/types";

export type ClassItem = ClassDoc & {
  lesson?: { title: string; flyerUrl: string; bibleRef: string } | null;
  lessonCount?: number;
};

const groups: Array<ClassGroupKey | "All"> = [
  "All",
  "Beginners",
  "Primary",
  "Juniors",
  "Seniors",
];

export function ClassesExplorer({ items }: { items: ClassItem[] }) {
  const [active, setActive] = useState<(typeof groups)[number]>("All");

  const filtered = useMemo(() => {
    if (active === "All") return items;
    return items.filter((x) => x.group === active);
  }, [active, items]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const selected = active === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setActive(g)}
              className={cn(
                "rounded-2xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 focus-ring",
                selected
                  ? "bg-blueBrand-600 text-white ring-transparent"
                  : "bg-white text-ink-950 hover:bg-blueBrand-50"
              )}
              aria-pressed={selected}
            >
              {g}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0">
            {c.lesson ? (
              <a href={`/classes/view/?id=${encodeURIComponent(c.id)}`} className="group relative block aspect-[12/5] overflow-hidden" style={{ background: c.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.lesson.flyerUrl.replace("/flyer", "/banner")} alt={c.lesson.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink-950 shadow-soft">This week: {c.lesson.title}</span>
              </a>
            ) : null}
            <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-[family-name:var(--font-heading)] text-xl">
                  {c.name}
                </div>
                <div className="mt-1 text-xs text-black/60">
                  {c.group} • {c.ageRange}
                </div>
              </div>
              <span className="rounded-2xl bg-blueBrand-50 px-2 py-1 text-xs font-semibold text-blueBrand-800 ring-1 ring-black/5">
                {c.schedule}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-black/70">{c.focus}</p>

            <div className="mt-4 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-black/5">
                <span className="font-semibold">Teacher:</span> {c.teacher}
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-black/5">
                <span className="font-semibold">Lessons:</span> {c.lessonCount ?? 0} in archive
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonLink href={`/register/?class=${encodeURIComponent(c.id)}`}>
                Register
              </ButtonLink>
              <ButtonLink
                href={`/classes/view/?id=${encodeURIComponent(c.id)}`}
                variant="secondary"
              >
                Open lesson hub
              </ButtonLink>
            </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

