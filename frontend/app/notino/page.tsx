import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Notino — Oferte Parfumuri si Cosmetice 2026 | AmCupon.ro",
  description: "Coduri de reducere Notino actualizate zilnic. Reduceri la parfumuri, cosmetice si produse de ingrijire de la branduri premium. Promotii Notino verificate.",
  keywords: ["cod reducere notino", "notino reduceri", "notino promotii", "parfumuri online reduceri", "notino discount"],
  alternates: { canonical: "https://amcupon.ro/notino" },
  openGraph: {
    title: "Reduceri Notino Parfumuri 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Notino verificate zilnic. Parfumuri si cosmetice premium la preturi reduse.",
    url: "https://amcupon.ro/notino",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function NotinoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "notino.ro",
      slugAlt: "notino",
      name: "Notino",
      tagline: "Parfumuri si cosmetice premium — cel mai mare magazin de beauty online",
      emoji: "🌸",
      desc: "Coduri de reducere Notino verificate zilnic. Reduceri la parfumuri, machiaj, skincare si produse de ingrijire de la mii de branduri.",
      editorial: [
        "Notino este cel mai mare magazin online de parfumuri si cosmetice din Europa, cu livrare in Romania. Platforma ofera zeci de mii de produse de la branduri premium — Chanel, Dior, YSL, MAC, La Roche-Posay, Clinique si multe altele — la preturi competitive fata de magazinele fizice.",
        "Pe AmCupon.ro publicam toate promotiile Notino disponibile. Reducerile apar frecvent la seturi cadou (mai ales inainte de sarbatori), la colectii sezoniere si in campaniile Flash Sale cu reduceri de 24-48 ore. Platforma are si o sectiune de produse retur cu reduceri semnificative.",
        "Notino se remarca prin autenticitatea garantata a produselor, livrare rapida si serviciu de comparare a preturilor cu note si recenzii detaliate. Parfumurile pot fi comparate dupa note olfactive, ceea ce face cumparatura online mult mai usoara.",
      ],
      tips: [
        "Aboneaza-te la newsletter Notino pentru acces la Flash Sale-uri cu reduceri de 30-50% valabile doar cateva ore.",
        "Compara variantele EDT vs EDP — de obicei EDT e mai ieftina si potrivita pentru uz zilnic.",
        "Seturile cadou Notino ofera adesea mai multa valoare decat produsele separate — bune si pentru cadouri.",
        "Verifica sectiunea 'Produse retur' pentru produse sigilate retur cu reduceri de 20-40%.",
        "Foloseste codul de reducere Notino de pe AmCupon.ro pentru economii suplimentare la prima comanda.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Notino?", a: "In cosul de cumparaturi sau la checkout, cauta campul 'Cod promotional' sau 'Cupon'. Introdu codul de pe AmCupon.ro si apasa Aplica pentru a vedea reducerea reflectata in total." },
        { q: "Parfumurile Notino sunt originale?", a: "Da, Notino garanteaza autenticitatea tuturor produselor. Platforma achizitioneaza direct de la producatori sau distribuitori autorizati si nu vinde produse contrafacute sau imitate." },
        { q: "Cat dureaza livrarea de la Notino in Romania?", a: "Livrarea standard Notino in Romania dureaza 2-4 zile lucratoare. Exista optiune de livrare rapida. Comenzile peste pragul minim beneficiaza de livrare gratuita." },
        { q: "Pot returna un parfum deschis de la Notino?", a: "Notino accepta retururi in 30 de zile. Produsele deschise pot fi returnate daca sunt aproape intacte. Verifica conditiile de retur din sectiunea de help a platformei." },
      ],
      canonical: "/notino",
    }} />
  );
}
