import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-4xl bg-white shadow-soft ring-1 ring-black/5",
        className
      )}
    >
      {children}
    </div>
  );
}

