import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import CategoryIcon from "../components/CategoryIcon";
import { PesteMagazine } from "@/lib/cifreSite";
import { poolOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { cuNumar } from "@/lib/oferteAcasa";
import { CATEGORII_SITE, NISE_SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Categorii Coduri Reducere România 2026 | AmCupon.ro",
  description: `Coduri de reducere organizate pe categorii: Fashion, Electronice, Frumusețe, Casa, Sport, Farmacie, Copii, Animale și multe altele. ${PesteMagazine()} partenere, actualizate zilnic.`,
  keywords: ["categorii reduceri românia", "coduri reducere pe categorii", "fashion reducere", "electronice ieftine", "farmacie online reducere"],
  alternates: { canonical: "https://amcupon.ro/categorii" },
  openGraph: {
    title: "Categorii Coduri Reducere România | AmCupon.ro",
    description: `${PesteMagazine()} organizate pe categorii. Oferte actualizate zilnic.`,
    url: "https://amcupon.ro/categorii",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

interface Magazin extends MagazinGrila {
  categorie_slug?: string;
}

/**
 * Harta categoriilor, remodelata pe 03.11.2026: categoriile cu cele mai multe oferte azi sunt primele. Potrivire EXACTA
 * pe `categorie_slug` (LECTII-TEHNICE #1); o categorie fara magazine n-are pagina generata, deci nu apare. Pana acum
 * contorul „oferte" numara magazine, sub aceeasi eticheta.
 */
export default function CategoriPage() {
  let magazine: Magazin[] = [];
  try {
    magazine = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  } catch { /* fara date: pagina ramane goala, fara linkuri spre pagini negenerate */ }

  const pool = poolOferte(magazine);
  const oferte = new Map<string, number>();
  for (const o of pool) {
    const s = (o.m as Magazin).categorie_slug || "";
    oferte.set(s, (oferte.get(s) || 0) + 1);
  }
  const categorii = CATEGORII_SITE
    .map((c) => ({
      ...c,
      nrMag: magazine.filter((m) => m.categorie_slug === c.slug).length,
      nrOferte: oferte.get(c.slug) || 0,
    }))
    .filter((c) => c.nrMag > 0)
    .sort((a, b) => b.nrOferte - a.nrOferte || b.nrMag - a.nrMag);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Categorii Coduri Reducere România",
    url: "https://amcupon.ro/categorii",
    itemListElement: categorii.map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.label, url: `https://amcupon.ro/categorii/${c.slug}`,
    })),
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-10">
        <header>
          <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">Toate categoriile</h1>
          <p className="text-[var(--text-soft)]">
            {cuNumar(pool.length, "ofertă activă", "oferte active")} în {cuNumar(categorii.length, "categorie", "categorii")}, actualizate de trei ori pe zi.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categorii.map((c) => (
            <Link key={c.slug} href={`/categorii/${c.slug}`} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-3.5 transition-colors">
              <CategoryIcon slug={c.slug} size="md" />
              <span className="min-w-0">
                <span className="block font-black leading-tight">{c.label}</span>
                <span className="block text-xs text-[var(--text-soft)] mt-0.5 truncate">{c.desc}</span>
                <span className="block text-xs text-[var(--text-muted)] mt-0.5">
                  {c.nrOferte > 0 ? `${cuNumar(c.nrOferte, "ofertă", "oferte")} · ` : ""}{cuNumar(c.nrMag, "magazin", "magazine")}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <section aria-labelledby="nise-h">
          <h2 id="nise-h" className="text-xl font-black tracking-tight mb-3">Pagini pe teme</h2>
          <div className="flex flex-wrap gap-2">
            {NISE_SITE.map((n) => (
              <Link key={n.href} href={n.href} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
                {n.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
