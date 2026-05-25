"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function AffiliateScript() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "accepted") {
      setCanLoad(true);
    }
    // Ascultă acceptarea în timp real (când userul apasă Accept în același tab)
    const handler = () => {
      if (localStorage.getItem("cookie_consent") === "accepted") {
        setCanLoad(true);
      }
    };
    window.addEventListener("cookie_consent_update", handler);
    return () => window.removeEventListener("cookie_consent_update", handler);
  }, []);

  if (!canLoad) return null;

  return (
    <Script
      src="https://cdn.2performant.com/l2/link2.js"
      id="linkTwoPerformant"
      data-id="l2/0/2/1/0/7/5/9/7/5/2"
      data-api-host="https://cdn.2performant.com"
      strategy="afterInteractive"
    />
  );
}
