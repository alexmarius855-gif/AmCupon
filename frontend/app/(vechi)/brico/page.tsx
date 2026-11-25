import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Brico — Oferte Bricolaj 2026 | AmCupon.ro",
  description: "Coduri de reducere Brico Depot actualizate zilnic. Reduceri la materiale construcții, unelte, grădină și decorațiuni. Promoții Brico verificate.",
  keywords: ["cod reducere brico", "brico reduceri", "brico depot promoții", "bricolaj reduceri", "materiale construcții reducere"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/brico.ro" },
  openGraph: {
    title: "Reduceri Brico 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Brico Depot verificate zilnic. Materiale construcții, unelte și grădină la prețuri reduse.",
    url: "https://amcupon.ro/brico",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "brico.ro", slugAlt: "brico", name: "Brico", canonical: "/brico" }, META);
}

export default function BricoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "brico.ro",
      slugAlt: "brico",
      name: "Brico",
      tagline: "Materiale de construcții, unelte și grădină la prețuri avantajoase",
      emoji: "🔨",
      desc: "Coduri de reducere Brico actualizate zilnic. Reduceri la materiale construcții, unelte, grădină și amenajări interioare.",
      editorial: [
        "Brico Depot este unul dintre cei mai mari retaileri de materiale de construcții și bricolaj din România. Oferă o gamă completă de produse pentru construcție, renovare, grădinărit și amenajări interioare — de la vopsele și parchet la unelte profesionale și mobilier de grădină.",
        "Pe AmCupon.ro publicăm promoțiile Brico Depot pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile se găsesc frecvent la materiale de sezon, unelte și produse de grădină în perioadele de primăvară și vară.",
        "Brico organizează regulat campanii tematice — 'Weekend-ul Bricolajului', promoții de primăvară pentru grădină și campanii de toamnă pentru renovări interioare — cu reduceri la categorii întregi.",
      ],
      tips: [
        "La materialele de construcții cumpărate în cantitate mare, întreabă de prețul pe palet sau pe cantitate.",
        "Comandă online și ridică din magazin (click & collect) pentru a evita costurile de livrare la produse grele.",
        "Clubul Brico oferă puncte de fidelitate și acces la promoții exclusive pentru membrii înregistrați.",
        "Compară prețul uneltelor Brico cu magazinele specializate — adesea găsești același brand mai ieftin.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Brico?", a: "La finalul comenzii online, cauta secțiunea 'Cod promoțional' sau 'Voucher'. Introdu codul și reducerea se aplica automat la totalul comenzii." },
        { q: "Brico livrează la domiciliu?", a: "Da, Brico Depot oferă livrare la domiciliu pentru comenzile online, inclusiv produse voluminoase și grele. Costul de livrare variază în funcție de dimensiunile comenzii." },
        { q: "Pot returna produse cumpărate de la Brico?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Termenul exact și unde poți returna (magazin sau curier) sunt pe site-ul Brico Depot; păstrează bonul fiscal." },
        { q: "Brico are și servicii de montaj?", a: "Da, Brico Depot oferă servicii de montaj pentru anumite produse (parchet, gresie, faianță) prin rețele de instalatori parteneri. Detalii disponibile la magazin." },
      ],
      canonical: "/brico",
    }} />
  );
}
