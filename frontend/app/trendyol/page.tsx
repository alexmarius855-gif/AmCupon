import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Trendyol Romania 2026 — Moda & Lifestyle | AmCupon.ro",
  description: "Coduri reducere Trendyol Romania actualizate zilnic. Fashion, electronice, cosmetice si produse casa la reducere. Promotii Trendyol verificate.",
  keywords: ["cod reducere trendyol", "trendyol romania", "trendyol promotii", "trendyol voucher", "trendyol discount", "trendyol reduceri"],
  alternates: { canonical: "https://amcupon.ro/trendyol" },
  openGraph: {
    title: "Cod Reducere Trendyol Romania 2026 | AmCupon.ro",
    description: "Reduceri Trendyol Romania actualizate zilnic. Fashion, beauty, electronice si lifestyle la preturi speciale.",
    url: "https://amcupon.ro/trendyol",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function TrendyolPage() {
  return (
    <BrandPageTemplate config={{
      slug: "trendyol.com",
      slugAlt: "trendyol",
      name: "Trendyol",
      tagline: "Cel mai mare marketplace din Turcia, acum disponibil in Romania",
      emoji: "🧡",
      desc: "Trendyol este cel mai mare marketplace din Turcia, disponibil acum si in Romania. Fashion, beauty, electronice si produse pentru casa la preturi competitive.",
      editorial: [
        "Trendyol este platforma de e-commerce numarul unu din Turcia, cu peste 30 de milioane de clienti activi. Dupa expansiunea in Europa, Trendyol a castigat rapid popularitate in Romania prin combinatia de preturi competitive, varietate mare de produse si livrare rapida.",
        "Pe Trendyol gasesti mii de branduri locale si internationale in categorii variate: moda pentru femei, barbati si copii, cosmetice si parfumuri, electronice si gadgeturi, produse pentru casa si gradina. Platforma este cunoscuta pentru promotiile frecvente si campaniile de reduceri sezoniere.",
        "AmCupon.ro monitorizeaza toate ofertele si codurile promotionale Trendyol disponibile in Romania. Codurile de reducere Trendyol pot fi aplicate la checkout pentru economii suplimentare fata de preturile deja reduse din campanii.",
      ],
      tips: [
        "Creeaza un cont Trendyol pentru acces la oferte personalizate si notificari pentru produsele din lista de dorinte.",
        "Sectiunea 'Flash Deals' de pe Trendyol ofera reduceri masive limitate — verifica zilnic pentru cele mai bune oferte.",
        "Trendyol organizeaza campanii mari de sezon cu reduceri de 40-70% — urmareste AmCupon.ro pentru codurile exclusive.",
        "Combina codul de reducere cu produsele deja in promotie pentru discount maxim.",
        "Aplicatia Trendyol ofera uneori promotii exclusive si transport gratuit pentru comenzile plasate din app.",
        "Verifica sectiunea de outlet si lichidari pentru cele mai mici preturi la branduri premium.",
      ],
      faq: [
        { q: "Trendyol livreaza in Romania?", a: "Da, Trendyol livreaza in Romania. Timpii de livrare variaza intre 5-14 zile lucratoare in functie de produs si locatie. Urmareste comanda direct din aplicatie sau site." },
        { q: "Cum aplic un cod reducere Trendyol?", a: "La finalul comenzii, in pagina de checkout, gasesti campul pentru cod promotional. Introdu codul de pe AmCupon.ro si apasa 'Aplica' — reducerea se calculeaza automat." },
        { q: "Trendyol accepta retururi?", a: "Da, Trendyol are politica de retur. Perioada si conditiile de retur variaza in functie de categoria produsului. Verifica detaliile de retur din pagina fiecarui produs." },
        { q: "Ce marci gasesc pe Trendyol?", a: "Trendyol ofera atat branduri internationale cunoscute, cat si branduri turcesti de calitate mai putin cunoscute in Romania. Gasesti Nike, Adidas, Puma, dar si branduri locale de moda la preturi mai accesibile." },
        { q: "Plata pe Trendyol este sigura?", a: "Da, Trendyol foloseste sisteme securizate de plata. Accepta carduri Visa/Mastercard si alte metode de plata online. Tranzactiile sunt criptate SSL." },
      ],
      canonical: "/trendyol",
    }} />
  );
}
