import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

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
  title: "Top Produse Recomandate 2026 — Review-uri si Ghiduri | AmCupon.ro",
  description: "Review-uri si topuri de produse testate: laptopuri, telefoane, casti wireless, televizoare, smartwatch-uri. Recomandarile noastre cu link-uri la cel mai bun pret.",
  alternates: { canonical: "https://amcupon.ro/top" },
  openGraph: {
    title: "Top Produse Recomandate 2026 | AmCupon.ro",
    description: "Review-uri, comparatii si ghiduri de cumparare pentru electronice, gadgets si electrocasnice.",
    url: "https://amcupon.ro/top",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// Accent uniform indigo/cyan (dark) — diferentierea per-categorie se face prin emoji/label, nu prin culoare
const ACCENT = { bg: "bg-[#0d9488]", text: "text-[#0d9488]", border: "border-[#e2e8f0]", badge: "bg-[#14b8a6]/15 text-[#0f766e] border border-[#14b8a6]/25" };
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
  description: "Review-uri si ghiduri de cumparare pentru electronice si gadgets",
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

      <div className="min-h-screen bg-[#F7F9FC]">
        {/* BREADCRUMB */}
        <nav className="bg-[#ffffff] border-b border-[#e2e8f0] ">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#64748b] flex-wrap">
            <Link href="/" className="hover:text-[#0d9488] transition-colors">Acasa</Link>
            <span className="mx-1 text-[#94a3b8]">/</span>
            <span className="text-[#334155]  font-medium">Top Produse</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#0f172a] py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#14b8a6]/20 border border-[#14b8a6]/30 text-[#0f766e] text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-[#14b8a6] rounded-full animate-pulse"></span>
              Actualizat {updated}
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Top Produse<br />
              <span className="text-[#0d9488]">Recomandate {an}</span>
            </h1>
            <p className="text-[#334155] text-lg max-w-xl mx-auto mb-8">
              Review-uri detaliate, comparatii si ghiduri de cumparare pentru a alege intotdeauna produsul potrivit la cel mai bun pret.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { val: `${categorii.length}`, label: "Categorii" },
                { val: `${categorii.reduce((a, c) => a + c.produse.length, 0)}`, label: "Produse testate" },
                { val: "Zilnic", label: "Actualizat" },
              ].map(s => (
                <div key={s.label} className="bg-slate-100 rounded-xl py-3 px-2">
                  <div className="text-xl font-black">{s.val}</div>
                  <div className="text-xs text-[#475569]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII GRID */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-black text-[#0f172a] dark:text-[#0f172a] mb-2">
            Alege categoria
          </h2>
          <p className="text-[#475569] dark:text-[#475569] text-sm mb-8">
            Fiecare top include produse testate si comparate dupa criterii obiective.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categorii.map(cat => {
              const c = CULORI[cat.culoare] || CULORI.blue;
              const scorMediu = getScorMediu(cat);
              return (
                <a
                  key={cat.slug}
                  href={`/top/${cat.slug}`}
                  className="group relative bg-[#ffffff] border border-[#e2e8f0]  hover:border-[#e2e8f0] dark:hover:border-[#64748b] rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
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
                  <h3 className="font-black text-[#0f172a] dark:text-[#0f172a] text-lg leading-tight mb-1 group-hover:text-[#0d9488] transition-colors">
                    {cat.titlu_scurt}
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#475569] leading-relaxed mb-4 flex-1">
                    {cat.descriere}
                  </p>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] ">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#64748b] dark:text-[#64748b]">{cat.produse.length} produse</span>
                      {scorMediu > 0 && (
                        <>
                          <span className="text-[#334155] dark:text-[#94a3b8]">·</span>
                          <span className="text-xs font-bold text-[#0d9488]">
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

        {/* CTA NEWSLETTER */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="bg-gradient-to-r from-[#ffffff] to-[#e2e8f0] rounded-xl p-8 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="text-xl font-black text-[#0f172a] mb-2">
              Primeste review-urile noi direct pe email
            </h3>
            <p className="text-[#475569] text-sm mb-5">
              Adaugam saptamanal noi ghiduri si review-uri. Zero spam.
            </p>
            <a
              href="/newsletter"
              className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Aboneaza-te gratuit &rarr;
            </a>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h3 className="text-base font-black text-[#334155]  mb-4">
            Exploreaza si
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gadgets", label: "📡 Gadgets & Tech" },
              { href: "/electronice", label: "💻 Electronice" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
              { href: "/blog", label: "📖 Blog & Ghiduri" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/", label: "🏠 Toate codurile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#ffffff] hover:bg-[#f0fdfa] dark:hover:bg-[#cbd5e1] hover:text-[#0f766e] text-[#334155]  text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#e2e8f0] dark:border-[#94a3b8] hover:border-[#e6d5a8]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e2e8f0]  py-6 text-center text-xs text-[#64748b]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/" className="hover:text-[#0d9488]">Acasa</Link>
          {" · "}<Link href="/blog" className="hover:text-[#0d9488]">Blog</Link>
          {" · "}<Link href="/gadgets" className="hover:text-[#0d9488]">Gadgets</Link>
        </footer>
      </div>
    </>
  );
}
