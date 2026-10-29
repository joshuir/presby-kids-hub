"use client";

import { useEffect } from "react";

/** Old address — the collection now lives at /collection/. */
export default function Page() {
  useEffect(() => {
    location.replace("/collection/" + location.search);
  }, []);
  return <p className="p-10 text-center">Taking you to the clothing collection…</p>;
}
