"use client";

import { ArrowUpRight } from "lucide-react";
import { socialIcon } from "@/components/site/Social";
import { parts, useSettings } from "@/lib/site";

export function Socials() {
  const s = useSettings();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {s.socials.map(parts).map(([network, handle, cta, url]) => {
        const [Icon, color] = socialIcon(network);
        return (
          <li key={network}>
            <a href={url} target="_blank" rel="noreferrer" className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ background: color }}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold">{network}</span>
                <span className="block truncate text-sm text-ink/55">{handle}</span>
              </span>
              <span className="hidden items-center gap-1 text-sm font-bold text-blueBrand-700 sm:flex">
                {cta} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
