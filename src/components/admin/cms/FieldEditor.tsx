"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Field } from "./fields";
import { uploadMedia } from "@/lib/cms/client";

type Doc = Record<string, unknown>;

const input = "w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-black/15 focus:outline-none focus:ring-2 focus:ring-blueBrand-500";

/** Shrinks large photos (e.g. from phones) before upload; keeps PNG transparency. */
async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, type === "image/jpeg" ? ".jpg" : ".webp"), { type });
  } catch {
    return file;
  }
}

/** Uploads a file to the CMS media store and returns its site URL. */
/** Uploads a file to the media library (Supabase Storage) and returns its public URL. */
export async function uploadFile(original: File): Promise<string> {
  const file = await shrinkImage(original);
  if (file.size > 50 * 1024 * 1024) throw new Error("File is larger than 50 MB. For long videos, paste a YouTube or Vimeo link instead.");
  return uploadMedia(file);
}

function UploadButton({
  accept,
  onUploaded,
  label = "Upload",
}: {
  accept: string;
  onUploaded: (url: string, file: File) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setErr(null);
          try {
            onUploaded(await uploadFile(f), f);
          } catch (x) {
            setErr((x as Error).message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="whitespace-nowrap rounded-xl bg-ink-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        disabled={busy}
      >
        {busy ? "Uploading…" : label}
      </button>
      {err ? <span className="text-xs text-red-700">{err}</span> : null}
    </span>
  );
}

function isVideo(url: string) {
  return /youtu|vimeo|\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function FieldEditor({
  field,
  doc,
  set,
  classes,
  lookups = {},
}: {
  field: Field;
  doc: Doc;
  set: (key: string, value: unknown) => void;
  classes: { id: string; name: string }[];
  lookups?: Record<string, { id: string; name: string }[]>;
}) {
  const v = doc[field.key];
  const label = (
    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-black/55">
      {field.label}
      {field.required ? " *" : ""}
    </span>
  );
  const help = field.help ? <span className="mt-1 block text-xs text-black/45">{field.help}</span> : null;

  switch (field.type) {
    case "heading":
      return (
        <div id={`cmsh-${field.key}`} className="scroll-mt-24 border-t border-black/10 pt-5">
          <h3 className="font-display text-xl font-extrabold text-ink">{field.label}</h3>
          {field.help ? <p className="mt-0.5 text-sm text-black/50">{field.help}</p> : null}
        </div>
      );
    case "text":
    case "date":
      return (
        <label className="block">
          {label}
          <input className={input} type={field.type === "date" ? "date" : "text"} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)} required={field.required} />
          {help}
        </label>
      );
    case "number":
      return (
        <label className="block">
          {label}
          <input className={input} type="number" value={Number(v ?? 0)} onChange={(e) => set(field.key, Number(e.target.value))} />
          {help}
        </label>
      );
    case "textarea":
      return (
        <label className="block">
          {label}
          <textarea className={cn(input, "min-h-24")} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)} required={field.required} />
          {help}
        </label>
      );
    case "select":
      return (
        <label className="block">
          {label}
          <select className={input} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)}>
            {field.options?.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      );
    case "classRef":
      return (
        <label className="block">
          {label}
          <select className={input} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)} required>
            <option value="">Choose a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      );
    case "ref": {
      const opts = lookups[field.source ?? ""] ?? [];
      return (
        <label className="block">
          {label}
          <select className={input} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)}>
            <option value="">— None —</option>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          {help}
        </label>
      );
    }
    case "refs": {
      const opts = lookups[field.source ?? ""] ?? [];
      const cur = Array.isArray(v) ? (v as string[]) : [];
      return (
        <fieldset className="block">
          <legend className="mb-1 block text-xs font-bold uppercase tracking-wide text-black/55">{field.label}</legend>
          <div className="flex flex-wrap gap-1.5">
            {opts.map((o) => {
              const on = cur.includes(o.id);
              return (
                <label key={o.id} className={cn("cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold ring-1", on ? "bg-blueBrand-600 text-white ring-transparent" : "bg-white ring-black/15")}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => set(field.key, on ? cur.filter((x) => x !== o.id) : [...cur, o.id])} />
                  {o.name}
                </label>
              );
            })}
          </div>
          {help}
        </fieldset>
      );
    }
    case "imageList": {
      const list = Array.isArray(v) ? (v as string[]) : [];
      return (
        <div>
          {label}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {list.map((u, i) => (
              <div key={u + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="aspect-square w-full rounded-xl object-cover ring-1 ring-black/10" />
                <button type="button" aria-label="Remove picture" onClick={() => set(field.key, list.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-white px-2 text-xs font-bold text-red-700 shadow">×</button>
              </div>
            ))}
          </div>
          <div className="mt-2"><UploadButton accept="image/*" label="+ Add picture" onUploaded={(u) => set(field.key, [...list, u])} /></div>
          {help}
        </div>
      );
    }
    case "color":
      return (
        <label className="block">
          {label}
          <span className="flex gap-2">
            <input type="color" value={String(v ?? "#000000")} onChange={(e) => set(field.key, e.target.value)} className="h-10 w-14 rounded-lg" />
            <input className={input} value={String(v ?? "")} onChange={(e) => set(field.key, e.target.value)} />
          </span>
        </label>
      );
    case "lines":
      return (
        <label className="block">
          {label}
          <textarea
            className={cn(input, "min-h-24")}
            value={Array.isArray(v) ? (v as string[]).join("\n") : ""}
            onChange={(e) => set(field.key, e.target.value.split("\n"))}
            onBlur={(e) => set(field.key, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          />
        </label>
      );
    case "media":
    case "video": {
      const url = String(v ?? "");
      return (
        <div>
          {label}
          <div className="flex gap-2">
            <input className={input} placeholder={field.type === "video" ? "https://youtube.com/watch?v=… or upload" : field.accept ? "Link or upload" : "Image URL or upload"} value={url} onChange={(e) => set(field.key, e.target.value)} />
            <UploadButton accept={field.accept ?? (field.type === "video" ? "video/*" : "image/*")} onUploaded={(u) => set(field.key, u)} label={url ? "Replace" : "Upload"} />
            {url ? (
              <button type="button" className="rounded-xl px-2 text-xs font-bold text-red-700 ring-1 ring-red-200" onClick={() => set(field.key, "")}>
                Remove
              </button>
            ) : null}
          </div>
          {url && field.type === "media" && !field.accept ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="mt-2 h-28 rounded-xl object-cover ring-1 ring-black/10" />
          ) : null}
          {help}
        </div>
      );
    }
    case "mediaList": {
      const list = (Array.isArray(v) ? v : []) as { type: "image" | "video"; url: string; caption?: string }[];
      const update = (next: typeof list) => set(field.key, next);
      return (
        <div>
          {label}
          <div className="grid gap-2">
            {list.map((m, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-black/[0.03] p-2 sm:grid-cols-[80px_1fr_auto]">
                {m.type === "image" && m.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-16 w-20 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-16 w-20 place-items-center rounded-lg bg-black text-xl text-white">▶</span>
                )}
                <div className="grid gap-1">
                  <input className={input} value={m.url} placeholder="URL" onChange={(e) => update(list.map((x, j) => (j === i ? { ...x, url: e.target.value, type: isVideo(e.target.value) ? "video" : "image" } : x)))} />
                  <input className={input} value={m.caption ?? ""} placeholder="Caption" onChange={(e) => update(list.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
                </div>
                <div className="flex flex-wrap items-start gap-1">
                  <UploadButton accept="image/*,video/*" label="Replace" onUploaded={(u, f) => update(list.map((x, j) => (j === i ? { ...x, url: u, type: f.type.startsWith("video") ? "video" : "image" } : x)))} />
                  <button type="button" className="rounded-xl px-2 py-2 text-xs ring-1 ring-black/10" disabled={i === 0} onClick={() => { const n = [...list]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; update(n); }}>↑</button>
                  <button type="button" className="rounded-xl px-2 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200" onClick={() => update(list.filter((_, j) => j !== i))}>Delete</button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <UploadButton accept="image/*,video/*" label="+ Upload picture/video" onUploaded={(u, f) => update([...list, { type: f.type.startsWith("video") ? "video" : "image", url: u, caption: "" }])} />
              <button type="button" className="rounded-xl px-3 py-2 text-xs font-bold ring-1 ring-black/15" onClick={() => update([...list, { type: "video", url: "", caption: "" }])}>
                + Add link (YouTube/Vimeo/image URL)
              </button>
            </div>
          </div>
        </div>
      );
    }
    case "resources": {
      const list = (Array.isArray(v) ? v : []) as { label: string; url: string; kind: string }[];
      const update = (next: typeof list) => set(field.key, next);
      return (
        <div>
          {label}
          <div className="grid gap-2">
            {list.map((r, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-black/[0.03] p-2 sm:grid-cols-[1fr_1fr_130px_auto]">
                <input className={input} value={r.label} placeholder="Label (e.g. Worksheet)" onChange={(e) => update(list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className={input} value={r.url} placeholder="File URL" onChange={(e) => update(list.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <select className={input} value={r.kind} onChange={(e) => update(list.map((x, j) => (j === i ? { ...x, kind: e.target.value } : x)))}>
                  <option value="notes">Lesson notes</option>
                  <option value="worksheet">Worksheet</option>
                  <option value="activity">Activity sheet</option>
                  <option value="image">Colouring / image</option>
                  <option value="audio">Song / audio</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-1">
                  <UploadButton accept=".pdf,.doc,.docx,image/*,audio/mpeg" label="Replace" onUploaded={(u) => update(list.map((x, j) => (j === i ? { ...x, url: u } : x)))} />
                  <button type="button" className="rounded-xl px-2 text-xs font-bold text-red-700 ring-1 ring-red-200" onClick={() => update(list.filter((_, j) => j !== i))}>Delete</button>
                </div>
              </div>
            ))}
            <UploadButton
              accept=".pdf,.doc,.docx,image/*,audio/mpeg"
              label="+ Upload download (PDF/Word/image/MP3)"
              onUploaded={(u, f) => update([...list, { label: f.name.replace(/\.[a-z0-9]+$/i, ""), url: u, kind: f.type.startsWith("audio") ? "audio" : f.type.startsWith("image") ? "image" : /work/i.test(f.name) ? "worksheet" : /activ/i.test(f.name) ? "activity" : "notes" }])}
            />
          </div>
        </div>
      );
    }
    case "stock": {
      const sizes = (Array.isArray(doc.sizes) ? doc.sizes : []) as string[];
      const stock = (v ?? {}) as Record<string, number>;
      return (
        <div>
          {label}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {sizes.filter(Boolean).map((s) => (
              <label key={s} className="text-xs font-bold">
                {s}
                <input className={input} type="number" min={0} value={stock[s] ?? 0} onChange={(e) => set(field.key, { ...stock, [s]: Math.max(0, Number(e.target.value)) })} />
              </label>
            ))}
          </div>
        </div>
      );
    }
    case "colorways": {
      type CW = { name: string; hex: string; printHex: string; tagHex?: string; frontImage?: string; backImage?: string };
      const list = (Array.isArray(v) ? v : []) as CW[];
      const update = (next: CW[]) => set(field.key, next);
      const patch = (i: number, p: Partial<CW>) => update(list.map((x, j) => (j === i ? { ...x, ...p } : x)));
      const move = (i: number, d: -1 | 1) => {
        const n = [...list];
        const j = i + d;
        if (j < 0 || j >= n.length) return;
        [n[i], n[j]] = [n[j], n[i]];
        update(n);
      };
      return (
        <div>
          {label}
          <div className="grid gap-2">
            {list.map((c, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-black/[0.03] p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-10 w-6 shrink-0 rounded ring-1 ring-black/10" style={{ background: c.tagHex || c.hex }} />
                  <input className={cn(input, "w-32")} value={c.name} placeholder="Colour name" onChange={(e) => patch(i, { name: e.target.value })} aria-label="Colour name" />
                  <label className="flex items-center gap-1 text-xs">Garment<input type="color" value={c.hex} onChange={(e) => patch(i, { hex: e.target.value, tagHex: e.target.value })} /></label>
                  <label className="flex items-center gap-1 text-xs">Print<input type="color" value={c.printHex} onChange={(e) => patch(i, { printHex: e.target.value })} /></label>
                  <label className="flex items-center gap-1 text-xs">Tag<input type="color" value={c.tagHex || c.hex} onChange={(e) => patch(i, { tagHex: e.target.value })} /></label>
                  <span className="ml-auto flex gap-1">
                    <button type="button" aria-label="Move up" className="rounded-lg px-2 py-1 text-xs ring-1 ring-black/10 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                    <button type="button" aria-label="Move down" className="rounded-lg px-2 py-1 text-xs ring-1 ring-black/10 disabled:opacity-30" disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</button>
                    <button type="button" className="rounded-lg px-2 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200" onClick={() => update(list.filter((_, j) => j !== i))}>Delete</button>
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["frontImage", "backImage"] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-black/5">
                      {c[k] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c[k]} alt="" className="h-12 w-12 rounded object-contain ring-1 ring-black/10" />
                      ) : (
                        <span className="grid h-12 w-12 place-items-center rounded bg-black/5 text-[10px] text-black/40">none</span>
                      )}
                      <span className="flex-1 text-xs font-semibold">{k === "frontImage" ? "Front photo" : "Back photo"}<span className="block font-normal text-black/45">optional</span></span>
                      <UploadButton accept="image/*" label={c[k] ? "Replace" : "Upload"} onUploaded={(u) => patch(i, { [k]: u })} />
                      {c[k] ? <button type="button" className="rounded-lg px-2 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200" onClick={() => patch(i, { [k]: "" })}>Remove</button> : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" className="justify-self-start rounded-xl px-3 py-2 text-xs font-bold ring-1 ring-black/15" onClick={() => update([...list, { name: "New colour", hex: "#86EF99", printHex: "#111111", tagHex: "#86EF99" }])}>
              + Add colour
            </button>
            <span className="text-xs text-black/45">
              Each colour becomes a clickable tag on the website. Without photos the garment is drawn and recoloured automatically; upload a photo for a colour to show that exact item instead.
            </span>
          </div>
        </div>
      );
    }
    case "options": {
      const opts = (Array.isArray(v) ? v : ["", "", "", ""]) as string[];
      const answer = String(doc.answer ?? "");
      return (
        <div>
          {label}
          <div className="grid gap-2 sm:grid-cols-2">
            {opts.map((o, i) => (
              <label key={i} className={cn("flex items-center gap-2 rounded-xl p-2 ring-1", o && o === answer ? "bg-emerald-50 ring-emerald-400" : "ring-black/10")}>
                <input
                  type="radio"
                  name="correct"
                  checked={!!o && o === answer}
                  onChange={() => set("answer", o)}
                  aria-label={`Mark option ${i + 1} correct`}
                />
                <input
                  className={input}
                  value={o}
                  placeholder={`Option ${i + 1}`}
                  onChange={(e) => {
                    const next = opts.map((x, j) => (j === i ? e.target.value : x));
                    set("options", next);
                    if (o === answer) set("answer", e.target.value);
                  }}
                />
              </label>
            ))}
          </div>
          <span className="mt-1 block text-xs text-black/45">Select the radio button next to the correct answer.</span>
        </div>
      );
    }
  }
}
