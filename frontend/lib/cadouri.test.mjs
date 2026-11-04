// node lib/cadouri.test.mjs (din frontend/). Pica daca o pagina de cadouri primeste iar produse nepotrivite.
import fs from "node:fs";
import assert from "node:assert/strict";
import { produseOcazie, REGULA_OCAZIE, simplu } from "./cadouri.ts";

const img = "https://x.ro/a.jpg";
const p = (title, cat_slug, price = 100, merchant_slug = "a.ro") => ({ title, cat_slug, price, image: img, merchant_slug });

const titluri = (slug, lista) => produseOcazie(slug, lista).map((x) => x.title);
assert.deepEqual(titluri("copii", [p("Pantofi stiletto Norea negri", "fashion"), p("Masinuta Metalica Porsche", "copii")]), ["Masinuta Metalica Porsche"]);
assert.deepEqual(titluri("botez", [p("Pantofi stiletto Norea negri", "fashion"), p("Set trusou Muselina bebe", "copii"), p("Masinuta metalica", "copii")]), ["Set trusou Muselina bebe"]);
assert.deepEqual(titluri("nastere", [p("Pistol pneumatic telescopic", "auto"), p("Magneziu Bisglicinat", "farmacie"), p("Colier cu perle", "bijuterii")]), ["Colier cu perle"]);
assert.deepEqual(titluri("ea", [p("Capat freza carbid", "beauty"), p("Rochie de zi", "fashion"), p("Parfum barbati", "beauty")]), ["Rochie de zi"]);
assert.deepEqual(titluri("el", [p("Uscator de rufe", "casa"), p("Noptiera", "casa"), p("Tricou pentru bărbați", "fashion"), p("Tricou dama", "fashion")]), ["Tricou pentru bărbați"]);
assert.deepEqual(titluri("absolvire", [p("Husa pentru telefon", "electronice"), p("Casti wireless", "electronice")]), ["Casti wireless"]);

// Bugetul se respecta, iar un singur magazin nu ia toata pagina.
assert.equal(produseOcazie("sub-100-lei", [p("Colier scump", "bijuterii", 500)], undefined, 100).length, 0);
assert.equal(produseOcazie("copii", Array.from({ length: 20 }, (_, i) => p(`Jucarie ${i}`, "copii"))).length, 6);
assert.equal(simplu("Bărbați"), "barbati");

// Pe datele reale: toate produsele fiecarei pagini trec regula, iar paginile au de unde alege.
const d = JSON.parse(fs.readFileSync("public/products.json", "utf-8"));
const toate = Array.isArray(d) ? d : d.products;
const pagini = {};
for (const slug of Object.keys(REGULA_OCAZIE)) {
  const lista = produseOcazie(slug, toate);
  pagini[slug] = lista.length;
  for (const x of lista) assert.ok(REGULA_OCAZIE[slug].categorii.includes(x.cat_slug), `${slug}: ${x.title}`);
}
console.log("Produse pe pagina:", JSON.stringify(pagini));
console.log("Toate testele trec.");
