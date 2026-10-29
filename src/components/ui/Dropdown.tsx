"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type DropdownOption = {
  value: string;
  label: string;
  /** optional heading this option is grouped under */
  group?: string;
  count?: number;
  /** emoji / icon shown before the label */
  icon?: ReactNode;
  /** colour dot shown before the label */
  color?: string;
  hint?: string;
  disabled?: boolean;
};

/**
 * Accessible single-select dropdown (button + listbox) used in place of long
 * rows of chips. Supports grouped options, counts, keyboard navigation
 * (arrows, Home/End, type-ahead, Enter, Esc) and closes on outside click.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  className,
  buttonClassName,
  align = "left",
  hideLabel = false,
  placeholder = "Choose…",
  testId,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
  hideLabel?: boolean;
  placeholder?: string;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const id = useId();
  const current = options.find((o) => o.value === value);
  const enabled = useMemo(() => options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0), [options]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => {
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : (enabled[0] ?? 0));
    setOpen(true);
  };
  const pick = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
    btn.current?.focus();
  };
  const move = (d: number) => {
    const pos = enabled.indexOf(active);
    const next = enabled[Math.min(enabled.length - 1, Math.max(0, pos + d))];
    if (next !== undefined) setActive(next);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActive(enabled[0] ?? 0); }
    else if (e.key === "End") { e.preventDefault(); setActive(enabled[enabled.length - 1] ?? 0); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(active); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); btn.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      const now = e.timeStamp;
      typed.current = { s: (now - typed.current.t < 700 ? typed.current.s : "") + e.key.toLowerCase(), t: now };
      const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.s));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={root} className={cn("relative", className)} data-testid={testId}>
      {hideLabel ? null : <span id={`${id}-l`} className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-ink/50">{label}</span>}
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={hideLabel ? `${label}: ${current?.label ?? placeholder}` : undefined}
        aria-labelledby={hideLabel ? undefined : `${id}-l ${id}-v`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(); }
        }}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-left text-base font-bold ring-1 ring-ink/10 transition hover:ring-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueBrand-500",
          open && "ring-2 ring-blueBrand-500",
          buttonClassName,
        )}
      >
        {current?.color ? <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: current.color }} aria-hidden /> : null}
        {current?.icon ? <span className="shrink-0" aria-hidden>{current.icon}</span> : null}
        <span id={`${id}-v`} className="min-w-0 flex-1 truncate">{current?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink/50 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={list}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-o${active}`}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-2 max-h-80 min-w-full overflow-auto overscroll-contain rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-ink/10 focus:outline-none sm:min-w-[16rem]",
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            )}
          >
            {options.map((o, i) => {
              const head = o.group && o.group !== options[i - 1]?.group ? o.group : null;
              const sel = o.value === value;
              return (
                <li key={o.value} role="presentation">
                  {head ? <div className="px-3 pb-1 pt-2.5 text-[11px] font-extrabold uppercase tracking-wider text-ink/45" role="presentation">{head}</div> : null}
                  <div
                    id={`${id}-o${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={sel}
                    aria-disabled={o.disabled || undefined}
                    onPointerEnter={() => !o.disabled && setActive(i)}
                    onClick={() => pick(i)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-bold",
                      i === active && !o.disabled && "bg-blueBrand-50",
                      sel && "text-blueBrand-700",
                      o.disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {o.color ? <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: o.color }} aria-hidden /> : null}
                    {o.icon ? <span className="w-5 shrink-0 text-center" aria-hidden>{o.icon}</span> : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{o.label}</span>
                      {o.hint ? <span className="block truncate text-xs font-semibold text-ink/50">{o.hint}</span> : null}
                    </span>
                    {o.count !== undefined ? <span className="text-xs font-extrabold text-ink/45">{o.count}</span> : null}
                    <Check className={cn("h-4 w-4 shrink-0", sel ? "opacity-100" : "opacity-0")} aria-hidden />
                  </div>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
