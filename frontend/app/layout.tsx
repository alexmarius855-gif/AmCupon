import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// GoogleAnalytics mutat in ConsentAnalytics (conditional pe cookie consent)
import CookieBanner from "./components/CookieBanner";
import AffiliateScript from "./components/AffiliateScript";
import NewsletterPopup from "./components/NewsletterPopup";
import ConsentAnalytics from "./components/ConsentAnalytics";
import WebPushInit from "./components/WebPushInit";
import "./globals.css";

// ─── GA4 Measurement ID ───────────────────────────────────────────────────────
// Mergi la analytics.google.com → Admin → Data Streams → Web → Measurement ID
// Formatul e G-XXXXXXXXXX  (ex: G-ABC123DEF4)
// Pune-l ca variabila de mediu NEXT_PUBLIC_GA_ID in Vercel Dashboard
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-KXTENZX0EN";

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
      { url: "/logo-profile.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-profile.svg",
    shortcut: "/logo-profile.svg",
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
        {/* AdSense + GA4 se incarca prin ConsentAnalytics (conditionat de cookie consent) */}
      </head>
      <body className="min-h-full flex flex-col">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-3 flex-wrap">
          <span>
            &#128293;{" "}
            <span className="hidden sm:inline">Coduri de reducere actualizate zilnic &mdash; </span>
            <a href="/#promotii" className="underline hover:no-underline font-bold">
              Descopera promotiile active de azi &rarr;
            </a>
          </span>
          <a
            href="/newsletter"
            className="hidden sm:inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-colors"
          >
            &#128140; Newsletter gratuit
          </a>
          <a
            href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb"
            target="_blank" rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-colors"
          >
            &#129513; Extensie Chrome
          </a>
        </div>
        {children}
        <CookieBanner />
        <AffiliateScript />
        <NewsletterPopup />
        {/* GA4 + AdSense — incarcate DOAR dupa acceptarea cookie-urilor (GDPR) */}
        <ConsentAnalytics
          gaId={GA_ID || undefined}
          adsenseId={process.env.NEXT_PUBLIC_ADSENSE_ID}
        />
        {/* Web Push — OneSignal (setare NEXT_PUBLIC_ONESIGNAL_APP_ID in Vercel) */}
        <WebPushInit appId={process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID} />
        <Analytics />
        <SpeedInsights />

        {/* Affiliate disclosure global (obligatoriu legal) */}
        <p className="sr-only">
          AmCupon.ro contine link-uri de afiliere. Primim un comision de la magazine
          atunci cand efectuezi o achizitie prin link-urile noastre, fara costuri suplimentare pentru tine.
        </p>
      </body>
    </html>
  );
}
