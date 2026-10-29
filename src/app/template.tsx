"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fxOn, useMotionLevel } from "@/components/motion/MotionDirector";
import { useSettings } from "@/lib/site";

// The first page a visitor opens is already painted by the server: fading it in again would
// make it blink. Only later in-app navigations get the soft page transition.
const nav = { first: true };

/** Smooth page transitions between routes (CMS: Settings → Animations → "Fade between pages"). */
export default function Template({ children }: { children: React.ReactNode }) {
  const s = useSettings();
  const level = useMotionLevel();
  // decided once per page mount; the server always renders the first-page case, so static HTML is never pre-hidden
  const [animate] = useState(() => {
    if (typeof window === "undefined") return false;
    const a = !nav.first && level !== "off" && fxOn(s, "fxPageFade");
    nav.first = false;
    return a;
  });
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: level === "full" ? 12 : 0 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
