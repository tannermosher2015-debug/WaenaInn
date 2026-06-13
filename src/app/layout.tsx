import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.tagline,
  metadataBase: new URL(SITE.url),
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
