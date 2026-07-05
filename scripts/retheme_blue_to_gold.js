/* ──────────────────────────────────────────────────────────────────────────
   retheme_blue_to_gold.js — converteste ramasitele de tema albastra/indigo
   (blue/indigo/sky/violet) in paleta auriu-cald a AmCupon.

   Mapare pe ROL (nu 1:1), ca sa arate premium:
     - fundal inchis (bg/from/to/via shade >=800, fara opacity) -> #1a1408 / #15120c
     - accent solid (bg fara opacity, shade 500-700)            -> #b8912e
     - accent translucid / border / ring / shadow / gradient    -> #c9a63e (+opacity)
     - text deschis (text shade <=400)                          -> #e3d1a6
     - text accent (text shade >=500)                           -> #c9a63e

   Usage: node scripts/retheme_blue_to_gold.js <file1> <file2> ...
   ────────────────────────────────────────────────────────────────────────── */
const fs = require("fs");

// Familii convertite -> auriu. Pastram intentionat: red (urgenta/discount),
// emerald/green (verificat), yellow (rating), amber ramane doar ca warning real.
const RE = /\b(bg|text|border|from|via|to|ring|shadow|fill|stroke|divide|outline|decoration|placeholder|accent|caret)-(blue|indigo|sky|violet|cyan|teal|purple|fuchsia|rose|pink|lime|amber|orange)-(\d{2,3})(\/\d{1,3})?/g;

function goldFor(util, shade, op) {
  const s = parseInt(shade, 10);
  // Fundal / gradient inchis (doar solid, fara opacity)
  if (!op && (util === "bg" || util === "from" || util === "to" || util === "via")) {
    if (s >= 800) return util === "via" ? "via-[#15120c]" : `${util}-[#1a1408]`;
  }
  let hex;
  if (util === "text") hex = s <= 400 ? "#e3d1a6" : "#c9a63e";
  else if (util === "bg" && !op) hex = s >= 600 ? "#b8912e" : "#c9a63e";
  else hex = "#c9a63e";
  return `${util}-[${hex}]${op || ""}`;
}

let totalFiles = 0, totalHits = 0;
for (const file of process.argv.slice(2)) {
  let src;
  try { src = fs.readFileSync(file, "utf8"); }
  catch { console.log(`SKIP (missing): ${file}`); continue; }
  let hits = 0;
  const out = src.replace(RE, (m, util, family, shade, op) => {
    hits++;
    return goldFor(util, shade, op);
  });
  if (hits > 0) {
    fs.writeFileSync(file, out, "utf8");
    totalFiles++; totalHits += hits;
    console.log(`  ${hits.toString().padStart(3)}  ${file}`);
  }
}
console.log(`\nTotal: ${totalHits} inlocuiri in ${totalFiles} fisiere.`);
