/**
 * Test pentru lib/oferta.ts — ruleaza cu:  node lib/oferta.test.mjs   (din frontend/)
 *
 * Cazurile sunt REALE, din output.json, gasite de revizia adversariala din 23.09.2026.
 * Fiecare pica pe versiunea initiala a functiilor — de-aia sunt aici: un test care nu
 * poate pica nu verifica nimic. Iese cu cod 1 la prima asteptare incalcata.
 * A doua parte trece prin TOATE promotiile din public/output.json si cauta clasele de
 * eroare, nu cazuri anume: valoare care nu apare in text, cod ramas in titlu, titlu gol.
 */
import { readFileSync } from "node:fs";
import { valoareOferta, faraCod } from "./oferta.ts";

let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};
const v = (nume, descriere = "", cod = "") => {
  const r = valoareOferta({ nume, descriere, cod_cupon: cod, zile_ramase: 99 });
  return r.prefix ? `${r.prefix} ${r.text}` : r.text;
};

console.log("\n── valoareOferta ──");
verifica("„pana la -70%\" (expomob) pastreaza „pana la\"", v("Reduceri de pana la -70%"), "până la 70%");
verifica("„up to 50%\" (jojofashion)", v("Lichidari de stoc - up to 50% off"), "până la 50%");
verifica("„bis zu 55%\" (redodopower.de)", v("Prime Day bei Redodo – Frühzugang mit bis zu 55% Rabatt", "", "PRIME10"), "până la 55%");
verifica("„9.5% off\" nu devine -5% (tvcmall)", v("9.5% off on first bulk order", "", "TVC26Q3A95NEW"), "-9,5%");
verifica("„144% sRGB\" nu devine -44% (geekbuying)", v("CONGKBH27", "USD $17 Off monitor 27 inch 144% sRGB"), "Ofertă");
verifica("comisionul afiliatului nu e reducere", v("Castiga 19% comision pentru fiecare vanzare"), "Ofertă");
verifica("pragul „peste 200 lei\" nu e reducere", v("Transport gratuit la comenzi peste 200 lei"), "Livrare gratuită");
verifica("reducere reala in lei", v("Cupon Libris: 50 lei extra reducere la comenzi de min 500 lei", "", "LIB50"), "-50 lei");
verifica("procent simplu", v("Reducere 10% la tot cosul", "", "JOLLY10"), "-10%");
verifica("interval 10-30% = pana la 30%", v("Reduceri 10-30% la colectia noua"), "până la 30%");
verifica("„100% bumbac\" in descriere nu e reducere", v("Tricou nou", "Material 100% bumbac, 95% cotton blend"), "Ofertă");
verifica("cod fara valoare = „Reducere\", nu inventat", v("Cod de bun venit", "", "WELCOME"), "Reducere");

console.log("\n── faraCod ──");
verifica("„– Cod LAMODA\" scos din titlu",
  faraCod("Reducere la încălțăminte bărbătească din piele naturală – Cod LAMODA", "LAMODA"),
  "Reducere la încălțăminte bărbătească din piele naturală");
verifica("„Incaltamintelamoda.ro\" ramane intreg; fraza nu se rupe",
  faraCod("Descoperă colecția Incaltamintelamoda.ro și profită de ofertă folosind codul LAMODA. Toate produsele", "LAMODA"),
  "Descoperă colecția Incaltamintelamoda.ro și profită de ofertă folosind codul de reducere. Toate produsele");
verifica("„Freedom\" din titlu nu e codul FREEDOM",
  faraCod("Freedom & Fiesta month at Temptation Cancun Resort", "FREEDOM"),
  "Freedom & Fiesta month at Temptation Cancun Resort");
verifica("„-code:WECREAT\" scos, „wecreat\" din text ramane",
  faraCod("5% off for all wecreat products!-code:WECREAT", "WECREAT"),
  "5% off for all wecreat products!");
verifica("minusul din „-20%\" de la inceput ramane", faraCod("-20% la toata colectia cu codul X20", "X20"), "-20% la toata colectia cu codul de reducere");
verifica("titlu = doar codul (Impact) -> gol, nu codul", faraCod("QUBER10", "QUBER10"), "");

// ── Toate promotiile reale ───────────────────────────────────────────────────
console.log("\n── pe toate promotiile din public/output.json ──");
const magazine = JSON.parse(readFileSync(new URL("../public/output.json", import.meta.url), "utf-8"));
let total = 0, valoriFalse = [], coduriRamase = [], titluriGoale = 0;
for (const m of magazine) {
  for (const p of m.promotii || []) {
    total++;
    const cod = String(p.cod_cupon || "").trim();
    const text = `${p.nume || ""} ${p.descriere || ""}`;
    const r = valoareOferta({ nume: p.nume || "", descriere: String(p.descriere || ""), cod_cupon: cod, zile_ramase: 99 });
    const cifra = (r.text.match(/\d+(?:,\d)?/) || [])[0];
    // orice cifra afisata trebuie sa existe, ca atare, in textul ofertei
    if (cifra && !text.replace(/\./g, ",").includes(cifra)) valoriFalse.push(`${m.magazin}: „${r.text}\" din „${text.slice(0, 70)}\"`);
    const t = faraCod(p.nume || "", cod);
    if (cod.length >= 4 && new RegExp(`(?<![\\p{L}\\p{N}])${cod.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u").test(t))
      coduriRamase.push(`${m.magazin}: ${t.slice(0, 70)}`);
    if (!t) titluriGoale++;
  }
}
console.log(`  promotii verificate: ${total}`);
console.log(`  valori care nu apar in textul ofertei: ${valoriFalse.length}`); valoriFalse.slice(0, 5).forEach((x) => console.log("    " + x));
console.log(`  coduri ramase in titlu: ${coduriRamase.length}`); coduriRamase.slice(0, 5).forEach((x) => console.log("    " + x));
console.log(`  titluri care erau doar codul (acum inlocuite cu descrierea): ${titluriGoale}`);
if (valoriFalse.length || coduriRamase.length) esecuri++;

console.log(esecuri ? `\n  ${esecuri} ESECURI` : "\n  Toate testele trec.");
process.exit(esecuri ? 1 : 0);
