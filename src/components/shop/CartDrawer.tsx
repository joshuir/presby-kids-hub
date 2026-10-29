"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { cart, formatMoney, useCart } from "@/lib/cart";
import { useContent } from "@/lib/useContent";
import { useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import { shopConfig, stockOf } from "./shop";
import { sizeName } from "./ShopGrid";

/** Slide-in shopping bag, opened from the header icon, the shop, or `openBag()`. */
export function CartDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("cm:open-bag", show);
    if (new URLSearchParams(location.search).get("bag") === "open") setOpen(true);
    return () => window.removeEventListener("cm:open-bag", show);
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [open]);

  return <AnimatePresence>{open ? <BagPanel onClose={() => setOpen(false)} /> : null}</AnimatePresence>;
}

/** Only mounted while open, so the catalogue (for stock limits) is loaded on demand. */
function BagPanel({ onClose }: { onClose: () => void }) {
  const setOpen = (v: boolean) => { if (!v) onClose(); };
  const { items, count, subtotal, currency } = useCart();
  const products = useContent("products") ?? [];
  const cfg = shopConfig(useSettings());
  const maxFor = (productId: string, size: string) => {
    const p = products.find((x) => x.id === productId);
    return p ? stockOf(p, size) : 10;
  };
  const toFree = cfg.delivery && cfg.freeOver > 0 ? Math.max(0, cfg.freeOver - subtotal) : 0;

  return (
        <motion.div className="fixed inset-0 z-[95] flex justify-end bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="flex h-full w-full max-w-md flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-ink/10 p-5">
              <h2 className="font-display text-2xl font-extrabold">Your bag {count ? <span className="text-ink/45">({count})</span> : null}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close bag" className="grid h-10 w-10 place-items-center rounded-full bg-paper"><X className="h-5 w-5" aria-hidden /></button>
            </div>

            {items.length ? (
              <>
                {cfg.delivery && cfg.freeOver > 0 ? (
                  <div className="border-b border-ink/10 px-5 py-3 text-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <Truck className="h-4 w-4 text-blueBrand-600" aria-hidden />
                      {toFree > 0 ? <>Add {formatMoney(toFree, currency)} for free delivery</> : <>You&apos;ve unlocked free delivery 🎉</>}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
                      <motion.div className="h-full rounded-full bg-blueBrand-600" initial={false} animate={{ width: `${Math.min(100, (subtotal / cfg.freeOver) * 100)}%` }} />
                    </div>
                  </div>
                ) : null}
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {items.map((x, k) => {
                      const max = maxFor(x.productId, x.size);
                      return (
                        <motion.li key={x.productId + x.colour + x.size} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }} className="flex gap-3 py-4">
                          <Link href={`/collection/?item=${x.productId}#shop`} onClick={() => setOpen(false)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#EEEDE8]">
                            {x.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sized(x.image, 160, 200)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="block h-full w-full" style={{ background: x.hex }} />
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold leading-tight">{x.name}</div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/55">
                              <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: x.hex }} aria-hidden /> {x.colour} · {sizeName(x.size)}
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex items-center rounded-full ring-1 ring-ink/15">
                                <button type="button" aria-label={`Fewer ${x.name}`} onClick={() => cart.setQty(k, x.qty - 1, max)} className="grid h-8 w-8 place-items-center"><Minus className="h-3.5 w-3.5" aria-hidden /></button>
                                <span className="w-5 text-center text-sm font-bold tabular-nums">{x.qty}</span>
                                <button type="button" aria-label={`More ${x.name}`} disabled={x.qty >= max} onClick={() => cart.setQty(k, x.qty + 1, max)} className="grid h-8 w-8 place-items-center disabled:opacity-30"><Plus className="h-3.5 w-3.5" aria-hidden /></button>
                              </div>
                              <button type="button" aria-label={`Remove ${x.name}`} onClick={() => cart.remove(k)} className="text-ink/50 hover:text-red-700"><Trash2 className="h-4 w-4" aria-hidden /></button>
                            </div>
                            {x.qty >= max ? <div className="mt-1 text-xs font-bold text-[#C2410C]">Only {max} in stock</div> : null}
                          </div>
                          <div className="text-sm font-bold tabular-nums">{formatMoney(x.price * x.qty, x.currency)}</div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="border-t border-ink/10 p-5">
                  <div className="flex justify-between text-lg font-extrabold"><span>Subtotal</span><span className="tabular-nums">{formatMoney(subtotal, currency)}</span></div>
                  <p className="mt-1 text-sm text-ink/55">Delivery or free collection chosen at checkout.</p>
                  {cfg.notice ? <p className="mt-2 rounded-xl bg-paper p-3 text-xs text-ink/65">{cfg.notice}</p> : null}
                  <Link href="/collection/checkout/" onClick={() => setOpen(false)} className="mt-4 flex h-12 items-center justify-center rounded-full bg-blueBrand-600 text-sm font-extrabold uppercase tracking-widest text-white shadow-[0_4px_0_#173EA8] hover:bg-blueBrand-700">
                    Checkout
                  </Link>
                  <button type="button" onClick={() => setOpen(false)} className="mt-2 h-11 w-full rounded-full text-sm font-bold ring-1 ring-ink/15 hover:bg-paper">Keep shopping</button>
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center text-ink/55">
                <div>
                  <ShoppingBag className="mx-auto h-10 w-10" aria-hidden />
                  <p className="mt-3 font-bold text-ink">Your bag is empty</p>
                  <Link href="/collection/#shop" onClick={() => setOpen(false)} className="btn btn-dark mt-4">Browse the collection</Link>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
  );
}
