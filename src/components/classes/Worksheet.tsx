"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminList, getPublic, whoami } from "@/lib/cms/client";
import type { ClassDoc, LessonDoc, QuestionDoc } from "@/lib/cms/types";
import { Loading } from "@/components/site/LoadState";

/** Printable lesson notes, worksheet (quiz from the question bank) and activity sheet. */
export function Worksheet() {
  const sp = useSearchParams();
  const lessonId = sp.get("lesson") ?? "";
  const type = (sp.get("type") ?? "worksheet") as "notes" | "worksheet" | "activity";
  const [data, setData] = useState<{ lesson: LessonDoc; cls: ClassDoc | null; qs: QuestionDoc[] } | null | "missing">(null);

  useEffect(() => {
    (async () => {
      let lessons = await getPublic("lessons");
      let lesson = lessons.find((l) => l.id === lessonId);
      if (!lesson) {
        const me = await whoami().catch(() => null);
        if (me?.admin) {
          lessons = await adminList("lessons");
          lesson = lessons.find((l) => l.id === lessonId);
        }
      }
      if (!lesson) return setData("missing");
      const [classes, questions] = await Promise.all([getPublic("classes"), type === "worksheet" ? getPublic("questions") : Promise.resolve([])]);
      const refBook = lesson.bibleRef.split(/[ :]/).slice(0, 2).join(" ").toLowerCase();
      const qs = (questions as QuestionDoc[]).filter((q) => q.ref.toLowerCase().startsWith(refBook)).slice(0, 10);
      document.title = `${lesson.title} — ${type}`;
      setData({ lesson, cls: classes.find((c) => c.id === lesson!.classId) ?? null, qs });
    })().catch(() => setData("missing"));
  }, [lessonId, type]);

  if (data === null) return <Loading label="Preparing your sheet…" />;
  if (data === "missing") return <p className="p-10 text-center">Lesson not found.</p>;
  const { lesson, cls, qs } = data;
  const line = <div className="h-8 border-b border-dashed border-black/40" />;

  return (
    <div className="worksheet mx-auto max-w-3xl px-5 py-8 text-[#111]">
      <style>{`@media print { header, footer, .noprint { display: none !important } body { background: #fff } }`}</style>
      <button
        type="button"
        onClick={() => window.print()}
        className="noprint float-right rounded-full bg-blueBrand-600 px-4 py-2 text-sm font-bold text-white"
      >
        Print / Save as PDF
      </button>
      <h1 className="font-[family-name:var(--font-heading)] text-4xl">{lesson.title}</h1>
      <div className="mb-5 text-black/60">
        {cls?.name} • {lesson.bibleRef} • {lesson.lessonDate}
      </div>

      {type === "notes" ? (
        <>
          <Box><b>Main thrust:</b> {lesson.mainThrust}</Box>
          <Box className="text-xl font-bold">{lesson.memoryVerse}</Box>
          <h2 className="mt-6 text-xl font-bold">Story summary</h2>
          <p>{lesson.description}</p>
          <h2 className="mt-6 text-xl font-bold">Learning objectives</h2>
          <ol className="list-decimal pl-6">{lesson.objectives.map((o, i) => <li key={i} className="my-1">{o}</li>)}</ol>
          <h2 className="mt-6 text-xl font-bold">Teaching flow (45 min)</h2>
          <ol className="list-decimal pl-6">
            <li>Welcome &amp; worship song (5 min)</li>
            <li>Memory verse game (5 min)</li>
            <li>Tell the story from {lesson.bibleRef} (15 min)</li>
            <li>Discussion using the worksheet (10 min)</li>
            <li>Activity sheet &amp; prayer (10 min)</li>
          </ol>
        </>
      ) : type === "activity" ? (
        <>
          <Box className="text-xl font-bold">{lesson.memoryVerse}</Box>
          <p className="mt-4"><b>Draw it!</b> Draw your favourite part of today’s story.</p>
          <div className="mt-2 h-96 rounded-3xl border-4 border-dashed border-black/25" />
          <p className="mt-6"><b>Fill the gap:</b> {lesson.mainThrust.replace(/\b(\w{6,})\b/, "________")}</p>
          <p className="mt-6"><b>Pray:</b> Write a one-sentence prayer.</p>
          {line}
          {line}
        </>
      ) : (
        <>
          <Box><b>Name:</b> ______________________ &nbsp; <b>Date:</b> __________</Box>
          <Box className="text-xl font-bold">{lesson.memoryVerse}</Box>
          <h2 className="mt-6 text-xl font-bold">Quiz</h2>
          {qs.length ? (
            <ol className="list-decimal pl-6">
              {qs.map((q) => (
                <li key={q.id} className="my-3">
                  {q.question}
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                    {q.options.map((o) => <span key={o}>☐ {o}</span>)}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <>
              <p>Write three things you learned:</p>
              {line}
              {line}
              {line}
            </>
          )}
          <h2 className="mt-6 text-xl font-bold">Think &amp; talk</h2>
          <ol className="list-decimal pl-6">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="my-2">
                {o}
                {line}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function Box({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`my-3 rounded-2xl border-2 border-black/15 p-4 ${className}`}>{children}</div>;
}
