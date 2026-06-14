import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { SITE } from "@/lib/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display-raw",
  display: "swap",
});

const DESCRIPTION =
  "Boutique vacation lodging in Wailuku, Maui — kamaʻāina-hosted private suites, central to Kahului Airport, Iao Valley, and beaches. Self check-in, free parking, fast Wi-Fi.";

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: DESCRIPTION,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [
    "Waena Inn",
    "Wailuku lodging",
    "Maui vacation rental",
    "Maui private suite",
    "where to stay in Wailuku",
    "central Maui accommodation",
    "stay near Kahului airport",
    "Wailuku boutique stay",
    "Maui studio rental",
    "kamaaina lodging Maui",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: DESCRIPTION,
    url: SITE.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#2B201A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
