/**
 * Sursa UNICA pentru eticheta de expirare a unei promotii.
 *
 * DE CE EXISTA: pe 07.09.2026 logica asta era copiata in 5 locuri, cu praguri DIFERITE
 * (tiparul #3 din docs/LECTII-TEHNICE.md — "liste duplicate care se desincronizeaza").
 * Doua locuri (BrandPageTemplate, oferte-azi) plafonau corect afisarea; doua
 * (`cod-reducere/[magazin]`, `reduceri/[magazin]`) NU aveau nicio limita superioara, deci
 * afisau brut orice valoare din date. Efect masurat LIVE pe amcupon.ro:
 *   incaltamintelamoda.ro -> "3571 zile ramase"  (~9 ani si 9 luni)
 *   jojofashion.ro        -> 4924 zile in date
 * 17 promotii pe 10 magazine cadeau in cazul asta. Un contor care spune ca mai ai 9 ani la
 * un cod de reducere ii arata vizitatorului ca datele noastre nu sunt reale.
 *
 * DE CE UN HELPER SI NU DOUA REPARATII: cele doua pagini corecte erau deja reparate; bug-ul
 * a aparut fiindca reparatia n-a fost centralizata. A treia pagina care afiseaza un countdown
 * l-ar fi re-inventat la fel. Aici e o singura decizie, importata peste tot.
 *
 * Functie PURA: nu citeste `Date.now()`. `zile_ramase` vine deja calculat din pipeline, iar
 * regula de puritate Server/Client Component din CLAUDE.md (audit 24.07.2026) cere ca
 * helperele de afisare sa nu introduca timp propriu.
 */

/**
 * Peste atatea zile nu mai afisam cifra deloc. Valoarea NU e inventata aici — e pragul care
 * exista deja in `BrandPageTemplate.tsx` si `oferte-azi/page.tsx`; helperul doar il face unic.
 * Sub el, un numar de zile e informatie utila; peste el, e zgomot care arata a data gresita.
 */
export const PRAG_FARA_CIFRA = 99;

/** Pana la atatea zile inclusiv, oferta e "urgenta" (accent vizual, ton rosu/portocaliu). */
export const PRAG_URGENT = 3;

export type TonExpirare = "urgent" | "normal" | "neutru";

export interface EtichetaExpirare {
  /** Textul gata de afisat. Nu contine niciodata o cifra peste PRAG_FARA_CIFRA. */
  text: string;
  ton: TonExpirare;
  /** true doar cand promotia expira azi sau maine — pentru contorul live. */
  esteImediata: boolean;
}

/**
 * Traduce `zile_ramase` in eticheta afisabila.
 *
 * Returneaza `null` cand nu avem ce spune onest:
 *   - valoare lipsa / non-numerica (promotii importate din surse fara data de expirare)
 *   - valoare negativa = promotie deja expirata; pagina foloseste in locul ei quicklink-ul
 *     magazinului, deci o eticheta ar fi contrazis linkul.
 *
 * "Oferta activa" e folosit peste prag in loc de "Verificat azi" (textul vechi din cele doua
 * pagini care plafonau corect): "verificat azi" e o afirmatie despre ACTIUNEA noastra, care
 * devine falsa daca pipeline-ul sta — si a stat, 6 zile in iunie 2026, cf. CLAUDE.md.
 * "Oferta activa" e adevarat atata timp cat inregistrarea e in `output.json`, deci nu se poate
 * invechi tacut. Aceeasi regula ca la DESC_CATEG (22.08): o propozitie care nu poate deveni falsa.
 */
export function etichetaExpirare(zile: number | null | undefined): EtichetaExpirare | null {
  if (typeof zile !== "number" || !Number.isFinite(zile)) return null;
  if (zile < 0) return null;

  if (zile === 0) return { text: "Expiră azi", ton: "urgent", esteImediata: true };
  if (zile === 1) return { text: "Expiră mâine", ton: "urgent", esteImediata: true };
  if (zile <= PRAG_URGENT) return { text: `Expiră în ${zile} zile`, ton: "urgent", esteImediata: false };
  if (zile < PRAG_FARA_CIFRA) return { text: `${zile} zile rămase`, ton: "normal", esteImediata: false };

  return { text: "Ofertă activă", ton: "neutru", esteImediata: false };
}
