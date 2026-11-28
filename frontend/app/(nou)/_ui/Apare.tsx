"use client";

/**
 * Aparitii la derulare pe noul site — acelasi principiu ca pe vechiul site (Aparitii.tsx, 24.11.2026), masurat atunci:
 * nu se atinge nimic pana dupa `load` si un moment liber, iar ce e in ecran la incarcare nu se ascunde niciodata
 * (LCP si textul pentru Google raman neschimbate). `animation-timeline: view()` ducea LCP de la 388 la 480 ms.
 *
 * Doua efecte: cardurile de sub ecran urca usor cand ajung in ecran (`.ap-ascuns` -> `.ap-vazut`), iar termometrele
 * de sub ecran se umplu atunci (`.termo.asteapta` -> `.vazut`). Fara JavaScript sau la „miscare redusa": nimic.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Cardurile, nu placile care le contin: o placa ascunsa cu tot cu cardurile ar fi animat de doua ori.
const TINTE = ".cupon, .produs, .bon-mic, .mag, .scadere, .ap";

export default function Apare() {
  const cale = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observator: IntersectionObserver | null = null;
    let anulat = false;

    const porneste = () => {
      if (anulat) return;
      const inaltime = window.innerHeight;
      const urmarite: Element[] = [];
      const sub = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.top > inaltime;
      };
      document.querySelectorAll(TINTE).forEach((el) => {
        if (el.classList.contains("ap-ascuns") || !sub(el)) return;
        el.classList.add("ap-ascuns");
        urmarite.push(el);
      });
      document.querySelectorAll(".termo").forEach((el) => {
        if (el.closest(".bon-tipar") || el.classList.contains("asteapta") || !sub(el)) return;
        el.classList.add("asteapta");
        urmarite.push(el);
      });
      if (!urmarite.length) return;
      observator = new IntersectionObserver((intrari) => {
        let i = 0;
        for (const intrare of intrari) {
          if (!intrare.isIntersecting) continue;
          const el = intrare.target as HTMLElement;
          if (el.classList.contains("termo")) {
            el.classList.add("vazut");
          } else {
            // Cardurile care intra deodata (un rand din grila) apar unul dupa altul, cu 70 ms intre ele.
            el.style.setProperty("--ap-intarziere", `${Math.min(i++, 5) * 70}ms`);
            el.classList.add("ap-vazut");
          }
          observator?.unobserve(el);
        }
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
      urmarite.forEach((el) => observator?.observe(el));
    };

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
      document.querySelectorAll(".ap-ascuns:not(.ap-vazut)").forEach((el) => el.classList.remove("ap-ascuns"));
      document.querySelectorAll(".termo.asteapta:not(.vazut)").forEach((el) => el.classList.remove("asteapta"));
    };
  }, [cale]);

  return null;
}
