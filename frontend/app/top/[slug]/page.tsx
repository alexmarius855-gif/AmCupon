import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import TopProduseClient from "./TopProduseClient";

interface Produs {
  pozitie: number;
  badge: string | null;
  badge_color: string | null;
  nume: string;
  model: string;
  imagine: string;
  pret_de_la: number;
  moneda: string;
  scor_total: number;
  scoruri: Record<string, number>;
  verdict_scurt: string;
  verdict_detaliat: string;
  pro: string[];
  contra: string[];
  specificatii: Record<string, string>;
  magazine: {
    magazin_slug: string;
    eticheta: string;
    pret: number;
    recomandat: boolean;
    url_afiliat?: string;
  }[];
}

interface Categorie {
  slug: string;
  titlu: string;
  titlu_scurt: string;
  emoji: string;
  descriere: string;
  culoare: string;
  tag: string | null;
  produse: Produs[];
}

interface TopData {
  updated: string;
  categorii: Categorie[];
}

const GRADIENT: Record<string, string> = {
  blue:    "from-blue-700 via-blue-600 to-indigo-700",
  violet:  "from-violet-700 via-violet-600 to-purple-700",
  indigo:  "from-indigo-700 via-indigo-600 to-blue-700",
  teal:    "from-teal-700 via-teal-600 to-emerald-700",
  emerald: "from-emerald-700 via-emerald-600 to-teal-700",
  amber:   "from-amber-600 via-orange-500 to-red-500",
  rose:    "from-rose-700 via-rose-600 to-pink-700",
  sky:     "from-sky-700 via-sky-600 to-blue-700",
};

function loadData(): TopData {
  const filePath = path.join(process.cwd(), "public", "top-produse.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function generateStaticParams() {
  const data = loadData();
  return data.categorii.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadData();
  const cat = data.categorii.find(c => c.slug === slug);
  if (!cat) return { title: "Pagina negasita | AmCupon.ro" };

  const pretMinim = Math.min(...cat.produse.map(p => p.pret_de_la));
  const scorMax   = Math.max(...cat.produse.map(p => p.scor_total));
  const pageUrl   = `https://amcupon.ro/top/${slug}`;

  return {
    title: `${cat.titlu} — Top ${cat.produse.length} Modele Testate | AmCupon.ro`,
    description: `${cat.descriere} Preturi de la ${pretMinim.toLocaleString("ro-RO")} lei. Scor maxim: ${scorMax}/10. Ghid de cumparare actualizat ${data.updated}.`,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${cat.titlu} | AmCupon.ro`,
      description: cat.descriere,
      url: pageUrl,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.titlu} | AmCupon.ro`,
      description: cat.descriere,
    },
  };
}

export default async function TopCategoriePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = loadData();
  const cat = data.categorii.find(c => c.slug === slug);
  if (!cat) notFound();

  const an = new Date().getFullYear();
  const gradient = GRADIENT[cat.culoare] || GRADIENT.blue;

  const pretMinim = Math.min(...cat.produse.map(p => p.pret_de_la));
  const pretMaxim = Math.max(...cat.produse.map(p => p.pret_de_la));
  const scorMediu = (
    cat.produse.reduce((a, p) => a + p.scor_total, 0) / cat.produse.length
  ).toFixed(1);

  const bestPick = cat.produse.find(p => p.badge === "Alegerea Redactiei") || cat.produse[0];

  // JSON-LD: ItemList schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cat.titlu,
    description: cat.descriere,
    url: `https://amcupon.ro/top/${slug}`,
    numberOfItems: cat.produse.length,
    itemListElement: cat.produse.map(p => ({
      "@type": "ListItem",
      position: p.pozitie,
      name: p.nume,
      description: p.verdict_scurt,
      url: `https://amcupon.ro/top/${slug}#${p.pozitie}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Top Produse", item: "https://amcupon.ro/top" },
      { "@type": "ListItem", position: 3, name: cat.titlu, item: `https://amcupon.ro/top/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* HEADER */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 dark:text-white text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <a href="/top" className="text-sm text-gray-500 dark:text-slate-400 hover:text-orange-500 transition-colors font-medium">
              Top Produse
            </a>
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 truncate">{cat.titlu_scurt}</span>
          </div>
        </header>

        {/* HERO */}
        <section className={`bg-gradient-to-br ${gradient} text-white py-10 px-4`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <a href="/top" className="text-white/60 hover:text-white text-sm transition-colors">
                &larr; Top Produse
              </a>
              {cat.tag && (
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                  {cat.tag}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl shrink-0">{cat.emoji}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">{cat.titlu}</h1>
                <p className="text-white/80 text-base max-w-2xl">{cat.descriere}</p>
              </div>
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              {[
                { val: `${cat.produse.length}`, label: "Produse testate" },
                { val: scorMediu,               label: "Scor mediu" },
                { val: `${pretMinim.toLocaleString("ro-RO")}+`, label: "Pret de la (lei)" },
                { val: data.updated,             label: "Actualizat" },
              ].map(s => (
                <div key={s.label} className="bg-white/15 rounded-xl py-2.5 px-3">
                  <div className="text-base font-black">{s.val}</div>
                  <div className="text-xs text-white/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEST PICK QUICK INFO */}
        {bestPick && (
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-slate-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {cat.emoji} Recomandam:
              </span>
              <span className="font-bold text-orange-500">{bestPick.nume}</span>
              <span>{bestPick.verdict_scurt}</span>
              <span className="ml-auto font-black text-orange-500">
                {bestPick.pret_de_la.toLocaleString("ro-RO")} lei
              </span>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TopProduseClient produse={cat.produse} culoare={cat.culoare} />

          {/* HOW WE TEST */}
          <section className="mt-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">
              Cum testam {cat.titlu_scurt.toLowerCase()}?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "🔬", titlu: "Testare riguroasa", desc: "Fiecare produs este testat timp de minim 2 saptamani in conditii reale de utilizare." },
                { icon: "⚖️", titlu: "Criterii obiective", desc: "Scoram pe baza de criterii masurabile, nu pe baza parerii subiective sau a sponsorizarilor." },
                { icon: "🔄", titlu: "Actualizare continua", desc: "Topul este actualizat lunar cu produse noi si preturile sunt verificate saptamanal." },
              ].map(item => (
                <div key={item.titlu} className="text-center p-4">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.titlu}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* PRICE RANGE INFO */}
          <section className="mt-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
              Interval de preturi {cat.titlu_scurt.toLowerCase()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Produsele din acest top costa intre{" "}
              <strong className="text-orange-600">{pretMinim.toLocaleString("ro-RO")} lei</strong> si{" "}
              <strong className="text-orange-600">{pretMaxim.toLocaleString("ro-RO")} lei</strong>.
              Foloseste codurile de reducere de pe AmCupon.ro pentru a cumpara la pret mai mic.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[...new Set(cat.produse.flatMap(p => p.magazine.map(m => m.magazin_slug)))].slice(0, 5).map(slug => (
                <a key={slug} href={`/cod-reducere/${slug}`}
                  className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                  Coduri {slug.split(".")[0].charAt(0).toUpperCase() + slug.split(".")[0].slice(1)} &rarr;
                </a>
              ))}
            </div>
          </section>

          {/* NEWSLETTER */}
          <section className="mt-6 bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-center">
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Newsletter gratuit</p>
            <h3 className="text-xl font-black text-white mb-1">
              Primeste review-uri noi + coduri de reducere
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              600+ magazine monitorizate. Zero spam.
            </p>
            <a href="/newsletter"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Aboneaza-te gratuit &rarr;
            </a>
          </section>
        </div>

        {/* OTHER CATEGORIES */}
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-base font-black text-gray-700 dark:text-slate-300 mb-4">
            Alte categorii recomandate
          </h3>
          <div className="flex flex-wrap gap-2">
            <a href="/top" className="bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-orange-200 transition-colors">
              Toate topurile &rarr;
            </a>
            {[
              { href: "/gadgets",     label: "📡 Gadgets" },
              { href: "/electronice", label: "💻 Electronice" },
              { href: "/oferte-azi",  label: "🔥 Oferte de azi" },
              { href: "/blog",        label: "📖 Blog" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600 text-gray-700 dark:text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-orange-200 transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <footer className="border-t border-gray-200 dark:border-slate-700 py-6 text-center text-xs text-gray-400">
          &copy; {an} AmCupon.ro &middot;{" "}
          <a href="/" className="hover:text-orange-500">Acasa</a>
          {" · "}<a href="/top" className="hover:text-orange-500">Top Produse</a>
          {" · "}<a href="/blog" className="hover:text-orange-500">Blog</a>
        </footer>
      </div>
    </>
  );
}
