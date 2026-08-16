/**
 * Statistici REALE per magazin, calculate din feed-ul de produse.
 *
 * De ce (16.08.2026): masurat cap la cap pe acelasi magazin, pagina noastra are
 * 3.273 caractere de text, a concurentului 9.762. Concurentul cu ~350k vizite/luna
 * are in tot sitemap-ul 998 de pagini de magazin si 4 alte pagini — pagina de
 * magazin E afacerea. Diferenta de adancime se acopera cu date pe care le AVEM
 * deja si nu le aratam, nu cu text de umplutura.
 *
 * Ce NU se calculeaza aici, desi campurile exista:
 *   * `brand` — la librarii feed-ul pune AUTORUL acolo ("Brian Michael Bendis"
 *     la libris.ro). O sectiune "Branduri" ar fi gresita pe orice magazin de carti.
 *   * `category` — vine in ENGLEZA din feed ("Comics & Graphic Novels", "Bibles").
 *     Afisata brut pe o pagina romaneasca arata neingrijit.
 * Raman doar cifrele corecte in orice contest: cate produse urmarim si cat costa.
 */

export interface ProdusStat {
  price?: number;
  discount_pct?: number;
}

export interface StatisticiFeed {
  total: number;
  pretMin: number;
  pretMedian: number;
  pretMax: number;
  cuReducere: number;
}

/**
 * Sub atatea produse cu pret valid nu publicam interval — un "interval de pret"
 * din 2 produse e zgomot prezentat ca masuratoare. Acelasi principiu ca pragul de
 * esantion din studiul public (scripts/generate_studiu_cupoane.py).
 */
export const MIN_PRODUSE_PENTRU_STATISTICI = 5;

export function statisticiFeed(produse: ProdusStat[]): StatisticiFeed | null {
  const preturi = produse
    .map((p) => p.price)
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b);

  if (preturi.length < MIN_PRODUSE_PENTRU_STATISTICI) return null;

  const mij = Math.floor(preturi.length / 2);
  const median =
    preturi.length % 2 === 0 ? (preturi[mij - 1] + preturi[mij]) / 2 : preturi[mij];

  return {
    total: produse.length,
    pretMin: preturi[0],
    pretMedian: median,
    pretMax: preturi[preturi.length - 1],
    cuReducere: produse.filter((p) => (p.discount_pct ?? 0) > 0).length,
  };
}

/** 1.234 lei — fara zecimale, ca lista de preturi sa se citeasca dintr-o privire. */
export function lei(n: number): string {
  return `${Math.round(n).toLocaleString("ro-RO")} lei`;
}
