import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Carturesti — Oferte Carti 2026 | AmCupon.ro",
  description: "Coduri de reducere Carturesti actualizate zilnic. Reduceri la carti, jocuri de societate, papetarie si cadouri culturale. Promotii Carturesti verificate.",
  keywords: ["cod reducere carturesti", "carturesti reduceri", "carturesti promotii", "carti reducere", "carturesti discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/carturesti.ro" },
  openGraph: {
    title: "Reduceri Carturesti 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Carturesti verificate zilnic. Carti, jocuri de societate si cadouri la preturi reduse.",
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
      tagline: "Libraria culturala a Romaniei — carti, muzica, film si cadouri",
      emoji: "📚",
      desc: "Coduri de reducere Carturesti actualizate zilnic. Reduceri la carti romanesti si straine, jocuri de societate, papetarie.",
      editorial: [
        "Carturesti este una dintre cele mai cunoscute retele de librarii din Romania, cu prezenta atat fizica (librarii in marile orase) cat si online. Oferita o selectie vasta de carti romanesti si internationale, jocuri de societate, muzica, film si produse de papetarie premium.",
        "Pe AmCupon.ro publicăm promoțiile Carturesti pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar la titluri noi si in campaniile de aniversare.",
        "Carturesti organizeaza periodic campanii tematice: saptamana cartii, targuri online, reduceri de Black Friday si campanii back-to-school. Aboneaza-te la newsletter-ul lor pentru acces anticipat la promotii.",
      ],
      tips: [
        "Comanda minimum 3 carti simultan pentru a atinge pragul de livrare gratuita Carturesti.",
        "Sectiunea 'Promotii' din meniu are mereu carti la 50% sau mai mult — titluri clasice si recente.",
        "Pachetele tematice (ex: pachet thriller, pachet fantasy) pot iesi mai ieftin decat cartile cumparate separat.",
        "Carturesti Club — programul de fidelitate — ofera puncte la fiecare comanda care se transforma in reduceri viitoare.",
        "Jocurile de societate din Carturesti sunt adesea mai ieftine decat in magazinele fizice specializate.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Carturesti?", a: "La finalizarea comenzii online, introdu codul in campul dedicat 'Cod promotional' sau 'Voucher'. Reducerea se aplica automat la total. Unele coduri sunt valabile doar pentru anumite categorii sau valori minime de comanda." },
        { q: "Carturesti livreaza gratuit?", a: "Pragul pentru livrare gratuita il vezi in cos, pe site-ul Carturesti. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Pot returna o carte la Carturesti?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Cartea trebuie sa fie in starea in care ai primit-o; termenul exact e pe site-ul Carturesti." },
        { q: "Carturesti are si carti in engleza?", a: "Da, Carturesti are o sectiune extinsa de carti in engleza si alte limbi straine, inclusiv titluri internationale recente care nu sunt disponibile in traducere romana." },
      ],
      canonical: "/carturesti",
    }} />
  );
}
