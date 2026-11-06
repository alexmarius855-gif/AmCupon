import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Reduceri Altex — Coduri și Oferte Altex 2026 | AmCupon.ro",
  description: "Toate ofertele și codurile de reducere Altex actualizate zilnic. Electronice, electrocasnice, IT la cel mai mic preț. Verifică promoțiile active acum.",
  keywords: ["reducere altex", "cod reducere altex", "oferte altex", "altex promoții", "altex discount"],
  alternates: { canonical: "https://amcupon.ro/altex" },
  openGraph: {
    title: "Reduceri Altex 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Altex verificate zilnic. Electronice, electrocasnice, IT la prețuri mici.",
    url: "https://amcupon.ro/altex",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "altex.ro", slugAlt: "altex", name: "Altex", canonical: "/altex" }, META);
}

export default function AltexPage() {
  return (
    <BrandPageTemplate config={{
      slug: "altex.ro",
      slugAlt: "altex",
      name: "Altex",
      tagline: "Cel mai mare retailer de electronice și electrocasnice din România",
      emoji: "🖥️",
      desc: "Reduceri și coduri de reducere Altex actualizate zilnic. Electronice, electrocasnice, IT.",
      editorial: [
        "Altex este unul dintre cei mai mari retaileri de electronice și electrocasnice din România, cu peste 100 de magazine fizice în toată țara și un magazin online complet. Lansat în 1993, Altex a crescut de la un mic magazin la un imperiu al electronicelor cu mii de produse.",
        "Pe AmCupon.ro publicăm promoțiile Altex pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Găsești oferte la televizoare, laptopuri, telefoane, frigidere, mașini de spălat și sute de alte produse. Reducerile Altex pot ajunge până la 50% în perioadele promoționale.",
        "Altex are promoții regulate: Black Friday (cel mai mare eveniment de shopping din România), promoții de vară, promoții de iarnă și campanii lunare cu reduceri la categorii specifice. Cele mai bune dealuri sunt de obicei disponibile online, exclusive pentru cumpărătorii de pe altex.ro.",
      ],
      tips: [
        "Urmărește pagina de 'Oferte Zilei' de pe altex.ro — apar produse cu discount mare dar stoc limitat.",
        "Compară prețul cu eMAG înainte de cumpărătură — uneori prețurile diferă semnificativ.",
        "Înscrie-te în programul Altex Advantage pentru reduceri suplimentare și livrare gratuită.",
        "Cumpără în rate fără dobândă cu cardurile partenere — disponibil pentru multe produse.",
        "Folosește codurile de reducere de pe AmCupon.ro la checkout pentru economii suplimentare de 5-15%.",
      ],
      faq: [
        { q: "Cum folosesc un cod de reducere la Altex?", a: "Adaugă produsele în coș pe altex.ro, mergi la checkout și caută câmpul 'Cod reducere' sau 'Voucher'. Lipește codul și aplică — reducerea se calculează automat din total." },
        { q: "Altex are livrare gratuită?", a: "Da, Altex oferă livrare gratuită pentru comenzile peste o anumită valoare (verificați pragul curent pe site). Livrarea în magazine este întotdeauna gratuită." },
        { q: "Pot returna un produs cumpărat de la Altex?", a: "Da, Altex acceptă retururi în 30 de zile de la cumpărare pentru produsele cumpărate online. Produsele trebuie să fie în starea originală, cu ambalajul intact." },
        { q: "Când sunt cele mai bune promoții Altex?", a: "Black Friday (noiembrie) are cele mai mari reduceri — până la 70% la electronice. Altex mai are campanii importante de Paște, vară și iarnă. Urmărește pagina noastră pentru toate promoțiile active." },
      ],
      canonical: "/altex",
      categorieSlug: "electronice",
    }} />
  );
}
