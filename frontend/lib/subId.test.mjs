/**
 * Test pentru lib/subId.ts — ruleaza cu:  node lib/subId.test.mjs   (din frontend/)
 * Eticheta de campanie (01.11.2026): fara ea, vanzarile din reclame si de pe flyer nu se pot
 * deosebi de cele organice in raportul local (scripts/raport_venit.py).
 */
import { etichetaCampanie, cuSubId } from "./subId.ts";

let esec = 0;
function verifica(nume, primit, asteptat) {
  const ok = primit === asteptat;
  if (!ok) esec++;
  console.log(`${ok ? "  ok  " : "  PICA"}  ${nume}${ok ? "" : `: ${JSON.stringify(primit)} (asteptat ${JSON.stringify(asteptat)})`}`);
}

verifica("reclama Google cu utm", etichetaCampanie("?utm_source=google&utm_medium=cpc&utm_campaign=bf-noriel"), "c-google-bf-noriel");
verifica("doar gclid = google, fara campanie", etichetaCampanie("?gclid=abc123"), "c-google");
verifica("flyerul (redirectul /oferte)", etichetaCampanie("?utm_source=flyer&utm_medium=print&utm_campaign=oferte"), "c-flyer-oferte");
verifica("vizita organica = fara eticheta", etichetaCampanie("?q=telefon"), "");
verifica("caractere ciudate curatate", etichetaCampanie("?utm_source=meta&utm_campaign=Black Friday 2026!"), "c-meta-Black_Friday_2026_");
verifica("lungime maxima 40", etichetaCampanie(`?utm_source=google&utm_campaign=${"x".repeat(90)}`).length, 40);
verifica("cuSubId pastreaza ce exista si adauga dupa ~",
  cuSubId("https://event.2performant.com/events/click?st=c-google-bf", "newsletter").includes("st=c-google-bf%7Enewsletter"), true);

if (esec) {
  console.log(`\n${esec} asteptari incalcate`);
  process.exit(1);
}
console.log("\nTOATE TREC");
