import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard, { CardMagazin } from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import { areLinkAfiliat } from "@/lib/linkMagazin";

/**
 * Black Friday — doar magazinele la care clicul aduce comision.
 *
 * Rescrisă pe 24.09.2026. Versiunea veche promitea „coduri verificate la eMAG, FashionDays,
 * Altex, Dedeman": primele trei nu au program la noi (nu sunt in output.json), iar codurile nu
 * le testeaza nimeni. Mai spunea ca Black Friday e „in ultima vineri a lunii", fals pentru
 * Romania, iar lista de top era scrisa de mana. Acum totul vine din date, prin `areLinkAfiliat`
 * (aceeasi functie ca pe restul site-ului).
 *
 * Datele se schimba in fiecare an: actualizeaza `BF`, cu sursa.
 */
const BF = {
  an: 2026,
  emag: "vineri, 6 noiembrie",
  international: "27–30 noiembrie",
  sursa:
    "https://www.wall-street.ro/articol/ecommerce/emag-black-friday-2026-cand-are-loc-anul-acesta-campania-de-reduceri.html",
};

const MAX_CARDURI = 48;

export const metadata: Metadata = {
  title: "Black Friday 2026 România — Coduri Reducere & Oferte",
  description:
    "Black Friday 2026: eMAG pe 6 noiembrie, magazinele internaționale pe 27–30 noiembrie. Ofertele și codurile active acum la partenerii AmCupon, actualizate zilnic.",
  keywords: [
    "black friday romania 2026",
    "black friday 2026 data",
    "oferte black friday",
    "coduri reducere black friday",
    "voucher black friday",
  ],
  alternates: { canonical: "https://amcupon.ro/black-friday" },
  openGraph: {
    title: "Black Friday 2026 România — Oferte & Coduri Reducere | AmCupon.ro",
    description: "Datele Black Friday 2026 și ofertele active acum la magazinele partenere AmCupon.",
    url: "https://amcupon.ro/black-friday",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Black Friday AmCupon.ro" }],
  },
};

interface Magazin extends CardMagazin {
  scor_final?: number;
}

function incarca(): Magazin[] {
  const date = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  return Array.isArray(date) ? date : (Object.values(date)[0] as Magazin[]);
}

const esteRomanesc = (m: Magazin) => /\.ro$/i.test(m.magazin);

/** Sursa unica pentru intrebari: din ea se face si textul vizibil, si schema FAQPage. */
function intrebari(parteneri: number, cuOferta: number) {
  return [
    {
      q: `Când e Black Friday ${BF.an} în România?`,
      a: `Nu în ultima vineri din noiembrie, ca în SUA. eMAG îl ține ${BF.emag}, iar magazinele internaționale au valul lor pe ${BF.international}, până la Cyber Monday. Multe magazine pornesc reducerile cu câteva zile sau săptămâni înainte.`,
    },
    {
      q: "Ce magazine găsesc pe AmCupon de Black Friday?",
      a: `Doar magazinele partenere, acum ${parteneri}. Pe pagina asta apar cele ${cuOferta} care au o ofertă activă azi. eMAG, Altex și Fashion Days nu sunt parteneri AmCupon, așa că pentru ele mergi direct pe site-ul lor.`,
    },
    {
      q: "Codurile sunt testate?",
      a: "Nu le testăm în coș. Le preluăm de la rețelele de afiliere, le afișăm cât timp sunt valabile după data lor și le scoatem când expiră. Lista se actualizează de trei ori pe zi.",
    },
    {
      q: "Cum afli dacă o reducere de Black Friday e reală?",
      a: "Notează prețul produsului cu câteva săptămâni înainte și compară-l cu cel din ziua reducerii. Caută același produs în două-trei magazine și citește condițiile codului: valoarea minimă a comenzii și categoriile excluse.",
    },
  ];
}

export default function BlackFridayPage() {
  const toate = incarca();
  const parteneri = toate.filter(areLinkAfiliat).length;
  const cuOferta = toate
    .filter((m) => areLinkAfiliat(m) && m.are_promotie && (m.promotii?.length ?? 0) > 0)
    .sort(
      (a, b) =>
        Number(esteRomanesc(b)) - Number(esteRomanesc(a)) || (b.scor_final ?? 0) - (a.scor_final ?? 0),
    );
  const afisate = cuOferta.slice(0, MAX_CARDURI);
  const oferte = cuOferta.reduce((n, m) => n + m.promotii.length, 0);
  const coduri = cuOferta.reduce((n, m) => n + m.promotii.filter((p) => p.cod_cupon).length, 0);
  const faq = intrebari(parteneri, cuOferta.length);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Black Friday ${BF.an} România — oferte active`,
      description: "Ofertele active la magazinele partenere AmCupon, actualizate de trei ori pe zi.",
      url: "https://amcupon.ro/black-friday",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="min-h-screen bg-[#06080b] text-[#ffffff]">
        <nav className="max-w-6xl mx-auto px-4 pt-4 text-xs text-[#9399a0] flex items-center gap-1">
          <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-[#c9ced5]">Black Friday {BF.an}</span>
        </nav>

        <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ddf93c] mb-3">
            Actualizat de trei ori pe zi
          </p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            Black Friday {BF.an} în România
          </h1>
          <p className="text-[#c9ced5] text-base md:text-lg max-w-2xl">
            Ofertele active acum la magazinele partenere AmCupon. Pe fiecare magazin vezi codul,
            dacă există, și până când e valabilă oferta.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-8 max-w-2xl">
            <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4">
              <p className="text-xs text-[#9399a0]">Black Friday la eMAG</p>
              <p className="font-bold text-lg mt-0.5">{BF.emag}</p>
            </div>
            <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4">
              <p className="text-xs text-[#9399a0]">Magazinele internaționale</p>
              <p className="font-bold text-lg mt-0.5">{BF.international}</p>
            </div>
          </div>
          <p className="text-xs text-[#6b7178] mt-2">
            Sursa datelor:{" "}
            <a href={BF.sursa} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ddf93c]">
              wall-street.ro
            </a>
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
            {[
              { val: cuOferta.length, eticheta: "magazine cu ofertă acum" },
              { val: oferte, eticheta: "oferte active" },
              { val: coduri, eticheta: "coduri de reducere" },
            ].map((s) => (
              <div key={s.eticheta} className="bg-[#14181c] border border-[#1f2329] rounded-xl py-3 px-3">
                <p className="text-2xl font-black text-[#ddf93c]">{s.val}</p>
                <p className="text-xs text-[#9399a0] mt-0.5 leading-snug">{s.eticheta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-baseline justify-between mb-5 gap-4">
            <h2 className="text-xl font-black">Ofertele active acum</h2>
            <span className="text-sm text-[#9399a0] shrink-0">
              {afisate.length} din {cuOferta.length}
            </span>
          </div>
          {afisate.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {afisate.map((m) => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[#9399a0] text-sm border border-dashed border-[#2a2f36] rounded-xl">
              Niciun magazin partener nu are o ofertă activă chiar acum. Lista se actualizează de trei ori pe zi.
            </div>
          )}
          {cuOferta.length > afisate.length && (
            <div className="mt-6 text-center">
              <Link href="/oferte-azi" className="text-sm font-semibold text-[#ddf93c] hover:text-[#c3dd2c]">
                Toate ofertele de azi →
              </Link>
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <NewsletterCTA titlu="Ofertele active, pe email" />
        </section>

        <section className="border-t border-[#1f2329] bg-[#0b0e12]">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-black mb-6">Întrebări despre Black Friday {BF.an}</h2>
            <div className="space-y-6">
              {faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-bold mb-2">{f.q}</h3>
                  <p className="text-[#c9ced5] text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
