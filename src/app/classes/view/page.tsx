import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassView } from "@/components/classes/ClassView";
import { Loading } from "@/components/site/LoadState";
import { SectionBar } from "@/components/site/SectionNav";

export const metadata: Metadata = {
  title: "Class",
  description: "This week’s lesson, story media, downloads and lesson archive.",
};

export default function ClassViewPage() {
  return (
    <>
      <SectionBar current="Class hub" />
      <Suspense fallback={<Loading />}>
        <ClassView />
      </Suspense>
    </>
  );
}
