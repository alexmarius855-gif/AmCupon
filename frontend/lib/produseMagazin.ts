/**
 * Ce produse din feed apartin unui magazin — o singura definitie, folosita de pagina de
 * magazin (`/cod-reducere/[magazin]`). Test: `node lib/produseMagazin.test.mjs`.
 *
 * 07.10.2026: potrivire EXACTA pe domeniu. Pana atunci pagina folosea
 * `ms.startsWith(s.split(".")[0]) || mn.includes(s.split(".")[0])` — tiparul #1 din
 * docs/LECTII-TEHNICE.md (subsirul). La ro.roborock.com primul label e „ro", care apare
 * in numele aproape oricarui magazin .ro: pagina Roborock arata un test de anemie si
 * rame Jimmy Choo, mi.com (Xiaomi) — trolere si o motocoasa, libris.ro — 102 carti de la
 * anticexlibris.ro. 39 de pagini, toate cu produsele altui magazin sub numele lor.
 *
 * Masurat inainte de schimbare: fiecare produs din feed are `merchant_slug` egal cu
 * domeniul magazinului sau (cele 508 fara pereche sunt de la magazine fara pagina), deci
 * potrivirea exacta nu pierde niciun produs propriu.
 */
export interface ProdusCuMagazin {
  merchant?: string;
  merchant_slug?: string;
}

export function alMagazinului(pr: ProdusCuMagazin, slug: string): boolean {
  const s = (slug || "").toLowerCase().trim();
  if (!s) return false;
  return (pr.merchant_slug || "").toLowerCase().trim() === s || (pr.merchant || "").toLowerCase().trim() === s;
}
