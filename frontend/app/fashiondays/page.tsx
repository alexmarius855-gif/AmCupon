import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Fashion Days — Oferte Fashion 2026 | AmCupon.ro",
  description: "Coduri de reducere Fashion Days actualizate zilnic. Reduceri la haine, incaltaminte, accesorii de brand la preturi mici. Promotii Fashion Days verificate.",
  keywords: ["cod reducere fashion days", "fashiondays reduceri", "fashion days promotii", "fashion days discount", "haine reduceri"],
  alternates: { canonical: "https://amcupon.ro/fashiondays" },
  openGraph: {
    title: "Reduceri Fashion Days 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Fashion Days verificate zilnic. Haine, incaltaminte si accesorii de brand la preturi mici.",
    url: "https://amcupon.ro/fashiondays",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function FashionDaysPage() {
  return (
    <BrandPageTemplate config={{
      slug: "fashiondays.ro",
      slugAlt: "fashiondays",
      name: "Fashion Days",
      tagline: "Moda de brand la preturi mici — haine, incaltaminte, accesorii",
      emoji: "👗",
      desc: "Coduri de reducere si oferte Fashion Days verificate zilnic. Reduceri la haine, incaltaminte si accesorii de brand.",
      editorial: [
        "Fashion Days este cel mai mare magazin online de fashion din Romania, cu mii de branduri internationale si locale disponibile la preturi reduse. Platforma ofera reduceri permanente de 20-70% la haine, incaltaminte, genti si accesorii.",
        "Pe AmCupon.ro publicam toate promotiile si codurile de reducere Fashion Days imediat ce devin disponibile. De la campanii sezoniere la flash sales ce dureaza doar cateva ore, acoperim toate ofertele ca sa nu ratezi niciun deal.",
        "Fashion Days organizeaza periodic campanii mari de reduceri: Sales de vara si de iarna, Black Friday, campanii de Paste si Craciun — momente in care poti gasi haine de brand la jumatate din pret sau chiar mai putin.",
      ],
      tips: [
        "Urmareste sectiunea 'Flash Sale' pe Fashion Days — oferte limitate la 24-48 ore cu reduceri de pana la 80%.",
        "Foloseste filtrul de brand pentru a gasi exact produsele dorite si sorteaza dupa 'cel mai mic pret'.",
        "Creeaza un cont Fashion Days si activeaza wishlist-ul — vei fi notificat cand produsele dorite au reducere.",
        "Verifica tab-ul 'Reduceri suplimentare' la checkout — uneori se cumuleaza cu codul de reducere activ.",
        "Livrarea gratuita se activeaza de la un anumit prag de comanda — adauga mai multe produse din wishlist sa atingi limita.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Fashion Days?", a: "La pasul de finalizare a comenzii, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul copiat de pe AmCupon.ro si apasa 'Aplica' — reducerea se reflecta imediat in totalul comenzii." },
        { q: "Fashion Days livreaza gratuit?", a: "Da, livrarea gratuita se aplica la comenzi peste un anumit prag (verificati pe site valoarea actuala). Retururile sunt gratuite in 30 de zile de la primire." },
        { q: "Sunt produsele de pe Fashion Days originale?", a: "Da, Fashion Days vinde exclusiv produse originale de la branduri autorizate. Platforma are parteneriate directe cu branduri internationale si depozite proprii." },
        { q: "Cand sunt cele mai mari reduceri pe Fashion Days?", a: "Cele mai mari reduceri sunt in perioadele de Sales (ianuarie si iulie), Black Friday (noiembrie) si campanii speciale de brand. Flash sales-urile pot aparea oricand si ofera cele mai agresive discounturi." },
      ],
      canonical: "/fashiondays",
    }} />
  );
}
