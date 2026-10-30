"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ toast */

type Toast = { msg: string; tone: "ok" | "err" } | null;
const ToastCtx = createContext<(msg: string, tone?: "ok" | "err") => void>(() => {});
export const useNotify = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<Toast>(null);
  const notify = useCallback((msg: string, tone: "ok" | "err" = "ok") => {
    setT({ msg, tone });
    window.setTimeout(() => setT(null), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {t ? (
        <div role="status" className={cn("fixed bottom-5 left-1/2 z-[90] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl", t.tone === "ok" ? "bg-[#0F172A]" : "bg-red-600")}>
          <span className={cn("h-2 w-2 shrink-0 rounded-full", t.tone === "ok" ? "bg-emerald-400" : "bg-white")} />
          {t.msg}
        </div>
      ) : null}
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------------ layout */

export function PageHeader({ title, intro, actions, crumbs }: { title: string; intro?: ReactNode; actions?: ReactNode; crumbs?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {crumbs ? <div className="text-xs font-semibold text-slate-500">{crumbs}</div> : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">{title}</h1>
        {intro ? <p className="mt-1 max-w-2xl text-sm text-slate-500">{intro}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, intro, children, className, actions }: { title?: string; intro?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] sm:p-5", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
            {intro ? <p className="mt-0.5 text-[13px] text-slate-500">{intro}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Btn({
  children,
  tone = "default",
  size = "md",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "default" | "primary" | "danger" | "ghost" | "success"; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
        tone === "primary" && "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
        tone === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
        tone === "danger" && "text-red-700 ring-1 ring-red-200 hover:bg-red-50",
        tone === "ghost" && "text-slate-600 hover:bg-slate-100",
        tone === "default" && "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ inputs */

const inputCls = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function Label({ label, help, children, className }: { label: string; help?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      {children}
      {help ? <span className="mt-1 block text-xs text-slate-500">{help}</span> : null}
    </label>
  );
}

export function TextInput({ label, value, onChange, help, placeholder, multiline, className, testId }: { label: string; value: string; onChange: (v: string) => void; help?: ReactNode; placeholder?: string; multiline?: boolean; className?: string; testId?: string }) {
  return (
    <Label label={label} help={help} className={className}>
      {multiline ? (
        <textarea data-testid={testId} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={3} className={cn(inputCls, "h-auto min-h-20 py-2 leading-6")} />
      ) : (
        <input data-testid={testId} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </Label>
  );
}

export function SelectInput({ label, value, onChange, options, help, className }: { label: string; value: string; onChange: (v: string) => void; options: (string | [string, string])[]; help?: ReactNode; className?: string }) {
  return (
    <Label label={label} help={help} className={className}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </Label>
  );
}

export function ColorInput({ label, value, onChange, fallback, help }: { label: string; value: string; onChange: (v: string) => void; fallback: string; help?: ReactNode }) {
  const v = /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  return (
    <Label label={label} help={help}>
      <span className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white pl-1.5 pr-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <input type="color" value={v} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={`${label} colour picker`} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
        <input value={value || ""} placeholder={fallback} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase outline-none" aria-label={`${label} hex value`} />
      </span>
    </Label>
  );
}

export function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {help ? <span className="block text-xs text-slate-500">{help}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[#2563EB] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-semibold text-slate-700">{label}</div>
      <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={cn("rounded-md px-3 py-1.5 text-sm font-semibold transition", value === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ rows editor (pipe-separated lists) */

export type RowCol = { key: string; label: string; placeholder?: string; options?: string[]; width?: string };

/** Edits a list stored as "a|b|c" strings, one row per item, with add / reorder / remove. */
export function RowsEditor({ label, help, value, onChange, cols, addLabel = "Add row", testId }: { label: string; help?: ReactNode; value: string[]; onChange: (v: string[]) => void; cols: RowCol[]; addLabel?: string; testId?: string }) {
  const rows = (value ?? []).map((r) => {
    const p = String(r).split("|");
    return cols.map((_, i) => (p[i] ?? "").trim());
  });
  const write = (next: string[][]) => onChange(next.map((r) => r.join("|")));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const n = [...rows];
    [n[i], n[j]] = [n[j], n[i]];
    write(n);
  };
  return (
    <fieldset data-testid={testId} className="min-w-0">
      <legend className="mb-1.5 text-[13px] font-semibold text-slate-700">{label}</legend>
      {help ? <p className="-mt-1 mb-2 text-xs text-slate-500">{help}</p> : null}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="hidden gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:flex">
          <span className="w-4" />
          {cols.map((c) => <span key={c.key} className={c.width ?? "flex-1"}>{c.label}</span>)}
          <span className="w-[88px]" />
        </div>
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2 sm:flex-nowrap">
              <GripVertical className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" aria-hidden />
              {cols.map((c, k) =>
                c.options ? (
                  <select key={c.key} aria-label={`${c.label} (row ${i + 1})`} value={r[k]} onChange={(e) => { const n = rows.map((x) => [...x]); n[i][k] = e.target.value; write(n); }} className={cn("h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm", c.width ?? "flex-1", "basis-full sm:basis-auto")}>
                    {c.options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
                  </select>
                ) : (
                  <input key={c.key} aria-label={`${c.label} (row ${i + 1})`} value={r[k]} placeholder={c.placeholder ?? c.label} onChange={(e) => { const n = rows.map((x) => [...x]); n[i][k] = e.target.value.replace(/\|/g, "/"); write(n); }} className={cn("h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-blue-500", c.width ?? "flex-1", "basis-full sm:basis-auto")} />
                ),
              )}
              <span className="ml-auto flex shrink-0 items-center">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move row ${i + 1} up`} className="grid h-8 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move row ${i + 1} down`} className="grid h-8 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => write(rows.filter((_, k) => k !== i))} aria-label={`Remove row ${i + 1}`} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </span>
            </li>
          ))}
          {!rows.length ? <li className="px-3 py-4 text-sm text-slate-400">Nothing yet.</li> : null}
        </ul>
        <button type="button" onClick={() => write([...rows, cols.map((c) => c.options?.[0] ?? "")])} className="flex w-full items-center gap-1.5 border-t border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>
    </fieldset>
  );
}

/** Sticky "unsaved changes" bar used by the settings-style editors. */
export function SaveBar({ dirty, saving, onSave, onDiscard, note }: { dirty: boolean; saving?: boolean; onSave: () => void; onDiscard: () => void; note?: string }) {
  return (
    <div className={cn("sticky bottom-3 z-30 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg transition", dirty ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white")} data-testid="save-bar">
      <span className="text-sm font-semibold text-slate-700">{dirty ? "You have unsaved changes" : note ?? "All changes saved — the live site is up to date."}</span>
      <span className="flex gap-2">
        <Btn tone="ghost" disabled={!dirty || saving} onClick={onDiscard}>Discard</Btn>
        <Btn tone="primary" disabled={!dirty || saving} onClick={onSave} data-testid="save-settings">{saving ? "Saving…" : "Save & publish"}</Btn>
      </span>
    </div>
  );
}
