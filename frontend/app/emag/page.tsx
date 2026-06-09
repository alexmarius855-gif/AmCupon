import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Reduceri eMAG — Coduri si Oferte eMAG 2026 | AmCupon.ro",
  description: "Toate ofertele si codurile de reducere eMAG actualizate zilnic. Electronice, moda, casa, carti la cel mai mic pret. Promotii eMAG verificate acum.",
  keywords: ["reducere emag", "cod reducere emag", "oferte emag", "emag promotii", "emag discount"],
  alternates: { canonical: "https://amcupon.ro/emag" },
  openGraph: {
    title: "Reduceri eMAG 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte eMAG verificate zilnic. Cel mai mare magazin online din Romania.",
    url: "https://amcupon.ro/emag",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function EmagPage() {
  return (
    <BrandPageTemplate config={{
      slug: "emag.ro",
      slugAlt: "emag",
      name: "eMAG",
      tagline: "Cel mai mare magazin online din Romania — milioane de produse",
      emoji: "🛒",
      desc: "Reduceri si coduri de reducere eMAG verificate zilnic. Electronice, moda, casa, carti.",
      editorial: [
        "eMAG este liderul necontestat al comertului online din Romania, cu milioane de produse disponibile si mii de vanzatori marketplace. Fondat in 2001, eMAG a crescut sa devina cel mai mare retailer online din Europa de Est.",
        "Pe AmCupon.ro monitorizam in permanenta promotiile eMAG si le publicam actualizate. De la electronice si IT la fashion, carti, casa si gradina, eMAG are reduceri in toate categoriile. Evenimentele promotionale majore — Ziua eMAG, Black Friday, campanii de aniversare — aduc reduceri de 20-60%.",
        "eMAG Genius este programul de abonament care ofera livrare gratuita, retururi extinse si acces anticipat la promotii. Combinat cu codurile de reducere de pe AmCupon.ro, poti economisi semnificativ la fiecare comanda.",
      ],
      tips: [
        "Activeaza alerta de pret pe eMAG — iti trimite notificare cand produsul dorit scade la pretul tinta.",
        "Verifica sectiunea 'Stoc limitat' pentru dealuri flash care dureaza cateva ore.",
        "eMAG Genius merita daca faci minimum 2-3 comenzi pe luna — livrarea gratuita se amortizeaza rapid.",
        "Compara pretul Fulfilled by eMAG vs Marketplace — uneori vanzatorii third-party au preturi mai mici.",
        "Foloseste codurile de reducere eMAG de pe AmCupon.ro la checkout pentru economii instantanee.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe eMAG?", a: "Adauga produsele in cos, mergi la finalizarea comenzii si cauta sectiunea 'Cod promotional' sau 'Voucher'. Introdu codul si apasa 'Aplica' — reducerea se adauga automat la total." },
        { q: "eMAG are livrare in aceeasi zi?", a: "Da, prin serviciul eMAG Express livrarea se face in aceeasi zi sau a doua zi in orasele mari. Disponibil pentru produsele din stocul propriu eMAG." },
        { q: "Cat dureaza returul la eMAG?", a: "eMAG accepta retururi in 30 de zile (sau 60 de zile pentru membrii Genius). Banii se returneaza in 14 zile lucratoare." },
        { q: "Cand are eMAG cele mai mari reduceri?", a: "Ziua eMAG (octombrie) si Black Friday (noiembrie) sunt evenimentele cu cele mai mari discounturi — pana la 70%. De asemenea, Summer Sales (iulie) si campanii de Paste aduc reduceri importante." },
      ],
      canonical: "/emag",
    }} />
  );
}
