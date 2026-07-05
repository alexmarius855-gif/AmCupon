/* ──────────────────────────────────────────────────────────────────────────
   retheme_hex_to_gold.js — converteste gradienturile HEX rainbow hardcodate
   (violet/blue/cyan/pink/indigo) in paleta auriu-cald.
   Pastreaza intentionat: verde (#10b981.. = bani/verificat), rosu (#ef4444.. =
   urgenta), neutrele slate. Case-insensitive.

   Usage: node scripts/retheme_hex_to_gold.js <file1> <file2> ...
   ────────────────────────────────────────────────────────────────────────── */
const fs = require("fs");

// rainbow hex -> gold (nuante variate ca sa nu iasa gradienturi plate)
const MAP = {
  // violet / purple / indigo
  "#8b5cf6": "#c9a63e", "#a855f7": "#c9a63e", "#7c3aed": "#b8912e",
  "#6d28d9": "#b8912e", "#4338ca": "#9c7a26", "#a78bfa": "#d8c091",
  "#6366f1": "#c9a63e", "#4f46e5": "#b8912e", "#818cf8": "#d8c091",
  "#d946ef": "#c9a63e", "#7e22ce": "#b8912e", "#c084fc": "#d8c091",
  // blue / sky
  "#3b82f6": "#b8912e", "#2563eb": "#9c7a26", "#1e40af": "#7a5f1e",
  "#3730a3": "#7a5f1e", "#0ea5e9": "#b8912e", "#38bdf8": "#d8c091",
  "#1d4ed8": "#9c7a26", "#60a5fa": "#d8c091", "#93c5fd": "#e3d1a6",
  // cyan / teal
  "#06b6d4": "#9c7a26", "#0891b2": "#7a5f1e", "#22d3ee": "#d8c091",
  "#14b8a6": "#9c7a26", "#0d9488": "#9c7a26", "#67e8f9": "#e3d1a6",
  // pink / rose / fuchsia (decorative, nu urgenta)
  "#ec4899": "#d8c091", "#f43f5e": "#c9a63e", "#be185d": "#9c7a26",
  "#db2777": "#b8912e", "#f472b6": "#e3d1a6", "#fb7185": "#d8c091",
};

let totalFiles = 0, totalHits = 0;
for (const file of process.argv.slice(2)) {
  let src;
  try { src = fs.readFileSync(file, "utf8"); }
  catch { console.log(`SKIP (missing): ${file}`); continue; }
  let hits = 0;
  let out = src;
  for (const [from, to] of Object.entries(MAP)) {
    const re = new RegExp(from.replace("#", "#"), "gi");
    out = out.replace(re, (m) => { hits++; return to; });
  }
  if (hits > 0) {
    fs.writeFileSync(file, out, "utf8");
    totalFiles++; totalHits += hits;
    console.log(`  ${hits.toString().padStart(3)}  ${file}`);
  }
}
console.log(`\nTotal: ${totalHits} inlocuiri hex in ${totalFiles} fisiere.`);
