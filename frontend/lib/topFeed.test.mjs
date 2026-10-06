/**
 * Test pentru lib/topFeed.ts — ruleaza cu:  node lib/topFeed.test.mjs   (din frontend/)
 *
 * Partea 1: cazuri REALE din products.json, prinse la calibrarea regulilor (05.10.2026).
 * Fiecare caz „exclus" a trecut de o versiune anterioara a regulilor — de-aia e aici.
 * Partea 2: trece prin TOT feed-ul cu linkul platit REAL (lib/linkMagazin.ts) si verifica
 * invariantii pe fiecare produs ales: magazin platit, link cu tracking, pret peste prag,
 * gamele de pret in ordine, fara produs repetat.
 * Iese cu cod 1 la prima asteptare incalcata — un test care nu poate pica nu verifica nimic.
 */
import { readFileSync } from "node:fs";
import { produseTema, sectiuneTema, titluAfisat, familie, imagineSigura, normTitlu, temaArticol, REGULI_TEME, ARTICOLE_TEME, PRAG_PRODUSE } from "./topFeed.ts";
import { areLinkAfiliat, GAZDE_TRACKING } from "./linkMagazin.ts";

let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

// ── Partea 1: potrivirea, pe titluri reale ──────────────────────────────────
const platit = () => true;
const urmarit = () => true;
const intra = (tema, title, price, extra = {}) =>
  produseTema(tema, [{ title, price, url: "https://event.2performant.com/x", merchant_slug: "magazin.ro", ...extra }], platit, urmarit).length === 1;

console.log("Potrivire (cazuri prinse la calibrare):");
verifica("purificator de APA nu e purificator de aer", intra("purificatoare-aer", "Purificator cu osmoza inversa Ecosoft P URE AquaCalcium 75GPD", 1108), false);
verifica("purificator de aer intra", intra("purificatoare-aer", "Purificator de aer Philips 2000i, filtru HEPA", 899), true);
verifica("aparat foto „pachet cu geanta” nu e geanta", intra("genti-dama", "Sony A7III/28-70mm Pachet cu geanta si minitrepied on the GO - Default Title", 10295), false);
verifica("posetă cu diacritice intra", intra("genti-dama", "Poșetă tote femei Steve Madden Shirley neagră cu logo", 769), true);
verifica("detergent „cu Nano-Argint” nu e bijuterie", intra("bijuterii-argint", "Detergent Profesional Anticalcar cu Nano-Argint pentru Baie și Duș Nanomax", 40), false);
verifica("cercei din argint intra", intra("bijuterii-argint", "Cercei din argint cu ametiste de 3.26ct si zirconii", 550), true);
verifica("cutia de bijuterii nu e bijuterie", intra("bijuterii-argint", "Cutie depozitare pentru inel si cercei din argint, catifea", 59), false);
verifica("aspirator vertical CU fir nu e fara fir", intra("aspiratoare-fara-fir", "Aspirator vertical, cu fir, cu abur si aspirare umed-uscata, 750 W", 2299), false);
verifica("aspirator vertical fara fir intra", intra("aspiratoare-fara-fir", "Aspirator vertical fara fir MOVA S7 Cordless Stick Vacuum, 170AW", 1299), true);
verifica("test medical „Proteina C Reactiva” nu e supliment", intra("suplimente-fitness", "Test rapid Proteina C Reactiva Self Care, 1 bucata, Barza", 36.9), false);
verifica("husa de laptop nu e laptop", intra("laptopuri", "Husa laptop 15.6 inch, neopren, neagra", 89), false);
verifica("display de schimb nu e laptop", intra("laptopuri", "Display Laptop BOE NV156FHM-A11 pentru ecran 15.6\", 30 pini", 637), false);
verifica("laptop cu SSD si RAM in titlu intra", intra("laptopuri", "Laptop Acer Aspire 3 15 (A315-44P-R5AZ), AMD Ryzen 7 5700U, 16 GB DDR4, SSD 512 GB", 1599), true);
verifica("laptop resigilat nu intra", intra("laptopuri", "Laptop Dell Latitude 5490 resigilat, i5-8350U", 999), false);
verifica("husa de iPhone nu e telefon", intra("telefoane", "Husa MagSafe pentru Apple iPhone 14 Pro Max, ESR, Classic Hybrid", 105.99), false);
verifica("baby monitor nu e monitor", intra("monitoare", "Baby Monitor Video 2.4GHz fara WiFi cu Camera si Ecran 7 cm", 199), false);
verifica("monitor de ritm cardiac nu e monitor", intra("monitoare", "Monitor de ritm cardiac HRM 10.1", 209.9), false);
verifica("parfum cu feromoni nu intra la parfumuri", intra("parfumuri-barbati", "Parfum natural cu feromoni, Love & Desire, pentru barbati, 15 ml", 58.49), false);
verifica("mostra de 2 ml nu trece de pretul minim", intra("parfumuri-barbati", "Parfum Avignon For Men - 2 ml", 5), false);
verifica("apa de parfum intra", intra("parfumuri-femei", "Lattafa - Yara Candy, apa de parfum, femei, 100 ml", 120), true);
verifica("jucarie de lemn „aparat de cafea” nu e espressor", intra("cafetiere", "Jucarie din lemn aparat de cafea pentru copii, 8 piese", 71), false);
verifica("magazin fara link platit nu intra", produseTema("laptopuri", [{ title: "Laptop HP 250 G10", price: 2100, url: "https://event.2performant.com/x", merchant_slug: "neplatit.ro" }], (s) => s !== "neplatit.ro", urmarit).length, 0);
verifica("link fara tracking nu intra", produseTema("laptopuri", [{ title: "Laptop HP 250 G10", price: 2100, url: "https://magazin.ro/laptop", merchant_slug: "magazin.ro" }], platit, (u) => GAZDE_TRACKING.test(u)).length, 0);
verifica("carucior de curte / remorca de bicicleta nu e carucior de copil", intra("carucioare", "CARUCIOR DE CURTE, REMORCA DE BICICLETA 2 IN 1, GC-023A - Default Title", 435), false);
verifica("carucior tip vagon pentru gradina nu e carucior de copil", intra("carucioare", "CARUCIOR – TIP VAGON PENTRU TRANSPORT GRADINA, CURTE, COPII, KMB – 012", 405), false);
verifica("carucior sport intra", intra("carucioare", "Carucior sport, Lionelo, Cloe Plus, Cu accesorii, Cadru din aluminiu", 994.99), true);
verifica("camera auto SPATE e accesoriu, nu dashcam", intra("camere-auto", "Camera auto spate 70mai RC22 Rear Camera - Default Title", 139), false);
verifica("dashcam intra", intra("camere-auto", "Camera auto 70mai Dash Cam M310 Plus, rezolutie camera 3K", 279), true);
verifica("articol -> tema", temaArticol("cel-mai-bun-smartwatch-2026")?.tema, "smartwatch-uri");
verifica("articol fara tema -> null", temaArticol("cea-mai-buna-drona-2026"), null);
verifica("fiecare articol mapat are o regula", Object.values(ARTICOLE_TEME).every((t) => REGULI_TEME[t.tema]), true);
verifica("tema fara regula nu primeste nimic", produseTema("televizoare", [{ title: "Televizor LED Samsung 55", price: 2500, url: "x", merchant_slug: "m.ro" }], platit, urmarit).length, 0);

console.log("Titluri afisate:");
verifica("entitate HTML decodata", titluAfisat("Monitor Touchscreen 19&quot; pentru POS OptimX Pro MY19"), 'Monitor Touchscreen 19" pentru POS OptimX Pro MY19');
verifica("sufix Shopify scos", titluAfisat("Espressor manual, LELIT Anna PL41TEM - Default Title"), "Espressor manual, LELIT Anna PL41TEM");
verifica("titlu dublat de feed, o data", titluAfisat("Casti Wireless Over-Ear Sony WHCH520B Casti Wireless Over-Ear Sony WHCH520B"), "Casti Wireless Over-Ear Sony WHCH520B");
verifica("simbol decorativ scos", titluAfisat("Telefon Apple iPhone 18 Pro 256GB ※"), "Telefon Apple iPhone 18 Pro 256GB");
verifica("imagine http trecuta pe https", imagineSigura("http://1cctv.ro/167663/monitor-dell.jpg"), "https://1cctv.ro/167663/monitor-dell.jpg");
verifica("imagine „0” respinsa", imagineSigura("0"), null);
verifica("titlu in loc de imagine respins", imagineSigura("Pantofi Casual Dama - Savana"), null);
verifica("variantele de culoare = acelasi model", familie("Espressor clasic, GAGGIA E24 - Roșu") === familie("Espressor clasic, GAGGIA E24 - INOX"), true);
verifica("modele diferite raman diferite", familie("Aspirator robot cu mop MOVA E50 Ultra") === familie("Aspirator robot cu mop MOVA E40 Ultra"), false);

console.log("Sectiunea:");
const p = (pret, mag, i) => ({ title: `Laptop Model ${i} ${mag}`, price: pret, url: "u", merchant_slug: mag });
verifica("sub prag de produse: fara sectiune", sectiuneTema([1, 2, 3, 4, 5].map((x) => p(x * 1000, x % 2 ? "a.ro" : "b.ro", x))), null);
verifica("un singur magazin: fara sectiune", sectiuneTema([1, 2, 3, 4, 5, 6, 7].map((x) => p(x * 1000, "a.ro", x))), null);
const s = sectiuneTema([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => p(x * 500, x % 3 ? "a.ro" : "b.ro", x)));
verifica("trei game in ordine de pret", s && s.game.map((g) => [g.de_la, g.pana_la]), [[500, 2000], [2500, 4000], [4500, 6000]]);
verifica("mediana", s && s.median, 3250);

// ── Partea 2: tot feed-ul real ──────────────────────────────────────────────
console.log("\nFeed-ul real (public/products.json):");
const produse = JSON.parse(readFileSync("public/products.json", "utf-8")).products;
const magazine = JSON.parse(readFileSync("public/output.json", "utf-8"));
const platite = new Set(magazine.filter((m) => areLinkAfiliat(m)).map((m) => m.magazin));
let cuSectiune = 0;
for (const tema of Object.keys(REGULI_TEME)) {
  const r = REGULI_TEME[tema];
  const lista = produseTema(tema, produse, (x) => platite.has(x), (u) => GAZDE_TRACKING.test(u));
  const sec = sectiuneTema(lista);
  for (const x of lista) {
    if (!platite.has(x.merchant_slug)) { esecuri++; console.log(`  PICA  ${tema}: magazin neplatit ${x.merchant_slug}`); }
    if (!GAZDE_TRACKING.test(x.url)) { esecuri++; console.log(`  PICA  ${tema}: link fara tracking ${x.url}`); }
    if (x.price < r.pretMin) { esecuri++; console.log(`  PICA  ${tema}: pret sub prag ${x.price}`); }
  }
  if (sec) {
    cuSectiune++;
    const afisate = sec.game.flatMap((g) => g.produse);
    if (new Set(afisate).size !== afisate.length) { esecuri++; console.log(`  PICA  ${tema}: produs afisat de doua ori`); }
    for (let i = 1; i < sec.game.length; i++) {
      if (sec.game[i].de_la < sec.game[i - 1].pana_la) { esecuri++; console.log(`  PICA  ${tema}: gamele se suprapun`); }
    }
    for (const g of sec.game) for (const x of g.produse) {
      if (x.price < g.de_la || x.price > g.pana_la) { esecuri++; console.log(`  PICA  ${tema}: ${x.price} in afara gamei ${g.eticheta}`); }
    }
    if (!(sec.min <= sec.median && sec.median <= sec.max)) { esecuri++; console.log(`  PICA  ${tema}: min/mediana/max`); }
  }
  console.log(`  ${tema.padEnd(22)} ${String(lista.length).padStart(4)} produse  ${sec ? `${sec.magazine.length} magazine, ${sec.game.length} game, ${sec.game.reduce((a, g) => a + g.produse.length, 0)} afisate` : `fara sectiune (prag ${PRAG_PRODUSE}/2 magazine)`}`);
}
console.log(`\n${cuSectiune} teme cu sectiune.`);

console.log("\nArticolele de blog (ARTICOLE_TEME):");
let articoleCuSectiune = 0;
for (const [art, t] of Object.entries(ARTICOLE_TEME)) {
  const lista = produseTema(t.tema, produse, (x) => platite.has(x), (u) => GAZDE_TRACKING.test(u))
    .filter((p) => !t.filtru || t.filtru.test(normTitlu(p.title)));
  const sec = sectiuneTema(lista, 4, t.minMagazine);
  if (sec) articoleCuSectiune++;
  if (t.filtru) for (const x of lista) if (!t.filtru.test(normTitlu(x.title))) { esecuri++; console.log(`  PICA  ${art}: filtrul nu s-a aplicat`); }
  console.log(`  ${art.padEnd(34)} ${String(lista.length).padStart(4)} produse  ${sec ? `${sec.magazine.length} magazine, ${sec.game.length} game` : "fara sectiune"}`);
}
console.log(`${articoleCuSectiune} articole cu sectiune.`);
if (articoleCuSectiune < 12) { esecuri++; console.log("  PICA  prea putine articole cu sectiune"); }
if (cuSectiune < 10) { esecuri++; console.log("  PICA  prea putine teme cu sectiune — s-a schimbat formatul feed-ului?"); }

console.log(esecuri ? `\n${esecuri} ESECURI` : "\nTOATE TREC");
process.exit(esecuri ? 1 : 0);
