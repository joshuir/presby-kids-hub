"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Layers, Move, RotateCcw } from "lucide-react";
import { DEFAULT_HERO_LAYOUT, HERO_ELEMENTS, resolveHeroLayout, type HeroBox, type HeroLayout } from "@/lib/heroLayout";
import { PREVIEW_MSG } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Btn, PageHeader, Panel, SaveBar, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

const DESKTOP = 1280;
type Rect = { x: number; y: number; w: number; h: number };
const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Screenshot-style editor for the home hero: the real home page in a frame with a box over every
 * picture and text block. Drag a box to move it, drag its corner to resize, and use the panel for
 * exact numbers, layers and show/hide. Changes preview instantly and go live on "Save & publish".
 */
export function HeroLayoutEditor() {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const d = st.draft;
  const layout: HeroLayout = resolveHeroLayout((d?.heroLayout ?? null) as never);
  const [sel, setSel] = useState<string>("heading");
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  const [canvas, setCanvas] = useState<Rect | null>(null);
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const scale = boxW ? Math.min(1, boxW / DESKTOP) : 0.6;
  const latest = useRef(d);
  useEffect(() => {
    latest.current = d;
  }, [d]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const send = useCallback(() => {
    const w = frame.current?.contentWindow;
    if (w && latest.current) w.postMessage({ type: PREVIEW_MSG, settings: latest.current }, location.origin);
  }, []);
  useEffect(() => {
    send();
  }, [d, send]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.type === "cm-preview-ready" && e.source === frame.current?.contentWindow) send();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [send]);

  // read where each element really is inside the page (same origin), a few times a second
  useEffect(() => {
    const t = window.setInterval(() => {
      const doc = frame.current?.contentDocument;
      const c = doc?.querySelector<HTMLElement>("[data-hero-canvas]");
      if (!doc || !c) return;
      const sy = doc.defaultView?.scrollY ?? 0;
      const cr = c.getBoundingClientRect();
      const next: Record<string, Rect> = {};
      doc.querySelectorAll<HTMLElement>("[data-hero-el]").forEach((el) => {
        const r = el.getBoundingClientRect();
        next[el.dataset.heroEl!] = { x: r.left, y: r.top + sy, w: r.width, h: r.height };
      });
      const cv = { x: cr.left, y: cr.top + sy, w: cr.width, h: cr.height };
      setCanvas((p) => (p && JSON.stringify(p) === JSON.stringify(cv) ? p : cv));
      setRects((p) => (JSON.stringify(p) === JSON.stringify(next) ? p : next));
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  const setBox = useCallback(
    (id: string, p: Partial<HeroBox>) => {
      const cur = resolveHeroLayout((latest.current?.heroLayout ?? null) as never);
      const nb = { ...cur[id], ...p };
      st.set("heroLayout" as never, { ...cur, [id]: nb } as never);
    },
    [st],
  );

  // dragging: pointer moves are in editor pixels → convert to % of the hero canvas
  const drag = useRef<{ id: string; mode: "move" | "resize"; sx: number; sy: number; start: HeroBox; startW: number } | null>(null);
  const onDown = (id: string, mode: "move" | "resize") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSel(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id, mode, sx: e.clientX, sy: e.clientY, start: layout[id], startW: rects[id]?.w ?? 100 };
  };
  const onMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g || !canvas) return;
    const dx = (e.clientX - g.sx) / scale;
    const dy = (e.clientY - g.sy) / scale;
    const el = HERO_ELEMENTS.find((x) => x.id === g.id)!;
    if (g.mode === "move") {
      setBox(g.id, { x: round(g.start.x + (dx / canvas.w) * 100), y: round(g.start.y + (dy / canvas.h) * 100) });
    } else if (el.resizable === "width") {
      setBox(g.id, { w: round(Math.max(4, (g.start.w ?? 30) + (dx / canvas.w) * 100)) });
    } else {
      setBox(g.id, { s: Math.round(Math.max(0.4, Math.min(2.5, (g.start.s ?? 1) * ((g.startW + dx) / g.startW))) * 100) / 100 });
    }
  };
  const onUp = () => {
    drag.current = null;
  };

  const nudge = (e: React.KeyboardEvent, id: string) => {
    const step = e.shiftKey ? 2 : 0.5;
    const b = layout[id];
    const m: Record<string, Partial<HeroBox>> = { ArrowLeft: { x: round(b.x - step) }, ArrowRight: { x: round(b.x + step) }, ArrowUp: { y: round(b.y - step) }, ArrowDown: { y: round(b.y + step) } };
    if (m[e.key]) {
      e.preventDefault();
      setBox(id, m[e.key]);
    }
  };

  if (!d) return <p className="text-sm text-slate-500">Loading the home hero…</p>;
  const cur = layout[sel];
  const meta = HERO_ELEMENTS.find((x) => x.id === sel)!;
  // show just the hero: crop the frame to the canvas with a little breathing room
  const oy = canvas ? Math.max(0, canvas.y - 28) : 0;
  const height = canvas ? Math.ceil((canvas.h + 56) * scale) : 520;

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Home hero layout"
        intro="Drag any picture or text block on the home page to move it, pull its corner to resize, and use the panel for exact positions, layers and hiding. This layout is used on laptops and desktops; phones and tablets keep a tidy stacked version but respect hidden items."
        actions={<Btn onClick={() => st.set("heroLayout" as never, DEFAULT_HERO_LAYOUT as never)}><RotateCcw className="h-4 w-4" /> Reset to default</Btn>}
      />
      <div className="grid items-start gap-5 2xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100" data-testid="hero-editor">
          <div ref={box} className="relative overflow-hidden" style={{ height }} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <iframe
              ref={frame}
              title="Home page hero being edited"
              src="/"
              onLoad={send}
              tabIndex={-1}
              className="pointer-events-none absolute left-0 top-0 origin-top-left bg-white"
              style={{ width: DESKTOP, height: height / scale + oy, transform: `scale(${scale}) translateY(${-oy}px)` }}
            />
            {canvas ? (
              <div aria-hidden className="pointer-events-none absolute border border-dashed border-blue-400/60" style={{ left: canvas.x * scale, top: (canvas.y - oy) * scale, width: canvas.w * scale, height: canvas.h * scale }} />
            ) : null}
            {HERO_ELEMENTS.map((el) => {
              const r = rects[el.id];
              if (!r || layout[el.id].hidden) return null;
              const on = sel === el.id;
              return (
                <div
                  key={el.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${el.label} — drag to move, arrow keys to nudge`}
                  data-hero-box={el.id}
                  onPointerDown={onDown(el.id, "move")}
                  onKeyDown={(e) => nudge(e, el.id)}
                  onFocus={() => setSel(el.id)}
                  className={cn("absolute cursor-move touch-none rounded-md outline-none transition-[box-shadow,background-color]", on ? "bg-blue-500/10 ring-2 ring-blue-600" : "ring-1 ring-blue-400/0 hover:bg-blue-500/5 hover:ring-blue-400/70")}
                  style={{ left: r.x * scale, top: (r.y - oy) * scale, width: r.w * scale, height: r.h * scale, zIndex: on ? 40 : 20 }}
                >
                  {on ? (
                    <>
                      <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white">{el.label}</span>
                      <span
                        role="presentation"
                        data-hero-resize={el.id}
                        onPointerDown={onDown(el.id, "resize")}
                        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-white bg-blue-600 shadow"
                      />
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"><Move className="h-3.5 w-3.5" /> Click to select · drag to move · corner to resize · arrow keys nudge (Shift = bigger steps)</p>
        </div>

        <div className="grid gap-5">
          <Panel title="Selected" intro={meta.label}>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Left (%)" value={cur.x} step={0.5} onChange={(v) => setBox(sel, { x: v })} />
              <NumField label="Top (%)" value={cur.y} step={0.5} onChange={(v) => setBox(sel, { y: v })} />
              {meta.resizable === "width" ? (
                <NumField label="Width (%)" value={cur.w ?? 30} step={1} onChange={(v) => setBox(sel, { w: v })} />
              ) : (
                <NumField label="Size (×)" value={cur.s ?? 1} step={0.05} onChange={(v) => setBox(sel, { s: v })} />
              )}
              <NumField label="Layer" value={cur.z ?? 2} step={1} onChange={(v) => setBox(sel, { z: Math.round(v) })} />
            </div>
            {meta.resizable === "width" && meta.kind === "text" ? (
              <div className="mt-3"><NumField label="Text size (×)" value={cur.s ?? 1} step={0.05} onChange={(v) => setBox(sel, { s: v })} /></div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn size="sm" onClick={() => setBox(sel, { z: Math.min(9, (cur.z ?? 2) + 1) })}><Layers className="h-4 w-4" /> Bring forward</Btn>
              <Btn size="sm" onClick={() => setBox(sel, { z: Math.max(0, (cur.z ?? 2) - 1) })}>Send back</Btn>
              <Btn size="sm" onClick={() => setBox(sel, { ...DEFAULT_HERO_LAYOUT[sel] })}><RotateCcw className="h-4 w-4" /> Reset this</Btn>
            </div>
          </Panel>
          <Panel title="All elements" intro="Click to select; the eye shows or hides it.">
            <ul className="grid gap-1" data-testid="hero-elements">
              {HERO_ELEMENTS.map((el) => {
                const hidden = layout[el.id].hidden;
                return (
                  <li key={el.id} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", sel === el.id ? "bg-blue-50" : "hover:bg-slate-50")}>
                    <button type="button" onClick={() => setSel(el.id)} className={cn("min-w-0 flex-1 truncate text-left text-sm font-semibold", hidden ? "text-slate-400 line-through" : "text-slate-700")}>{el.label}</button>
                    <button type="button" aria-label={hidden ? `Show ${el.label}` : `Hide ${el.label}`} aria-pressed={!hidden} data-hero-toggle={el.id} onClick={() => setBox(el.id, { hidden: !hidden })} className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-200">
                      {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
      <SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />
    </div>
  );
}

function NumField({ label, value, step, onChange }: { label: string; value: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-sm tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      />
    </label>
  );
}
