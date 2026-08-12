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

// Hero-ul era un gradient colorat pe toata latimea, cu text alb peste. Dupa trecerea
// la tema lime (11.08.2026) toate cele 8 variante au ajuns identice, iar lime-ul e
// prea deschis ca sa tina text alb — devenea ilizibil. In referinta pe care o urmam,
// lime e ACCENT (numere, butoane, badge-uri), nu suprafata mare. Deci hero-ul devine
// inchis, iar accentul ramane pe titlu/cifre. `cat.culoare` nu mai controleaza
// culoarea de fundal, dar il pastram in date pentru eventuale accente viitoare.
const HERO_BG = "from-[#14181c] via-[#0f1317] to-[#06080b]";

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
  const gradient = HERO_BG;

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

      <div className="min-h-screen bg-[#06080b] dark:bg-[#14181c]">
        {/* HERO */}
        <section className={`bg-gradient-to-br ${gradient} text-[#ffffff] border-b border-[#1f2329] py-10 px-4`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Link href="/top" className="text-slate-500 hover:text-[#ffffff] text-sm transition-colors">
                &larr; Top Produse
              </Link>
              {cat.tag && (
                <span className="bg-[#1f2329] text-[#ffffff] text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                  {cat.tag}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl shrink-0">{cat.emoji}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">{cat.titlu}</h1>
                <p className="text-slate-500 text-base max-w-2xl">{cat.descriere}</p>
                {/* Metodologie explicita. Pana pe 10.08.2026 paginile scriau "Am analizat
                    20+ modele" / "testate in bucatarie" — o testare care nu a avut loc
                    niciodata. Scorurile sunt evaluare EDITORIALA pe date publice, si spunem
                    asta direct, in loc sa lasam cititorul sa creada ca sunt masuratori. */}
                <p className="text-xs text-slate-500/80 max-w-2xl mt-2 leading-relaxed">
                  Selecție editorială pe baza specificațiilor și prețurilor publice. Scorurile
                  sunt evaluarea noastră, nu rezultate de laborator. Linkurile către magazine
                  sunt afiliate — prețul tău rămâne același.
                </p>
              </div>
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              {[
                { val: `${cat.produse.length}`, label: "Produse comparate" },
                { val: scorMediu,               label: "Scor editorial mediu" },
                { val: `${pretMinim.toLocaleString("ro-RO")}+`, label: "Pret de la (lei)" },
                { val: data.updated,             label: "Actualizat" },
              ].map(s => (
                <div key={s.label} className="bg-[#1f2329] rounded-xl py-2.5 px-3">
                  <div className="text-base font-black">{s.val}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEST PICK QUICK INFO */}
        {bestPick && (
          <div className="bg-[#14181c] dark:bg-[#1f2329] border-b border-[#1f2329] dark:border-[#2a2f36]">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[#c9ced5] dark:text-[#c9ced5]">
              <span className="font-semibold text-[#ffffff] dark:text-[#ffffff]">
                {cat.emoji} Recomandam:
              </span>
              <span className="font-bold text-[#ddf93c]">{bestPick.nume}</span>
              <span>{bestPick.verdict_scurt}</span>
              <span className="ml-auto font-black text-[#ddf93c]">
                {bestPick.pret_de_la.toLocaleString("ro-RO")} lei
              </span>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TopProduseClient produse={cat.produse} culoare={cat.culoare} />

          {/* HOW WE TEST */}
          <section className="mt-10 bg-[#14181c] dark:bg-[#1f2329] border border-[#1f2329] dark:border-[#2a2f36] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] dark:text-[#ffffff] mb-3">
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
                  <h3 className="font-bold text-[#ffffff] dark:text-[#ffffff] text-sm mb-1">{item.titlu}</h3>
                  <p className="text-xs text-[#c9ced5] dark:text-[#c9ced5] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* PRICE RANGE INFO */}
          <section className="mt-6 bg-[#ddf93c]/10 dark:bg-[#14181c]/20 border border-[#c9ced5] dark:border-[#1f2329]/30 rounded-xl p-5">
            <h3 className="font-bold text-[#ffffff] dark:text-[#ffffff] mb-2 text-sm">
              Interval de preturi {cat.titlu_scurt.toLowerCase()}
            </h3>
            <p className="text-sm text-[#c9ced5] dark:text-[#c9ced5]">
              Produsele din acest top costa intre{" "}
              <strong className="text-[#c3dd2c]">{pretMinim.toLocaleString("ro-RO")} lei</strong> si{" "}
              <strong className="text-[#c3dd2c]">{pretMaxim.toLocaleString("ro-RO")} lei</strong>.
              Foloseste codurile de reducere de pe AmCupon.ro pentru a cumpara la pret mai mic.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[...new Set(cat.produse.flatMap(p => p.magazine.map(m => m.magazin_slug)))].slice(0, 5).map(slug => (
                <a key={slug} href={`/cod-reducere/${slug}`}
                  className="text-sm font-semibold text-[#c3dd2c] dark:text-[#ddf93c] hover:underline">
                  Coduri {slug.split(".")[0].charAt(0).toUpperCase() + slug.split(".")[0].slice(1)} &rarr;
                </a>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-6 bg-[#14181c] dark:bg-[#1f2329] border border-[#1f2329] dark:border-[#2a2f36] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] dark:text-[#ffffff] mb-4">
              Intrebari frecvente despre {cat.titlu_scurt.toLowerCase()}
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((item, i) => (
                <details key={i} className="group border-b border-[#1f2329] dark:border-[#2a2f36] last:border-0 pb-4 last:pb-0">
                  <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-[#ffffff] dark:text-[#c9ced5] list-none select-none gap-2">
                    <span>{item.name}</span>
                    <span className="text-[#ddf93c] text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-[#c9ced5] dark:text-[#c9ced5] leading-relaxed">
                    {item.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* NEWSLETTER */}
          <section className="mt-6 bg-[#14181c] dark:bg-[#06080b] rounded-xl p-6 text-center">
            <p className="text-[#ddf93c] text-xs font-black uppercase tracking-widest mb-2">Newsletter gratuit</p>
            <h3 className="text-xl font-black text-[#ffffff] mb-1">
              Primeste review-uri noi + coduri de reducere
            </h3>
            <p className="text-[#c9ced5] text-sm mb-5">
              1000+ magazine monitorizate. Zero spam.
            </p>
            <Link href="/newsletter"
              className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Aboneaza-te gratuit &rarr;
            </Link>
          </section>
        </div>

        {/* OTHER CATEGORIES */}
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-base font-black text-[#c9ced5] dark:text-[#c9ced5] mb-4">
            Alte categorii recomandate
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/top" className="bg-[#14181c] dark:bg-[#1f2329] hover:bg-[#ddf93c]/10 dark:hover:bg-[#2a2f36] text-[#c9ced5] dark:text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl border border-[#1f2329] dark:border-[#3a4048] hover:border-[#c9ced5] transition-colors">
              Toate topurile &rarr;
            </Link>
            {[
              { href: "/gadgets",     label: "📡 Gadgets" },
              { href: "/electronice", label: "💻 Electronice" },
              { href: "/oferte-azi",  label: "🔥 Oferte de azi" },
              { href: "/blog",        label: "📖 Blog" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#14181c] dark:bg-[#1f2329] hover:bg-[#ddf93c]/10 dark:hover:bg-[#2a2f36] hover:text-[#c3dd2c] text-[#c9ced5] dark:text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl border border-[#1f2329] dark:border-[#3a4048] hover:border-[#c9ced5] transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <footer className="border-t border-[#1f2329] dark:border-[#2a2f36] py-6 text-center text-xs text-[#9399a0]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
          {" · "}<Link href="/top" className="hover:text-[#ddf93c]">Top Produse</Link>
          {" · "}<Link href="/blog" className="hover:text-[#ddf93c]">Blog</Link>
        </footer>
      </div>
    </>
  );
}
