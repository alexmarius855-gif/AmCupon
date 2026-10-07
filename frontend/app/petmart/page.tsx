import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Petmart — Oferte Animale 2026 | AmCupon.ro",
  description: "Coduri de reducere Petmart actualizate zilnic. Reduceri la hrana caini, pisici, accesorii si medicamente veterinare. Promotii Petmart verificate.",
  keywords: ["cod reducere petmart", "petmart reduceri", "petmart promotii", "hrana animale reduceri", "petmart discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/petmart.ro" },
  openGraph: {
    title: "Reduceri Petmart 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Petmart verificate zilnic. Hrana, accesorii si produse veterinare pentru animale de companie la preturi reduse.",
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
      tagline: "Tot ce are nevoie animalul tau — hrana, accesorii si ingrijire",
      emoji: "🐾",
      desc: "Coduri de reducere Petmart actualizate zilnic. Reduceri la hrana caini si pisici, accesorii si produse veterinare.",
      editorial: [
        "Petmart este unul dintre cele mai mari magazine online specializate pentru animale de companie din Romania. Ofera o gama completa de produse pentru caini, pisici, pasari, pesti si animale mici — de la hrana premium la accesorii, jucarii si produse de ingrijire.",
        "Pe AmCupon.ro publicam toate promotiile Petmart actualizate. Reducerile sunt frecvente pe hrana uscata si umeda in pachete mari, accesorii sezoniere si produse veterinare fara prescriptie.",
        "Petmart colaboreaza cu branduri premium de hrana pentru animale — Royal Canin, Hill's, Purina Pro Plan, Orijen — si ofera adesea promotii bundle (sac mare + pateuri gratis) ce reprezinta economii reale pentru stapanii de animale.",
      ],
      tips: [
        "Cumpara hrana uscata in saci de 12-15 kg — pretul per kilogram este semnificativ mai mic decat sacii mici.",
        "Verifica daca Petmart are livrare recurenta si daca vine cu reducere — merita la hrana pe care o cumperi lunar.",
        "Verifica sectiunea 'Outlet' pentru accesorii si produse aproape de expirare la preturi foarte reduse.",
        "Combina codul de reducere Petmart cu promotiile active pentru economii maxime la comenzile mari.",
        "Comanda nainte de weekend — livrarea se face mai rapid vineri decat luni.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Petmart?", a: "La finalizarea comenzii, cauta campul 'Cod promotional'. Introdu codul si apasa Aplica — reducerea se scade automat din total." },
        { q: "Petmart livreaza gratuit?", a: "Da, Petmart ofera livrare gratuita la comenzi peste un anumit prag. Comenzile cu produse grele (saci mari de hrana) beneficiaza de livrare la domiciliu." },
        { q: "Hrana de pe Petmart este originala?", a: "Da, Petmart lucreaza direct cu distribuitorii autorizati ai brandurilor de hrana pentru animale. Toate produsele sunt originale si in termen de valabilitate." },
        { q: "Pot returna hrana pentru animale de la Petmart?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Hrana deschisa sau perisabila nu se poate returna; termenul exact e pe site-ul Petmart." },
      ],
      canonical: "/petmart",
    }} />
  );
}
