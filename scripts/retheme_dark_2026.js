/**
 * Migrare LIGHT/teal (hex arbitrar Tailwind, din 06.07.2026) -> DARK/teal.
 * Pastreaza accentul teal (#14b8a6/#0d9488/#0f766e) neschimbat — functioneaza
 * bine si pe fundal dark, evita o decizie noua de culoare arbitrara.
 *
 * Ordinea regulilor conteaza: cele mai specifice (text pe fundal colorat,
 * combinatii de gradient) inainte de cele generice (text/bg/border simple).
 *
 * Usage: node scripts/retheme_dark_2026.js <file1> <file2> ...
 */
const fs = require("fs");

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("Usage: node retheme_dark_2026.js <file1> <file2> ...");
  process.exit(1);
}

// ─── Paleta noua (dark) ──────────────────────────────────────────────────────
const DARK = {
  pageBg:      "#0a0f1a",   // era #F7F9FC
  cardBg:      "#111827",   // era #ffffff (carduri)
  cardBgAlt:   "#1e293b",   // era #e2e8f0 ca bg (sectiuni secundare, placeholder)
  cardBgAlt2:  "#334155",   // era #cbd5e1 ca bg (placeholder imagine, hover subtil)
  border:      "#1e293b",   // era #e2e8f0 ca border
  borderAlt:   "#334155",   // era #cbd5e1 ca border (mai vizibil)
  textPrimary: "#f1f5f9",   // era #0f172a
  textSecond:  "#cbd5e1",   // era #334155 / #475569 / #1e293b (ca text)
  textMuted:   "#94a3b8",   // era #64748b
  borderMuted: "#475569",   // era #94a3b8 ca border
};

const LOGO_PROTECT_RE = /(alt=\{?(?:numeAfisat|nume|m\.magazin_display)\([^}]*\)\}?[^>]*className="[^"]*)(bg-\[#ffffff\])/g;

function protect(src) {
  return src.replace(LOGO_PROTECT_RE, (m, pre) => `${pre}__KEEPWHITE__`);
}
function unprotect(src) {
  return src.replace(/__KEEPWHITE__/g, "bg-[#ffffff]");
}

const RULES = [
  // ── Text pe fundal deja colorat (teal/rosu/gradient) — NU schimbam ──────
  // (nimic de facut — #ffffff si #ccfbf1 ca TEXT raman neschimbate, gestionate
  // implicit prin faptul ca regulile de mai jos NU le ating)

  // ── Backgrounds ──────────────────────────────────────────────────────────
  [/bg-\[#F7F9FC\]/g, `bg-[${DARK.pageBg}]`],
  [/bg-\[#ffffff\]\/60/g, `bg-[${DARK.cardBg}]/60`],
  [/bg-\[#ffffff\]\/95/g, `bg-[${DARK.cardBg}]/95`],
  [/bg-\[#ffffff\]\/40/g, `bg-[${DARK.cardBg}]/40`],
  [/bg-\[#ffffff\]/g, `bg-[${DARK.cardBg}]`],
  [/bg-\[#e2e8f0\]\/50/g, `bg-[${DARK.cardBgAlt}]/50`],
  [/bg-\[#e2e8f0\]\/60/g, `bg-[${DARK.cardBgAlt}]/60`],
  [/bg-\[#e2e8f0\]/g, `bg-[${DARK.cardBgAlt}]`],
  [/bg-\[#cbd5e1\]/g, `bg-[${DARK.cardBgAlt2}]`],
  [/bg-\[#f0fdfa\]/g, `bg-[#0d9488]/10`],
  [/bg-\[#94a3b8\]/g, `bg-[${DARK.cardBgAlt2}]`],
  [/bg-white(?!\/)/g, `bg-[${DARK.cardBg}]`],

  // ── Borders ──────────────────────────────────────────────────────────────
  [/border-\[#e2e8f0\]/g, `border-[${DARK.border}]`],
  [/border-\[#cbd5e1\]/g, `border-[${DARK.borderAlt}]`],
  [/border-\[#94a3b8\]/g, `border-[${DARK.borderMuted}]`],

  // ── Text principal / secundar / muted ───────────────────────────────────
  [/text-\[#0f172a\]/g, `text-[${DARK.textPrimary}]`],
  [/text-\[#1e293b\]/g, `text-[${DARK.textSecond}]`],
  [/text-\[#334155\]/g, `text-[${DARK.textSecond}]`],
  [/text-\[#475569\]/g, `text-[${DARK.textSecond}]`],
  [/text-\[#64748b\]/g, `text-[${DARK.textMuted}]`],
  [/text-\[#e2e8f0\]/g, `text-[${DARK.textSecond}]`],
  [/text-\[#cbd5e1\]/g, `text-[${DARK.textSecond}]`],
  [/placeholder-\[#64748b\]/g, `placeholder-[${DARK.textMuted}]`],
  [/placeholder-\[#94a3b8\]/g, `placeholder-[${DARK.textMuted}]`],

  // ── Gradiente cu stop alb (hero-uri, carduri) ───────────────────────────
  [/from-\[#ffffff\]/g, `from-[${DARK.cardBg}]`],
  [/to-\[#ffffff\]/g, `to-[${DARK.cardBg}]`],
  [/via-\[#ffffff\]/g, `via-[${DARK.cardBg}]`],
  [/to-\[#F7F9FC\]/g, `to-[${DARK.pageBg}]`],
  [/to-\[#e2e8f0\]/g, `to-[${DARK.cardBgAlt}]`],

  // ── Resturi vechi de tema aurie/sampanie (interzisa, dar ramasa pe cateva
  //    pagini nemigrate) — le aducem direct in noua paleta dark, nu in gold ──
  [/bg-\[#(?:2e2410|15120c|26211a|37301f|0b0a07)\]/g, `bg-[${DARK.pageBg}]`],
  [/border-\[#(?:5a4718|37301f|26211a)\]/g, `border-[${DARK.border}]`],
  [/text-\[#(?:e6d5a8|8c8064|d8c091|a89a78|f5ead0|e8e0d0)\]/g, `text-[${DARK.textSecond}]`],
  [/(?:bg|text|border)-\[#c9a63e\]/g, (m) => m.replace(/#c9a63e/, "#14b8a6")],
  [/(?:bg|text|border)-\[#b8912e\]/g, (m) => m.replace(/#b8912e/, "#0d9488")],

  // ── Shadow-uri pe fundal deschis (slate-300 = shadow gri deschis) ──────
  [/shadow-slate-300\/60/g, "shadow-black/40"],
  [/shadow-slate-300\/40/g, "shadow-black/30"],
];

let totalChanges = 0;
for (const file of FILES) {
  let src = fs.readFileSync(file, "utf-8");
  const before = src;
  src = protect(src);
  for (const [pattern, replacement] of RULES) {
    src = src.replace(pattern, replacement);
  }
  src = unprotect(src);
  if (src !== before) {
    fs.writeFileSync(file, src);
    totalChanges++;
    console.log("Modificat:", file);
  }
}
console.log(`\nTotal fisiere modificate: ${totalChanges}/${FILES.length}`);
