/**
 * Partea de BROWSER a numaratorii de clicuri anonime (vezi lib/clicuri.ts pentru motiv si pentru ce NU
 * stocam). Un singur loc care trimite beaconul, folosit de `AffiliateClickTracker` (clic pe <a>) si de
 * `useCopyCod` (dezvaluirea unui cod, care deschide magazinul cu window.open — adica exact clicurile
 * cele mai valoroase, pe care un tracker de <a> nu le vede).
 *
 * Nu arunca niciodata si nu asteapta nimic: un link nu are voie sa se rupa din cauza numaratorii.
 */
export function numaraClick(href: string, magazin?: string): void {
  try {
    if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;
    navigator.sendBeacon(
      "/api/click",
      JSON.stringify({ href, pagina: window.location.pathname, ref: document.referrer, magazin }),
    );
  } catch {
    /* ignora */
  }
}
