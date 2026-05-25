import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import CookieBanner from "./components/CookieBanner";
import AffiliateScript from "./components/AffiliateScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmCupon.ro - Coduri de reducere si oferte verificate",
  description: "Coduri de reducere verificate si oferte exclusive de la cele mai mari magazine online din Romania. Actualizat zilnic.",
  metadataBase: new URL("https://amcupon.ro"),
  verification: {
    google: "UvsbX8yxIp1eGwFK5ESqVXzA6jT5wjcTartEIPG5mqw",
  },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere verificate",
    description: "Peste 200 magazine partenere. Coduri verificate, actualizate zilnic. 100% gratuit.",
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AmCupon.ro" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmCupon.ro — Coduri de reducere verificate",
    description: "Peste 200 magazine partenere. Actualizat zilnic.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://amcupon.ro/#website",
      "url": "https://amcupon.ro",
      "name": "AmCupon.ro",
      "description": "Coduri de reducere verificate și oferte exclusive de la cele mai mari magazine online din România.",
      "inLanguage": "ro-RO",
    },
    {
      "@type": "Organization",
      "@id": "https://amcupon.ro/#organization",
      "name": "AmCupon.ro",
      "url": "https://amcupon.ro",
      "email": "contact@amcupon.ro",
      "sameAs": ["https://amcupon.ro"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <link rel="preconnect" href="https://img.2performant.com" />
        <link rel="preconnect" href="https://cdn.2performant.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-semibold py-2 px-4 text-center">
          🔥{" "}
          <span className="hidden sm:inline">Coduri de reducere actualizate zilnic — </span>
          <a href="/#promotii" className="underline hover:no-underline font-bold">
            Descoperă promoțiile active de azi →
          </a>
        </div>
        {children}
        <CookieBanner />
        <AffiliateScript />
        <Analytics />
      </body>
    </html>
  );
}
