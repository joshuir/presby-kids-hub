"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/cn";
import { Dropdown } from "@/components/ui/Dropdown";

export function Faqs({ askHref = "/contact/#form-title" }: { askHref?: string }) {
  const faqs = useContent("faqs") ?? [];
  const cats = ["All questions", ...Array.from(new Set(faqs.map((f) => f.category)))];
  const [cat, setCat] = useState("All questions");
  const [open, setOpen] = useState<string | null>(null);
  const list = faqs.filter((f) => cat === "All questions" || f.category === cat).sort((a, b) => cats.indexOf(a.category) - cats.indexOf(b.category));
  return (
    <div>
      <Dropdown
        label="Topic"
        hideLabel
        testId="faq-topic"
        className="w-full sm:w-72"
        value={cat}
        onChange={(c) => { setCat(c); setOpen(null); }}
        options={cats.map((c) => ({ value: c, label: c, count: c === "All questions" ? faqs.length : faqs.filter((f) => f.category === c).length }))}
      />
      <ul className="mt-5 grid gap-3">
        {list.map((f, i) => {
          const isOpen = open === f.id;
          const head = cat === "All questions" && f.category && f.category !== list[i - 1]?.category ? f.category : null;
          return (
            <Fragment key={f.id}>
            {head ? <li role="presentation" className={cn("px-1 text-xs font-extrabold uppercase tracking-wider text-ink/50", i > 0 && "mt-4")}>{head}</li> : null}
            <li className="card overflow-hidden">
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
            </Fragment>
          );
        })}
      </ul>
      {askHref ? <Link href={askHref} className="btn btn-dark mt-6">Ask us anything</Link> : null}
    </div>
  );
}
