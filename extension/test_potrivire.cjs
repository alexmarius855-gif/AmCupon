// Ruleaza: node extension/test_potrivire.cjs   (iese cu 1 la prima asteptare incalcata)
// Cazul „tino.ro" e bug-ul ciornei din 26.05: `"notinoro".includes("tinoro")` e adevarat, deci
// pe un magazin necunoscut extensia ar fi aratat ofertele si linkul de afiliere Notino.
const { gazda, gasesteMagazin } = require("./potrivire.js");

let esecuri = 0;
function verifica(nume, primit, asteptat) {
  if (primit === asteptat) console.log(`  ok    ${nume}`);
  else { esecuri++; console.log(`  PICA  ${nume}\n        primit: ${primit}\n        asteptat: ${asteptat}`); }
}

const m = { "notino.ro": { nume: "Notino" }, "eur.vevor.com": { nume: "Vevor" }, "vevor.com": { nume: "Vevor global" } };
const nume = (host) => (gasesteMagazin(m, host) || { nume: null }).nume;

verifica("www. scos din gazda", gazda("https://www.notino.ro/parfumuri/"), "notino.ro");
verifica("domeniul exact", nume("notino.ro"), "Notino");
verifica("subdomeniu", nume("m.notino.ro"), "Notino");
verifica("tino.ro NU e notino.ro (bug-ul ciornei)", nume("tino.ro"), null);
verifica("xnotino.ro NU e notino.ro", nume("xnotino.ro"), null);
verifica("notino.ro.evil.com NU e notino.ro", nume("notino.ro.evil.com"), null);
verifica("castiga cheia cea mai lunga", nume("eur.vevor.com"), "Vevor");
verifica("url invalid", gazda("nu e url"), null);

if (esecuri) { console.log(`\n${esecuri} verificari picate.`); process.exit(1); }
console.log("\nToate verificarile au trecut.");
