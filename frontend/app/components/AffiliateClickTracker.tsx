"use client";

import { useEffect } from "react";

// Domeniile prin care trec link-urile afiliate (2Performant quicklink + Profitshare).
const AFFILIATE_HOSTS = ["event.2performant.com", "l.profitshare.ro"];

/**
 * Tracker global de click-uri afiliate. Foloseste event delegation pe document
 * (faza de capture) ca sa prinda ORICE click pe un <a> afiliat, indiferent de
 * pagina (homepage grid, /produse, /categorii, magazin). Inlocuieste nevoia de
 * a pune onClick pe fiecare ancora in parte. Trimite eveniment GA4 affiliate_click.
 */
export default function AffiliateClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href || !AFFILIATE_HOSTS.some((h) => href.includes(h))) return;

      try {
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
        if (!gtag) return;

        // Extrage domeniul destinatie din redirect_to / url (label util pentru CRO).
        let label = "afiliat";
        try {
          const u = new URL(href);
          const dest = u.searchParams.get("redirect_to") || u.searchParams.get("url") || "";
          if (dest) {
            label = decodeURIComponent(dest).replace(/^https?:\/\//, "").split("/")[0];
          }
        } catch {
          /* ignora URL invalid */
        }

        gtag("event", "affiliate_click", {
          event_category: "afiliere",
          event_label: label,
          transport_type: "beacon",
        });
      } catch {
        /* nu bloca niciodata navigarea din cauza tracking-ului */
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
