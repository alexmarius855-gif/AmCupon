import { Metadata } from "next";
import CalculatorTvaClient from "./CalculatorTvaClient";

export const metadata: Metadata = {
  title: "Calculator TVA 2026 — 21% si 11% | AmCupon.ro",
  description:
    "Calculeaza TVA instant: adauga TVA la pretul fara TVA sau extrage TVA-ul dintr-un pret cu TVA inclus. Cotele actuale din Romania: 21% standard, 11% redusa. Gratuit, fara cont.",
  keywords: [
    "calculator tva", "calculator tva 2026", "calcul tva 21%", "cota tva romania 2026",
    "cum se calculeaza tva", "scadere tva din pret", "pret fara tva", "tva inclus",
    "calculator tva 11%", "tva redus romania",
  ],
  alternates: { canonical: "https://amcupon.ro/calculator-tva" },
  openGraph: {
    title: "Calculator TVA 2026 — 21% si 11% | AmCupon.ro",
    description: "Adauga sau extrage TVA cu cotele actuale din Romania. Simplu, gratuit, fara cont.",
    url: "https://amcupon.ro/calculator-tva",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const appLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculator TVA 2026",
  url: "https://amcupon.ro/calculator-tva",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
  description:
    "Calculator TVA pentru Romania: adauga TVA la o suma fara TVA sau extrage TVA-ul dintr-o suma cu TVA inclus, cu cotele 21% si 11%.",
  inLanguage: "ro-RO",
  provider: { "@type": "Organization", name: "AmCupon.ro", url: "https://amcupon.ro" },
};

// Intrebari reale despre TVA — raspunsuri scurte si corecte, nu umplutura.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Care este cota de TVA in Romania in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cota standard este 21%, aplicata majoritatii bunurilor si serviciilor. Cota redusa este 11% si se aplica la alimente de baza, medicamente de uz uman, carti si manuale, apa potabila, lemn de foc, servicii de restaurant si catering si cazare hoteliera. Cotele au fost modificate la 1 august 2025, cand standardul a crescut de la 19% la 21%, iar cotele reduse de 5% si 9% au fost inlocuite cu una singura, de 11%.",
      },
    },
    {
      "@type": "Question",
      name: "Cum extrag TVA-ul dintr-un pret care il include deja?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Imparti pretul cu TVA la 1,21 pentru cota standard (sau la 1,11 pentru cota redusa) si obtii baza fara TVA. TVA-ul este diferenta dintre pretul initial si aceasta baza. Atentie: NU se scad direct 21% din pretul cu TVA — ar da un rezultat gresit. La 1.210 lei cu TVA, baza reala este 1.000 lei, nu 955,90 lei.",
      },
    },
    {
      "@type": "Question",
      name: "Cum adaug TVA la un pret fara TVA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inmultesti pretul fara TVA cu cota (0,21 pentru 21% sau 0,11 pentru 11%) si obtii valoarea TVA. Totalul de plata este suma dintre pretul fara TVA si TVA. Pe scurt, poti inmulti direct cu 1,21, respectiv 1,11.",
      },
    },
    {
      "@type": "Question",
      name: "Mai exista cota de TVA de 9% sau 5%?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nu, pentru operatiuni noi. Cotele de 5% si 9% au fost eliminate la 1 august 2025 si inlocuite cu cota unica redusa de 11%. A existat o prevedere tranzitorie de 9% pentru anumite livrari de locuinte, cu contracte semnate inainte de august 2025, dar aceasta a expirat la 31 iulie 2026. Cota de 9% ramane relevanta doar daca recalculezi o factura mai veche.",
      },
    },
  ],
};

export default function CalculatorTvaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <CalculatorTvaClient />
    </>
  );
}
