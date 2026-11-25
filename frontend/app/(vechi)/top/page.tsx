import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import { cuNumar } from "@/lib/acordNumeral";

interface Categorie {
  slug: string;
  titlu: string;
  titlu_scurt: string;
  emoji: string;
  descriere: string;
  culoare: string;
  tag: string | null;
  produse: { scor_total: number }[];
}

interface TopData {
  updated: string;
  categorii: Categorie[];
}

export const metadata: Metadata = {
  title: "Top Produse Recomandate 2026 — Topuri și Ghiduri",
  description: "Topuri și ghiduri de cumpărare: laptopuri, telefoane, căști wireless, televizoare, smartwatch-uri, cu ofertele de azi de la magazinele partenere.",
  alternates: { canonical: "https://amcupon.ro/top" },
  openGraph: {
    title: "Top Produse Recomandate 2026 | AmCupon.ro",
    description: "Topuri, comparații și ghiduri de cumpărare pentru electronice, gadgets și electrocasnice.",
    url: "https://amcupon.ro/top",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// Accent uniform indigo/cyan (dark) — diferentierea per-categorie se face prin emoji/label, nu prin culoare
const ACCENT = { bg: "bg-[#ddf93c]", text: "text-[var(--accent-text)]", border: "border-[var(--border)]", badge: "bg-[#ddf93c]/15 text-[var(--accent-text)] border border-[var(--accent-text)]/25" };
const CULORI: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: ACCENT, violet: ACCENT, indigo: ACCENT, teal: ACCENT,
  emerald: ACCENT, amber: ACCENT, rose: ACCENT, sky: ACCENT,
};

function getScorMediu(cat: Categorie): number {
  if (!cat.produse.length) return 0;
  const sum = cat.produse.reduce((a, p) => a + p.scor_total, 0);
  return Math.round((sum / cat.produse.length) * 10) / 10;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Top Produse Recomandate 2026",
  description: "Topuri și ghiduri de cumpărare pentru electronice și gadgets",
  url: "https://amcupon.ro/top",
  publisher: { "@type": "Organization", name: "AmCupon.ro", url: "https://amcupon.ro" },
};

export default function TopHubPage() {
  const filePath = path.join(process.cwd(), "public", "top-produse.json");
  const topData: TopData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { categorii, updated } = topData;
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[var(--background)]">
        {/* BREADCRUMB */}
        <nav className="bg-[var(--surface)] border-b border-[var(--border)] ">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)] flex-wrap">
            <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasă</Link>
            <span className="mx-1 text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-soft)]  font-medium">Top Produse</span>
          </div>
        </nav>

        {/* 03.11.2026: antetul lime avea titlul si textul in culori de tema inchisa, aproape invizibile pe lime. */}
        <header className="max-w-6xl mx-auto px-4 pt-6">
          <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">Top produse {an}</h1>
          <p className="text-[var(--text-soft)] max-w-3xl">
            {categorii.length} comparații editoriale, cu prețurile de azi de la magazinele partenere acolo unde le avem. Actualizat {updated}.
          </p>
        </header>

        {/* CATEGORII GRID */}
        <div className="max-w-6xl mx-auto px-4 py-5">
          <p className="text-[var(--text-soft)] dark:text-[var(--text-soft)] text-sm mb-8">
            Fiecare top compară modele pe specificații și prețuri publice; scorurile sunt evaluarea redacției, nu teste de laborator.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categorii.map(cat => {
              const c = CULORI[cat.culoare] || CULORI.blue;
              const scorMediu = getScorMediu(cat);
              return (
                <a
                  key={cat.slug}
                  href={`/top/${cat.slug}`}
                  className="group relative bg-[var(--surface)] border border-[var(--border)]  hover:border-[var(--border)] dark:hover:border-[#6b7178] rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
                >
                  {/* TAG BADGE */}
                  {cat.tag && (
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                      {cat.tag}
                    </span>
                  )}

                  {/* EMOJI */}
                  <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-sm`}>
                    {cat.emoji}
                  </div>

                  {/* TITLE */}
                  <h3 className="font-black text-[var(--foreground)] dark:text-[var(--foreground)] text-lg leading-tight mb-1 group-hover:text-[var(--accent-text)] transition-colors">
                    {cat.titlu_scurt}
                  </h3>
                  <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-soft)] leading-relaxed mb-4 flex-1 hidden sm:block">
                    {cat.descriere.replace(/^Top \d+/, `Top ${cat.produse.length}`)}
                  </p>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] ">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">{cuNumar(cat.produse.length, "produs", "produse")}</span>
                      {scorMediu > 0 && (
                        <>
                          <span className="text-[var(--text-soft)] dark:text-[var(--text-muted)]">·</span>
                          <span className="text-xs font-bold text-[var(--accent-text)]">
                            {scorMediu.toFixed(1)} / 10
                          </span>
                        </>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${c.text} group-hover:translate-x-0.5 transition-transform inline-block`}>
                      Vezi top &rarr;
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}
