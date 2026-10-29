import type { Metadata } from "next";
import { Suspense } from "react";
import { LessonPage } from "@/components/pages/LessonPage";
import { Loading } from "@/components/site/LoadState";

export const metadata: Metadata = { title: "Lesson", description: "Memory verse, Bible story, discussion questions, activity, prayer and printable resources." };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <LessonPage />
    </Suspense>
  );
}
