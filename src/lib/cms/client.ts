"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SEEDS } from "./seed";
import { isLive, type CollectionName, type DocFor } from "./types";

/**
 * Browser data layer. The site is static (InfinityFree), so all content is read from and
 * written to Supabase directly. Security is enforced inside the database: public visitors
 * can only read published content, and every admin write checks the signed-in user's
 * permissions server-side.
 */

export const SUPABASE_URL = "https://mqmqgjynkocnvfwwhrof.supabase.co";
export const SUPABASE_KEY = "sb_publishable_gBnSXC_6gYYwc4LSYD0KyA_2mOrrimy"; // publishable (safe in browser)

let client: SupabaseClient | null = null;
export function supa() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "cm-cms-auth" },
    });
  }
  return client;
}

type ContentCol = Exclude<CollectionName, "leaderboard">;

/** This site keeps its content in its own namespace so other sites sharing the database are never affected. */
const NS = "cm.";
const ns = (col: string) => NS + col;

async function seedFor<C extends ContentCol>(col: C): Promise<DocFor<C>[]> {
  if (col === "questions") {
    const m = await import("./seed/questions.json");
    return (m.default as unknown) as DocFor<C>[];
  }
  return SEEDS[col] as DocFor<C>[];
}

function errMsg(e: unknown) {
  const m = (e as { message?: string })?.message ?? String(e);
  return m.replace(/^.*?ERROR:\s*/, "");
}

// ---------------- public ----------------

const cache = new Map<string, Promise<unknown>>();

/** Published content for the public site (drafts never leave the database). */
export function getPublic<C extends ContentCol>(col: C): Promise<DocFor<C>[]> {
  const key = `pub:${col}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const { data, error } = await supa().rpc("kh_public_collection", { col: ns(col) });
        if (error) throw new Error(errMsg(error));
        const items = (data ?? []) as DocFor<C>[];
        if (items.length) return items;
        // Nothing saved yet → show the starter content
        const { data: has } = await supa().rpc("kh_public_has", { col: ns(col) });
        if (has) return items;
        const seed = await seedFor(col);
        return seed.filter(
          (d) => isLive(d as never) || (["lessons", "events", "posts"].includes(col) && (d as { status?: string }).status === "archived"),
        );
      })().catch((e) => {
        cache.delete(key);
        throw e;
      }),
    );
  }
  return cache.get(key) as Promise<DocFor<C>[]>;
}

export async function getLeaderboard() {
  const { data, error } = await supa().rpc("kh_leaderboard_top");
  if (error) throw new Error(errMsg(error));
  return (data ?? []) as Array<{
    id: string; name: string; mascot: string; mascotColor: string; xp: number; streak: number; achievements: string[]; bestRound: number;
  }>;
}

export async function submitScore(p: Record<string, unknown>) {
  const { data, error } = await supa().rpc("kh_submit_score", { p });
  if (error) throw new Error(errMsg(error));
  return data as number;
}

export async function submitForm(kind: "contact" | "register" | "order" | "subscribe", data: Record<string, unknown>) {
  const { error } = await supa().rpc("kh_submit_form", { kind, data: { ...data, site: "cm" } });
  if (error) throw new Error(errMsg(error));
}

// ---------------- admin ----------------

export type WhoAmI =
  | { admin: true; email: string; name: string; role: "owner" | "subadmin"; permissions: string[] }
  | { admin: false; email?: string; ownerExists: boolean };

export async function whoami(): Promise<WhoAmI | null> {
  const { data: s } = await supa().auth.getSession();
  if (!s.session) return null;
  const { data, error } = await supa().rpc("kh_whoami");
  if (error) throw new Error(errMsg(error));
  return data as WhoAmI;
}

async function adminRaw<C extends ContentCol>(col: C): Promise<{ value: DocFor<C>[]; version: number }> {
  const { data, error } = await supa().rpc("kh_admin_get", { col: ns(col) });
  if (error) throw new Error(errMsg(error));
  if (!data) {
    const seed = await seedFor(col);
    const ts = new Date().toISOString();
    return { value: seed.map((d) => ({ createdAt: ts, updatedAt: ts, ...d })), version: -1 };
  }
  return data as { value: DocFor<C>[]; version: number };
}

/** All items including drafts (admins only). */
export async function adminList<C extends ContentCol>(col: C) {
  return (await adminRaw(col)).value;
}

/** Read-modify-write with conflict detection, retried a few times. */
export async function adminMutate<C extends ContentCol>(col: C, fn: (docs: DocFor<C>[]) => DocFor<C>[]) {
  let last: unknown;
  for (let i = 0; i < 4; i++) {
    const { value, version } = await adminRaw(col);
    const next = fn([...value]);
    const { error } = await supa().rpc("kh_admin_put", { col: ns(col), v: next, expected: version });
    if (!error) {
      cache.delete(`pub:${col}`);
      return next;
    }
    last = error;
    if ((error as { code?: string }).code !== "40001") break;
    await new Promise((r) => setTimeout(r, 200 * (i + 1)));
  }
  throw new Error(errMsg(last));
}

const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";

export async function adminUpsert<C extends ContentCol>(col: C, doc: Partial<DocFor<C>> & Record<string, unknown>) {
  const ts = new Date().toISOString();
  if (!doc.id) doc.id = `${slug(String(doc.title ?? doc.name ?? doc.question ?? "item"))}-${Date.now().toString(36)}`;
  let saved = doc as DocFor<C>;
  await adminMutate(col, (docs) => {
    const i = docs.findIndex((d) => d.id === doc.id);
    if (i >= 0) {
      saved = { ...docs[i], ...doc, updatedAt: ts } as DocFor<C>;
      docs[i] = saved;
    } else {
      saved = { ...doc, createdAt: ts, updatedAt: ts } as DocFor<C>;
      docs.unshift(saved);
    }
    return docs;
  });
  return saved;
}

export async function adminUpsertMany<C extends ContentCol>(col: C, items: Array<Record<string, unknown>>) {
  const ts = new Date().toISOString();
  const stamp = Date.now().toString(36);
  items.forEach((d, i) => {
    if (!d.id) d.id = `${slug(String(d.question ?? d.title ?? d.name ?? "item"))}-${stamp}${i}`;
  });
  await adminMutate(col, (docs) => {
    for (const d of items) docs.unshift({ ...d, createdAt: ts, updatedAt: ts } as DocFor<C>);
    return docs;
  });
}

export async function adminDelete(col: ContentCol, id: string) {
  await adminMutate(col, (docs) => docs.filter((d) => d.id !== id));
}

export async function adminReset(col: ContentCol) {
  const seed = await seedFor(col);
  await adminMutate(col, () => seed as never);
}

export async function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supa().rpc(fn, args);
  if (error) throw new Error(errMsg(error));
  return data as T;
}

// ---------------- media ----------------

export function mediaUrl(path: string) {
  return supa().storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Adds Supabase's download flag so the browser saves the file instead of opening it. */
export function downloadUrl(url: string) {
  if (url.includes("/storage/v1/object/public/")) return url + (url.includes("?") ? "&" : "?") + "download=";
  return url;
}

export async function uploadMedia(file: File) {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
  const path = `cm/${Date.now().toString(36)}-${safe}`;
  const { error } = await supa().storage.from("media").upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(errMsg(error));
  return mediaUrl(path);
}

export async function listMedia() {
  const { data, error } = await supa().storage.from("media").list("cm", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error(errMsg(error));
  return (data ?? []).filter((f) => f.id).map((f) => ({ key: `cm/${f.name}`, url: mediaUrl(`cm/${f.name}`) }));
}

export async function deleteMedia(key: string) {
  const { error } = await supa().storage.from("media").remove([key]);
  if (error) throw new Error(errMsg(error));
}

// ---------------- reactions & comments ----------------

export const REACTIONS = ["❤️", "🙏", "🙌", "😂", "😮", "👏", "🔥", "😊"] as const;
export type Reaction = (typeof REACTIONS)[number];
export type CommentItem = { id: number; name: string; body: string; reply?: string | null; replyBy?: string | null; createdAt: string };

let reactionsP: Promise<Record<string, Record<string, number>>> | null = null;
/** Live reaction totals for every post (one request, shared). */
export function getReactionTotals(fresh = false) {
  if (!reactionsP || fresh) {
    reactionsP = rpc<Record<string, Record<string, number>>>("cm_reactions").catch(() => {
      reactionsP = null;
      return {};
    });
  }
  return reactionsP;
}

export async function react(postId: string, emoji: Reaction, delta: 1 | -1) {
  return rpc<number>("cm_react", { pid: postId, emoji, delta });
}

let countsP: Promise<Record<string, number>> | null = null;
export function getCommentCounts(fresh = false) {
  if (!countsP || fresh) {
    countsP = rpc<Record<string, number>>("cm_comment_counts").catch(() => {
      countsP = null;
      return {};
    });
  }
  return countsP;
}

export function getComments(postId: string) {
  return rpc<CommentItem[]>("cm_comments", { pid: postId });
}

/** A per-browser random id used only for rate-limiting comments. */
export function clientId() {
  const k = "cm-client-id";
  try {
    let v = localStorage.getItem(k);
    if (!v) {
      v = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2, 12);
  }
}

export function addComment(postId: string, name: string, body: string) {
  return rpc<string>("cm_comment_add", { pid: postId, nm: name, txt: body, cid: clientId() });
}

export type AdminComment = CommentItem & { postId: string; status: "pending" | "approved" | "rejected"; flagged: boolean; flagReason?: string | null };
export const adminComments = () => rpc<AdminComment[]>("cm_admin_comments");
export const adminSetComment = (id: number, status: AdminComment["status"], reply: string, remove = false) =>
  rpc("cm_admin_comment_set", { cid: id, st: status, rep: reply, remove });

/** Public calendar feed (Google / Apple / Outlook subscribe to this and refresh automatically). */
export const CALENDAR_FEED = `${SUPABASE_URL}/functions/v1/cm-calendar`;

// ---------------- shop orders ----------------
export type OrderItem = { productId: string; name: string; colour: string; hex?: string; size: string; qty: number; unit: number; line: number; image?: string };
export type Order = {
  id: string;
  ref: string;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; phone: string; email: string };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  fulfilment: { method: "delivery" | "collection"; area?: string; address?: string; point?: string; notes?: string };
  payProvider: "paystack" | "flutterwave" | "later" | string;
  payStatus: "pending" | "due" | "paid" | "failed" | "refunded" | "expired" | string;
  payRef?: string;
  paidAt?: string;
  status: "new" | "confirmed" | "ready" | "out_for_delivery" | "completed" | "cancelled" | string;
  notes?: string;
  history?: Array<{ at: string; by: string; status?: string; pay?: string; note?: string }>;
  stockReserved?: boolean;
};
export type NewOrder = {
  customer: { name: string; phone: string; email: string };
  items: Array<{ productId: string; colour: string; size: string; qty: number }>;
  fulfilment: { method: "delivery" | "collection"; area?: string; address?: string; point?: string; notes?: string };
  provider: "paystack" | "flutterwave" | "later";
};
export type CreatedOrder = { ref: string; total: number; currency: string; provider: string; mode: "test" | "live"; email: string; name: string; phone: string };

/** Prices, stock and delivery fees are worked out again on the server — the browser can't change them. */
export const createOrder = (o: NewOrder) => rpc<CreatedOrder>("cm_order_create", { p: { ...o, clientId: clientId() } });
export const getOrder = (ref: string, contact: string) => rpc<Order>("cm_order_get", { r: ref, contact });
/** Test mode only (CMS → Shop → Payment mode = test): completes the payment without money changing hands. */
export const demoPay = (ref: string, contact: string) => rpc<Order>("cm_order_demo_pay", { r: ref, contact });
export const adminOrders = () => rpc<Order[]>("cm_admin_orders");
export const adminUpdateOrder = (id: string, status: string | null, pay: string | null, note: string | null) =>
  rpc<Order>("cm_admin_order_update", { oid: id, st: status, pay, note });

/** Ask the server to confirm a card / Mobile Money payment with Paystack or Flutterwave. */
export async function verifyPayment(body: { ref: string; provider: "paystack" | "flutterwave"; reference?: string; transactionId?: string | number }) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/cm-pay-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify(body),
  });
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; order?: Order; error?: string };
  if (!r.ok) throw new Error(j.error === "not_configured" ? "Online payments aren't switched on yet — the ministry will contact you." : j.error || "Payment could not be confirmed");
  return j.order as Order;
}
