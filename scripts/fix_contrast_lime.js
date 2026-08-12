/**
 * fix_contrast_lime.js — a doua trecere de contrast dupa migrarea la tema lime.
 *
 * De ce e nevoie de ea: `retheme_lime_2026.js` cauta perechea "fundal lime + text alb"
 * DOAR in interiorul unui `className="..."`. In practica, clasele Tailwind traiesc si
 * in alte forme:
 *   - literal intr-un ternar:  cond ? "bg-[#ddf93c] text-[#ffffff]" : "..."
 *   - concatenate cu variabile: `bg-gradient-to-br ${gradient} text-[#ffffff]`
 * In al doilea caz culoarea nici nu apare in string — vine din variabila — deci nu
 * poate fi detectata prin cautare de text. Alea se repara manual.
 *
 * Scriptul asta acopera primul caz: ORICE literal de string care contine si un fundal
 * lime, si text alb. Accentul are L=93%, deci alb pe el e practic ilizibil.
 *
 * Rulare:
 *   node scripts/fix_contrast_lime.js --dry-run
 *   node scripts/fix_contrast_lime.js
 */

const fs = require("fs");
const path = require("path");

const DRY = process.argv.includes("--dry-run");
const ROOT = path.join(__dirname, "..", "frontend", "app");

const LIME_BG = /(?:^|[\s"`{])(?:hover:|focus:|group-hover:)?(?:bg|from|via|to)-\[#(?:ddf93c|c3dd2c|ecff7a)\]/;
const WHITE = /\btext-white\b|\btext-\[#ffffff\]/g;
const ON_ACCENT = "text-[#0c1000]";

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(name)) acc.push(p);
  }
  return acc;
}

let totalFixes = 0;
const touched = [];

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, "utf8");
  let fixes = 0;

  const out = src.replace(/"([^"\n]{0,500})"|`([^`\n]{0,500})`/g, (full, dq, tpl) => {
    const s = dq !== undefined ? dq : tpl;
    if (!LIME_BG.test(s)) return full;
    WHITE.lastIndex = 0;
    if (!WHITE.test(s)) return full;
    WHITE.lastIndex = 0;
    const fixed = s.replace(WHITE, ON_ACCENT);
    fixes++;
    return dq !== undefined ? `"${fixed}"` : `\`${fixed}\``;
  });

  if (fixes > 0) {
    totalFixes += fixes;
    touched.push(`${path.relative(ROOT, file).replace(/\\/g, "/")} (${fixes})`);
    if (!DRY) fs.writeFileSync(file, out, "utf8");
  }
}

console.log(`${DRY ? "[DRY-RUN] " : ""}String-uri reparate (text alb -> inchis pe lime): ${totalFixes}`);
for (const t of touched) console.log("   " + t);
if (!totalFixes) console.log("   (niciunul — prima trecere le prinsese pe toate)");
