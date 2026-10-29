import { cn } from "@/lib/cn";

export const inputCls =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink-950 outline-none transition focus:border-blueBrand-500 focus:ring-4 focus:ring-blueBrand-100";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm", className)}>
      <span className="font-semibold text-navy-900">{label}</span>
      {children}
      {hint ? <span className="text-xs text-black/45">{hint}</span> : null}
    </label>
  );
}

export function PrimaryButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-blueBrand-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blueBrand-700 disabled:opacity-50",
        className,
      )}
    />
  );
}
