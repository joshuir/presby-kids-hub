"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { Check, Heart, Minus, Plus, Ruler, Shirt, ShoppingBag, Shuffle, Trash2, X, ZoomIn } from "lucide-react";
import type { Colorway, ProductDoc } from "@/lib/cms/types";
import { Garment } from "./Garment";
import { submitForm } from "@/lib/cms/client";
import { useMotionLevel } from "@/components/motion/MotionDirector";
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

const totalStock = (p: ProductDoc) => p.sizes.reduce((s, z) => s + (p.stock?.[z] ?? 0), 0);

/** Studio product shot: garment (or real photo) on a soft seamless backdrop with a floor shadow. */
export function ProductShot({ product, colorway, side, className, zoom }: { product: ProductDoc; colorway?: Colorway; side: "front" | "back"; className?: string; zoom?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
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
        <Garment product={product} side={side} colorway={colorway} printHex={colorway?.printHex ?? "#fff"} className="h-full w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.16)]" />
      </div>
      {zoom && !lens ? (
        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-ink/70 backdrop-blur sm:inline-flex">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Hover to zoom
        </span>
      ) : null}
    </div>
  );
}

// ---------------- request bag ----------------
type BagItem = { id: string; name: string; colour: string; size: string; qty: number; price: number; currency: string; hex: string };
const BAG = "cm-bag";
function readBag(): BagItem[] {
  try {
    return JSON.parse(localStorage.getItem(BAG) ?? "[]");
  } catch {
    return [];
  }
}
function useBag() {
  const [items, setItems] = useState<BagItem[]>([]);
  useEffect(() => setItems(readBag()), []);
  const save = (next: BagItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(BAG, JSON.stringify(next));
    } catch {}
  };
  return {
    items,
    add: (it: BagItem) => {
      const i = items.findIndex((x) => x.id === it.id && x.colour === it.colour && x.size === it.size);
      if (i >= 0) {
        const n = [...items];
        n[i] = { ...n[i], qty: Math.min(10, n[i].qty + it.qty) };
        save(n);
      } else save([...items, it]);
    },
    setQty: (k: number, q: number) => save(items.map((x, i) => (i === k ? { ...x, qty: Math.max(1, Math.min(10, q)) } : x))),
    remove: (k: number) => save(items.filter((_, i) => i !== k)),
    clear: () => save([]),
  };
}

const SIZE_GUIDE = [
  ["3-4", "56–58", "52–56"],
  ["5-6", "60–64", "58–62"],
  ["7-8", "66–70", "64–68"],
  ["9-10", "72–76", "70–74"],
  ["11-13", "78–84", "76–82"],
  ["S", "86–92", "84–90"],
  ["M", "94–100", "92–98"],
  ["L", "102–108", "100–106"],
  ["XL", "110–118", "108–116"],
  ["XXL", "120–128", "118–126"],
];

function SizeGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[95] grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Size guide" onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-[1.8rem] bg-white p-6 sm:rounded-[1.8rem]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-extrabold">Size guide</h3>
          <button type="button" onClick={onClose} aria-label="Close size guide" className="grid h-10 w-10 place-items-center rounded-full bg-paper"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        <p className="mt-1 text-sm text-ink/60">Body measurements in centimetres. Between sizes? Size up — kids grow fast!</p>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50"><th className="py-2">Size</th><th>Chest</th><th>Waist</th></tr>
          </thead>
          <tbody>
            {SIZE_GUIDE.map(([z, c, w]) => (
              <tr key={z} className="border-b border-ink/5"><td className="py-2 font-bold">{sizeName(z)} <span className="font-normal text-ink/45">{/^\d/.test(z) ? "" : z}</span></td><td>{c}</td><td>{w}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductDetail({ product, initialColor = 0, onClose, onAdd }: { product: ProductDoc; initialColor?: number; onClose: () => void; onAdd: (it: BagItem) => void }) {
  const [ci, setCi] = useState(initialColor);
  const [view, setView] = useState<string>("front");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cw = product.colorways[ci];
  const views = ["front", "back", "detail", ...(product.photos ?? [])];
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
      const s = new Set<string>(JSON.parse(localStorage.getItem("cm-wish") ?? "[]"));
      if (next) s.add(product.id);
      else s.delete(product.id);
      localStorage.setItem("cm-wish", JSON.stringify([...s]));
    } catch {}
  };
  const add = () => {
    if (!size) {
      setNeedSize(true);
      return;
    }
    onAdd({ id: product.id, name: product.name, colour: cw?.name ?? "", size: sizeName(size), qty, price: product.price, currency: product.currency, hex: cw?.hex ?? "#eee" });
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
        <div className="bg-[#EEEDE8] p-3 sm:p-4">
          <AnimatePresence mode="wait">
            <motion.div key={view + ci} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {view === "front" || view === "back" ? (
                <ProductShot product={product} colorway={cw} side={view} zoom className="aspect-[4/5] w-full rounded-[1.4rem]" />
              ) : view === "detail" ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.4rem] bg-[#EEEDE8]">
                  <div className="absolute inset-0 origin-[50%_32%] scale-[2.3]" style={{ ["--garment" as string]: cw?.hex }}>
                    <Garment product={product} side="front" colorway={cw} printHex={cw?.printHex ?? "#fff"} className="h-full w-full" />
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-bold">Print detail</span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sized(view, 1000, 1250)} alt={`${product.name} photo`} className="aspect-[4/5] w-full rounded-[1.4rem] object-cover" />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {views.map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} aria-label={v.startsWith("http") ? "Product photo" : `${v} view`} className={cn("h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition", view === v ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100")}>
                {v === "front" || v === "back" ? (
                  <ProductShot product={product} colorway={cw} side={v} className="h-full w-full" />
                ) : v === "detail" ? (
                  <span className="grid h-full w-full place-items-center bg-white text-[10px] font-bold uppercase">Detail</span>
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
          {product.badge ? <span className="inline-block bg-ink px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white">{product.badge}</span> : null}
          <div className="mt-2 flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold uppercase leading-tight sm:text-3xl">{product.name}</h2>
            <button type="button" onClick={toggleFav} aria-pressed={fav} aria-label={fav ? "Remove from favourites" : "Add to favourites"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-ink/10 hover:bg-paper">
              <Heart className={cn("h-5 w-5", fav && "fill-[#E11D48] text-[#E11D48]")} aria-hidden />
            </button>
          </div>
          <div className="mt-1 text-xl font-bold">{money(product)}</div>

          <div className="mt-6 text-sm"><span className="font-bold uppercase tracking-wider">Colour:</span> {cw?.name}</div>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Colour">
            {product.colorways.map((c, i) => (
              <button key={c.name + i} type="button" role="radio" aria-checked={i === ci} aria-label={c.name} onClick={() => setCi(i)} className={cn("aspect-[4/5] overflow-hidden ring-1 transition", i === ci ? "ring-2 ring-ink" : "ring-ink/10 hover:ring-ink/40")}>
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
              const n = product.stock?.[z] ?? 0;
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
                  }}
                  className={cn("flex min-h-14 flex-col items-center justify-center border px-1 py-1.5 text-sm font-bold leading-tight transition", size === z ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink", n <= 0 && "cursor-not-allowed border-ink/10 text-ink/30 line-through")}
                  aria-label={`${sizeName(z)}${n <= 0 ? " — sold out" : n < 4 ? ` — only ${n} left` : ""}`}
                >
                  <span>{sizeName(z)}</span>
                  {sizeName(z) !== z && !/^\d/.test(z) ? <span className={cn("text-[11px] font-semibold", size === z ? "text-white/70" : "text-ink/45")}>{z}</span> : null}
                </button>
              );
            })}
          </div>
          {size && (product.stock?.[size] ?? 0) < 4 ? <p className="mt-2 text-sm font-bold text-[#C2410C]">Only {product.stock?.[size]} left in {sizeName(size)}</p> : null}
          {needSize && !size ? <p role="alert" className="mt-2 text-sm font-bold text-red-700">Please choose a size</p> : null}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-12 items-center rounded-full ring-1 ring-ink/15">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer" className="grid h-12 w-11 place-items-center"><Minus className="h-4 w-4" aria-hidden /></button>
              <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="More" className="grid h-12 w-11 place-items-center"><Plus className="h-4 w-4" aria-hidden /></button>
            </div>
            <button type="button" onClick={add} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-sm font-extrabold uppercase tracking-widest text-white transition hover:bg-black">
              {added ? <><Check className="h-5 w-5" aria-hidden /> Added</> : <><ShoppingBag className="h-5 w-5" aria-hidden /> Add to request bag</>}
            </button>
          </div>
          <p className="mt-3 text-sm text-ink/55">No online payment — send your request and we&apos;ll confirm and arrange collection after Sunday service.</p>

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
            <details className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold uppercase tracking-wider">Prints <Plus className="h-4 w-4 transition group-open:rotate-45" aria-hidden /></summary>
              <p className="mt-2 leading-6 text-ink/70">Front: “{product.frontPrint.replace(/\n/g, " ")}” · Back: “{product.backPrint.replace(/\n/g, " ")}”</p>
            </details>
          </div>
        </div>
        {guide ? <SizeGuide onClose={() => setGuide(false)} /> : null}
      </motion.div>
    </motion.div>
  );
}

function Bag({ bag, open, onClose }: { bag: ReturnType<typeof useBag>; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const total = bag.items.reduce((s, x) => s + x.price * x.qty, 0);
  const cur = bag.items[0]?.currency ?? "GHS";
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      await submitForm("order", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        items: bag.items.map((x) => `${x.qty} × ${x.name} — ${x.colour} — ${x.size}`).join("\n"),
        total: money({ price: total, currency: cur }),
        message: form.note,
      });
      bag.clear();
      setState("sent");
    } catch (x) {
      setErr((x as Error).message);
      setState("error");
    }
  };
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[95] flex justify-end bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside role="dialog" aria-modal="true" aria-label="Request bag" onClick={(e) => e.stopPropagation()} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 280 }} className="flex h-full w-full max-w-md flex-col bg-white">
            <div className="flex items-center justify-between border-b border-ink/10 p-5">
              <h2 className="font-display text-2xl font-extrabold uppercase">Request bag</h2>
              <button type="button" onClick={onClose} aria-label="Close bag" className="grid h-10 w-10 place-items-center rounded-full bg-paper"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {state === "sent" ? (
                <div className="rounded-2xl bg-[#DCFCE7] p-5">
                  <div className="font-display text-xl font-extrabold">Request sent — thank you!</div>
                  <p className="mt-1 text-ink/70">We&apos;ll be in touch to confirm sizes and arrange collection after Sunday service.</p>
                </div>
              ) : bag.items.length ? (
                <>
                  <ul className="grid gap-4">
                    {bag.items.map((x, k) => (
                      <li key={k} className="flex gap-3">
                        <span className="grid h-20 w-16 shrink-0 place-items-center bg-[#EEEDE8]"><Shirt className="h-8 w-8" style={{ color: x.hex }} aria-hidden /></span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold uppercase leading-tight">{x.name}</div>
                          <div className="text-sm text-ink/55">{x.colour} · {x.size}</div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center rounded-full ring-1 ring-ink/15">
                              <button type="button" aria-label="Fewer" onClick={() => bag.setQty(k, x.qty - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3.5 w-3.5" aria-hidden /></button>
                              <span className="w-5 text-center text-sm font-bold">{x.qty}</span>
                              <button type="button" aria-label="More" onClick={() => bag.setQty(k, x.qty + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3.5 w-3.5" aria-hidden /></button>
                            </div>
                            <button type="button" aria-label={`Remove ${x.name}`} onClick={() => bag.remove(k)} className="text-ink/50 hover:text-red-700"><Trash2 className="h-4 w-4" aria-hidden /></button>
                          </div>
                        </div>
                        <div className="text-sm font-bold">{money(x, x.qty)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex justify-between border-t border-ink/10 pt-4 font-bold"><span>Estimated total</span><span>{money({ price: total, currency: cur })}</span></div>
                  <form onSubmit={send} className="mt-6 grid gap-2.5">
                    <input required maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Parent / guardian name" aria-label="Parent or guardian name" className="h-12 rounded-xl bg-paper px-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
                    <input required maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone or WhatsApp" aria-label="Phone or WhatsApp" className="h-12 rounded-xl bg-paper px-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
                    <input type="email" maxLength={80} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" aria-label="Email (optional)" className="h-12 rounded-xl bg-paper px-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
                    <textarea maxLength={500} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Anything else? (optional)" aria-label="Notes (optional)" className="rounded-xl bg-paper px-4 py-3 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
                    {err ? <p role="alert" className="text-sm font-bold text-red-700">{err}</p> : null}
                    <button type="submit" disabled={state === "sending"} className="mt-1 h-12 rounded-full bg-ink text-sm font-extrabold uppercase tracking-widest text-white disabled:opacity-50">
                      {state === "sending" ? "Sending…" : "Send request"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="grid place-items-center py-16 text-center text-ink/55">
                  <ShoppingBag className="h-10 w-10" aria-hidden />
                  <p className="mt-3">Your bag is empty.</p>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProductCard({ p, onOpen }: { p: ProductDoc; onOpen: (colour: number) => void }) {
  const [ci, setCi] = useState(0);
  const [hover, setHover] = useState(false);
  const stock = totalStock(p);
  return (
    <article data-card className="group">
      <button type="button" onClick={() => onOpen(ci)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)} className="relative block w-full text-left" aria-label={`${p.name} — ${p.colorways[ci]?.name}. Open details`}>
        <div className="relative">
          <ProductShot product={p} colorway={p.colorways[ci]} side="front" className={cn("aspect-[4/5] w-full transition-opacity duration-500", hover && "opacity-0")} />
          <div className={cn("absolute inset-0 transition-opacity duration-500", hover ? "opacity-100" : "opacity-0")} aria-hidden>
            <ProductShot product={p} colorway={p.colorways[ci]} side="back" className="h-full w-full" />
          </div>
          {p.badge ? <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">{p.badge}</span> : null}
          {stock <= 0 ? <span className="absolute right-2 top-2 bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase">Sold out</span> : stock < 10 ? <span className="absolute right-2 top-2 bg-[#FFE8E1] px-2 py-0.5 text-[11px] font-extrabold uppercase text-[#C2410C]">Low stock</span> : null}
          <span className="absolute inset-x-2 bottom-2 translate-y-2 rounded-full bg-white/90 py-2 text-center text-xs font-extrabold uppercase tracking-widest opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">Quick view</span>
        </div>
      </button>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-bold uppercase leading-snug">{p.name}</h3>
        <span className="shrink-0 text-[13px] font-bold">{money(p)}</span>
      </div>
      <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label={`${p.name} colours`}>
        {p.colorways.map((c, i) => (
          <button key={c.name + i} type="button" role="radio" aria-checked={i === ci} aria-label={c.name} title={c.name} onMouseEnter={() => setCi(i)} onClick={() => setCi(i)} className={cn("h-5 w-5 rounded-full ring-1 ring-offset-2 transition", i === ci ? "ring-ink" : "ring-ink/15")} style={{ background: c.hex }} />
        ))}
      </div>
    </article>
  );
}

/** Product grid with filters, shuffle, quick view and a request bag. */
export function ShopGrid({ products }: { products: ProductDoc[] }) {
  const level = useMotionLevel();
  const bag = useBag();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("featured");
  const [order, setOrder] = useState<string[]>(() => products.map((p) => p.id));
  const [open, setOpen] = useState<{ id: string; colour: number } | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cats = useMemo(() => ["all", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const label: Record<string, string> = { all: "All", tee: "T-shirts", hoodie: "Hoodies", longsleeve: "Long sleeves", other: "Other" };

  useEffect(() => setOrder(products.map((p) => p.id)), [products]);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("item");
    if (id && products.some((p) => p.id === id)) setOpen({ id, colour: 0 });
  }, [products]);

  const list = useMemo(() => {
    let l = order.map((id) => products.find((p) => p.id === id)!).filter(Boolean).filter((p) => cat === "all" || p.category === cat);
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [order, products, cat, sort]);

  const shuffle = useCallback(() => {
    const el = gridRef.current;
    const next = [...order].sort(() => Math.random() - 0.5);
    if (!el || level === "off") return setOrder(next);
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
    gsap
      .timeline()
      .to(cards, { y: -30, rotate: () => gsap.utils.random(-10, 10), scale: 0.9, opacity: 0, duration: 0.3, stagger: 0.04, ease: "power2.in" })
      .add(() => {
        setSort("featured");
        setOrder(next);
      })
      .add(() => {
        requestAnimationFrame(() => {
          const fresh = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
          gsap.fromTo(fresh, { y: 40, rotate: () => gsap.utils.random(-8, 8), scale: 0.9, opacity: 0 }, { y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.6, stagger: 0.06, ease: "back.out(1.6)" });
        });
      });
  }, [order, level]);

  const current = open ? products.find((p) => p.id === open.id) : undefined;
  const count = bag.items.reduce((s, x) => s + x.qty, 0);

  return (
    <section id="shop" className="scroll-mt-24 bg-white py-16" aria-labelledby="shop-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-black/50">Shop the collection</div>
            <h2 id="shop-title" className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">All items</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={shuffle} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold uppercase tracking-widest ring-1 ring-ink/20 transition hover:bg-ink hover:text-white">
              <Shuffle className="h-4 w-4" aria-hidden /> Shuffle
            </button>
            <label className="sr-only" htmlFor="shop-sort">Sort</label>
            <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-full bg-white px-4 text-sm font-bold ring-1 ring-ink/20">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
            <button type="button" onClick={() => setBagOpen(true)} className="relative inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-extrabold uppercase tracking-widest text-white">
              <ShoppingBag className="h-4 w-4" aria-hidden /> Bag
              {count ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-sun px-1 text-xs text-ink">{count}</span> : null}
            </button>
          </div>
        </div>
        <div className="no-scrollbar mt-6 flex gap-5 overflow-x-auto border-b border-ink/10" role="tablist" aria-label="Category">
          {cats.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-bold uppercase tracking-wider transition", cat === c ? "border-ink text-ink" : "border-transparent text-ink/45 hover:text-ink")}>
              {label[c] ?? c}
            </button>
          ))}
        </div>
        <div ref={gridRef} className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={(colour) => setOpen({ id: p.id, colour })} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {current ? <ProductDetail key={current.id} product={current} initialColor={open?.colour ?? 0} onClose={() => setOpen(null)} onAdd={(it) => bag.add(it)} /> : null}
      </AnimatePresence>
      <Bag bag={bag} open={bagOpen} onClose={() => setBagOpen(false)} />
      {count && !bagOpen ? (
        <button type="button" onClick={() => setBagOpen(true)} className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-extrabold uppercase tracking-widest text-white shadow-2xl sm:hidden">
          <ShoppingBag className="h-4 w-4" aria-hidden /> Bag · {count}
        </button>
      ) : null}
    </section>
  );
}
