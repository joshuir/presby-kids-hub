"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/site/Container";
import { Loading } from "@/components/site/LoadState";
import { ContentBlock } from "@/components/blocks/ContentBlock";
import { useContent } from "@/lib/useContent";
import { useSettings } from "@/lib/site";

/** A page built in the CMS from blocks (CMS → Custom pages). Lives at /p/?s=slug. */
export function CustomPage() {
  const slug = (useSearchParams().get("s") ?? "").toLowerCase();
  const pages = useContent("custompages");
  const blocks = useContent("blocks");
  const s = useSettings();
  const page = pages?.find((p) => p.slug.toLowerCase() === slug);

  useEffect(() => {
    if (!page) return;
    document.title = `${page.title} · ${s.siteName}`;
    if (page.seoDescription) document.querySelector('meta[name="description"]')?.setAttribute("content", page.seoDescription);
  }, [page, s.siteName]);

  if (!pages) return <Loading label="Loading…" />;
  if (!page)
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-ink/60">This page may have been moved or unpublished.</p>
        <Link href="/" className="btn btn-primary mt-6">Go to the home page</Link>
      </Container>
    );
  return (
    <div data-custom-page={page.slug}>
      <PageHero page={`p-${page.slug}`} eyebrow={page.eyebrow} title={page.title} intro={page.intro} image={page.heroImage || undefined} crumb={page.title} />
      {page.blocks.map((id) => {
        const b = blocks?.find((x) => x.id === id);
        return b ? <ContentBlock key={id} b={b} /> : null;
      })}
    </div>
  );
}
