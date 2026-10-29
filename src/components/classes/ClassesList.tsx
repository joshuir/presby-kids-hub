"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublic } from "@/lib/cms/client";
import { isLive, type LessonDoc } from "@/lib/cms/types";
import { resolveArt } from "@/lib/art";
import { ClassesExplorer, type ClassItem } from "./ClassesExplorer";
import { LoadError, Loading } from "@/components/site/LoadState";

export function lessonsForClass(lessons: LessonDoc[], classId: string) {
  const byDate = (a: LessonDoc, b: LessonDoc) => b.lessonDate.localeCompare(a.lessonDate);
  const visible = lessons.filter((l) => l.classId === classId && (isLive(l) || l.status === "archived"));
  const live = visible.filter((l) => isLive(l)).sort(byDate);
  const current = live[0] ?? null;
  const archive = visible.filter((l) => l.id !== current?.id).sort(byDate);
  return { current, archive, all: visible };
}

export function ClassesList() {
  const [items, setItems] = useState<ClassItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [classes, lessons] = await Promise.all([getPublic("classes"), getPublic("lessons")]);
      setItems(
        classes
          .sort((a, b) => a.order - b.order)
          .map((c) => {
            const mine = lessonsForClass(lessons, c.id);
            const cur = mine.current;
            return {
              ...c,
              lesson: cur ? { title: cur.title, bibleRef: cur.bibleRef, flyerUrl: resolveArt(cur.bannerUrl, "banner", cur, c) } : null,
              lessonCount: mine.all.length,
            };
          }),
      );
    } catch (e) {
      setErr((e as Error).message || "Couldn’t load classes.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (err) return <LoadError message={`Couldn’t load classes. ${err}`} retry={load} />;
  if (!items) return <Loading label="Loading classes…" />;
  return <ClassesExplorer items={items} />;
}
