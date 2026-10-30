"use client";

import { FONTS } from "@/lib/theme";
import { COPY } from "@/lib/copy";
import { EditorSplit } from "./EditorSplit";
import { Btn, ColorInput, PageHeader, Panel, RowsEditor, SaveBar, Segmented, SelectInput, TextInput, Toggle, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

export function FooterEditor() {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const d = st.draft;
  if (!d) return <p className="text-sm text-slate-500">Loading footer…</p>;
  const copy = (d.copy ?? {}) as Record<string, string>;
  const setCopy = (k: keyof typeof COPY, v: string) => st.set("copy", { ...copy, [k]: v });
  const cv = (k: keyof typeof COPY) => copy[k] ?? "";

  return (
    <div className="grid gap-5">
      <PageHeader title="Footer" intro="Colours, hover animations, the big wordmark, links, social icons and the visit banner at the bottom of every page." />
      <EditorSplit path="/events/" settings={d} note={<>Scroll to the bottom of the preview to see the footer. Hover the links and the wordmark to try the animations.</>} bar={<SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />}>
        <div className="grid gap-5">
          <Panel title="Colours & hover animation">
            <div className="grid gap-3 sm:grid-cols-3">
              <ColorInput label="Background" value={String(d.footerBg ?? "")} fallback={String(d.themeInk || "#0B1530")} onChange={(v) => st.set("footerBg", v)} />
              <ColorInput label="Text" value={String(d.footerText ?? "")} fallback="#FFFFFF" onChange={(v) => st.set("footerText", v)} />
              <ColorInput label="Hover colour" value={String(d.footerAccent ?? "")} fallback={String(d.themeAccent || "#FFC53D")} onChange={(v) => st.set("footerAccent", v)} />
            </div>
            <div className="mt-4">
              <Segmented
                label="When someone hovers a link or icon"
                value={(d.footerHoverEffect as "slide" | "glow" | "lift" | "none") || "slide"}
                onChange={(v) => st.set("footerHoverEffect", v)}
                options={[{ value: "slide", label: "Colour + underline" }, { value: "glow", label: "Colour + glow" }, { value: "lift", label: "Colour + lift" }, { value: "none", label: "No effect" }]}
              />
            </div>
          </Panel>

          <Panel title="Big wordmark" intro="The giant name along the bottom. Letters light up in colour as the mouse (or a finger) passes over them.">
            <div className="grid gap-3">
              <Toggle label="Show the wordmark" checked={d.showFooterWordmark !== "no"} onChange={(v) => st.set("showFooterWordmark", v ? "yes" : "no")} />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="Text" value={String(d.footerWordmark ?? "")} placeholder={d.siteName} onChange={(v) => st.set("footerWordmark", v)} />
                <SelectInput label="Font" value={String(d.footerWordmarkFont || "Poppins")} onChange={(v) => st.set("footerWordmarkFont", v)} options={FONTS.map((f) => f.name)} />
                <SelectInput label="Hover animation" value={String(d.footerWordmarkEffect || "trail")} onChange={(v) => st.set("footerWordmarkEffect", v)} options={[["trail", "Colour trail (letters pop up)"], ["wave", "Wave (neighbours light too)"], ["color", "Colour only"], ["none", "Off"]]} />
                <ColorInput label="Resting colour" value={String(d.footerWordmarkColor ?? "")} fallback="#26324F" help="Leave empty for a soft tint of the footer" onChange={(v) => st.set("footerWordmarkColor", v)} />
              </div>
              <RowsEditor
                label="Hover colours (letters cycle through these)"
                help="Leave empty to use the theme colours."
                value={(d.footerWordmarkColors as string[]) ?? []}
                onChange={(v) => st.set("footerWordmarkColors", v)}
                cols={[{ key: "hex", label: "Colour (hex, e.g. #FFC53D)" }]}
                addLabel="Add colour"
              />
            </div>
          </Panel>

          <Panel title="Visit banner" intro="The blue “Come as you are” card at the top of the footer (hidden automatically on the Contact page).">
            <div className="grid gap-3">
              <Toggle label="Show the visit banner" checked={d.showVisitCard !== "no"} onChange={(v) => st.set("showVisitCard", v ? "yes" : "no")} />
              <TextInput label="Heading" value={cv("footer.visit.title")} placeholder={COPY["footer.visit.title"].def} onChange={(v) => setCopy("footer.visit.title", v)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="WhatsApp button" value={cv("footer.visit.whatsapp")} placeholder={COPY["footer.visit.whatsapp"].def} onChange={(v) => setCopy("footer.visit.whatsapp", v)} />
                <TextInput label="WhatsApp message" value={cv("footer.visit.whatsappMsg")} placeholder={COPY["footer.visit.whatsappMsg"].def} onChange={(v) => setCopy("footer.visit.whatsappMsg", v)} />
              </div>
              <p className="text-xs text-slate-500">The first button uses the header button text and link (Navigation). Service times are edited in Site settings.</p>
            </div>
          </Panel>

          <Panel title="Text & links">
            <div className="grid gap-4">
              <TextInput label="Tagline under the logo" value={String(d.footerTagline ?? "")} onChange={(v) => st.set("footerTagline", v)} multiline />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="Links column heading" value={cv("footer.col.explore")} placeholder={COPY["footer.col.explore"].def} onChange={(v) => setCopy("footer.col.explore", v)} />
                <TextInput label="Contact column heading" value={cv("footer.col.contact")} placeholder={COPY["footer.col.contact"].def} onChange={(v) => setCopy("footer.col.contact", v)} />
              </div>
              <RowsEditor label="Footer links" value={(d.footerLinks as string[]) ?? []} onChange={(v) => st.set("footerLinks", v)} cols={[{ key: "label", label: "Label" }, { key: "url", label: "Link", placeholder: "/page/" }]} addLabel="Add link" testId="footer-links" />
              <RowsEditor label="Bottom-row links" value={(d.legalLinks as string[])?.length ? (d.legalLinks as string[]) : ["Safeguarding|/safeguarding/", "Privacy|/privacy/", "Terms|/terms/", "Accessibility|/accessibility/"]} onChange={(v) => st.set("legalLinks", v)} cols={[{ key: "label", label: "Label" }, { key: "url", label: "Link" }]} addLabel="Add link" />
              <TextInput label="Staff login link text" value={cv("footer.staffLogin")} placeholder={COPY["footer.staffLogin"].def} onChange={(v) => setCopy("footer.staffLogin", v)} />
            </div>
          </Panel>

          <Panel title="Social media icons" intro="The footer shows an icon for every social account. Add, edit or remove accounts in Social media.">
            <Btn size="sm" onClick={() => (location.hash = "social")} data-testid="go-social">Manage social media</Btn>
          </Panel>
        </div>
      </EditorSplit>
    </div>
  );
}
