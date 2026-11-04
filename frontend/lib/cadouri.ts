/**
 * Ce produse intra pe o pagina de cadouri (04.11.2026).
 * Paginile alegeau doar dupa categorie, deci „Cadouri pentru Copii" si „Cadouri Botez" incepeau cu pantofi stiletto,
 * iar „Cadouri de Nastere" cu un pistol pneumatic. Acum titlul produsului trebuie sa spuna ca se potriveste ocaziei,
 * iar o pagina cu prea putine produse potrivite nu se publica deloc. Fara importuri: testul o citeste direct.
 */
export const MIN_PRODUSE_OCAZIE = 8;
const PE_MAGAZIN = 6;

/** Categoria magazinului (output.json) -> categoria produselor (products.json, scripts/categorii_produse.py). */
export const CATEGORIE_PAGINA: Record<string, string> = {
  fashion: "fashion", electronice: "electronice", beauty: "beauty", sport: "sport", "casa-gradina": "casa", copii: "copii",
  sanatate: "farmacie", "carti-educatie": "carti", "auto-moto": "auto", animale: "animale", "mancare-bauturi": "alimente", bijuterii: "bijuterii",
};

export function simplu(t: string): string {
  return (t || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const BIJUTERII = "colier\\w*|cercei|bratara|bratari|inel|pandantiv\\w*";
const PARFUM = "apa de parfum|parfum";
const JOCURI = "joc|puzzle|monopoly|lego";
const JUCARII = "jucarie|jucarii|papusa|masinuta";
const FARA_ACCESORII = /\b(husa|snur|suport|difuzor|camera|recondition\w*|refurbished|resigilat\w*)\b/;

const PENTRU_EA = { categorii: ["bijuterii", "beauty", "fashion"], titlu: new RegExp(`\\b(dama|femei|femeie|rochie|geanta|esarfa|${BIJUTERII}|${PARFUM})\\b`), nu: /\b(barbat\w*|copii|fetite|baieti|camera|difuzor)\b/ };
const PENTRU_EL = { categorii: ["fashion", "beauty", "electronice", "sport"], titlu: /\b(barbat\w*|smartwatch|casti|ceas)\b/, nu: /\b(dama|femei|copii|fetite|baieti|husa|suport)\b/ };
const LA_BUGET = { categorii: ["bijuterii", "beauty", "copii", "jocuri", "fashion", "electronice"], titlu: new RegExp(`\\b(${PARFUM}|set cadou|geanta|portofel|ceas|esarfa|casti|smartwatch|${BIJUTERII}|${JUCARII}|${JOCURI})\\b`), nu: FARA_ACCESORII };

export const REGULA_OCAZIE: Record<string, { categorii: string[]; titlu: RegExp; nu?: RegExp }> = {
  ea: PENTRU_EA,
  mama: PENTRU_EA,
  el: PENTRU_EL,
  tata: PENTRU_EL,
  copii: { categorii: ["copii", "jocuri"], titlu: /./, nu: /resigilat\w*/ },
  botez: { categorii: ["copii"], titlu: /\b(botez|bebe|bebelus\w*|trusou|suzeta|biberon)\b/ },
  nasi: { categorii: ["bijuterii"], titlu: /./, nu: /(logodna|verighet\w*|inteligent)/ },
  nastere: { categorii: ["bijuterii", "jocuri", "beauty"], titlu: new RegExp(`\\b(set cadou|${BIJUTERII}|${JOCURI}|${PARFUM})\\b`), nu: FARA_ACCESORII },
  valentine: { categorii: ["bijuterii", "beauty"], titlu: new RegExp(`\\b(${BIJUTERII}|${PARFUM})\\b`), nu: FARA_ACCESORII },
  craciun: { categorii: ["copii", "jocuri", "bijuterii", "beauty"], titlu: new RegExp(`\\b(set cadou|${JUCARII}|${JOCURI}|${BIJUTERII}|${PARFUM})\\b`), nu: FARA_ACCESORII },
  absolvire: { categorii: ["electronice", "bijuterii"], titlu: new RegExp(`\\b(laptop|casti|smartwatch|tableta|telefon|ceas|${BIJUTERII})\\b`), nu: FARA_ACCESORII },
  pasti: { categorii: ["copii", "jocuri", "alimente", "beauty"], titlu: new RegExp(`\\b(set cadou|ciocolat\\w*|bomboan\\w*|biscuit\\w*|miere|${JUCARII}|${JOCURI}|${PARFUM})\\b`), nu: FARA_ACCESORII },
  "sub-100-lei": LA_BUGET,
  "sub-200-lei": LA_BUGET,
  "sub-500-lei": LA_BUGET,
  "peste-500-lei": LA_BUGET,
};

export interface ProdusCadou {
  title?: string;
  image?: string;
  price: number;
  cat_slug?: string;
  discount_pct?: number;
  old_price?: number | null;
  merchant_slug?: string;
  merchant?: string;
}

/** Produsele paginii: potrivite ocaziei, in bugetul ei, cu reducerile primele si fara ca un magazin sa ia toata pagina. */
export function produseOcazie<T extends ProdusCadou>(slug: string, toate: T[], pretMin?: number, pretMax?: number, maxim = 36): T[] {
  const r = REGULA_OCAZIE[slug];
  if (!r) return [];
  const potrivite = toate.filter((p) => {
    if (!p.image || p.image.length <= 5 || !(p.price > 0) || !r.categorii.includes(p.cat_slug || "")) return false;
    if (pretMax && p.price > pretMax) return false;
    if (pretMin && p.price < pretMin) return false;
    const t = simplu(p.title || "");
    return r.titlu.test(t) && !(r.nu && r.nu.test(t));
  });
  const cuReducere = potrivite.filter((p) => (p.discount_pct || 0) > 0 || p.old_price);
  const fara = potrivite.filter((p) => !p.discount_pct && !p.old_price);
  const pe: Record<string, number> = {};
  const vazute = new Set<string>();
  const rez: T[] = [];
  for (const p of [...cuReducere, ...fara]) {
    const m = p.merchant_slug || p.merchant || "";
    if ((pe[m] || 0) >= PE_MAGAZIN || vazute.has(p.title || "")) continue;
    pe[m] = (pe[m] || 0) + 1;
    vazute.add(p.title || "");
    rez.push(p);
    if (rez.length >= maxim) break;
  }
  return rez;
}
