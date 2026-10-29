import { cn } from "@/lib/cn";

/**
 * Renders text as words for the motion system (data-split / data-scrub-words).
 * `*word*` is highlighted with the blue squiggle used across the site.
 */
export function SplitWords({ text, className, mark = "squiggle", hero }: { text: string; className?: string; mark?: "squiggle" | "sun" | "none"; /** animate on load (page heroes) instead of on scroll */ hero?: boolean }) {
  // words with highlight flags; punctuation that touches a word (e.g. "*joy*.") stays attached to it
  const words: Array<{ t: string; hl: boolean; tail: string; last: boolean }> = [];
  (text || "").split(/(\*[^*]+\*)/g).filter(Boolean).forEach((tok) => {
    const hl = tok.startsWith("*") && tok.endsWith("*");
    const raw = hl ? tok.slice(1, -1) : tok;
    const glued = !hl && words.length > 0 && !/^\s/.test(raw);
    const parts = raw.split(/\s+/).filter(Boolean);
    parts.forEach((w, i) => {
      if (i === 0 && glued) words[words.length - 1].tail += w;
      else words.push({ t: w, hl, tail: "", last: hl && i === parts.length - 1 });
    });
  });
  const attr = hero ? { "data-hw": "" } : { "data-w": "" };
  return (
    <span className={className} aria-label={(text || "").replace(/\*/g, "")}>
      {words.map((w, k) => (
        <span key={k} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span {...attr} style={hero ? ({ "--i": k } as React.CSSProperties) : undefined} className="inline-block pr-[0.24em]">
            <span
              className={cn(
                w.hl && mark === "squiggle" && "text-blueBrand-600",
                w.hl && mark === "sun" && "text-sun",
                w.last && mark === "squiggle" && "squiggle",
              )}
            >
              {w.t}
            </span>
            {w.tail}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Plain text with *highlight* support but no per-word spans. */
export function Highlighted({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {(text || "").split(/(\*[^*]+\*)/g).filter(Boolean).map((t, i) =>
        t.startsWith("*") && t.endsWith("*") ? <span key={i} className="text-blueBrand-600">{t.slice(1, -1)}</span> : <span key={i}>{t}</span>,
      )}
    </span>
  );
}
