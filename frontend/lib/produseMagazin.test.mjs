/**
 * Test pentru lib/produseMagazin.ts si lib/seoIndexable.ts — ruleaza cu:
 *   node lib/produseMagazin.test.mjs   (din frontend/)
 *
 * Partea 1: cazurile REALE din 07.10.2026 — fiecare a trecut de potrivirea pe subsir
 * (`startsWith(prim label)` / `includes(prim label)`), deci pica pe versiunea veche.
 * Partea 2: trece prin TOT products.json si verifica invariantul care lipsea: un produs
 * apare pe pagina unui SINGUR magazin, iar un magazin care are produse nu pierde niciunul.
 * Iese cu cod 1 la prima asteptare incalcata — un test care nu poate pica nu verifica nimic.
 */
import { readFileSync } from "node:fs";
import { alMagazinului } from "./produseMagazin.ts";
import { buildMerchantTokens, areProduseInFeed } from "./seoIndexable.ts";

let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

// ── Partea 1: cazurile prinse pe site ───────────────────────────────────────
console.log("Potrivire produs -> magazin (cazuri reale):");
verifica("10qaroma.ro nu e Roborock (prim label „ro”)", alMagazinului({ merchant_slug: "10qaroma.ro", merchant: "10qaroma.ro" }, "ro.roborock.com"), false);
verifica("anticexlibris.ro nu e libris.ro (subsir)", alMagazinului({ merchant_slug: "anticexlibris.ro", merchant: "Anticexlibris" }, "libris.ro"), false);
verifica("bitmi.ro nu e mi.com (Xiaomi)", alMagazinului({ merchant_slug: "bitmi.ro", merchant: "Bitmi" }, "mi.com"), false);
verifica("navstore.ro nu e store.hiby.com", alMagazinului({ merchant_slug: "navstore.ro" }, "store.hiby.com"), false);
verifica("europroduse.ro nu e eu.alpinestars.com", alMagazinului({ merchant_slug: "europroduse.ro" }, "eu.alpinestars.com"), false);
verifica("vevor.com.au nu e vevor.com", alMagazinului({ merchant_slug: "vevor.com.au" }, "vevor.com"), false);
verifica("produsul propriu libris.ro ramane", alMagazinului({ merchant_slug: "libris.ro", merchant: "Libris" }, "libris.ro"), true);
verifica("majuscule si spatii nu conteaza", alMagazinului({ merchant_slug: " Libris.RO " }, "libris.ro"), true);
verifica("slug gol nu potriveste nimic", alMagazinului({ merchant_slug: "", merchant: "" }, ""), false);

console.log("\nIndexare (are produse in feed?):");
const tok = buildMerchantTokens([{ merchant_slug: "store.boyamic.com", merchant: "Boyamic" }, { merchant_slug: "curteaveche.ro", merchant: "Curteaveche" }]);
verifica("store.hiby.com NU are produse (prefixul „store” nu e brand)", areProduseInFeed("store.hiby.com", tok), false);
verifica("store.boyamic.com are produse", areProduseInFeed("store.boyamic.com", tok), true);
verifica("curteaveche.ro are produse", areProduseInFeed("curteaveche.ro", tok), true);

// ── Partea 2: tot feed-ul ───────────────────────────────────────────────────
const raw = JSON.parse(readFileSync(new URL("../public/products.json", import.meta.url), "utf-8"));
const produse = raw.products || raw;
const magazine = JSON.parse(readFileSync(new URL("../public/output.json", import.meta.url), "utf-8")).map((m) => m.magazin);
const slugMagazin = new Set(magazine.map((s) => s.toLowerCase()));
const tokens = buildMerchantTokens(produse);

console.log(`\nInvarianti pe ${produse.length} produse si ${magazine.length} magazine:`);
// Invariantul complet: fiecare produs, contra fiecarui magazin (~19 mil. de comparatii, ~secunde).
let multiple = 0, pierdute = 0;
const exempleMultiple = [];
for (const p of produse) {
  let n = 0;
  for (const s of magazine) if (alMagazinului(p, s)) n++;
  if (n > 1) { multiple++; if (exempleMultiple.length < 3) exempleMultiple.push(p.title); }
  if (n === 0 && slugMagazin.has((p.merchant_slug || "").toLowerCase().trim())) pierdute++;
}
if (exempleMultiple.length) console.log("  exemple pe mai multe pagini:", exempleMultiple);
verifica("niciun produs pe paginile a doua magazine", multiple, 0);
verifica("niciun produs pierdut de magazinul lui", pierdute, 0);

// Cel mai scump invariant, pe esantion: cele 39 de pagini din 07.10 nu primesc produse straine.
const fostContaminate = ["ro.roborock.com", "mi.com", "libris.ro", "de.eureka.com", "store.hiby.com", "eu.alpinestars.com", "lu.ro", "pi.inc"];
for (const s of fostContaminate) {
  if (!slugMagazin.has(s)) continue;
  const straine = produse.filter((p) => alMagazinului(p, s) && (p.merchant_slug || "").toLowerCase().trim() !== s);
  verifica(`${s}: 0 produse ale altui magazin`, straine.length, 0);
}
const fals = magazine.filter((s) => areProduseInFeed(s, tokens) && !produse.some((p) => alMagazinului(p, s)));
verifica("indexarea si pagina sunt de acord (are produse <=> le arata)", fals, []);

console.log(esecuri ? `\n${esecuri} ESECURI` : "\nTOATE TREC");
process.exit(esecuri ? 1 : 0);
