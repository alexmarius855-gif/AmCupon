import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import ReducereClient from "./ReducereClient";
import { cuNumar } from "@/lib/acordNumeral";

export const metadata: Metadata = {
  title: "Calculator reduceri — cât costă după reducere | AmCupon.ro",
  description:
    "Calculator de reduceri gratuit: află prețul final și cât economisești. Calculează și două reduceri succesive (cod peste preț redus) sau ce procent ai…",
  keywords: [
    "calculator reduceri",
    "calcul procent reducere",
    "cât costă după reducere",
    "calculator discount",
    "reduceri succesive calcul",
    "cât la sută reducere",
  ],
  alternates: { canonical: "https://amcupon.ro/calculatoare/reducere" },
  openGraph: {
    title: "Calculator reduceri — cât costă după reducere",
    description:
      "Află instant prețul final, economia și reducerea reală când se aplică două reduceri una peste alta.",
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
    q: "Cum calculez prețul după o reducere de 30%?",
    a: "Înmulțești prețul cu 0,7. Un produs de 249 lei cu 30% reducere costă 174,30 lei, deci economisești 74,70 lei. Calculatorul de mai sus face asta instant, pentru orice procent.",
  },
  {
    q: "Dacă am 30% reducere și un cod de 20%, primesc 50%?",
    a: "Nu. Codul se aplică peste prețul deja redus, nu peste cel inițial. La 249 lei: după -30% rămâne 174,30 lei, iar -20% din acesta înseamnă 139,44 lei. Reducerea reală e 44%, nu 50%.",
  },
  {
    q: "Cum aflu ce procent de reducere am primit?",
    a: "Împarți economia la prețul inițial și înmulțești cu 100. De la 249 lei la 174,30 lei înseamnă 74,70 / 249 = 30%. Folosește modul Ce procent e? din calculator.",
  },
  {
    q: "Reducerea se aplică și la costul livrării?",
    a: "De regulă nu. Majoritatea magazinelor aplică procentul doar la valoarea produselor, iar transportul se adaugă după. Verifică în coșul de cumpărături înainte de plată.",
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
          "Calculator gratuit pentru prețul final după reducere, economia în lei și reducerea reală la două reduceri succesive.",
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

      <nav className="text-xs text-[var(--text-muted)] mb-5">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
          Acasă
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/calculatoare" className="hover:text-[var(--foreground)] transition-colors">
          Calculatoare
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--foreground)]">Reduceri</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">Calculator de reduceri</h1>
      <p className="text-[var(--text-muted)] mb-8 max-w-2xl">
        Află prețul final, cât economisești și care e reducerea reală când se aplică două reduceri
        una peste alta. Fără cont, fără instalare.
      </p>

      <ReducereClient />

      <section className="mt-12">
        <h2 className="text-2xl font-black mb-4">Capcana celor două reduceri</h2>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Cea mai frecventă greșeală la cumpărături online e adunarea procentelor. Un produs redus cu
          30%, peste care aplici un cod de 20%, nu costă cu 50% mai puțin. Al doilea procent se
          calculează din prețul deja redus, nu din cel de la raft.
        </p>
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 mb-4">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="py-2.5 text-[var(--text-muted)]">Preț inițial</td>
                <td className="py-2.5 text-right font-semibold">249,00 lei</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[var(--text-muted)]">După reducerea de 30%</td>
                <td className="py-2.5 text-right font-semibold">174,30 lei</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[var(--text-muted)]">După codul de 20%</td>
                <td className="py-2.5 text-right font-semibold text-[var(--accent-text)]">139,44 lei</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[var(--text-muted)]">Reducere reală</td>
                <td className="py-2.5 text-right font-semibold">44%, nu 50%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Diferența de 6 puncte procentuale înseamnă 14,94 lei la un singur produs. Ordinea în care
          se aplică cele două reduceri nu contează matematic: rezultatul e același.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-black mb-4">Întrebări frecvente</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 group"
            >
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-4">
                {f.q}
                <span className="text-[var(--accent-text)] shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-[var(--text-muted)] mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {cuCod > 0 && (
        <section className="mt-12 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-xl font-black mb-2">Ai calculat. Acum găsește reducerea.</h2>
          <p className="text-[var(--text-muted)] mb-4">
            Urmărim {cuNumar(cuPromotie, "magazin", "magazine")} cu promoții active, dintre care {cuCod} au și un cod de
            reducere activ.
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
              className="bg-[var(--surface-alt)] text-[var(--foreground)] font-bold px-5 py-2.5 rounded-lg hover:bg-[var(--surface-high)] transition-colors"
            >
              Ofertele de azi
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
