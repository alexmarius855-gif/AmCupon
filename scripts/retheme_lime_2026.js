/**
 * retheme_lime_2026.js — migrare tema dark/teal -> dark/LIME (11.08.2026)
 *
 * Paleta NU e ghicita dintr-un screenshot: am descarcat bundle-ul CSS al referintei
 * alese de Alex (deal-findr-spark.lovable.app) si i-am convertit valorile oklch in hex.
 *
 * ⚠️ PARTEA CARE CONTEAZA CEL MAI MULT — CONTRASTUL.
 * La tema teal accentul era INCHIS (#0d9488), deci butoanele erau `bg-accent text-white`.
 * Noul accent (#ddf93c) e FOARTE DESCHIS (L=93%). Daca doar schimbam hexurile, cele ~120
 * de locuri cu `bg-[#0d9488] text-white` devin alb-pe-lime = practic ilizibile.
 * De-aia scriptul face DOUA treceri:
 *   1. schimba culorile
 *   2. in fiecare className care are lime ca FUNDAL, intoarce textul alb in text inchis
 * Exact tipul de bug pe care l-a produs migrarea precedenta (caseta de cautare cu text
 * invizibil, gasita pe 08.08) — de data asta il tratam din start, nu dupa ce apare live.
 *
 * NU atinge `bg-[#ffffff]` — cutiile de logo raman intentionat albe (regula documentata:
 * logo-urile magazinelor sunt PNG-uri cu forme inchise, proiectate pentru fundal alb).
 *
 * Rulare:
 *   node scripts/retheme_lime_2026.js --dry-run
 *   node scripts/retheme_lime_2026.js
 */

const fs = require("fs");
const path = require("path");

const DRY = process.argv.includes("--dry-run");
const ROOT = path.join(__dirname, "..", "frontend", "app");

// ── Harta de culori: vechi -> nou ────────────────────────────────────────────
const MAP = {
  // Suprafete / fundal (bleumarin -> neutru rece, ca in referinta)
  "#0a0f1a": "#06080b", // fundal pagina
  "#111827": "#14181c", // card
  "#1e293b": "#1f2329", // card secundar / border
  "#334155": "#2a2f36", // border vizibil / hover
  "#475569": "#3a4048", // border slab
  "#64748b": "#6b7178", // text foarte estompat

  // Text
  "#f1f5f9": "#ffffff", // text principal -> alb pur (ca in referinta)
  "#cbd5e1": "#c9ced5", // text secundar
  "#94a3b8": "#9399a0", // text muted

  // Accent teal -> lime
  "#14b8a6": "#ddf93c",
  "#0d9488": "#ddf93c",
  "#0f766e": "#c3dd2c",
  "#5eead4": "#ecff7a",
  "#ccfbf1": "#2a2f10", // fundal foarte deschis teal -> tinta lime inchisa
  "#052e2b": "#0c1000", // text inchis folosit pe accent

  // Semantice
  "#ef4444": "#e64343",
};

// Tokenii care inseamna "lime e FUNDALUL acestui element"
const LIME_BG = /(?:^|\s|:)(?:bg|from|via|to)-\[#(?:ddf93c|c3dd2c|ecff7a)\]/;
// Textul alb care trebuie intors pe inchis cand e pe lime
const WHITE_TEXT = /\btext-white\b|\btext-\[#ffffff\]/g;
const ON_ACCENT = "text-[#0c1000]";

function swapColors(src) {
  let out = src;
  for (const [oldHex, newHex] of Object.entries(MAP)) {
    // insensibil la majuscule, dar pastram forma noua lowercase
    out = out.replace(new RegExp(oldHex.replace("#", "#"), "gi"), newHex);
  }
  return out;
}

/**
 * A doua trecere: doar in interiorul unui className/class string, daca elementul
 * are lime ca fundal, textul alb devine inchis. Lucram pe stringul de clase, nu pe
 * tot fisierul — altfel am schimba `text-white` de pe elemente care n-au lime.
 */
function fixContrast(src) {
  let fixes = 0;
  const out = src.replace(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g, (full, dq, tpl) => {
    const cls = dq !== undefined ? dq : tpl;
    if (!LIME_BG.test(cls)) return full;
    if (!WHITE_TEXT.test(cls)) return full;
    const fixed = cls.replace(WHITE_TEXT, ON_ACCENT);
    fixes++;
    return dq !== undefined ? `className="${fixed}"` : `className={\`${fixed}\`}`;
  });
  return { out, fixes };
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(p);
  }
  return acc;
}

const files = walk(ROOT);
let changedFiles = 0, totalContrast = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let out = swapColors(src);
  const { out: out2, fixes } = fixContrast(out);
  out = out2;
  if (out !== src) {
    changedFiles++;
    totalContrast += fixes;
    if (!DRY) fs.writeFileSync(file, out, "utf8");
  }
}

console.log(`${DRY ? "[DRY-RUN] " : ""}Fisiere modificate: ${changedFiles} / ${files.length}`);
console.log(`${DRY ? "[DRY-RUN] " : ""}Corectii de contrast (text alb -> inchis pe lime): ${totalContrast}`);
if (DRY) console.log("\nRuleaza fara --dry-run ca sa aplici.");
