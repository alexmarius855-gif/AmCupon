import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Noriel — Oferte Jucarii 2026 | AmCupon.ro",
  description: "Coduri de reducere Noriel actualizate zilnic. Reduceri la jucarii, jocuri de societate, articole pentru copii si seturi LEGO. Promotii Noriel verificate.",
  keywords: ["cod reducere noriel", "noriel reduceri", "noriel promotii", "jucarii reduceri", "noriel discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/noriel.ro" },
  openGraph: {
    title: "Reduceri Noriel 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Noriel verificate zilnic. Jucarii, LEGO si jocuri de societate pentru copii la preturi reduse.",
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
      tagline: "Cel mai mare magazin de jucarii din Romania — LEGO, jocuri si distractie",
      emoji: "🧸",
      desc: "Coduri de reducere Noriel jucarii actualizate zilnic. Reduceri la jucarii, seturi LEGO, jocuri de societate si articole pentru copii.",
      editorial: [
        "Noriel este unul dintre cele mai mari lanturi de magazine de jucarii din Romania, cu prezenta atat in marile centre comerciale cat si online. Oferita o gama completa de jucarii pentru toate varstele — de la jucarii pentru bebelusi la seturi LEGO complexe si jocuri de societate pentru familie.",
        "Pe AmCupon.ro publicăm promoțiile Noriel pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Perioadele cu cele mai multe promotii sunt inainte de Craciun, de Paste si la inceputul scolii.",
        "Noriel Club este programul de fidelitate care acorda puncte la fiecare achizitie. Punctele se pot folosi ca reducere la urmatoarele comenzi, atat online cat si in magazinele fizice.",
      ],
      tips: [
        "La LEGO, urmareste perioadele de promotii — reducerile apar si la seturi noi.",
        "Verifica sectiunea 'Outlet' Noriel pentru jucarii la preturi reduse semnificativ — stoc limitat.",
        "Seturi bundle (jucarie + accesoriu) ofera mai buna valoare decat produsele cumparate separat.",
        "Aboneaza-te la newsletter Noriel pentru alerte de reduceri la jucariile dorite de copilul tau.",
        "Compara pretul online vs in magazin — uneori promotiile online sunt mai avantajoase.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Noriel?", a: "La finalizarea comenzii online, cauta campul 'Cod voucher' sau 'Cod promotional'. Introdu codul si apasa Aplica — reducerea se adauga automat la total." },
        { q: "Noriel livreaza gratuit?", a: "Pragul pentru livrare gratuita il vezi in cos. Poti alege si ridicarea dintr-un magazin Noriel. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Pot returna jucarii la Noriel?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Jucaria trebuie sa fie in starea in care ai primit-o; termenul exact si costul returului sunt pe site-ul Noriel." },
        { q: "Noriel are si jocuri de societate pentru adulti?", a: "Da, Noriel are o sectiune dedicata jocurilor de societate pentru adulti si familie, inclusiv titluri populare internationale si jocuri romanesti." },
      ],
      canonical: "/noriel",
    }} />
  );
}
