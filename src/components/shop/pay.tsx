"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, FlaskConical, Lock, Smartphone, X } from "lucide-react";
import { demoPay, verifyPayment, type Order } from "@/lib/cms/client";
import { formatMoney } from "@/lib/cart";
import { loadScript, type shopConfig } from "./shop";
import { cn } from "@/lib/cn";

type Cfg = ReturnType<typeof shopConfig>;
export type PayTarget = { ref: string; total: number; currency: string; email: string; name: string; phone: string; provider: "paystack" | "flutterwave" };

declare global {
  interface Window {
    PaystackPop?: new () => { newTransaction: (o: Record<string, unknown>) => void };
    FlutterwaveCheckout?: (o: Record<string, unknown>) => { close?: () => void } | void;
  }
}

export const PROVIDER_NAME = { paystack: "Paystack", flutterwave: "Flutterwave", later: "Pay on collection / delivery" } as const;

/** Is this provider going to use the demo (test) window instead of the real one? */
export const isDemo = (cfg: Cfg, p: "paystack" | "flutterwave") => (p === "paystack" ? !cfg.paystackKey : !cfg.flutterwaveKey) && cfg.mode === "test";

/**
 * Opens the real Paystack / Flutterwave payment window, then asks our server to verify the payment
 * with the provider (amount + currency must match). Resolves with the paid order, or null if closed.
 */
export async function payOnline(t: PayTarget, cfg: Cfg): Promise<Order | null> {
  const attempt = `${t.ref}-${Date.now().toString(36).toUpperCase()}`;
  if (t.provider === "paystack") {
    await loadScript("https://js.paystack.co/v2/inline.js");
    if (!window.PaystackPop) throw new Error("Paystack didn't load — please try again.");
    return new Promise((resolve, reject) => {
      new window.PaystackPop!().newTransaction({
        key: cfg.paystackKey,
        email: t.email,
        amount: Math.round(t.total * 100),
        currency: t.currency,
        reference: attempt,
        channels: ["card", "mobile_money"],
        metadata: { order: t.ref, name: t.name, phone: t.phone },
        onSuccess: (tx: { reference: string }) => verifyPayment({ ref: t.ref, provider: "paystack", reference: tx.reference }).then(resolve, reject),
        onCancel: () => resolve(null),
        onError: (e: { message?: string }) => reject(new Error(e?.message || "Paystack could not start the payment.")),
      });
    });
  }
  await loadScript("https://checkout.flutterwave.com/v3.js");
  if (!window.FlutterwaveCheckout) throw new Error("Flutterwave didn't load — please try again.");
  return new Promise((resolve, reject) => {
    let settled = false;
    const modal = window.FlutterwaveCheckout!({
      public_key: cfg.flutterwaveKey,
      tx_ref: attempt,
      amount: t.total,
      currency: t.currency,
      payment_options: "card,mobilemoneyghana",
      customer: { email: t.email, phone_number: t.phone, name: t.name },
      customizations: { title: "Children's Ministry shop", description: `Order ${t.ref}`, logo: `${location.origin}/brand/logo.png` },
      callback: (d: { transaction_id?: number; status?: string }) => {
        settled = true;
        (modal as { close?: () => void } | undefined)?.close?.();
        if (!d.transaction_id) return resolve(null);
        verifyPayment({ ref: t.ref, provider: "flutterwave", transactionId: d.transaction_id }).then(resolve, reject);
      },
      onclose: () => {
        if (!settled) resolve(null);
      },
    });
  });
}

/**
 * Test-mode stand-in for the Paystack / Flutterwave window (used until real keys are added in the CMS).
 * Nothing is charged; the order is marked paid with a TEST reference.
 */
export function DemoPay({ target, contact, onDone, onClose }: { target: PayTarget; contact: string; onDone: (o: Order) => void; onClose: () => void }) {
  const [method, setMethod] = useState<"card" | "momo">("momo");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const brand = target.provider === "paystack" ? { name: "Paystack", color: "#0BA4DB" } : { name: "Flutterwave", color: "#F5A623" };
  const pay = async () => {
    setBusy(true);
    setErr("");
    try {
      await new Promise((r) => setTimeout(r, 900));
      onDone(await demoPay(target.ref, contact));
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <motion.div className="fixed inset-0 z-[120] grid place-items-center bg-ink/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div role="dialog" aria-modal="true" aria-label={`${brand.name} test payment`} initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-sm overflow-hidden rounded-[1.6rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 text-white" style={{ background: brand.color }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80">{brand.name} · test mode</div>
            <div className="font-display text-2xl font-extrabold">{formatMoney(target.total, target.currency)}</div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close payment window" className="grid h-9 w-9 place-items-center rounded-full bg-white/20"><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="p-5">
          <p className="flex items-start gap-2 rounded-xl bg-sun-soft p-3 text-sm text-[#7A5200]">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Test payment — no money will be taken. Real payments start when the ministry adds its {brand.name} keys and switches the shop to live.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
            {([["momo", "Mobile Money", Smartphone], ["card", "Card", CreditCard]] as const).map(([k, l, I]) => (
              <button key={k} type="button" role="radio" aria-checked={method === k} onClick={() => setMethod(k)} className={cn("flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ring-1", method === k ? "ring-2 ring-ink" : "ring-ink/15")}>
                <I className="h-4 w-4" aria-hidden /> {l}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-paper p-3 text-sm text-ink/60">
            {method === "momo" ? <>MTN MoMo · {target.phone || "024 000 0000"} <span className="text-ink/40">(test)</span></> : <>Visa •••• 4081 · 12/30 <span className="text-ink/40">(test card)</span></>}
          </div>
          {err ? <p role="alert" className="mt-3 text-sm font-bold text-red-700">{err}</p> : null}
          <button type="button" onClick={pay} disabled={busy} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold uppercase tracking-widest text-white disabled:opacity-60" style={{ background: brand.color }}>
            <Lock className="h-4 w-4" aria-hidden /> {busy ? "Processing…" : `Pay ${formatMoney(target.total, target.currency)}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
