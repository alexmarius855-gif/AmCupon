import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Dr. Max — Oferte Farmacie 2026 | AmCupon.ro",
  description: "Coduri de reducere Dr. Max actualizate zilnic. Reduceri la medicamente OTC, suplimente, cosmetice si produse de sanatate. Promotii Dr. Max verificate.",
  keywords: ["cod reducere dr max", "drmax reduceri", "dr max promotii", "farmacie online reduceri", "dr max discount"],
  alternates: { canonical: "https://amcupon.ro/drmax" },
  openGraph: {
    title: "Reduceri Dr. Max 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Dr. Max farmacie online verificate zilnic. Medicamente, suplimente si cosmetice la preturi reduse.",
    url: "https://amcupon.ro/drmax",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function DrmaxPage() {
  return (
    <BrandPageTemplate config={{
      slug: "drmax.ro",
      slugAlt: "drmax",
      name: "Dr. Max",
      tagline: "Farmacia online de incredere — medicamente, suplimente si cosmetice",
      emoji: "💊",
      desc: "Coduri de reducere Dr. Max farmacie online verificate zilnic. Reduceri la medicamente OTC, suplimente si cosmetice.",
      editorial: [
        "Dr. Max este unul dintre cele mai mari lanturi de farmacii din Romania, cu sute de unitati fizice si o platforma online completa. Farmacia online Dr. Max ofera medicamente fara prescriptie (OTC), suplimente alimentare, produse dermatocosmetice si articole de ingrijire personala.",
        "Pe AmCupon.ro publicam toate promotiile Dr. Max disponibile — de la reduceri la suplimente la campanii sezoniere pe produse de raceala si gripa. Codurile de reducere Dr. Max sunt verificate si actualizate zilnic.",
        "Dr. Max Club este programul de fidelitate care ofera puncte la fiecare achizitie, atat online cat si in farmaciile fizice. Punctele acumulate se transforma in reduceri la cumparaturile urmatoare.",
      ],
      tips: [
        "Inscrie-te in Dr. Max Club pentru a acumula puncte la fiecare cumparatura — 1 RON = 1 punct, iar 100 puncte = 1 RON reducere.",
        "Sectiunea 'Promotii saptamanale' are mereu produse cu 20-50% reducere — verifica in fiecare luni.",
        "Cumpara suplimentele in pachete mari (3+1 sau 2+1 gratuit) — economii semnificative pe termen lung.",
        "Combina codul de reducere Dr. Max cu promotia existenta pentru economii maxime.",
        "Livrarea gratuita la comenzi peste pragul minim — adauga produse din lista de cumparaturi regulate.",
      ],
      faq: [
        { q: "Pot comanda medicamente pe reteta pe Dr. Max online?", a: "Momentan Dr. Max online vinde doar medicamente fara prescriptie (OTC). Pentru medicamente cu reteta trebuie sa mergi la una din farmaciile fizice Dr. Max." },
        { q: "Cum aplic un cod de reducere pe Dr. Max?", a: "La finalizarea comenzii online, introdu codul in campul 'Cod promotional' si apasa Aplica. Reducerea se deduce automat din totalul comenzii." },
        { q: "Cat dureaza livrarea de la Dr. Max online?", a: "Livrarea standard dureaza 2-4 zile lucratoare. Exista si optiunea de ridicare din farmacia Dr. Max cea mai apropiata, de obicei disponibila in aceeasi zi." },
        { q: "Dr. Max livreaza gratuit?", a: "Da, livrarea este gratuita la comenzi peste un anumit prag. Comenzile sub acest prag au o taxa de curierat standard." },
      ],
      canonical: "/drmax",
    }} />
  );
}
