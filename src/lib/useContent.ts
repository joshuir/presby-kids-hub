"use client";

import { useEffect, useState } from "react";
import { getPublic } from "@/lib/cms/client";
import type { CollectionName, DocFor } from "@/lib/cms/types";

type Col = Exclude<CollectionName, "leaderboard">;

/** Published items of a CMS collection, sorted by `order` when present. null while loading. */
export function useContent<C extends Col>(col: C): DocFor<C>[] | null {
  const [items, setItems] = useState<DocFor<C>[] | null>(null);
  useEffect(() => {
    let alive = true;
    getPublic(col)
      .then((d) => {
        if (!alive) return;
        const list = [...d];
        if (list.length && "order" in (list[0] as object)) list.sort((a, b) => Number((a as { order?: number }).order ?? 0) - Number((b as { order?: number }).order ?? 0));
        setItems(list);
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [col]);
  return items;
}
