"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getPublic } from "@/lib/cms/client";
import type { ProductDoc } from "@/lib/cms/types";
import { CollectionShowcase } from "./CollectionShowcase";
import { LoadError, Loading } from "@/components/site/LoadState";
import Link from "next/link";

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
  const headRef = useRef<HTMLElement>(null);

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
    <div className="-mt-[76px] bg-[#EEEDE8] pt-[76px]">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-6 text-sm font-bold text-black/50 sm:px-10">
        <Link href="/games/" className="hover:text-black">Kids Zone</Link> <span aria-hidden>›</span> <span className="text-black">Clothing Collection</span>
      </nav>
      <section ref={headRef} className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-10" aria-label="Clothing rack">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div data-rack-in className="text-[11px] font-bold uppercase tracking-[0.25em] text-black/50">Children&apos;s Ministry • Collection</div>
            <h1 data-rack-in className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">The Rack</h1>
          </div>
          <p data-rack-in className="max-w-xs text-sm font-semibold text-black/55">
            {gl ? "Tap a hanger or drag the rail to browse. " : ""}Pick colours, flip front/back and shuffle below.
          </p>
        </div>
        {gl && products.length ? (
          <div data-rack-in className="mt-2 h-[280px] sm:h-[400px]">
            <ClothingRack3D
              products={products}
              index={view.index}
              colorIdx={view.colorIdx}
              side={view.side}
              shuffleSeq={shuffleSeq}
              onSelect={(i) => setRequest((r) => ({ index: i, seq: r.seq + 1 }))}
            />
          </div>
        ) : null}
      </section>
      <CollectionShowcase products={products} ticker={ticker} onState={onState} request={request} onShuffle={() => setShuffleSeq((n) => n + 1)} />
    </div>
  );
}
