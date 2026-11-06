import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { linkAfiliat } from "@/lib/linkMagazin";
import { cuNumar } from "@/lib/acordNumeral";

/** Pagina principala care castiga semnalul pentru fiecare nisa (vezi canonical mai jos). */
const CANONIC_PRINCIPAL: Record<string, string> = {
  auto: "/moto", carti: "/carti", casa: "/casa", tech: "/electronice",
  fashion: "/fashion", sport: "/sport", frumusete: "/frumusete",
};

/* ─── Config nise ────────────────────────────────────────────────────────── */
const NISE: Record<string, {
  titlu: string;
  descriere: string;
  keywords: string[];
  emoji: string;
  catKeywords: string[];  // cuvinte cheie din campul category al produselor
}> = {
  auto: {
    titlu:      "Piese auto și accesorii",
    descriere:  "Cele mai bune oferte pentru mașina ta. Piese auto, accesorii, anvelope și uleiuri la prețuri reduse.",
    keywords:   ["piese auto", "accesorii auto", "anvelope reducere", "automobilus oferte"],
    emoji:      "🚗",
    catKeywords: ["auto", "car", "moto", "vehicul", "anvelop", "piese"],
  },
  carti: {
    titlu:      "Cărți și papetărie",
    descriere:  "Reduceri la cărți, educație și papetărie. Libris, Carturesti și alte librării online.",
    keywords:   ["cărți reducere", "libris cod cupon", "carturesti oferte", "reduceri cărți"],
    emoji:      "📚",
    catKeywords: ["book", "carte", "papetarie", "editorial", "educatie", "libris"],
  },
  casa: {
    titlu:      "Casă și grădină",
    descriere:  "Oferte pentru casa ta. Mobilă, electrocasnice, decorațiuni și grădinărit la prețuri mici.",
    keywords:   ["mobilă reducere", "vidaxl oferte", "electrocasnice cod cupon", "decorațiuni reducere"],
    emoji:      "🏡",
    catKeywords: ["home", "casa", "garden", "mobila", "gradina", "decor", "electrocasnic"],
  },
  tech: {
    titlu:      "Electronice și IT",
    descriere:  "Reduceri la laptopuri, telefoane, tablete și accesorii electronice.",
    keywords:   ["electronice reducere", "laptop oferte", "telefon cod cupon", "it reducere"],
    emoji:      "💻",
    catKeywords: ["electronic", "tech", "phone", "laptop", "computer", "it", "tablet", "gaming"],
  },
  fashion: {
    titlu:      "Modă și îmbrăcăminte",
    descriere:  "Coduri de reducere pentru haine, încălțăminte și accesorii fashion.",
    keywords:   ["haine reducere", "fashion cod cupon", "answear oferte", "îmbrăcăminte reducere"],
    emoji:      "👗",
    catKeywords: ["fashion", "clothing", "shoes", "haine", "incaltaminte", "moda", "accessories"],
  },
  sport: {
    titlu:      "Sport și fitness",
    descriere:  "Echipamente sportive, îmbrăcăminte sport și accesorii fitness la prețuri reduse.",
    keywords:   ["sport reducere", "sportdepot cod cupon", "fitness oferte", "echipament sport"],
    emoji:      "⚽",
    catKeywords: ["sport", "fitness", "outdoor", "bike", "cycling", "running", "gym"],
  },
  frumusete: {
    titlu:      "Frumusețe și îngrijire",
    descriere:  "Cosmetice, parfumuri și produse de îngrijire la prețuri speciale.",
    keywords:   ["cosmetice reducere", "parfum cod cupon", "notino oferte", "frumusețe reducere"],
    emoji:      "💄",
    catKeywords: ["beauty", "cosmetic", "parfum", "ingrijire", "health", "personal care"],
  },
};

interface Produs {
  category?: string;
  merchant?: string;
  url: string;
  image?: string;
  title: string;
  discount_pct?: number;
  brand?: string;
  price: number;
}

interface Magazin {
  magazin: string;
  url_afiliat?: string;
  url?: string;
  logo?: string;
  magazin_display?: string;
  promotie?: string;
  categorie?: string;
  categorie_slug?: string;
}

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
    title:       `${nisa.titlu} — Reduceri ${luna} ${an} | AmCupon.ro`.length <= 60
      ? `${nisa.titlu} — Reduceri ${luna} ${an} | AmCupon.ro`
      : `${nisa.titlu} — Reduceri ${luna} ${an}`,
    description: nisa.descriere,
    keywords:    nisa.keywords,
    openGraph: {
      title:       `${nisa.emoji} ${nisa.titlu} — Reduceri ${luna} ${an}`,
      description: nisa.descriere,
      url:         `https://amcupon.ro/nisa/${slug}`,
    },
    // Canonical catre pagina de nisa PRINCIPALA, nu catre sine.
    // /nisa/fashion si /fashion tintesc aceeasi cautare ("reduceri fashion"), fiecare
    // cu canonical propriu -> semnalul se imparte in loc sa se cumuleze. Pe un domeniu
    // cu autoritate mica e pierdere neta exact pe cuvintele valoroase. Acelasi tipar
    // reparat pe 10.08 la cele 29 de pagini de brand (fix_canibalizare_canonical.py).
    // Pagina ramane live si utila (19 magazine, produse) — doar semnalul se consolideaza.
    // Consecinta obligatorie: /nisa/* NU mai are voie in sitemap (vezi sitemap.ts) —
    // a trimite la indexare un URL care se declara duplicat e un semnal contradictoriu.
    alternates: { canonical: `https://amcupon.ro${CANONIC_PRINCIPAL[slug] ?? `/nisa/${slug}`}` },
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
  let products: Produs[] = [];
  try {
    const raw  = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    products   = raw.products || [];
  } catch { /* nu exista inca */ }

  // Incarca magazine
  const outputPath = path.join(process.cwd(), "public", "output.json");
  let magazine: Magazin[] = [];
  try {
    magazine = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  } catch { /* */ }

  // Filtreaza produse dupa categorie
  const produseFiltrate = products
    .filter((p: Produs) => {
      const cat = (p.category || "").toLowerCase();
      const mer = (p.merchant || "").toLowerCase();
      return nisa.catKeywords.some(kw => cat.includes(kw) || mer.includes(kw));
    })
    .slice(0, 200);

  // Filtreaza magazine dupa categorie
  const magazineFiltrate = magazine
    .filter((m: Magazin) => {
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
    <div className="min-h-screen bg-[var(--background)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#c3dd2c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-3">{nisa.emoji}</div>
          <h1 className="text-3xl font-black mb-2">{nisa.titlu}</h1>
          <p className="text-[var(--text-soft)] text-sm max-w-xl mx-auto">{nisa.descriere}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-[var(--text-soft)]">
            <span>&#10003; {cuNumar(produseFiltrate.length, "produs", "produse")}</span>
            <span>&#10003; {cuNumar(magazineFiltrate.length, "magazin", "magazine")}</span>
            <span>&#10003; Actualizat zilnic</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Magazine cu promotii */}
        {magazineFiltrate.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">
              Magazine {nisa.titlu.toLowerCase()} cu reduceri active
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {magazineFiltrate.map((m: Magazin) => (
                <a key={m.magazin} href={linkAfiliat(m) || `/cod-reducere/${m.magazin}`}
                  target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-[var(--surface)] border border-[var(--border)] hover:border-[#c3dd2c] rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-all">
                  {m.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.logo} alt={m.magazin_display || m.magazin}
                      className="w-8 h-8 object-contain" loading="lazy" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-soft)] truncate">
                      {m.magazin_display || m.magazin}
                    </p>
                    {m.promotie && (
                      <p className="text-[10px] text-[var(--accent-text)] truncate">{m.promotie.slice(0, 40)}</p>
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
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">
              Produse {nisa.titlu.toLowerCase()} cu discount
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {produseFiltrate.map((p: Produs, i: number) => (
                <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[#c3dd2c] rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col">
                  <div className="aspect-square bg-[var(--surface)] flex items-center justify-center overflow-hidden relative">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} loading="lazy"
                        className="w-full h-full object-contain p-3" />
                    ) : (
                      <span className="text-4xl">{nisa.emoji}</span>
                    )}
                    {(p.discount_pct || 0) > 0 && (
                      <span className="absolute top-2 left-2 bg-[#ddf93c] text-[#0c1000] text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{p.discount_pct}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[10px] text-[var(--text-soft)] truncate">{p.brand || p.category}</p>
                    <p className="text-xs font-semibold text-[var(--text-soft)] line-clamp-2 flex-1 leading-snug">{p.title}</p>
                    <p className="font-black text-[var(--accent-text)] text-sm mt-2">
                      {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi prețul"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <p className="text-4xl mb-3">{nisa.emoji}</p>
            <p className="font-bold text-[var(--text-soft)] mb-2">Produsele se actualizează zilnic</p>
            <p className="text-[var(--text-soft)] text-sm">Revino mâine pentru oferte noi în această categorie.</p>
            <Link href="/produse" className="mt-4 inline-block text-[var(--accent-text)] font-bold hover:text-[var(--accent-text)]">
              Vezi toate produsele &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
