"use client";

import { ArrowUpRight } from "lucide-react";
import { SocialBadge } from "@/components/site/Social";
import { parts, useSettings } from "@/lib/site";

export function Socials() {
  const s = useSettings();
  return (
    <ul data-reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {s.socials.map(parts).map(([network, handle, cta, url]) => (
        <li key={network} data-stagger>
          <a href={url} target="_blank" rel="noreferrer" data-tilt="5" className="card group flex items-center gap-4 p-4 transition">
            <SocialBadge network={network} size={52} className="shadow-[0_6px_14px_-6px_rgba(0,0,0,.35)] transition group-hover:scale-110" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-bold">{network}</span>
              <span className="block truncate text-sm text-ink/55">{handle}</span>
            </span>
            <span className="hidden items-center gap-1 text-sm font-bold text-blueBrand-700 sm:flex">
              {cta} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
