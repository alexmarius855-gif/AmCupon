/**
 * Transformare sistematica light-theme -> dark-theme (indigo/cyan) pentru
 * paginile de nisa ramase neatinse de rebrand-ul din 18.06.2026 (commit b8f9f29).
 *
 * Pastreaza intentionat ALB containerele mici de logo (w-N h-N ... overflow-hidden
 * bg-white/bg-gray-50 ... shrink-0) - acelea raman albe pentru lizibilitate logo,
 * la fel ca in /piese-auto si /toate-magazinele.
 */
const fs = require("fs");

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("Usage: node retheme_pages.js <file1> <file2> ...");
  process.exit(1);
}

// Marcheaza temporar containerele de logo ca sa nu fie atinse de regulile generale
const LOGO_BOX_RE = /(w-(?:8|9|10|11|12|14|16)\s+h-(?:8|9|10|11|12|14|16)\s+rounded-(?:lg|xl|2xl)\s+overflow-hidden[^"]*?)(bg-white|bg-gray-50)([^"]*?shrink-0)/g;

function protect(src) {
  return src.replace(LOGO_BOX_RE, (m, pre, bg, post) => `${pre}__KEEPLOGO__${post}`);
}
function unprotect(src) {
  return src.replace(/__KEEPLOGO__/g, "bg-white");
}

const RULES = [
  // ── Hero gradients (3-stop si 2-stop) ──────────────────────────────────
  [/from-\w+-\d{3} via-\w+-\d{3} to-\w+-\d{3}/g, "from-indigo-700 via-blue-700 to-cyan-700"],
  [/bg-gradient-to-br from-\w+-\d{3} to-\w+-\d{3}/g, "bg-gradient-to-br from-indigo-700 to-cyan-700"],

  // ── Wrapper principal ───────────────────────────────────────────────────
  [/min-h-screen bg-white/g, "min-h-screen bg-slate-950"],
  [/min-h-screen bg-gray-50/g, "min-h-screen bg-slate-950"],
  [/min-h-screen bg-slate-50(?!\d)/g, "min-h-screen bg-slate-950"],
  [/border-slate-200/g, "border-slate-800"],
  [/border-slate-300/g, "border-slate-800"],
  [/text-slate-400 hover:text-red-500/g, "text-slate-500 hover:text-red-400"],

  // ── Nav breadcrumb ──────────────────────────────────────────────────────
  [/<nav className="bg-white border-b border-gray-100">/g, '<nav className="bg-slate-950 border-b border-slate-800">'],

  // ── Stats bar / sectiuni colorate deschise (X-50 cu border X-100) ──────
  [/bg-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red|indigo|cyan)-50 border-(?:t|b)? ?border-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red|indigo|cyan)-100/g,
    "bg-slate-900 border-slate-800"],
  [/bg-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red)-50(?!\d)/g, "bg-slate-900"],
  [/bg-gray-50(?!\d)/g, "bg-slate-900"],

  // ── Borduri deschise ─────────────────────────────────────────────────────
  [/border-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red|indigo|cyan)-100(?!\d)/g, "border-slate-800"],
  [/border-gray-100(?!\d)/g, "border-slate-800"],
  [/border-gray-200(?!\d)/g, "border-slate-800"],

  // ── Hover borders pe carduri ──────────────────────────────────────────
  [/hover:border-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red)-300/g, "hover:border-indigo-500/40"],

  // ── Card-uri albe (magazin/categorie) ramase dupa wrapper-fix ──────────
  // Specific "bg-white ... rounded" = card de continut, NU logo-box (acelea
  // sunt deja protejate de LOGO_BOX_RE mai sus si raman albe intentionat)
  [/bg-white border border-slate-800/g, "bg-slate-900 border border-slate-800"],
  [/bg-white border border-gray-200/g, "bg-slate-900 border border-slate-800"],
  [/bg-white border border-slate-200/g, "bg-slate-900 border border-slate-800"],
  [/bg-white rounded-2xl border/g, "bg-slate-900 rounded-2xl border"],
  [/`bg-white rounded-2xl border/g, "`bg-slate-900 rounded-2xl border"],

  // ── Text headings / body ────────────────────────────────────────────────
  [/text-gray-900/g, "text-white"],
  [/text-gray-800/g, "text-white"],
  [/text-gray-700/g, "text-slate-300"],
  [/text-gray-600/g, "text-slate-400"],
  [/text-gray-500/g, "text-slate-400"],
  [/text-gray-400/g, "text-slate-500"],

  // ── Accent text pe categorii (orice culoare -> indigo/cyan) ─────────────
  [/text-(?:rose|pink|fuchsia|purple|violet)-700/g, "text-indigo-300"],
  [/text-(?:rose|pink|fuchsia|purple|violet)-600/g, "text-indigo-400"],
  [/text-(?:rose|pink|fuchsia|purple|violet)-500/g, "text-indigo-400"],
  [/text-(?:blue|sky|indigo)-700/g, "text-indigo-300"],
  [/text-(?:green|emerald|teal|cyan)-700/g, "text-cyan-300"],
  [/text-(?:green|emerald|teal)-600/g, "text-cyan-400"],
  [/text-(?:green|emerald|teal)-500/g, "text-cyan-400"],
  [/text-(?:yellow|amber|orange)-700/g, "text-cyan-300"],
  [/text-(?:yellow|amber|orange)-600/g, "text-cyan-400"],
  [/text-(?:yellow|amber|orange)-500/g, "text-cyan-400"],

  // ── Hover text pe carduri ────────────────────────────────────────────────
  [/group-hover:text-(?:rose|pink|fuchsia|purple|violet|blue|green|emerald|teal|yellow|amber|orange)-700/g, "group-hover:text-indigo-300"],
  [/hover:text-(?:rose|pink|fuchsia|purple|violet|blue|green|emerald|teal|yellow|amber|orange)-700/g, "hover:text-indigo-300"],
  [/hover:text-(?:rose|pink|fuchsia|purple|violet|blue|green|emerald|teal|yellow|amber|orange)-300/g, "hover:text-indigo-300"],

  // ── Badge-uri/butoane pline (bg-X-500/600) -> indigo ────────────────────
  [/bg-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red)-500(?!\/)/g, "bg-indigo-600"],
  [/bg-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red)-600(?!\/)/g, "bg-indigo-600"],

  // ── Tinte deschise pe hero colorat (text-X-100 subtext) ─────────────────
  [/text-(?:rose|pink|fuchsia|purple|violet|blue|sky|green|emerald|teal|yellow|amber|orange|red)-100/g, "text-indigo-100"],

  // ── Footer / linkuri interne generice ────────────────────────────────────
  [/border-t border-gray-200/g, "border-t border-slate-800"],
  [/bg-gray-100 hover:bg-cyan-50/g, "bg-slate-900 hover:bg-slate-800"],

  // ── culoareAccent prop pe NisaProduse -> indigo ─────────────────────────
  [/culoareAccent="(?:rose|pink|fuchsia|purple|violet|green|emerald|teal|yellow|amber|orange)"/g, 'culoareAccent="indigo"'],
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
  } else {
    console.log("Neschimbat:", file);
  }
}
console.log(`\nTotal fisiere modificate: ${totalChanges}/${FILES.length}`);
