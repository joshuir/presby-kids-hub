"use client";

import { rpc, supa } from "@/lib/cms/client";

export type Child = {
  id: string;
  name: string;
  birthDate: string | null;
  classId: string | null;
  status: "pending" | "confirmed" | "declined";
  notes: string;
  playerId: string | null;
  game?: { xp: number; streak: number; achievements: string[]; storiesCompleted: string[] | number; mascot: string; mascotColor: string } | null;
};
export type ParentMe = { email: string; name: string; phone: string; whatsapp: string; children: Child[] };

export const parentMe = () => rpc<ParentMe>("kh_parent_me");
export const parentSave = (nm: string, ph: string, wa: string) => rpc("kh_parent_save", { nm, ph, wa });
export const childSave = (c: Partial<Child>) => rpc<string>("kh_child_save", { c });
export const childDelete = (cid: string) => rpc("kh_child_delete", { cid });
export const childLinkPlayer = (cid: string, pid: string) => rpc("kh_child_link_player", { cid, pid });

export async function currentUser() {
  const { data } = await supa().auth.getSession();
  return data.session?.user ?? null;
}

export function devicePlayer(): { id: string; name: string } | null {
  try {
    const raw = localStorage.getItem("kh_player_v1");
    return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
  } catch {
    return null;
  }
}

export function ageFrom(d: string | null) {
  if (!d) return "";
  const b = new Date(d);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a >= 0 ? `${a} yrs` : "";
}
