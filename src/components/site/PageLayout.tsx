"use client";

import { Fragment, type ReactNode } from "react";
import { useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { resolveLayout } from "@/lib/layout";
import { ContentBlock } from "@/components/blocks/ContentBlock";

/**
 * Renders a page's sections in the order (and visibility) set in CMS → Page layouts,
 * including any custom blocks the admin has placed between them.
 */
export function PageLayout({ page, sections }: { page: string; sections: Record<string, ReactNode> }) {
  const s = useSettings();
  const blocks = useContent("blocks");
  const order = resolveLayout(page, s.layouts?.[page]);
  return (
    <>
      {order.map((item) => {
        if (item.hidden) return null;
        if (item.id.startsWith("block:")) {
          const b = blocks?.find((x) => x.id === item.id.slice(6));
          return b ? <ContentBlock key={item.id} b={b} /> : null;
        }
        return <Fragment key={item.id}>{sections[item.id] ?? null}</Fragment>;
      })}
    </>
  );
}
