import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Petmax — Produse Animale de Companie 2026",
  description: "Coduri de reducere Petmax actualizate zilnic. Reduceri la hrană, accesorii și produse pentru câini, pisici și alte animale. Promoții Petmax verificate.",
  keywords: ["cod reducere petmax", "petmax reduceri", "produse animale reduceri", "petmax promoții", "petmax discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/petmax.ro" },
  openGraph: { title: "Reduceri Petmax Animale 2026 | AmCupon.ro", url: "https://amcupon.ro/petmax", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "petmax.ro", slugAlt: "petmax", name: "Petmax", canonical: "/petmax" }, META);
}

export default function PetmaxPage() {
  return (
    <BrandPageTemplate config={{
      slug: "petmax.ro",
      slugAlt: "petmax",
      name: "Petmax",
      tagline: "Hrană și accesorii pentru animale — totul pentru prietenul tău blănos",
      emoji: "🐕",
      desc: "Coduri de reducere Petmax actualizate zilnic. Reduceri la hrană premium, accesorii și produse de îngrijire pentru câini, pisici și alte animale.",
      editorial: [
        "Petmax.ro este un magazin online specializat în produse pentru animale de companie, cu o gamă largă de hrană uscată și umedă, accesorii, jucării, produse de îngrijire și tratamente. Platforma oferă branduri premium ca Royal Canin, Hill's, Purina Pro Plan, Brit și multe altele.",
        "Pe AmCupon.ro publicăm promoțiile Petmax pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar frecvent la hrană în cantități mari (saci 10-15 kg), la lansări de produse noi și în perioadele de promoții sezoniere.",
        "Petmax are livrare rapidă și posibilitatea de comandă recurentă cu reducere suplimentară — ideal pentru hrana de care animalul tău are nevoie lunar.",
      ],
      tips: [
        "Cumpără hrană în cantități mari (saci 10+ kg) — prețul per gram e semnificativ mai mic.",
        "Verifică dacă Petmax are livrare recurentă și dacă vine cu reducere — merită la hrana pe care o cumperi lunar.",
        "Compară hrana pe baza ingredientelor, nu doar a prețului — calitatea diferă mult.",
        "Treci gradual la o hrană nouă pe parcursul a 7-10 zile pentru a evita probleme digestive.",
        "Verifică secțiunea de produse în cantități promoționale — pachete duble sau triple cu reducere.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Petmax?", a: "La finalizarea comenzii, caută câmpul 'Cod voucher' sau 'Cod promoțional'. Introdu codul copiat de pe AmCupon.ro și apasă Aplică pentru a vedea reducerea aplicată." },
        { q: "Petmax oferă livrare gratuită?", a: "Da, Petmax oferă livrare gratuită la comenzi peste un anumit prag. Sacii de hrană mare ating ușor pragul de livrare gratuită." },
        { q: "Hrana de la Petmax este autentică?", a: "Pe pagina fiecărui produs de pe Petmax vezi producătorul și detaliile lui; data de expirare o verifici pe ambalaj la primire. Pentru orice produs ai garanția legală de conformitate." },
        { q: "Petmax are medicamente veterinare?", a: "Petmax vinde produse antiparazitare (tratamente purici, căpușe), suplimente nutritive și produse de îngrijire, dar nu medicamente veterinare cu prescripție. Pentru medicamente, mergi la o farmacie veterinară." },
      ],
      canonical: "/petmax",
    }} />
  );
}
