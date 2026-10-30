"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Container } from "@/components/site/Container";
import { submitForm } from "@/lib/cms/client";
import { useCopy, useSettings } from "@/lib/site";

export function Newsletter() {
  const s = useSettings();
  const t = useCopy();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  return (
    <Container className="mt-20">
      <div className="card grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{s.newsletterTitle}</h2>
          <p className="mt-2 text-ink/65">{s.newsletterText}</p>
        </div>
        {state === "done" ? (
          <p role="status" className="flex items-center gap-3 rounded-2xl bg-[#DCFCE7] p-4 font-bold text-[#15803D]">
            <MailCheck className="h-6 w-6" aria-hidden /> You&apos;re subscribed — thank you!
          </p>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              if (fd.get("website")) return;
              setState("busy");
              try {
                await submitForm("subscribe", { name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? "") });
                setState("done");
              } catch (x) {
                setErr((x as Error).message);
                setState("error");
              }
            }}
          >
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <div className="grid gap-3 sm:grid-cols-[1fr_1.3fr_auto]">
              <label className="sr-only" htmlFor="nl-name">Your name</label>
              <input id="nl-name" name="name" placeholder="Your name" autoComplete="name" className="h-12 rounded-full bg-paper px-5 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
              <label className="sr-only" htmlFor="nl-email">Email address</label>
              <input id="nl-email" name="email" type="email" required placeholder="Email address" autoComplete="email" className="h-12 rounded-full bg-paper px-5 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
              <button className="btn btn-primary" disabled={state === "busy"}>{state === "busy" ? "Subscribing…" : t("newsletter.button")}</button>
            </div>
            {state === "error" ? <p className="text-sm text-red-700">{err}</p> : null}
            <p className="text-xs text-ink/50">
              {t("newsletter.note")} <Link className="underline" href="/privacy/">Privacy</Link>
            </p>
          </form>
        )}
      </div>
    </Container>
  );
}
