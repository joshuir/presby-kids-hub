"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, FileText, Film, Search, Trash2, UploadCloud } from "lucide-react";
import { deleteMedia, listMedia } from "@/lib/cms/client";
import { cn } from "@/lib/cn";
import { uploadFile } from "./FieldEditor";
import { PageHeader, useNotify } from "./ui";

const isImg = (k: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(k);
const isVid = (k: string) => /\.(mp4|webm|mov|m4v)$/i.test(k);

export function MediaLibrary({ canDelete }: { canDelete: boolean }) {
  const notify = useNotify();
  const [items, setItems] = useState<{ key: string; url: string }[]>([]);
  const [busy, setBusy] = useState(0);
  const [kind, setKind] = useState<"all" | "images" | "videos" | "docs">("all");
  const [q, setQ] = useState("");
  const [over, setOver] = useState(false);

  const load = useCallback(() => {
    listMedia().then((d) => setItems([...d].reverse())).catch((e) => notify((e as Error).message, "err"));
  }, [notify]);
  useEffect(() => { load(); }, [load]);

  const upload = async (files: File[]) => {
    setBusy(files.length);
    for (const f of files) {
      try { await uploadFile(f); } catch (x) { notify(`${f.name}: ${(x as Error).message}`, "err"); }
      setBusy((n) => n - 1);
    }
    notify(`${files.length} file${files.length === 1 ? "" : "s"} uploaded`);
    load();
  };

  const shown = items.filter((m) => (kind === "all" || (kind === "images" ? isImg(m.key) : kind === "videos" ? isVid(m.key) : !isImg(m.key) && !isVid(m.key))) && (!q || m.key.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="grid gap-5">
      <PageHeader title="Media library" intro="Every image, video and document you've uploaded. Copy a link to use it anywhere — or upload straight from any image field." />
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = [...e.dataTransfer.files]; if (f.length) upload(f); }}
        className={cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition", over ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:bg-slate-50")}
      >
        <UploadCloud className="h-8 w-8 text-blue-600" aria-hidden />
        <span className="text-sm font-semibold text-slate-800">{busy ? `Uploading… ${busy} left` : "Drop files here, or click to upload"}</span>
        <span className="text-xs text-slate-500">Images, videos, PDFs and Word files · up to 50 MB each</span>
        <input type="file" multiple className="sr-only" accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => { const f = [...(e.target.files ?? [])]; e.target.value = ""; if (f.length) upload(f); }} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="File type">
          {(["all", "images", "videos", "docs"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cn("rounded-md px-3 py-1.5 text-xs font-semibold capitalize", kind === k ? "bg-white shadow-sm" : "text-slate-500")}>{k}</button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" aria-label="Search files" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" />
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
        {!shown.length ? <li className="col-span-full py-10 text-center text-sm text-slate-400">No files yet.</li> : null}
        {shown.map((m) => (
          <li key={m.key} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative aspect-square bg-slate-100">
              {isImg(m.key) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid h-full place-items-center text-slate-400">{isVid(m.key) ? <Film className="h-8 w-8" /> : <FileText className="h-8 w-8" />}</div>
              )}
            </div>
            <div className="grid gap-1.5 p-2">
              <span className="truncate text-xs font-semibold text-slate-700" title={m.key}>{m.key.replace(/^[a-z0-9]+-/, "")}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => { navigator.clipboard?.writeText(m.url); notify("Link copied"); }} className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 text-[11px] font-semibold hover:bg-slate-50"><Copy className="h-3 w-3" /> Copy link</button>
                {canDelete ? (
                  <button type="button" aria-label={`Delete ${m.key}`} onClick={async () => { if (!confirm("Delete this file? Anything using it will show a broken link.")) return; await deleteMedia(m.key); load(); }} className="grid h-7 w-7 place-items-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
