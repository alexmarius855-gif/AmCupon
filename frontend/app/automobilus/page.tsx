import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Automobilus — Piese si Accesorii Auto 2026 | AmCupon.ro",
  description: "Coduri de reducere Automobilus actualizate zilnic. Reduceri la piese auto, accesorii si consumabile. Promotii Automobilus verificate.",
  keywords: ["cod reducere automobilus", "automobilus reduceri", "piese auto reduceri", "automobilus promotii", "automobilus discount"],
  alternates: { canonical: "https://amcupon.ro/automobilus" },
  openGraph: { title: "Reduceri Automobilus Auto 2026 | AmCupon.ro", url: "https://amcupon.ro/automobilus", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function AutomobilusPage() {
  return (
    <BrandPageTemplate config={{
      slug: "automobilus.ro",
      slugAlt: "automobilus",
      name: "Automobilus",
      tagline: "Piese auto, accesorii si consumabile — tot ce are nevoie masina ta",
      emoji: "🚗",
      desc: "Coduri de reducere Automobilus verificate zilnic. Reduceri la piese auto, uleiuri, filtre, accesorii si consumabile auto.",
      editorial: [
        "Automobilus.ro este un magazin online specializat in piese auto, accesorii si consumabile pentru autoturisme, avand un catalog extins de sute de mii de referinte pentru toate marcile si modelele auto comune in Romania. De la filtre si uleiuri pana la piese de schimb si accesorii, Automobilus acopera tot ce are nevoie masina ta.",
        "Pe AmCupon.ro monitorizam ofertele Automobilus si publicam codurile de reducere active. Reducerile apar frecvent la uleiurile de motor si filtre, la accesorii sezoniere (anvelope, lichide antigel) si in campaniile speciale de revizie.",
        "Automobilus se diferentiaza prin compatibilitatea garantata a pieselor cu modelul tau auto si prin suportul tehnic — echipa poate ajuta la identificarea piesei potrivite dupa numarul de inmatriculare sau VIN. Livrarea este rapida, de obicei in 1-2 zile lucratoare.",
      ],
      tips: [
        "Verifica intotdeauna compatibilitatea piesei cu modelul tau exact de masina inainte de comanda.",
        "Cumpara uleiurile de motor in cantitati mari (seturi) — economii de 15-25% fata de cumparatura unitara.",
        "Schimba filtrele (aer, ulei, combustibil, habitaclu) simultan — economisesti manopera si ai piesele la indemana.",
        "Urmareste promotiile de toamna la anvelope de iarna — preturile cresc cand vine sezonul rece.",
        "Pastreaza chitantele si facturile pentru garantia pieselor — necesare in caz de reclamatie.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Automobilus?", a: "La finalizarea comenzii, cauta campul 'Cod voucher' sau 'Cod promotional'. Introdu codul de pe AmCupon.ro si apasa Aplica pentru reducere." },
        { q: "Automobilus garanteaza compatibilitatea pieselor?", a: "Da, Automobilus are sistem de compatibilitate bazat pe marca, model, an fabricatie si motor. Poti introduce datele masinii tale pentru a vedea doar piesele compatibile." },
        { q: "Cat dureaza livrarea de la Automobilus?", a: "Piesele in stoc se livreaza in 1-3 zile lucratoare. Piesele la comanda speciala pot dura 3-7 zile lucratoare in functie de disponibilitate." },
        { q: "Automobilus accepta retururi?", a: "Da, retururile se accepta in 30 de zile daca piesa nu a fost montata si nu are semne de utilizare. Piesele electrice si consumabilele deschise nu pot fi returnate." },
      ],
      canonical: "/automobilus",
    }} />
  );
}
