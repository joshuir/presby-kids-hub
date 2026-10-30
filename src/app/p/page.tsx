import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomPage } from "@/components/pages/CustomPage";

export const metadata: Metadata = { title: "Page" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CustomPage />
    </Suspense>
  );
}
