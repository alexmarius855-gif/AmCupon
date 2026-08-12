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
    indigo:  { border: "border-[#ddf93c]/20",  badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",  text: "text-[#ddf93c]" },
    violet:  { border: "border-[#ddf93c]/20",  badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",  text: "text-[#c3dd2c]" },
    emerald: { border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-300", text: "text-emerald-400" },
    blue:    { border: "border-[#ddf93c]/20",    badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",    text: "text-[#c3dd2c]" },
    cyan:    { border: "border-[#ddf93c]/20",    badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",    text: "text-[#ddf93c]" },
    pink:    { border: "border-[#ddf93c]/20",    badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",    text: "text-[#c3dd2c]" },
    amber:   { border: "border-[#ddf93c]/20",   badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",  text: "text-[#c3dd2c]" },
    purple:  { border: "border-[#ddf93c]/20",  badge: "bg-[#ddf93c]/10 text-[#c3dd2c]", text: "text-[#c3dd2c]" },
    teal:    { border: "border-[#ddf93c]/20",    badge: "bg-[#ddf93c]/10 text-[#c3dd2c]",    text: "text-[#c3dd2c]" },
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

      <div className="min-h-screen bg-[#06080b] text-[#ffffff]">
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#ffffff] mb-3">Comparatii Magazine Online</h1>
            <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto">
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
                  className={`block bg-[#14181c] border ${cl.border} rounded-xl p-5 hover:bg-[#1f2329] transition-colors group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cl.badge}`}>
                      {c.categorie}
                    </span>
                    {totalPromo > 0 && (
                      <span className="text-xs text-[#c9ced5]">{totalPromo} oferte active</span>
                    )}
                  </div>
                  <h2 className="text-[#ffffff] font-bold text-lg mb-1 group-hover:text-[#c3dd2c] transition-colors">
                    {c.n1} vs {c.n2}
                  </h2>
                  <p className={`text-sm font-medium ${cl.text}`}>
                    {c.luna} {c.an} — Comparatie completa
                  </p>
                  <p className="text-[#9399a0] text-xs mt-2">
                    Oferte, livrare, reduceri, verdict final →
                  </p>
                </Link>
              );
            })}
          </div>

          {/* CTA jos */}
          <div className="mt-12 text-center bg-[#14181c] border border-[#1f2329] rounded-xl p-8">
            <h2 className="text-xl font-bold text-[#ffffff] mb-2">Cauti un cod de reducere specific?</h2>
            <p className="text-[#c9ced5] text-sm mb-5">
              AmCupon.ro verifica zilnic codurile si ofertele de la peste 1000 magazine din Romania.
            </p>
            <Link
              href="/toate-magazinele"
              className="inline-block bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Vezi toate magazinele
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
