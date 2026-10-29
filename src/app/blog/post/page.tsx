import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPost } from "@/components/blog/BlogPost";
import { Loading } from "@/components/site/LoadState";

export const metadata: Metadata = { title: "Article" };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <BlogPost />
    </Suspense>
  );
}
