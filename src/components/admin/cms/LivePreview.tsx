"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink, Monitor, RotateCw, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { PREVIEW_MSG } from "@/lib/site";

/**
 * The real website in a frame, showing the editor's unsaved settings live
 * (sent to the page with postMessage; nothing is saved until "Save & publish").
 * Fills its parent's height unless `height` is given; the page is drawn at a real desktop
 * width and scaled down to fit, so it never spills over the editing controls.
 */
export function LivePreview({ path, settings, className, height, actions }: { path: string; settings: Record<string, unknown> | null; className?: string; height?: number; actions?: ReactNode }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);
  const latest = useRef(settings);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // a real desktop width (wider when there is room, e.g. full screen), scaled down to fit
  const DESKTOP = Math.max(1280, size.w);
  const scale = device === "desktop" && size.w ? Math.min(1, size.w / DESKTOP) : 1;
  const boxH = height ?? size.h;

  useEffect(() => {
    latest.current = settings;
  }, [settings]);

  const send = () => {
    const w = frame.current?.contentWindow;
    if (w && latest.current) w.postMessage({ type: PREVIEW_MSG, settings: latest.current }, location.origin);
  };

  useEffect(() => {
    send();
  }, [settings]);

  // the page announces when it's ready to receive (after hydration)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.type === "cm-preview-ready" && e.source === frame.current?.contentWindow) send();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const iconBtn = "grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800";
  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100", !height && "h-full", className)} data-testid="live-preview">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <span className="ml-0.5 min-w-0 flex-1 truncate rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{path}</span>
        <div className="flex rounded-md bg-slate-100 p-0.5" role="radiogroup" aria-label="Preview size">
          <button type="button" role="radio" aria-checked={device === "desktop"} aria-label="Desktop preview" onClick={() => setDevice("desktop")} className={cn("grid h-7 w-7 place-items-center rounded", device === "desktop" ? "bg-white shadow-sm" : "text-slate-500")}><Monitor className="h-4 w-4" /></button>
          <button type="button" role="radio" aria-checked={device === "mobile"} aria-label="Phone preview" onClick={() => setDevice("mobile")} className={cn("grid h-7 w-7 place-items-center rounded", device === "mobile" ? "bg-white shadow-sm" : "text-slate-500")}><Smartphone className="h-4 w-4" /></button>
        </div>
        <button type="button" aria-label="Reload preview" title="Reload" onClick={() => setNonce((n) => n + 1)} className={iconBtn}><RotateCw className="h-4 w-4" /></button>
        <a href={path} target="_blank" rel="noreferrer" aria-label="Open the live page in a new tab" title="Open in a new tab" className={iconBtn}><ExternalLink className="h-4 w-4" /></a>
        {actions}
      </div>
      <div ref={box} className={cn("relative flex justify-center overflow-hidden", height ? "shrink-0" : "min-h-0 flex-1")} style={height ? { height } : undefined}>
        {size.w > 0 && boxH > 0 ? (
          <iframe
            key={`${path}-${nonce}`}
            ref={frame}
            title="Live preview of the website"
            src={path}
            onLoad={send}
            className={cn("shrink-0 bg-white", device === "mobile" ? "my-3 rounded-2xl shadow-xl ring-1 ring-slate-300" : "absolute left-0 top-0 origin-top-left")}
            style={device === "mobile" ? { width: Math.min(390, size.w - 24), height: boxH - 24 } : { width: DESKTOP, height: boxH / scale, transform: `scale(${scale})` }}
          />
        ) : null}
      </div>
    </div>
  );
}
