"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, GripVertical, Maximize2, PanelRightClose, X } from "lucide-react";
import { LivePreview } from "./LivePreview";

const KEY = "cm-preview-layout";
const EDITOR_MIN = 440;
const PREVIEW_MIN = 340;
const WIDE = EDITOR_MIN + PREVIEW_MIN + 24;

type Pref = { open: boolean; w: number };
function readPref(): Pref {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (p && typeof p.open === "boolean" && typeof p.w === "number") return p;
  } catch {}
  return { open: true, w: 0 };
}
function writePref(p: Pref) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

/**
 * Editor on the left, live preview on the right — the preview never covers the controls.
 * Wide screens: drag the divider to resize (or use the arrow keys), collapse the preview to a slim
 * rail, or open it full screen. Smaller screens: the editor gets the whole width and the preview
 * opens full screen from the "Preview" button. The choice is remembered.
 */
export function EditorSplit({ children, path, settings, note, bar }: { children: ReactNode; path: string; settings: Record<string, unknown> | null; note?: ReactNode; bar?: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [pref, setPref] = useState<Pref>(readPref);
  const [full, setFull] = useState(false);
  const wide = cw >= WIDE;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const update = useCallback((p: Partial<Pref>) => {
    setPref((cur) => {
      const n = { ...cur, ...p };
      writePref(n);
      return n;
    });
  }, []);

  const clampW = (w: number) => Math.round(Math.max(PREVIEW_MIN, Math.min(cw - EDITOR_MIN - 24, w)));
  const pw = cw ? clampW(pref.w || cw * 0.45) : 0;

  // dragging the divider
  const drag = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    drag.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    update({ w: clampW(r.right - e.clientX - 12) });
  };
  const onUp = () => {
    drag.current = false;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 120 : 40;
    if (e.key === "ArrowLeft") update({ w: clampW(pw + step) });
    else if (e.key === "ArrowRight") update({ w: clampW(pw - step) });
    else if (e.key === "Home") update({ w: clampW(cw) });
    else if (e.key === "End") update({ w: PREVIEW_MIN });
    else return;
    e.preventDefault();
  };

  useEffect(() => {
    if (!full) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [full]);

  const btn = "grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800";
  const sideOpen = wide && pref.open && !full;

  return (
    <div ref={wrap} className="min-w-0" data-preview-mode={full ? "full" : sideOpen ? "side" : wide ? "collapsed" : "narrow"}>
      {!wide ? (
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={() => setFull(true)} data-testid="preview-open" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Preview
          </button>
        </div>
      ) : null}
      <div className="flex items-start gap-0">
        <div className="min-w-0 flex-1" data-editor-pane>{children}{bar}</div>
        {wide && pref.open && !full ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize the preview (arrow keys)"
              aria-valuenow={pw}
              aria-valuemin={PREVIEW_MIN}
              aria-valuemax={Math.max(PREVIEW_MIN, cw - EDITOR_MIN - 24)}
              tabIndex={0}
              data-testid="preview-resize"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKey}
              onDoubleClick={() => update({ w: 0 })}
              title="Drag to resize · double-click to reset"
              className="group sticky top-[76px] mx-1 flex h-[calc(100dvh-92px)] w-4 shrink-0 cursor-col-resize touch-none items-center justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="h-full w-px bg-slate-200 transition group-hover:bg-blue-400 group-focus-visible:bg-blue-500" />
              <span className="absolute grid h-9 w-4 place-items-center rounded-md border border-slate-200 bg-white text-slate-400 shadow-sm group-hover:border-blue-400 group-hover:text-blue-600"><GripVertical className="h-3.5 w-3.5" /></span>
            </div>
            <aside className="sticky top-[76px] flex h-[calc(100dvh-92px)] min-h-[360px] shrink-0 flex-col gap-2" style={{ width: pw }} aria-label="Live preview" data-testid="preview-pane">
              <LivePreview
                path={path}
                settings={settings}
                className="flex-1"
                actions={
                  <>
                    <button type="button" onClick={() => setFull(true)} aria-label="Open the preview full screen" title="Full screen" className={btn}><Maximize2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => update({ open: false })} aria-label="Hide the preview" title="Hide preview" data-testid="preview-collapse" className={btn}><PanelRightClose className="h-4 w-4" /></button>
                  </>
                }
              />
              {note ? <p className="shrink-0 text-xs text-slate-500">{note}</p> : null}
            </aside>
          </>
        ) : null}
        {wide && !pref.open && !full ? (
          <button
            type="button"
            onClick={() => update({ open: true })}
            data-testid="preview-expand"
            aria-label="Show the live preview"
            className="sticky top-[76px] ml-3 flex h-44 w-10 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
            <span className="[writing-mode:vertical-rl]">Show preview</span>
          </button>
        ) : null}
      </div>

      {full ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/60 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label="Live preview" data-testid="preview-full">
          <LivePreview
            path={path}
            settings={settings}
            className="flex-1 shadow-2xl"
            actions={
              <button type="button" onClick={() => setFull(false)} aria-label="Close the preview" title="Close (Esc)" data-testid="preview-close" className="ml-1 inline-flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2.5 text-xs font-bold text-white hover:bg-slate-700">
                <X className="h-3.5 w-3.5" /> Close
              </button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
