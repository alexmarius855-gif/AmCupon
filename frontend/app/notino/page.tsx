import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Notino — Oferte Parfumuri si Cosmetice 2026",
  description: "Coduri de reducere Notino actualizate zilnic. Reduceri la parfumuri, cosmetice si produse de ingrijire de la branduri premium. Promotii Notino verificate.",
  keywords: ["cod reducere notino", "notino reduceri", "notino promotii", "parfumuri online reduceri", "notino discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/notino.ro" },
  openGraph: {
    title: "Reduceri Notino Parfumuri 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Notino verificate zilnic. Parfumuri si cosmetice premium la preturi reduse.",
    url: "https://amcupon.ro/notino",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "notino.ro", slugAlt: "notino", name: "Notino", canonical: "/notino" }, META);
}

export default function NotinoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "notino.ro",
      slugAlt: "notino",
      name: "Notino",
      tagline: "Parfumuri si cosmetice — magazin online de beauty, cu livrare in Romania",
      emoji: "🌸",
      desc: "Coduri de reducere Notino actualizate zilnic. Reduceri la parfumuri, machiaj, skincare si produse de ingrijire de la mii de branduri.",
      editorial: [
        "Notino se prezinta drept cel mai mare magazin online de parfumuri si cosmetice din Europa si livreaza in Romania. Platforma ofera zeci de mii de produse de la branduri premium — Chanel, Dior, YSL, MAC, La Roche-Posay, Clinique si multe altele — la preturi competitive fata de magazinele fizice.",
        "Pe AmCupon.ro publicam toate promotiile Notino disponibile. Reducerile apar frecvent la seturi cadou (mai ales inainte de sarbatori), la colectii sezoniere si in campaniile Flash Sale cu reduceri de 24-48 ore. Platforma are si o sectiune de produse retur cu reduceri semnificative.",
        "Pe Notino gasesti recenzii ale cumparatorilor, iar parfumurile pot fi comparate dupa note olfactive, ceea ce face cumparatura online mult mai usoara.",
      ],
      tips: [
        "Aboneaza-te la newsletter Notino ca sa afli de Flash Sale-urile de scurta durata.",
        "Compara variantele EDT vs EDP — de obicei EDT e mai ieftina si potrivita pentru uz zilnic.",
        "Seturile cadou Notino ofera adesea mai multa valoare decat produsele separate — bune si pentru cadouri.",
        "Verifica sectiunea 'Produse retur' pentru produse sigilate returnate, cu reducere.",
        "Foloseste codul de reducere Notino de pe AmCupon.ro pentru economii suplimentare la prima comanda.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Notino?", a: "In cosul de cumparaturi sau la checkout, cauta campul 'Cod promotional' sau 'Cupon'. Introdu codul de pe AmCupon.ro si apasa Aplica pentru a vedea reducerea reflectata in total." },
        { q: "Parfumurile Notino sunt originale?", a: "Notino declara ca vinde doar produse originale, cumparate de la producatori sau distribuitori autorizati." },
        { q: "Cat dureaza livrarea de la Notino in Romania?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă. Pragul pentru livrare gratuita il vezi tot in cos." },
        { q: "Pot returna un parfum deschis de la Notino?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. La parfumuri si cosmetice desigilate, dreptul de retur poate sa nu se aplice, din motive de igiena — citeste conditiile Notino inainte sa deschizi produsul." },
      ],
      canonical: "/notino",
    }} />
  );
}
