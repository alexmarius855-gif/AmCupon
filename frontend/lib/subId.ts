/**
 * Sub-id de atribuire pe retele de afiliere — SURSA UNICA.
 *
 * Exista doua locuri care adauga sub-id: componenta client
 * `AffiliateClickTracker` (rescrie linkurile la click, pe site) si ruta server
 * `/go/[magazin]` (pentru linkuri din newsletter, social, oriunde nu ruleaza JS).
 * Daca fiecare si-ar tine propria harta de parametri, s-ar desincroniza — tiparul
 * care a lovit deja proiectul de doua ori (cardul de homepage 09.08, footerul
 * 16.08). De aceea harta sta AICI si o importa amandoua.
 *
 * Fiecare retea are alt nume de parametru. Verificate in documentatia lor:
 *   2Performant -> st=        Impact -> subId1=      Awin -> clickref=
 *   Profitshare -> sub_id=    CJ     -> sid=
 */

export const HOSTURI_AFILIERE = [
  "event.2performant.com",
  "pxf.io",
  "sjv.io",
  "impactradius",
  "impact.com",
  "awin1.com",
  "anrdoezrs.net",
  "prf.hn",
];

export const PARAM_SUBID: [RegExp, string][] = [
  [/event\.2performant\.com/i, "st"],
  [/pxf\.io|sjv\.io|impactradius|impact\.com/i, "subId1"],
  [/awin1\.com/i, "clickref"],
  [/anrdoezrs\.net|prf\.hn/i, "sid"],
];

export function esteLinkAfiliat(url: string): boolean {
  return !!url && HOSTURI_AFILIERE.some((h) => url.includes(h));
}

/** Normalizeaza eticheta: retelele accepta alfanumerice + `_`/`-`, iar unele o
 *  taie pe la ~50 de caractere si ar rupe valoarea la mijloc. */
export function curataEticheta(brut: string): string {
  return (brut || "").replace(/^\/|\/$/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 50) || "home";
}

/**
 * Adauga sub-id-ul retelei in URL. Daca parametrul are deja o valoare, o
 * PASTREAZA si adauga eticheta dupa `~` — altfel am sterge atribuirea pusa de
 * generatorul de linkuri.
 */
export function cuSubId(url: string, eticheta: string): string {
  if (!esteLinkAfiliat(url)) return url;
  const param = PARAM_SUBID.find(([re]) => re.test(url))?.[1];
  if (!param) return url;

  const tag = curataEticheta(eticheta);
  try {
    const u = new URL(url);
    const existent = u.searchParams.get(param);
    u.searchParams.set(param, existent ? `${existent}~${tag}` : tag);
    return u.toString();
  } catch {
    return url;      // URL malformat: mai bine nemodificat decat rupt
  }
}
