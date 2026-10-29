"use client";

import { useId } from "react";
import type { Colorway, ProductDoc } from "@/lib/cms/types";

/**
 * Vector garment with real-looking fabric: the colour is applied as a base fill, then a
 * fabric-noise texture, fold shading and seams are layered on top — so changing colour
 * keeps the texture and the printed design intact.
 * The garment colour is read from the CSS variable --garment so GSAP can tween it.
 */

export const PATHS: Record<string, { body: string; extras: string[]; print: { x: number; y: number; w: number } }> = {
  tee: {
    body: "M150 40 C170 58 230 58 250 40 L330 70 L372 150 L322 176 L304 148 L304 430 C240 440 160 440 96 430 L96 148 L78 176 L28 150 L70 70 Z",
    extras: ["M150 40 C170 70 230 70 250 40", "M96 148 L78 176", "M304 148 L322 176"],
    print: { x: 200, y: 140, w: 170 },
  },
  longsleeve: {
    body: "M150 40 C170 58 230 58 250 40 L330 70 L382 300 L346 312 L304 160 L304 430 C240 440 160 440 96 430 L96 160 L54 312 L18 300 L70 70 Z",
    extras: ["M150 40 C170 70 230 70 250 40", "M382 300 L346 312", "M18 300 L54 312"],
    print: { x: 200, y: 145, w: 165 },
  },
  hoodie: {
    body: "M140 60 C150 20 250 20 260 60 L336 86 L384 300 L346 314 L306 170 L306 436 C240 448 160 448 94 436 L94 170 L54 314 L16 300 L64 86 Z",
    extras: [
      "M140 60 C150 112 250 112 260 60",
      "M150 70 C160 30 240 30 250 70",
      "M190 108 L186 170 M210 108 L214 170",
      "M128 330 L272 330 L292 410 L108 410 Z",
    ],
    print: { x: 200, y: 200, w: 160 },
  },
  other: {
    body: "M150 40 C170 58 230 58 250 40 L330 70 L372 150 L322 176 L304 148 L304 430 C240 440 160 440 96 430 L96 148 L78 176 L28 150 L70 70 Z",
    extras: [],
    print: { x: 200, y: 140, w: 170 },
  },
};

export function Garment({
  product,
  side,
  printHex,
  colorway,
  className,
}: {
  product: ProductDoc;
  side: "front" | "back";
  printHex: string;
  colorway?: Colorway;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const shape = PATHS[product.category] ?? PATHS.tee;
  const text = (side === "front" ? product.frontPrint : product.backPrint) || "";
  const lines = text.split("\n").filter(Boolean);
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const fs = Math.min(64, (shape.print.w / longest) * 1.75);
  const exact = side === "front" ? colorway?.frontImage : colorway?.backImage;
  const photo = side === "front" ? product.frontImage : product.backImage;

  if (exact) {
    // A real photo of this exact colour — shown as-is.
    return (
      <div className={className} style={{ position: "relative", aspectRatio: "4 / 5" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={exact} src={exact} alt={`${product.name} — ${colorway?.name} ${side}`} className="absolute inset-0 h-full w-full object-contain" />
      </div>
    );
  }

  if (photo) {
    // Real photo of a light garment on a transparent background, tinted live (texture preserved).
    return (
      <div className={className} style={{ position: "relative", aspectRatio: "4 / 5" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={`${product.name} ${side}`} className="absolute inset-0 h-full w-full object-contain" style={{ filter: "grayscale(1) contrast(1.05)" }} />
        <div
          className="absolute inset-0"
          style={{
            background: "var(--garment)",
            mixBlendMode: "multiply",
            WebkitMaskImage: `url(${photo})`,
            maskImage: `url(${photo})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>
    );
  }

  return (
    <svg viewBox="0 0 400 460" className={className} role="img" aria-label={`${product.name} — ${side}`}>
      <defs>
        <filter id={`fabric-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3" result="n" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.16" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".22" />
          <stop offset=".18" stopColor="#000" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".10" />
          <stop offset=".82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
        <linearGradient id={`drop-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          <path d={shape.body} />
        </clipPath>
        <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`ink-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.5 1.2" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* soft floor shadow */}
      <ellipse cx="200" cy="452" rx="130" ry="7" fill="#000" opacity=".08" />

      <g clipPath={`url(#clip-${uid})`}>
        <rect width="400" height="460" style={{ fill: "var(--garment)" }} />
        <rect width="400" height="460" filter={`url(#fabric-${uid})`} fill="#000" />
        <rect width="400" height="460" fill={`url(#shade-${uid})`} />
        <rect width="400" height="460" fill={`url(#drop-${uid})`} />
        {/* folds */}
        <g filter={`url(#soft-${uid})`}>
        <path d="M140 200 C150 260 140 330 150 430" stroke="#000" strokeOpacity=".16" strokeWidth="22" fill="none" />
        <path d="M262 190 C250 270 268 340 255 430" stroke="#000" strokeOpacity=".14" strokeWidth="20" fill="none" />
        <path d="M200 380 C220 400 240 410 290 420" stroke="#fff" strokeOpacity=".10" strokeWidth="10" fill="none" />
        </g>

        {/* print */}
        <g filter={`url(#ink-${uid})`} style={{ fill: printHex }}>
          {lines.map((l, i) => (
            <text
              key={i}
              x={shape.print.x}
              y={shape.print.y + i * fs * 0.92}
              textAnchor="middle"
              fontSize={fs}
              fontWeight={900}
              fontFamily="'Poppins', 'Arial Black', Impact, sans-serif"
              letterSpacing="-1"
            >
              {l}
            </text>
          ))}
        </g>
        {/* woven label on the hem */}
        <rect x="296" y="400" width="6" height="16" rx="1" fill="#111" opacity=".75" />
      </g>

      {/* seams */}
      <path d={shape.body} fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="1.5" />
      {shape.extras.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#000" strokeOpacity=".16" strokeWidth="2" strokeDasharray={i === 0 ? "" : "4 3"} />
      ))}
    </svg>
  );
}
