"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getPublic } from "@/lib/cms/client";
import type { ProductDoc } from "@/lib/cms/types";
import { CollectionShowcase } from "./CollectionShowcase";
import { LoadError, Loading } from "@/components/site/LoadState";
import { SectionBar } from "@/components/site/SectionNav";

const ClothingRack3D = dynamic(() => import("./ClothingRack3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-xs font-bold uppercase tracking-[0.2em] text-black/40">Setting up the rack…</div>,
});

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function ShopLoader() {
  const [products, setProducts] = useState<ProductDoc[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [view, setView] = useState({ index: 0, colorIdx: 0, side: "front" as "front" | "back" });
  const [request, setRequest] = useState<{ index: number; seq: number }>({ index: 0, seq: 0 });
  const [shuffleSeq, setShuffleSeq] = useState(0);
  const [gl, setGl] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const all = await getPublic("products");
      setProducts(all.filter((p) => p.colorways?.length).sort((a, b) => a.order - b.order));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);
  useEffect(() => {
    load();
    setGl(webglOk());
  }, [load]);

  useEffect(() => {
    if (!products || !headRef.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-rack-in]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" });
    }, headRef);
    return () => ctx.revert();
  }, [products]);

  const onState = useCallback((index: number, colorIdx: number, side: "front" | "back") => setView({ index, colorIdx, side }), []);

  if (err) return <div className="p-8"><LoadError message={`Couldn’t load the collection. ${err}`} retry={load} /></div>;
  if (!products) return <div className="min-h-[70dvh] bg-[#EEEDE8]"><Loading label="Loading the collection…" /></div>;
  const ticker = ["New drops", "Accra", ...products.map((p) => p.name)].join(" • ").toUpperCase();

  return (
    <div className="bg-[#EEEDE8]">
      <SectionBar className="bg-[#EEEDE8]/80" />
      {gl && products.length ? (
        <section ref={headRef} className="relative mx-auto max-w-6xl px-4 pt-8 sm:px-10" aria-label="Clothing rack">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div data-rack-in className="text-[11px] font-bold uppercase tracking-[0.25em] text-black/50">Presby Kids • Collection</div>
              <h1 data-rack-in className="font-[family-name:var(--font-ui)] text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">The Rack</h1>
            </div>
            <p data-rack-in className="max-w-xs text-xs font-semibold text-black/55">Tap a hanger or drag the rail to browse. Pick colours, flip front/back and shuffle below.</p>
          </div>
          <div data-rack-in className="mt-2 h-[300px] sm:h-[400px]">
            <ClothingRack3D
              products={products}
              index={view.index}
              colorIdx={view.colorIdx}
              side={view.side}
              shuffleSeq={shuffleSeq}
              onSelect={(i) => setRequest((r) => ({ index: i, seq: r.seq + 1 }))}
            />
          </div>
        </section>
      ) : null}
      <CollectionShowcase products={products} ticker={ticker} onState={onState} request={request} onShuffle={() => setShuffleSeq((n) => n + 1)} />
    </div>
  );
}
