import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { esteInCategorie } from "../../../lib/categoriiNisa";
import { CAI_REDIRECTIONATE } from "../../../lib/redirecturi";
import MarimiClient from "./MarimiClient";

export const metadata: Metadata = {
  title: "Convertor mărimi haine și încălțăminte — RO, UK, US, IT | AmCupon.ro",
  description:
    "Tabel de conversie mărimi: haine damă și bărbați, încălțăminte și copii. Echivalențe România/EU, UK, US, Italia, plus lungimea tălpii în cm.",
  keywords: [
    "convertor marimi",
    "tabel marimi haine",
    "conversie marimi incaltaminte",
    "marimi uk in ro",
    "marimi us in eu",
    "ce marime sunt",
  ],
  alternates: { canonical: "https://amcupon.ro/calculatoare/marimi" },
  openGraph: {
    title: "Convertor mărimi haine și încălțăminte — RO, UK, US, IT",
    description:
      "Tabel de conversie pentru haine damă, bărbați, încălțăminte și copii, cu lungimea tălpii în cm.",
    url: "https://amcupon.ro/calculatoare/marimi",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

interface Magazin {
  magazin: string;
  categorie_slug?: string;
  are_promotie: boolean;
  scor_final: number;
}

/**
 * Magazinele de fashion cu promotie activa, citite din date la build.
 *
 * Foloseste `esteInCategorie` (potrivire EXACTA pe categorie_slug) — sursa unica
 * din `lib/categoriiNisa.ts`. NU redefinim aici o lista de cuvinte-cheie:
 * exact asta e tiparul #1 din docs/LECTII-TEHNICE.md, gasit in 5 straturi.
 */
function magazineFashion(limita: number): { magazin: string }[] {
  try {
    const toate: Magazin[] = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"),
    );
    return toate
      .filter(
        (m) =>
          esteInCategorie(m, ["fashion"]) &&
          m.are_promotie &&
          // Un magazin redirectionat ar produce un 301 inutil dintr-un link intern.
          !CAI_REDIRECTIONATE.has(`/cod-reducere/${m.magazin}`),
      )
      .sort((a, b) => (b.scor_final || 0) - (a.scor_final || 0))
      .slice(0, limita)
      .map((m) => ({ magazin: m.magazin }));
  } catch {
    return [];
  }
}

const FAQ = [
  {
    q: "Ce mărime UK sunt dacă port 38 în România?",
    a: "La haine damă, mărimea 38 RO/EU corespunde de regulă cu UK 10 și US 6. La încălțăminte, 38 EU înseamnă aproximativ UK 5. Verifică întotdeauna tabelul brandului, pentru că tiparele diferă.",
  },
  {
    q: "De ce mărimea mea diferă de la un magazin la altul?",
    a: "Nu există un standard unic obligatoriu. Fiecare brand își croiește tiparul după clientul său țintă, iar diferențele de un număr sunt normale, mai ales între branduri europene și americane.",
  },
  {
    q: "Cum îmi măsor corect piciorul pentru încălțăminte?",
    a: "Așază piciorul pe o coală de hârtie, marchează călcâiul și vârful degetului cel mai lung, apoi măsoară distanța. Fă asta seara, când piciorul e ușor umflat, și folosește valoarea mai mare dintre cele două picioare.",
  },
  {
    q: "Mărimile pentru copii se aleg după vârstă sau înălțime?",
    a: "După înălțime. Vârsta e doar orientativă, pentru că diferențele între copii de aceeași vârstă sunt mari. Măsoară copilul descălțat, cu spatele la perete.",
  },
];

export default function ConvertorMarimiPage() {
  const fashion = magazineFashion(8);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Convertor mărimi haine și încălțăminte",
        url: "https://amcupon.ro/calculatoare/marimi",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
        description:
          "Tabel de conversie a mărimilor între România/EU, UK, US și Italia, pentru haine damă, bărbați, încălțăminte și copii.",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
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
          {
            "@type": "ListItem",
            position: 3,
            name: "Convertor mărimi",
            item: "https://amcupon.ro/calculatoare/marimi",
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
        <Link href="/calculatoare" className="hover:text-white transition-colors">
          Calculatoare
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-white">Mărimi</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
        Convertor de mărimi
      </h1>
      <p className="text-[#9399a0] mb-8 max-w-2xl">
        Echivalențe între mărimile din România, Marea Britanie, Statele Unite și Italia, pentru
        haine damă, bărbați, încălțăminte și copii.
      </p>

      <MarimiClient />

      <section className="mt-12">
        <h2 className="text-2xl font-black mb-4">Întrebări frecvente</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="bg-[#14181c] rounded-xl border border-[#1f2329] p-5 group"
            >
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-4">
                {f.q}
                <span className="text-[#ddf93c] shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-[#9399a0] mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {fashion.length > 0 && (
        <section className="mt-12 bg-[#14181c] rounded-xl border border-[#1f2329] p-6">
          <h2 className="text-xl font-black mb-2">Ai găsit mărimea. Găsește și reducerea.</h2>
          <p className="text-[#9399a0] mb-4">
            {fashion.length} magazine de fashion au acum o promoție activă.
          </p>
          <div className="flex flex-wrap gap-2">
            {fashion.map((m) => (
              <Link
                key={m.magazin}
                href={`/cod-reducere/${m.magazin}`}
                className="bg-[#1f2329] hover:bg-[#2a2f36] text-white text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors"
              >
                {m.magazin}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
