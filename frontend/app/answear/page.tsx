import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Answear — Oferte Fashion Online 2026",
  description: "Coduri de reducere Answear actualizate zilnic. Reduceri la haine, incaltaminte si accesorii de brand. Promotii Answear.ro verificate.",
  keywords: ["cod reducere answear", "answear reduceri", "answear promotii", "haine online reduceri", "answear discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/answear.ro" },
  openGraph: {
    title: "Reduceri Answear Fashion 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Answear verificate zilnic. Haine, incaltaminte si accesorii de brand la preturi reduse.",
    url: "https://amcupon.ro/answear",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "answear.ro", slugAlt: "answear", name: "Answear", canonical: "/answear" }, META);
}

export default function AnswearPage() {
  return (
    <BrandPageTemplate config={{
      slug: "answear.ro",
      slugAlt: "answear",
      name: "Answear",
      tagline: "Fashion online — branduri internationale la preturi accesibile",
      emoji: "👗",
      desc: "Coduri de reducere Answear actualizate zilnic. Reduceri la haine, incaltaminte si accesorii de la sute de branduri internationale.",
      editorial: [
        "Answear.ro este unul dintre cele mai mari magazine de fashion online din Romania, cu sute de branduri internationale: Nike, Adidas, Guess, Calvin Klein, Tommy Hilfiger, Liu Jo si multe altele. Platforma ofera haine, incaltaminte si accesorii pentru barbati, femei si copii.",
        "Pe AmCupon.ro publicăm promoțiile Answear pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Answear are promotii de sezon — reduceri de vara si de iarna, plus promotii punctuale la colectii noi si branduri selectate.",
        "Answear.ro are o politica de retur de 30 de zile (verificata pe site in octombrie 2026). Platforma are si o sectiune SALE permanenta unde gasesti branduri premium la preturi semnificativ reduse.",
      ],
      tips: [
        "Filtreaza dupa brand in sectiunea SALE ca sa gasesti mai repede articolele reduse.",
        "Creeaza-ti cont Answear — membrii primesc acces prioritar la oferte si promotii exclusive.",
        "Comanda mai multe articole pentru a amortiza costul de livrare sau pentru a atinge pragul de livrare gratuita.",
        "Verifica sectiunea 'Outlet' pentru articole din colectii anterioare, cu reduceri.",
        "Foloseste codul de reducere Answear de pe AmCupon.ro la checkout pentru economii suplimentare.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Answear?", a: "La finalizarea comenzii, cauta campul 'Cod promotional' in sectiunea de plata. Introdu codul copiat de pe AmCupon.ro si apasa Aplica — reducerea se scade automat din total." },
        { q: "Answear livreaza gratuit in Romania?", a: "Da, Answear ofera livrare gratuita la comenzi peste un anumit prag (de obicei 200-250 lei). Sub prag se plateste o taxa de transport standard." },
        { q: "Care este politica de retur Answear?", a: "Answear accepta retururi in 30 de zile de la livrare. Produsele trebuie sa fie purtate/nespalate, cu etichetele intacte. Returul se face prin curier, cu formular online." },
        { q: "Answear vinde produse originale?", a: "Answear declara ca lucreaza direct cu brandurile sau cu distribuitori autorizati. Primesti factura, iar pentru produse ai garantia legala de conformitate." },
      ],
      canonical: "/answear",
    }} />
  );
}
