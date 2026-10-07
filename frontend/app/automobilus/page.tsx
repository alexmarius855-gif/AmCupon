import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Automobilus — Piese si Accesorii Auto 2026",
  description: "Coduri de reducere Automobilus actualizate zilnic. Reduceri la piese auto, accesorii si consumabile. Promotii Automobilus verificate.",
  keywords: ["cod reducere automobilus", "automobilus reduceri", "piese auto reduceri", "automobilus promotii", "automobilus discount"],
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
      tagline: "Piese auto, accesorii si consumabile — tot ce are nevoie masina ta",
      emoji: "🚗",
      desc: "Coduri de reducere Automobilus actualizate zilnic. Reduceri la piese auto, uleiuri, filtre, accesorii si consumabile auto.",
      editorial: [
        "Automobilus.ro este un magazin online specializat in piese auto, accesorii si consumabile pentru autoturisme, avand un catalog extins de sute de mii de referinte pentru toate marcile si modelele auto comune in Romania. De la filtre si uleiuri pana la piese de schimb si accesorii, Automobilus acopera tot ce are nevoie masina ta.",
        "Pe AmCupon.ro publicăm promoțiile Automobilus pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar frecvent la uleiurile de motor si filtre, la accesorii sezoniere (anvelope, lichide antigel) si in campaniile speciale de revizie.",
        "Automobilus are cautare dupa marca, model si motor, ca sa gasesti piesa potrivita; la nelamuriri, verifica codul piesei cu un service.",
      ],
      tips: [
        "Verifica intotdeauna compatibilitatea piesei cu modelul tau exact de masina inainte de comanda.",
        "La uleiul de motor, compara pretul pe litru intre ambalajele mari si cele mici.",
        "Schimba filtrele (aer, ulei, combustibil, habitaclu) simultan — economisesti manopera si ai piesele la indemana.",
        "Urmareste promotiile de toamna la anvelope de iarna — preturile cresc cand vine sezonul rece.",
        "Pastreaza chitantele si facturile pentru garantia pieselor — necesare in caz de reclamatie.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Automobilus?", a: "La finalizarea comenzii, cauta campul 'Cod voucher' sau 'Cod promotional'. Introdu codul de pe AmCupon.ro si apasa Aplica pentru reducere." },
        { q: "Cum gasesc piesa potrivita pe Automobilus?", a: "Introduci marca, modelul, anul de fabricatie si motorul, iar site-ul iti arata piesele compatibile. Pentru siguranta, verifica si codul piesei originale sau intreaba un service." },
        { q: "Cat dureaza livrarea de la Automobilus?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Automobilus accepta retururi?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Conditiile pentru piese montate, electrice sau consumabile desigilate sunt pe site-ul Automobilus — citeste-le inainte sa montezi piesa." },
      ],
      canonical: "/automobilus",
    }} />
  );
}
