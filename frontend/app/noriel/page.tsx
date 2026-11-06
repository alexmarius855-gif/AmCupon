import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Noriel — Oferte Jucării 2026 | AmCupon.ro",
  description: "Coduri de reducere Noriel actualizate zilnic. Reduceri la jucării, jocuri de societate, articole pentru copii și seturi LEGO. Promoții Noriel verificate.",
  keywords: ["cod reducere noriel", "noriel reduceri", "noriel promoții", "jucării reduceri", "noriel discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/noriel.ro" },
  openGraph: {
    title: "Reduceri Noriel 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Noriel verificate zilnic. Jucării, LEGO și jocuri de societate pentru copii la prețuri reduse.",
    url: "https://amcupon.ro/noriel",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "noriel.ro", slugAlt: "noriel", name: "Noriel", canonical: "/noriel" }, META);
}

export default function NorielPage() {
  return (
    <BrandPageTemplate config={{
      slug: "noriel.ro",
      slugAlt: "noriel",
      name: "Noriel",
      tagline: "Unul dintre cele mai mari magazine de jucării din România — LEGO, jocuri și distracție",
      emoji: "🧸",
      desc: "Coduri de reducere Noriel jucării actualizate zilnic. Reduceri la jucării, seturi LEGO, jocuri de societate și articole pentru copii.",
      editorial: [
        "Noriel este unul dintre cele mai mari lanțuri de magazine de jucării din România, cu prezență atât în marile centre comerciale cât și online. Oferă o gamă completă de jucării pentru toate vârstele — de la jucării pentru bebeluși la seturi LEGO complexe și jocuri de societate pentru familie.",
        "Pe AmCupon.ro publicăm promoțiile Noriel pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Perioadele cu cele mai multe promoții sunt înainte de Crăciun, de Paște și la începutul școlii.",
        "Noriel Club este programul de fidelitate care acordă ca keep puncte la fiecare achiziție. Punctele se pot folosi ca reducere la următoarele comenzi, atât online cât și în magazinele fizice.",
      ],
      tips: [
        "La LEGO, urmărește perioadele de promoții — reducerile apar și la seturi noi.",
        "Verifică secțiunea 'Outlet' Noriel pentru jucării la prețuri reduse semnificativ — stoc limitat.",
        "Seturi bundle (jucărie + accesoriu) oferă mai bună valoare decât produsele cumpărate separat.",
        "Abonează-te la newsletter Noriel pentru alerte de reduceri la jucăriile dorite de copilul tău.",
        "Compară prețul online vs în magazin — uneori promoțiile online sunt mai avantajoase.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Noriel?", a: "La finalizarea comenzii online, caută câmpul 'Cod voucher' sau 'Cod promoțional'. Introdu codul și apasă Aplică — reducerea se aplică automat la total." },
        { q: "Noriel livrează gratuit?", a: "Pragul pentru livrare gratuită îl vezi în coș. Poți alege și ridicarea dintr-un magazin Noriel. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Pot returna jucării la Noriel?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Jucăria trebuie să fie în starea în care ai primit-o; termenul exact și costul returului sunt pe site-ul Noriel." },
        { q: "Noriel are și jocuri de societate pentru adulți?", a: "Da, Noriel are o secțiune dedicată jocurilor de societate pentru adulți și familie, inclusiv titluri populare internaționale și jocuri românești." },
      ],
      canonical: "/noriel",
    }} />
  );
}
