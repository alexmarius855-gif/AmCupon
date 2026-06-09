import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Liki24 — Farmacie Online 2026 | AmCupon.ro",
  description: "Coduri de reducere Liki24 farmacie online actualizate zilnic. Reduceri la medicamente, suplimente, cosmetice si produse naturiste. Promotii Liki24 verificate.",
  keywords: ["cod reducere liki24", "liki24 reduceri", "liki24 promotii", "farmacie online ieftina", "liki24 discount"],
  alternates: { canonical: "https://amcupon.ro/liki24" },
  openGraph: {
    title: "Reduceri Liki24 Farmacie Online 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Liki24 verificate zilnic. Medicamente si suplimente la preturi reduse.",
    url: "https://amcupon.ro/liki24",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function Liki24Page() {
  return (
    <BrandPageTemplate config={{
      slug: "liki24.ro",
      slugAlt: "liki24",
      name: "Liki24",
      tagline: "Farmacie online — medicamente, suplimente si cosmetice la preturi mici",
      emoji: "🏥",
      desc: "Coduri de reducere Liki24 farmacie online verificate zilnic. Reduceri la medicamente OTC, suplimente si cosmetice dermatologice.",
      editorial: [
        "Liki24 este o farmacie online moderna care ofera medicamente fara prescriptie (OTC), suplimente alimentare, produse dermatocosmetice si articole de ingrijire personala la preturi competitive. Platforma are o gama extinsa de branduri farmaceutice si un sistem simplu de comanda.",
        "Pe AmCupon.ro publicam toate promotiile Liki24 disponibile. Reducerile se gasesc frecvent la suplimente vitamine si minerale, produse cosmetice dermatologice si articole de sezon (produse anti-raceala, creme solare).",
        "Liki24 are politica de preturi transparenta si ofera adesea reduceri mai mari decat farmaciile fizice la produse de ingrijire si suplimente — cumparand online economisesti atat bani cat si timp.",
      ],
      tips: [
        "Cumpara suplimentele in pachete de 3-6 luni — economii semnificative fata de cumparatura lunara.",
        "Verifica data de expirare la suplimentele cu reducere mare — asigura-te ca ai timp sa le consumi.",
        "Compara pretul Liki24 cu alte farmacii online pentru produsele de intretinere regulata.",
        "Aboneaza-te la newsletter Liki24 pentru oferte exclusive si alerte la produsele urmărite.",
        "Livrarea rapida (next day) merita costul suplimentar pentru medicamente urgente.",
      ],
      faq: [
        { q: "Liki24 vinde medicamente cu reteta?", a: "Nu, Liki24 vinde exclusiv medicamente fara prescriptie (OTC), suplimente alimentare si cosmetice. Pentru medicamente cu reteta ai nevoie de o farmacie autorizata." },
        { q: "Cum aplic un cod de reducere pe Liki24?", a: "La finalizarea comenzii, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul copiat de pe AmCupon.ro si apasa Aplica pentru a vedea reducerea aplicata." },
        { q: "Cat dureaza livrarea de la Liki24?", a: "Livrarea standard Liki24 dureaza 1-3 zile lucratoare. Exista si optiune de livrare rapida (next day) cu cost suplimentar." },
        { q: "Produsele Liki24 sunt originale?", a: "Da, Liki24 achizitioneaza produse exclusiv de la distribuitori autorizati si garanteaza autenticitatea tuturor produselor vandute." },
      ],
      canonical: "/liki24",
    }} />
  );
}
