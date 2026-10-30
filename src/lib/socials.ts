/**
 * Social media accounts, managed in CMS → Social media and stored in settings.socials as
 * "Network|Handle|Button text|Link". Every place on the site reads them through `cleanSocials`,
 * so each account always gets its own icon and a working, safe link (or is left out).
 */

export type SocialNetwork = { name: string; key: string; cta: string; placeholder: string; handleHint: string; home: string; profile?: (h: string) => string };

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { name: "WhatsApp", key: "whatsapp", cta: "Chat with us", placeholder: "+233 20 000 0000 or https://whatsapp.com/channel/…", handleHint: "Parents' channel", home: "whatsapp.com" },
  { name: "Facebook", key: "facebook", cta: "Like our page", placeholder: "https://facebook.com/yourpage", handleHint: "@yourpage", home: "facebook.com", profile: (h) => `https://www.facebook.com/${h}` },
  { name: "Instagram", key: "instagram", cta: "Follow", placeholder: "https://instagram.com/yourname", handleHint: "@yourname", home: "instagram.com", profile: (h) => `https://www.instagram.com/${h}/` },
  { name: "YouTube", key: "youtube", cta: "Subscribe", placeholder: "https://youtube.com/@yourchannel", handleHint: "Channel name", home: "youtube.com", profile: (h) => `https://www.youtube.com/@${h}` },
  { name: "TikTok", key: "tiktok", cta: "Follow", placeholder: "https://tiktok.com/@yourname", handleHint: "@yourname", home: "tiktok.com", profile: (h) => `https://www.tiktok.com/@${h}` },
  { name: "X", key: "x", cta: "Follow", placeholder: "https://x.com/yourname", handleHint: "@yourname", home: "x.com", profile: (h) => `https://x.com/${h}` },
  { name: "LinkedIn", key: "linkedin", cta: "Connect", placeholder: "https://linkedin.com/company/…", handleHint: "Company name", home: "linkedin.com" },
  { name: "Threads", key: "threads", cta: "Follow", placeholder: "https://threads.net/@yourname", handleHint: "@yourname", home: "threads.net", profile: (h) => `https://www.threads.net/@${h}` },
  { name: "Telegram", key: "telegram", cta: "Join", placeholder: "https://t.me/yourchannel", handleHint: "@yourchannel", home: "t.me", profile: (h) => `https://t.me/${h}` },
  { name: "Spotify", key: "spotify", cta: "Listen", placeholder: "https://open.spotify.com/…", handleHint: "Playlist or podcast", home: "spotify.com" },
  { name: "Email", key: "email", cta: "Email us", placeholder: "children@yourchurch.org", handleHint: "Email address", home: "" },
  { name: "Website", key: "website", cta: "Visit", placeholder: "https://…", handleHint: "Site name", home: "" },
];

const ALIAS: Record<string, string> = { twitter: "x", "x (twitter)": "x", fb: "facebook", ig: "instagram", yt: "youtube", wa: "whatsapp", "e-mail": "email", mail: "email", web: "website", link: "website", other: "website" };

export function networkKey(name: string) {
  const k = (name ?? "").trim().toLowerCase();
  return ALIAS[k] ?? k;
}

export function networkInfo(name: string): SocialNetwork {
  const k = networkKey(name);
  return SOCIAL_NETWORKS.find((n) => n.key === k) ?? { name: name || "Link", key: k || "website", cta: "Visit", placeholder: "https://…", handleHint: "", home: "" };
}

/**
 * Turns what an admin typed into a working link, or null if it can't be one.
 * Accepts full links, "facebook.com/page", "@handle" (for networks with profile pages),
 * phone numbers for WhatsApp and plain email addresses. Only https, mailto and tel are allowed.
 */
export function socialUrl(network: string, raw: string): string | null {
  let v = (raw ?? "").trim();
  if (!v) return null;
  const info = networkInfo(network);
  if (info.key === "whatsapp" && /^\+?[\d\s()-]{7,}$/.test(v)) return `https://wa.me/${v.replace(/\D/g, "")}`;
  if (/^mailto:/i.test(v)) return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v) ? v : null;
  if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(v)) return `mailto:${v}`;
  if (/^tel:\+?[\d]{6,}$/i.test(v)) return v;
  if (/^@?[\w.]+$/.test(v) && !v.includes(".") && info.profile) return info.profile(v.replace(/^@/, ""));
  if (/^@[\w.]+$/.test(v) && info.profile) return info.profile(v.slice(1));
  if (/^http:\/\//i.test(v)) v = "https://" + v.slice(7);
  if (!/^[a-z][a-z\d+.-]*:/i.test(v)) {
    if (/^(www\.)?[a-z\d-]+(\.[a-z\d-]+)+(\/\S*)?$/i.test(v)) v = "https://" + v;
    else return null;
  }
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" || !u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** True when a link goes to the network's front page rather than to a real account. */
export function isGenericLink(network: string, url: string | null) {
  if (!url) return false;
  const info = networkInfo(network);
  if (!info.home) return false;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").endsWith(info.home) && (u.pathname === "/" || u.pathname === "") && !u.search;
  } catch {
    return false;
  }
}

export type Social = { network: string; key: string; handle: string; cta: string; url: string; external: boolean };

/** Saved rows → accounts ready to display. Rows without a usable link are left out (never a dead icon). */
export function cleanSocials(rows: string[] | undefined | null): Social[] {
  return (rows ?? [])
    .map((r) => String(r ?? "").split("|").map((x) => x.trim()))
    .map(([network = "", handle = "", cta = "", link = ""]) => {
      const info = networkInfo(network);
      const url = socialUrl(network, link);
      if (!network || !url) return null;
      return { network: info.key === networkKey(network) && SOCIAL_NETWORKS.some((n) => n.key === info.key) ? info.name : network, key: info.key, handle, cta: cta || info.cta, url, external: url.startsWith("https:") };
    })
    .filter((x): x is Social => !!x);
}
