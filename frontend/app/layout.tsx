import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// GoogleAnalytics mutat in ConsentAnalytics (conditional pe cookie consent)
import AffiliateScript from "./components/AffiliateScript";
import ConsentAnalytics from "./components/ConsentAnalytics";

// CookieBanner + NewsletterPopup randeaza null pana la timer/scroll/exit-intent —
// JS-ul lor nu trebuie sa faca parte din bundle-ul initial pe cele 2600+ pagini.
// (ssr:false nu e permis din Server Component in Next 16 — codesplitting merge si fara,
// componentele randeaza oricum null pe server pana la hidratare.)
const CookieBanner = dynamic(() => import("./components/CookieBanner"));
const NewsletterPopup = dynamic(() => import("./components/NewsletterPopup"));
import WebPushInit from "./components/WebPushInit";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchModal from "./components/SearchModal";
import AffiliateClickTracker from "./components/AffiliateClickTracker";
import "./globals.css";
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

// Font premium pentru titluri (serif editorial de lux, se potriveste cu auriu)
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
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
      "impact-site-verification": "3bab7acb-09ce-40a1-ae99-858dec676641",
    },
  },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere verificate",
    description: "Peste 1000 magazine partenere. Coduri verificate, actualizate zilnic. 100% gratuit.",
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AmCupon.ro" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmCupon.ro — Coduri de reducere verificate",
    description: "Peste 1000 magazine partenere. Actualizat zilnic.",
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
  themeColor: "#ddf93c",
  colorScheme: "light",
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        {/* Profitshare site verification */}
        <meta name="profitshareid" content="55a94904302585d3a4d01658d993fd4d" />
        {/* Impact.com website channel verification */}
        <meta name="impact-site-verification" content="3bab7acb-09ce-40a1-ae99-858dec676641" />
        {/* Tema light unica — curata clasa dark ramasa in localStorage de la tema veche */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{document.documentElement.classList.remove('dark');localStorage.removeItem('theme')}catch(e){}})();` }} />
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
        {/* Cautare globala (Cmd+K). Montata o data, aici — nu duplicata pe pagini. */}
        <SearchModal />
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
