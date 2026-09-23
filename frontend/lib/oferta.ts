/**
 * Ce arata cardul de oferta: valoarea (blocul mare din stanga) si titlul fara cod.
 * Functii PURE, fara React — ca sa poata fi testate pe datele reale
 * (frontend/lib/oferta.test.mjs) si refolosite de orice pagina care afiseaza oferte.
 * Folosite de app/components/CuponCard.tsx.
 */

export interface PromotieCupon {
  nume: string;
  descriere?: string;
  cod_cupon?: string;
  zile_ramase: number;
}

type Valoare = { text: string; prefix?: string; marime: "mare" | "medie" | "mica" };

export const RE_LIVRARE = /transport gratuit|livrare gratuit|free shipping/i;

// ── Extragerea valorii — fiecare regula de aici are in spate un caz REAL din output.json,
//    gasit de revizia adversariala din 23.09.2026 rulata pe datele de productie. ──────────
/** „pana la 70%", „pana la -70%" (expomob, craftup, autobob), „up to 50%" (jojofashion),
 *  „upto 20%" (cllix), „bis zu 55%" (redodopower.de). Fara „pana la", blocul promitea
 *  reducerea MAXIMA ca reducere garantata — regula din 19.08, bannerele sociale. */
const RE_PANA_LA = /(?:p[aâ]n[aă]\s+la|up\s*to|bis\s+zu|jusqu['’]?\s*(?:à|a)|hasta|fino\s+a)\s*-?\s*(\d{1,2}(?:[.,]\d)?)\s*%/i;
/** „10-30%" / „intre 10% si 30%" = „pana la 30%". */
const RE_INTERVAL = /(?:(?:între|intre|between)\s*(\d{1,2})\s*%?\s*(?:și|si|and|-)\s*|(?<![\d.,])(\d{1,2})[-–])(\d{1,2})\s*%/i;
/** Ancorat la stanga: fara ancora, „9.5% off" (tvcmall) iesea „-5%", iar „144% sRGB" iesea „-44%". */
const RE_PROCENT = /(?<![\d.,])(\d{1,2}(?:[.,]\d)?)\s*%/g;
/** Un procent langa „comision" e castigul AFILIATULUI, nu reducerea cumparatorului — tiparul
 *  „comision afisat ca Cashback", eliminat de trei ori din proiect (LECTII-TEHNICE #10). */
const RE_COMISION = /comision|commission|affiliat|afiliat|payout/i;
/** Procente care descriu produsul, nu pretul: gama de culori, compozitia materialului. */
const RE_NU_E_PRET = /^\s*(?:srgb|dci|adobe|ntsc|rec\.?\s*709|bumbac|cotton|l[aâ]n[aă]|wool|poliester|polyester|m[aă]tase|silk|abv|alc|vol\b|umiditate|humidity)/i;
const RE_REDUCERE_DUPA = /^\s*(?:off|reducere|discount|rabatt|remise|descuento|sconto|mai\s+ieftin)/i;
const RE_REDUCERE_INAINTE = /(?:-|reducere(?:\s+de)?|discount(?:\s+de)?|save|economise[sș]ti)\s*$/i;
/** Suma in lei doar langa un cuvant de reducere: „la comenzi peste 200 lei" e un prag. Minusul
 *  conteaza doar precedat de spatiu — altfel „100-200 lei" ar deveni „-200 lei". */
const RE_LEI = /(?:(?:^|\s)-\s*|reducere(?:\s+de)?\s+|discount(?:\s+de)?\s+)(\d{2,4})\s*(?:de\s*)?lei|(?<![\d.,])(\d{2,4})\s*(?:de\s*)?lei\s+(?:reducere|discount|extra)/i;

const fmt = (n: string) => n.replace(".", ",");

function procentDin(text: string, strict: boolean): Valoare | null {
  const pana = text.match(RE_PANA_LA);
  if (pana) return { text: `${fmt(pana[1])}%`, prefix: "până la", marime: "mare" };
  const iv = text.match(RE_INTERVAL);
  if (iv) {
    const jos = Number(iv[1] ?? iv[2]);
    if (Number(iv[3]) > jos) return { text: `${iv[3]}%`, prefix: "până la", marime: "mare" };
  }
  for (const m of text.matchAll(RE_PROCENT)) {
    const i = m.index ?? 0;
    const inainte = text.slice(Math.max(0, i - 28), i);
    const dupa = text.slice(i + m[0].length, i + m[0].length + 24);
    if (RE_COMISION.test(inainte) || RE_COMISION.test(dupa)) continue;
    if (RE_NU_E_PRET.test(dupa)) continue;
    // In DESCRIERE procentul trebuie sa fie vizibil o reducere; in titlu, contextul e oferta.
    if (strict && !RE_REDUCERE_DUPA.test(dupa) && !RE_REDUCERE_INAINTE.test(inainte)) continue;
    return { text: `-${fmt(m[1])}%`, marime: "mare" };
  }
  return null;
}

/**
 * Ce castigi, intr-o cifra sau un cuvant — DOAR din textul ofertei, nimic dedus.
 * Titlul intai (acolo e oferta); descrierea doar cu reguli stricte, fiindca descrierile din
 * retele contin specificatii de produs si procente care nu sunt reduceri.
 */
export function valoareOferta(p: PromotieCupon): Valoare {
  const titlu = p.nume || "";
  const desc = p.descriere || "";
  const pct = procentDin(titlu, false) ?? procentDin(desc, true);
  if (pct) return pct;
  const lei = titlu.match(RE_LEI) ?? desc.match(RE_LEI);
  if (lei) return { text: `-${lei[1] ?? lei[2]} lei`, marime: "medie" };
  if (RE_LIVRARE.test(`${titlu} ${desc}`)) return { text: "Livrare gratuită", marime: "mica" };
  return { text: p.cod_cupon ? "Reducere" : "Ofertă", marime: "mica" };
}

/**
 * Scoate codul din text. Titlul din retea il contine uneori („… – Cod LAMODA"): afisat asa,
 * omul il copiaza fara sa dea click, deci fara comision.
 *
 * Codul se scoate DOAR ca token intreg si cu majusculele lui. Prima versiune il stergea ca
 * subsir, fara sa tina cont de litere mari: „Incaltamintelamoda.ro" devenea „Incaltaminte.ro"
 * (cod LAMODA), „Freedom & Fiesta" devenea „& Fiesta" (cod FREEDOM), „wecreat" disparea din
 * „all wecreat products". Iar „folosind codul X" ramane o fraza intreaga, nu una rupta.
 */
export function faraCod(text: string, cod?: string): string {
  if (!text) return "";
  if (!cod) return text.trim();
  const esc = cod.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tok = `(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`;
  return text
    .replace(new RegExp(`(folosind|folose[sș]te|cu|aplic[aă]|introdu)\\s+(codul|cod)\\s*:?\\s*${tok}`, "giu"), "$1 codul de reducere")
    .replace(new RegExp(`(use|using|with|enter)\\s+(the\\s+)?code\\s*:?\\s*${tok}`, "giu"), "$1 code")
    .replace(new RegExp(`\\s*[–—-]?\\s*(?:codul|cod|code)\\s*:?\\s*${tok}`, "giu"), "")
    .replace(new RegExp(tok, "gu"), "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    // la inceput nu taiem cratima: e minusul din „-20%"
    .replace(/^[\s:,–—]+|[\s:,–—-]+$/g, "")
    .trim();
}
