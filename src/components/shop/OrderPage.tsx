"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, MapPin, Package, Printer, Search, Truck } from "lucide-react";
import { Container } from "@/components/site/Container";
import { Loading } from "@/components/site/LoadState";
import { getOrder, type Order } from "@/lib/cms/client";
import { formatMoney } from "@/lib/cart";
import { useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";
import { shopConfig } from "./shop";
import { sizeName } from "./ShopGrid";
import { rememberOrder } from "./CheckoutPage";
import { DemoPay, PROVIDER_NAME, isDemo, payOnline, type PayTarget } from "./pay";

const PAY_LABEL: Record<string, [string, string]> = {
  paid: ["Paid", "bg-emerald-100 text-emerald-800"],
  pending: ["Awaiting payment", "bg-amber-100 text-amber-900"],
  due: ["Pay on collection / delivery", "bg-sky-100 text-sky-900"],
  failed: ["Payment failed", "bg-red-100 text-red-800"],
  expired: ["Payment not completed", "bg-red-100 text-red-800"],
  refunded: ["Refunded", "bg-ink/10 text-ink"],
};

function steps(o: Order) {
  const delivery = o.fulfilment.method === "delivery";
  const list = [
    { key: "new", label: "Order placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: delivery ? "out_for_delivery" : "ready", label: delivery ? "Out for delivery" : "Ready to collect" },
    { key: "completed", label: delivery ? "Delivered" : "Collected" },
  ];
  const rank = (k: string) => ({ new: 0, confirmed: 1, ready: 2, out_for_delivery: 2, completed: 3 } as Record<string, number>)[k] ?? 0;
  return { list, at: rank(o.status) };
}

function OrderView({ order, contact, onUpdate }: { order: Order; contact: string; onUpdate: (o: Order) => void }) {
  const cfg = shopConfig(useSettings());
  const [demo, setDemo] = useState<PayTarget | null>(null);
  const [err, setErr] = useState("");
  const { list, at } = steps(order);
  const cancelled = order.status === "cancelled";
  const payable = order.payStatus === "pending" && !cancelled && (order.payProvider === "paystack" || order.payProvider === "flutterwave");
  const [label, tone] = PAY_LABEL[order.payStatus] ?? [order.payStatus, "bg-ink/10"];

  const payNow = async () => {
    setErr("");
    const t: PayTarget = { ref: order.ref, total: order.total, currency: order.currency, email: order.customer.email, name: order.customer.name, phone: order.customer.phone, provider: order.payProvider as "paystack" | "flutterwave" };
    if (isDemo(cfg, t.provider)) return setDemo(t);
    try {
      const paid = await payOnline(t, cfg);
      if (paid) onUpdate(paid);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid min-w-0 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-[1.8rem] p-6 text-white sm:p-8", cancelled ? "bg-ink" : order.payStatus === "paid" || order.payStatus === "due" ? "bg-emerald-600" : "bg-blueBrand-600")}>
          <div className="flex items-center gap-3">
            {cancelled ? <Clock className="h-8 w-8" aria-hidden /> : <CheckCircle2 className="h-8 w-8" aria-hidden />}
            <div className="text-sm font-bold uppercase tracking-widest text-white/80">Order {order.ref}</div>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            {cancelled ? "This order was cancelled" : order.payStatus === "paid" ? `Thank you, ${order.customer.name.split(" ")[0]}! You're all paid.` : order.payStatus === "due" ? `Thank you, ${order.customer.name.split(" ")[0]}! Your order is in.` : "Your order is saved — payment still needed"}
          </h1>
          <p className="mt-2 text-white/85">
            {cancelled
              ? "If you think this is a mistake, contact the ministry with your order number."
              : order.fulfilment.method === "delivery"
                ? `We'll deliver to ${order.fulfilment.area}. Keep your phone on — the rider will call ${order.customer.phone}.`
                : `We'll message ${order.customer.phone} when it's ready at: ${order.fulfilment.point}.`}
          </p>
        </motion.div>

        {!cancelled ? (
          <ol className="card grid grid-cols-4 gap-1 p-4 sm:p-6" aria-label="Order progress">
            {list.map((st, i) => (
              <li key={st.key} className="relative flex flex-col items-center text-center">
                {i > 0 ? <span className={cn("absolute right-1/2 top-4 h-1 w-full -translate-y-1/2", i <= at ? "bg-emerald-500" : "bg-ink/10")} aria-hidden /> : null}
                <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className={cn("relative z-[1] grid h-8 w-8 place-items-center rounded-full text-sm font-bold", i <= at ? "bg-emerald-500 text-white" : "bg-paper text-ink/40 ring-1 ring-ink/10")}>
                  {i <= at ? "✓" : i + 1}
                </motion.span>
                <span className={cn("mt-2 text-xs font-bold sm:text-sm", i <= at ? "text-ink" : "text-ink/45")} aria-current={i === at ? "step" : undefined}>{st.label}</span>
              </li>
            ))}
          </ol>
        ) : null}

        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-extrabold">Items</h2>
            <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold", tone)}>{label}</span>
          </div>
          <ul className="mt-3 divide-y divide-ink/10">
            {order.items.map((x, i) => (
              <li key={i} className="flex gap-3 py-3">
                <span className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#EEEDE8]">
                  {x.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sized(x.image, 120, 150)} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-bold">{x.name}</span>
                  <span className="text-ink/55">{x.colour} · {sizeName(x.size)} · × {x.qty}</span>
                </span>
                <span className="text-sm font-bold tabular-nums">{formatMoney(x.line, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 grid gap-1 border-t border-ink/10 pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">{order.fulfilment.method === "delivery" ? "Delivery" : "Collection"}</dt><dd className="tabular-nums">{order.deliveryFee ? formatMoney(order.deliveryFee, order.currency) : "Free"}</dd></div>
            <div className="flex justify-between text-lg font-extrabold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.total, order.currency)}</dd></div>
          </dl>
          {payable ? (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-900">Your items are held for 45 minutes after ordering. Pay now to confirm them.</p>
              <button type="button" onClick={payNow} className="btn btn-primary mt-3">Pay now with {PROVIDER_NAME[order.payProvider as "paystack" | "flutterwave"]}</button>
              {err ? <p role="alert" className="mt-2 text-sm font-bold text-red-700">{err}</p> : null}
            </div>
          ) : null}
        </section>
      </div>

      <aside className="grid content-start gap-4">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold">{order.fulfilment.method === "delivery" ? <Truck className="h-4 w-4" aria-hidden /> : <MapPin className="h-4 w-4" aria-hidden />} {order.fulfilment.method === "delivery" ? "Delivery" : "Collection"}</h2>
          <p className="mt-2 text-sm text-ink/70">{order.fulfilment.method === "delivery" ? `${order.fulfilment.address} (${order.fulfilment.area})` : order.fulfilment.point}</p>
          {order.fulfilment.notes ? <p className="mt-2 text-sm text-ink/55">Note: {order.fulfilment.notes}</p> : null}
        </div>
        <div className="card p-5 text-sm">
          <h2 className="flex items-center gap-2 font-bold"><Package className="h-4 w-4" aria-hidden /> Details</h2>
          <dl className="mt-2 grid gap-1 text-ink/70">
            <div className="flex justify-between gap-3"><dt>Placed</dt><dd>{new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
            <div className="flex justify-between gap-3"><dt>Payment</dt><dd>{order.payProvider === "later" ? "On collection / delivery" : PROVIDER_NAME[order.payProvider as "paystack" | "flutterwave"] ?? order.payProvider}</dd></div>
            {order.payRef ? <div className="flex justify-between gap-3"><dt>Reference</dt><dd className="truncate">{order.payRef}</dd></div> : null}
            <div className="flex justify-between gap-3"><dt>Name</dt><dd>{order.customer.name}</dd></div>
            <div className="flex justify-between gap-3"><dt>Phone</dt><dd>{order.customer.phone}</dd></div>
          </dl>
        </div>
        <button type="button" onClick={() => window.print()} className="btn btn-ghost no-print"><Printer className="h-4 w-4" aria-hidden /> Print receipt</button>
        <Link href="/collection/#shop" className="btn btn-dark no-print">Keep shopping</Link>
      </aside>

      <AnimatePresence>
        {demo ? <DemoPay target={demo} contact={contact} onClose={() => setDemo(null)} onDone={(o) => { setDemo(null); onUpdate(o); }} /> : null}
      </AnimatePresence>
    </div>
  );
}

function Lookup({ initialRef, onFound }: { initialRef: string; onFound: (o: Order, contact: string) => void }) {
  const [ref, setRef] = useState(initialRef);
  const [contact, setContact] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card mx-auto max-w-md p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        try {
          const o = await getOrder(ref.trim(), contact.trim());
          rememberOrder(o.ref, contact.trim());
          onFound(o, contact.trim());
        } catch (x) {
          setErr((x as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="font-display text-3xl font-extrabold">Track your order</h1>
      <p className="mt-1 text-sm text-ink/60">Enter your order number and the phone number or email you used.</p>
      <label className="mt-5 block">
        <span className="mb-1 block text-sm font-bold">Order number</span>
        <input required value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="CM-XXXXXX" className="h-12 w-full rounded-xl bg-paper px-4 font-mono uppercase outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-bold">Phone or email</span>
        <input required value={contact} onChange={(e) => setContact(e.target.value)} className="h-12 w-full rounded-xl bg-paper px-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
      </label>
      {err ? <p role="alert" className="mt-3 text-sm font-bold text-red-700">{err}</p> : null}
      <button type="submit" disabled={busy} className="btn btn-primary mt-5 w-full"><Search className="h-4 w-4" aria-hidden /> {busy ? "Looking…" : "Find my order"}</button>
    </form>
  );
}

function Inner() {
  const sp = useSearchParams();
  const ref = (sp.get("ref") ?? "").toUpperCase();
  const [order, setOrder] = useState<Order | null>(null);
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"loading" | "lookup" | "ready">("loading");

  const load = useCallback(async () => {
    let c = "";
    try {
      c = sessionStorage.getItem(`cm-order-${ref}`) ?? "";
      if (!c) {
        const last = JSON.parse(localStorage.getItem("cm-last-order") ?? "null");
        if (last?.ref === ref) c = last.contact;
      }
    } catch {}
    if (!ref || !c) return setState("lookup");
    try {
      setOrder(await getOrder(ref, c));
      setContact(c);
      setState("ready");
    } catch {
      setState("lookup");
    }
  }, [ref]);
  useEffect(() => {
    load();
  }, [load]);

  if (state === "loading") return <Loading label="Loading your order…" />;
  if (state === "lookup" || !order) return <Lookup initialRef={ref} onFound={(o, c) => { setOrder(o); setContact(c); setState("ready"); }} />;
  return <OrderView order={order} contact={contact} onUpdate={setOrder} />;
}

export function OrderPage() {
  return (
    <div className="bg-paper/60 pb-20 pt-8">
      <Container>
        <Suspense fallback={<Loading label="Loading your order…" />}>
          <Inner />
        </Suspense>
      </Container>
    </div>
  );
}
