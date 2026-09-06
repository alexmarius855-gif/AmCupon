import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Unelte gratuite pentru cumpărături online | AmCupon.ro",
  description:
    "Calculator de reduceri, convertor de mărimi și alte unelte gratuite pentru cumpărături online. Fără cont, fără instalare, totul rulează în browser.",
  keywords: [
    "calculator reduceri",
    "convertor marimi",
    "unelte cumparaturi online",
    "calculator discount romania",
  ],
  alternates: { canonical: "https://amcupon.ro/calculatoare" },
  openGraph: {
    title: "Unelte gratuite pentru cumpărături online",
    description:
      "Calculator de reduceri, convertor de mărimi și alte unelte gratuite. Fără cont, fără instalare.",
    url: "https://amcupon.ro/calculatoare",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

interface Magazin {
  are_promotie: boolean;
  cod_cupon: boolean;
}

function statistici(): { cuCod: number; cuPromotie: number; total: number } {
  try {
    const magazine: Magazin[] = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"),
    );
    return {
      total: magazine.length,
      cuCod: magazine.filter((m) => m.cod_cupon).length,
      cuPromotie: magazine.filter((m) => m.are_promotie).length,
    };
  } catch {
    return { total: 0, cuCod: 0, cuPromotie: 0 };
  }
}

const UNELTE = [
  {
    href: "/calculatoare/reducere",
    emoji: "🧮",
    titlu: "Calculator de reduceri",
    desc: "Prețul final, economia în lei și reducerea reală când se aplică două reduceri una peste alta.",
    eticheta: "Cel mai folosit",
  },
  {
    href: "/calculatoare/marimi",
    emoji: "📏",
    titlu: "Convertor de mărimi",
    desc: "Echivalențe RO/EU, UK, US și Italia pentru haine damă, bărbați, încălțăminte și copii.",
    eticheta: null,
  },
  {
    href: "/comparator",
    emoji: "⚖️",
    titlu: "Comparator de magazine",
    desc: "Compară două magazine alături: oferte active, coduri, scor de încredere.",
    eticheta: null,
  },
];

export default function CalculatoarePage() {
  const { cuCod, cuPromotie } = statistici();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Unelte gratuite pentru cumpărături online",
        url: "https://amcupon.ro/calculatoare",
        description:
          "Colecție de unelte gratuite pentru cumpărături online: calculator de reduceri, convertor de mărimi, comparator de magazine.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://amcupon.ro" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Calculatoare",
            item: "https://amcupon.ro/calculatoare",
          },
        ],
      },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav className="text-xs text-[#9399a0] mb-5">
        <Link href="/" className="hover:text-white transition-colors">
          Acasă
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-white">Calculatoare</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">Unelte gratuite</h1>
      <p className="text-[#9399a0] mb-8 max-w-2xl">
        Lucruri mici care îți sunt utile înainte să apeși pe cumpără. Fără cont, fără instalare,
        totul rulează în browserul tău.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {UNELTE.map((u) => (
          <Link
            key={u.href}
            href={u.href}
            className="bg-[#14181c] rounded-xl border border-[#1f2329] p-5 hover:border-[#ddf93c] transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{u.emoji}</span>
              {u.eticheta && (
                <span className="text-[10px] font-bold bg-[#ddf93c] text-[#0f1216] px-2 py-1 rounded-full uppercase tracking-wide">
                  {u.eticheta}
                </span>
              )}
            </div>
            <h2 className="font-black text-lg mb-1.5 group-hover:text-[#ddf93c] transition-colors">
              {u.titlu}
            </h2>
            <p className="text-sm text-[#9399a0] leading-relaxed">{u.desc}</p>
          </Link>
        ))}
      </div>

      {cuCod > 0 && (
        <section className="mt-10 bg-[#14181c] rounded-xl border border-[#1f2329] p-6">
          <h2 className="text-xl font-black mb-2">Și ce urmează după calcul</h2>
          <p className="text-[#9399a0] mb-4">
            Urmărim {cuPromotie} magazine cu promoții active, dintre care {cuCod} au și un cod de
            reducere verificat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/top-reduceri"
              className="bg-[#ddf93c] text-[#0f1216] font-bold px-5 py-2.5 rounded-lg hover:brightness-95 transition-all"
            >
              Topul reducerilor
            </Link>
            <Link
              href="/oferte-azi"
              className="bg-[#1f2329] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#2a2f36] transition-colors"
            >
              Ofertele de azi
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
