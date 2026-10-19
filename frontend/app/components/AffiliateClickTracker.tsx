"use client";

import { useEffect } from "react";
import { esteLinkAfiliat, PARAM_SUBID } from "../../lib/subId";
import { numaraClick } from "../../lib/clicuriClient";

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
 *   2. NUMARATOARE PROPRIE (19.10.2026) — `sendBeacon` catre `/api/click`, anonim, doar pentru clicuri
 *      facute de un om (`isTrusted`); vezi lib/clicuri.ts.
 *
 *   3. GA4 — trimite evenimentul `affiliate_click` (doar dupa acceptarea cookie-urilor).
 *
 * IMPORTANT: totul ruleaza SINCRON in handler-ul de click, inainte de navigare, si e
 * complet invelit in try/catch — un link nu trebuie NICIODATA sa se rupa din cauza
 * tracking-ului. Daca ceva pica, linkul pleaca neatins.
 */

// Gazdele prin care trec link-urile afiliate. Inainte lipseau Impact/Awin/CJ, deci
// ~580 de magazine nu generau deloc eveniment in GA4 (gasit 06.08.2026).
// Recunoasterea (`esteLinkAfiliat`, inclusiv linkurile Impact de pe domeniile
// brandurilor) si parametrii de sub-id vin din `lib/subId.ts` — SURSA UNICA,
// partajata cu ruta server `/go/[magazin]`. Doua harti separate s-ar
// desincroniza; tiparul a lovit deja proiectul de doua ori.
const SUBID_PARAM = PARAM_SUBID;

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
        if (!href || !esteLinkAfiliat(href)) return;

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

        // ── 2. Numaratoare proprie, anonima (lib/clicuri.ts, /api/click) ─────────
        // Doar clicurile facute de un om (`isTrusted`): un script care apeleaza `.click()` sau un
        // robot care nu ruleaza JavaScript nu ajung aici. Inainte de GA4 si INDEPENDENT de el:
        // GA4 se incarca doar dupa acceptarea cookie-urilor, deci nu vede majoritatea vizitatorilor.
        // Nu trimitem nimic care identifica persoana (nici cookie, nici ID); serverul pastreaza ziua,
        // magazinul, pagina, hostul de unde a venit omul si tipul de dispozitiv.
        if (e.isTrusted) numaraClick(a.getAttribute("href") || href);

        // ── 3. Eveniment GA4 ────────────────────────────────────────────────
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

    // Clicul de mijloc (deschide linkul in tab nou) nu declanseaza `click`, ci `auxclick` — era un client real
    // pe care il pierdeam si caruia nu-i adaugam nici sub-id-ul. Doar butonul 1: dreapta e meniul contextual.
    const onAux = (e: MouseEvent) => { if (e.button === 1) onClick(e); };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onAux, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onAux, { capture: true });
    };
  }, []);

  return null;
}
