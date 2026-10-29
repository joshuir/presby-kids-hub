"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { rpc } from "@/lib/cms/client";

type Sub = { id: number; kind: "contact" | "register" | "order" | "subscribe"; data: Record<string, string>; handled: boolean; createdAt: string };

const KIND: Record<string, string> = { contact: "Message", register: "Registration", order: "Order request", subscribe: "Newsletter sign-up" };

/** Contact messages, class registrations and clothing order requests from the public site. */
export function MessagesPanel({ notify }: { notify: (m: string, t?: "ok" | "err") => void }) {
  const [items, setItems] = useState<Sub[] | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "contact" | "subscribe">("open");

  const load = useCallback(async () => {
    try {
      setItems((await rpc<Sub[]>("kh_submissions_list")).filter((x) => x.data?.site === "cm"));
    } catch (e) {
      notify((e as Error).message, "err");
    }
  }, [notify]);
  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: number, handled: boolean, remove = false) => {
    try {
      await rpc("kh_submissions_update", { sid: id, is_handled: handled, remove });
      load();
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const list = (items ?? []).filter((s) =>
    filter === "all" ? true : filter === "open" ? !s.handled : s.kind === filter,
  );

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-2">
        {(["open", "all", "contact", "subscribe"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-black/10", filter === f && "bg-ink-950 text-white")}
          >
            {f === "open" ? "To do" : f === "subscribe" ? "Newsletter" : f === "contact" ? "Messages" : "All"}
          </button>
        ))}
        <button type="button" onClick={load} className="ml-auto text-xs underline">Refresh</button>
      </div>
      {items === null ? <p className="mt-4 text-sm text-black/50">Loading…</p> : null}
      {items && list.length === 0 ? <p className="mt-4 text-sm text-black/50">Nothing here.</p> : null}
      <ul className="mt-4 grid gap-3">
        {list.map((s) => (
          <li key={s.id} className={cn("rounded-2xl p-4 ring-1", s.handled ? "bg-black/[0.02] ring-black/5" : "ring-blueBrand-200")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-black/50">
                {KIND[s.kind] ?? s.kind} · {new Date(s.createdAt).toLocaleString()}
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => update(s.id, !s.handled)} className="rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-black/10">
                  {s.handled ? "Mark as to do" : "Mark done ✓"}
                </button>
                <button
                  type="button"
                  onClick={() => confirm("Delete this permanently?") && update(s.id, s.handled, true)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"
                >
                  Delete
                </button>
              </span>
            </div>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-[140px_1fr]">
              {Object.entries(s.data).filter(([k]) => k !== "site").map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-semibold capitalize text-black/60">{k.replace(/([A-Z])/g, " $1")}</dt>
                  <dd className="whitespace-pre-wrap break-words">
                    {k === "email" ? <a className="text-blueBrand-700 underline" href={`mailto:${v}`}>{v}</a> : v}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
