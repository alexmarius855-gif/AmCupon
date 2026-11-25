import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Automobilus — Piese și Accesorii Auto 2026",
  description: "Coduri de reducere Automobilus actualizate zilnic. Reduceri la piese auto, accesorii și consumabile. Promoții Automobilus verificate.",
  keywords: ["cod reducere automobilus", "automobilus reduceri", "piese auto reduceri", "automobilus promoții", "automobilus discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/automobilus.ro" },
  openGraph: { title: "Reduceri Automobilus Auto 2026 | AmCupon.ro", url: "https://amcupon.ro/automobilus", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "automobilus.ro", slugAlt: "automobilus", name: "Automobilus", canonical: "/automobilus" }, META);
}

export default function AutomobilusPage() {
  return (
    <BrandPageTemplate config={{
      slug: "automobilus.ro",
      slugAlt: "automobilus",
      name: "Automobilus",
      tagline: "Piese auto, accesorii și consumabile — tot ce are nevoie mașina ta",
      emoji: "🚗",
      desc: "Coduri de reducere Automobilus actualizate zilnic. Reduceri la piese auto, uleiuri, filtre, accesorii și consumabile auto.",
      editorial: [
        "Automobilus.ro este un magazin online specializat în piese auto, accesorii și consumabile pentru autoturisme, având un catalog extins de sute de mii de referințe pentru toate mărcile și modelele auto comune în România. De la filtre și uleiuri până la piese de schimb și accesorii, Automobilus acoperă tot ce are nevoie mașina ta.",
        "Pe AmCupon.ro publicăm promoțiile Automobilus pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar frecvent la uleiurile de motor și filtre, la accesorii sezoniere (anvelope, lichide antigel) și în campaniile speciale de revizie.",
        "Automobilus are căutare după marcă, model și motor, ca să găsești piesa potrivită; la nelămuriri, verifică codul piesei cu un service.",
      ],
      tips: [
        "Verifică întotdeauna compatibilitatea piesei cu modelul tău exact de mașină înainte de comandă.",
        "La uleiul de motor, compară prețul pe litru între ambalajele mari și cele mici.",
        "Schimbă filtrele (aer, ulei, combustibil, habitaclu) simultan — economisești manopera și ai piesele la îndemână.",
        "Urmărește promoțiile de toamnă la anvelope de iarnă — prețurile cresc când vine sezonul rece.",
        "Păstrează chitanțele și facturile pentru garanția pieselor — necesare în caz de reclamație.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Automobilus?", a: "La finalizarea comenzii, caută câmpul 'Cod voucher' sau 'Cod promoțional'. Introdu codul de pe AmCupon.ro și apasă Aplică pentru reducere." },
        { q: "Cum găsesc piesa potrivită pe Automobilus?", a: "Introduci marca, modelul, anul de fabricație și motorul, iar site-ul îți arată piesele compatibile. Pentru siguranță, verifică și codul piesei originale sau întreabă un service." },
        { q: "Cât durează livrarea de la Automobilus?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Automobilus acceptă retururi?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Condițiile pentru piese montate, electrice sau consumabile desigilate sunt pe site-ul Automobilus — citește-le înainte să montezi piesa." },
      ],
      canonical: "/automobilus",
    }} />
  );
}
