/**
 * Potrivirea tab-ului curent cu un magazin din extensie.json — separata de popup ca sa se poata
 * testa fara browser (extension/test_potrivire.mjs).
 */

function gazda(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Potrivire EXACTA pe domeniu: „notino.ro" sau un subdomeniu al lui („m.notino.ro").
 *  Niciodata pe subsir — ciorna din 26.05 potrivea `needle.includes(slug)`, deci pe „tino.ro"
 *  ar fi aratat ofertele Notino (docs/LECTII-TEHNICE.md #1). Castiga cheia cea mai lunga. */
function gasesteMagazin(magazine, host) {
  if (!magazine || !host) return null;
  let gasit = null;
  for (const cheie of Object.keys(magazine)) {
    if (host === cheie || host.endsWith("." + cheie)) {
      if (!gasit || cheie.length > gasit.length) gasit = cheie;
    }
  }
  return gasit ? magazine[gasit] : null;
}

if (typeof module !== "undefined") module.exports = { gazda, gasesteMagazin };
