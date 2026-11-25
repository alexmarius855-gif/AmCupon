import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Carturesti — Oferte Cărți 2026 | AmCupon.ro",
  description: "Coduri de reducere Carturesti actualizate zilnic. Reduceri la cărți, jocuri de societate, papetărie și cadouri culturale. Promoții Carturesti verificate.",
  keywords: ["cod reducere carturesti", "carturesti reduceri", "carturesti promoții", "cărți reducere", "carturesti discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/carturesti.ro" },
  openGraph: {
    title: "Reduceri Carturesti 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Carturesti verificate zilnic. Cărți, jocuri de societate și cadouri la prețuri reduse.",
    url: "https://amcupon.ro/carturesti",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "carturesti.ro", slugAlt: "carturesti", name: "Carturesti", canonical: "/carturesti" }, META);
}

export default function CarturestiPage() {
  return (
    <BrandPageTemplate config={{
      slug: "carturesti.ro",
      slugAlt: "carturesti",
      name: "Carturesti",
      tagline: "Librăria culturală a României — cărți, muzică, film și cadouri",
      emoji: "📚",
      desc: "Coduri de reducere Carturesti actualizate zilnic. Reduceri la cărți românești și străine, jocuri de societate, papetărie.",
      editorial: [
        "Carturesti este una dintre cele mai cunoscute rețele de librării din România, cu prezență atât fizică (librării în marile orașe) cât și online. Oferă o selecție vastă de cărți românești și internaționale, jocuri de societate, muzică, film și produse de papetărie premium.",
        "Pe AmCupon.ro publicăm promoțiile Carturesti pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar la titluri noi și în campaniile de aniversare.",
        "Carturesti organizează periodic campanii tematice: săptămâna cărții, târguri online, reduceri de Black Friday și campanii back-to-school. Abonează-te la newsletter-ul lor pentru acces anticipat la promoții.",
      ],
      tips: [
        "Pragul de livrare gratuită îl vezi în coș; uneori merită să comanzi mai multe cărți deodată.",
        "Secțiunea 'Promoții' din meniu are titluri la reducere — clasice și recente.",
        "Pachetele tematice (ex: pachet thriller, pachet fantasy) pot ieși mai ieftin decât cărțile cumpărate separat.",
        "Carturesti Club — programul de fidelitate — oferă puncte la fiecare comandă care se transformă în reduceri viitoare.",
        "Jocurile de societate din Carturesti sunt adesea mai ieftine decât în magazinele fizice specializate.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Carturesti?", a: "La finalizarea comenzii online, introdu codul în câmpul dedicat 'Cod promoțional' sau 'Voucher'. Reducerea se aplică automat la total. Unele coduri sunt valabile doar pentru anumite categorii sau valori minime de comandă." },
        { q: "Carturesti livrează gratuit?", a: "Pragul pentru livrare gratuită îl vezi în coș, pe site-ul Carturesti. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Pot returna o carte la Carturesti?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Cartea trebuie să fie în starea în care ai primit-o; termenul exact e pe site-ul Carturesti." },
        { q: "Carturesti are și cărți în engleză?", a: "Da, Carturesti are o secțiune extinsă de cărți în engleză și alte limbi străine, inclusiv titluri internaționale recente care nu sunt disponibile în traducere română." },
      ],
      canonical: "/carturesti",
    }} />
  );
}
