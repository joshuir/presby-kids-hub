import type { Metadata } from "next";
import { GalleryPage } from "@/components/pages/GalleryPage";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from Children's Harvest, Parents Day, graduation, Palm Sunday, outreach, excursions and camp.",
};

export default function Page() {
  return <GalleryPage />;
}
