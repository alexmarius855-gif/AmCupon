/** Test pentru ingest-2p.mts — node scripts/ingest-2p.test.mts. Iese cu cod 1 la prima asteptare incalcata. */
import { amprentaCod, comisionDin, curataHtml, pretDin, pretVechiValid, slugify, slugProdus } from "./ingest-2p.mts";

let esecuri = 0;
const verifica = (nume: string, primit: unknown, asteptat: unknown) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

verifica("slug fara diacritice", slugify("Mașină de spălat, 6 kg — Clasă A"), "masina-de-spalat-6-kg-clasa-a");
verifica("slug gol ramane gol", slugify("!!!"), "");
verifica("slug scurtat fara cratima la coada", slugify(`${"ab ".repeat(40)}`).endsWith("-"), false);
verifica("acelasi titlu, magazine diferite: adrese diferite", slugProdus("Tv", "a.ro", "1") === slugProdus("Tv", "b.ro", "1"), false);
verifica("aceeasi intrare: aceeasi adresa", slugProdus("Tv", "a.ro", "1"), slugProdus("Tv", "a.ro", "1"));
verifica("titlu fara litere: tot are adresa", slugProdus("???", "a.ro", "1").startsWith("produs-"), true);
verifica("html scos", curataHtml("<p>Pret <b>bun</b> &amp; livrare&nbsp;rapida</p>"), "Pret bun & livrare rapida");
verifica("script scos cu tot cu continut", curataHtml("A<script>alert(1)</script>B"), "A B");
verifica("html gol", curataHtml(null), "");
verifica("pret cu virgula", pretDin("1.234,56"), 1234.56);
verifica("pret cu punct", pretDin("1,234.56"), 1234.56);
verifica("pret simplu", pretDin("1421.99"), 1421.99);
verifica("pret lipsa", pretDin(undefined), 0);
verifica("pret vechi valid", pretVechiValid(100, "150"), 150);
verifica("pret vechi mai mic: nu", pretVechiValid(100, "90"), null);
verifica("pret vechi egal: nu", pretVechiValid(100, "100"), null);
verifica("pret vechi de peste 3 ori: eroare din feed", pretVechiValid(100, "999"), null);
verifica("comision procent", comisionDin("10.5%"), 10.5);
verifica("comision absurd", comisionDin("500"), null);
verifica("comision lipsa", comisionDin(""), null);
verifica("cod: aceeasi amprenta la fiecare rulare", amprentaCod("a.ro", "x", "C1"), amprentaCod("a.ro", "x", "C1"));
verifica("cod: alt cod, alta amprenta", amprentaCod("a.ro", "x", "C1") === amprentaCod("a.ro", "x", "C2"), false);

if (esecuri) { console.log(`\n${esecuri} ESECURI`); process.exit(1); }
console.log("\nToate trec.");
