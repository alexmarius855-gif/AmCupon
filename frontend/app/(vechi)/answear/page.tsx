import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Answear — Oferte Fashion Online 2026",
  description: "Coduri de reducere Answear actualizate zilnic. Reduceri la haine, încălțăminte și accesorii de brand. Promoții Answear.ro verificate.",
  keywords: ["cod reducere answear", "answear reduceri", "answear promoții", "haine online reduceri", "answear discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/answear.ro" },
  openGraph: {
    title: "Reduceri Answear Fashion 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Answear verificate zilnic. Haine, încălțăminte și accesorii de brand la prețuri reduse.",
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
      tagline: "Fashion online — branduri internaționale la prețuri accesibile",
      emoji: "👗",
      desc: "Coduri de reducere Answear actualizate zilnic. Reduceri la haine, încălțăminte și accesorii de la sute de branduri internaționale.",
      editorial: [
        "Answear.ro este unul dintre cele mai mari magazine de fashion online din România, cu sute de branduri internaționale: Nike, Adidas, Guess, Calvin Klein, Tommy Hilfiger, Liu Jo și multe altele. Platforma oferă haine, încălțăminte și accesorii pentru bărbați, femei și copii.",
        "Pe AmCupon.ro publicăm promoțiile Answear pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Answear are promoții de sezon — reduceri de vară și de iarnă, plus promoții punctuale la colecții noi și branduri selectate.",
        "Answear.ro are o politică de retur de 30 de zile (verificată pe site în octombrie 2026). Platforma are și o secțiune SALE permanentă unde găsești branduri premium la prețuri semnificativ reduse.",
      ],
      tips: [
        "Filtrează după brand în secțiunea SALE ca să găsești mai repede articolele reduse.",
        "Creează-ți cont Answear — membrii primesc acces prioritar la oferte și promoții exclusive.",
        "Comandă mai multe articole pentru a amortiza costul de livrare sau pentru a atinge pragul de livrare gratuită.",
        "Verifică secțiunea 'Outlet' pentru articole din colecții anterioare, cu reduceri.",
        "Folosește codul de reducere Answear de pe AmCupon.ro la checkout pentru economii suplimentare.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Answear?", a: "La finalizarea comenzii, caută câmpul 'Cod promoțional' în secțiunea de plată. Introdu codul copiat de pe AmCupon.ro și apasă Aplică — reducerea se scade automat din total." },
        { q: "Answear livrează gratuit în România?", a: "Da, Answear oferă livrare gratuită la comenzi peste un anumit prag (de obicei 200-250 lei). Sub prag se plătește o taxă de transport standard." },
        { q: "Care este politica de retur Answear?", a: "Answear acceptă retururi în 30 de zile de la livrare. Produsele trebuie să fie nepurtate/nespălate, cu etichetele intacte. Returul se face prin curier, cu formular online." },
        { q: "Answear vinde produse originale?", a: "Answear declară că lucrează direct cu brandurile sau cu distribuitori autorizați. Primești factura, iar pentru produse ai garanția legală de conformitate." },
      ],
      canonical: "/answear",
    }} />
  );
}
