import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

interface Punct {
  aspect: string;
  v1: string;
  v2: string;
}

interface Stats {
  promotii_active: number;
  cashback: string;
  logo?: string;
  url_afiliat: string;
}

interface Promo {
  nume: string;
  cod_cupon: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface Comparatie {
  slug: string;
  m1_slug: string;
  m2_slug: string;
  n1: string;
  n2: string;
  titlu: string;
  titlu_h1: string;
  intro: string;
  categorie: string;
  puncte: Punct[];
  verdict_m1: string;
  verdict_m2: string;
  stats1: Stats;
  stats2: Stats;
  promo1: Promo[];
  promo2: Promo[];
  faq: FAQ[];
  luna: string;
  an: number;
}

function loadComparatii(): Record<string, Comparatie> {
  const p = path.join(process.cwd(), "public", "comparisons.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export async function generateStaticParams() {
  const comparatii = loadComparatii();
  return Object.keys(comparatii).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const comparatii = loadComparatii();
  const c = comparatii[slug];
  if (!c) return {};

  const titluMeta = `${c.n1} vs ${c.n2} ${c.an} — Comparatie Completa`;
  const desc = `${c.n1} sau ${c.n2}? Comparatie ${c.luna} ${c.an}: preturi, promotii active, livrare, retururi. Gaseste codul de reducere potrivit pe AmCupon.ro.`;

  return {
    title: titluMeta,
    description: desc,
    alternates: { canonical: `https://amcupon.ro/comparatii/${slug}` },
    openGraph: {
      title: titluMeta,
      description: desc,
      url: `https://amcupon.ro/comparatii/${slug}`,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
    },
  };
}

export default async function ComparatiePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const comparatii = loadComparatii();
  const c = comparatii[slug];
  if (!c) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
          { "@type": "ListItem", position: 2, name: "Comparatii magazine", item: "https://amcupon.ro/comparatii" },
          { "@type": "ListItem", position: 3, name: `${c.n1} vs ${c.n2}`, item: `https://amcupon.ro/comparatii/${slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F7F9FC] text-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav className="text-sm text-[#475569] mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-[#0d9488]">Acasa</Link>
            <span>/</span>
            <Link href="/comparatii" className="hover:text-[#0d9488]">Comparatii</Link>
            <span>/</span>
            <span className="text-[#0f172a]">{c.n1} vs {c.n2}</span>
          </nav>

          {/* Hero */}
          <div className="bg-gradient-to-br from-[#2e2410]/40 to-[#ffffff] border border-[#14b8a6]/20 rounded-xl p-8 mb-8">
            <p className="text-[#0f766e] text-sm font-medium mb-2 uppercase tracking-wider">{c.categorie}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">{c.titlu_h1}</h1>
            <p className="text-[#334155] text-lg leading-relaxed">{c.intro}</p>
          </div>

          {/* Tabel comparatie rapida */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { n: c.n1, stats: c.stats1, promo: c.promo1, slug: c.m1_slug },
              { n: c.n2, stats: c.stats2, promo: c.promo2, slug: c.m2_slug },
            ].map((side, i) => (
              <div key={i} className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-5">
                {side.stats.logo && (
                  <img src={side.stats.logo} alt={side.n} className="h-10 object-contain mb-3" />
                )}
                <h2 className="text-[#0f172a] font-bold text-lg mb-3">{side.n}</h2>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Promotii active</span>
                    <span className={side.stats.promotii_active > 0 ? "text-[#0d9488] font-semibold" : "text-[#64748b]"}>
                      {side.stats.promotii_active > 0 ? `${side.stats.promotii_active} oferte` : "Nicio oferta"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Cashback</span>
                    <span className="text-[#0f766e] font-semibold">{side.stats.cashback}</span>
                  </div>
                </div>
                {side.promo.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {side.promo.map((p, j) => (
                      <div key={j} className="bg-[#e2e8f0] rounded-lg px-3 py-2">
                        <p className="text-[#0f172a] text-xs font-medium line-clamp-2">{p.nume}</p>
                        {p.cod_cupon && (
                          <p className="text-[#0d9488] text-xs font-mono mt-1">COD: {p.cod_cupon}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href={`/cod-reducere/${side.slug}`}
                  className="block w-full text-center bg-[#0d9488] hover:bg-[#14b8a6] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Coduri {side.n}
                </Link>
              </div>
            ))}
          </div>

          {/* Tabel detaliat */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl overflow-hidden mb-8">
            <div className="grid grid-cols-3 bg-[#e2e8f0] px-4 py-3 text-sm font-semibold text-[#334155]">
              <span>Criteriu</span>
              <span className="text-center">{c.n1}</span>
              <span className="text-center">{c.n2}</span>
            </div>
            {c.puncte.map((p, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-4 py-3 text-sm border-t border-[#e2e8f0] ${i % 2 === 0 ? "" : "bg-[#ffffff]/50"}`}
              >
                <span className="text-[#475569] font-medium">{p.aspect}</span>
                <span className="text-center text-[#0f172a]">{p.v1}</span>
                <span className="text-center text-[#0f172a]">{p.v2}</span>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="bg-[#2e2410]/20 border border-[#14b8a6]/30 rounded-xl p-5">
              <p className="text-[#0f766e] font-bold text-sm mb-2 uppercase tracking-wide">Alege {c.n1} daca...</p>
              <p className="text-[#334155] text-sm leading-relaxed">{c.verdict_m1}</p>
              <Link
                href={`/cod-reducere/${c.m1_slug}`}
                className="mt-4 block text-center bg-[#0d9488] hover:bg-[#14b8a6] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Vezi oferte {c.n1}
              </Link>
            </div>
            <div className="bg-[#2e2410]/20 border border-[#14b8a6]/30 rounded-xl p-5">
              <p className="text-[#0f766e] font-bold text-sm mb-2 uppercase tracking-wide">Alege {c.n2} daca...</p>
              <p className="text-[#334155] text-sm leading-relaxed">{c.verdict_m2}</p>
              <Link
                href={`/cod-reducere/${c.m2_slug}`}
                className="mt-4 block text-center bg-[#0d9488] hover:bg-[#14b8a6] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Vezi oferte {c.n2}
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#0f172a] mb-5">Intrebari frecvente</h2>
            <div className="space-y-4">
              {c.faq.map((f, i) => (
                <div key={i} className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-5">
                  <h3 className="text-[#0f172a] font-semibold mb-2">{f.q}</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link href="/comparatii" className="text-[#0d9488] hover:text-[#0f766e] text-sm font-medium">
              ← Toate comparatiile magazine
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
