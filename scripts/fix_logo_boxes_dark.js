/**
 * Fix vizibilitate logo-uri pe fundal dark.
 *
 * Cutiile mici de logo (w-N h-N rounded-xl overflow-hidden ... shrink-0) au fost
 * convertite orb la bg-[#111827] (dark) de retheme_dark_2026.js, la fel ca orice
 * alt card alb. Problema: logo-urile magazinelor sunt PNG-uri cu fundal transparent
 * proiectate pentru fundal alb (text/forme inchise la culoare) — pe cardul dark
 * devin ilizibile sau invizibile.
 *
 * Fix: orice className cu semnatura "w-N h-N rounded-(lg|xl|2xl) overflow-hidden"
 * (cutie mica patrata/dreptunghiulara = logo, nu card de continut) care contine
 * bg-[#111827] este readus la un chip alb (bg-[#ffffff]) — acelasi pattern folosit
 * istoric in retheme_pages.js ("protectie logo box-uri albe").
 *
 * Usage: node scripts/fix_logo_boxes_dark.js <file1> <file2> ...
 */
const fs = require("fs");

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("Usage: node fix_logo_boxes_dark.js <file1> <file2> ...");
  process.exit(1);
}

// Cauta bg-[#111827] care apare DUPA semnatura de cutie-logo, in acelasi className (pana la ")
// Varianta 1: cu overflow-hidden explicit
const LOGO_BOX_RE = /(w-\d+\s+h-\d+\s+rounded-(?:lg|xl|2xl)\s+overflow-hidden[^"`]*?)bg-\[#111827\]/g;
// Varianta 2: fara overflow-hidden, bg vine imediat dupa rounded-X (acelasi tip de cutie mica patrata)
const LOGO_BOX_RE2 = /(w-\d+\s+h-\d+\s+rounded-(?:lg|xl|2xl)\s+)bg-\[#111827\]/g;

let totalChanges = 0;
let totalOccurrences = 0;
for (const file of FILES) {
  const src = fs.readFileSync(file, "utf-8");
  let count = 0;
  let out = src.replace(LOGO_BOX_RE, (m, pre) => {
    count++;
    return `${pre}bg-[#ffffff]`;
  });
  out = out.replace(LOGO_BOX_RE2, (m, pre) => {
    count++;
    return `${pre}bg-[#ffffff]`;
  });
  if (count > 0) {
    fs.writeFileSync(file, out);
    totalChanges++;
    totalOccurrences += count;
    console.log(`Modificat: ${file} (${count} cutii logo)`);
  }
}
console.log(`\nTotal fisiere modificate: ${totalChanges}/${FILES.length}, ${totalOccurrences} cutii logo readuse la alb`);
