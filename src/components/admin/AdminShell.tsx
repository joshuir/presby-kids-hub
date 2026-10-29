"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminGate";
import { cn } from "@/lib/cn";
import { Container } from "@/components/site/Container";

const nav = [
  { href: "/admin/", label: "Content manager (CMS)" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut, session } = useAdmin();
  const isCms = pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/admin/cms");
  const items = session?.role === "owner" ? nav : nav.filter((i) => i.href === "/admin/");
  return (
    <div className="bg-blueBrand-50/40">
      <div className="border-b border-black/5 bg-white">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-2xl px-2 py-1 text-sm font-semibold hover:bg-blueBrand-50 focus-ring"
            >
              ← Public site
            </Link>
            <span className="text-sm font-display">
              Admin Dashboard
            </span>
            {session ? (
              <span className="hidden rounded-full bg-blueBrand-50 px-3 py-1 text-xs font-semibold sm:inline">
                {session.role === "owner" ? "Main admin" : `${session.name} · Sub-admin`}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-2xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-blueBrand-50 focus-ring"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </Container>
      </div>

      <Container className={isCms ? "max-w-[1400px]! py-8" : "py-8"}>
        <div className={cn("grid gap-6", isCms ? "xl:grid-cols-[220px_1fr]" : "lg:grid-cols-[260px_1fr]")}>
          <aside className="rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5">
            <nav className="flex flex-col gap-1">
              {items.map((i) => {
                const active = pathname.replace(/\/$/, "") === i.href.replace(/\/$/, "") || (i.href === "/admin/" && isCms);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm font-semibold focus-ring",
                      active
                        ? "bg-blueBrand-600 text-white"
                        : "text-black/75 hover:bg-blueBrand-50 hover:text-ink-950"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {i.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section>
            {session?.role === "subadmin" && !isCms ? (
              <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
                This area is for the main admin. <Link href="/admin/" className="font-semibold text-blueBrand-700 underline">Go to the content manager</Link>.
              </div>
            ) : (
              children
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}

