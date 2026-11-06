import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere SHEIN România 2026 — Fashion la Prețuri Mici",
  description: "Coduri reducere SHEIN actualizate zilnic. Haine, accesorii și încălțăminte la reducere de până la 80%. Promoții SHEIN verificate pe AmCupon.ro.",
  keywords: ["cod reducere shein", "shein românia reduceri", "shein promoții", "shein voucher", "shein discount românia", "haine ieftine online"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/shein.com" },
  openGraph: {
    title: "Cod Reducere SHEIN România 2026 | AmCupon.ro",
    description: "Reduceri SHEIN actualizate zilnic. Haine, încălțăminte și accesorii de modă la prețuri incredibile.",
    url: "https://amcupon.ro/shein",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "shein.com", slugAlt: "shein", name: "SHEIN", canonical: "/shein" }, META);
}

export default function SheinPage() {
  return (
    <BrandPageTemplate config={{
      slug: "shein.com",
      slugAlt: "shein",
      name: "SHEIN",
      tagline: "Fashion global la preturi mici — mii de noutăți zilnic",
      emoji: "👗",
      desc: "SHEIN este una dintre cele mai mari platforme de moda online din lume, cu mii de produse noi adăugate zilnic la preturi accesibile.",
      editorial: [
        "SHEIN a revoluționat industria modei rapide, aducând zilnic mii de produse noi la preturi incredibil de accesibile. Platforma este deosebit de populara printre tinerii din România care cauta ținutele la moda la preturi mici, de la rochii și bluze pana la genți, accesorii și lenjerie.",
        "Cu reduceri regulate de 30-80% și colecții noi în fiecare zi, SHEIN a devenit sinonima cu moda accesibila în România. Promoțiile sezoniere — vara, Black Friday, 11.11 Singles Day — aduc reduceri spectaculoase la zeci de mii de produse simultan.",
        "AmCupon.ro urmărește toate codurile promoționale SHEIN active, inclusiv codurile exclusive pentru utilizatorii noi și ofertele de sezon. Prin combina un cod de reducere cu promoțiile existente poți ajunge la economii de 50-80% din prețul inițial.",
      ],
      tips: [
        "Codul de bun-venit SHEIN oferă reducere substantiala la prima comanda — verifica pe AmCupon.ro cel mai recent cod activ.",
        "Instalează aplicația SHEIN pentru acces la promoții exclusive și flash sale-uri disponibile doar în app.",
        "Secțiunea 'Sale' de pe SHEIN are reduceri permanente de 20-70% — cauta produsele cu cel mai mare discount.",
        "Combina un voucher SHEIN cu produsele deja reduse din secțiunea Sale pentru economii maxime.",
        "SHEIN Points acumulate la cumpărături pot fi folosite ca discount la următoarele comenzi.",
        "Verifica tab-ul 'Extra' la checkout — SHEIN oferă deseori transport gratuit sau reducere suplimentara la anumite praguri de comanda.",
      ],
      faq: [
        { q: "SHEIN livrează în România?", a: "Da, SHEIN livrează în România prin curier rapid. Livrarea standard durează 7-15 zile lucrătoare. Livrarea express este disponibila la cost suplimentar și ajunge în 3-7 zile." },
        { q: "Cum folosesc un cod reducere SHEIN?", a: "La checkout, cauta câmpul 'Cod promoțional'. Introdu codul copiat de pe AmCupon.ro și apasa 'Aplica'. Reducerea se scade automat din totalul comenzii." },
        { q: "Pot returna produse de pe SHEIN?", a: "Da, SHEIN accepta retur în 35 de zile de la primire. Prima returnare per comanda este gratuita. Banii se întorc pe cardul original sau ca credit SHEIN Wallet." },
        { q: "SHEIN are mărimi pentru romani?", a: "SHEIN folosește mărimi proprii care pot diferi de cele europene. Verifica mereu ghidul de mărimi din pagina produsului și măsurătorile tale pentru a alege corect. Recenziile cu fotografii sunt foarte utile." },
        { q: "Când sunt cele mai mari reduceri pe SHEIN?", a: "Cele mai mari promoții sunt de 11.11 (Singles Day), Black Friday și New Year Sale. Flash sale-urile zilnice pot oferi reduceri de 50-80% la categorii specifice." },
      ],
      canonical: "/shein",
      categorieSlug: "fashion",
    }} />
  );
}
