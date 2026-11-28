import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AffiliateScript from "@/app/_comun/AffiliateScript";
import ConsentAnalytics from "@/app/_comun/ConsentAnalytics";
import AffiliateClickTracker from "@/app/_comun/AffiliateClickTracker";
import { pesteMagazine, PesteMagazine } from "@/lib/cifreSite";
import { ziPuncte } from "@/lib/formatRo";
import { ziuaTermometrului } from "@/lib/termometru";
import { clasaFonturi } from "./_ui/fonturi";
import Antet from "./_ui/Antet";
import Subsol from "./_ui/Subsol";
import BannerCookie from "./_ui/BannerCookie";
import Apare from "./_ui/Apare";
import { anuntBF, magazineInDate } from "./_date";
import "./nou.css";

/**
 * Layout-ul noului site (25.11.2026, „Pretul adevarat", docs/design/PROMPT-SITE-NOU.md). Paginile se muta aici una
 * cate una din app/(vechi); adresele nu se schimba. Metadatele comune, verificarile si JSON-LD-ul sunt cele ale
 * vechiului layout, neschimbate. Fara NewsletterPopup si fara WebPush (ferestre care sar peste continut).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-KXTENZX0EN";

export const metadata: Metadata = {
  title: "AmCupon.ro - Coduri de reducere și oferte active",
  description: `Coduri de reducere și oferte active de la ${pesteMagazine()} partenere, actualizate de mai multe ori pe zi. 100% gratuit.`,
  metadataBase: new URL("https://amcupon.ro"),
  // FARA canonical aici: fiecare pagina il pune pe al ei (29.10.2026, paginile legale se declarau duplicat).
  verification: {
    google: "UvsbX8yxIp1eGwFK5ESqVXzA6jT5wjcTartEIPG5mqw",
    other: {
      "p:domain_verify": "ba572e9f4b288f061ae35149c1a13d30",
      "impact-site-verification": "3bab7acb-09ce-40a1-ae99-858dec676641",
    },
  },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere și oferte active",
    description: `${PesteMagazine()} partenere. Coduri și oferte actualizate de mai multe ori pe zi. 100% gratuit.`,
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AmCupon.ro" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmCupon.ro — Coduri de reducere și oferte active",
    description: `${PesteMagazine()} partenere. Actualizat de mai multe ori pe zi.`,
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
  themeColor: "#0a0c11",
  colorScheme: "dark",
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://amcupon.ro/#website",
      url: "https://amcupon.ro",
      name: "AmCupon.ro",
      description: `Coduri de reducere și oferte active de la ${pesteMagazine()} partenere, actualizate de mai multe ori pe zi.`,
      inLanguage: "ro-RO",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://amcupon.ro/cautare?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://amcupon.ro/#organization",
      name: "AmCupon.ro",
      url: "https://amcupon.ro",
      email: "contact@amcupon.ro",
      logo: "https://amcupon.ro/logo-profile.svg",
      sameAs: [
        "https://www.facebook.com/amcupon.ro",
        "https://www.instagram.com/amcupon.ro",
        "https://www.tiktok.com/@amcupon.ro",
      ],
    },
  ],
};

export default function LayoutNou({ children }: Readonly<{ children: React.ReactNode }>) {
  const zi = ziuaTermometrului();
  return (
    // Scriptul din <head> poate adauga `cc-ok` inainte de hidratare (acordul pentru cookie-uri e deja dat).
    <html lang="ro" className={clasaFonturi} suppressHydrationWarning>
      <head>
        {/* Cine a raspuns deja la cookie-uri primeste `cc-ok` inainte de prima pictura: bannerul nu clipeste. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement;d.classList.remove('dark');if(localStorage.getItem('cookie_consent'))d.classList.add('cc-ok')}catch(e){}})();` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }} />
        <link rel="preconnect" href="https://img.2performant.com" />
        <link rel="preconnect" href="https://cdn.2performant.com" />
      </head>
      <body>
        <Antet anunt={anuntBF()} />
        <main id="continut">{children}</main>
        <Subsol magazineInDate={magazineInDate()} actualizat={zi ? ziPuncte(zi) : undefined} />
        <BannerCookie />
        <Apare />
        <AffiliateScript />
        {/* GA4 + AdSense: doar dupa acceptarea cookie-urilor (GDPR) */}
        <ConsentAnalytics gaId={GA_ID || undefined} adsenseId={process.env.NEXT_PUBLIC_ADSENSE_ID} />
        {/* Sub-id-ul paginii pe linkurile afiliate + numaratoarea anonima de clicuri */}
        <AffiliateClickTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
