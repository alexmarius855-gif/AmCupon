import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Banggood România 2026 — Gadgeturi & Electronice",
  description: "Coduri reducere Banggood România actualizate zilnic. Gadgeturi, electronice, unelte și jucării RC la prețuri mici directe de la producători. Promoții Banggood verificate.",
  keywords: ["cod reducere banggood", "banggood românia reduceri", "banggood discount", "banggood voucher", "gadgeturi ieftine banggood", "banggood promoții"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/banggood.com" },
  openGraph: {
    title: "Cod Reducere Banggood România 2026 | AmCupon.ro",
    description: "Reduceri Banggood actualizate zilnic. Gadgeturi, drone, electronice și unelte cu livrare în România.",
    url: "https://amcupon.ro/banggood",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "banggood.com", slugAlt: "banggood", name: "Banggood", canonical: "/banggood" }, META);
}

export default function BanggoodPage() {
  return (
    <BrandPageTemplate config={{
      slug: "banggood.com",
      slugAlt: "banggood",
      name: "Banggood",
      tagline: "Gadgeturi, electronice și unelte directe de la producători — preturi imbatabile",
      emoji: "🔧",
      desc: "Coduri reducere Banggood actualizate zilnic. Drone, gadgeturi tech, unelte, jucării RC și electronice la preturi de producător cu livrare în România.",
      editorial: [
        "Banggood este unul dintre cele mai mari marketplace-uri chineze specializate în gadgeturi, electronice, unelte și hobby tech. Platforma oferă acces direct la produse de la producători — drone DJI-like, imprimante 3D, unelte electrice, gadgeturi smart home, echipamente foto și mii de alte produse tehnologice la preturi mult sub retailerii tradiționali.",
        "Pe AmCupon.ro publicam toate codurile de reducere Banggood și promoțiile active pentru România. Banggood are Flash Deals zilnice cu reduceri de 30-70%, campanii săptămânale pe categorii și un sistem de cupoane stivuibile — poți combina discount-ul de cont cu codul promoțional pentru economii maxime.",
        "Banggood are depozite în Europa (Cehia, Spania, Polonia), ceea ce permite livrări rapide de 5-10 zile lucrătoare fără taxe vamale pentru produsele expediate din UE. Platforma are și secțiune de produse cu 'Priority Line Shipping' — garantează livrarea în termen sau banii înapoi.",
      ],
      tips: [
        "Filtrează produsele după 'Ship from EU' pentru livrare rapida (5-10 zile) fără taxe vamale.",
        "Secțiunea 'Flash Deals' se reînnoiește zilnic la miezul nopții — verifica dimineata pentru cele mai bune oferte.",
        "Descarca aplicația Banggood pentru preturi exclusive de app și notificări la reduceri.",
        "Banggood Coupon Plus permite stivuirea mai multor cupoane — citește termenii înainte de aplicare.",
        "Verifica recenziile cu fotografii de la cumpărători reali — utile mai ales pentru produse electronice.",
        "Creează-ți cont Banggood și activează punctele de fidelitate — se transforma în reduceri la comenzile viitoare.",
      ],
      faq: [
        { q: "Banggood livrează în România?", a: "Da, Banggood livrează în România. Timpul de livrare variază intre 7-30 zile în funcție de metoda aleasa și locația depozitului (China sau Europa). Produsele 'Ship from EU' ajung în 5-10 zile lucrătoare." },
        { q: "Cum aplic un cod de reducere pe Banggood?", a: "La checkout, cauta câmpul 'Coupon Code' sau 'Promo Code'. Introdu codul de pe AmCupon.ro și apasa Apply. Unele coduri sunt valabile doar pentru anumite categorii sau valori minime de comanda." },
        { q: "Plătesc taxe vamale la comenzile Banggood din China?", a: "Comenzile sub 150 EUR expediate din China pot fi reținute la vamă pentru plata TVA. Comenzile expediate din depozitele europene Banggood (EU Warehouse) nu au taxe vamale suplimentare." },
        { q: "Produsele Banggood sunt de calitate?", a: "Calitatea variază mult în funcție de produs și brand. Brandurile consacrate (Xiaomi, Creality, Flysky) au calitate buna. Verifica rating-ul produsului, numărul de recenzii și fotografiile de la cumpărători. Banggood oferă protecția cumpărătorului pentru produse defecte." },
        { q: "Pot returna produse de la Banggood?", a: "Banggood oferă garanție de 3-12 luni și retur în 30 de zile pentru produse defecte. Produsele trebuie returnate în starea originala. Pentru produse defecte, Banggood oferă de obicei înlocuire sau rambursare fără retur fizic (în funcție de valoare)." },
      ],
      canonical: "/banggood",
      categorieSlug: "electronice",
    }} />
  );
}
