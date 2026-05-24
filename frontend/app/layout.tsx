import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
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
  verification: {
    google: "UvsbX8yxIp1eGwFK5ESqVXzA6jT5wjcTartEIPG5mqw",
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
        <Analytics />
        <Script
          src="https://cdn.2performant.com/l2/link2.js"
          id="linkTwoPerformant"
          data-id="l2/0/2/1/0/7/5/9/7/5/2"
          data-api-host="https://cdn.2performant.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
