import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import ReducereClient from "./ReducereClient";

export const metadata: Metadata = {
  title: "Calculator reduceri — cat costa dupa reducere | AmCupon.ro",
  description:
    "Calculator de reduceri gratuit: afla pretul final si cat economisesti. Calculeaza si doua reduceri succesive (cod peste pret redus) sau ce procent ai primit din doua preturi.",
  keywords: [
    "calculator reduceri",
    "calcul procent reducere",
    "cat costa dupa reducere",
    "calculator discount",
    "reduceri succesive calcul",
    "cat la suta reducere",
  ],
  alternates: { canonical: "https://amcupon.ro/calculatoare/reducere" },
  openGraph: {
    title: "Calculator reduceri — cat costa dupa reducere",
    description:
      "Afla instant pretul final, economia si reducerea reala cand se aplica doua reduceri una peste alta.",
    url: "https://amcupon.ro/calculatoare/reducere",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

interface Magazin {
  magazin: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  scor_final: number;
}

/**
 * Numarul de magazine cu cod activ, citit din date la build.
 *
 * Deliberat NU numim magazine in text (lectia din valul 5 de taxonomie moarta:
 * textul scris de mana care numeste date se invecheste tacut). O cifra generata
 * din `output.json` nu poate deveni falsa.
 */
function statistici(): { cuCod: number; cuPromotie: number } {
  try {
    const magazine: Magazin[] = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"),
    );
    return {
      cuCod: magazine.filter((m) => m.cod_cupon).length,
      cuPromotie: magazine.filter((m) => m.are_promotie).length,
    };
  } catch {
    return { cuCod: 0, cuPromotie: 0 };
  }
}

const FAQ = [
  {
    q: "Cum calculez pretul dupa o reducere de 30%?",
    a: "Inmultesti pretul cu 0,7. Un produs de 249 lei cu 30% reducere costa 174,30 lei, deci economisesti 74,70 lei. Calculatorul de mai sus face asta instant, pentru orice procent.",
  },
  {
    q: "Daca am 30% reducere si un cod de 20%, primesc 50%?",
    a: "Nu. Codul se aplica peste pretul deja redus, nu peste cel initial. La 249 lei: dupa -30% ramane 174,30 lei, iar -20% din acesta inseamna 139,44 lei. Reducerea reala e 44%, nu 50%.",
  },
  {
    q: "Cum aflu ce procent de reducere am primit?",
    a: "Imparti economia la pretul initial si inmultesti cu 100. De la 249 lei la 174,30 lei inseamna 74,70 / 249 = 30%. Foloseste modul Ce procent e? din calculator.",
  },
  {
    q: "Reducerea se aplica si la costul livrarii?",
    a: "De regula nu. Majoritatea magazinelor aplica procentul doar la valoarea produselor, iar transportul se adauga dupa. Verifica in cosul de cumparaturi inainte de plata.",
  },
];

export default function CalculatorReducerePage() {
  const { cuCod, cuPromotie } = statistici();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Calculator reduceri",
        url: "https://amcupon.ro/calculatoare/reducere",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
        description:
          "Calculator gratuit pentru pretul final dupa reducere, economia in lei si reducerea reala la doua reduceri succesive.",
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
          { "@type": "ListItem", position: 1, name: "Acasa", item: "https://amcupon.ro" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Calculatoare",
            item: "https://amcupon.ro/calculatoare",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Calculator reduceri",
            item: "https://amcupon.ro/calculatoare/reducere",
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
          Acasa
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/calculatoare" className="hover:text-white transition-colors">
          Calculatoare
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-white">Reduceri</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">Calculator de reduceri</h1>
      <p className="text-[#9399a0] mb-8 max-w-2xl">
        Afla pretul final, cat economisesti si care e reducerea reala cand se aplica doua reduceri
        una peste alta. Fara cont, fara instalare.
      </p>

      <ReducereClient />

      <section className="mt-12">
        <h2 className="text-2xl font-black mb-4">Capcana celor doua reduceri</h2>
        <p className="text-[#9399a0] leading-relaxed mb-4">
          Cea mai frecventa greseala la cumparaturi online e adunarea procentelor. Un produs redus cu
          30%, peste care aplici un cod de 20%, nu costa cu 50% mai putin. Al doilea procent se
          calculeaza din pretul deja redus, nu din cel de la raft.
        </p>
        <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-5 mb-4">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[#1f2329]">
              <tr>
                <td className="py-2.5 text-[#9399a0]">Pret initial</td>
                <td className="py-2.5 text-right font-semibold">249,00 lei</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[#9399a0]">Dupa reducerea de 30%</td>
                <td className="py-2.5 text-right font-semibold">174,30 lei</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[#9399a0]">Dupa codul de 20%</td>
                <td className="py-2.5 text-right font-semibold text-[#ddf93c]">139,44 lei</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[#9399a0]">Reducere reala</td>
                <td className="py-2.5 text-right font-semibold">44%, nu 50%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[#9399a0] leading-relaxed">
          Diferenta de 6 puncte procentuale inseamna 14,94 lei la un singur produs. Ordinea in care
          se aplica cele doua reduceri nu conteaza matematic: rezultatul e acelasi.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-black mb-4">Intrebari frecvente</h2>
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

      {cuCod > 0 && (
        <section className="mt-12 bg-[#14181c] rounded-xl border border-[#1f2329] p-6">
          <h2 className="text-xl font-black mb-2">Ai calculat. Acum gaseste reducerea.</h2>
          <p className="text-[#9399a0] mb-4">
            Urmarim {cuPromotie} magazine cu promotii active, dintre care {cuCod} au si un cod de
            reducere verificat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/top-reduceri"
              className="bg-[#ddf93c] text-[#0f1216] font-bold px-5 py-2.5 rounded-lg hover:brightness-95 transition-all"
            >
              Vezi topul reducerilor
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
