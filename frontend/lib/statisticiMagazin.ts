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

/**
 * Sub 1 leu, pretul din feed nu e pretul pe care il platesti.
 *
 * 20.09.2026 — pagina bazarulonline.ro afisa „Cel mai ieftin: 0 lei". Cauza: 26 de
 * produse din feed au pret intre 0 si 1 leu, iar 21 sunt la acelasi magazin, toate
 * marcate EN-GROSS: „Aeroterma auto — 0,32 lei", „Biscuiti Top Cookies 28 g (4x60)
 * — 0,37 lei". Sunt preturi UNITARE dintr-un bax, nu pretul de raft.
 *
 * Filtrul `> 0` de mai jos le lasa sa treaca (0,32 e pozitiv), iar afisarea fara
 * zecimale le rotunjeste la „0 lei" — deci pagina anunta un pret pe care nimeni nu
 * il poate plati. In Romania, unde transportul singur trece de 15 lei, un produs de
 * retail online sub 1 leu e aproape sigur o eroare de feed, nu o oferta.
 *
 * Nu formatam cu zecimale ca sa „arate corect": „0,32 lei" ar fi la fel de fals,
 * doar mai precis. Excludem valoarea din statistica.
 */
export const PRET_MINIM_CREDIBIL = 1;

export function statisticiFeed(produse: ProdusStat[]): StatisticiFeed | null {
  const preturi = produse
    .map((p) => p.price)
    .filter((p): p is number => typeof p === "number" && p >= PRET_MINIM_CREDIBIL)
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
