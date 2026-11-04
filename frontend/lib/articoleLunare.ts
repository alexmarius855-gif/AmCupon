/**
 * Unde duce adresa veche a unui articol lunar (05.11.2026).
 * Articolele de magazin au luna in adresa (`cod-reducere-otter-iunie-2026`). La luna urmatoare apare alt articol, iar adresa
 * veche dadea 404: orice pozitie castigata la Google se pierdea, in fiecare luna. Search Console arata 38 de astfel de pagini.
 * Acum duce la articolul lunii curente; daca nu mai exista unul, la pagina magazinului. Fara importuri: testul o citeste direct.
 */
const LUNI = "ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie";
const RE_LUNAR = new RegExp(`^(.+)-(?:${LUNI})-\\d{4}$`);

const cheie = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function adresaArticolVechi(slug: string, articole: string[], magazine: string[]): string | null {
  const g = slug.match(RE_LUNAR);
  if (!g) return null;
  const baza = g[1];
  const actual = articole.find((a) => a !== slug && a.match(RE_LUNAR)?.[1] === baza);
  if (actual) return `/blog/${actual}`;
  if (baza.startsWith("cod-reducere-")) {
    const dorit = cheie(baza.slice("cod-reducere-".length));
    const magazin = magazine.find((m) => !m.includes("/") && cheie(m.split(".")[0]) === dorit);
    // Magazin iesit din program: ramane 404, nu trimitem omul pe o pagina care nu spune ce a cautat.
    return magazin ? `/cod-reducere/${magazin}` : null;
  }
  // Rezumatele lunare fara urmas („cele mai bune reduceri ale saptamanii"): ofertele de azi sunt acelasi lucru.
  return "/oferte-azi";
}
