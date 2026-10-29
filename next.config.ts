import type { NextConfig } from "next";

// Static export for InfinityFree (no Node.js server). Content, sign-in and uploads are
// handled in the browser by Supabase, so CMS changes appear without re-uploading the site.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
