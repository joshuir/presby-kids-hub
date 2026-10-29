import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the children’s church team. Send a message, call, WhatsApp, see service times and get directions.",
};

export default function Page() {
  return <ContactPage />;
}
