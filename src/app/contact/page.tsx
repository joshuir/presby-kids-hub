import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit Presbyterian Children's Ministry at the Presbyterian Church, Accra. Call, WhatsApp or email us, or send a message to our children's ministry team.",
};

export default function Page() {
  return <ContactPage />;
}
