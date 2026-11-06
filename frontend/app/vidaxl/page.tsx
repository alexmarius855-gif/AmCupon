import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere vidaXL — Oferte Mobilier 2026 | AmCupon.ro",
  description: "Coduri de reducere vidaXL actualizate zilnic. Reduceri la mobilier, grădină, sport, auto și electronice. Promoții vidaXL verificate.",
  keywords: ["cod reducere vidaxl", "vidaxl reduceri", "vidaxl promoții", "mobilier ieftin online", "vidaxl discount"],
  // vidaxl.ro nu mai e in date (16.09.2026) — canonical catre propria pagina, nu catre un 404.
  alternates: { canonical: "https://amcupon.ro/vidaxl" },
  openGraph: {
    title: "Reduceri vidaXL 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte vidaXL verificate zilnic. Mobilier, grădină și articole pentru casă la prețuri reduse.",
    url: "https://amcupon.ro/vidaxl",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "vidaxl.ro", slugAlt: "vidaxl", name: "vidaXL", canonical: "/vidaxl" }, META);
}

export default function VidaxlPage() {
  return (
    <BrandPageTemplate config={{
      slug: "vidaxl.ro",
      slugAlt: "vidaxl",
      name: "vidaXL",
      tagline: "Mobilier, grădină și articole pentru casă la prețuri mici",
      emoji: "🛋️",
      desc: "Coduri de reducere vidaXL actualizate zilnic. Reduceri la mobilier, grădină, articole sport și auto la prețuri accesibile.",
      editorial: [
        "vidaXL este un retailer online olandez cu prezență globală, specializat în mobilă, articole de grădină, sport și bricolaj la prețuri accesibile. Magazinul românesc vidaXL.ro oferă mii de produse din aceste categorii cu livrare rapidă și retururi simple.",
        "Pe AmCupon.ro monitorizăm ofertele vidaXL și publicăm codurile de reducere active. Platforma are frecvent promoții la mobilier de grădină în primăvară-vară, mobilier interior în perioadele de renovare și articole sport în sezon.",
        "vidaXL este recunoscut pentru raportul bun calitate-preț, mai ales la articole de grădină (mobilier outdoor, grilaje, copertine) și mobilier funcțional simplu. Prețurile mai mici sunt posibile datorită modelului direct-to-consumer fără intermediari.",
      ],
      tips: [
        "Comandă mobilierul în avans — livrarea produselor voluminoase poate dura 5-10 zile.",
        "Verifică dimensiunile exact înainte de comandă — returnarea mobilierului voluminos implică costuri.",
        "Secțiunea 'Oferte' vidaXL se schimbă des — merită verificată înainte să cumperi.",
        "Cumpără mobila de grădină la sfârșitul sezonului (septembrie-octombrie) — reduceri de lichidare de stoc.",
        "Folosește codul de reducere vidaXL de pe AmCupon.ro la checkout pentru economii suplimentare.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe vidaXL?", a: "La finalizarea comenzii, caută câmpul 'Cod voucher' sau 'Cod promoțional'. Introdu codul de pe AmCupon.ro și apasă Aplică — reducerea se scade din totalul comenzii." },
        { q: "vidaXL livrează gratuit în România?", a: "Politica de livrare variază — unele produse au livrare gratuită, altele au taxă de transport. Produsele voluminoase (mobilier mare) pot avea costuri de livrare mai mari." },
        { q: "Pot returna mobilierul de la vidaXL?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; termenul exact, costul returului și condițiile pentru produsele montate sunt pe site-ul vidaXL." },
        { q: "Cât de bună este calitatea produselor vidaXL?", a: "vidaXL oferă calitate bună raportat la preț. Produsele din categoriile grădină și sport au recenzii în general bune. Mobilierul interior e funcțional și accesibil, nu premium." },
      ],
      canonical: "/vidaxl",
      categorieSlug: "casa-gradina",
    }} />
  );
}
