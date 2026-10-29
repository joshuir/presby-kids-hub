import type { Metadata } from "next";
import { BlogList } from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Blog",
  description: "Kids Bible stories, family devotionals, parent guides and printable activities.",
};

export default function Page() {
  return <BlogList />;
}
