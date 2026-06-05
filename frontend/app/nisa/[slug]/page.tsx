import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

/* ─── Config nise ────────────────────────────────────────────────────────── */
const NISE: Record<string, {
  titlu: string;
  descriere: string;
  keywords: string[];
  emoji: string;
  catKeywords: string[];  // cuvinte cheie din campul category al produselor
}> = {
  auto: {
    titlu:      "Piese auto si accesorii",
    descriere:  "Cele mai bune oferte pentru masina ta. Piese auto, accesorii, anvelope si uleiuri la preturi reduse.",
    keywords:   ["piese auto", "accesorii auto", "anvelope reducere", "automobilus oferte"],
    emoji:      "🚗",
    catKeywords: ["auto", "car", "moto", "vehicul", "anvelop", "piese"],
  },
  carti: {
    titlu:      "Carti si papetarie",
    descriere:  "Reduceri la carti, educatie si papetarie. Libris, Carturesti si alte librarii online.",
    keywords:   ["carti reducere", "libris cod cupon", "carturesti oferte", "reduceri carti"],
    emoji:      "📚",
    catKeywords: ["book", "carte", "papetarie", "editorial", "educatie", "libris"],
  },
  casa: {
    titlu:      "Casa si gradina",
    descriere:  "Oferte pentru casa ta. Mobila, electrocasnice, decoratiuni si gradinarit la preturi mici.",
    keywords:   ["mobila reducere", "vidaxl oferte", "electrocasnice cod cupon", "decoratiuni reducere"],
    emoji:      "🏡",
    catKeywords: ["home", "casa", "garden", "mobila", "gradina", "decor", "electrocasnic"],
  },
  tech: {
    titlu:      "Electronice si IT",
    descriere:  "Reduceri la laptopuri, telefoane, tablete si accesorii electronice.",
    keywords:   ["electronice reducere", "laptop oferte", "telefon cod cupon", "it reducere"],
    emoji:      "💻",
    catKeywords: ["electronic", "tech", "phone", "laptop", "computer", "it", "tablet", "gaming"],
  },
  fashion: {
    titlu:      "Moda si imbracaminte",
    descriere:  "Coduri de reducere pentru haine, incaltaminte si accesorii fashion.",
    keywords:   ["haine reducere", "fashion cod cupon", "answear oferte", "imbracaminte reducere"],
    emoji:      "👗",
    catKeywords: ["fashion", "clothing", "shoes", "haine", "incaltaminte", "moda", "accessories"],
  },
  sport: {
    titlu:      "Sport si fitness",
    descriere:  "Echipamente sportive, imbracaminte sport si accesorii fitness la preturi reduse.",
    keywords:   ["sport reducere", "sportdepot cod cupon", "fitness oferte", "echipament sport"],
    emoji:      "⚽",
    catKeywords: ["sport", "fitness", "outdoor", "bike", "cycling", "running", "gym"],
  },
  frumusete: {
    titlu:      "Frumusete si ingrijire",
    descriere:  "Cosmetice, parfumuri si produse de ingrijire la preturi speciale.",
    keywords:   ["cosmetice reducere", "parfum cod cupon", "notino oferte", "frumusete reducere"],
    emoji:      "💄",
    catKeywords: ["beauty", "cosmetic", "parfum", "ingrijire", "health", "personal care"],
  },
};

/* ─── Params ─────────────────────────────────────────────────────────────── */
export async function generateStaticParams() {
  return Object.keys(NISE).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const nisa = NISE[slug];
  if (!nisa) return {};
  const luna = new Date().toLocaleString("ro-RO", { month: "long" });
  const an   = new Date().getFullYear();
  return {
    title:       `${nisa.titlu} — Reduceri ${luna} ${an} | AmCupon.ro`,
    description: nisa.descriere,
    keywords:    nisa.keywords,
    openGraph: {
      title:       `${nisa.emoji} ${nisa.titlu} — Reduceri ${luna} ${an}`,
      description: nisa.descriere,
      url:         `https://amcupon.ro/nisa/${slug}`,
    },
    alternates: { canonical: `https://amcupon.ro/nisa/${slug}` },
  };
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default async function NisaPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const nisa = NISE[slug];
  if (!nisa) notFound();

  // Incarca produse
  const productsPath = path.join(process.cwd(), "public", "products.json");
  let products: any[] = [];
  try {
    const raw  = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    products   = raw.products || [];
  } catch { /* nu exista inca */ }

  // Incarca magazine
  const outputPath = path.join(process.cwd(), "public", "output.json");
  let magazine: any[] = [];
  try {
    magazine = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  } catch { /* */ }

  // Filtreaza produse dupa categorie
  const produseFiltrate = products
    .filter((p: any) => {
      const cat = (p.category || "").toLowerCase();
      const mer = (p.merchant || "").toLowerCase();
      return nisa.catKeywords.some(kw => cat.includes(kw) || mer.includes(kw));
    })
    .slice(0, 200);

  // Filtreaza magazine dupa categorie
  const magazineFiltrate = magazine
    .filter((m: any) => {
      const cat  = (m.categorie || m.categorie_slug || "").toLowerCase();
      const name = (m.magazin || "").toLowerCase();
      return nisa.catKeywords.some(kw => cat.includes(kw) || name.includes(kw));
    })
    .slice(0, 20);

  const luna = new Date().toLocaleString("ro-RO", { month: "long" });
  const an   = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    "name":     `${nisa.titlu} — Reduceri ${luna} ${an}`,
    "description": nisa.descriere,
    "url":      `https://amcupon.ro/nisa/${slug}`,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-3">{nisa.emoji}</div>
          <h1 className="text-3xl font-black mb-2">{nisa.titlu}</h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">{nisa.descriere}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
            <span>&#10003; {produseFiltrate.length} produse</span>
            <span>&#10003; {magazineFiltrate.length} magazine</span>
            <span>&#10003; Actualizat zilnic</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Magazine cu promotii */}
        {magazineFiltrate.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-black text-slate-900 mb-4">
              Magazine {nisa.titlu.toLowerCase()} cu reduceri active
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {magazineFiltrate.map((m: any) => (
                <a key={m.magazin} href={m.url_afiliat || m.url}
                  target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-white border border-slate-200 hover:border-orange-300 rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-all">
                  {m.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.logo} alt={m.magazin_display || m.magazin}
                      className="w-8 h-8 object-contain" loading="lazy" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {m.magazin_display || m.magazin}
                    </p>
                    {m.promotie && (
                      <p className="text-[10px] text-emerald-600 truncate">{m.promotie.slice(0, 40)}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Produse */}
        {produseFiltrate.length > 0 ? (
          <section>
            <h2 className="text-lg font-black text-slate-900 mb-4">
              Produse {nisa.titlu.toLowerCase()} cu discount
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {produseFiltrate.map((p: any, i: number) => (
                <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="group bg-white border border-slate-200 hover:border-orange-300 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col">
                  <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden relative">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} loading="lazy"
                        className="w-full h-full object-contain p-3" />
                    ) : (
                      <span className="text-4xl">{nisa.emoji}</span>
                    )}
                    {p.discount_pct > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{p.discount_pct}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[10px] text-slate-400 truncate">{p.brand || p.category}</p>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 flex-1 leading-snug">{p.title}</p>
                    <p className="font-black text-orange-600 text-sm mt-2">
                      {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi pretul"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-4xl mb-3">{nisa.emoji}</p>
            <p className="font-bold text-slate-700 mb-2">Produsele se actualizeaza zilnic</p>
            <p className="text-slate-400 text-sm">Revino maine pentru oferte noi in aceasta categorie.</p>
            <Link href="/produse" className="mt-4 inline-block text-orange-500 font-bold hover:text-orange-600">
              Vezi toate produsele &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
