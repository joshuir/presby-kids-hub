"use client";

import { ArrowDown, ArrowUp, CheckCircle2, ExternalLink, Plus, Trash2, TriangleAlert, XCircle } from "lucide-react";
import { SocialBadge } from "@/components/site/Social";
import { SOCIAL_NETWORKS, isGenericLink, networkInfo, networkKey, socialUrl } from "@/lib/socials";
import { cn } from "@/lib/cn";
import { EditorSplit } from "./EditorSplit";
import { Btn, PageHeader, Panel, SaveBar, TextInput, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

type Row = { network: string; handle: string; cta: string; link: string };
const toRow = (r: string): Row => {
  const [network = "", handle = "", cta = "", link = ""] = String(r ?? "").split("|").map((x) => x.trim());
  return { network, handle, cta, link };
};
const clean = (v: string) => v.replace(/\|/g, "/");
const fromRow = (r: Row) => [r.network, r.handle, r.cta, r.link].map(clean).join("|");

const field = "h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

/** CMS → Social media: add, edit, reorder and remove every social account shown on the website. */
export function SocialEditor() {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const d = st.draft;
  if (!d) return <p className="text-sm text-slate-500">Loading social media…</p>;

  const rows = ((d.socials as string[]) ?? []).map(toRow);
  const write = (next: Row[]) => st.set("socials", next.map(fromRow));
  const update = (i: number, p: Partial<Row>) => write(rows.map((r, k) => (k === i ? { ...r, ...p } : r)));
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const n = [...rows];
    [n[i], n[j]] = [n[j], n[i]];
    write(n);
  };
  const add = (name: string) => {
    const info = networkInfo(name);
    write([...rows, { network: info.name, handle: "", cta: info.cta, link: "" }]);
  };
  const used = new Set(rows.map((r) => networkKey(r.network)));
  const working = rows.filter((r) => socialUrl(r.network, r.link)).length;

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Social media"
        intro="Every social account on the website, in one place. Each one gets its official icon and appears in the footer, on the Contact page (Follow us), in the home page's social section and beside the blog. Accounts without a working link are never shown."
      />
      <EditorSplit path="/contact/" settings={d} note={<>The Contact page with your unsaved changes. Visitors see them after “Save &amp; publish”.</>} bar={<SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />}>
        <div className="grid gap-5">
          <Panel title="Your accounts" intro={`${working} of ${rows.length} showing on the website. Drag order with the arrows: the first account is shown first everywhere.`}>
            {rows.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No social accounts yet — add one below.</p> : null}
            <ul className="grid gap-3" data-testid="social-rows">
              {rows.map((r, i) => {
                const info = networkInfo(r.network);
                const url = socialUrl(r.network, r.link);
                const generic = isGenericLink(r.network, url);
                const known = SOCIAL_NETWORKS.some((n) => n.key === info.key);
                return (
                  <li key={i} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4" data-social-row={i}>
                    <div className="flex items-center gap-3">
                      <SocialBadge network={info.key} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-slate-900">{r.network || "New account"}</div>
                        <div className="truncate text-xs text-slate-500">{url ?? "Not shown yet — add a link"}</div>
                      </div>
                      <span className="flex shrink-0 items-center">
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${r.network} up`} className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move ${r.network} down`} className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                        <button type="button" onClick={() => write(rows.filter((_, k) => k !== i))} aria-label={`Remove ${r.network || "account"}`} data-social-remove={i} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[13px] font-semibold text-slate-700">Platform</span>
                        <select
                          value={known ? info.name : "__custom"}
                          aria-label={`Platform (account ${i + 1})`}
                          onChange={(e) => {
                            const n = e.target.value === "__custom" ? "Website" : e.target.value;
                            const was = networkInfo(r.network);
                            update(i, { network: n, cta: !r.cta || r.cta === was.cta ? networkInfo(n).cta : r.cta });
                          }}
                          className={field}
                        >
                          {SOCIAL_NETWORKS.map((n) => <option key={n.key} value={n.name}>{n.name}</option>)}
                          {!known ? <option value="__custom">{r.network || "Other"}</option> : null}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[13px] font-semibold text-slate-700">Name or handle shown</span>
                        <input value={r.handle} placeholder={info.handleHint} aria-label={`Name or handle (account ${i + 1})`} onChange={(e) => update(i, { handle: e.target.value })} className={field} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-[13px] font-semibold text-slate-700">Link</span>
                        <span className="flex gap-2">
                          <input value={r.link} placeholder={info.placeholder} aria-label={`Link (account ${i + 1})`} inputMode="url" onChange={(e) => update(i, { link: e.target.value })} className={cn(field, r.link && !url && "border-red-400")} />
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" aria-label={`Test the ${r.network} link`}>
                              Test <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </span>
                        <span className="mt-1 flex items-start gap-1.5 text-xs" data-social-status={!r.link ? "empty" : !url ? "bad" : generic ? "generic" : "ok"}>
                          {!r.link ? (
                            <span className="text-slate-500">Paste the link to your {info.name} {info.key === "whatsapp" ? "chat, channel or group (a phone number works too)" : info.key === "email" ? "address" : "page"}.</span>
                          ) : !url ? (
                            <><XCircle className="h-3.5 w-3.5 shrink-0 text-red-600" /><span className="text-red-700">That isn&apos;t a working link — it won&apos;t be shown. Use a full address starting with https://</span></>
                          ) : generic ? (
                            <><TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" /><span className="text-amber-700">This opens {info.name}&apos;s front page, not your account. Paste your own page&apos;s link.</span></>
                          ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" /><span className="text-emerald-700">Working — shown on the website.</span></>
                          )}
                        </span>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[13px] font-semibold text-slate-700">Button text</span>
                        <input value={r.cta} placeholder={info.cta} aria-label={`Button text (account ${i + 1})`} onChange={(e) => update(i, { cta: e.target.value })} className={field} />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <div className="mb-2 text-[13px] font-semibold text-slate-700">Add an account</div>
              <div className="flex flex-wrap gap-2" data-testid="social-add">
                {SOCIAL_NETWORKS.map((n) => (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => add(n.name)}
                    data-add-social={n.key}
                    className={cn("inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-semibold transition hover:border-blue-500 hover:bg-blue-50", used.has(n.key) ? "border-slate-200 text-slate-500" : "border-slate-300 text-slate-800")}
                  >
                    <SocialBadge network={n.key} size={24} /> {n.name} <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="WhatsApp chat number" intro="Used by the WhatsApp card on the Contact page and the “WhatsApp us” button in the footer.">
            <TextInput label="WhatsApp number (with country code)" value={String(d.whatsapp ?? "")} placeholder="+233 20 000 0000" onChange={(v) => st.set("whatsapp", v)} />
          </Panel>

          <Panel title="Where these appear">
            <ul className="grid gap-1.5 text-sm text-slate-600">
              <li>• <b>Footer</b> — icon buttons on every page</li>
              <li>• <b>Contact page</b> — “Follow us” cards under Call / WhatsApp / Email / Visit</li>
              <li>• <b>Home page</b> — the social media section (move or hide it in Page layouts)</li>
              <li>• <b>Blog</b> — beside the posts, and in any “Social” block you add</li>
            </ul>
            <div className="mt-3"><Btn size="sm" onClick={() => (location.hash = "layouts")}>Open Page layouts</Btn></div>
          </Panel>
        </div>
      </EditorSplit>
    </div>
  );
}
