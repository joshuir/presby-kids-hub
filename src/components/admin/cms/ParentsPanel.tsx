"use client";

import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { rpc } from "@/lib/cms/client";
import { cn } from "@/lib/cn";

type AdminChild = { id: string; name: string; birthDate: string | null; classId: string | null; status: "pending" | "confirmed" | "declined"; notes: string; createdAt: string; xp: number | null };
type AdminParent = { id: string; email: string; name: string; phone: string; whatsapp: string; createdAt: string; children: AdminChild[] };

const TONE = { pending: "bg-amber-100 text-amber-900", confirmed: "bg-emerald-100 text-emerald-900", declined: "bg-red-100 text-red-800" };

export function ParentsPanel({ notify, classes }: { notify: (m: string, t?: "ok" | "err") => void; classes: { id: string; name: string }[] }) {
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });
  const [items, setItems] = useState<AdminParent[] | null>(null);
  const [q, setQ] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await rpc<AdminParent[]>("kh_admin_parents"));
    } catch (e) {
      notifyRef.current((e as Error).message, "err");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const update = async (c: AdminChild, st: string, cls: string | null) => {
    try {
      await rpc("kh_admin_child_update", { cid: c.id, st, cls });
      notify(st === "confirmed" ? `${c.name} confirmed` : "Updated");
      load();
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return (items ?? [])
      .filter((p) => !t || JSON.stringify(p).toLowerCase().includes(t))
      .filter((p) => !onlyPending || p.children.some((c) => c.status === "pending"));
  }, [items, q, onlyPending]);

  const pending = (items ?? []).reduce((n, p) => n + p.children.filter((c) => c.status === "pending").length, 0);

  const exportCsv = () => {
    const rows = [["Parent", "Email", "Phone", "WhatsApp", "Child", "Date of birth", "Class", "Status", "Notes"]];
    (items ?? []).forEach((p) =>
      (p.children.length ? p.children : [null]).forEach((c) =>
        rows.push([p.name, p.email, p.phone, p.whatsapp, c?.name ?? "", c?.birthDate ?? "", classes.find((k) => k.id === c?.classId)?.name ?? c?.classId ?? "", c?.status ?? "", c?.notes ?? ""]),
      ),
    );
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `parents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parents or children…" className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-black/10" />
        <button type="button" onClick={() => setOnlyPending(!onlyPending)} className={cn("rounded-xl px-3 py-2 text-sm font-bold ring-1 ring-black/10", onlyPending ? "bg-amber-100 text-amber-900" : "bg-white")}>
          Awaiting confirmation ({pending})
        </button>
        <button type="button" onClick={exportCsv} className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-black/10">Export CSV</button>
      </div>
      {items === null ? <p className="text-sm text-black/50">Loading…</p> : null}
      {items && !list.length ? <p className="rounded-3xl bg-white p-8 text-center text-sm text-black/50">No parent accounts yet. Parents sign up at /account/.</p> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-bold text-navy-900">{p.name || "(no name yet)"}</div>
                <div className="text-sm text-black/55">{p.email}</div>
                <div className="text-xs text-black/45">{[p.phone, p.whatsapp && `WhatsApp ${p.whatsapp}`].filter(Boolean).join(" · ")}</div>
              </div>
              <div className="flex gap-1">
                <a href={`mailto:${p.email}`} className="rounded-lg bg-sky-soft px-2 py-1 text-xs font-bold text-navy-900">Email</a>
                {p.whatsapp ? <a target="_blank" rel="noreferrer" href={`https://wa.me/${p.whatsapp.replace(/[^\d]/g, "")}`} className="rounded-lg bg-[#25D366]/15 px-2 py-1 text-xs font-bold text-[#128C7E]">WhatsApp</a> : null}
              </div>
            </div>
            <ul className="mt-3 grid gap-2">
              {p.children.map((c) => (
                <li key={c.id} className="rounded-2xl bg-sky-soft/60 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{c.name} <span className="font-normal text-black/50">{c.birthDate ? `· born ${c.birthDate}` : ""}{c.xp != null ? ` · ${c.xp} XP` : ""}</span></div>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", TONE[c.status])}>{c.status}</span>
                  </div>
                  {c.notes ? <div className="mt-1 text-xs text-black/60">📝 {c.notes}</div> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select aria-label={`Class for ${c.name}`} value={c.classId ?? ""} onChange={(e) => update(c, c.status, e.target.value || null)} className="rounded-lg bg-white px-2 py-1 text-xs ring-1 ring-black/10">
                      <option value="">No class</option>
                      {classes.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                    </select>
                    {c.status !== "confirmed" ? <button type="button" onClick={() => update(c, "confirmed", c.classId)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">Confirm</button> : null}
                    {c.status !== "declined" ? <button type="button" onClick={() => update(c, "declined", c.classId)} className="rounded-lg px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">Needs follow-up</button> : null}
                  </div>
                </li>
              ))}
              {!p.children.length ? <li className="text-xs text-black/45">No children added yet.</li> : null}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
