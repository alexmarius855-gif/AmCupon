import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere ASOS România 2026 — Fashion Online | AmCupon.ro",
  description: "Coduri reducere ASOS România actualizate zilnic. Haine, încălțăminte și accesorii de la peste 850 branduri internaționale. Promoții ASOS verificate.",
  keywords: ["cod reducere asos", "asos românia reduceri", "asos discount", "asos voucher", "asos promoții", "haine online reduceri asos"],
  alternates: { canonical: "https://amcupon.ro/asos" },
  openGraph: {
    title: "Cod Reducere ASOS România 2026 | AmCupon.ro",
    description: "Reduceri ASOS actualizate zilnic. Peste 850 branduri de fashion cu livrare în România.",
    url: "https://amcupon.ro/asos",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "asos.com", slugAlt: "asos", name: "ASOS", canonical: "/asos" }, META);
}

export default function AsosPage() {
  return (
    <BrandPageTemplate config={{
      slug: "asos.com",
      slugAlt: "asos",
      name: "ASOS",
      tagline: "Peste 850 branduri de fashion internațional cu livrare rapidă în România",
      emoji: "👔",
      desc: "Coduri reducere ASOS actualizate zilnic. Fashion pentru tineri — haine, încălțăminte, accesorii de la Nike, Adidas, Calvin Klein, Tommy Hilfiger și sute de alte branduri.",
      editorial: [
        "ASOS este unul dintre cele mai mari magazine de fashion online din lume, cu peste 850 de branduri și mii de produse proprii ASOS Design. Platforma britanica livrează în România și oferă acces la tendințele internaționale la preturi competitive — de la streetwear și casual wear, la ținute de ocazie și sportswear.",
        "Pe AmCupon.ro publicam zilnic codurile de reducere ASOS și promoțiile active. ASOS are campanii regulate cu reduceri de 10-30% valabile uneori doar 24-48 ore, plus o secțiune SALE permanenta unde găsești articole cu pana la 70% reducere din colecțiile anterioare.",
        "ASOS Premiere este programul premium al platformei, cu livrare nelimitata gratuita și retur extins. Platforma se remarca prin politica generoasa de retur (28 zile), tabelele de mărimi detaliate și recenziile cu fotografii de la cumpărători reali — utile pentru a alege corect mărimea la cumpărăturile online.",
      ],
      tips: [
        "Activează ASOS Premier pentru livrare și retur gratuit nelimitat — rentabil dacă comanzi frecvent.",
        "Secțiunea ASOS Sale are reduceri permanente de 20-70% — filtrează după mărime pentru a vedea doar ce este disponibil.",
        "Descarca aplicația ASOS pentru oferte exclusive de app-only și notificări Flash Sale.",
        "ASOS organizează campanii de reduceri mari de 4-5 ori pe an — Black Friday, Crăciun, Paste și vara. Urmărește AmCupon.ro pentru codurile exclusive.",
        "Verifica tabelul de mărimi ASOS înainte de comanda — mărimile variază intre branduri și ASOS Design.",
        "Combina codul de reducere cu produsele deja în SALE pentru discount stivuit.",
      ],
      faq: [
        { q: "ASOS livrează gratuit în România?", a: "Da, ASOS oferă livrare gratuita la comenzi peste un prag minim (verifica pe site valoarea curenta, de obicei 200-250 lei). ASOS Premier oferă livrare gratuita nelimitata indiferent de valoarea comenzii." },
        { q: "Cum aplic un cod de reducere pe ASOS?", a: "La finalizarea comenzii, în pagina de checkout, cauta câmpul 'Ai un cod promoțional?' și introdu codul copiat de pe AmCupon.ro. Reducerea se aplica automat la produsele eligibile." },
        { q: "Care este politica de retur ASOS?", a: "ASOS accepta retururi în 28 de zile de la livrare. Produsele trebuie sa fie în starea originala, cu etichetele intacte și nefolosite. Returul se înregistrează online și se trimite prin curier." },
        { q: "Cat durează livrarea ASOS în România?", a: "Livrarea standard ASOS în România durează 3-7 zile lucrătoare. Exista și opțiunea Express Delivery (1-3 zile) contra cost. Urmărește coletul cu codul de tracking primit pe email." },
        { q: "ASOS vinde produse originale?", a: "Da, ASOS vinde exclusiv produse originale, fie de la branduri partenere oficiale, fie din propria linie ASOS Design. Nu vinde produse contrafăcute sau imitate." },
      ],
      canonical: "/asos",
      categorieSlug: "fashion",
    }} />
  );
}
