import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Liki24 — Farmacie Online 2026 | AmCupon.ro",
  description: "Coduri de reducere Liki24 farmacie online actualizate zilnic. Reduceri la medicamente, suplimente, cosmetice și produse naturiste. Promoții Liki24 verificate.",
  keywords: ["cod reducere liki24", "liki24 reduceri", "liki24 promoții", "farmacie online ieftină", "liki24 discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/liki24.ro" },
  openGraph: {
    title: "Reduceri Liki24 Farmacie Online 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Liki24 verificate zilnic. Medicamente și suplimente la prețuri reduse.",
    url: "https://amcupon.ro/liki24",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "liki24.ro", slugAlt: "liki24", name: "Liki24", canonical: "/liki24" }, META);
}

export default function Liki24Page() {
  return (
    <BrandPageTemplate config={{
      slug: "liki24.ro",
      slugAlt: "liki24",
      name: "Liki24",
      tagline: "Farmacie online — medicamente, suplimente și cosmetice la prețuri mici",
      emoji: "🏥",
      desc: "Coduri de reducere Liki24 farmacie online actualizate zilnic. Reduceri la medicamente OTC, suplimente și cosmetice dermatologice.",
      editorial: [
        "Liki24 este o farmacie online modernă care oferă medicamente fără prescripție (OTC), suplimente alimentare, produse dermatocosmetice și articole de îngrijire personală la prețuri competitive. Platforma are o gamă extinsă de branduri farmaceutice și un sistem simplu de comandă.",
        "Pe AmCupon.ro publicăm toate promoțiile Liki24 disponibile. Reducerile se găsesc frecvent la suplimente vitamine și minerale, produse cosmetice dermatologice și articole de sezon (produse anti-răceală, creme solare).",
      ],
      tips: [
        "Cumpără suplimentele în pachete de 3-6 luni — economii semnificative față de cumpărătura lunară.",
        "Verifică data de expirare la suplimentele cu reducere mare — asigură-te că ai timp să le consumi.",
        "Compară prețul Liki24 cu alte farmacii online pentru produsele de întreținere regulată.",
        "Abonează-te la newsletter Liki24 pentru oferte exclusive și alerte la produsele urmărite.",
        "Livrarea rapidă (next day) merită urgente keep costul suplimentar pentru medicamente urgente.",
      ],
      faq: [
        { q: "Liki24 vinde medicamente cu rețetă?", a: "Nu, Liki24 vinde exclusiv medicamente fără prescripție (OTC), suplimente alimentare și cosmetice. Pentru medicamente cu rețetă ai nevoie de o farmacie autorizată." },
        { q: "Cum aplic un cod de reducere pe Liki24?", a: "La finalizarea comenzii, caută câmpul 'Cod promoțional' sau 'Voucher'. Introdu codul copiat de pe AmCupon.ro și apasă Aplică pentru a vedea reducerea aplicată." },
        { q: "Cât durează livrarea de la Liki24?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Produsele Liki24 sunt originale?", a: "Liki24 declară că se aprovizionează de la distribuitori autorizați. Pentru siguranță, cumpără medicamentele doar de la farmacii online autorizate." },
      ],
      canonical: "/liki24",
    }} />
  );
}
