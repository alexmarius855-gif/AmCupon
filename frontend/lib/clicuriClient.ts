/**
 * Partea de BROWSER a numaratorii de clicuri anonime (vezi lib/clicuri.ts pentru motiv si pentru ce NU
 * stocam). Un singur loc care trimite beaconul, folosit de `AffiliateClickTracker` (clic pe <a>) si de
 * `useCopyCod` (dezvaluirea unui cod, care deschide magazinul cu window.open — adica exact clicurile
 * cele mai valoroase, pe care un tracker de <a> nu le vede).
 *
 * Nu arunca niciodata si nu asteapta nimic: un link nu are voie sa se rupa din cauza numaratorii.
 */
export function numaraClick(href: string, magazin?: string, loc?: string): void {
  try {
    if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;
    navigator.sendBeacon(
      "/api/click",
      JSON.stringify({ href, pagina: window.location.pathname, ref: document.referrer, magazin, loc }),
    );
  } catch {
    /* ignora */
  }
}

/**
 * Zona din pagina unde s-a dat clicul, ca sa stim CE element converteste (card de oferta, buton de cod,
 * link din articol, antet) si nu doar pe ce pagina. Un element isi poate declara zona cu `data-loc="..."`
 * (are prioritate); altfel se deduce din reperele paginii. Doar o eticheta scurta, fara continut din pagina.
 */
export function locDinElement(el: Element | null): string {
  try {
    const declarat = el?.closest("[data-loc]")?.getAttribute("data-loc");
    if (declarat && /^[a-z0-9_-]{1,30}$/.test(declarat)) return declarat;
    if (el?.closest("header, nav")) return "antet";
    if (el?.closest("footer")) return "subsol";
    if (el?.closest("article.cc, [class*='cc-']")) return "oferta";
    if (el?.closest("article")) return "articol";
    if (el?.closest("main")) return "continut";
  } catch {
    /* ignora */
  }
  return "altele";
}
