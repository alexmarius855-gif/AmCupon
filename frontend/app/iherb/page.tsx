import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere iHerb Romania 2026 — Suplimente & Health | AmCupon.ro",
  description: "Coduri reducere iHerb Romania actualizate zilnic. Suplimente alimentare, vitamine, produse naturale si beauty la preturi mici. Promotii iHerb verificate.",
  keywords: ["cod reducere iherb", "iherb romania reduceri", "iherb discount", "suplimente online reduceri", "iherb voucher", "vitamine online iherb"],
  alternates: { canonical: "https://amcupon.ro/iherb" },
  openGraph: {
    title: "Cod Reducere iHerb Romania 2026 | AmCupon.ro",
    description: "Reduceri iHerb actualizate zilnic. Suplimente, vitamine si produse naturale cu livrare in Romania.",
    url: "https://amcupon.ro/iherb",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function IherbPage() {
  return (
    <BrandPageTemplate config={{
      slug: "iherb.com",
      slugAlt: "iherb",
      name: "iHerb",
      tagline: "Cel mai mare magazin online de suplimente si produse naturale din lume",
      emoji: "🌿",
      desc: "Coduri reducere iHerb verificate zilnic. Suplimente alimentare, vitamine, proteine, produse bio si beauty naturala la preturi cu pana la 40% sub magazinele romanesti.",
      editorial: [
        "iHerb este cel mai mare retailer online de suplimente alimentare, vitamine si produse naturale din lume, cu peste 30.000 de produse si livrare in Romania. Platforma americana ofera branduri de top — NOW Foods, Solgar, Nature's Way, Garden of Life, Optimum Nutrition — la preturi semnificativ mai mici decat in farmaciile si magazinele bio romanesti.",
        "Pe AmCupon.ro publicam toate promotiile iHerb disponibile in Romania: reduceri la prima comanda, oferte saptamanale la produse selectate, Flash Sales de 24 ore si cashback pe achizitiile repetate. iHerb are un sistem de recenzii extrem de detaliat — mii de clienti din toata lumea evalueaza produsele, ceea ce ajuta la luarea deciziei corecte.",
        "iHerb livreaza in Romania prin mai multi curieri internationali, cu costuri de transport scazute sau chiar gratuite la comenzile mai mari. Produsele sunt depozitate in conditii optime, iar datele de expirare sunt intotdeauna verificabile inainte de expediere.",
      ],
      tips: [
        "Creeaza un cont iHerb pentru a acumula credite iHerb Rewards — 5% din fiecare comanda se transforma in credit pentru urmatoarea.",
        "Verifica saptamanal sectiunea 'Sale' si 'Best Sellers' — produsele cu stoc limitat au uneori reduceri de 30-50%.",
        "Comanda mai multe produse impreuna pentru a atinge pragul de livrare gratuita si a reduce costul per produs.",
        "Compara pretul iHerb cu farmaciile romanesti — de obicei economisesti 30-50% chiar si dupa taxele de import.",
        "Citeste recenziile verificate de pe iHerb inainte de alegerea unui supliment — sunt mult mai detaliate decat pe site-urile locale.",
        "Abonat la newsletter iHerb primesti acces la Flash Sale-uri exclusive cu reduceri de 15-25% valabile 48 ore.",
      ],
      faq: [
        { q: "iHerb livreaza in Romania?", a: "Da, iHerb livreaza in Romania prin DHL, FedEx sau posta locala. Timpul de livrare este de 7-14 zile lucratoare. Comenzile sub 150 EUR nu au taxe vamale suplimentare in Romania." },
        { q: "Cum aplic un cod de reducere pe iHerb?", a: "La finalizarea comenzii pe iherb.com, cauta campul 'Coupon/Promo Code' in sectiunea de plata. Introdu codul de pe AmCupon.ro si apasa Apply — reducerea se aplica automat." },
        { q: "Produsele iHerb sunt autentice?", a: "Da, iHerb lucreaza direct cu producatorii si distribuitorii autorizati. Produsele sunt certificate GMP (Good Manufacturing Practice) si trecute prin control de calitate independent. Platforma nu vinde produse contrafacute." },
        { q: "Platesc taxe vamale la comenzile iHerb?", a: "Comenzile sub 150 EUR nu au taxe vamale in Romania conform legislatiei UE. Comenzile mai mari pot fi retinute la vama cu TVA 19% aplicat. Recomandarea este sa mentii comanda sub pragul de 150 EUR." },
        { q: "Pot returna produse de la iHerb?", a: "iHerb accepta retururi in 60 de zile pentru produse nefolosite si in starea originala. Contacteaza serviciul clienti iHerb pentru a initia returul. Costul returului international poate fi ridicat, asa ca verifica bine produsul inainte de comanda." },
      ],
      canonical: "/iherb",
    }} />
  );
}
