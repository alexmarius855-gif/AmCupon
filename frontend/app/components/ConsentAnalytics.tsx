"use client";

/**
 * Incarca GA4 + AdSense DOAR dupa ce userul accepta cookie-urile.
 * Asculta evenimentul "cookie_consent_update" emis de CookieBanner.
 */

import Script from "next/script";
import { useEffect, useState } from "react";

interface Props {
  gaId?: string;
  adsenseId?: string;
}

export default function ConsentAnalytics({ gaId, adsenseId }: Props) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Verificare initiala (revenire pe site dupa acceptare anterioara)
    setConsented(localStorage.getItem("cookie_consent") === "accepted");

    // Ascultam acceptarea live (acelasi tab)
    const handler = () => {
      setConsented(localStorage.getItem("cookie_consent") === "accepted");
    };
    window.addEventListener("cookie_consent_update", handler);
    return () => window.removeEventListener("cookie_consent_update", handler);
  }, []);

  if (!consented) return null;

  return (
    <>
      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true})`}
          </Script>
        </>
      )}

      {/* Google AdSense */}
      {adsenseId && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
