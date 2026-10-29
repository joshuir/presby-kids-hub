import type { ClassDoc, LessonDoc } from "@/lib/cms/types";

/**
 * Generated lesson artwork (flyers, banners, story scenes) so every lesson has visuals out
 * of the box. Admins can replace any of these with uploaded pictures in the CMS.
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

type Motif = "garden" | "sea" | "mountain" | "scroll" | "crown" | "night" | "road" | "sunrise" | "prison" | "palm";

function motifFor(ref: string, title: string): Motif {
  const s = (ref + " " + title).toLowerCase();
  if (s.includes("genesis 22") || s.includes("exodus")) return "mountain";
  if (s.includes("genesis 2") || s.includes("garden")) return "garden";
  if (s.includes("jonah")) return "sea";
  if (s.includes("genesis 22") || s.includes("exodus")) return "mountain";
  if (s.includes("kings 22") || s.includes("chronicles")) return "scroll";
  if (s.includes("1 kings 2") || s.includes("judges")) return "crown";
  if (s.includes("john 3")) return "night";
  if (s.includes("luke 24:13") || s.includes("emmaus")) return "road";
  if (s.includes("luke 2") || s.includes("resurrection")) return "sunrise";
  if (s.includes("acts 16")) return "prison";
  if (s.includes("luke 19")) return "palm";
  return "sunrise";
}

function motifSvg(m: Motif, w: number, h: number, accent: string) {
  const g = h * 0.72;
  switch (m) {
    case "garden":
      return `<rect y="${g}" width="${w}" height="${h - g}" fill="#22C55E"/>
        <rect x="${w * 0.62}" y="${g - h * 0.28}" width="${w * 0.04}" height="${h * 0.3}" rx="6" fill="#92400E"/>
        <circle cx="${w * 0.64}" cy="${g - h * 0.32}" r="${h * 0.16}" fill="#16A34A"/>
        <circle cx="${w * 0.6}" cy="${g - h * 0.34}" r="${h * 0.025}" fill="#DC2626"/>
        <circle cx="${w * 0.68}" cy="${g - h * 0.28}" r="${h * 0.025}" fill="#DC2626"/>
        <circle cx="${w * 0.2}" cy="${g + 6}" r="${h * 0.05}" fill="#F472B6"/>`;
    case "sea":
      return `<rect y="${g}" width="${w}" height="${h - g}" fill="#0EA5E9"/>
        <path d="M0 ${g} q ${w / 16} -18 ${w / 8} 0 t ${w / 8} 0 t ${w / 8} 0 t ${w / 8} 0 t ${w / 8} 0 t ${w / 8} 0 t ${w / 8} 0 t ${w / 8} 0" fill="none" stroke="#E0F2FE" stroke-width="6"/>
        <ellipse cx="${w * 0.66}" cy="${g + (h - g) * 0.45}" rx="${w * 0.16}" ry="${(h - g) * 0.3}" fill="#1E3A8A"/>
        <circle cx="${w * 0.58}" cy="${g + (h - g) * 0.38}" r="6" fill="#fff"/>
        <path d="M${w * 0.82} ${g + (h - g) * 0.45} l ${w * 0.07} -30 v 60 z" fill="#1E3A8A"/>`;
    case "mountain":
      return `<path d="M0 ${h} L${w * 0.35} ${h * 0.3} L${w * 0.55} ${h * 0.6} L${w * 0.7} ${h * 0.42} L${w} ${h} Z" fill="#78716C"/>
        <path d="M${w * 0.29} ${h * 0.39} L${w * 0.35} ${h * 0.3} L${w * 0.41} ${h * 0.4} Z" fill="#fff"/>`;
    case "scroll":
      return `<rect x="${w * 0.55}" y="${h * 0.35}" width="${w * 0.32}" height="${h * 0.45}" rx="14" fill="#FEF3C7" stroke="#B45309" stroke-width="6"/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${w * 0.59}" y="${h * (0.43 + i * 0.065)}" width="${w * 0.24}" height="6" rx="3" fill="#D97706" opacity=".6"/>`).join("")}`;
    case "crown":
      return `<path d="M${w * 0.55} ${h * 0.7} L${w * 0.55} ${h * 0.42} L${w * 0.63} ${h * 0.54} L${w * 0.7} ${h * 0.36} L${w * 0.77} ${h * 0.54} L${w * 0.85} ${h * 0.42} L${w * 0.85} ${h * 0.7} Z" fill="#FACC15" stroke="#A16207" stroke-width="5"/>`;
    case "night":
      return `<rect width="${w}" height="${h}" fill="#1E1B4B" opacity=".55"/>
        <circle cx="${w * 0.8}" cy="${h * 0.28}" r="${h * 0.1}" fill="#FEF9C3"/>
        ${[0.1, 0.25, 0.45, 0.6, 0.92].map((x, i) => `<circle cx="${w * x}" cy="${h * (0.12 + (i % 3) * 0.1)}" r="3" fill="#fff"/>`).join("")}`;
    case "road":
      return `<rect y="${g}" width="${w}" height="${h - g}" fill="#A3E635"/>
        <path d="M${w * 0.45} ${h} Q ${w * 0.6} ${g + 20} ${w * 0.9} ${g}" stroke="#D6A15A" stroke-width="${h * 0.1}" fill="none"/>`;
    case "prison":
      return `<rect x="${w * 0.55}" y="${h * 0.3}" width="${w * 0.33}" height="${h * 0.5}" rx="12" fill="#57534E"/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${w * (0.58 + i * 0.06)}" y="${h * 0.3}" width="8" height="${h * 0.5}" fill="#D6D3D1"/>`).join("")}
        <path d="M${w * 0.62} ${h * 0.24} l 12 -20 l 12 20" stroke="#FACC15" stroke-width="5" fill="none"/>`;
    case "palm":
      return `<rect y="${g}" width="${w}" height="${h - g}" fill="#FCD34D"/>
        <rect x="${w * 0.72}" y="${h * 0.3}" width="14" height="${g - h * 0.3}" fill="#92400E"/>
        ${[-60, -20, 20, 60].map((a) => `<ellipse cx="${w * 0.72 + 7}" cy="${h * 0.3}" rx="${w * 0.09}" ry="14" fill="#15803D" transform="rotate(${a} ${w * 0.72 + 7} ${h * 0.3})"/>`).join("")}`;
    default:
      return `<circle cx="${w * 0.75}" cy="${g}" r="${h * 0.2}" fill="${accent}" opacity=".9"/>
        <rect y="${g}" width="${w}" height="${h - g}" fill="#FDE68A"/>`;
  }
}

export function lessonArt(
  kind: "flyer" | "banner" | "scene",
  lesson: Pick<LessonDoc, "title" | "bibleRef" | "lessonDate"> | null,
  cls: Pick<ClassDoc, "name" | "color"> | null,
  n = 1,
) {
  const title = lesson?.title ?? "Bible Lesson";
  const ref = lesson?.bibleRef ?? "";
  const accent = cls?.color ?? "#2563EB";
  const motif = motifFor(ref, title);
  let w = 1200, h = 500;
  if (kind === "flyer") { w = 800; h = 1000; }
  if (kind === "scene") { w = 1000; h = 700; }

  const sky = n === 2 ? ["#FDE68A", "#FB923C"] : ["#BAE6FD", "#EFF6FF"];
  const titleLines = wrap(title, kind === "flyer" ? 16 : 24);
  const fs = kind === "flyer" ? 64 : kind === "banner" ? 60 : 0;

  const text =
    kind === "scene"
      ? ""
      : `<g font-family="Arial Rounded MT Bold, Helvetica Neue, Helvetica, Arial, sans-serif" fill="#0B0F19">
          <rect x="${w * 0.06}" y="${h * 0.08}" rx="22" width="${Math.min(w * 0.5, 360)}" height="56" fill="${accent}"/>
          <text x="${w * 0.06 + 22}" y="${h * 0.08 + 38}" font-size="26" font-weight="800" fill="#fff">${esc(cls?.name ?? "Children’s Service")}</text>
          ${titleLines
            .map(
              (l, i) =>
                `<text x="${w * 0.06}" y="${h * 0.08 + 56 + fs * 1.15 * (i + 1)}" font-size="${fs}" font-weight="800">${esc(l)}</text>`,
            )
            .join("")}
          <text x="${w * 0.06}" y="${h * 0.08 + 56 + fs * 1.15 * titleLines.length + 52}" font-size="30" font-weight="700" fill="${accent}">${esc(ref)}</text>
          ${kind === "flyer" && lesson?.lessonDate ? `<text x="${w * 0.06}" y="${h * 0.93}" font-size="28" font-weight="700">Sunday ${esc(lesson.lessonDate)} • 9:00 AM</text>` : ""}
        </g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[0]}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    <circle cx="${w * 0.9}" cy="${h * 0.1}" r="${h * 0.22}" fill="${accent}" opacity=".18"/>
    ${motifSvg(motif, w, h, accent)}
    ${text}
  </svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** Resolves a stored image URL; empty or "art:..." values become generated artwork. */
export function resolveArt(
  url: string | undefined,
  kind: "flyer" | "banner" | "scene",
  lesson: Pick<LessonDoc, "title" | "bibleRef" | "lessonDate"> | null,
  cls: Pick<ClassDoc, "name" | "color"> | null,
) {
  if (!url) return lessonArt(kind, lesson, cls);
  const m = url.match(/^art:(flyer|banner|scene)(?::(\d+))?$/);
  if (m) return lessonArt(m[1] as "flyer", lesson, cls, Number(m[2] ?? 1));
  return url;
}
