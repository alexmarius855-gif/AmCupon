import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Litera — Cărți și Edituri 2026 | AmCupon.ro",
  description: "Coduri de reducere Litera actualizate zilnic. Reduceri la cărți Litera, bestsellere și colecții speciale. Promoții Litera verificate.",
  keywords: ["cod reducere litera", "litera reduceri", "cărți litera reduceri", "litera promoții", "litera discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/litera.ro" },
  openGraph: { title: "Reduceri Litera Cărți 2026 | AmCupon.ro", url: "https://amcupon.ro/litera", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "litera.ro", slugAlt: "litera", name: "Litera", canonical: "/litera" }, META);
}

export default function LiteraPage() {
  return (
    <BrandPageTemplate config={{
      slug: "litera.ro",
      slugAlt: "litera",
      name: "Litera",
      tagline: "Una dintre cele mai mari edituri din România — cărți pentru toate vârstele",
      emoji: "📚",
      desc: "Coduri de reducere Litera actualizate zilnic. Reduceri la cărți din toate genurile, de la ficțiune și non-ficțiune la cărți pentru copii și manuale.",
      editorial: [
        "Litera este una dintre cele mai importante și mai mari edituri din România, cu un portofoliu de mii de titluri în toate genurile: literatură română și străină, non-ficțiune, cărți pentru copii, manuale școlare, ghiduri practice și cărți de sport. Litera a publicat mulți bestselleri internaționali și autori români consacrați.",
        "Pe AmCupon.ro publicăm promoțiile Litera pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar mai des la Back to School (august-septembrie) și de Sărbători.",
        "Litera are și un club de cititori cu beneficii exclusive și o secțiune de e-books în creștere.",
      ],
      tips: [
        "Urmărește secțiunea 'Noutăți' Litera — cărțile noi au uneori reducere de lansare.",
        "Seturile tematice Litera (trilogii, serii) au reducere mai mare decât cumpărătura pe bucată.",
        "La Back to School apar de obicei reduceri la manuale și cărți educaționale.",
        "Cărțile pentru copii Litera au calitate excelentă a ilustrațiilor — investiție bună pe termen lung.",
        "Abonează-te la newsletter Litera pentru acces la promoții exclusive și informații despre lansări.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Litera?", a: "La checkout-ul de pe litera.ro, caută câmpul 'Cod promoțional'. Introdu codul de pe AmCupon.ro și apasă Aplică pentru a beneficia de reducere." },
        { q: "Litera livrează gratuit?", a: "Da, Litera oferă livrare gratuită la comenzi peste un anumit prag. Verifică site-ul pentru condițiile curente de livrare." },
        { q: "Pot cumpăra cărți Litera în format digital?", a: "Da, Litera are o gamă în creștere de e-books disponibile pe platforma lor digitală. Unele titluri sunt disponibile simultan în format fizic și digital." },
        { q: "Litera vinde și manuale școlare?", a: "Da, Litera este unul dintre principalii editori de manuale școlare din România, acoperind toate clasele și materiile din curriculum național." },
      ],
      canonical: "/litera",
    }} />
  );
}
