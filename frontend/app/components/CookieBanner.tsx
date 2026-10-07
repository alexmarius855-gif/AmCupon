"use client";

import Link from "next/link";

import { useState } from "react";

/**
 * Bannerul de cookie-uri — randat pe SERVER, in HTML-ul fiecarei pagini (27.09.2026).
 *
 * Inainte pornea cu `visible = false` si aparea abia dupa JavaScript + un efect care citea
 * localStorage. Pe mobil paragraful lui e cel mai mare bloc de text din ecran, deci Google
 * masura LCP-ul dupa el: 4,4–5,3 s pe prima pagina si pe paginile de magazin (Lighthouse, 27.09),
 * desi continutul aparea la 1,2–1,8 s. Concurenta avea LCP 2,5–2,8 s.
 *
 * Cine a raspuns deja nu-l vede deloc: scriptul din <head> (layout.tsx) pune clasa `cc-ok` pe
 * <html> inainte de prima pictare, iar CSS-ul (globals.css) il ascunde — fara clipire.
 * Ce se salveaza si evenimentul pentru ConsentAnalytics/AffiliateScript sunt NESCHIMBATE.
 */
export default function CookieBanner() {
  const [raspuns, setRaspuns] = useState(false);

  function alege(valoare: "accepted" | "declined") {
    try { localStorage.setItem("cookie_consent", valoare); } catch { /* mod privat: bannerul se inchide oricum */ }
    document.documentElement.classList.add("cc-ok");
    if (valoare === "accepted") window.dispatchEvent(new Event("cookie_consent_update"));
    setRaspuns(true);
  }

  if (raspuns) return null;

  return (
    <div className="cookie-banner fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <span className="text-2xl shrink-0">🍪</span>

        {/* Text */}
        <div className="flex-1 text-sm">
          <p className="font-bold text-white mb-0.5">Folosim cookie-uri</p>
          <p className="text-gray-400 leading-relaxed">
            Folosim cookie-uri pentru analiza traficului (Google Analytics), publicitate (Google AdSense) și atribuirea comenzilor la rețelele de afiliere (2Performant, Impact, Awin). Nu vindem datele tale.{" "}
            <Link href="/confidentialitate" className="text-[#ddf93c] hover:underline">
              Politica de confidențialitate
            </Link>
          </p>
        </div>

        {/* Butoane */}
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => alege("declined")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Refuz
          </button>
          <button
            onClick={() => alege("accepted")}
            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] text-sm font-bold transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
