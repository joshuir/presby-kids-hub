import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition will-change-transform focus-visible:ring-2 focus-visible:ring-blueBrand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blueBrand-600 text-white shadow-soft hover:bg-blueBrand-700 active:scale-[0.99]",
  secondary:
    "bg-white text-ink-950 shadow-soft ring-1 ring-black/10 hover:bg-blueBrand-50 active:scale-[0.99]",
  ghost:
    "bg-transparent text-ink-950 hover:bg-blueBrand-50 ring-1 ring-transparent hover:ring-black/5",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

