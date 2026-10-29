"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/cn";

export function Faqs({ askHref = "/contact/#form-title" }: { askHref?: string }) {
  const faqs = useContent("faqs") ?? [];
  const cats = ["All questions", ...Array.from(new Set(faqs.map((f) => f.category)))];
  const [cat, setCat] = useState("All questions");
  const [open, setOpen] = useState<string | null>(null);
  const list = faqs.filter((f) => cat === "All questions" || f.category === cat);
  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Question topics">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition", cat === c ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink")}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-5 grid gap-3">
        {list.map((f) => {
          const isOpen = open === f.id;
          return (
            <li key={f.id} className="card overflow-hidden">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg font-bold sm:px-6"
                >
                  {f.question}
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition", isOpen ? "rotate-45 bg-blueBrand-600 text-white" : "bg-sky-soft text-blueBrand-700")}>
                    <Plus className="h-5 w-5" aria-hidden />
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <p className="px-5 pb-5 leading-7 text-ink/70 sm:px-6">{f.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {askHref ? <Link href={askHref} className="btn btn-dark mt-6">Ask us anything</Link> : null}
    </div>
  );
}
