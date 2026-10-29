"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Old sub-pages now live as sections of another page: forward visitors (keeping ?query) to the anchor. */
export function MovedTo({ path, hash, label }: { path: string; hash: string; label: string }) {
  const href = `${path}#${hash}`;
  useEffect(() => {
    location.replace(`${path}${location.search}#${hash}`);
  }, [path, hash]);
  return (
    <div className="grid min-h-[50dvh] place-items-center p-8 text-center">
      <p className="text-lg text-ink/70">
        This page has moved to <Link href={href} className="font-bold text-blueBrand-700 underline">{label}</Link>.
      </p>
    </div>
  );
}
