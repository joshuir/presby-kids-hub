"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { ProductDoc } from "@/lib/cms/types";
import { Garment } from "@/components/shop/Garment";
import { cn } from "@/lib/cn";

/** Live preview of a product exactly as it renders on the Collection page. */
export function ProductPreview({ product }: { product: ProductDoc }) {
  const [ci, setCi] = useState(0);
  const [side, setSide] = useState<"front" | "back">("front");
  const ref = useRef<HTMLDivElement>(null);
  const cws = product.colorways ?? [];
  const cw = cws[Math.min(ci, Math.max(0, cws.length - 1))];

  useEffect(() => {
    if (ref.current && cw) gsap.to(ref.current, { "--garment": cw.hex, duration: 0.4 } as gsap.TweenVars);
  }, [cw]);

  if (!cw) return <div className="rounded-2xl bg-amber-50 p-3 text-sm">Add at least one colour to show this product on the website.</div>;

  return (
    <div className="grid gap-3 rounded-2xl bg-[#EEEDE8] p-4 sm:grid-cols-[180px_1fr]">
      <div ref={ref} style={{ ["--garment" as string]: cw.hex }}>
        <Garment product={product} side={side} colorway={cw} printHex={cw.printHex} className="w-full" />
      </div>
      <div className="grid content-start gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-black/50">Live preview</div>
        <div className="font-extrabold uppercase">{product.name || "Untitled"}</div>
        <div className="flex flex-wrap gap-2">
          {cws.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCi(i)}
              title={c.name}
              className={cn("h-12 w-7 rounded-md ring-1 ring-black/15", i === ci && "-translate-y-1 ring-2 ring-black")}
              style={{ background: c.tagHex || c.hex }}
            />
          ))}
        </div>
        <div className="flex w-max rounded-full bg-white p-1 text-[10px] font-black uppercase ring-1 ring-black/15">
          {(["front", "back"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSide(s)} className={cn("rounded-full px-3 py-1 uppercase", side === s && "bg-black text-white")}>
              {s}
            </button>
          ))}
        </div>
        <div className="text-xs text-black/50">Click a tag to try each colour. Save or publish to update the website.</div>
      </div>
    </div>
  );
}
