import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere iHerb România 2026 — Suplimente & Health",
  description: "Coduri reducere iHerb România actualizate zilnic. Suplimente alimentare, vitamine, produse naturale și beauty la prețuri mici. Promoții iHerb verificate.",
  keywords: ["cod reducere iherb", "iherb românia reduceri", "iherb discount", "suplimente online reduceri", "iherb voucher", "vitamine online iherb"],
  alternates: { canonical: "https://amcupon.ro/iherb" },
  openGraph: {
    title: "Cod Reducere iHerb România 2026 | AmCupon.ro",
    description: "Reduceri iHerb actualizate zilnic. Suplimente, vitamine și produse naturale cu livrare în România.",
    url: "https://amcupon.ro/iherb",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "iherb.com", slugAlt: "iherb", name: "iHerb", canonical: "/iherb" }, META);
}

export default function IherbPage() {
  return (
    <BrandPageTemplate config={{
      slug: "iherb.com",
      slugAlt: "iherb",
      name: "iHerb",
      tagline: "Cel mai mare magazin online de suplimente și produse naturale din lume",
      emoji: "🌿",
      desc: "Coduri reducere iHerb actualizate zilnic. Suplimente alimentare, vitamine, proteine, produse bio și beauty naturala la preturi cu pana la 40% sub magazinele romanesti.",
      editorial: [
        "iHerb este cel mai mare retailer online de suplimente alimentare, vitamine și produse naturale din lume, cu peste 30.000 de produse și livrare în România. Platforma americana oferă branduri de top — NOW Foods, Solgar, Nature's Way, Garden of Life, Optimum Nutrition — la preturi semnificativ mai mici decât în farmaciile și magazinele bio romanesti.",
        "Pe AmCupon.ro publicam toate promoțiile iHerb disponibile în România: reduceri la prima comanda, oferte săptămânale la produse selectate, Flash Sales de 24 ore și cashback pe achizițiile repetate. iHerb are un sistem de recenzii extrem de detaliat — mii de clienți din toată lumea evaluează produsele, ceea ce ajuta la luarea deciziei corecte.",
        "iHerb livrează în România prin mai multi curieri internaționali, cu costuri de transport scăzute sau chiar gratuite la comenzile mai mari. Produsele sunt depozitate în condiții optime, iar datele de expirare sunt întotdeauna verificabile înainte de expediere.",
      ],
      tips: [
        "Creează un cont iHerb pentru a acumula credite iHerb Rewards — 5% din fiecare comanda se transforma în credit pentru următoarea.",
        "Verifica săptămânal secțiunea 'Sale' și 'Best Sellers' — produsele cu stoc limitat au uneori reduceri de 30-50%.",
        "Comanda mai multe produse impreuna pentru a atinge pragul de livrare gratuita și a reduce costul per produs.",
        "Compara prețul iHerb cu farmaciile romanesti — de obicei economisești 30-50% chiar și după taxele de import.",
        "Citește recenziile verificate de pe iHerb înainte de alegerea unui supliment — sunt mult mai detaliate decât pe site-urile locale.",
        "Abonat la newsletter iHerb primești acces la Flash Sale-uri exclusive cu reduceri de 15-25% valabile 48 ore.",
      ],
      faq: [
        { q: "iHerb livrează în România?", a: "Da, iHerb livrează în România prin DHL, FedEx sau posta locala. Timpul de livrare este de 7-14 zile lucrătoare. Comenzile sub 150 EUR nu au taxe vamale suplimentare în România." },
        { q: "Cum aplic un cod de reducere pe iHerb?", a: "La finalizarea comenzii pe iherb.com, cauta câmpul 'Coupon/Promo Code' în secțiunea de plata. Introdu codul de pe AmCupon.ro și apasa Apply — reducerea se aplica automat." },
        { q: "Produsele iHerb sunt autentice?", a: "Da, iHerb lucrează direct cu producătorii și distribuitorii autorizați. Produsele sunt certificate GMP (Good Manufacturing Practice) și trecute prin control de calitate independent. Platforma nu vinde produse contrafăcute." },
        { q: "Plătesc taxe vamale la comenzile iHerb?", a: "Comenzile sub 150 EUR nu au taxe vamale în România conform legislației UE. Comenzile mai mari pot fi reținute la vama cu TVA 19% aplicat. Recomandarea este sa menții comanda sub pragul de 150 EUR." },
        { q: "Pot returna produse de la iHerb?", a: "iHerb accepta retururi în 60 de zile pentru produse nefolosite și în starea originala. Contactează serviciul clienți iHerb pentru a iniția returul. Costul returului internațional poate fi ridicat, asa ca verifica bine produsul înainte de comanda." },
      ],
      canonical: "/iherb",
      categorieSlug: "sanatate",
    }} />
  );
}
