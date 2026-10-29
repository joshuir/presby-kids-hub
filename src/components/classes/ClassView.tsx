"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/site/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LessonHub } from "./LessonHub";
import { lessonsForClass } from "./ClassesList";
import { adminList, getPublic, whoami } from "@/lib/cms/client";
import type { ClassDoc, LessonDoc } from "@/lib/cms/types";
import { LoadError, Loading } from "@/components/site/LoadState";

export function ClassView() {
  const sp = useSearchParams();
  const id = sp.get("id") ?? "";
  const previewId = sp.get("preview");
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; msg: string }
    | { kind: "missing" }
    | { kind: "ok"; cls: ClassDoc; current: LessonDoc | null; archive: LessonDoc[]; previewing: LessonDoc | null }
  >({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const [classes, lessons] = await Promise.all([getPublic("classes"), getPublic("lessons")]);
      let cls = classes.find((c) => c.id === id) ?? null;
      let { current, archive } = lessonsForClass(lessons, id);
      let previewing: LessonDoc | null = null;

      // Admin preview of unpublished content: ?preview=<lessonId>
      if (previewId) {
        const me = await whoami().catch(() => null);
        if (me?.admin) {
          const [allLessons, allClasses] = await Promise.all([adminList("lessons"), adminList("classes")]);
          cls = cls ?? allClasses.find((c) => c.id === id) ?? null;
          const p = allLessons.find((l) => l.id === previewId && l.classId === id);
          if (p) {
            previewing = p;
            archive = [current, ...archive].filter((l): l is LessonDoc => Boolean(l) && l!.id !== p.id);
            current = p;
          }
        }
      }
      if (!cls) return setState({ kind: "missing" });
      document.title = `${cls.name} • Presby Children Service`;
      setState({ kind: "ok", cls, current, archive, previewing });
    } catch (e) {
      setState({ kind: "error", msg: (e as Error).message });
    }
  }, [id, previewId]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.kind === "loading") return <Loading label="Loading lesson…" />;
  if (state.kind === "error") {
    return (
      <Container className="py-12">
        <LoadError message={`Couldn’t load this class. ${state.msg}`} retry={load} />
      </Container>
    );
  }
  if (state.kind === "missing") {
    return (
      <Container className="py-16">
        <Card className="p-8 text-center">
          <div className="font-[family-name:var(--font-heading)] text-2xl">Class not found</div>
          <div className="mt-4">
            <ButtonLink href="/classes/">See all classes</ButtonLink>
          </div>
        </Card>
      </Container>
    );
  }

  const { cls, current, archive, previewing } = state;
  return (
    <div className="bg-white">
      {previewing ? (
        <div className="bg-amber-300 py-2 text-center text-sm font-bold text-ink-950">
          Preview mode — this lesson is “{previewing.status}” and only admins can see it here.
        </div>
      ) : null}
      <Container className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: cls.color }}>
              {cls.group} • {cls.ageRange}
            </div>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl tracking-tight sm:text-5xl">{cls.name}</h1>
            <p className="mt-2 text-base leading-7 text-black/70">
              {cls.focus} • {cls.schedule} • {cls.teacher}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/register/?class=${encodeURIComponent(cls.id)}`}>Register</ButtonLink>
            <ButtonLink href="/games/" variant="secondary">Play the story quiz</ButtonLink>
          </div>
        </div>

        <div className="mt-8">
          {current ? (
            <LessonHub key={current.id} current={current} archive={archive} accent={cls.color} cls={cls} />
          ) : (
            <Card className="p-8 text-center">
              <div className="font-[family-name:var(--font-heading)] text-2xl">Lessons coming soon</div>
              <p className="mt-2 text-sm text-black/60">Teachers will publish this class’s lessons here.</p>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
