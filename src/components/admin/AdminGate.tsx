"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { loginEmail, loginLabel, rpc, supa, whoami, type WhoAmI } from "@/lib/cms/client";

export type AdminSession = {
  role: "owner" | "subadmin";
  id: string;
  name: string;
  /** what they sign in with: a username for sub-admins, an email for the main admin */
  username: string;
  permissions: string[];
};

const AdminCtx = createContext<{ signOut: () => Promise<void>; session: AdminSession | null }>({
  signOut: async () => {},
  session: null,
});
export const useAdmin = () => useContext(AdminCtx);

const input = "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm";

/**
 * CMS sign-in.
 *  - Sub-admins: sign in with the username and password the main admin set for them
 *    (CMS → Sub-admins). No email or sign-up needed.
 *  - Main admin: signs in with their email. The very first time, they create an account,
 *    confirm the email and enter the one-time setup code.
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
  // accounts created with a temporary password must choose their own before using the CMS
  const [mustChange, setMustChange] = useState(false);

  const check = useCallback(async () => {
    try {
      const w = await whoami();
      const { data: u } = await supa().auth.getUser();
      setMustChange(Boolean(u.user?.user_metadata?.must_change_password));
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
          {mode === "signin" ? "Staff sign in" : mode === "signup" ? "Set up the main admin account" : "Reset your password"}
        </div>
        <p className="mt-2 text-sm text-black/70">
          {mode === "signup"
            ? "Only for the very first setup of the website. Sub-admins don’t need this — the main admin creates your username and password."
            : mode === "reset"
              ? "Main admin: enter your email for a reset link. Sub-admins: ask the main admin for a new password."
              : "Sign in with the username and password you were given (the main admin can use their email)."}
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
                const { error } = await auth.signInWithPassword({ email: loginEmail(email), password });
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
                if (!email.includes("@")) {
                  setMsg({ text: "Sub-admin passwords are reset by the main admin — ask them to set a new one for you in the CMS.", tone: "ok" });
                  return;
                }
                const { error } = await auth.resetPasswordForEmail(email, { redirectTo: redirect });
                if (error) throw error;
                setMsg({ text: "If that email has an account, a reset link is on its way.", tone: "ok" });
                setMode("signin");
              }
            } catch (x) {
              const m = (x as Error).message;
              setMsg({
                text: /banned/i.test(m)
                  ? "This account has been deactivated. Ask the main admin to switch it back on."
                  : /confirm/i.test(m)
                    ? "Please confirm your email first — check your inbox for the link."
                    : /invalid login|invalid.*(email|credentials)/i.test(m)
                      ? "Incorrect username or password."
                      : m,
                tone: "err",
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">{mode === "signup" ? "Email" : "Username"}</span>
            <input
              className={input}
              type={mode === "signup" ? "email" : "text"}
              name="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete={mode === "signup" ? "email" : "username"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={mode === "signup" ? "you@example.org" : mode === "reset" ? "Your email (main admin)" : "e.g. kofi.mensah"}
            />
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
          {mode !== "signup" ? <Link onClick={() => { setMode("signup"); setMsg(null); }}>First-time setup</Link> : null}
          {mode !== "reset" ? <Link onClick={() => { setMode("reset"); setMsg(null); }}>Forgot password?</Link> : null}
        </div>
      </>,
    );
  }

  // First sign-in with a temporary password: choose a new one before anything else
  if (who && mustChange) {
    return shell(
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 10) return setMsg({ text: "Use at least 10 characters.", tone: "err" });
          setBusy(true);
          const { error } = await supa().auth.updateUser({ password, data: { must_change_password: false } });
          setBusy(false);
          if (error) return setMsg({ text: error.message, tone: "err" });
          setPassword("");
          setMustChange(false);
          setMsg({ text: "Password updated — welcome!", tone: "ok" });
          check();
        }}
      >
        <div className="font-display text-2xl">Choose your own password</div>
        <p className="text-sm text-black/70">
          You signed in as <b>{loginLabel(who.email ?? "")}</b> with a temporary password. Pick a new one (10+ characters) to continue.
        </p>
        <input className={input} type="password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
        {msg ? <Msg {...msg} /> : null}
        <Button type="submit" disabled={busy}>Save and continue</Button>
        <button type="button" className="text-left text-sm underline" onClick={signOut}>Sign out</button>
      </form>,
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
          You’re signed in as <b>{loginLabel(who.email ?? "")}</b>, but this account doesn’t have access (or it was switched off).
          Ask the main admin to check your account in <b>CMS → Sub-admins</b>, then reload this page.
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
      ? { role: who.role, id: who.email, name: who.name, username: loginLabel(who.email), permissions: who.permissions }
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
