import { cn } from "@/lib/cn";

export function Button({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return <button {...p} className={cn("btn", variant === "primary" ? "btn-primary" : "btn-ghost", "disabled:opacity-50", className)} />;
}
