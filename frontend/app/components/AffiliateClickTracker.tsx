"use client";

import { useEffect } from "react";

/**
 * Tracker global de click-uri afiliate + injectare sub-id pentru ATRIBUIRE.
 *
 * Foloseste event delegation pe document (faza de capture) ca sa prinda ORICE click
 * pe un <a> afiliat, indiferent de pagina (homepage grid, /produse, /categorii, magazin).
 * Face doua lucruri, in aceeasi trecere:
 *
 *   1. SUB-ID (adaugat 06.08.2026) — scrie calea paginii curente in parametrul de
 *      sub-tracking al retelei, ca sa stim din dashboard-ul retelei CE PAGINA a produs
 *      comisionul. Inainte, 1099 din 1178 de linkuri nu aveau niciun sub-id: reteaua
 *      raporta "comision de la AmCupon" fara sa spuna de unde. Fiecare retea are alt
 *      nume de parametru (verificate in documentatia lor, nu ghicite):
 *        2Performant -> st=        (ex. oficial: ...&redirect_to=...&st=blogpost)
 *        Impact      -> subId1=
 *        Awin        -> clickref=
 *        Profitshare -> sub_id=    (unele linkuri il au deja din generare)
 *        CJ          -> sid=
 *      Alternativa platita pentru acelasi rezultat ar fi fost un agregator extern
 *      (~59 EUR/luna); asta face aceeasi atribuire gratuit, prin retelele insele.
 *
 *   2. GA4 — trimite evenimentul `affiliate_click`.
 *
 * IMPORTANT: totul ruleaza SINCRON in handler-ul de click, inainte de navigare, si e
 * complet invelit in try/catch — un link nu trebuie NICIODATA sa se rupa din cauza
 * tracking-ului. Daca ceva pica, linkul pleaca neatins.
 */

// Gazdele prin care trec link-urile afiliate. Inainte lipseau Impact/Awin/CJ, deci
// ~580 de magazine nu generau deloc eveniment in GA4 (gasit 06.08.2026).
const AFFILIATE_HOSTS = [
  "event.2performant.com",
  "l.profitshare.ro",
  "pxf.io",
  "sjv.io",
  "impactradius",
  "impact.com",
  "awin1.com",
  "anrdoezrs.net",
  "prf.hn",
];

// host (sau fragment de host) -> numele parametrului de sub-tracking al retelei
const SUBID_PARAM: [RegExp, string][] = [
  [/event\.2performant\.com/i, "st"],
  [/l\.profitshare\.ro/i, "sub_id"],
  [/pxf\.io|sjv\.io|impactradius|impact\.com/i, "subId1"],
  [/awin1\.com/i, "clickref"],
  [/anrdoezrs\.net|prf\.hn/i, "sid"],
];

/** Calea paginii curente, curatata ca sa fie citibila in rapoartele retelei. */
function pageTag(): string {
  const path = window.location.pathname.replace(/^\/|\/$/g, "") || "home";
  // Retelele accepta in general alfanumerice + `_`/`-`; normalizam si limitam
  // lungimea (unele taie la ~50 caractere si ar rupe valoarea la mijloc).
  return path.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 50);
}

export default function AffiliateClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      try {
        const el = e.target as HTMLElement | null;
        const a = el?.closest?.("a");
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (!href || !AFFILIATE_HOSTS.some((h) => href.includes(h))) return;

        // ── 1. Injecteaza sub-id-ul cu pagina curenta ────────────────────────
        const param = SUBID_PARAM.find(([re]) => re.test(href))?.[1];
        if (param) {
          try {
            const u = new URL(href, window.location.origin);
            const tag = pageTag();
            const existing = u.searchParams.get(param) || "";
            // Unele linkuri au deja un sub-id din generare (ex. Profitshare pune
            // slug-ul magazinului). Aceea e informatie pe care reteaua o stie deja;
            // pagina e informatia noua. Le pastram pe amandoua, separate prin `~`,
            // in loc sa sarim peste (am pierde atribuirea) sau sa suprascriem
            // (am pierde ce era acolo). Nu re-adaugam daca eticheta e deja prezenta.
            if (!existing.split("~").includes(tag)) {
              const combined = existing ? `${existing}~${tag}` : tag;
              u.searchParams.set(param, combined.slice(0, 80));
              // Setarea href-ului aici e sincrona, deci navigarea implicita care
              // urmeaza foloseste deja valoarea noua.
              a.setAttribute("href", u.toString());
            }
          } catch {
            /* URL invalid — lasam linkul exact cum era */
          }
        }

        // ── 2. Eveniment GA4 ────────────────────────────────────────────────
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
        if (!gtag) return;

        // Domeniul destinatie, cand reteaua il expune in query (util pentru CRO)
        let label = "afiliat";
        try {
          const u = new URL(a.getAttribute("href") || href, window.location.origin);
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
          page_tag: pageTag(),
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
