"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlockDoc } from "@/lib/cms/types";
import { Container } from "@/components/site/Container";
import { RichText } from "@/components/ui/RichText";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { Eyebrow } from "@/components/ui/Reveal";
import { Socials } from "@/components/blocks/Socials";
import { parts } from "@/lib/site";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  white: "bg-white text-ink",
  paper: "bg-paper text-ink",
  brand: "bg-blueBrand-600 text-white",
  dark: "bg-ink text-white",
  sun: "bg-sun text-ink",
};
const dark = (b?: string) => b === "brand" || b === "dark";
const BTN: Record<string, string> = { primary: "btn-primary", ghost: "btn-ghost", dark: "btn-dark", sun: "btn-sun" };

function isSafe(url: string) {
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url.trim());
}

/** Turns a share link into an embeddable URL (maps, social posts, forms…); null if it can't be embedded safely. */
export function embedSrc(raw: string): { src: string; ratio: string } | null {
  const url = raw.trim();
  if (!/^https:\/\//i.test(url)) return null;
  let m: RegExpMatchArray | null;
  if ((m = url.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/))) return { src: `https://www.instagram.com/${m[1]}/${m[2]}/embed`, ratio: "aspect-[4/5]" };
  if ((m = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/))) return { src: `https://www.tiktok.com/embed/v2/${m[1]}`, ratio: "aspect-[9/16] max-w-sm mx-auto" };
  if (/facebook\.com\//.test(url) && !/plugins/.test(url))
    return { src: `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(url)}&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true`, ratio: "h-[600px] max-w-[500px] mx-auto" };
  if (/google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/.test(url))
    return { src: /output=embed|\/embed/.test(url) ? url : `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`, ratio: "aspect-[16/9]" };
  if (/docs\.google\.com\/forms/.test(url)) return { src: url.includes("embedded=true") ? url : url.replace(/\/viewform.*$/, "/viewform?embedded=true"), ratio: "h-[760px]" };
  if ((m = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/(\w+)/))) return { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, ratio: "h-[352px]" };
  return { src: url, ratio: "aspect-[16/9]" };
}

function Buttons({ list, onDark, center }: { list: string[]; onDark: boolean; center?: boolean }) {
  const btns = list.map(parts).filter(([l, u]) => l && u && isSafe(u));
  if (!btns.length) return null;
  return (
    <div className={cn("mt-6 flex flex-wrap gap-3", center && "justify-center")}>
      {btns.map(([label, url, style], i) => {
        const cls = cn("btn", BTN[style] ?? (i === 0 ? (onDark ? "btn-sun" : "btn-primary") : onDark ? "bg-white/10 text-white ring-1 ring-white/25" : "btn-ghost"));
        const ext = /^https?:/i.test(url);
        return ext ? (
          <a key={label + i} href={url} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
        ) : (
          <Link key={label + i} href={url} className={cls}>{label}{i === 0 ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}</Link>
        );
      })}
    </div>
  );
}

function Head({ b, onDark, center }: { b: BlockDoc; onDark: boolean; center: boolean }) {
  return (
    <div className={cn(center && "mx-auto max-w-2xl text-center")}>
      {b.eyebrow ? <Eyebrow tone={onDark ? "white" : "blue"}>{b.eyebrow}</Eyebrow> : null}
      {b.heading ? <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-5xl text-balance">{b.heading}</h2> : null}
      {b.body ? <RichText text={b.body} className={cn("mt-4 text-lg leading-8", onDark ? "text-white/85 [&_a]:!text-white" : "text-ink/70", "[&_p+p]:mt-4")} /> : null}
    </div>
  );
}

/** Renders one CMS block. Used by page layouts and custom pages. */
export function ContentBlock({ b }: { b: BlockDoc }) {
  const onDark = dark(b.background);
  const center = b.align === "center";
  const tone = BG[b.background ?? "white"] ?? BG.white;
  const pad = "py-14 sm:py-20";

  if (b.type === "spacer") return <div aria-hidden className="h-12 sm:h-20" />;

  if (b.type === "cta") {
    return (
      <Container className="mt-16">
        <section className={cn("relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16", tone)} data-block={b.id}>
          {b.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(b.image, 1600, 800)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            </>
          ) : (
            <span aria-hidden className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
          )}
          <div className="relative">
            <Head b={b} onDark={onDark} center={center} />
            <Buttons list={b.buttons ?? []} onDark={onDark} center={center} />
          </div>
        </section>
      </Container>
    );
  }

  const inner = (() => {
    switch (b.type) {
      case "imageText":
        return (
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className={cn(b.imageSide === "left" && "lg:order-2")}>
              <Head b={b} onDark={onDark} center={false} />
              <Buttons list={b.buttons ?? []} onDark={onDark} />
            </div>
            {b.image ? (
              <div className={cn("overflow-hidden rounded-[2rem] shadow-card", b.imageSide === "left" && "lg:order-1")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sized(b.image, 1100, 850)} alt={b.heading ?? ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </div>
            ) : null}
          </div>
        );
      case "cards": {
        const cards = (b.items ?? []).map(parts).filter(([t]) => t);
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            <ul className={cn("mt-8 grid gap-4 sm:grid-cols-2", cards.length >= 3 && "lg:grid-cols-3", cards.length === 4 && "lg:grid-cols-4")}>
              {cards.map(([title, text, img, link], i) => {
                const body = (
                  <>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sized(img, 600, 420)} alt="" className="aspect-[16/11] w-full object-cover" loading="lazy" />
                    ) : null}
                    <span className="block p-5">
                      <span className="block font-display text-xl font-extrabold">{title}</span>
                      {text ? <span className="mt-2 block text-sm leading-6 text-ink/65">{text}</span> : null}
                      {link ? <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-blueBrand-700">Learn more <ArrowRight className="h-4 w-4" aria-hidden /></span> : null}
                    </span>
                  </>
                );
                return (
                  <li key={title + i} className="card overflow-hidden text-left text-ink">
                    {link && isSafe(link) ? <a href={link} className="block h-full transition hover:-translate-y-0.5">{body}</a> : body}
                  </li>
                );
              })}
            </ul>
            <Buttons list={b.buttons ?? []} onDark={onDark} center={center} />
          </>
        );
      }
      case "video":
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            {b.videoUrl ? <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-[1.6rem]"><VideoEmbed url={b.videoUrl} title={b.heading || "Video"} /></div> : null}
            <Buttons list={b.buttons ?? []} onDark={onDark} center={center} />
          </>
        );
      case "embed": {
        const e = embedSrc(b.embedUrl ?? "");
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            {e ? (
              <div className={cn("mt-8 w-full overflow-hidden rounded-[1.6rem] bg-white ring-1 ring-ink/10", e.ratio)}>
                <iframe src={e.src} title={b.heading || b.title} loading="lazy" className="h-full w-full" allow="encrypted-media; picture-in-picture; clipboard-write" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            ) : null}
          </>
        );
      }
      case "gallery": {
        const imgs = (b.images ?? []).filter(Boolean);
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {imgs.map((src, i) => (
                <li key={src + i} className="overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sized(src, 600, 600)} alt="" loading="lazy" className="aspect-square w-full object-cover transition duration-500 hover:scale-105" />
                </li>
              ))}
            </ul>
          </>
        );
      }
      case "social":
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            <div className="mt-8 text-ink"><Socials /></div>
          </>
        );
      case "buttons":
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            <Buttons list={b.buttons ?? []} onDark={onDark} center={center} />
          </>
        );
      default:
        return (
          <>
            <Head b={b} onDark={onDark} center={center} />
            <Buttons list={b.buttons ?? []} onDark={onDark} center={center} />
          </>
        );
    }
  })();

  const full = b.background && b.background !== "white";
  return (
    <section data-block={b.id} className={cn(full ? cn(tone, pad, "mt-16") : "mt-16")}>
      <Container>{inner}</Container>
    </section>
  );
}
