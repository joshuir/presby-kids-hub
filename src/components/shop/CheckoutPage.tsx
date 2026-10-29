"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, Lock, MapPin, ShieldCheck, ShoppingBag, Store, Truck, Wallet } from "lucide-react";
import { Container } from "@/components/site/Container";
import { cart, formatMoney, useCart } from "@/lib/cart";
import { createOrder, type CreatedOrder } from "@/lib/cms/client";
import { useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";
import { shopConfig } from "./shop";
import { sizeName } from "./ShopGrid";
import { DemoPay, PROVIDER_NAME, isDemo, payOnline, type PayTarget } from "./pay";

type Provider = "paystack" | "flutterwave" | "later";
const input = "h-12 w-full rounded-xl bg-white px-4 outline-none ring-1 ring-ink/15 focus:ring-2 focus:ring-blueBrand-500";

/** Remembers how to look the order up again (reference + contact) for the confirmation page. */
export function rememberOrder(ref: string, contact: string) {
  try {
    sessionStorage.setItem(`cm-order-${ref}`, contact);
    localStorage.setItem("cm-last-order", JSON.stringify({ ref, contact }));
  } catch {}
}

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-center gap-3 font-display text-xl font-extrabold sm:text-2xl">
        <span className={cn("grid h-8 w-8 place-items-center rounded-full text-sm text-white", done ? "bg-emerald-600" : "bg-ink")}>{done ? <Check className="h-4 w-4" aria-hidden /> : n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CheckoutPage() {
  const router = useRouter();
  const s = useSettings();
  const cfg = shopConfig(s);
  const { items, count, subtotal, currency } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [c, setC] = useState({ name: "", phone: "", email: "" });
  const [method, setMethod] = useState<"delivery" | "collection">("collection");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [point, setPoint] = useState("");
  const [notes, setNotes] = useState("");
  const [provider, setProvider] = useState<Provider | "">("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tried, setTried] = useState(false);
  const [demo, setDemo] = useState<PayTarget | null>(null);
  const [pending, setPending] = useState<CreatedOrder | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!point && cfg.points[0]) setPoint(cfg.points[0]);
    if (!provider && cfg.providers[0]) setProvider(cfg.providers[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.points.join(), cfg.providers.join()]);

  const fee = useMemo(() => {
    if (method !== "delivery") return 0;
    const a = cfg.areas.find((x) => x.name === area);
    if (!a) return 0;
    return cfg.freeOver > 0 && subtotal >= cfg.freeOver ? 0 : a.fee;
  }, [method, area, cfg.areas, cfg.freeOver, subtotal]);
  const total = subtotal + fee;
  const online = provider === "paystack" || provider === "flutterwave";

  const problems = {
    name: c.name.trim().length < 2 ? "Enter your full name" : "",
    phone: c.phone.replace(/\D/g, "").length < 9 ? "Enter a phone number we can reach you on" : "",
    email: online && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(c.email.trim()) ? "An email is needed for the payment receipt" : c.email && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(c.email.trim()) ? "Check your email address" : "",
    area: method === "delivery" && !area ? "Choose your area" : "",
    address: method === "delivery" && address.trim().length < 6 ? "Enter a delivery address" : "",
    point: method === "collection" && !point ? "Choose a collection point" : "",
    provider: !provider ? "Choose how to pay" : "",
  };
  const firstProblem = Object.values(problems).find(Boolean);

  const finish = (ref: string) => {
    cart.clear();
    router.push(`/collection/order/?ref=${ref}`);
  };

  const pay = async (o: CreatedOrder) => {
    const target: PayTarget = { ref: o.ref, total: o.total, currency: o.currency, email: c.email.trim(), name: c.name.trim(), phone: c.phone.trim(), provider: o.provider as "paystack" | "flutterwave" };
    if (isDemo(cfg, target.provider)) return setDemo(target);
    try {
      const paid = await payOnline(target, cfg);
      if (paid) finish(o.ref);
      else setErr("Payment window closed — your order is saved for 45 minutes. Tap “Pay now” to try again.");
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    setErr("");
    if (firstProblem) return;
    setBusy(true);
    try {
      const o = await createOrder({
        customer: { name: c.name.trim(), phone: c.phone.trim(), email: c.email.trim() },
        items: items.map((x) => ({ productId: x.productId, colour: x.colour, size: x.size, qty: x.qty })),
        fulfilment: method === "delivery" ? { method, area, address: address.trim(), notes } : { method, point, notes },
        provider: provider as Provider,
      });
      rememberOrder(o.ref, c.phone.trim());
      if (o.provider === "later") return finish(o.ref);
      setPending(o);
      await pay(o);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (hydrated && !count && !pending) {
    return (
      <Container className="py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-ink/40" aria-hidden />
        <h1 className="mt-4 font-display text-4xl font-extrabold">Your bag is empty</h1>
        <p className="mt-2 text-ink/60">Pick something from the collection first.</p>
        <Link href="/collection/#shop" className="btn btn-primary mt-6">Browse the collection</Link>
      </Container>
    );
  }

  const Summary = (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-xl font-extrabold">Order summary</h2>
      <ul className="mt-4 divide-y divide-ink/10">
        {items.map((x) => (
          <li key={x.productId + x.colour + x.size} className="flex gap-3 py-3">
            <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#EEEDE8]">
              {x.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sized(x.image, 120, 150)} alt="" className="h-full w-full object-cover" />
              ) : null}
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">{x.qty}</span>
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-bold leading-tight">{x.name}</span>
              <span className="text-ink/55">{x.colour} · {sizeName(x.size)}</span>
            </span>
            <span className="text-sm font-bold tabular-nums">{formatMoney(x.price * x.qty, x.currency)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 grid gap-1.5 border-t border-ink/10 pt-3 text-sm">
        <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="tabular-nums">{formatMoney(subtotal, currency)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink/60">{method === "delivery" ? "Delivery" : "Collection"}</dt><dd className="tabular-nums">{method === "delivery" ? (area ? (fee ? formatMoney(fee, currency) : "Free") : "Choose area") : "Free"}</dd></div>
        <div className="mt-1 flex justify-between border-t border-ink/10 pt-2 text-lg font-extrabold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(total, currency)}</dd></div>
      </dl>
      <p className="mt-3 flex items-center gap-2 text-xs text-ink/55"><ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden /> Prices and stock are checked again when you place the order.</p>
    </div>
  );

  return (
    <div className="bg-paper/60 pb-20">
      <Container className="pt-8">
        <Link href="/collection/#shop" className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-blueBrand-600"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to the shop</Link>
        <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Checkout</h1>
        {cfg.mode === "test" ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-sun-soft px-3.5 py-1.5 text-sm font-bold text-[#7A5200]">Test mode — no real money is taken</p>
        ) : null}

        {/* mobile summary toggle */}
        <button type="button" onClick={() => setShowSummary((v) => !v)} aria-expanded={showSummary} className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold ring-1 ring-ink/10 lg:hidden">
          <span className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" aria-hidden /> {showSummary ? "Hide" : "Show"} order summary ({count})</span>
          <span className="inline-flex items-center gap-1 tabular-nums">{formatMoney(total, currency)} <ChevronDown className={cn("h-4 w-4 transition", showSummary && "rotate-180")} aria-hidden /></span>
        </button>
        <AnimatePresence initial={false}>
          {showSummary ? (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden lg:hidden">
              <div className="mt-3">{Summary}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={submit} noValidate className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid min-w-0 gap-5">
            <Step n={1} title="Your details" done={!problems.name && !problems.phone && !problems.email && tried}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-bold">Full name</span>
                  <input className={input} autoComplete="name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} aria-invalid={tried && !!problems.name} />
                  {tried && problems.name ? <span className="mt-1 block text-sm font-bold text-red-700">{problems.name}</span> : null}
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Phone / WhatsApp</span>
                  <input className={input} type="tel" autoComplete="tel" inputMode="tel" placeholder="024 000 0000" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} aria-invalid={tried && !!problems.phone} />
                  {tried && problems.phone ? <span className="mt-1 block text-sm font-bold text-red-700">{problems.phone}</span> : null}
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Email {online ? "" : <span className="font-normal text-ink/50">(optional)</span>}</span>
                  <input className={input} type="email" autoComplete="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} aria-invalid={tried && !!problems.email} />
                  {tried && problems.email ? <span className="mt-1 block text-sm font-bold text-red-700">{problems.email}</span> : null}
                </label>
              </div>
            </Step>

            <Step n={2} title="Delivery or collection">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery or collection">
                {(cfg.delivery ? (["collection", "delivery"] as const) : (["collection"] as const)).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={cn("flex items-start gap-3 rounded-2xl p-4 text-left ring-1 transition", method === m ? "bg-blueBrand-50 ring-2 ring-blueBrand-600" : "bg-white ring-ink/15 hover:ring-ink/40")}>
                    {m === "collection" ? <Store className="mt-0.5 h-5 w-5 text-blueBrand-600" aria-hidden /> : <Truck className="mt-0.5 h-5 w-5 text-blueBrand-600" aria-hidden />}
                    <span>
                      <span className="block font-bold">{m === "collection" ? "Collect at church" : "Home delivery"}</span>
                      <span className="text-sm text-ink/60">{m === "collection" ? "Free · we'll message you when it's ready" : cfg.freeOver ? `From ${formatMoney(cfg.areas.length ? Math.min(...cfg.areas.map((a) => a.fee)) : 0, currency)} · free over ${formatMoney(cfg.freeOver, currency)}` : "Fee depends on your area"}</span>
                    </span>
                  </button>
                ))}
              </div>
              {method === "collection" ? (
                <fieldset className="mt-4 grid gap-2">
                  <legend className="mb-1 text-sm font-bold">Where will you collect?</legend>
                  {cfg.points.map((p) => (
                    <label key={p} className={cn("flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1", point === p ? "ring-2 ring-ink" : "ring-ink/15")}>
                      <input type="radio" name="point" checked={point === p} onChange={() => setPoint(p)} className="h-4 w-4 accent-[#0B1530]" />
                      <MapPin className="h-4 w-4 text-ink/50" aria-hidden /> <span className="text-sm font-semibold">{p}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-sm font-bold">Area</span>
                    <select className={input} value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={tried && !!problems.area}>
                      <option value="">Choose…</option>
                      {cfg.areas.map((a) => (
                        <option key={a.name} value={a.name}>{a.name} — {cfg.freeOver && subtotal >= cfg.freeOver ? "free" : formatMoney(a.fee, currency)}</option>
                      ))}
                    </select>
                    {tried && problems.area ? <span className="mt-1 block text-sm font-bold text-red-700">{problems.area}</span> : null}
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-bold">Delivery address / landmark</span>
                    <textarea rows={2} className={cn(input, "h-auto py-3")} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} aria-invalid={tried && !!problems.address} placeholder="House number, street, area, nearby landmark or GhanaPost GPS" />
                    {tried && problems.address ? <span className="mt-1 block text-sm font-bold text-red-700">{problems.address}</span> : null}
                  </label>
                </div>
              )}
              <label className="mt-4 block">
                <span className="mb-1 block text-sm font-bold">Notes for the ministry <span className="font-normal text-ink/50">(optional)</span></span>
                <input className={input} maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. it's a birthday present — please wrap it" />
              </label>
            </Step>

            <Step n={3} title="Payment">
              <div className="grid gap-3" role="radiogroup" aria-label="Payment method">
                {cfg.providers.map((p) => (
                  <button key={p} type="button" role="radio" aria-checked={provider === p} onClick={() => setProvider(p)} className={cn("flex items-center gap-3 rounded-2xl p-4 text-left ring-1 transition", provider === p ? "bg-blueBrand-50 ring-2 ring-blueBrand-600" : "bg-white ring-ink/15 hover:ring-ink/40")}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: p === "paystack" ? "#0BA4DB" : p === "flutterwave" ? "#F5A623" : "#0B1530" }}>
                      {p === "later" ? <Wallet className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{p === "later" ? (method === "delivery" ? "Pay on delivery" : "Pay when you collect") : `${PROVIDER_NAME[p]} — card or Mobile Money`}</span>
                      <span className="text-sm text-ink/60">{p === "later" ? "Cash or MoMo to the ministry team" : "MTN, Telecel & AirtelTigo MoMo, Visa and Mastercard"}{p !== "later" && isDemo(cfg, p) ? " · test" : ""}</span>
                    </span>
                  </button>
                ))}
                {!cfg.providers.length ? <p className="text-sm text-ink/60">Online ordering is paused — please contact the ministry.</p> : null}
              </div>
              {tried && problems.provider ? <p className="mt-2 text-sm font-bold text-red-700">{problems.provider}</p> : null}
            </Step>

            {err ? <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-800">{err}</p> : null}
            {tried && firstProblem ? <p role="alert" className="text-sm font-bold text-red-700">Please fix the highlighted details.</p> : null}

            {pending && online ? (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => { setErr(""); pay(pending); }} className="btn btn-primary">Pay now — {formatMoney(pending.total, pending.currency)}</button>
                <Link href={`/collection/order/?ref=${pending.ref}`} className="btn btn-ghost">View order {pending.ref}</Link>
              </div>
            ) : (
              <button type="submit" disabled={busy || !cfg.providers.length} className="flex h-14 items-center justify-center gap-2 rounded-full bg-blueBrand-600 text-base font-extrabold text-white shadow-[0_4px_0_#173EA8] transition hover:bg-blueBrand-700 disabled:opacity-50">
                <Lock className="h-5 w-5" aria-hidden />
                {busy ? "Placing your order…" : provider === "later" ? `Place order — ${formatMoney(total, currency)}` : `Place order & pay ${formatMoney(total, currency)}`}
              </button>
            )}
            <p className="text-xs text-ink/50">By placing your order you agree to the <Link href="/terms/" className="underline">terms</Link>. Card and Mobile Money details are entered in the {provider === "flutterwave" ? "Flutterwave" : "Paystack"} window — they never touch this website.</p>
          </div>

          <aside className="hidden lg:sticky lg:top-28 lg:block">{Summary}</aside>
        </form>
      </Container>

      <AnimatePresence>
        {demo ? (
          <DemoPay
            target={demo}
            contact={c.phone.trim()}
            onClose={() => { setDemo(null); setErr("Payment window closed — your order is saved for 45 minutes. Tap “Pay now” to try again."); }}
            onDone={() => { setDemo(null); finish(demo.ref); }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
