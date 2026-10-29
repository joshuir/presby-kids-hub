import type { Metadata } from "next";
import { ShopLoader } from "@/components/shop/ShopLoader";

export const metadata: Metadata = {
  title: "Clothing Collection",
  description: "Children’s Ministry clothing — tees, hoodies and more in your favourite colours.",
};

export default function ShopPage() {
  return <ShopLoader />;
}
