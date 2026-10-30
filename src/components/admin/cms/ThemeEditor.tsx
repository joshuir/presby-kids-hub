"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { FONTS, THEME_DEFAULTS, THEME_PRESETS, fontPreviewHref } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { FieldEditor } from "./FieldEditor";
import { LivePreview } from "./LivePreview";
import { ColorInput, PageHeader, Panel, SaveBar, Segmented, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

type K = keyof typeof THEME_DEFAULTS;
const COLOURS: { key: K; label: string; help: string }[] = [
  { key: "themePrimary", label: "Primary", help: "Buttons, links, highlights" },
  { key: "themeAccent", label: "Accent", help: "Sunny highlights & badges" },
  { key: "themeCoral", label: "Coral", help: "Warm section labels" },
  { key: "themeMint", label: "Mint", help: "Success & fresh accents" },
  { key: "themeInk", label: "Text & dark", help: "Headings, footer, dark sections" },
  { key: "themeBg", label: "Page background", help: "Behind everything" },
  { key: "themeSurface", label: "Soft surface", help: "Tinted panels & chips" },
];

export function ThemeEditor() {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const d = st.draft;
  const val = (k: K) => String((d?.[k] as string) || THEME_DEFAULTS[k]);

  // load every offered Google font once so the font cards preview correctly
  useEffect(() => {
    const href = fontPreviewHref(FONTS.map((f) => f.name));
    if (!href || document.getElementById("cm-font-previews")) return;
    const l = document.createElement("link");
    l.id = "cm-font-previews";
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }, []);

  if (!d) return <p className="text-sm text-slate-500">Loading theme…</p>;

  const activePreset = THEME_PRESETS.find((p) => Object.entries(p.values).every(([k, v]) => !k.startsWith("theme") || k === "themeRadius" || val(k as K).toUpperCase() === String(v).toUpperCase()));

  return (
    <div className="grid gap-5">
      <PageHeader title="Theme & fonts" intro="Colours, fonts, corners and buttons for the whole website. The preview updates as you change things; visitors see it when you save." />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,460px)_1fr]">
        <div className="grid gap-5">
          <Panel title="Colour presets" intro="Start from a palette, then fine-tune below.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => st.patch(p.values as never)}
                  aria-pressed={activePreset?.name === p.name}
                  className={cn("rounded-xl border p-2.5 text-left transition hover:border-slate-400", activePreset?.name === p.name ? "border-blue-600 ring-2 ring-blue-600/20" : "border-slate-200")}
                >
                  <span className="flex h-8 overflow-hidden rounded-lg">
                    {(["themePrimary", "themeAccent", "themeCoral", "themeInk", "themeBg"] as K[]).map((k) => (
                      <span key={k} className="flex-1" style={{ background: String(p.values[k] ?? THEME_DEFAULTS[k]) }} />
                    ))}
                  </span>
                  <span className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
                    {p.name}
                    {activePreset?.name === p.name ? <Check className="h-3.5 w-3.5 text-blue-600" /> : null}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Colours">
            <div className="grid gap-3 sm:grid-cols-2">
              {COLOURS.map((c) => (
                <ColorInput key={c.key} label={c.label} help={c.help} value={String(d[c.key] ?? "")} fallback={THEME_DEFAULTS[c.key]} onChange={(v) => st.set(c.key, v as never)} />
              ))}
            </div>
          </Panel>

          <Panel title="Fonts" intro="Headings and body text. All fonts are free Google Fonts.">
            {(["fontHeading", "fontBody"] as const).map((k) => (
              <fieldset key={k} className="mb-4 last:mb-0">
                <legend className="mb-2 text-[13px] font-semibold text-slate-700">{k === "fontHeading" ? "Headings" : "Body text"}</legend>
                <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3" role="radiogroup" aria-label={k === "fontHeading" ? "Heading font" : "Body font"}>
                  {FONTS.filter((f) => f.kind === "both" || f.kind === (k === "fontHeading" ? "heading" : "body")).map((f) => {
                    const on = val(k) === f.name;
                    return (
                      <button key={f.name} type="button" role="radio" aria-checked={on} onClick={() => st.set(k, f.name)} className={cn("rounded-xl border px-3 py-2.5 text-left transition hover:border-slate-400", on ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20" : "border-slate-200")}>
                        <span className="block text-2xl leading-none text-slate-900" style={{ fontFamily: `"${f.name}${f.local ? " Variable" : ""}", "${f.name}"`, fontWeight: k === "fontHeading" ? 800 : 500 }}>Aa</span>
                        <span className="mt-1.5 block truncate text-xs font-semibold text-slate-700">{f.name}</span>
                        <span className="block truncate text-[11px] text-slate-400">{f.style}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </Panel>

          <Panel title="Shape & buttons">
            <div className="grid gap-4">
              <Segmented label="Corners" value={(val("themeRadius") as "rounded" | "soft" | "sharp")} onChange={(v) => st.set("themeRadius", v)} options={[{ value: "rounded", label: "Rounded" }, { value: "soft", label: "Soft" }, { value: "sharp", label: "Sharp" }]} />
              <Segmented label="Button style" value={(val("buttonStyle") as "3d" | "flat" | "outline")} onChange={(v) => st.set("buttonStyle", v)} options={[{ value: "3d", label: "Chunky 3D" }, { value: "flat", label: "Flat" }, { value: "outline", label: "Outline" }]} />
            </div>
          </Panel>

          <Panel title="Logo" intro="Shown in the header, footer and hero. A square or upright PNG with a transparent background works best.">
            <FieldEditor field={{ key: "logoUrl", label: "Logo image", type: "media", accept: "image/*" }} doc={d as Record<string, unknown>} classes={[]} lookups={{}} set={(k, v) => st.set(k as never, v as never)} />
          </Panel>

          <button type="button" onClick={() => st.patch({ ...THEME_DEFAULTS, logoUrl: "" } as never)} className="justify-self-start text-sm font-semibold text-slate-500 underline-offset-4 hover:underline">Reset to the original theme</button>
        </div>

        <div className="xl:sticky xl:top-20">
          <LivePreview path="/" settings={d} height={720} />
        </div>
      </div>
      <SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />
    </div>
  );
}
