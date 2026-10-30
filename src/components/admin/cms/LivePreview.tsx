"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RotateCw, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { PREVIEW_MSG } from "@/lib/site";

/**
 * The real website in a frame, showing the editor's unsaved settings live
 * (sent to the page with postMessage; nothing is saved until "Save & publish").
 */
export function LivePreview({ path, settings, className, height = 640 }: { path: string; settings: Record<string, unknown> | null; className?: string; height?: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);
  const latest = useRef(settings);
  const box = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // desktop preview renders the page at a real desktop width and scales it down to fit
  const DESKTOP = 1280;
  const scale = device === "desktop" && boxW ? Math.min(1, boxW / DESKTOP) : 1;

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

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100", className)} data-testid="live-preview">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <span className="flex gap-1" aria-hidden><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
        <span className="ml-1 min-w-0 flex-1 truncate rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{path}</span>
        <div className="flex rounded-md bg-slate-100 p-0.5" role="radiogroup" aria-label="Preview size">
          <button type="button" role="radio" aria-checked={device === "desktop"} aria-label="Desktop preview" onClick={() => setDevice("desktop")} className={cn("grid h-7 w-7 place-items-center rounded", device === "desktop" ? "bg-white shadow-sm" : "text-slate-500")}><Monitor className="h-4 w-4" /></button>
          <button type="button" role="radio" aria-checked={device === "mobile"} aria-label="Phone preview" onClick={() => setDevice("mobile")} className={cn("grid h-7 w-7 place-items-center rounded", device === "mobile" ? "bg-white shadow-sm" : "text-slate-500")}><Smartphone className="h-4 w-4" /></button>
        </div>
        <button type="button" aria-label="Reload preview" onClick={() => setNonce((n) => n + 1)} className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><RotateCw className="h-4 w-4" /></button>
        <a href={path} target="_blank" rel="noreferrer" aria-label="Open the live page in a new tab" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><ExternalLink className="h-4 w-4" /></a>
      </div>
      <div ref={box} className="relative flex shrink-0 justify-center overflow-hidden" style={{ height }}>
        <iframe
          key={`${path}-${nonce}`}
          ref={frame}
          title="Live preview of the website"
          src={path}
          onLoad={send}
          className={cn("shrink-0 bg-white", device === "mobile" ? "my-3 rounded-2xl shadow-xl ring-1 ring-slate-300" : "absolute left-0 top-0 origin-top-left")}
          style={device === "mobile" ? { width: 390, height: height - 24 } : { width: DESKTOP, height: height / scale, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
