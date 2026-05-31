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

const CULORI: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: "bg-blue-600",    text: "text-blue-600",    border: "border-blue-200",   badge: "bg-blue-100 text-blue-700" },
  violet:  { bg: "bg-violet-600",  text: "text-violet-600",  border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  indigo:  { bg: "bg-indigo-600",  text: "text-indigo-600",  border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  teal:    { bg: "bg-teal-600",    text: "text-teal-600",    border: "border-teal-200",   badge: "bg-teal-100 text-teal-700" },
  emerald: { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  amber:   { bg: "bg-amber-500",   text: "text-amber-600",   border: "border-amber-200",  badge: "bg-amber-100 text-amber-700" },
  rose:    { bg: "bg-rose-600",    text: "text-rose-600",    border: "border-rose-200",   badge: "bg-rose-100 text-rose-700" },
  sky:     { bg: "bg-sky-600",     text: "text-sky-600",     border: "border-sky-200",    badge: "bg-sky-100 text-sky-700" },
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

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* HEADER */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 dark:text-white text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Top Produse</span>
          </div>
        </header>

        {/* BREADCRUMB */}
        <nav className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400 flex-wrap">
            <a href="/" className="hover:text-orange-500 transition-colors">Acasa</a>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-gray-700 dark:text-slate-300 font-medium">Top Produse</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
              Actualizat {updated}
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Top Produse<br />
              <span className="text-orange-400">Recomandate {an}</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
              Review-uri detaliate, comparatii si ghiduri de cumparare pentru a alege intotdeauna produsul potrivit la cel mai bun pret.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { val: `${categorii.length}`, label: "Categorii" },
                { val: `${categorii.reduce((a, c) => a + c.produse.length, 0)}`, label: "Produse testate" },
                { val: "Zilnic", label: "Actualizat" },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-2xl py-3 px-2">
                  <div className="text-xl font-black">{s.val}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII GRID */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Alege categoria
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
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
                  className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
                >
                  {/* TAG BADGE */}
                  {cat.tag && (
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                      {cat.tag}
                    </span>
                  )}

                  {/* EMOJI */}
                  <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm`}>
                    {cat.emoji}
                  </div>

                  {/* TITLE */}
                  <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-orange-500 transition-colors">
                    {cat.titlu_scurt}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                    {cat.descriere}
                  </p>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-slate-500">{cat.produse.length} produse</span>
                      {scorMediu > 0 && (
                        <>
                          <span className="text-gray-200 dark:text-slate-600">·</span>
                          <span className="text-xs font-bold text-yellow-500">
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
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="text-xl font-black text-white mb-2">
              Primeste review-urile noi direct pe email
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              Adaugam saptamanal noi ghiduri si review-uri. Zero spam.
            </p>
            <a
              href="/newsletter"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Aboneaza-te gratuit &rarr;
            </a>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h3 className="text-base font-black text-gray-700 dark:text-slate-300 mb-4">
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
                className="bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600 text-gray-700 dark:text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 dark:border-slate-600 hover:border-orange-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 dark:border-slate-700 py-6 text-center text-xs text-gray-400">
          &copy; {an} AmCupon.ro &middot;{" "}
          <a href="/" className="hover:text-orange-500">Acasa</a>
          {" · "}<a href="/blog" className="hover:text-orange-500">Blog</a>
          {" · "}<a href="/gadgets" className="hover:text-orange-500">Gadgets</a>
        </footer>
      </div>
    </>
  );
}
