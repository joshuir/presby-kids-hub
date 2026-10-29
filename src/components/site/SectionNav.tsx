"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { isCurrent, sectionFor } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

/**
 * Breadcrumb + sibling pages for the current section, so related pages are one tap away
 * without crowding the main menu. `tone="dark"` sits on the blue page banner.
 */
export function SectionNav({ tone = "light", current: currentLabel, className }: { tone?: "light" | "dark"; current?: string; className?: string }) {
  const pathname = usePathname();
  const sec = sectionFor(pathname);
  if (!sec || sec.key === "home") return null;
  const page = sec.children?.find((c) => isCurrent(pathname, c.href) && !c.href.includes("#"));
  const dark = tone === "dark";
  const label = currentLabel ?? page?.label;
  const showTabs = (sec.children?.length ?? 0) > 1;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <nav aria-label="Breadcrumb">
        <ol className={cn("flex flex-wrap items-center gap-1 text-xs font-semibold", dark ? "text-white/70" : "text-black/50")}>
          <li>
            <Link href="/" className={cn("inline-flex items-center gap-1 rounded focus-ring", dark ? "hover:text-white" : "hover:text-navy-900")}>
              <Home className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
          <li aria-hidden><ChevronRight className="h-3.5 w-3.5 opacity-60" /></li>
          <li>
            {label && label !== sec.label ? (
              <Link href={sec.children?.[0]?.href ?? sec.href} className={cn("rounded focus-ring", dark ? "hover:text-white" : "hover:text-navy-900")}>{sec.label}</Link>
            ) : (
              <span aria-current="page" className={dark ? "text-white" : "text-navy-900"}>{sec.label}</span>
            )}
          </li>
          {label && label !== sec.label ? (
            <>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5 opacity-60" /></li>
              <li aria-current="page" className={cn("max-w-[60vw] truncate", dark ? "text-white" : "text-navy-900")}>{label}</li>
            </>
          ) : null}
        </ol>
      </nav>
      {showTabs ? (
        <nav aria-label={`${sec.label} pages`} className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <ul className="flex w-max gap-2">
            {sec.children!.map((c) => {
              const Icon = c.icon;
              const here = isCurrent(pathname, c.href) && !c.href.includes("#");
              return (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    aria-current={here ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition focus-ring sm:text-sm",
                      dark
                        ? here
                          ? "bg-white text-navy-900 shadow-soft"
                          : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
                        : here
                          ? "bg-navy-900 text-white"
                          : "bg-white text-navy-900 ring-1 ring-black/10 hover:bg-sky-soft",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

/** Slim bar version for pages without the blue banner (games, shop, classes). */
export function SectionBar({ className, current }: { className?: string; current?: string }) {
  return (
    <div className={cn("border-b border-black/5 bg-white/70 backdrop-blur", className)}>
      <Container className="py-3">
        <SectionNav current={current} />
      </Container>
    </div>
  );
}
