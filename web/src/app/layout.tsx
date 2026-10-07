import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Hanken_Grotesk } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#EEFFF4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hanken.variable} ${figtree.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full bg-mint font-sans text-ink">{children}</body>
    </html>
  );
}
