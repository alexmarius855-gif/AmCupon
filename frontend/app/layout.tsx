import type { Metadata, Viewport } from "next";
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
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AffiliateClickTracker from "./components/AffiliateClickTracker";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import AnuntAnimat from "./components/AnuntAnimat";

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
  alternates: { canonical: "https://amcupon.ro" },
  verification: {
    google: "UvsbX8yxIp1eGwFK5ESqVXzA6jT5wjcTartEIPG5mqw",
    other: {
      "p:domain_verify": "ba572e9f4b288f061ae35149c1a13d30",
      "profitshareid": "55a94904302585d3a4d01658d993fd4d",
    },
  },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere verificate",
    description: "Peste 300 magazine partenere. Coduri verificate, actualizate zilnic. 100% gratuit.",
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AmCupon.ro" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmCupon.ro — Coduri de reducere verificate",
    description: "Peste 300 magazine partenere. Actualizat zilnic.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo-profile.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
    shortcut: "/logo-profile.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  colorScheme: "light dark",
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
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://amcupon.ro/cautare?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://amcupon.ro/#organization",
      "name": "AmCupon.ro",
      "url": "https://amcupon.ro",
      "email": "contact@amcupon.ro",
      "logo": "https://amcupon.ro/logo-profile.svg",
      "sameAs": [
        "https://www.facebook.com/amcupon.ro",
        "https://www.instagram.com/amcupon.ro",
        "https://www.tiktok.com/@amcupon.ro",
      ],
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
        {/* Profitshare site verification */}
        <meta name="profitshareid" content="55a94904302585d3a4d01658d993fd4d" />
        {/* Anti-flash dark mode — ruleaza inainte de orice render */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();` }} />
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
        <Navbar />
        <AnuntAnimat />
        {children}
        <Footer />
        <CookieBanner />
        <AffiliateScript />
        <NewsletterPopup />
        {/* GA4 + AdSense — incarcate DOAR dupa acceptarea cookie-urilor (GDPR) */}
        <ConsentAnalytics
          gaId={GA_ID || undefined}
          adsenseId={process.env.NEXT_PUBLIC_ADSENSE_ID}
        />
        {/* Tracking global click-uri afiliate → GA4 event affiliate_click */}
        <AffiliateClickTracker />
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
