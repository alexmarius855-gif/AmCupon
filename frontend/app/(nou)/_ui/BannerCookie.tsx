"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Bannerul de cookie-uri al noului site. Acelasi contract ca pe vechiul site (27.09.2026), pentru ca de el depind
 * LCP-ul si atribuirea:
 *  - randat pe SERVER, in HTML; cine a raspuns deja primeste `cc-ok` pe <html> din scriptul din <head>, iar CSS-ul
 *    il ascunde inainte de prima pictura. NU-l face „doar in browser”: era elementul LCP, la 4-5 s.
 *  - `localStorage.cookie_consent` = "accepted" / "declined"; la acceptare, evenimentul `cookie_consent_update`
 *    (il asculta ConsentAnalytics si AffiliateScript din app/_comun).
 */
export default function BannerCookie() {
  const [raspuns, setRaspuns] = useState(false);

  function alege(valoare: "accepted" | "declined") {
    try { localStorage.setItem("cookie_consent", valoare); } catch { /* mod privat: bannerul se inchide oricum */ }
    document.documentElement.classList.add("cc-ok");
    if (valoare === "accepted") window.dispatchEvent(new Event("cookie_consent_update"));
    setRaspuns(true);
  }

  if (raspuns) return null;

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie-uri">
      <div>
        <p>
          <b>Folosim cookie-uri</b> pentru analiza traficului (Google Analytics), publicitate (Google AdSense) și atribuirea
          comenzilor la rețelele de afiliere (2Performant, Impact, Awin). Nu vindem datele tale.{" "}
          <Link href="/confidentialitate">Politica de confidențialitate</Link>
        </p>
        <div className="butoane">
          <button type="button" className="buton-contur" onClick={() => alege("declined")}>Refuz</button>
          <button type="button" className="buton" onClick={() => alege("accepted")}>Accept</button>
        </div>
      </div>
    </div>
  );
}
