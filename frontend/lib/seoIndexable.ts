/**
 * seoIndexable.ts — o SINGURA sursa de adevar pentru "aceasta pagina de magazin
 * merita trimisa la Google?".
 *
 * ── De ce exista (masurat 10.08.2026) ──────────────────────────────────────
 * Din 1177 de pagini de magazin, doar 92 aveau continut real (62 cu promotie
 * activa + 80 cu produse in feed, cu suprapunere). Restul de 1085 erau acelasi
 * template, cu numele magazinului schimbat si un mesaj "nicio oferta activa".
 * Toate cele 1507 URL-uri erau trimise la Google prin sitemap.
 *
 * Pentru un domeniu FARA autoritate (0 backlink-uri, verificat), asta e cea mai
 * rea combinatie posibila: Google primeste 1500 de adrese, gaseste ca ~92% sunt
 * pagini subtiri aproape identice, si concluzioneaza ca domeniul e de calitate
 * mica. Rezultatul tipic e "Discovered – currently not indexed" LA SCARA, adica
 * exact simptomul de care sufera site-ul. Bugetul de crawl (mic, proportional cu
 * autoritatea) se consuma pe paginile goale, nu pe cele care chiar pot rank-ui.
 *
 * ── Ce facem (si ce NU facem) ──────────────────────────────────────────────
 * Paginile fara continut primesc `noindex, FOLLOW` — NU sunt sterse, NU sunt
 * ascunse:
 *   - raman 100% live si accesibile utilizatorilor si navigatiei interne
 *   - linkul afiliat functioneaza, comisionul curge la fel (regula "promoveaza
 *     tot" din PLAN-MASTER ramane respectata integral)
 *   - `follow` = link equity trece mai departe catre magazinele/categoriile
 *     legate din ele, deci nu pierdem nimic din structura interna
 *   - singurul efect e ca Google nu mai indexeaza ACEA pagina subtire anume
 *
 * Se auto-repara: in momentul in care un magazin primeste o promotie sau produse
 * in feed (pipeline la 4h), pagina devine automat indexabila si reintra in
 * sitemap. Zero interventie manuala, zero lista hardcodata de intretinut.
 */

export interface IndexableMagazin {
  magazin: string;
  are_promotie?: boolean;
  promotii?: unknown[];
}

export interface IndexableProdus {
  merchant?: string;
  merchant_slug?: string;
}

/**
 * Indexul de magazine care au produse reale in feed. Construit O SINGURA DATA
 * (sitemap-ul ar face altfel 1177 × 33.000 comparatii).
 *
 * Formatul REAL din products.json (verificat 10.08.2026):
 *   merchant_slug = domeniul complet, ex. "curteaveche.ro"
 *   merchant      = numele capitalizat, ex. "Curteaveche"
 * Deci potrivirea se poate face EXACT — fara substring. Prima versiune folosea
 * `t.includes(baza)`, care ar fi dat fals-pozitive (un slug scurt ca "cezi" ar fi
 * prins orice merchant care il contine ca subsir) si ar fi declarat "are produse"
 * pagini care de fapt n-au niciunul.
 */
export function buildMerchantTokens(produse: IndexableProdus[]): Set<string> {
  const tokens = new Set<string>();
  for (const p of produse) {
    const ms = (p.merchant_slug || "").toLowerCase().trim();
    const mn = (p.merchant || "").toLowerCase().trim();
    if (ms) {
      tokens.add(ms);
      tokens.add(ms.split(".")[0]); // baza domeniului
    }
    if (mn) tokens.add(mn);
  }
  return tokens;
}

/** Potrivire exacta pe domeniu complet SAU pe baza domeniului. Fara substring. */
export function areProduseInFeed(slug: string, tokens: Set<string>): boolean {
  const s = (slug || "").toLowerCase().trim();
  if (!s) return false;
  if (tokens.has(s)) return true;
  const baza = s.split(".")[0];
  return baza.length >= 3 && tokens.has(baza);
}

/**
 * Branduri cu CERERE REALA de cautare in Romania, chiar daca nu au promotie activa
 * chiar acum. Sursa: cercetare de volum/dificultate (Semrush, baza `ro`, august 2026)
 * — nu ghicit, nu "pare popular".
 *
 * De ce exista aceasta lista: regula "index doar daca are promotie sau produse" ar fi
 * scos din index pagini pentru care oamenii chiar cauta lunar, cu dificultate mica
 * (deci castigabile), ex. "cod reducere dr max" 2.400/luna KD 10, "cod reducere
 * answear" 1.600/luna KD 14, "cod reducere philips" 1.300/luna KD 14. Acelea sunt
 * exact paginile care TREBUIE sa concureze, nu sa dispara.
 *
 * Criteriu de intrare: volum de cautare masurat pentru "cod reducere <brand>" in RO
 * + magazinul exista in output.json cu link real. Extinde lista doar cu date de volum
 * verificate, nu pe intuitie.
 */
export const BRANDURI_CU_CERERE = new Set<string>([
  "drmax.ro",      // 2.400/luna, KD 10
  "answear.ro",    // 1.600/luna, KD 14
  "philips.ro",    // 1.300/luna, KD 14
  "kitunghii.ro",  //   880/luna, KD  7
  "noriel.ro",     //   ~400/luna, KD 10
]);

/**
 * Pagina merita indexata? DA daca are continut propriu real (promotie activa SAU
 * produse in feed) SAU serveste o cautare reala masurata (BRANDURI_CU_CERERE).
 * Altfel e template gol pentru un brand pe care nu-l cauta nimeni — noindex.
 */
export function esteIndexabil(m: IndexableMagazin, tokens: Set<string>): boolean {
  if (m.are_promotie && (m.promotii?.length ?? 0) > 0) return true;
  if (BRANDURI_CU_CERERE.has((m.magazin || "").toLowerCase())) return true;
  return areProduseInFeed(m.magazin, tokens);
}
