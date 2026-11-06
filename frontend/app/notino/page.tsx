import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Notino — Oferte Parfumuri și Cosmetice 2026",
  description: "Coduri de reducere Notino actualizate zilnic. Reduceri la parfumuri, cosmetice și produse de îngrijire de la branduri premium. Promoții Notino verificate.",
  keywords: ["cod reducere notino", "notino reduceri", "notino promoții", "parfumuri online reduceri", "notino discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/notino.ro" },
  openGraph: {
    title: "Reduceri Notino Parfumuri 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Notino verificate zilnic. Parfumuri și cosmetice premium la prețuri reduse.",
    url: "https://amcupon.ro/notino",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "notino.ro", slugAlt: "notino", name: "Notino", canonical: "/notino" }, META);
}

export default function NotinoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "notino.ro",
      slugAlt: "notino",
      name: "Notino",
      tagline: "Parfumuri și cosmetice — magazin online de beauty, cu livrare în România",
      emoji: "🌸",
      desc: "Coduri de reducere Notino actualizate zilnic. Reduceri la parfumuri, machiaj, skincare și produse de îngrijire de la mii de branduri.",
      editorial: [
        "Notino se prezintă drept cel mai mare magazin online de parfumuri și cosmetice din Europa și livrează în România. Platforma oferă zeci de mii de produse de la branduri premium — Chanel, Dior, YSL, MAC, La Roche-Posay, Clinique și multe altele — la prețuri competitive față de magazinele fizice.",
        "Pe AmCupon.ro publicăm toate promoțiile Notino disponibile. Reducerile apar frecvent la seturi cadou (mai ales înainte de sărbători), la colecții sezoniere și în campaniile Flash Sale cu reduceri de 24-48 ore. Platforma are și o secțiune de produse retur cu reduceri semnificative.",
        "Pe Notino găsești recenzii ale cumpărătorilor, iar parfumurile pot fi comparate după note olfactive, ceea ce face cumpărătura online mult mai ușoară.",
      ],
      tips: [
        "Abonează-te la newsletter Notino ca să afli de Flash Sale-urile de scurtă durată.",
        "Compară variantele EDT vs EDP — de obicei EDT e mai ieftină și potrivită pentru uz zilnic.",
        "Seturile cadou Notino oferă adesea mai multă valoare decât produsele separate — bune și pentru cadouri.",
        "Verifică secțiunea 'Produse retur' pentru produse sigilate returnate, cu reducere.",
        "Folosește codul de reducere Notino de pe AmCupon.ro pentru economii suplimentare la prima comandă.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Notino?", a: "În coșul de cumpărături sau la checkout, caută câmpul 'Cod promoțional' sau 'Cupon'. Introdu codul de pe AmCupon.ro și apasă Aplică pentru a vedea reducerea reflectată în total." },
        { q: "Parfumurile Notino sunt originale?", a: "Notino declară că vinde doar produse originale, cumpărate de la producători sau distribuitori autorizați." },
        { q: "Cât durează livrarea de la Notino în România?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă. Pragul pentru livrare gratuită îl vezi tot în coș." },
        { q: "Pot returna un parfum deschis de la Notino?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. La parfumuri și cosmetice desigilate, dreptul de retur poate să nu se aplice, din motive de igienă — citește condițiile Notino înainte să deschizi produsul." },
      ],
      canonical: "/notino",
    }} />
  );
}
