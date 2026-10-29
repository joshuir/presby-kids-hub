import type { Metadata } from "next";
import { Suspense } from "react";
import { Worksheet } from "@/components/classes/Worksheet";
import { Loading } from "@/components/site/LoadState";

export const metadata: Metadata = {
  title: "Printable lesson sheet",
  robots: { index: false, follow: false },
};

export default function WorksheetPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Worksheet />
    </Suspense>
  );
}
