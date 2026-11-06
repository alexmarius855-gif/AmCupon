import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Dr. Max — Oferte Farmacie 2026 | AmCupon.ro",
  description: "Coduri de reducere Dr. Max actualizate zilnic. Reduceri la medicamente OTC, suplimente, cosmetice și produse de sănătate. Promoții Dr. Max verificate.",
  keywords: ["cod reducere dr max", "drmax reduceri", "dr max promoții", "farmacie online reduceri", "dr max discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/drmax.ro" },
  openGraph: {
    title: "Reduceri Dr. Max 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Dr. Max farmacie online verificate zilnic. Medicamente, suplimente și cosmetice la prețuri reduse.",
    url: "https://amcupon.ro/drmax",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "drmax.ro", slugAlt: "drmax", name: "Dr. Max", canonical: "/drmax" }, META);
}

export default function DrmaxPage() {
  return (
    <BrandPageTemplate config={{
      slug: "drmax.ro",
      slugAlt: "drmax",
      name: "Dr. Max",
      tagline: "Farmacia online de încredere — medicamente, suplimente și cosmetice",
      emoji: "💊",
      desc: "Coduri de reducere Dr. Max farmacie online actualizate zilnic. Reduceri la medicamente OTC, suplimente și cosmetice.",
      editorial: [
        "Dr. Max este unul dintre cele mai mari lanțuri de farmacii din România, cu sute de unități fizice și o platformă online completă. Farmacia online Dr. Max oferă medicamente fără prescripție (OTC), suplimente alimentare, produse dermatocosmetice și articole de îngrijire personală.",
        "Pe AmCupon.ro publicăm toate promoțiile Dr. Max disponibile — de la reduceri la suplimente la campanii sezoniere pe produse de răceală și gripă. Codurile de reducere Dr. Max se actualizează automat de mai multe ori pe zi.",
        "Dr. Max Club este programul de fidelitate care oferă puncte la fiecare achiziție, atât online cât și în farmaciile fizice. Punctele acumulate se transformă în reduceri la cumpărăturile următoare.",
      ],
      tips: [
        "Dr. Max Club are puncte de fidelitate la cumpărături; regulile de acumulare și folosire sunt pe site-ul Dr. Max.",
        "Verifică secțiunea de promoții Dr. Max înainte de comandă — ofertele se schimbă des.",
        "Cumpără suplimentele în pachete mari (3+1 sau 2+1 gratuit) — economii semnificative pe termen lung.",
        "Combină codul de reducere Dr. Max cu promoția existentă pentru economii maxime.",
        "Livrarea gratuită la comenzi peste pragul minim — adaugă produse din lista de cumpărături regulate.",
      ],
      faq: [
        { q: "Pot comanda medicamente pe rețetă pe Dr. Max online?", a: "Momentan Dr. Max online vinde doar medicamente fără prescripție (OTC). Pentru medicamente cu rețetă trebuie să mergi la una din farmaciile fizice Dr. Max." },
        { q: "Cum aplic un cod de reducere pe Dr. Max?", a: "La finalizarea comenzii online, introdu codul în câmpul 'Cod promoțional' și apasă Aplică. Reducerea se deduce automat din totalul comenzii." },
        { q: "Cât durează livrarea de la Dr. Max online?", a: "Poți alege livrarea prin curier sau ridicarea dintr-o farmacie Dr. Max. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Dr. Max livrează gratuit?", a: "Da, livrarea este gratuită la comenzi peste un anumit prag. Comenzile sub acest prag au o taxă de curierat standard." },
      ],
      canonical: "/drmax",
    }} />
  );
}
