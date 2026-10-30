import { Fragment } from "react";

/**
 * Tiny, safe formatter for CMS text (no HTML is ever injected):
 * blank line = new paragraph, "## " = heading, "- " = bullet, **bold**.
 */
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (m && SAFE_URL.test(m[2])) {
      const ext = /^https?:/i.test(m[2]);
      return <a key={i} href={m[2]} className="font-bold text-blueBrand-700 underline underline-offset-4" {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{m[1]}</a>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text, className = "prose-kids" }: { text: string; className?: string }) {
  const blocks = (text || "").replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter((l) => l.trim());
        if (!lines.length) return null;
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>)}</ul>;
        }
        if (lines[0].startsWith("## ")) {
          return (
            <Fragment key={i}>
              <h2>{inline(lines[0].slice(3))}</h2>
              {lines.length > 1 ? (
                lines.slice(1).every((l) => /^\s*[-*]\s+/.test(l)) ? (
                  <ul>{lines.slice(1).map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>)}</ul>
                ) : (
                  <p>{inline(lines.slice(1).join(" "))}</p>
                )
              ) : null}
            </Fragment>
          );
        }
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
