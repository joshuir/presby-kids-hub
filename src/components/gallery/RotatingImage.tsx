"use client";

import { useEffect, useState } from "react";
import { useMotionLevel } from "@/components/motion/MotionDirector";
import { useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";

/**
 * A photo slot that cross-fades through several images on its own (with a slow Ken Burns drift).
 * `offset` staggers neighbouring slots so a collage never changes all at once.
 */
export function RotatingImage({
  images,
  alt = "",
  className,
  offset = 0,
  width = 900,
  height,
  paused,
  intervalMs,
}: {
  images: string[];
  alt?: string;
  className?: string;
  offset?: number;
  width?: number;
  height?: number;
  paused?: boolean;
  intervalMs?: number;
}) {
  const s = useSettings();
  const level = useMotionLevel();
  const list = images.filter(Boolean);
  const [i, setI] = useState(offset % Math.max(1, list.length));
  const ms = intervalMs ?? Math.max(2, Number(s.galleryRotateSeconds) || 4) * 1000;

  useEffect(() => {
    if (list.length < 2 || paused || level === "off") return;
    let t: number;
    const start = window.setTimeout(() => {
      setI((x) => (x + 1) % list.length);
      t = window.setInterval(() => setI((x) => (x + 1) % list.length), ms);
    }, ms + (offset % 5) * 700);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(t);
    };
  }, [list.length, paused, level, ms, offset]);

  // preload the next photo so the fade is seamless
  useEffect(() => {
    if (list.length < 2) return;
    const im = new Image();
    im.src = sized(list[(i + 1) % list.length], width, height);
  }, [i, list, width, height]);

  if (!list.length) return <div className={cn("bg-paper", className)} />;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {list.map((src, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + k}
          src={k === i || k === (i + 1) % list.length || k === (i - 1 + list.length) % list.length ? sized(src, width, height) : undefined}
          alt={k === i ? alt : ""}
          aria-hidden={k !== i}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] ease-out",
            k === i ? "opacity-100" : "opacity-0",
            level === "full" ? "duration-[1200ms]" : "duration-500",
          )}
          style={level === "full" ? { transform: k === i ? "scale(1.06)" : "scale(1)", transitionDuration: k === i ? `1200ms, ${ms + 1500}ms` : "1200ms, 1200ms" } : undefined}
        />
      ))}
    </div>
  );
}
