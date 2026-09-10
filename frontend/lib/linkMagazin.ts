/**
 * Linkul de ieșire către magazin — SURSA UNICA de adevăr.
 *
 * De ce există: pe 10.09.2026, auditul a găsit TREI definiții diferite ale întrebării
 * „e ăsta un link afiliat real?", în trei fișiere, care nu erau de acord între ele:
 *   · `MagazinCard.tsx`   — `isValidAffiliateUrl`: verifica doar tiparul stricat `/NA6?`
 *   · `api/admin/status`  — `REAL_TRACKING_RE`: lista de gazde de tracking cunoscute
 *   · nicăieri            — nimeni nu verifica `url_afiliat === url`, cazul cel mai frecvent
 * Plus tiparul `m.url_afiliat || m.url`, răspândit în șapte fișiere, care trimitea clicul
 * pe linkul normal al magazinului când cel afiliat lipsea.
 *
 * Efectul măsurat: 37 din 1.153 de magazine n-au link afiliat (34 Impact fără link generat
 * + 3 adăugate manual). Pe paginile lor, butoanele de vizitare dădeau clicuri gratis —
 * iar clicul de pe pagina unui magazin e cel mai valoros de pe tot site-ul, fiindcă vine
 * după ce omul s-a hotărât.
 *
 * Al treilea episod al aceleiași lecții, după „Cashback" (07.09) și `cod_cupon: true` fără
 * cod (09.09): nimeni nu scrie „trimite clicul fără comision"; scrie „dacă n-avem, pune
 * altceva". Reparat la nivelul potrivit — funcția întoarce `null`, iar apelantul SARE
 * elementul în loc să-l înlocuiască cu ceva care seamănă.
 */

/** Gazde care chiar fac tracking. Aceeași listă folosită de `/api/admin/status`. */
export const GAZDE_TRACKING =
  /pxf\.io|sjv\.io|impactradius|impact\.com|irclickid|prf\.hn|anrdoezrs\.net|2performant\.com|profitshare\.ro|awin1\.com|cread\.php|event\.2performant/i;

/** Tipar de link Impact generat greșit, fără campanie. Nu duce nicăieri util. */
const LINK_STRICAT = /\/NA6[?&]/;

interface MagazinCuLink {
  url?: string | null;
  url_afiliat?: string | null;
}

/**
 * Linkul afiliat real al magazinului, sau `null` dacă nu are unul.
 *
 * Întoarce null când:
 *   · `url_afiliat` lipsește;
 *   · e identic cu `url` — valoarea implicită pusă de importer când rețeaua n-a dat link;
 *   · e un link Impact stricat (`/NA6?`).
 */
export function linkAfiliat(m: MagazinCuLink): string | null {
  const afiliat = (m.url_afiliat || "").trim();
  if (!afiliat) return null;
  if (afiliat === (m.url || "").trim()) return null;
  if (LINK_STRICAT.test(afiliat)) return null;
  return afiliat;
}

/** True dacă magazinul poate primi trafic monetizat. */
export function areLinkAfiliat(m: MagazinCuLink): boolean {
  return linkAfiliat(m) !== null;
}

/**
 * Destinația unui click pe o promoție: pagina ofertei dacă e validă, altfel linkul afiliat.
 * `null` înseamnă „nu avem unde trimite" — elementul nu se afișează.
 *
 * `landing_page` se acceptă doar dacă e pe o gazdă de tracking sau diferă de site-ul simplu
 * al magazinului; altfel ar fi tot un click nemonetizat, doar pe altă adresă.
 */
export function linkPromotie(
  m: MagazinCuLink,
  promo?: { landing_page?: string | null; zile_ramase?: number } | null,
): string | null {
  const lp = (promo?.landing_page || "").trim();
  const activa = !promo || (promo.zile_ramase ?? 0) >= 0;
  if (activa && lp && !LINK_STRICAT.test(lp)) {
    if (GAZDE_TRACKING.test(lp) || lp !== (m.url || "").trim()) return lp;
  }
  return linkAfiliat(m);
}
