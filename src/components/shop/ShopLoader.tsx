"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublic } from "@/lib/cms/client";
import type { ProductDoc } from "@/lib/cms/types";
import { CollectionShowcase } from "./CollectionShowcase";
import { LoadError, Loading } from "@/components/site/LoadState";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import { ShopGrid } from "./ShopGrid";

export function ShopLoader() {
  const [products, setProducts] = useState<ProductDoc[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const all = await getPublic("products");
      setProducts(all.filter((p) => p.colorways?.length).sort((a, b) => a.order - b.order));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (err) return <div className="p-8"><LoadError message={`Couldn’t load the collection. ${err}`} retry={load} /></div>;
  if (!products) return <div className="min-h-[70dvh] bg-[#EEEDE8]"><Loading label="Loading the collection…" /></div>;
  const ticker = ["New drops", "Accra", ...products.map((p) => p.name)].join(" • ").toUpperCase();

  return (
    <div className="-mt-[76px] bg-[#EEEDE8] pt-[76px]">
      <PageLayout
        page="collection"
        sections={{
          hero: <PageHero page="collection" eyebrow="Kids Zone · Clothing" title="Wear your *faith*" intro="Choose your colour and size, then request yours." />,
          shop: (
            <>
              <CollectionShowcase products={products} ticker={ticker} />
              <ShopGrid products={products} />
            </>
          ),
        }}
      />
    </div>
  );
}
