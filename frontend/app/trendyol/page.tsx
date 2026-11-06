import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Trendyol România 2026 — Modă & Lifestyle",
  description: "Coduri reducere Trendyol România actualizate zilnic. Fashion, electronice, cosmetice și produse pentru casă la reducere. Promoții Trendyol verificate.",
  keywords: ["cod reducere trendyol", "trendyol românia", "trendyol promoții", "trendyol voucher", "trendyol discount", "trendyol reduceri"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/trendyol.com" },
  openGraph: {
    title: "Cod Reducere Trendyol România 2026 | AmCupon.ro",
    description: "Reduceri Trendyol România actualizate zilnic. Fashion, beauty, electronice și lifestyle la prețuri speciale.",
    url: "https://amcupon.ro/trendyol",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "trendyol.com", slugAlt: "trendyol", name: "Trendyol", canonical: "/trendyol" }, META);
}

export default function TrendyolPage() {
  return (
    <BrandPageTemplate config={{
      slug: "trendyol.com",
      slugAlt: "trendyol",
      name: "Trendyol",
      tagline: "Cel mai mare marketplace din Turcia, acum disponibil în România",
      emoji: "🧡",
      desc: "Trendyol este cel mai mare marketplace din Turcia, disponibil acum și în România. Fashion, beauty, electronice și produse pentru casa la preturi competitive.",
      editorial: [
        "Trendyol este platforma de e-commerce numărul unu din Turcia, cu peste 30 de milioane de clienți activi. După expansiunea în Europa, Trendyol a câștigat rapid popularitate în România prin combinația de preturi competitive, varietate mare de produse și livrare rapida.",
        "Pe Trendyol găsești mii de branduri locale și internaționale în categorii variate: moda pentru femei, barbati și copii, cosmetice și parfumuri, electronice și gadgeturi, produse pentru casa și gradina. Platforma este cunoscuta pentru promoțiile frecvente și campaniile de reduceri sezoniere.",
        "AmCupon.ro monitorizează toate ofertele și codurile promoționale Trendyol disponibile în România. Codurile de reducere Trendyol pot fi aplicate la checkout pentru economii suplimentare fata de preturile deja reduse din campanii.",
      ],
      tips: [
        "Creează un cont Trendyol pentru acces la oferte personalizate și notificări pentru produsele din lista de dorințe.",
        "Secțiunea 'Flash Deals' de pe Trendyol oferă reduceri masive limitate — verifica zilnic pentru cele mai bune oferte.",
        "Trendyol organizează campanii mari de sezon cu reduceri de 40-70% — urmărește AmCupon.ro pentru codurile exclusive.",
        "Combina codul de reducere cu produsele deja în promoție pentru discount maxim.",
        "Aplicația Trendyol oferă uneori promoții exclusive și transport gratuit pentru comenzile plasate din app.",
        "Verifica secțiunea de outlet și lichidări pentru cele mai mici preturi la branduri premium.",
      ],
      faq: [
        { q: "Trendyol livrează în România?", a: "Da, Trendyol livrează în România. Timpii de livrare variază intre 5-14 zile lucrătoare în funcție de produs și locație. Urmărește comanda direct din aplicație sau site." },
        { q: "Cum aplic un cod reducere Trendyol?", a: "La finalul comenzii, în pagina de checkout, găsești câmpul pentru cod promoțional. Introdu codul de pe AmCupon.ro și apasa 'Aplica' — reducerea se calculează automat." },
        { q: "Trendyol accepta retururi?", a: "Da, Trendyol are politica de retur. Perioada și condițiile de retur variază în funcție de categoria produsului. Verifica detaliile de retur din pagina fiecărui produs." },
        { q: "Ce mărci găsesc pe Trendyol?", a: "Trendyol oferă atat branduri internaționale cunoscute, cat și branduri turcești de calitate mai puțin cunoscute în România. Găsești Nike, Adidas, Puma, dar și branduri locale de moda la preturi mai accesibile." },
        { q: "Plata pe Trendyol este sigura?", a: "Da, Trendyol folosește sisteme securizate de plata. Accepta carduri Visa/Mastercard și alte metode de plata online. Tranzacțiile sunt criptate SSL." },
      ],
      canonical: "/trendyol",
      categorieSlug: "fashion",
    }} />
  );
}
