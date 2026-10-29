import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/nunito-sans";
import "./globals.css";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteSettingsProvider } from "@/lib/site";
import { MotionDirector } from "@/components/motion/MotionDirector";

const DESC =
  "The children's ministry of Presbyterian Church, Accra — Bible-centred Sunday classes for ages 3 to 13, Bible games and our clothing collection.";

export const metadata: Metadata = {
  title: {
    default: "Presbyterian Children's Ministry — Helping children know, love and live God's Word",
    template: "%s · Children's Ministry",
  },
  description: DESC,
  applicationName: "Presbyterian Children's Ministry",
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", siteName: "Presbyterian Children's Ministry", locale: "en_GB", description: DESC },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#2563EB" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Presbyterian Children's Ministry",
              parentOrganization: { "@type": "Church", name: "Presbyterian Church, Accra" },
            }),
          }}
        />
      </head>
      <body className="min-h-dvh bg-cream text-ink antialiased">
        <SiteSettingsProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="min-h-[70dvh]">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <MotionDirector />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
