"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { getPublic } from "@/lib/cms/client";
import { fmtDate } from "@/lib/format";
import type { PostDoc } from "@/lib/cms/types";
import { PostCover } from "./PostCover";
import { Loading } from "@/components/site/LoadState";
import { cn } from "@/lib/cn";

const CATS = ["All", "Bible Stories", "Devotionals", "Parent Guides", "Kids Activities"] as const;

export function BlogList() {
  const [posts, setPosts] = useState<PostDoc[] | null>(null);
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    getPublic("posts").then((p) => setPosts(p.filter((x) => x.status !== "archived").sort((a, b) => b.date.localeCompare(a.date)))).catch(() => setPosts([]));
  }, []);

  const list = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return (posts ?? []).filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        terms.every((t) => `${p.title} ${p.excerpt} ${p.body} ${p.tags?.join(" ")}`.toLowerCase().includes(t)),
    );
  }, [posts, cat, q]);

  const [featured, ...rest] = list;

  return (
    <div>
      <PageHero eyebrow="Blog" title="Stories, devotionals & guides" intro="Bible stories for children, devotionals for families and practical guides for parents.">
        <div className="relative max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full rounded-full bg-white px-5 py-3 pr-12 text-sm text-navy-900 shadow-lg outline-none placeholder:text-black/40"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40" aria-hidden>⌕</span>
        </div>
      </PageHero>
      <Container className="mt-10">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categories">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition", cat === c ? "bg-navy-900 text-white" : "bg-sky-soft text-navy-900 hover:bg-blueBrand-100")}
            >
              {c}
            </button>
          ))}
        </div>

        {posts === null ? <Loading label="Loading articles…" /> : null}
        {posts && !list.length ? <p className="py-16 text-center text-black/50">No articles match your search.</p> : null}

        {featured ? (
          <Link href={`/blog/post/?slug=${featured.slug}`} className="group mt-8 grid overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-black/5 md:grid-cols-2">
            <PostCover post={featured} className="aspect-[16/10] w-full transition duration-700 group-hover:scale-[1.03] md:aspect-auto md:h-full" />
            <div className="p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-blueBrand-600">{featured.category} · {fmtDate(featured.date)}</div>
              <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight text-navy-900">{featured.title}</h2>
              <p className="mt-3 leading-7 text-black/65">{featured.excerpt}</p>
              <span className="mt-6 inline-block font-bold text-blueBrand-700 transition group-hover:translate-x-1">Read article →</span>
            </div>
          </Link>
        ) : null}

        <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {rest.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                <Link href={`/blog/post/?slug=${p.slug}`} className="group block h-full overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-card">
                  <PostCover post={p} className="aspect-[16/10] w-full" />
                  <div className="p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-blueBrand-600">{p.category}</div>
                    <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl leading-snug text-navy-900">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/60">{p.excerpt}</p>
                    <div className="mt-3 text-xs text-black/45">{fmtDate(p.date)}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </div>
  );
}
