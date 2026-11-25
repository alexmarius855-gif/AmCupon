import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Petmart — Oferte Animale 2026 | AmCupon.ro",
  description: "Coduri de reducere Petmart actualizate zilnic. Reduceri la hrană câini, pisici, accesorii și medicamente veterinare. Promoții Petmart verificate.",
  keywords: ["cod reducere petmart", "petmart reduceri", "petmart promoții", "hrană animale reduceri", "petmart discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/petmart.ro" },
  openGraph: {
    title: "Reduceri Petmart 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Petmart verificate zilnic. Hrană, accesorii și produse veterinare pentru animale de companie la prețuri reduse.",
    url: "https://amcupon.ro/petmart",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "petmart.ro", slugAlt: "petmart", name: "Petmart", canonical: "/petmart" }, META);
}

export default function PetmartPage() {
  return (
    <BrandPageTemplate config={{
      slug: "petmart.ro",
      slugAlt: "petmart",
      name: "Petmart",
      tagline: "Tot ce are nevoie animalul tău — hrana, accesorii și îngrijire",
      emoji: "🐾",
      desc: "Coduri de reducere Petmart actualizate zilnic. Reduceri la hrana caini și pisici, accesorii și produse veterinare.",
      editorial: [
        "Petmart este unul dintre cele mai mari magazine online specializate pentru animale de companie din România. Oferă o gama completa de produse pentru caini, pisici, pasari, pești și animale mici — de la hrana premium la accesorii, jucării și produse de îngrijire.",
        "Pe AmCupon.ro publicam toate promoțiile Petmart actualizate. Reducerile sunt frecvente pe hrana uscata și umeda în pachete mari, accesorii sezoniere și produse veterinare fără prescripție.",
        "Petmart colaborează cu branduri premium de hrana pentru animale — Royal Canin, Hill's, Purina Pro Plan, Orijen — și oferă adesea promoții bundle (sac mare + pateuri gratis) ce reprezinta economii reale pentru stăpânii de animale.",
      ],
      tips: [
        "Cumpara hrana uscata în saci de 12-15 kg — prețul per kilogram este semnificativ mai mic decât sacii mici.",
        "Verifica dacă Petmart are livrare recurenta și dacă vine cu reducere — merita la hrana pe care o cumperi lunar.",
        "Verifica secțiunea 'Outlet' pentru accesorii și produse aproape de expirare la preturi foarte reduse.",
        "Combina codul de reducere Petmart cu promoțiile active pentru economii maxime la comenzile mari.",
        "Comanda nainte de weekend — livrarea se face mai rapid vineri decât luni.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Petmart?", a: "La finalizarea comenzii, cauta câmpul 'Cod promoțional'. Introdu codul și apasa Aplica — reducerea se scade automat din total." },
        { q: "Petmart livrează gratuit?", a: "Da, Petmart oferă livrare gratuita la comenzi peste un anumit prag. Comenzile cu produse grele (saci mari de hrana) beneficiază de livrare la domiciliu." },
        { q: "Hrana de pe Petmart este originala?", a: "Da, Petmart lucrează direct cu distribuitorii autorizați ai brandurilor de hrana pentru animale. Toate produsele sunt originale și în termen de valabilitate." },
        { q: "Pot returna hrana pentru animale de la Petmart?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Hrana deschisa sau perisabila nu se poate returna; termenul exact e pe site-ul Petmart." },
      ],
      canonical: "/petmart",
    }} />
  );
}
