"use client";

/**
 * Aparitii la derulare (24.11.2026): cardurile si titlurile de sub marginea ecranului urca usor in pagina cand ajung
 * in ecran, cum fac majoritatea site-urilor.
 *
 * De ce cu IntersectionObserver si nu cu `animation-timeline: view()` (CSS pur): masurat pe build-ul de productie,
 * telefon cu procesorul incetinit de 4 ori, prima pagina, 10 rulari alternate fata de main — varianta CSS ducea LCP
 * de la 388 la 480 ms, fiindca browserul pregatea peste 40 de animatii inca de la prima pictura. Aici nu se atinge
 * nimic pana dupa incarcare, iar ce e deja in ecran nu se ascunde niciodata. Fara JavaScript, la „miscare redusa"
 * sau intr-un browser fara IntersectionObserver, pagina ramane exact ca inainte. Stilul: globals.css, `.am-ascuns`.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TINTE = ".cc, .pop, .am-card, .am-tile, .am-produs, .cc-empty, .am-h2, .am-apare";

export default function Aparitii() {
  const cale = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observator: IntersectionObserver | null = null;
    let anulat = false;

    const porneste = () => {
      if (anulat) return;
      const inaltime = window.innerHeight;
      const ascunse: Element[] = [];
      document.querySelectorAll(TINTE).forEach((el) => {
        if (el.classList.contains("am-ascuns")) return;
        const r = el.getBoundingClientRect();
        // Doar ce e complet sub ecran: ce se vede, chiar si pe jumatate, ramane cum e.
        if (r.height > 0 && r.top > inaltime) {
          el.classList.add("am-ascuns");
          ascunse.push(el);
        }
      });
      if (!ascunse.length) return;
      observator = new IntersectionObserver((intrari) => {
        let i = 0;
        for (const intrare of intrari) {
          if (!intrare.isIntersecting) continue;
          const el = intrare.target as HTMLElement;
          // Cardurile care intra deodata (un rand din grila) apar unul dupa altul, cu 70 ms intre ele.
          el.style.setProperty("--am-intarziere", `${Math.min(i++, 5) * 70}ms`);
          el.classList.add("am-vazut");
          observator?.unobserve(el);
        }
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
      ascunse.forEach((el) => observator?.observe(el));
    };

    // Dupa incarcare si intr-un moment liber: nu concuram cu prima pictura a paginii.
    let id: number | undefined;
    const programeaza = () => {
      const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
      id = w.requestIdleCallback ? w.requestIdleCallback(porneste, { timeout: 1200 }) : window.setTimeout(porneste, 300);
    };
    if (document.readyState === "complete") programeaza();
    else window.addEventListener("load", programeaza, { once: true });

    return () => {
      anulat = true;
      window.removeEventListener("load", programeaza);
      if (id !== undefined) {
        const w = window as Window & { cancelIdleCallback?: (n: number) => void };
        if (w.cancelIdleCallback) w.cancelIdleCallback(id); else window.clearTimeout(id);
      }
      observator?.disconnect();
      // La schimbarea paginii, nimic nu ramane ascuns.
      document.querySelectorAll(".am-ascuns:not(.am-vazut)").forEach((el) => el.classList.remove("am-ascuns"));
    };
  }, [cale]);

  return null;
}
