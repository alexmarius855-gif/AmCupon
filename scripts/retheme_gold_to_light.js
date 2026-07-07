/* ──────────────────────────────────────────────────────────────────────────
   retheme_gold_to_light.js — REDESIGN: tema dark/auriu -> light modern + teal
   (Varianta A: alb/gri foarte deschis, accent teal/emerald, text slate)

   Face 3 lucruri, in ordine:
   1. Mapare hex: familia aurie -> paleta light/teal (pastreaza rosu=urgenta,
      emerald=verificat, culorile vibrante per-categorie).
   2. Utilitare alpha-white (bg-white/10, border-white/15...) -> echivalent light.
   3. text-white per className: ramane ALB pe fundal accent/colorat (butoane,
      badge-uri, brand social), devine INCHIS (#0f172a) pe fundal deschis.

   Usage: node scripts/retheme_gold_to_light.js <file1> <file2> ...
   ────────────────────────────────────────────────────────────────────────── */
const fs = require("fs");

/* 1 ─ Hex map (auriu -> light/teal) — case-insensitive */
const HEX = {
  // fundaluri inchise -> deschise
  "#0b0a07": "#f8fafc", "#110e08": "#ffffff", "#15120c": "#ffffff",
  "#17130c": "#ffffff", "#1a1408": "#ffffff", "#221d13": "#f0fdfa",
  // borduri
  "#26211a": "#e2e8f0", "#2b2418": "#e2e8f0", "#37301f": "#cbd5e1",
  "#473d28": "#94a3b8", "#4a4030": "#94a3b8",
  // text
  "#6b5f45": "#64748b", "#7d7050": "#64748b", "#8c8064": "#64748b",
  "#a89a78": "#475569", "#c8bda2": "#334155", "#dcd0b8": "#1e293b",
  "#f1ece0": "#0f172a",
  // accente aurii -> teal/emerald
  "#7a5f1e": "#0f766e", "#9c7a26": "#0f766e", "#b8912e": "#0d9488",
  "#c9a63e": "#14b8a6", "#cdb98d": "#2dd4bf", "#d8b850": "#0d9488",
  "#d8c091": "#0d9488", "#e3d1a6": "#0f766e", "#e9d9b0": "#34d399",
  "#f0e6cc": "#ccfbf1", "#faf3e0": "#f0fdfa",
};

/* rgba aurii -> teal (glow-uri hero, gradienturi inline) */
const RGBA = [
  [/rgba\(184,\s*145,\s*46,/g,  "rgba(13,148,136,"],
  [/rgba\(201,\s*166,\s*62,/g,  "rgba(20,184,166,"],
  [/rgba\(216,\s*192,\s*145,/g, "rgba(45,212,191,"],
  [/rgba\(156,\s*122,\s*38,/g,  "rgba(15,118,110,"],
  [/rgba\(233,\s*217,\s*176,/g, "rgba(52,211,153,"],
];

/* 2 ─ Utilitare alpha-white / umbre pt fundal deschis */
const CLASS_FIXES = [
  [/hover:bg-white\/(?:\[[0-9.]+\]|[0-9]+)/g, "hover:bg-slate-200"],
  [/bg-white\/(?:\[[0-9.]+\]|[0-9]+)/g, "bg-slate-100"],
  [/border-white\/(?:\[[0-9.]+\]|[0-9]+)/g, "border-slate-200"],
  [/placeholder-white\/(?:\[[0-9.]+\]|[0-9]+)/g, "placeholder-slate-400"],
  [/text-white\/(?:\[[0-9.]+\]|[0-9]+)/g, "text-slate-500"],
  [/ring-white\b/g, "ring-slate-200"],
  [/shadow-black\/[0-9]+/g, "shadow-slate-300/60"],
];

/* 3 ─ text-white: markeri care inseamna "fundal colorat, alb ramane" */
const KEEP_WHITE = /bg-\[#0d9488\]|bg-\[#14b8a6\]|bg-\[#0f766e\]|hover:bg-\[#0d9488\]|hover:bg-\[#14b8a6\]|from-\[#0d9488\]|from-\[#14b8a6\]|from-\[#34d399\]|to-\[#0d9488\]|to-\[#0f766e\]|to-\[#14b8a6\]|bg-red-|bg-rose-|bg-emerald-|bg-green-|bg-blue-|bg-indigo-|bg-violet-|bg-purple-|bg-pink-|bg-sky-|bg-teal-|bg-amber-|bg-orange-|bg-black|bg-\[#1877F2\]|bg-\[#25D366\]|bg-\[#229ED9\]|bg-\[#166FE5\]|bg-\[#20BD5C\]|bg-\[#1A8BBF\]|bg-gradient-to-t|bg-gradient-to-b\b/;

/** Extrage segmentele className="..." si className={...} (cu balans de acolade). */
function processClassNames(src) {
  let out = "";
  let i = 0;
  const N = src.length;
  while (i < N) {
    const idx = src.indexOf("className=", i);
    if (idx === -1) { out += src.slice(i); break; }
    out += src.slice(i, idx);
    let j = idx + "className=".length;
    let seg;
    if (src[j] === '"') {
      const end = src.indexOf('"', j + 1);
      seg = src.slice(idx, end + 1);
      i = end + 1;
    } else if (src[j] === "{") {
      let depth = 0, k = j;
      for (; k < N; k++) {
        if (src[k] === "{") depth++;
        else if (src[k] === "}") { depth--; if (depth === 0) break; }
      }
      seg = src.slice(idx, k + 1);
      i = k + 1;
    } else {
      out += src.slice(idx, j);
      i = j;
      continue;
    }
    if (/\btext-white\b/.test(seg) && !KEEP_WHITE.test(seg)) {
      seg = seg.replace(/\btext-white\b/g, "text-[#0f172a]");
    }
    out += seg;
  }
  return out;
}

let totalFiles = 0, totalHex = 0, totalTw = 0;
for (const file of process.argv.slice(2)) {
  let src;
  try { src = fs.readFileSync(file, "utf8"); } catch { continue; }
  const orig = src;

  // 1. hex map
  let hexHits = 0;
  for (const [from, to] of Object.entries(HEX)) {
    const re = new RegExp(from, "gi");
    src = src.replace(re, () => { hexHits++; return to; });
  }
  for (const [re, to] of RGBA) src = src.replace(re, to);

  // 2. utilitare alpha
  for (const [re, to] of CLASS_FIXES) src = src.replace(re, to);

  // 3. text-white contextual (dupa maparea hex, ca markerii teal sa existe)
  const before = (src.match(/\btext-white\b/g) || []).length;
  src = processClassNames(src);
  const after = (src.match(/\btext-white\b/g) || []).length;

  if (src !== orig) {
    fs.writeFileSync(file, src, "utf8");
    totalFiles++; totalHex += hexHits; totalTw += before - after;
    console.log(`  hex:${String(hexHits).padStart(4)}  tw->dark:${String(before - after).padStart(4)}  ${file}`);
  }
}
console.log(`\nTotal: ${totalHex} hexuri + ${totalTw} text-white schimbate in ${totalFiles} fisiere.`);
