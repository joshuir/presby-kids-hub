"use client";

import { useSyncExternalStore } from "react";

/** One line in the shopping bag. Prices here are for display only — the server re-prices every order. */
export type CartItem = {
  productId: string;
  name: string;
  colour: string;
  hex: string;
  size: string;
  qty: number;
  price: number;
  currency: string;
  image?: string;
};

const KEY = "cm-cart-v2";
const MAX_QTY = 10;
let items: CartItem[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    items = Array.isArray(raw) ? raw.filter((x) => x && x.productId && x.size && x.qty > 0) : [];
  } catch {
    items = [];
  }
  // keep in sync when the bag changes in another tab
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    emit();
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function save(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  emit();
}

const same = (a: CartItem, b: { productId: string; colour: string; size: string }) => a.productId === b.productId && a.colour === b.colour && a.size === b.size;

export const cart = {
  get: () => {
    load();
    return items;
  },
  /** adds (or tops up) a line; `max` caps the line at the stock available */
  add(it: CartItem, max = MAX_QTY) {
    load();
    const i = items.findIndex((x) => same(x, it));
    if (i >= 0) {
      const n = [...items];
      n[i] = { ...n[i], qty: Math.min(max, MAX_QTY, n[i].qty + it.qty) };
      save(n);
    } else save([...items, { ...it, qty: Math.min(max, MAX_QTY, it.qty) }]);
  },
  setQty(k: number, q: number, max = MAX_QTY) {
    load();
    save(items.map((x, i) => (i === k ? { ...x, qty: Math.max(1, Math.min(max, MAX_QTY, q)) } : x)));
  },
  remove(k: number) {
    load();
    save(items.filter((_, i) => i !== k));
  },
  clear() {
    save([]);
  },
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const EMPTY: CartItem[] = [];

/** React hook: the live bag (empty during server render / first paint). */
export function useCart() {
  const list = useSyncExternalStore(cart.subscribe, cart.get, () => EMPTY);
  const count = list.reduce((s, x) => s + x.qty, 0);
  const subtotal = list.reduce((s, x) => s + x.price * x.qty, 0);
  return { items: list, count, subtotal, currency: list[0]?.currency ?? "GHS" };
}

export function formatMoney(amount: number, currency = "GHS") {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Opens the bag drawer from anywhere (header icon, product page). */
export const openBag = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cm:open-bag"));
};
