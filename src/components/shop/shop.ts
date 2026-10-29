import type { ProductDoc, SiteSettingsDoc } from "@/lib/cms/types";

/** Everything checkout needs from CMS Settings → Shop & checkout, with sensible defaults. */
export function shopConfig(s: SiteSettingsDoc) {
  const lines = (v?: string[]) => (v ?? []).map((l) => l.split("|").map((x) => x.trim())).filter((x) => x[0]);
  const mode = s.paymentMode === "live" ? "live" : "test";
  const keyOk = (k?: string) => !!k && k.trim().length > 10;
  // a provider is offered when switched on and either has a key, or we're in test mode (demo payment)
  const providers: Array<"paystack" | "flutterwave" | "later"> = [];
  if (s.payPaystack !== "no" && (keyOk(s.paystackPublicKey) || mode === "test")) providers.push("paystack");
  if (s.payFlutterwave !== "no" && (keyOk(s.flutterwavePublicKey) || mode === "test")) providers.push("flutterwave");
  if (s.payLater !== "no") providers.push("later");
  return {
    currency: s.shopCurrency || "GHS",
    mode,
    providers,
    paystackKey: keyOk(s.paystackPublicKey) ? s.paystackPublicKey!.trim() : "",
    flutterwaveKey: keyOk(s.flutterwavePublicKey) ? s.flutterwavePublicKey!.trim() : "",
    delivery: s.shopDelivery !== "no",
    areas: lines(s.deliveryAreas).map(([name, fee]) => ({ name, fee: Number(String(fee ?? "").replace(/[^0-9.]/g, "")) || 0 })),
    freeOver: Number(s.freeDeliveryOver) || 0,
    points: lines(s.collectionPoints).map(([name]) => name),
    sizeGuide: lines(s.sizeGuide).map(([code, label, chest, length]) => ({ code, label: label || code, chest: chest || "", length: length || "" })),
    notice: s.shopNotice || "",
    returns: s.shopReturns || "",
  };
}

export const CATEGORY_LABEL: Record<string, string> = { tee: "T-shirts", hoodie: "Hoodies", longsleeve: "Long sleeves & sweats", other: "Caps & bags" };

export const stockOf = (p: ProductDoc, size: string) => Math.max(0, Number(p.stock?.[size] ?? 0));
export const totalStock = (p: ProductDoc) => p.sizes.reduce((s, z) => s + stockOf(p, z), 0);
export const onSale = (p: ProductDoc) => !!p.compareAtPrice && p.compareAtPrice > p.price;

export const PRICE_BANDS = [
  { id: "u100", label: "Under 100", test: (n: number) => n < 100 },
  { id: "100-200", label: "100 – 200", test: (n: number) => n >= 100 && n <= 200 },
  { id: "200-300", label: "200 – 300", test: (n: number) => n > 200 && n <= 300 },
  { id: "300+", label: "Over 300", test: (n: number) => n > 300 },
];

/** Loads a payment provider's checkout script once. */
export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Couldn't load the payment window — check your connection and try again."));
    document.head.appendChild(el);
  });
}
