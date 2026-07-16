/**
 * Inlocuieste blocul inline de "card magazin" (bland: logo mic, nume, text generic
 * "Verifica ofertele curente", buton simplu) cu componenta partajata <MagazinCard/>
 * (logo mai mare, badge categorie, stare cod/oferta clara, copy-to-clipboard pt cod).
 * Adauga si o sectiune <NewsletterCTA/> inainte de blocul de produse (NisaProduse).
 *
 * Toate cele ~22 pagini de nisa (app/X/page.tsx) foloseau acelasi bloc `{magazine.map((m, i) => {...})}`
 * copy-paste, cu variatii minore de className/variabile (CULORI vs CULORI_BADGE,
 * text vs SVG pt sageata) — regex-ul de mai jos e tolerant la aceste variatii.
 *
 * Usage: node scripts/upgrade_merchant_cards.js <file1> <file2> ...
 */
const fs = require("fs");

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("Usage: node upgrade_merchant_cards.js <file1> <file2> ...");
  process.exit(1);
}

const CARD_BLOCK_RE = /\{magazine\.map\(\(m, i\) => \{[\s\S]*?\n(\s*)\}\)\}/;
const CARD_REPLACEMENT = "{magazine.map((m) => (\n              <MagazinCard key={m.magazin} m={m} />\n            ))}";

let totalChanges = 0;
for (const file of FILES) {
  let src = fs.readFileSync(file, "utf-8");
  const before = src;

  if (!CARD_BLOCK_RE.test(src)) {
    console.log(`SARIT (fara bloc card recunoscut): ${file}`);
    continue;
  }
  src = src.replace(CARD_BLOCK_RE, CARD_REPLACEMENT);

  // Import-uri: dupa ultimul import existent
  if (!src.includes('from "../components/MagazinCard"')) {
    src = src.replace(
      /(import [^\n]+ from "\.\.\/components\/NisaProduse";)/,
      'import MagazinCard from "../components/MagazinCard";\nimport NewsletterCTA from "../components/NewsletterCTA";\n$1'
    );
  }

  // Sectiune abonare, inainte de <NisaProduse
  if (!src.includes("<NewsletterCTA")) {
    src = src.replace(/(\n\s*<NisaProduse)/, "\n        <NewsletterCTA />\n$1");
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    totalChanges++;
    console.log(`Modificat: ${file}`);
  } else {
    console.log(`NESCHIMBAT (regex nu a prins): ${file}`);
  }
}
console.log(`\nTotal fisiere modificate: ${totalChanges}/${FILES.length}`);
