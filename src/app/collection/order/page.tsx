import type { Metadata } from "next";
import { OrderPage } from "@/components/shop/OrderPage";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function Page() {
  return <OrderPage />;
}
