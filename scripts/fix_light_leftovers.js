/**
 * fix_light_leftovers.js — curata clasele Tailwind de tema LIGHT ramase in cod
 * dupa migrarea la dark/teal (16.07.2026).
 *
 * De ce a fost nevoie (gasit 06.08.2026): `retheme_dark_2026.js` a convertit hexurile
 * arbitrare (bg-[#f8fafc] etc.) dar NU si clasele Tailwind NUMITE (bg-slate-100,
 * border-slate-200...). Au ramas 112 aparitii in 30+ fisiere, invizibile la un audit
 * pe hexuri. Bug-ul cel mai grav gasit: caseta de cautare de pe homepage avea
 * `bg-slate-100` (#f1f5f9) + `text-[#f1f5f9]` — text alb pe fundal alb, deci ce tastai
 * era literalmente invizibil. Verificat live in DOM inainte de fix.
 *
 * NU atinge `bg-white` / `bg-[#ffffff]`: cutiile de logo ale magazinelor raman
 * INTENTIONAT albe (logo-urile sunt PNG-uri cu forme inchise la culoare, proiectate
 * pentru fundal alb) — regula documentata in CLAUDE.md, sectiunea "Tema vizuala".
 *
 * Rulare:  node scripts/fix_light_leftovers.js
 */

const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(__dirname, "..", "frontend", "app");

// light -> dark, aliniat cu paleta documentata (surface #111827 / surface-alt #1e293b
// / surface-high #334155 / border #1e293b / border-strong #334155)
const MAP = {
  "bg-slate-50": "bg-[#111827]",
  "bg-slate-100": "bg-[#1e293b]",
  "bg-slate-200": "bg-[#334155]",
  "bg-gray-50": "bg-[#111827]",
  "bg-gray-100": "bg-[#1e293b]",
  "border-slate-100": "border-[#1e293b]",
  "border-slate-200": "border-[#334155]",
  "border-gray-100": "border-[#1e293b]",
  "border-gray-200": "border-[#334155]",
  "border-gray-300": "border-[#475569]",
  "divide-slate-100": "divide-[#1e293b]",
  "divide-gray-100": "divide-[#1e293b]",
};

// Prefixe de variantă acceptate inaintea clasei (hover:, focus:, sm: etc.)
const VARIANT = String.raw`(?:[a-z-]+:)*`;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

let totalFiles = 0;
let totalReplacements = 0;
const perClass = {};

for (const file of walk(APP_DIR)) {
  let src = fs.readFileSync(file, "utf-8");
  const original = src;
  let fileCount = 0;

  for (const [light, dark] of Object.entries(MAP)) {
    // \b la final ca sa nu prindem bg-slate-1000 sau bg-slate-100/50 (opacitate)
    const re = new RegExp(`(${VARIANT})${light}\\b(?!/)`, "g");
    src = src.replace(re, (_match, variant) => {
      fileCount++;
      perClass[light] = (perClass[light] || 0) + 1;
      return `${variant}${dark}`;
    });
  }

  if (src !== original) {
    fs.writeFileSync(file, src, "utf-8");
    totalFiles++;
    totalReplacements += fileCount;
    console.log(`  ${path.relative(APP_DIR, file)}: ${fileCount}`);
  }
}

console.log(`\nGata: ${totalReplacements} inlocuiri in ${totalFiles} fisiere`);
console.log("Detaliu per clasa:", perClass);
