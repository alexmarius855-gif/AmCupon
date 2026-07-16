/**
 * Sweep final — inlocuieste ORICE ocurenta a hexurilor interzise auriu/sampanie,
 * indiferent de prefixul Tailwind (bg-/text-/border-/from-/to-/shadow-/hover:.../dark:...).
 * Script-ul retheme_dark_2026.js avea reguli per-prefix specifice si a scapat cateva
 * combinatii (ex. hover:border-[#e6d5a8], to-[#2e2410] in gradiente, shadow-[#c9a63e]).
 * Aici mapam direct hex->hex, pastrand prefixul intact.
 *
 * Usage: node scripts/purge_gold_leftover.js <file1> <file2> ...
 */
const fs = require("fs");

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("Usage: node purge_gold_leftover.js <file1> <file2> ...");
  process.exit(1);
}

const HEX_MAP = {
  "c9a63e": "14b8a6",
  "b8912e": "0d9488",
  "2e2410": "0a0f1a",
  "15120c": "0a0f1a",
  "26211a": "111827",
  "37301f": "1e293b",
  "0b0a07": "0a0f1a",
  "5a4718": "334155",
  "e6d5a8": "cbd5e1",
  "8c8064": "94a3b8",
  "d8c091": "cbd5e1",
  "a89a78": "94a3b8",
  "f5ead0": "f1f5f9",
  "e8e0d0": "f1f5f9",
};

const RE = new RegExp(`#(${Object.keys(HEX_MAP).join("|")})\\b`, "gi");

let totalChanges = 0;
let totalOccurrences = 0;
for (const file of FILES) {
  const src = fs.readFileSync(file, "utf-8");
  let count = 0;
  const out = src.replace(RE, (m, hex) => {
    count++;
    return `#${HEX_MAP[hex.toLowerCase()]}`;
  });
  if (count > 0) {
    fs.writeFileSync(file, out);
    totalChanges++;
    totalOccurrences += count;
    console.log(`Modificat: ${file} (${count} ocurente)`);
  }
}
console.log(`\nTotal fisiere modificate: ${totalChanges}/${FILES.length}, ${totalOccurrences} ocurente inlocuite`);
