import type { Metadata } from "next";
import { RegisterPage } from "@/components/register/RegisterPage";

export const metadata: Metadata = { title: "Register", description: "Register your child for a children’s service class." };

export default function Page() {
  return <RegisterPage />;
}
