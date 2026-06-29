import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere ASOS Romania 2026 — Fashion Online | AmCupon.ro",
  description: "Coduri reducere ASOS Romania actualizate zilnic. Haine, incaltaminte si accesorii de la peste 850 branduri internationale. Promotii ASOS verificate.",
  keywords: ["cod reducere asos", "asos romania reduceri", "asos discount", "asos voucher", "asos promotii", "haine online reduceri asos"],
  alternates: { canonical: "https://amcupon.ro/asos" },
  openGraph: {
    title: "Cod Reducere ASOS Romania 2026 | AmCupon.ro",
    description: "Reduceri ASOS actualizate zilnic. Peste 850 branduri de fashion cu livrare in Romania.",
    url: "https://amcupon.ro/asos",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function AsosPage() {
  return (
    <BrandPageTemplate config={{
      slug: "asos.com",
      slugAlt: "asos",
      name: "ASOS",
      tagline: "Peste 850 branduri de fashion international cu livrare rapida in Romania",
      emoji: "👔",
      desc: "Coduri reducere ASOS verificate zilnic. Fashion pentru tineri — haine, incaltaminte, accesorii de la Nike, Adidas, Calvin Klein, Tommy Hilfiger si sute de alte branduri.",
      editorial: [
        "ASOS este unul dintre cele mai mari magazine de fashion online din lume, cu peste 850 de branduri si mii de produse proprii ASOS Design. Platforma britanica livreaza in Romania si ofera acces la tendintele internationale la preturi competitive — de la streetwear si casual wear, la tinute de ocazie si sportswear.",
        "Pe AmCupon.ro publicam zilnic codurile de reducere ASOS si promotiile active. ASOS are campanii regulate cu reduceri de 10-30% valabile uneori doar 24-48 ore, plus o sectiune SALE permanenta unde gasesti articole cu pana la 70% reducere din colectiile anterioare.",
        "ASOS Premiere este programul premium al platformei, cu livrare nelimitata gratuita si retur extins. Platforma se remarca prin politica generoasa de retur (28 zile), tabelele de marimi detaliate si recenziile cu fotografii de la cumparatori reali — utile pentru a alege corect marimea la cumparaturile online.",
      ],
      tips: [
        "Activeaza ASOS Premier pentru livrare si retur gratuit nelimitat — rentabil daca comanzi frecvent.",
        "Sectiunea ASOS Sale are reduceri permanente de 20-70% — filtreaza dupa marime pentru a vedea doar ce este disponibil.",
        "Descarca aplicatia ASOS pentru oferte exclusive de app-only si notificari Flash Sale.",
        "ASOS organizeaza campanii de reduceri mari de 4-5 ori pe an — Black Friday, Craciun, Paste si vara. Urmareste AmCupon.ro pentru codurile exclusive.",
        "Verifica tabelul de marimi ASOS inainte de comanda — marimile variaza intre branduri si ASOS Design.",
        "Combina codul de reducere cu produsele deja in SALE pentru discount stivuit.",
      ],
      faq: [
        { q: "ASOS livreaza gratuit in Romania?", a: "Da, ASOS ofera livrare gratuita la comenzi peste un prag minim (verifica pe site valoarea curenta, de obicei 200-250 lei). ASOS Premier ofera livrare gratuita nelimitata indiferent de valoarea comenzii." },
        { q: "Cum aplic un cod de reducere pe ASOS?", a: "La finalizarea comenzii, in pagina de checkout, cauta campul 'Ai un cod promotional?' si introdu codul copiat de pe AmCupon.ro. Reducerea se aplica automat la produsele eligibile." },
        { q: "Care este politica de retur ASOS?", a: "ASOS accepta retururi in 28 de zile de la livrare. Produsele trebuie sa fie in starea originala, cu etichetele intacte si nefolosite. Returul se inregistreaza online si se trimite prin curier." },
        { q: "Cat dureaza livrarea ASOS in Romania?", a: "Livrarea standard ASOS in Romania dureaza 3-7 zile lucratoare. Exista si optiunea Express Delivery (1-3 zile) contra cost. Urmareste coletul cu codul de tracking primit pe email." },
        { q: "ASOS vinde produse originale?", a: "Da, ASOS vinde exclusiv produse originale, fie de la branduri partenere oficiale, fie din propria linie ASOS Design. Nu vinde produse contrafacute sau imitate." },
      ],
      canonical: "/asos",
    }} />
  );
}
