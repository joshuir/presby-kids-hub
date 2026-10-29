"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { rpc, supa, whoami, type WhoAmI } from "@/lib/cms/client";

export type AdminSession = {
  role: "owner" | "subadmin";
  id: string;
  name: string;
  username: string; // email
  permissions: string[];
};

const AdminCtx = createContext<{ signOut: () => Promise<void>; session: AdminSession | null }>({
  signOut: async () => {},
  session: null,
});
export const useAdmin = () => useContext(AdminCtx);

const input = "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm";

/**
 * CMS sign-in (Supabase Auth: email + password).
 *  - First time: create an account, confirm the email, then enter the one-time setup code
 *    to become the main admin.
 *  - Sub-admins: the main admin adds their email in the CMS; they create an account with
 *    that same email and can then edit only the sections they were given.
 */
export function AdminGate({ children }: { children: React.ReactNode; requiredRoles?: string[] }) {
  const [state, setState] = useState<"loading" | "out" | "in">("loading");
  const [who, setWho] = useState<WhoAmI | null>(null);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [recovery, setRecovery] = useState(false);

  const check = useCallback(async () => {
    try {
      const w = await whoami();
      setWho(w);
      setState(w ? "in" : "out");
    } catch (e) {
      setMsg({ text: (e as Error).message, tone: "err" });
      setState("out");
    }
  }, []);

  useEffect(() => {
    check();
    const { data } = supa().auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        setWho(null);
        setState("out");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [check]);

  const signOut = useCallback(async () => {
    await supa().auth.signOut();
    setWho(null);
    setState("out");
  }, []);

  const shell = (body: React.ReactNode) => (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-6">{body}</Card>
    </div>
  );

  if (state === "loading") return shell(<div>Checking sign-in…</div>);

  // Arrived from a "reset password" email
  if (recovery) {
    return shell(
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supa().auth.updateUser({ password });
          setBusy(false);
          if (error) return setMsg({ text: error.message, tone: "err" });
          setRecovery(false);
          setPassword("");
          setMsg({ text: "Password updated.", tone: "ok" });
          check();
        }}
      >
        <div className="font-display text-2xl">Choose a new password</div>
        <input className={input} type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" />
        {msg ? <Msg {...msg} /> : null}
        <Button type="submit" disabled={busy}>Save password</Button>
      </form>,
    );
  }

  if (state === "out") {
    return shell(
      <>
        <div className="font-display text-2xl">
          {mode === "signin" ? "Admin sign in" : mode === "signup" ? "Create your admin account" : "Reset your password"}
        </div>
        <p className="mt-2 text-sm text-black/70">
          {mode === "signup"
            ? "Use the email address the main admin added for you (or, for the very first setup, your own email)."
            : "Content manager for classes, lessons, games and the collection."}
        </p>
        <form
          className="mt-5 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg(null);
            setBusy(true);
            const auth = supa().auth;
            const redirect = `${window.location.origin}/admin/`;
            try {
              if (mode === "signin") {
                const { error } = await auth.signInWithPassword({ email, password });
                if (error) throw error;
                setPassword("");
                await check();
              } else if (mode === "signup") {
                const { data, error } = await auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
                if (error) throw error;
                if (data.session) await check();
                else {
                  setMsg({ text: `We’ve emailed a confirmation link to ${email}. Click it, then come back here and sign in.`, tone: "ok" });
                  setMode("signin");
                }
              } else {
                const { error } = await auth.resetPasswordForEmail(email, { redirectTo: redirect });
                if (error) throw error;
                setMsg({ text: "If that email has an account, a reset link is on its way.", tone: "ok" });
                setMode("signin");
              }
            } catch (x) {
              const m = (x as Error).message;
              setMsg({
                text: /confirm/i.test(m) ? "Please confirm your email first — check your inbox for the link." : /invalid login/i.test(m) ? "Incorrect email or password." : m,
                tone: "err",
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Email</span>
            <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          {mode !== "reset" ? (
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Password</span>
              <input
                className={input}
                type="password"
                required
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
          ) : null}
          {msg ? <Msg {...msg} /> : null}
          <div className="pt-1">
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </div>
        </form>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {mode !== "signin" ? <Link onClick={() => { setMode("signin"); setMsg(null); }}>Back to sign in</Link> : null}
          {mode !== "signup" ? <Link onClick={() => { setMode("signup"); setMsg(null); }}>Create an account</Link> : null}
          {mode !== "reset" ? <Link onClick={() => { setMode("reset"); setMsg(null); }}>Forgot password?</Link> : null}
        </div>
      </>,
    );
  }

  // Signed in, but not (yet) an admin
  if (who && !who.admin) {
    if (!who.ownerExists) {
      return shell(
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMsg(null);
            try {
              await rpc("kh_claim_owner", { code: code.trim(), display_name: name });
              await check();
            } catch (x) {
              setMsg({ text: (x as Error).message, tone: "err" });
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="font-display text-2xl">Set up the main admin</div>
          <p className="text-sm text-black/70">
            You’re signed in as <b>{who.email}</b>. Enter the one-time setup code to make this the main admin account.
          </p>
          <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className={input} placeholder="Setup code (KH-…)" value={code} onChange={(e) => setCode(e.target.value)} required autoComplete="off" />
          {msg ? <Msg {...msg} /> : null}
          <Button type="submit" disabled={busy}>Become main admin</Button>
          <button type="button" className="text-left text-sm underline" onClick={signOut}>Sign out</button>
        </form>,
      );
    }
    return shell(
      <>
        <div className="font-display text-2xl">No admin access yet</div>
        <p className="mt-2 text-sm text-black/70">
          You’re signed in as <b>{who.email}</b>, but this email hasn’t been given access (or access was turned off).
          Ask the main admin to add this exact email in <b>CMS → Sub-admins</b>, then reload this page.
        </p>
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={check}>Check again</Button>
          <Button type="button" variant="secondary" onClick={signOut}>Sign out</Button>
        </div>
      </>,
    );
  }

  const session: AdminSession | null =
    who && who.admin
      ? { role: who.role, id: who.email, name: who.name, username: who.email, permissions: who.permissions }
      : null;
  return <AdminCtx.Provider value={{ signOut, session }}>{children}</AdminCtx.Provider>;
}

function Msg({ text, tone }: { text: string; tone: "ok" | "err" }) {
  return <div className={tone === "ok" ? "rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900" : "text-sm text-red-700"}>{text}</div>;
}

function Link({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="font-semibold text-blueBrand-700 underline-offset-2 hover:underline">
      {children}
    </button>
  );
}
