import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassPage } from "@/components/pages/ClassPage";
import { Loading } from "@/components/site/LoadState";

export const metadata: Metadata = { title: "Class", description: "This week's lesson, your teachers and every previous lesson." };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClassPage />
    </Suspense>
  );
}
