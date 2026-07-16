/**
 * Curatenie dupa upgrade_merchant_cards.js — numeAfisat, CULORI si NUME_OVERRIDE locale
 * au ramas orfane in cele ~22 pagini de nisa (mutate in components/MagazinCard.tsx,
 * care are propriul numeAfisat + NUME_OVERRIDE incorporat).
 *
 * Usage: node scripts/cleanup_orphaned_card_helpers.js <file1> <file2> ...
 */
const fs = require("fs");

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("Usage: node cleanup_orphaned_card_helpers.js <file1> <file2> ...");
  process.exit(1);
}

const PATTERNS = [
  /const NUME_OVERRIDE: Record<string, string> = \{[^}]*\};\r?\n/g,
  /function numeAfisat\(s: string\) \{\r?\n(?:.*\r?\n)*?\}\r?\n/g,
  /function numeAfisat\(s: string\) \{ return [^\r\n]*\r?\n/g,
  /const CULORI(?:_\w+)? = \[.*?\];\r?\n/g,
];

let totalChanges = 0;
for (const file of FILES) {
  let src = fs.readFileSync(file, "utf-8");
  const before = src;
  for (const re of PATTERNS) {
    src = src.replace(re, "");
  }
  if (src !== before) {
    fs.writeFileSync(file, src);
    totalChanges++;
    console.log(`Modificat: ${file}`);
  }
}
console.log(`\nTotal fisiere modificate: ${totalChanges}/${FILES.length}`);
