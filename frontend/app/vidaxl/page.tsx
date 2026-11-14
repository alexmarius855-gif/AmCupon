import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere vidaXL — Oferte Mobilier 2026 | AmCupon.ro",
  description: "Coduri de reducere vidaXL actualizate zilnic. Reduceri la mobilier, grădină, sport, auto și electronice. Promoții vidaXL active.",
  keywords: ["cod reducere vidaxl", "vidaxl reduceri", "vidaxl promoții", "mobilier ieftin online", "vidaxl discount"],
  // vidaxl.ro a revenit in date (partener 2Performant, 11.2026); textul rescris pe 14.11.2026 doar cu ce se poate verifica.
  alternates: { canonical: "https://amcupon.ro/vidaxl" },
  openGraph: {
    title: "Reduceri vidaXL 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte vidaXL actualizate zilnic. Mobilier, grădină și articole pentru casă la prețuri reduse.",
    url: "https://amcupon.ro/vidaxl",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "vidaxl.ro", slugAlt: "vidaxl", name: "vidaXL", canonical: "/vidaxl" }, META);
}

export default function VidaxlPage() {
  return (
    <BrandPageTemplate config={{
      slug: "vidaxl.ro",
      slugAlt: "vidaxl",
      name: "vidaXL",
      tagline: "Mobilier, grădină și articole pentru casă",
      emoji: "🛋️",
      desc: "Ofertele vidaXL active: mobilier, grădină, sport și bricolaj.",
      editorial: [
        "vidaXL este un magazin online din Olanda, cu mobilă, articole de grădină, sport și bricolaj. Pe vidaXL.ro găsești mii de produse din aceste categorii: la căutarea după scaune de birou apăreau peste 500 de rezultate, pe 14 noiembrie 2026.",
        "Ofertele de pe această pagină vin de la vidaXL, prin rețeaua de afiliere 2Performant, și dispar când expiră.",
      ],
      tips: [
        "Verifică dimensiunile înainte de comandă: returnarea mobilierului voluminos poate costa.",
        "Costul livrării îl vezi în coș, înainte să plătești.",
        "Citește în descriere dacă produsul vine nemontat.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe vidaXL?", a: "Dacă oferta are cod, îl introduci în coș sau la finalizarea comenzii, în câmpul pentru cod promoțional. Ofertele fără cod se aplică direct pe site." },
        { q: "vidaXL livrează gratuit în România?", a: "Costul livrării depinde de produs și îl vezi în coș, înainte să plătești. Produsele voluminoase pot avea costuri de livrare mai mari." },
        { q: "Pot returna mobilierul de la vidaXL?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; termenul exact, costul returului și condițiile pentru produsele montate sunt pe site-ul vidaXL." },
      ],
      canonical: "/vidaxl",
      categorieSlug: "casa-gradina",
    }} />
  );
}
