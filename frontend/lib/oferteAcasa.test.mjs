/**
 * Test pentru lib/oferteAcasa.ts — ruleaza cu:  node lib/oferteAcasa.test.mjs   (din frontend/)
 *
 * Prima parte: cazuri construite pentru fiecare regula (depox exclus, expirate, fara link
 * platit, maximum 2 pe magazin, filtre moarte ascunse, acordul „de"). Fiecare pica daca
 * regula e scoasa din cod — un test care nu poate pica nu verifica nimic.
 * A doua parte trece prin public/output.json cu linkul platit REAL (lib/linkMagazin.ts).
 * Iese cu cod 1 la prima asteptare incalcata.
 */
import { readFileSync } from "node:fs";
import {
  oferteAcasa, numaraFiltre, filtreAfisate, alegeAfisate, treceFiltru,
  oferteDePeMagazin, magazinePopulareAcasa, cuNumar, EXCLUSE_ACASA,
} from "./oferteAcasa.ts";
import { linkPromotie } from "./linkMagazin.ts";
import { PRAG_URGENT } from "./expirarePromo.ts";
import { MAGAZINE_POPULARE } from "./magazinePopulare.ts";

let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

console.log("\n── cuNumar (acordul cu „de\") ──");
verifica("1", cuNumar(1, "cod", "coduri"), "1 cod");
verifica("2", cuNumar(2, "cod", "coduri"), "2 coduri");
verifica("19", cuNumar(19, "cod", "coduri"), "19 coduri");
verifica("20", cuNumar(20, "cod", "coduri"), "20 de coduri");
verifica("100", cuNumar(100, "cod", "coduri"), "100 de coduri");
verifica("101", cuNumar(101, "cod", "coduri"), "101 coduri");
verifica("188", cuNumar(188, "ofertă", "oferte"), "188 de oferte");

console.log("\n── reguli, pe date construite ──");
const P = (nume, cod = "", zile = 10) => ({ nume, descriere: "", cod_cupon: cod, landing_page: "", zile_ramase: zile });
const sint = [
  { magazin: "depox.ro", logo_url: "x", promotii: [P("Reducere 20% la tot", "DEPOX20")] },
  { magazin: "cinci.ro", logo_url: "x", promotii: [1, 2, 3, 4, 5].map((i) => P(`Reducere ${i}0% la comenzi`, `C${i}`)) },
  { magazin: "expirat.ro", logo_url: "x", promotii: [P("Reducere 10% la tot", "EXP", -1)] },
  { magazin: "faralink.ro", logo_url: "x", promotii: [P("Reducere 15% la produse", "FL")] },
  { magazin: "strain.com", logo_url: "x", promotii: [P("Summer sale 30% off", "SUM")] },
  { magazin: "oferta.ro", logo_url: "x", promotii: [P("Transport gratuit la comenzi", "", 1)] },
];
const linkFals = (m) => (m.magazin === "faralink.ro" ? null : `https://track.example/${m.magazin}`);
const pool = oferteAcasa(sint, linkFals);
const din = (s) => pool.filter((o) => o.m.magazin === s).length;
verifica("depox.ro nu intra, nici cu cod", din("depox.ro"), 0);
verifica("oferta expirata nu intra", din("expirat.ro"), 0);
verifica("oferta fara link platit nu intra", din("faralink.ro"), 0);
verifica("pool = 5 + 1 strain + 1 oferta", pool.length, 7);
verifica("textul in engleza vine dupa cele romanesti", pool[pool.length - 1].m.magazin, "strain.com");
verifica("la text romanesc, codul inaintea ofertei fara cod",
  pool.findIndex((o) => !o.cod) > pool.findIndex((o) => o.cod), true);
const n = numaraFiltre(pool, PRAG_URGENT);
verifica("numaratoare", n, { toate: 7, cod: 6, oferta: 1, curand: 1 });
const afis = alegeAfisate(pool, "toate", PRAG_URGENT);
verifica("maximum 2 de la acelasi magazin", afis.filter((o) => o.m.magazin === "cinci.ro").length, 2);
verifica("exclude scoate exact oferta din panou",
  alegeAfisate(pool, "toate", PRAG_URGENT, { exclude: pool[0].cheie }).some((o) => o.cheie === pool[0].cheie), false);
verifica("filtrul „cod\" nu lasa oferte fara cod", alegeAfisate(pool, "cod", PRAG_URGENT).every((o) => o.cod), true);
// Revizia din 24.09.2026: oferta din panou era exclusa la ORICE filtru, dar numarata in contor.
const urgenta = pool.find((o) => o.zile <= PRAG_URGENT);
verifica("singura oferta urgenta e cea din panou: „Expiră curând\" nu deschide o grila goala",
  alegeAfisate(pool, "curand", PRAG_URGENT, { exclude: urgenta.cheie }).length, 1);
// Revizia din 24.09.2026: „â" din textul stricat („â\u0080\u0093") trecea drept litera romaneasca.
const stricat = oferteAcasa([
  { magazin: "hotel.com", logo_url: "x", promotii: [P("Jusqu'Ã 45 % de rÃ©duction â\u0080\u0093 SÃ©jour", "", "HOTEL45")] },
  { magazin: "biciclete.ro", logo_url: "x", promotii: [P("Extragarantie 2+3 ani la biciclete")] },
], linkFals);
verifica("textul stricat nu trece drept romanesc: oferta romaneasca fara cod iese prima",
  stricat.map((o) => o.m.magazin), ["biciclete.ro", "hotel.com"]);
verifica("filtre: fara buton mort, fara buton inutil",
  filtreAfisate({ toate: 5, cod: 5, oferta: 0, curand: 0 }), []);
verifica("filtre: doar cele care schimba ceva",
  filtreAfisate({ toate: 5, cod: 2, oferta: 3, curand: 0 }), ["toate", "cod", "oferta"]);
const pop = magazinePopulareAcasa(sint, ["depox.ro", "oferta.ro"], new Set(["cinci.ro"]), 3);
verifica("populare: depox exclus, preferatele intai, apoi cele cu oferta",
  pop.map((m) => m.magazin), ["oferta.ro", "cinci.ro", "expirat.ro"]);

// ── Datele reale ──────────────────────────────────────────────────────────────
console.log("\n── pe public/output.json ──");
const magazine = JSON.parse(readFileSync(new URL("../public/output.json", import.meta.url), "utf-8"));
const real = oferteAcasa(magazine, linkPromotie);
let totalPromo = 0;
for (const m of magazine) totalPromo += (m.promotii || []).length;
const nr = numaraFiltre(real, PRAG_URGENT);
console.log(`  ${totalPromo} promotii in date -> ${real.length} pe prima pagina (${nr.cod} cu cod, ${nr.oferta} fara, ${nr.curand} expira curand)`);
verifica("nicio oferta de la un magazin exclus", real.some((o) => EXCLUSE_ACASA.has(o.m.magazin)), false);
verifica("fiecare oferta are link platit", real.every((o) => typeof o.link === "string" && o.link.length > 0), true);
verifica("toate = cu cod + fara cod", nr.toate, nr.cod + nr.oferta);
verifica("cheile sunt unice", new Set(real.map((o) => o.cheie)).size, real.length);
for (const f of new Set(["toate", ...filtreAfisate(nr)])) {
  const a = alegeAfisate(real, f, PRAG_URGENT);
  const per = {};
  for (const o of a) per[o.m.magazin] = (per[o.m.magazin] || 0) + 1;
  verifica(`filtrul „${f}\": ${a.length} carduri, toate trec filtrul, max 2/magazin`,
    a.every((o) => treceFiltru(o, f, PRAG_URGENT)) && Math.max(0, ...Object.values(per)) <= 2 && a.length <= 12, true);
}
const peMag = oferteDePeMagazin(real);
const popReal = magazinePopulareAcasa(magazine, MAGAZINE_POPULARE.map((x) => x.slug), new Set(peMag.keys()));
console.log(`  magazine populare: ${popReal.map((m) => m.magazin).join(", ")}`);
verifica("12 magazine populare, toate cu logo, fara depox",
  popReal.length === 12 && popReal.every((m) => m.logo_url && !EXCLUSE_ACASA.has(m.magazin)), true);

console.log(esecuri ? `\n  ${esecuri} ESECURI` : "\n  Toate testele trec.");
process.exit(esecuri ? 1 : 0);
