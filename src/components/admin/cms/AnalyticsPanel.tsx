"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { rpc } from "@/lib/cms/client";
import { cn } from "@/lib/cn";

type Analytics = {
  daily: { day: string; views: number; visitors: number; games: number; registrations: number }[];
  pages: { path: string; views: number }[];
  refs: { ref: string; views: number }[];
  classes: { class_id: string; children: number }[];
  totals: { views: number; visitors: number; parents: number; children: number; pending: number; players: number; games: number; messages: number };
};

const BLUE = "#2563EB";
const NAVY = "#0A1F44";
const SUN = "#F5B400";
const axis = { fontSize: 11, fill: "rgba(0,0,0,.5)" };
const short = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5", className)}>
      <h3 className="text-sm font-bold text-navy-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-black/45">No data yet.</p>;
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
          <div className="relative overflow-hidden rounded-lg bg-sky-soft px-3 py-1.5">
            <div className="absolute inset-y-0 left-0 rounded-lg bg-blueBrand-200/70" style={{ width: `${(r.value / max) * 100}%` }} />
            <span className="relative block truncate">{r.label}</span>
          </div>
          <span className="w-12 text-right font-bold tabular-nums">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsPanel({ notify, classes }: { notify: (m: string, t?: "ok" | "err") => void; classes: { id: string; name: string }[] }) {
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await rpc<Analytics>("kh_admin_analytics", { days }));
    } catch (e) {
      notifyRef.current((e as Error).message, "err");
    }
  }, [days]);
  useEffect(() => {
    load();
  }, [load]);

  const t = data?.totals;
  const daily = (data?.daily ?? []).map((d) => ({ ...d, label: short(d.day) }));
  const pageName = (p: string) => (p === "/" ? "Home" : p.replace(/^\/|\/$/g, "").replace(/\//g, " › "));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-black/55">Privacy-friendly analytics: counted only for visitors who accept analytics cookies. No IP addresses are stored.</p>
        <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-black/10">
          {[7, 30, 90, 365].map((d) => (
            <button key={d} type="button" onClick={() => setDays(d)} className={cn("rounded-full px-3 py-1 text-xs font-bold", days === d ? "bg-navy-900 text-white" : "text-black/60")}>
              {d === 365 ? "1y" : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Page views", t?.views],
          ["Visitors", t?.visitors],
          ["Game rounds", t?.games],
          ["Unread messages", t?.messages],
          ["Parent accounts", t?.parents],
          ["Children registered", t?.children],
          ["Awaiting confirmation", t?.pending],
          ["Game players", t?.players],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-black/5">
            <div className="text-xs font-semibold text-black/50">{l}</div>
            <div className="mt-1 text-3xl font-black tabular-nums text-navy-900">{v ?? "–"}</div>
          </div>
        ))}
      </div>

      <Card title="Traffic">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={BLUE} stopOpacity={0.35} /><stop offset="1" stopColor={BLUE} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" vertical={false} />
              <XAxis dataKey="label" tick={axis} minTickGap={24} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,.12)" }} />
              <Area type="monotone" dataKey="views" name="Page views" stroke={BLUE} strokeWidth={2} fill="url(#gv)" />
              <Line type="monotone" dataKey="visitors" name="Visitors" stroke={NAVY} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Engagement — game rounds & registrations">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" vertical={false} />
                <XAxis dataKey="label" tick={axis} minTickGap={24} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Line type="monotone" dataKey="games" name="Game rounds" stroke={SUN} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="registrations" name="Registrations" stroke={BLUE} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Class popularity (registered children)">
          {data?.classes.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.classes.map((c) => ({ name: classes.find((k) => k.id === c.class_id)?.name ?? c.class_id, children: c.children }))} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" vertical={false} />
                  <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="children" name="Children" fill={BLUE} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-black/45">No children registered through parent accounts yet.</p>
          )}
        </Card>
        <Card title="Top pages"><Bars rows={(data?.pages ?? []).map((p) => ({ label: pageName(p.path), value: p.views }))} /></Card>
        <Card title="Traffic sources"><Bars rows={(data?.refs ?? []).map((r) => ({ label: r.ref, value: r.views }))} /></Card>
      </div>
    </div>
  );
}
