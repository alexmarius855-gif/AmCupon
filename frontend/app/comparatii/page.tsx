import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comparatii Magazine Online Romania 2026 — AmCupon.ro",
  description: "Compara cele mai mari magazine online din Romania: eMAG vs Temu, FashionDays vs Answear, Libris vs Carturesti si multe altele. Coduri de reducere verificate zilnic.",
  alternates: { canonical: "https://amcupon.ro/comparatii" },
};

interface ComparatieSummary {
  slug: string;
  n1: string;
  n2: string;
  titlu_scurt?: string;
  categorie: string;
  stats1: { promotii_active: number };
  stats2: { promotii_active: number };
  luna: string;
  an: number;
}

function loadComparatii(): ComparatieSummary[] {
  const p = path.join(process.cwd(), "public", "comparisons.json");
  if (!fs.existsSync(p)) return [];
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  return Object.values(data) as ComparatieSummary[];
}

const CATEGORII_CULORI: Record<string, string> = {
  "Fashion online Romania": "indigo",
  "Shopping online international": "violet",
  "Carti online Romania": "emerald",
  "Shopping online Romania": "blue",
  "Servicii digitale": "cyan",
  "Farmacie si cosmetice Romania": "pink",
  "Jucarii si sport Romania": "amber",
  "Moda online Romania": "purple",
  "Carti si electronice online Romania": "teal",
};

function culoarePentruCategorie(cat: string) {
  const c = CATEGORII_CULORI[cat] || "indigo";
  const map: Record<string, { border: string; badge: string; text: string }> = {
    indigo:  { border: "border-indigo-500/20",  badge: "bg-indigo-500/10 text-indigo-300",  text: "text-indigo-400" },
    violet:  { border: "border-violet-500/20",  badge: "bg-violet-500/10 text-violet-300",  text: "text-violet-400" },
    emerald: { border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-300", text: "text-emerald-400" },
    blue:    { border: "border-blue-500/20",    badge: "bg-blue-500/10 text-blue-300",    text: "text-blue-400" },
    cyan:    { border: "border-cyan-500/20",    badge: "bg-cyan-500/10 text-cyan-300",    text: "text-cyan-400" },
    pink:    { border: "border-pink-500/20",    badge: "bg-pink-500/10 text-pink-300",    text: "text-pink-400" },
    amber:   { border: "border-amber-500/20",   badge: "bg-amber-500/10 text-amber-300",  text: "text-amber-400" },
    purple:  { border: "border-purple-500/20",  badge: "bg-purple-500/10 text-purple-300", text: "text-purple-400" },
    teal:    { border: "border-teal-500/20",    badge: "bg-teal-500/10 text-teal-300",    text: "text-teal-400" },
  };
  return map[c];
}

export default function ComparatiiPage() {
  const comparatii = loadComparatii();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Comparatii magazine", item: "https://amcupon.ro/comparatii" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">Comparatii Magazine Online</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Nu stii unde sa cumperi? Comparam cele mai populare magazine online din Romania
              ca sa iei decizia corecta — cu coduri de reducere verificate zilnic.
            </p>
          </div>

          {/* Grid comparatii */}
          <div className="grid sm:grid-cols-2 gap-4">
            {comparatii.map((c) => {
              const cl = culoarePentruCategorie(c.categorie);
              const totalPromo = c.stats1.promotii_active + c.stats2.promotii_active;
              return (
                <Link
                  key={c.slug}
                  href={`/comparatii/${c.slug}`}
                  className={`block bg-slate-900 border ${cl.border} rounded-xl p-5 hover:bg-slate-800 transition-colors group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cl.badge}`}>
                      {c.categorie}
                    </span>
                    {totalPromo > 0 && (
                      <span className="text-xs text-slate-400">{totalPromo} oferte active</span>
                    )}
                  </div>
                  <h2 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-300 transition-colors">
                    {c.n1} vs {c.n2}
                  </h2>
                  <p className={`text-sm font-medium ${cl.text}`}>
                    {c.luna} {c.an} — Comparatie completa
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Oferte, livrare, reduceri, verdict final →
                  </p>
                </Link>
              );
            })}
          </div>

          {/* CTA jos */}
          <div className="mt-12 text-center bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Cauti un cod de reducere specific?</h2>
            <p className="text-slate-400 text-sm mb-5">
              AmCupon.ro verifica zilnic codurile si ofertele de la peste 150 magazine din Romania.
            </p>
            <Link
              href="/toate-magazinele"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Vezi toate magazinele
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
