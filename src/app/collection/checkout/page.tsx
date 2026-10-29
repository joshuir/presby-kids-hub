import type { Metadata } from "next";
import { CheckoutPage } from "@/components/shop/CheckoutPage";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function Page() {
  return <CheckoutPage />;
}
