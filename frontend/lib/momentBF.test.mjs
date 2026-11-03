/**
 * Test pentru lib/momentBF.ts — ruleaza cu:  node lib/momentBF.test.mjs   (din frontend/)
 * Iese cu cod 1 la prima asteptare incalcata.
 */
import { fazaBF, calendarScurt, aziRomania, promoBF } from "./momentBF.ts";

let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

const d = { an: 2026, emag: "2026-11-06", international: ["2026-11-27", "2026-11-30"] };
verifica("septembrie: inchis", fazaBF("2026-09-20", d), "inchis");
verifica("azi: inainte de eMAG", fazaBF("2026-11-03", d), "inainte-emag");
verifica("ziua eMAG e tot inainte", fazaBF("2026-11-06", d), "inainte-emag");
verifica("a doua zi: intre valuri", fazaBF("2026-11-07", d), "intre-valuri");
verifica("primul val international", fazaBF("2026-11-27", d), "international");
verifica("ultima zi", fazaBF("2026-11-30", d), "international");
verifica("1 decembrie: inchis, nu ramane un BF trecut", fazaBF("2026-12-01", d), "inchis");
verifica("fisier neactualizat, anul urmator: inchis", fazaBF("2027-11-03", d), "inchis");

const C = (magazin, start, final) => ({ magazin, nume: magazin, start, final });
const lista = [C("a", "2026-10-20", "2026-11-01"), C("b", "2026-10-29", "2026-11-15"), C("d", "2026-11-05", "2026-11-09"), C("c", "2026-11-04", "2026-11-08")];
const cal = calendarScurt("2026-11-03", lista);
verifica("in curs: fara cea terminata", cal.inCurs, 1);
verifica("urmeaza: numara tot", cal.urmeaza, 2);
verifica("urmatoarele, in ordinea startului", cal.urmatoare.map((x) => x.magazin), ["c", "d"]);
verifica("limita", calendarScurt("2026-11-03", lista, 1).urmatoare.length, 1);

verifica("promoBF: oferta de Black Friday", promoBF("Black Friday la Editura Casa: reduceri"), true);
verifica("promoBF: fara subsir („blackfridge\")", promoBF("Husa blackfridge 20%"), false);
verifica("promoBF: Cyber Monday", promoBF("CYBER MONDAY -30%"), true);
verifica("22:30 UTC pe 5.11 e deja 6.11 in Romania", aziRomania(new Date("2026-11-05T22:30:00Z")), "2026-11-06");

console.log(esecuri ? `\n${esecuri} asteptari incalcate` : "\nToate trec.");
process.exit(esecuri ? 1 : 0);
