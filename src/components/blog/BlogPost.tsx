"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/site/Container";
import { RichText } from "@/components/ui/RichText";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { Loading } from "@/components/site/LoadState";
import { adminList, getPublic, whoami } from "@/lib/cms/client";
import { fmtDate } from "@/lib/format";
import type { PostDoc } from "@/lib/cms/types";
import { PostCover } from "./PostCover";
import { SectionNav } from "@/components/site/SectionNav";

function AudioPlayer({ url }: { url: string }) {
  if (/soundcloud\.com/.test(url)) {
    return (
      <iframe
        title="Audio"
        className="h-[166px] w-full rounded-2xl"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%232563eb&visual=false`}
      />
    );
  }
  return <audio controls preload="none" src={url} className="w-full" />;
}

export function BlogPost() {
  const slug = useSearchParams().get("slug") ?? "";
  const [state, setState] = useState<{ post: PostDoc | null; related: PostDoc[] } | null>(null);

  useEffect(() => {
    (async () => {
      let all = await getPublic("posts");
      let post = all.find((p) => p.slug === slug) ?? null;
      if (!post) {
        const me = await whoami().catch(() => null);
        if (me?.admin) {
          all = await adminList("posts");
          post = all.find((p) => p.slug === slug) ?? null;
        }
      }
      const related = post
        ? all
            .filter((p) => p.id !== post!.id && p.status !== "archived")
            .map((p) => ({ p, score: (p.category === post!.category ? 2 : 0) + p.tags.filter((t) => post!.tags.includes(t)).length }))
            .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
            .slice(0, 3)
            .map((x) => x.p)
        : [];
      if (post) {
        document.title = `${post.title} • Presby Children Service`;
        const ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.date, author: { "@type": "Organization", name: post.author }, description: post.excerpt });
        document.head.appendChild(ld);
      }
      setState({ post, related });
    })().catch(() => setState({ post: null, related: [] }));
  }, [slug]);

  if (!state) return <Loading label="Loading article…" />;
  const { post, related } = state;
  if (!post) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl">Article not found</h1>
        <Link href="/blog/" className="mt-4 inline-block font-bold text-blueBrand-700">Back to the blog</Link>
      </Container>
    );
  }

  return (
    <article>
      <div className="bg-soft-blue">
        <Container className="max-w-3xl py-12 sm:py-16">
          <SectionNav current={post.title} />
          <div className="mt-4 text-xs font-bold uppercase tracking-widest text-blueBrand-600">{post.category} · {fmtDate(post.date)}</div>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl leading-tight text-navy-900 sm:text-5xl text-balance">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-black/65">{post.excerpt}</p>
          <div className="mt-4 text-sm text-black/50">By {post.author}</div>
        </Container>
      </div>
      <Container className="max-w-3xl">
        <PostCover post={post} className="-mt-2 aspect-[16/8] w-full rounded-[2rem] shadow-card" />
        {post.videoUrl ? <div className="mt-8"><VideoEmbed url={post.videoUrl} title={post.title} /></div> : null}
        {post.audioUrl ? <div className="mt-6"><AudioPlayer url={post.audioUrl} /></div> : null}
        <RichText text={post.body} className="prose-kids mt-8 text-[17px] text-black/80" />
        {post.tags?.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t) => <span key={t} className="rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-navy-900">#{t}</span>)}
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-black/5 pt-6 text-sm">
          <span className="font-semibold text-black/60">Share:</span>
          <a className="font-bold text-[#25D366]" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + location.href)}`}>WhatsApp</a>
          <a className="font-bold text-blueBrand-700" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`}>Facebook</a>
        </div>
      </Container>
      {related.length ? (
        <Container className="mt-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">You might also like</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link key={p.id} href={`/blog/post/?slug=${p.slug}`} className="group overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1">
                <PostCover post={p} className="aspect-[16/9] w-full" />
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-blueBrand-600">{p.category}</div>
                  <div className="mt-1 font-[family-name:var(--font-heading)] text-lg text-navy-900">{p.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
