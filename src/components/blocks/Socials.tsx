"use client";

import { ArrowUpRight } from "lucide-react";
import { SocialBadge } from "@/components/site/Social";
import { useSettings } from "@/lib/site";
import { cleanSocials } from "@/lib/socials";
import { cn } from "@/lib/cn";

/** Every social account as a clear, clickable card: real logo, name, handle and a visible button. */
export function Socials({ className }: { className?: string }) {
  const s = useSettings();
  const list = cleanSocials(s.socials);
  if (!list.length) return null;
  return (
    <ul data-reveal className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)} aria-label="Social media" data-socials>
      {list.map(({ network, key, handle, cta, url, external }, i) => (
        <li key={key + i} data-stagger>
          <a
            href={url}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            data-social={key}
            aria-label={`${network}${handle ? ` — ${handle}` : ""}: ${cta}${external ? " (opens in a new tab)" : ""}`}
            className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueBrand-500"
          >
            <SocialBadge network={key} size={52} className="shadow-[0_6px_14px_-6px_rgba(0,0,0,.35)] transition group-hover:scale-110" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-bold">{network}</span>
              {handle ? <span className="block truncate text-sm text-ink/65">{handle}</span> : null}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blueBrand-50 px-3 py-1.5 text-sm font-extrabold text-blueBrand-700 transition group-hover:bg-blueBrand-600 group-hover:text-white">
              {cta} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
