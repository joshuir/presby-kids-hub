import type { Metadata } from "next";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "./globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CookieBanner } from "@/components/site/CookieBanner";
import { SiteSettingsProvider } from "@/lib/site";

// Fonts are self-hosted via @fontsource (same families: Nunito, Poppins, Baloo 2)
const nunito = { variable: "font-vars" };
const poppins = { variable: "" };
const baloo = { variable: "" };

export const metadata: Metadata = {
  metadataBase: new URL("https://presby-kids-hub.onrender.com"),
  title: {
    default: "Presby Children Service",
    template: "%s • Presby Children Service",
  },
  description:
    "A safe, joyful, and Bible-centered children’s ministry—clear information for parents and an engaging experience for kids.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    title: "Presby Children Service",
    description:
      "A safe, joyful, and Bible-centered children’s ministry—clear information for parents and an engaging experience for kids.",

  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Presby Children Service",
              parentOrganization: { "@type": "Church", name: "Presbyterian Church, Accra" },
              url: "https://presby-kids-hub.onrender.com",
            }),
          }}
        />
      </head>
      <body
        className={`${nunito.variable} ${poppins.variable} ${baloo.variable} min-h-dvh bg-white text-ink-950 antialiased`}
      >
        <SiteSettingsProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="min-h-[70dvh]">{children}</main>
          <SiteFooter />
          <CookieBanner />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
