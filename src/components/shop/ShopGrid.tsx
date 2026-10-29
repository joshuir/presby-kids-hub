"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { Check, Heart, Lock, Minus, Plus, Ruler, Search, ShoppingBag, Shuffle, SlidersHorizontal, Truck, X, ZoomIn } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Colorway, ProductDoc } from "@/lib/cms/types";
import { Garment } from "./Garment";
import { cart, formatMoney, openBag, useCart } from "@/lib/cart";
import { CATEGORY_LABEL, PRICE_BANDS, onSale, shopConfig, stockOf, totalStock } from "./shop";
import { motionLevel, useMotionLevel } from "@/components/motion/MotionDirector";
import { useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";

export function money(p: { price: number; currency: string }, qty = 1) {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency: p.currency || "GHS" }).format(p.price * qty);
  } catch {
    return `${p.currency} ${(p.price * qty).toFixed(2)}`;
  }
}
/** Friendly size names: S → Small, L → Large, XL → Extra Large, 7-8 → Age 7–8. Custom sizes pass through. */
export function sizeName(z: string) {
  const k = z.trim().toUpperCase();
  const map: Record<string, string> = { XXS: "Extra Extra Small", XS: "Extra Small", S: "Small", M: "Medium", L: "Large", XL: "Extra Large", XXL: "2X Large", "2XL": "2X Large", XXXL: "3X Large", "3XL": "3X Large" };
  if (map[k]) return map[k];
  if (/^\d+\s*-\s*\d+$/.test(k)) return `Age ${k.replace(/\s*-\s*/, "–")}`;
  return z;
}


/** Studio product shot: garment (or real photo) on a soft seamless backdrop with a floor shadow. */
/** The real photo for a colour/side, if the CMS has one. */
export const photoFor = (c: Colorway | undefined, side: "front" | "back") => (side === "front" ? c?.frontImage : c?.backImage || c?.frontImage) || "";
/** A second, different photo to show on hover (back view, or the first lifestyle photo). */
export const altPhoto = (p: ProductDoc, c: Colorway | undefined) => {
  const front = photoFor(c, "front");
  const back = photoFor(c, "back");
  return back && back !== front ? back : p.photos?.[0] || "";
};

export function ProductShot({ product, colorway, side, className, zoom, src, drawn }: { product: ProductDoc; colorway?: Colorway; side: "front" | "back"; className?: string; zoom?: boolean; src?: string; /** force the drawn garment (e.g. to show the back print when there's no back photo) */ drawn?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const photo = drawn ? "" : src || photoFor(colorway, side);
  if (photo) {
    // real product photography: full-bleed, with the same hover-to-zoom lens
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden bg-[#EEEDE8]", zoom && "cursor-zoom-in", className)}
        onPointerMove={(e) => {
          if (!zoom || e.pointerType !== "mouse") return;
          const r = ref.current!.getBoundingClientRect();
          setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setLens(null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sized(photo, 900, 1125)}
          alt={`${product.name} — ${colorway?.name ?? ""} ${side}`.trim()}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out"
          style={{ transform: lens ? "scale(2.1)" : undefined, transformOrigin: lens ? `${lens.x}% ${lens.y}%` : undefined }}
        />
        {zoom && !lens ? (
          <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-ink/70 backdrop-blur sm:inline-flex">
            <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Hover to zoom
          </span>
        ) : null}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_20%,#FAFAF8_0%,#EEEDE8_60%,#E2E0D9_100%)]", zoom && "cursor-zoom-in", className)}
      onPointerMove={(e) => {
        if (!zoom || e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerLeave={() => setLens(null)}
    >
      <div aria-hidden className="absolute inset-x-[18%] bottom-[7%] h-[6%] rounded-[50%] bg-black/15 blur-xl" />
      <div
        className="absolute inset-[8%] transition-transform duration-200 ease-out"
        style={{ ["--garment" as string]: colorway?.hex, transform: lens ? `scale(2.1)` : undefined, transformOrigin: lens ? `${lens.x}% ${lens.y}%` : undefined }}
      >
        <Garment product={product} side={side} colorway={drawn && colorway ? { ...colorway, frontImage: undefined, backImage: undefined } : colorway} printHex={colorway?.printHex ?? "#fff"} className="h-full w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.16)]" />
      </div>
      {zoom && !lens ? (
        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-ink/70 backdrop-blur sm:inline-flex">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Hover to zoom
        </span>
      ) : null}
    </div>
  );
}

// ---------------- size guide (CMS: Settings → Shop & checkout → Size guide) ----------------
function SizeGuide({ product, onClose }: { product: ProductDoc; onClose: () => void }) {
  const cfg = shopConfig(useSettings());
  const rows = cfg.sizeGuide.filter((r) => product.sizes.includes(r.code));
  return (
    <div className="fixed inset-0 z-[96] grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Size guide" onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-[1.8rem] bg-white p-6 sm:rounded-[1.8rem]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-extrabold">Size guide</h3>
          <button type="button" onClick={onClose} aria-label="Close size guide" className="grid h-10 w-10 place-items-center rounded-full bg-paper"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        {rows.length ? (
          <>
            <p className="mt-1 text-sm text-ink/60">Garment measurements in centimetres. Between sizes? Size up — children grow fast!</p>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50"><th className="py-2">Size</th><th>Chest</th><th>Length</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code} className="border-b border-ink/5"><td className="py-2 font-bold">{r.label}</td><td>{r.chest ? `${r.chest} cm` : "—"}</td><td>{r.length ? `${r.length} cm` : "—"}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink/65">{product.sizes.length === 1 ? `${product.name} comes in one size.` : `Available in ${product.sizes.map(sizeName).join(", ")}.`} {product.description}</p>
        )}
        {cfg.returns ? <p className="mt-4 rounded-xl bg-paper p-3 text-sm text-ink/70">{cfg.returns}</p> : null}
      </div>
    </div>
  );
}

// ---------------- product detail ----------------
function Price({ p, className }: { p: ProductDoc; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={onSale(p) ? "text-[#C2410C]" : ""}>{money(p)}</span>
      {onSale(p) ? <s className="text-[0.85em] font-semibold text-ink/40">{money({ price: p.compareAtPrice!, currency: p.currency })}</s> : null}
    </span>
  );
}

function ProductDetail({ product, initialColor = 0, onClose }: { product: ProductDoc; initialColor?: number; onClose: () => void }) {
  const router = useRouter();
  const { items } = useCart();
  const [ci, setCi] = useState(initialColor);
  const [view, setView] = useState<string>("front");
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cw = product.colorways[ci];
  const hasPhotos = !!photoFor(cw, "front");
  const backDiffers = hasPhotos && photoFor(cw, "back") !== photoFor(cw, "front");
  // front + back are always offered: the back is a real photo when there is one, otherwise the printed back drawn
  const views = ["front", "back", ...(product.photos ?? [])];
  const inBag = (z: string) => items.filter((x) => x.productId === product.id && x.size === z).reduce((s, x) => s + x.qty, 0);
  const left = size ? stockOf(product, size) - inBag(size) : 0;

  // the gallery moves on by itself (Settings → Animations → clothing carousels), pausing while you look
  const s = useSettings();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || views.length < 2 || motionLevel(s.animationLevel) === "off") return;
    const t = window.setInterval(() => setView((v) => views[(views.indexOf(v) + 1) % views.length]), Math.max(3, Number(s.shopRotateSeconds) || 5) * 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, views.join("|"), s.animationLevel, s.shopRotateSeconds]);

  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && !guide && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    try {
      setFav((JSON.parse(localStorage.getItem("cm-wish") ?? "[]") as string[]).includes(product.id));
    } catch {}
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose, guide, product.id]);

  const toggleFav = () => {
    const next = !fav;
    setFav(next);
    try {
      const st = new Set<string>(JSON.parse(localStorage.getItem("cm-wish") ?? "[]"));
      if (next) st.add(product.id);
      else st.delete(product.id);
      localStorage.setItem("cm-wish", JSON.stringify([...st]));
    } catch {}
  };
  const add = (buyNow = false) => {
    if (!size) {
      setNeedSize(true);
      return;
    }
    if (left <= 0) return;
    cart.add(
      { productId: product.id, name: product.name, colour: cw?.name ?? "", hex: cw?.hex ?? "#eee", size, qty: Math.min(qty, left), price: product.price, currency: product.currency, image: photoFor(cw, "front") },
      stockOf(product, size),
    );
    if (buyNow) {
      onClose();
      router.push("/collection/checkout/");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div className="fixed inset-0 z-[90] flex items-stretch justify-center bg-ink/50 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative grid w-full max-w-5xl overflow-y-auto bg-white sm:max-h-[92dvh] sm:rounded-[2rem] md:grid-cols-[1.15fr_1fr]"
      >
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/90 shadow ring-1 ring-ink/10">
          <X className="h-5 w-5" aria-hidden />
        </button>
        {/* gallery */}
        <div className="bg-[#EEEDE8] p-3 sm:p-4" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onFocus={() => setPaused(true)}>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={view + ci} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {view === "front" || view === "back" ? (
                  <ProductShot product={product} colorway={cw} side={view} zoom drawn={view === "back" && !backDiffers && hasPhotos} className="aspect-[4/5] w-full rounded-[1.4rem]" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sized(view, 1000, 1250)} alt={`${product.name} photo`} className="aspect-[4/5] w-full rounded-[1.4rem] object-cover" />
                )}
              </motion.div>
            </AnimatePresence>
            {/* front / back switch */}
            <div className="absolute left-3 top-3 flex rounded-full bg-white/90 p-1 text-[11px] font-black uppercase tracking-widest shadow ring-1 ring-ink/10 backdrop-blur" role="group" aria-label="View">
              {(["front", "back"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => { setView(v); setPaused(true); }} className={cn("rounded-full px-3.5 py-1.5 transition", view === v ? "bg-ink text-white" : "text-ink/55 hover:text-ink")}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {views.map((v) => (
              <button key={v} type="button" onClick={() => { setView(v); setPaused(true); }} aria-pressed={view === v} aria-label={v.startsWith("http") ? "Product photo" : `${v} view`} className={cn("h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition", view === v ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100")}>
                {v === "front" || v === "back" ? (
                  <ProductShot product={product} colorway={cw} side={v} drawn={v === "back" && !backDiffers && hasPhotos} className="h-full w-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sized(v, 160, 200)} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
        {/* info */}
        <div className="p-5 sm:p-8">
          {product.badge ? <span className={cn("inline-block px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white", onSale(product) ? "bg-[#C2410C]" : "bg-ink")}>{product.badge}</span> : null}
          <div className="mt-2 flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold uppercase leading-tight sm:text-3xl">{product.name}</h2>
            <button type="button" onClick={toggleFav} aria-pressed={fav} aria-label={fav ? "Remove from favourites" : "Add to favourites"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-ink/10 hover:bg-paper">
              <Heart className={cn("h-5 w-5", fav && "fill-[#E11D48] text-[#E11D48]")} aria-hidden />
            </button>
          </div>
          <Price p={product} className="mt-1 text-xl font-bold" />
          <StockLine p={product} className="mt-2" />

          <div className="mt-6 text-sm"><span className="font-bold uppercase tracking-wider">Colour:</span> {cw?.name}</div>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Colour">
            {product.colorways.map((c, i) => (
              <button key={c.name + i} type="button" role="radio" aria-checked={i === ci} aria-label={c.name} onClick={() => setCi(i)} className={cn("aspect-[4/5] overflow-hidden rounded-lg ring-1 transition", i === ci ? "ring-2 ring-ink" : "ring-ink/10 hover:ring-ink/40")}>
                <ProductShot product={product} colorway={c} side="front" className="h-full w-full" />
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="font-bold uppercase tracking-wider">Size{size ? `: ${sizeName(size)}` : ""}</span>
            <button type="button" onClick={() => setGuide(true)} className="inline-flex items-center gap-1 font-bold underline underline-offset-4"><Ruler className="h-4 w-4" aria-hidden /> Size guide</button>
          </div>
          <div className={cn("mt-2 grid grid-cols-3 gap-2", needSize && !size && "animate-[pulse_0.6s_2]")} role="radiogroup" aria-label="Size">
            {product.sizes.map((z) => {
              const n = stockOf(product, z);
              return (
                <button
                  key={z}
                  type="button"
                  role="radio"
                  aria-checked={size === z}
                  disabled={n <= 0}
                  onClick={() => {
                    setSize(z);
                    setNeedSize(false);
                    setQty(1);
                  }}
                  className={cn("flex min-h-14 flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-sm font-bold leading-tight transition", size === z ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink", n <= 0 && "cursor-not-allowed border-ink/10 text-ink/30 line-through")}
                  aria-label={`${sizeName(z)}${n <= 0 ? " — sold out" : n < 4 ? ` — only ${n} left` : ""}`}
                >
                  <span>{sizeName(z)}</span>
                  <span className={cn("text-[11px] font-semibold", size === z ? "text-white/70" : n <= 0 ? "" : n < 4 ? "text-[#C2410C]" : "text-ink/45")}>{n <= 0 ? "Sold out" : n < 4 ? `${n} left` : "In stock"}</span>
                </button>
              );
            })}
          </div>
          {size && left <= 0 && stockOf(product, size) > 0 ? <p className="mt-2 text-sm font-bold text-[#C2410C]">You already have all {stockOf(product, size)} in your bag.</p> : null}
          {needSize && !size ? <p role="alert" className="mt-2 text-sm font-bold text-red-700">Please choose a size</p> : null}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-12 items-center rounded-full ring-1 ring-ink/15">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer" className="grid h-12 w-11 place-items-center"><Minus className="h-4 w-4" aria-hidden /></button>
              <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(size ? Math.max(1, left) : 10, q + 1))} aria-label="More" className="grid h-12 w-11 place-items-center"><Plus className="h-4 w-4" aria-hidden /></button>
            </div>
            <button type="button" onClick={() => add(false)} disabled={!!size && left <= 0} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-sm font-extrabold uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-40">
              {added ? <><Check className="h-5 w-5" aria-hidden /> Added</> : <><ShoppingBag className="h-5 w-5" aria-hidden /> Add to bag</>}
            </button>
          </div>
          <button type="button" onClick={() => add(true)} disabled={!!size && left <= 0} className="mt-2 h-12 w-full rounded-full bg-blueBrand-600 text-sm font-extrabold uppercase tracking-widest text-white shadow-[0_4px_0_#173EA8] transition hover:bg-blueBrand-700 disabled:opacity-40">
            Buy now
          </button>
          {added ? (
            <button type="button" onClick={() => { onClose(); openBag(); }} className="mt-2 w-full text-center text-sm font-bold underline underline-offset-4">View bag & checkout</button>
          ) : null}
          <ul className="mt-4 grid gap-1.5 text-sm text-ink/65">
            <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-600" aria-hidden /> Secure checkout — card or Mobile Money</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-blueBrand-600" aria-hidden /> Delivery across Ghana or free collection at church</li>
          </ul>

          <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            <details className="group py-3" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold uppercase tracking-wider">Description <Plus className="h-4 w-4 transition group-open:rotate-45" aria-hidden /></summary>
              <p className="mt-2 leading-6 text-ink/70">{product.description}</p>
            </details>
            {product.material || product.care ? (
              <details className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold uppercase tracking-wider">Material & care <Plus className="h-4 w-4 transition group-open:rotate-45" aria-hidden /></summary>
                <p className="mt-2 leading-6 text-ink/70">{product.material}{product.material && product.care ? ". " : ""}{product.care}</p>
              </details>
            ) : null}
            {product.frontPrint || product.backPrint ? (
              <details className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold uppercase tracking-wider">Prints <Plus className="h-4 w-4 transition group-open:rotate-45" aria-hidden /></summary>
                <p className="mt-2 leading-6 text-ink/70">Front: “{product.frontPrint.replace(/\n/g, " ")}” · Back: “{product.backPrint.replace(/\n/g, " ")}”</p>
              </details>
            ) : null}
          </div>
        </div>
        {guide ? <SizeGuide product={product} onClose={() => setGuide(false)} /> : null}
      </motion.div>
    </motion.div>
  );
}

function StockLine({ p, className }: { p: ProductDoc; className?: string }) {
  const n = totalStock(p);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold", n <= 0 ? "text-ink/45" : n < 10 ? "text-[#C2410C]" : "text-emerald-700", className)}>
      <span className={cn("h-2 w-2 rounded-full", n <= 0 ? "bg-ink/30" : n < 10 ? "bg-[#F97316]" : "bg-emerald-500")} aria-hidden />
      {n <= 0 ? "Sold out" : n < 10 ? `Low stock — ${n} left` : "In stock"}
    </span>
  );
}

// ---------------- product card ----------------
function ProductCard({ p, onOpen }: { p: ProductDoc; onOpen: (colour: number) => void }) {
  const [ci, setCi] = useState(0);
  const [hover, setHover] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const stock = totalStock(p);
  const cw = p.colorways[ci];
  const quickAdd = (z: string) => {
    cart.add({ productId: p.id, name: p.name, colour: cw?.name ?? "", hex: cw?.hex ?? "#eee", size: z, qty: 1, price: p.price, currency: p.currency, image: photoFor(cw, "front") }, stockOf(p, z));
    setJustAdded(z);
    setTimeout(() => setJustAdded(null), 1400);
  };
  return (
    <motion.article layout data-card className="group flex flex-col" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <div className="relative overflow-hidden rounded-[1.4rem] bg-[#EEEDE8]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <button type="button" data-cursor="View" onClick={() => onOpen(ci)} onFocus={() => setHover(true)} onBlur={() => setHover(false)} className="relative block w-full text-left" aria-label={`${p.name} — ${cw?.name}. Open details`}>
          <ProductShot product={p} colorway={cw} side="front" className={cn("aspect-[4/5] w-full transition duration-700 group-hover:scale-[1.03]", hover && "opacity-0")} />
          <div className={cn("absolute inset-0 transition-opacity duration-500", hover ? "opacity-100" : "opacity-0")} aria-hidden>
            <ProductShot product={p} colorway={cw} side="back" src={altPhoto(p, cw) || undefined} className="h-full w-full" />
          </div>
        </button>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {p.badge ? <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white", onSale(p) ? "bg-[#C2410C]" : "bg-ink")}>{p.badge}</span> : null}
          {stock <= 0 ? <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase">Sold out</span> : stock < 10 ? <span className="rounded-full bg-[#FFE8E1] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#C2410C]">Only {stock} left</span> : null}
        </div>
        {/* quick add: pick a size straight from the card (mouse & keyboard) */}
        {stock > 0 ? (
          <div className="absolute inset-x-2.5 bottom-2.5 hidden translate-y-3 rounded-2xl bg-white/95 p-2 opacity-0 shadow-lg backdrop-blur transition group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
            <div className="mb-1.5 text-center text-[10px] font-extrabold uppercase tracking-widest text-ink/55">{justAdded ? `Added ${sizeName(justAdded)} ✓` : "Quick add"}</div>
            <div className="flex flex-wrap justify-center gap-1">
              {p.sizes.map((z) => (
                <button key={z} type="button" disabled={stockOf(p, z) <= 0} onClick={() => quickAdd(z)} aria-label={`Add ${p.name}, ${cw?.name}, size ${sizeName(z)} to bag`} className="min-w-9 rounded-full px-2 py-1 text-xs font-bold ring-1 ring-ink/15 transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:text-ink/25 disabled:line-through disabled:hover:bg-transparent">
                  {z}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-extrabold uppercase leading-snug sm:text-sm">
          <button type="button" onClick={() => onOpen(ci)} className="text-left hover:underline">{p.name}</button>
        </h3>
        <Price p={p} className="shrink-0 text-[13px] font-bold sm:text-sm" />
      </div>
      <div className="mt-1 text-xs text-ink/50">{CATEGORY_LABEL[p.category] ?? p.category} · {p.colorways.length} colour{p.colorways.length === 1 ? "" : "s"}</div>
      <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label={`${p.name} colours`}>
        {p.colorways.map((c, i) => (
          <button key={c.name + i} type="button" role="radio" aria-checked={i === ci} aria-label={c.name} title={c.name} onMouseEnter={() => setCi(i)} onClick={() => setCi(i)} className={cn("h-5 w-5 rounded-full ring-1 ring-offset-2 transition", i === ci ? "ring-ink" : "ring-ink/15")} style={{ background: c.hex }} />
        ))}
      </div>
    </motion.article>
  );
}

// ---------------- filters ----------------
type Filters = { q: string; cats: string[]; sizes: string[]; colours: string[]; prices: string[]; inStock: boolean; sale: boolean };
const NO_FILTERS: Filters = { q: "", cats: [], sizes: [], colours: [], prices: [], inStock: false, sale: false };
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function FilterPanel({ products, f, setF, cfgCurrency }: { products: ProductDoc[]; f: Filters; setF: (f: Filters) => void; cfgCurrency: string }) {
  const cats = Array.from(new Set(products.map((p) => p.category)));
  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
  const colours = Array.from(new Map(products.flatMap((p) => p.colorways.map((c) => [c.name, c.hex] as const))).entries());
  const chip = (on: boolean) => cn("rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition", on ? "bg-ink text-white ring-ink" : "bg-white ring-ink/15 hover:ring-ink/40");
  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/50">Category</legend>
        <div className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button key={c} type="button" aria-pressed={f.cats.includes(c)} onClick={() => setF({ ...f, cats: toggle(f.cats, c) })} className={chip(f.cats.includes(c))}>{CATEGORY_LABEL[c] ?? c}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/50">Size</legend>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((z) => (
            <button key={z} type="button" aria-pressed={f.sizes.includes(z)} onClick={() => setF({ ...f, sizes: toggle(f.sizes, z) })} className={chip(f.sizes.includes(z))} title={sizeName(z)}>{z}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/50">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {colours.map(([name, hex]) => (
            <button key={name} type="button" aria-pressed={f.colours.includes(name)} onClick={() => setF({ ...f, colours: toggle(f.colours, name) })} className={cn("inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm font-semibold ring-1 transition", f.colours.includes(name) ? "ring-2 ring-ink" : "ring-ink/15 hover:ring-ink/40")}>
              <span className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: hex }} aria-hidden /> {name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/50">Price ({cfgCurrency})</legend>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_BANDS.map((b) => (
            <button key={b.id} type="button" aria-pressed={f.prices.includes(b.id)} onClick={() => setF({ ...f, prices: toggle(f.prices, b.id) })} className={chip(f.prices.includes(b.id))}>{b.label}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-2">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold">
          In stock only
          <input type="checkbox" checked={f.inStock} onChange={(e) => setF({ ...f, inStock: e.target.checked })} className="h-5 w-5 accent-[#0B1530]" />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold">
          On sale
          <input type="checkbox" checked={f.sale} onChange={(e) => setF({ ...f, sale: e.target.checked })} className="h-5 w-5 accent-[#0B1530]" />
        </label>
      </div>
    </div>
  );
}

// ---------------- shop ----------------
/** The shop: search, filters, sorting, quick view / quick add, and the bag. */
export function ShopGrid({ products }: { products: ProductDoc[] }) {
  const level = useMotionLevel();
  const cfg = shopConfig(useSettings());
  const { count, subtotal, currency } = useCart();
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState("featured");
  const [order, setOrder] = useState<string[]>(() => products.map((p) => p.id));
  const [open, setOpen] = useState<{ id: string; colour: number } | null>(null);
  const [sheet, setSheet] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOrder(products.map((p) => p.id)), [products]);
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const id = sp.get("item");
    if (id && products.some((p) => p.id === id)) setOpen({ id, colour: 0 });
    const q = sp.get("q");
    if (q) setF((x) => ({ ...x, q }));
  }, [products]);
  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheet]);

  const list = useMemo(() => {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    let l = order.map((id) => products.find((p) => p.id === id)!).filter(Boolean).filter((p) => {
      const text = `${p.name} ${p.description} ${CATEGORY_LABEL[p.category] ?? p.category} ${p.colorways.map((c) => c.name).join(" ")} ${p.badge ?? ""} ${p.frontPrint} ${p.backPrint}`.toLowerCase();
      if (words.length && !words.every((w) => text.includes(w))) return false;
      if (f.cats.length && !f.cats.includes(p.category)) return false;
      if (f.sizes.length && !f.sizes.some((z) => p.sizes.includes(z) && (!f.inStock || stockOf(p, z) > 0))) return false;
      if (f.colours.length && !p.colorways.some((c) => f.colours.includes(c.name))) return false;
      if (f.prices.length && !PRICE_BANDS.some((b) => f.prices.includes(b.id) && b.test(p.price))) return false;
      if (f.inStock && totalStock(p) <= 0) return false;
      if (f.sale && !onSale(p)) return false;
      return true;
    });
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "new") l = [...l].sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0) || b.order - a.order);
    if (sort === "az") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "stock") l = [...l].sort((a, b) => totalStock(b) - totalStock(a));
    return l;
  }, [order, products, f, sort]);

  const active = [
    ...f.cats.map((c) => ({ label: CATEGORY_LABEL[c] ?? c, clear: () => setF({ ...f, cats: toggle(f.cats, c) }) })),
    ...f.sizes.map((z) => ({ label: `Size ${z}`, clear: () => setF({ ...f, sizes: toggle(f.sizes, z) }) })),
    ...f.colours.map((c) => ({ label: c, clear: () => setF({ ...f, colours: toggle(f.colours, c) }) })),
    ...f.prices.map((id) => ({ label: PRICE_BANDS.find((b) => b.id === id)?.label ?? id, clear: () => setF({ ...f, prices: toggle(f.prices, id) }) })),
    ...(f.inStock ? [{ label: "In stock", clear: () => setF({ ...f, inStock: false }) }] : []),
    ...(f.sale ? [{ label: "On sale", clear: () => setF({ ...f, sale: false }) }] : []),
  ];

  const shuffle = useCallback(() => {
    const el = gridRef.current;
    const next = [...order].sort(() => Math.random() - 0.5);
    if (!el || level === "off") return setOrder(next);
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
    gsap
      .timeline()
      .to(cards, { y: -24, rotate: () => gsap.utils.random(-8, 8), scale: 0.92, opacity: 0, duration: 0.25, stagger: 0.03, ease: "power2.in" })
      .add(() => {
        setSort("featured");
        setOrder(next);
      })
      .add(() => {
        requestAnimationFrame(() => {
          const fresh = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
          gsap.fromTo(fresh, { y: 30, rotate: () => gsap.utils.random(-6, 6), scale: 0.92, opacity: 0 }, { y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.55, stagger: 0.05, ease: "back.out(1.6)", clearProps: "transform,opacity" });
        });
      });
  }, [order, level]);

  const current = open ? products.find((p) => p.id === open.id) : undefined;
  const nFilters = active.length;

  return (
    <section id="shop" className="scroll-mt-24 bg-white py-14 sm:py-16" aria-labelledby="shop-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-black/50">Shop the collection</div>
            <h2 id="shop-title" className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">All items</h2>
          </div>
          <button type="button" onClick={openBag} className="relative inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-extrabold uppercase tracking-widest text-white">
            <ShoppingBag className="h-4 w-4" aria-hidden /> Bag
            {count ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-sun px-1 text-xs text-ink">{count}</span> : null}
          </button>
        </div>

        {/* toolbar */}
        <div className="sticky top-[84px] z-20 -mx-4 mt-6 border-y border-ink/10 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-0 flex-1 basis-56">
              <span className="sr-only">Search the collection</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
              <input type="search" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search tees, hoodies, colours…" className="h-11 w-full rounded-full bg-paper pl-10 pr-4 text-sm outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
            </label>
            <button type="button" onClick={() => setSheet(true)} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold ring-1 ring-ink/20 transition hover:bg-paper lg:hidden" aria-haspopup="dialog">
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{nFilters ? ` (${nFilters})` : ""}
            </button>
            <label className="sr-only" htmlFor="shop-sort">Sort by</label>
            <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-full bg-white px-4 text-sm font-bold ring-1 ring-ink/20">
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="az">Name: A–Z</option>
              <option value="stock">Most in stock</option>
            </select>
            <button type="button" onClick={shuffle} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold ring-1 ring-ink/20 transition hover:bg-ink hover:text-white" aria-label="Shuffle the products">
              <Shuffle className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Shuffle</span>
            </button>
          </div>
          {nFilters ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {active.map((a) => (
                <button key={a.label} type="button" onClick={a.clear} className="inline-flex items-center gap-1 rounded-full bg-blueBrand-50 px-2.5 py-1 text-xs font-bold text-blueBrand-800 hover:bg-blueBrand-100" aria-label={`Remove filter ${a.label}`}>
                  {a.label} <X className="h-3 w-3" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={() => setF({ ...NO_FILTERS, q: f.q })} className="text-xs font-bold underline underline-offset-4">Clear all</button>
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-[180px]">
              <FilterPanel products={products} f={f} setF={setF} cfgCurrency={cfg.currency} />
            </div>
          </aside>
          <div>
            <p className="mb-4 text-sm font-bold text-ink/55" aria-live="polite">{list.length} of {products.length} item{products.length === 1 ? "" : "s"}{f.q ? ` for “${f.q}”` : ""}</p>
            <div ref={gridRef} className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {list.map((p) => (
                  <ProductCard key={p.id} p={p} onOpen={(colour) => setOpen({ id: p.id, colour })} />
                ))}
              </AnimatePresence>
            </div>
            {!list.length ? (
              <div className="rounded-[1.6rem] bg-paper p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-ink/40" aria-hidden />
                <p className="mt-3 font-bold">Nothing matches those filters.</p>
                <button type="button" onClick={() => setF(NO_FILTERS)} className="mt-3 text-sm font-bold text-blueBrand-700 underline underline-offset-4">Clear search & filters</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {sheet ? (
          <motion.div className="fixed inset-0 z-[92] flex items-end bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label="Filters" onClick={(e) => e.stopPropagation()} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="flex max-h-[85dvh] w-full flex-col rounded-t-[1.8rem] bg-white">
              <div className="flex items-center justify-between border-b border-ink/10 p-5">
                <h3 className="font-display text-2xl font-extrabold">Filters</h3>
                <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-full bg-paper"><X className="h-5 w-5" aria-hidden /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5"><FilterPanel products={products} f={f} setF={setF} cfgCurrency={cfg.currency} /></div>
              <div className="flex gap-2 border-t border-ink/10 p-4">
                <button type="button" onClick={() => setF({ ...NO_FILTERS, q: f.q })} className="h-12 flex-1 rounded-full text-sm font-extrabold ring-1 ring-ink/20">Clear</button>
                <button type="button" onClick={() => setSheet(false)} className="h-12 flex-[2] rounded-full bg-ink text-sm font-extrabold text-white">Show {list.length} item{list.length === 1 ? "" : "s"}</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {current ? <ProductDetail key={current.id} product={current} initialColor={open?.colour ?? 0} onClose={() => setOpen(null)} /> : null}
      </AnimatePresence>
      {count ? (
        <button type="button" onClick={openBag} className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-extrabold uppercase tracking-widest text-white shadow-2xl sm:hidden">
          <ShoppingBag className="h-4 w-4" aria-hidden /> {count} · {formatMoney(subtotal, currency)}
        </button>
      ) : null}
    </section>
  );
}
