"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { ProductDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { Garment } from "./Garment";

function money(p: ProductDoc) {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency: p.currency || "GHS" }).format(p.price);
  } catch {
    return `${p.currency} ${p.price}`;
  }
}

function availability(p: ProductDoc) {
  const total = p.sizes.reduce((s, z) => s + (p.stock?.[z] ?? 0), 0);
  if (total <= 0) return { label: "Sold out", tone: "bg-rose-100 text-rose-700" };
  if (total < 10) return { label: "Low stock", tone: "bg-amber-100 text-amber-800" };
  return { label: "In stock", tone: "bg-emerald-100 text-emerald-800" };
}

export function CollectionShowcase({
  products,
  ticker,
  onState,
  request,
  onShuffle,
}: {
  products: ProductDoc[];
  ticker: string;
  /** reports the visible product / colour / side (used to sync the 3D rack) */
  onState?: (index: number, colorIdx: number, side: "front" | "back") => void;
  /** ask the showcase to animate to a product (e.g. picked on the rack) */
  request?: { index: number; seq: number };
  onShuffle?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [side, setSide] = useState<"front" | "back">("front");
  const [showAvail, setShowAvail] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const busy = useRef(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const hangerRef = useRef<HTMLDivElement>(null);
  const garmentRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  const product = products[index];
  const colorway = product?.colorways[colorIdx] ?? product?.colorways[0];

  // Set initial garment colour without animation
  useLayoutEffect(() => {
    if (garmentRef.current && colorway) garmentRef.current.style.setProperty("--garment", colorway.hex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Idle sway + ticker
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (hangerRef.current) {
        gsap.to(hangerRef.current, { rotation: 1.6, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "50% 0%" });
      }
      if (tickerRef.current) {
        gsap.to(tickerRef.current, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
      }
    });
    return () => ctx.revert();
  }, []);

  // Tags swing in when product changes
  useEffect(() => {
    if (!tagsRef.current) return;
    gsap.fromTo(
      tagsRef.current.children,
      { rotation: -25, y: -20, opacity: 0 },
      { rotation: 0, y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "elastic.out(1, 0.5)", transformOrigin: "50% 0%" },
    );
    if (titleRef.current) gsap.fromTo(titleRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
  }, [index]);

  const pickColor = (i: number) => {
    if (!product || i === colorIdx) return;
    setColorIdx(i);
    const el = garmentRef.current;
    if (el) {
      gsap.to(el, { "--garment": product.colorways[i].hex, duration: 0.6, ease: "power2.out" } as gsap.TweenVars);
      gsap.fromTo(el, { scale: 0.985 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    }
    const tag = tagsRef.current?.children[i] as HTMLElement | undefined;
    if (tag) gsap.fromTo(tag, { rotation: 18 }, { rotation: 0, duration: 0.9, ease: "elastic.out(1.2, 0.3)", transformOrigin: "50% 0%" });
  };

  const go = useCallback(
    (dir: 1 | -1, target?: number) => {
      if (busy.current || products.length < 2) return;
      busy.current = true;
      const nextIndex = target ?? (index + dir + products.length) % products.length;
      const el = hangerRef.current;
      if (!el) {
        setIndex(nextIndex);
        busy.current = false;
        return;
      }
      gsap
        .timeline({ onComplete: () => { busy.current = false; } })
        .to(el, { x: -dir * 260, rotation: -dir * 14, opacity: 0, duration: 0.35, ease: "power2.in" })
        .add(() => {
          setIndex(nextIndex);
          setColorIdx(0);
          setSide("front");
          setSize(null);
        })
        .set(el, { x: dir * 260, rotation: dir * 14 })
        .to(el, { x: 0, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)" });
    },
    [index, products.length],
  );

  const shuffle = () => {
    if (busy.current || !products.length) return;
    busy.current = true;
    onShuffle?.();
    const el = hangerRef.current!;
    const flips = 6;
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });
    let last = index;
    for (let i = 0; i < flips; i++) {
      tl.to(el, { x: i % 2 ? 40 : -40, rotation: i % 2 ? 6 : -6, scale: 0.92, duration: 0.09, ease: "power1.inOut" }).add(() => {
        let n = Math.floor(Math.random() * products.length);
        if (products.length > 1) while (n === last) n = Math.floor(Math.random() * products.length);
        last = n;
        const cw = Math.floor(Math.random() * (products[n].colorways.length || 1));
        setIndex(n);
        setColorIdx(cw);
        garmentRef.current?.style.setProperty("--garment", products[n].colorways[cw]?.hex ?? "#eee");
      });
    }
    tl.to(el, { x: 0, rotation: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
  };

  const flip = (to: "front" | "back") => {
    if (to === side) return;
    const el = garmentRef.current;
    if (!el) return setSide(to);
    gsap
      .timeline()
      .to(el, { scaleX: 0, duration: 0.18, ease: "power2.in" })
      .add(() => setSide(to))
      .to(el, { scaleX: 1, duration: 0.3, ease: "back.out(2)" });
  };

  useEffect(() => {
    onState?.(index, colorIdx, side);
  }, [index, colorIdx, side, onState]);

  useEffect(() => {
    if (!request || request.index === index) return;
    go(request.index > index ? 1 : -1, request.index);
    // only react to new requests
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.seq]);

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // swipe support
  const touchX = useRef<number | null>(null);

  if (!product) {
    return <div className="grid min-h-[60dvh] place-items-center text-black/50">New drops coming soon.</div>;
  }

  const avail = availability(product);

  return (
    <div className="relative overflow-hidden bg-[#EEEDE8]" ref={stageRef}>
      <div
        className="relative mx-auto grid max-w-6xl grid-rows-[1fr_auto] px-4 pb-16 pt-2 sm:min-h-[calc(100dvh-4rem)] sm:px-10 sm:pt-6"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="flex items-start justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-black/60">
          <span>
            {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={shuffle} className="rounded-full px-3 py-1 ring-1 ring-black/20 transition hover:bg-black hover:text-white">
            Shuffle ⤮
          </button>
        </div>

        {/* stage */}
        <div className="relative grid place-items-center">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous item"
            className="absolute left-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/60 text-lg ring-1 ring-black/20 backdrop-blur transition hover:bg-black hover:text-white sm:left-4"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next item"
            className="absolute right-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/60 text-lg ring-1 ring-black/20 backdrop-blur transition hover:bg-black hover:text-white sm:right-4"
          >
            →
          </button>

          <div className="relative flex items-start gap-2 sm:gap-6">
            {/* hanger + garment */}
            <div ref={hangerRef} className="relative w-[min(56vw,380px)]" style={{ transformOrigin: "50% 0%" }}>
              <svg viewBox="0 0 200 70" className="mx-auto -mb-3 w-[46%]" aria-hidden>
                <path d="M100 6 a10 10 0 1 1 9 10 c-5 1 -9 4 -9 9 v6" fill="none" stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
                <path d="M100 31 L14 62 Q8 66 16 66 L184 66 Q192 66 186 62 Z" fill="none" stroke="#3f3f46" strokeWidth="4" strokeLinejoin="round" />
              </svg>
              <div ref={garmentRef} style={{ ["--garment" as string]: colorway?.hex }}>
                <Garment product={product} side={side} colorway={colorway} printHex={colorway?.printHex ?? "#fff"} className="w-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.18)]" />
              </div>
            </div>

            {/* colour tags */}
            <div ref={tagsRef} className="mt-8 flex gap-2 sm:mt-12 sm:gap-3" role="radiogroup" aria-label="Colour">
              {product.colorways.map((c, i) => (
                <div key={c.name + i} className="flex flex-col items-center" style={{ transformOrigin: "50% 0%" }}>
                  <span className="h-6 w-px bg-black/50 sm:h-10" aria-hidden />
                  <button
                    type="button"
                    role="radio"
                    aria-checked={i === colorIdx}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => pickColor(i)}
                    className={cn(
                      "relative grid h-16 w-8 place-items-center rounded-[6px] shadow-md ring-1 ring-black/15 transition sm:h-24 sm:w-11",
                      i === colorIdx ? "-translate-y-1 ring-2 ring-black" : "hover:-translate-y-0.5",
                    )}
                    style={{ background: c.tagHex || c.hex }}
                  >
                    <span className="absolute top-1.5 h-2 w-2 rounded-full bg-[#EEEDE8] ring-1 ring-black/20" />
                    <span
                      className="mt-3 text-[8px] font-black uppercase tracking-widest sm:text-[9px]"
                      style={{ writingMode: "vertical-rl", color: c.printHex }}
                    >
                      {c.name}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* info */}
        <div ref={titleRef} className="mt-4 flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wide sm:text-2xl">{product.name}</h2>
          <div className="text-sm font-semibold text-black/70">
            {money(product)} · <span className={cn("rounded-full px-2 py-0.5 text-xs", avail.tone)}>{avail.label}</span>
          </div>
          <div className="flex rounded-full bg-white p-1 text-[11px] font-black uppercase tracking-widest ring-1 ring-black/20">
            {(["front", "back"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={side === s}
                onClick={() => flip(s)}
                className={cn("rounded-full px-4 py-1.5 uppercase transition", side === s ? "bg-black text-white" : "text-black/50")}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAvail(true)}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/60 underline-offset-4 hover:underline"
          >
            See availability ↗
          </button>
        </div>
      </div>

      {/* ticker */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden bg-[#86EF55] py-2" aria-hidden>
        <div ref={tickerRef} className="flex w-max whitespace-nowrap text-xs font-black uppercase tracking-[0.25em] text-black">
          {[0, 1].map((k) => (
            <span key={k} className="pr-6">
              {Array.from({ length: 6 }, () => ticker).join(" • ")} •{" "}
            </span>
          ))}
        </div>
      </div>

      {/* availability drawer */}
      {showAvail ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setShowAvail(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} availability`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[2rem] bg-white p-6 shadow-card sm:rounded-[2rem]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-black/50">{colorway?.name}</div>
                <div className="font-display text-xl font-extrabold uppercase">{product.name}</div>
                <div className="mt-1 font-semibold">{money(product)}</div>
              </div>
              <button type="button" onClick={() => setShowAvail(false)} className="text-[11px] font-bold uppercase tracking-widest">
                Close ✕
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/70">{product.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {product.sizes.map((z) => {
                const n = product.stock?.[z] ?? 0;
                return (
                  <button
                    key={z}
                    type="button"
                    disabled={n <= 0}
                    onClick={() => setSize(z)}
                    className={cn(
                      "rounded-2xl px-2 py-2 text-sm font-bold ring-1 ring-black/15",
                      size === z && "bg-black text-white",
                      n <= 0 && "cursor-not-allowed text-black/30 line-through",
                    )}
                  >
                    {z}
                    <span className="block text-[10px] font-semibold opacity-70">{n <= 0 ? "Sold out" : `${n} left`}</span>
                  </button>
                );
              })}
            </div>
            <a
              href={`/contact/?subject=${encodeURIComponent("Clothing collection")}&message=${encodeURIComponent(`I’d like to request: ${product.name} — ${colorway?.name ?? ""}${size ? ` — size ${size}` : ""}`)}#form-title`}
              className={cn(
                "mt-5 block rounded-full bg-black px-6 py-3 text-center text-sm font-bold uppercase tracking-widest text-white",
                !size && "pointer-events-none opacity-40",
              )}
              aria-disabled={!size}
            >
              {size ? `Request size ${size}` : "Pick a size"}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
