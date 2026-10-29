"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitForm } from "@/lib/cms/client";

/**
 * Saves a public form (contact / registration / order request) to the database.
 * Admins read submissions in the CMS → Messages. Query-string values pre-fill matching fields.
 */
export function SupaForm({
  kind,
  className,
  children,
  successText,
}: {
  kind: "contact" | "register" | "order";
  className?: string;
  children: React.ReactNode;
  successText: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const sp = useSearchParams();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    sp.forEach((value, key) => {
      const el = f.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el && !el.value) el.value = value;
    });
  }, [sp]);

  if (state === "sent") {
    return (
      <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900 ring-1 ring-emerald-200" role="status">
        <div className="text-base font-bold">Thank you!</div>
        {successText}
      </div>
    );
  }

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (fd.get("website")) return; // spam trap
        const data: Record<string, string> = {};
        fd.forEach((v, k) => {
          if (k !== "website") data[k] = String(v).slice(0, 4000);
        });
        setState("sending");
        try {
          await submitForm(kind, data);
          setState("sent");
        } catch (x) {
          setErr((x as Error).message);
          setState("error");
        }
      }}
    >
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {children}
      {state === "error" ? <div className="text-sm text-red-700">Couldn’t send: {err}</div> : null}
      {state === "sending" ? <div className="text-sm text-black/50">Sending…</div> : null}
    </form>
  );
}
