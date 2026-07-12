import Link from "next/link";
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
  blue:    "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  violet:  "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  indigo:  "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  teal:    "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  emerald: "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  amber:   "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  rose:    "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
  sky:     "from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Care este cel mai bun ${cat.titlu_scurt.toLowerCase()} in 2026?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: bestPick
            ? `${bestPick.nume} este alegerea redactiei AmCupon.ro pentru ${new Date().getFullYear()}. ${bestPick.verdict_detaliat}`
            : cat.descriere,
        },
      },
      {
        "@type": "Question",
        name: `Unde cumpar ${cat.titlu_scurt.toLowerCase()} mai ieftin in Romania?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Pe AmCupon.ro gasesti coduri de reducere si oferte actualizate zilnic pentru ${cat.titlu_scurt.toLowerCase()} de la magazinele partenere. Preturile pornesc de la ${pretMinim.toLocaleString("ro-RO")} lei.`,
        },
      },
      {
        "@type": "Question",
        name: `Cat costa ${cat.titlu_scurt.toLowerCase()} in Romania?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Preturile pentru ${cat.titlu_scurt.toLowerCase()} in Romania variaza intre ${pretMinim.toLocaleString("ro-RO")} lei si ${pretMaxim.toLocaleString("ro-RO")} lei, in functie de model si specificatii. Scorul mediu al modelelor testate de noi este ${scorMediu}/10.`,
        },
      },
      {
        "@type": "Question",
        name: `Ce sa verific inainte sa cumpar ${cat.titlu_scurt.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Inainte de cumparare verifica: specificatiile tehnice, recenziile utilizatorilor reali, garantia oferita si politica de retur. Topul nostru include doar modele testate si verificate de echipa AmCupon.ro.`,
        },
      },
      {
        "@type": "Question",
        name: `Este topul ${cat.titlu_scurt.toLowerCase()} actualizat?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Da, topul ${cat.titlu_scurt.toLowerCase()} de pe AmCupon.ro este actualizat periodic. Ultima actualizare: ${data.updated}. Preturile si disponibilitatea sunt verificate saptamanal.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#ffffff]">
        {/* HERO */}
        <section className={`bg-gradient-to-br ${gradient} text-[#0f172a] py-10 px-4`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Link href="/top" className="text-slate-500 hover:text-[#0f172a] text-sm transition-colors">
                &larr; Top Produse
              </Link>
              {cat.tag && (
                <span className="bg-slate-100 text-[#0f172a] text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                  {cat.tag}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl shrink-0">{cat.emoji}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">{cat.titlu}</h1>
                <p className="text-slate-500 text-base max-w-2xl">{cat.descriere}</p>
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
                <div key={s.label} className="bg-slate-100 rounded-xl py-2.5 px-3">
                  <div className="text-base font-black">{s.val}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEST PICK QUICK INFO */}
        {bestPick && (
          <div className="bg-white dark:bg-[#e2e8f0] border-b border-[#e2e8f0] dark:border-[#cbd5e1]">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[#475569] dark:text-[#475569]">
              <span className="font-semibold text-[#0f172a] dark:text-[#0f172a]">
                {cat.emoji} Recomandam:
              </span>
              <span className="font-bold text-[#0d9488]">{bestPick.nume}</span>
              <span>{bestPick.verdict_scurt}</span>
              <span className="ml-auto font-black text-[#0d9488]">
                {bestPick.pret_de_la.toLocaleString("ro-RO")} lei
              </span>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TopProduseClient produse={cat.produse} culoare={cat.culoare} />

          {/* HOW WE TEST */}
          <section className="mt-10 bg-white dark:bg-[#e2e8f0] border border-[#e2e8f0] dark:border-[#cbd5e1] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#0f172a] dark:text-[#0f172a] mb-3">
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
                  <h3 className="font-bold text-[#0f172a] dark:text-[#0f172a] text-sm mb-1">{item.titlu}</h3>
                  <p className="text-xs text-[#475569] dark:text-[#475569] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* PRICE RANGE INFO */}
          <section className="mt-6 bg-[#f0fdfa] dark:bg-[#ffffff]/20 border border-[#e6d5a8] dark:border-[#5a4718]/30 rounded-xl p-5">
            <h3 className="font-bold text-[#0f172a] dark:text-[#0f172a] mb-2 text-sm">
              Interval de preturi {cat.titlu_scurt.toLowerCase()}
            </h3>
            <p className="text-sm text-[#475569] dark:text-[#334155]">
              Produsele din acest top costa intre{" "}
              <strong className="text-[#0f766e]">{pretMinim.toLocaleString("ro-RO")} lei</strong> si{" "}
              <strong className="text-[#0f766e]">{pretMaxim.toLocaleString("ro-RO")} lei</strong>.
              Foloseste codurile de reducere de pe AmCupon.ro pentru a cumpara la pret mai mic.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[...new Set(cat.produse.flatMap(p => p.magazine.map(m => m.magazin_slug)))].slice(0, 5).map(slug => (
                <a key={slug} href={`/cod-reducere/${slug}`}
                  className="text-sm font-semibold text-[#0f766e] dark:text-[#0d9488] hover:underline">
                  Coduri {slug.split(".")[0].charAt(0).toUpperCase() + slug.split(".")[0].slice(1)} &rarr;
                </a>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-6 bg-white dark:bg-[#e2e8f0] border border-[#e2e8f0] dark:border-[#cbd5e1] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#0f172a] dark:text-[#0f172a] mb-4">
              Intrebari frecvente despre {cat.titlu_scurt.toLowerCase()}
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((item, i) => (
                <details key={i} className="group border-b border-[#e2e8f0] dark:border-[#cbd5e1] last:border-0 pb-4 last:pb-0">
                  <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-[#0f172a] dark:text-[#1e293b] list-none select-none gap-2">
                    <span>{item.name}</span>
                    <span className="text-[#0d9488] text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-[#475569] dark:text-[#475569] leading-relaxed">
                    {item.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* NEWSLETTER */}
          <section className="mt-6 bg-[#ffffff] dark:bg-[#F7F9FC] rounded-xl p-6 text-center">
            <p className="text-[#0d9488] text-xs font-black uppercase tracking-widest mb-2">Newsletter gratuit</p>
            <h3 className="text-xl font-black text-[#0f172a] mb-1">
              Primeste review-uri noi + coduri de reducere
            </h3>
            <p className="text-[#475569] text-sm mb-5">
              1000+ magazine monitorizate. Zero spam.
            </p>
            <Link href="/newsletter"
              className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Aboneaza-te gratuit &rarr;
            </Link>
          </section>
        </div>

        {/* OTHER CATEGORIES */}
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-base font-black text-[#334155] dark:text-[#334155] mb-4">
            Alte categorii recomandate
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/top" className="bg-white dark:bg-[#e2e8f0] hover:bg-[#f0fdfa] dark:hover:bg-[#cbd5e1] text-[#334155] dark:text-[#334155] text-sm font-semibold px-4 py-2 rounded-xl border border-[#e2e8f0] dark:border-[#94a3b8] hover:border-[#e6d5a8] transition-colors">
              Toate topurile &rarr;
            </Link>
            {[
              { href: "/gadgets",     label: "📡 Gadgets" },
              { href: "/electronice", label: "💻 Electronice" },
              { href: "/oferte-azi",  label: "🔥 Oferte de azi" },
              { href: "/blog",        label: "📖 Blog" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-white dark:bg-[#e2e8f0] hover:bg-[#f0fdfa] dark:hover:bg-[#cbd5e1] hover:text-[#0f766e] text-[#334155] dark:text-[#334155] text-sm font-semibold px-4 py-2 rounded-xl border border-[#e2e8f0] dark:border-[#94a3b8] hover:border-[#e6d5a8] transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <footer className="border-t border-[#e2e8f0] dark:border-[#cbd5e1] py-6 text-center text-xs text-[#64748b]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/" className="hover:text-[#0d9488]">Acasa</Link>
          {" · "}<Link href="/top" className="hover:text-[#0d9488]">Top Produse</Link>
          {" · "}<Link href="/blog" className="hover:text-[#0d9488]">Blog</Link>
        </footer>
      </div>
    </>
  );
}
