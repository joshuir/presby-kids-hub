"use client";

import { useState } from "react";
import { supa } from "@/lib/cms/client";
import { Field, PrimaryButton, inputCls } from "@/components/forms/Field";
import { cn } from "@/lib/cn";

/** Parent sign-in / sign-up / password reset (Supabase Auth). */
export function AuthForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const redirect = typeof window !== "undefined" ? `${location.origin}/account/` : undefined;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "in") {
        const { error } = await supa().auth.signInWithPassword({ email, password });
        if (error) throw error;
        onDone();
      } else if (mode === "up") {
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        const { data, error } = await supa().auth.signUp({ email, password, options: { emailRedirectTo: redirect, data: { name: fd.get("name") } } });
        if (error) throw error;
        if (data.session) onDone();
        else setMsg({ ok: true, text: "Check your email to confirm your account, then sign in." });
      } else {
        const { error } = await supa().auth.resetPasswordForEmail(email, { redirectTo: redirect });
        if (error) throw error;
        setMsg({ ok: true, text: "If that email has an account, a reset link is on its way." });
      }
    } catch (x) {
      setMsg({ ok: false, text: (x as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
      {mode !== "reset" ? (
        <div className="grid grid-cols-2 rounded-full bg-sky-soft p-1" role="tablist">
          {(["in", "up"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setMsg(null); }} className={cn("rounded-full py-2 text-sm font-bold transition", mode === m ? "bg-white text-navy-900 shadow-soft" : "text-navy-900/60")}>
              {m === "in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      ) : (
        <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">Reset your password</h2>
      )}
      <form onSubmit={submit} className="mt-6 grid gap-4">
        {mode === "up" ? <Field label="Your name"><input name="name" required className={inputCls} autoComplete="name" /></Field> : null}
        <Field label="Email"><input name="email" type="email" required className={inputCls} autoComplete="email" /></Field>
        {mode !== "reset" ? (
          <Field label="Password" hint={mode === "up" ? "At least 8 characters" : undefined}>
            <input name="password" type="password" required minLength={mode === "up" ? 8 : undefined} className={inputCls} autoComplete={mode === "up" ? "new-password" : "current-password"} />
          </Field>
        ) : null}
        {msg ? <div role="status" className={cn("rounded-2xl px-4 py-3 text-sm", msg.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800")}>{msg.text}</div> : null}
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}</PrimaryButton>
        <button type="button" className="text-sm font-semibold text-blueBrand-700" onClick={() => { setMode(mode === "reset" ? "in" : "reset"); setMsg(null); }}>
          {mode === "reset" ? "← Back to sign in" : "Forgot your password?"}
        </button>
      </form>
    </div>
  );
}
