"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, MapPin, Phone, RefreshCw, Search, Truck } from "lucide-react";
import { adminOrders, adminUpdateOrder, type Order } from "@/lib/cms/client";
import { formatMoney } from "@/lib/cart";
import { cn } from "@/lib/cn";

const STATUS: Array<[string, string, string]> = [
  ["new", "New", "bg-sky-100 text-sky-900"],
  ["confirmed", "Confirmed", "bg-indigo-100 text-indigo-900"],
  ["ready", "Ready to collect", "bg-amber-100 text-amber-900"],
  ["out_for_delivery", "Out for delivery", "bg-amber-100 text-amber-900"],
  ["completed", "Completed", "bg-emerald-100 text-emerald-800"],
  ["cancelled", "Cancelled", "bg-black/10 text-black/60"],
];
const PAY: Array<[string, string, string]> = [
  ["pending", "Awaiting online payment", "bg-amber-100 text-amber-900"],
  ["due", "Pay on collection/delivery", "bg-sky-100 text-sky-900"],
  ["paid", "Paid", "bg-emerald-100 text-emerald-800"],
  ["failed", "Failed", "bg-red-100 text-red-800"],
  ["expired", "Expired", "bg-red-100 text-red-800"],
  ["refunded", "Refunded", "bg-black/10 text-black/60"],
];
const label = (list: typeof STATUS, k: string) => list.find((x) => x[0] === k) ?? [k, k, "bg-black/10"];
const FILTERS = ["open", "all", "new", "confirmed", "ready", "out_for_delivery", "completed", "cancelled"] as const;

/** Orders from the clothing shop: see what's paid, pack it, mark it ready / delivered, refund or cancel (cancelling puts the stock back). */
export function OrdersPanel({ notify }: { notify: (msg: string, kind?: "ok" | "err") => void }) {
  const [items, setItems] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("open");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const load = useCallback(() => {
    adminOrders()
      .then((d) => setItems(d))
      .catch((e) => {
        setItems([]);
        notifyRef.current(String(e.message ?? e), "err");
      });
  }, []);
  useEffect(() => load(), [load]);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return (items ?? []).filter((o) => {
      if (filter === "open" && (o.status === "completed" || o.status === "cancelled")) return false;
      if (filter !== "open" && filter !== "all" && o.status !== filter) return false;
      const text = `${o.ref} ${o.customer.name} ${o.customer.phone} ${o.customer.email} ${o.items.map((x) => x.name).join(" ")}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [items, filter, q]);
  const current = (items ?? []).find((o) => o.id === sel) ?? null;
  const stats = useMemo(() => {
    const l = items ?? [];
    const paid = l.filter((o) => o.payStatus === "paid");
    return {
      open: l.filter((o) => o.status !== "completed" && o.status !== "cancelled").length,
      toPack: l.filter((o) => o.status === "confirmed" || (o.status === "new" && o.payStatus === "due")).length,
      revenue: paid.reduce((s, o) => s + Number(o.total), 0),
      currency: l[0]?.currency ?? "GHS",
    };
  }, [items]);

  const update = async (status: string | null, pay: string | null) => {
    if (!current) return;
    if (status === "cancelled" && !confirm(`Cancel ${current.ref}? Its items go back into stock.${current.payStatus === "paid" ? " Remember to refund the customer." : ""}`)) return;
    setBusy(true);
    try {
      const o = await adminUpdateOrder(current.id, status, pay, note || null);
      setItems((l) => (l ?? []).map((x) => (x.id === o.id ? o : x)));
      setNote("");
      notify(`${o.ref} updated`);
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const rows = [["Ref", "Date", "Customer", "Phone", "Email", "Items", "Total", "Payment", "Status", "Fulfilment"]];
    (items ?? []).forEach((o) =>
      rows.push([o.ref, new Date(o.createdAt).toISOString(), o.customer.name, o.customer.phone, o.customer.email, o.items.map((x) => `${x.qty}× ${x.name} (${x.colour}, ${x.size})`).join("; "), String(o.total), o.payStatus, o.status, o.fulfilment.method === "delivery" ? `Delivery: ${o.fulfilment.area} — ${o.fulfilment.address}` : `Collect: ${o.fulfilment.point}`]),
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5"><div className="text-xs font-bold uppercase text-black/50">Open orders</div><div className="font-display text-3xl font-extrabold">{stats.open}</div></div>
        <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5"><div className="text-xs font-bold uppercase text-black/50">To pack</div><div className="font-display text-3xl font-extrabold">{stats.toPack}</div></div>
        <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5"><div className="text-xs font-bold uppercase text-black/50">Paid so far</div><div className="font-display text-3xl font-extrabold">{formatMoney(stats.revenue, stats.currency)}</div></div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,440px)_1fr]">
        <div className="rounded-3xl bg-white p-3 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2 p-1">
            <label className="relative flex-1">
              <span className="sr-only">Search orders</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ref, name, phone…" className="h-10 w-full rounded-xl bg-black/[0.04] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blueBrand-500" />
            </label>
            <button type="button" onClick={load} aria-label="Refresh orders" className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 hover:bg-black/5"><RefreshCw className="h-4 w-4" aria-hidden /></button>
            <button type="button" onClick={exportCsv} aria-label="Download orders as CSV" className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 hover:bg-black/5"><Download className="h-4 w-4" aria-hidden /></button>
          </div>
          <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto p-1" role="tablist" aria-label="Order status">
            {FILTERS.map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-bold", filter === f ? "bg-ink text-white" : "bg-black/[0.04] hover:bg-black/10")}>
                {f === "open" ? "Open" : f === "all" ? "All" : label(STATUS, f)[1]}
              </button>
            ))}
          </div>
          <ul className="mt-2 grid max-h-[70vh] gap-1 overflow-y-auto">
            {items === null ? <li className="p-3 text-sm text-black/50">Loading orders…</li> : null}
            {items && !shown.length ? <li className="p-3 text-sm text-black/50">No orders here yet.</li> : null}
            {shown.map((o) => {
              const [, sl, st] = label(STATUS, o.status);
              const [, pl, pt] = label(PAY, o.payStatus);
              return (
                <li key={o.id}>
                  <button type="button" onClick={() => setSel(o.id)} className={cn("w-full rounded-2xl px-3 py-2.5 text-left text-sm hover:bg-blueBrand-50", sel === o.id && "bg-blueBrand-50")}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold">{o.ref}</span>
                      <span className="font-bold tabular-nums">{formatMoney(Number(o.total), o.currency)}</span>
                    </span>
                    <span className="block text-black/60">{o.customer.name} · {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", st)}>{sl}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", pt)}>{pl}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
          {!current ? (
            <p className="text-sm text-black/50">Choose an order to see the items, customer and delivery details, and to update its status.</p>
          ) : (
            <div className="grid gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-2xl font-extrabold">{current.ref}</div>
                  <div className="text-sm text-black/55">{new Date(current.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-extrabold">{formatMoney(Number(current.total), current.currency)}</div>
                  <div className="text-sm text-black/55">{current.payProvider === "later" ? "Pay on collection / delivery" : current.payProvider}{current.payRef ? ` · ${current.payRef}` : ""}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/[0.03] p-4 text-sm">
                  <div className="font-bold">{current.customer.name}</div>
                  <a className="mt-1 flex items-center gap-1.5 text-blueBrand-700" href={`tel:${current.customer.phone}`}><Phone className="h-3.5 w-3.5" aria-hidden /> {current.customer.phone}</a>
                  {current.customer.email ? <a className="mt-1 block break-all text-blueBrand-700" href={`mailto:${current.customer.email}`}>{current.customer.email}</a> : null}
                </div>
                <div className="rounded-2xl bg-black/[0.03] p-4 text-sm">
                  <div className="flex items-center gap-1.5 font-bold">{current.fulfilment.method === "delivery" ? <><Truck className="h-4 w-4" aria-hidden /> Delivery — {current.fulfilment.area}</> : <><MapPin className="h-4 w-4" aria-hidden /> Collection</>}</div>
                  <div className="mt-1 text-black/70">{current.fulfilment.method === "delivery" ? current.fulfilment.address : current.fulfilment.point}</div>
                  {current.fulfilment.notes ? <div className="mt-1 text-black/55">“{current.fulfilment.notes}”</div> : null}
                </div>
              </div>

              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-black/10 text-xs uppercase text-black/50"><th className="py-2">Item</th><th>Colour</th><th>Size</th><th className="text-right">Qty</th><th className="text-right">Line</th></tr></thead>
                <tbody>
                  {current.items.map((x, i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="py-2 font-semibold">{x.name}</td>
                      <td><span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: x.hex }} aria-hidden />{x.colour}</span></td>
                      <td>{x.size}</td>
                      <td className="text-right">{x.qty}</td>
                      <td className="text-right tabular-nums">{formatMoney(Number(x.line), current.currency)}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={4} className="py-1 text-right text-black/55">{current.fulfilment.method === "delivery" ? "Delivery" : "Collection"}</td><td className="text-right tabular-nums">{formatMoney(Number(current.deliveryFee), current.currency)}</td></tr>
                </tbody>
              </table>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-bold uppercase text-black/55">Order status</span>
                  <select value={current.status} disabled={busy} onChange={(e) => update(e.target.value, null)} className="h-11 w-full rounded-xl bg-white px-3 ring-1 ring-black/15">
                    {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-bold uppercase text-black/55">Payment</span>
                  <select value={current.payStatus} disabled={busy} onChange={(e) => update(null, e.target.value)} className="h-11 w-full rounded-xl bg-white px-3 ring-1 ring-black/15">
                    {PAY.filter(([k]) => k !== "expired" || current.payStatus === "expired").map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {current.payStatus === "due" ? <button type="button" disabled={busy} onClick={() => update(null, "paid")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Mark paid (cash / MoMo received)</button> : null}
                {current.status !== "completed" && current.status !== "cancelled" ? (
                  <button type="button" disabled={busy} onClick={() => update(current.fulfilment.method === "delivery" ? "out_for_delivery" : "ready", null)} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-ink">{current.fulfilment.method === "delivery" ? "Out for delivery" : "Ready to collect"}</button>
                ) : null}
                {current.status !== "completed" && current.status !== "cancelled" ? <button type="button" disabled={busy} onClick={() => update("completed", null)} className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">{current.fulfilment.method === "delivery" ? "Delivered" : "Collected"}</button> : null}
                {current.status !== "cancelled" ? <button type="button" disabled={busy} onClick={() => update("cancelled", null)} className="rounded-xl px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-50">Cancel & restock</button> : null}
              </div>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-bold uppercase text-black/55">Add a note (saved with the next update)</span>
                <div className="flex gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className="h-11 flex-1 rounded-xl bg-white px-3 ring-1 ring-black/15" placeholder="e.g. Called mum, collecting Sunday" />
                  <button type="button" disabled={busy || !note.trim()} onClick={() => update(null, null)} className="rounded-xl bg-blueBrand-600 px-4 text-sm font-bold text-white disabled:opacity-40">Save note</button>
                </div>
              </label>
              {current.notes ? <p className="rounded-xl bg-black/[0.03] p-3 text-sm">{current.notes}</p> : null}
              {current.history?.length ? (
                <details className="text-sm">
                  <summary className="cursor-pointer font-bold">History ({current.history.length})</summary>
                  <ol className="mt-2 grid gap-1 text-black/65">
                    {[...current.history].reverse().map((h, i) => (
                      <li key={i}>{new Date(h.at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })} — {h.by}: {[h.status && `status → ${h.status}`, h.pay && `payment → ${h.pay}`, h.note].filter(Boolean).join(" · ")}</li>
                    ))}
                  </ol>
                </details>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
