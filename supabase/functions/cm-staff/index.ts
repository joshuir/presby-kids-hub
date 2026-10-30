// Main admin only: create, edit, reset, deactivate and remove sub-admin logins.
// Sub-admins sign in with a username; behind the scenes each has a private, non-deliverable
// login address <username>@staff.cm.invalid so nothing is ever emailed to them.
import { createClient } from "jsr:@supabase/supabase-js@2";

const DOMAIN = "staff.cm.invalid";
const USER_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const fail = (m: string, status = 400) => json({ error: m }, status);
const BAN = "876000h"; // ~100 years

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authz = req.headers.get("Authorization") ?? "";
  if (!authz.startsWith("Bearer ")) return fail("Please sign in again.", 401);

  // the caller's own client: every database change still goes through the owner-only checks
  const me = createClient(url, anon, { global: { headers: { Authorization: authz } }, auth: { persistSession: false } });
  const { data: who, error: whoErr } = await me.rpc("kh_whoami");
  if (whoErr || !who?.admin || who.role !== "owner") return fail("Only the main admin can manage sub-admins.", 403);
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }).auth.admin;

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return fail("Bad request");
  }
  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const username = str("username").toLowerCase();
  const name = str("name").slice(0, 60);
  const password = typeof b.password === "string" ? (b.password as string) : "";
  const perms = Array.isArray(b.permissions) ? (b.permissions as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const mustChange = b.mustChange === true;
  const checkPw = () => (password && (password.length < 10 || password.length > 72) ? "Passwords need 10–72 characters." : "");
  const loginFor = (u: string) => `${u}@${DOMAIN}`;
  const uidOf = async (em: string) => {
    const { data, error } = await me.rpc("kh_staff_uid", { em });
    if (error) throw new Error(error.message);
    return (data as string | null) ?? null;
  };
  const save = async (em: string, disabled: boolean, oldEm?: string) => {
    const { error } = await me.rpc("kh_staff_save", { em, uname: username || null, nm: name, perms, is_disabled: disabled, old_em: oldEm ?? null });
    if (error) throw new Error(error.message);
  };
  const authMsg = (m: string) => (/already|registered|exists/i.test(m) ? "That username is already taken." : /password/i.test(m) ? "That password isn’t allowed — try a longer one." : m);

  try {
    switch (b.action) {
      case "create": {
        if (!USER_RE.test(username)) return fail("Usernames are 3–30 characters: letters, numbers, dots, dashes or underscores.");
        if (!name) return fail("Enter their name.");
        if (!password) return fail("Set a password for them.");
        if (checkPw()) return fail(checkPw());
        const email = loginFor(username);
        const { data, error } = await admin.createUser({ email, password, email_confirm: true, user_metadata: { username, name, must_change_password: mustChange, staff: true } });
        if (error) return fail(authMsg(error.message));
        try {
          await save(email, false);
        } catch (e) {
          await admin.deleteUser(data.user.id); // keep things consistent
          return fail((e as Error).message);
        }
        return json({ ok: true, email });
      }
      case "update": {
        const old = str("email").toLowerCase();
        if (!old) return fail("Missing account.");
        if (username && !USER_RE.test(username)) return fail("Usernames are 3–30 characters: letters, numbers, dots, dashes or underscores.");
        if (!name) return fail("Enter their name.");
        if (checkPw()) return fail(checkPw());
        const active = b.active !== false;
        const email = username ? loginFor(username) : old;
        let uid = await uidOf(old);
        if (!uid) {
          // an older sub-admin who never created a login: give them one now
          if (!password) return fail("This person has no login yet — set a password to create one.");
          const { data, error } = await admin.createUser({ email, password, email_confirm: true, user_metadata: { username, name, must_change_password: mustChange, staff: true }, ...(active ? {} : { ban_duration: BAN }) });
          if (error) return fail(authMsg(error.message));
          uid = data.user.id;
        } else {
          const attrs: Record<string, unknown> = { user_metadata: { username, name, staff: true, ...(password ? { must_change_password: mustChange } : {}) }, ban_duration: active ? "none" : BAN };
          if (email !== old) Object.assign(attrs, { email, email_confirm: true });
          if (password) attrs.password = password;
          const { error } = await admin.updateUserById(uid, attrs);
          if (error) return fail(authMsg(error.message));
        }
        try {
          await save(email, !active, old);
        } catch (e) {
          return fail((e as Error).message);
        }
        return json({ ok: true, email });
      }
      case "delete": {
        const em = str("email").toLowerCase();
        const uid = await uidOf(em);
        const { error } = await me.rpc("kh_admins_delete", { em });
        if (error) return fail(error.message);
        if (uid) await admin.deleteUser(uid);
        return json({ ok: true });
      }
      default:
        return fail("Unknown action");
    }
  } catch (e) {
    return fail((e as Error).message, 500);
  }
});
