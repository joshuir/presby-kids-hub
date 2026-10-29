import type { Metadata } from "next";
import { ShopLoader } from "@/components/shop/ShopLoader";

export const metadata: Metadata = {
  title: "Collection",
  description: "Presby Kids clothing — tees, hoodies and more in your favourite colours.",
};

export default function ShopPage() {
  return <ShopLoader />;
}
