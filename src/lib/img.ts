/**
 * Starter photography (free Unsplash licence — hotlinked from Unsplash's CDN as their guidelines ask).
 * Every image is only a placeholder default: staff replace them with the church's own photos in the CMS.
 */
const U = "https://images.unsplash.com/";

export function unsplash(id: string, w = 1200, h?: number, faces = false) {
  const p = new URLSearchParams({ w: String(w), q: "75", auto: "format", fit: "crop" });
  if (h) p.set("h", String(h));
  if (faces) p.set("crop", "faces");
  return `${U}${id}?${p}`;
}

/** Resize any Unsplash/Supabase URL for a given display width (other URLs pass through). */
export function sized(url: string, w: number, h?: number) {
  if (!url) return url;
  if (url.startsWith(U)) {
    try {
      const u = new URL(url);
      u.searchParams.set("w", String(w));
      if (h) u.searchParams.set("h", String(h));
      else u.searchParams.delete("h");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("auto", "format");
      if (!u.searchParams.get("q")) u.searchParams.set("q", "75");
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

export const KIDS = {
  groupClose: "photo-1509099836639-18ba1795216d",
  boysBrown: "flagged/photo-1555251255-e9a095d6eb9d",
  window: "photo-1521493959102-bdd6677fdd81",
  windowSill: "photo-1507427100689-2bf8574e32d4",
  boyCrowd: "photo-1543689604-6fe8dbcd1f59",
  fiveBoys: "photo-1571417800906-5a5058dbd45d",
  boySmile: "photo-1695131494999-7961f82afda1",
  girlCross: "photo-1631954977603-3dd385a2cf7c",
  classroom: "photo-1627423896085-e3e694d88e40",
  boysOutdoor: "photo-1548102268-3d7dc56b01e1",
  boysGreen: "photo-1544476671-267ad5717d8e",
  girlSmile: "photo-1719667947229-594a8fdddade",
  group: "photo-1642420290986-c7a55bab708f",
  girlUniform: "photo-1617056239820-8ce90ba48193",
  twins: "photo-1548102245-c79dbcfa9f92",
  kidsSmiling: "photo-1509099927777-1b8a87bc3b21",
  girlLaugh: "photo-1509099863731-ef4bff19e808",
  boysExcited: "photo-1547496613-4e19af6736dc",
  boyGrin: "photo-1547496614-d145e2fa88ed",
  toddler: "photo-1596369229153-67fab7097a1e",
  boyOrange: "photo-1524582046670-ba4dbe52ede2",
  girlYellow: "photo-1617057119499-aea7d3eaef02",
} as const;

export const PORTRAITS: Record<string, string> = {
  "abena-owusu": "photo-1668752515680-075bf648d8fa",
  "kwame-mensah": "photo-1659422440915-d516c6dc932e",
  "esi-boateng": "photo-1764265150663-e58dcfc03252",
  "daniel-asante": "photo-1522529599102-193c0d76b5b6",
  "grace-adjei": "photo-1784160053771-4e16aeeceaba",
  "samuel-ofori": "photo-1783012039560-5690190a9b9b",
  "akosua-darko": "photo-1761168026167-2309a979e1c8",
  "yaw-amponsah": "photo-1757683435646-4952c9daeba5",
};

export const kid = (k: keyof typeof KIDS, w = 1200, h?: number) => unsplash(KIDS[k], w, h, true);
