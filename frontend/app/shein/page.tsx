import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere SHEIN Romania 2026 — Fashion la Preturi Mici | AmCupon.ro",
  description: "Coduri reducere SHEIN actualizate zilnic. Haine, accesorii si incaltaminte la reducere de pana la 80%. Promotii SHEIN verificate pe AmCupon.ro.",
  keywords: ["cod reducere shein", "shein romania reduceri", "shein promotii", "shein voucher", "shein discount romania", "haine ieftine online"],
  alternates: { canonical: "https://amcupon.ro/shein" },
  openGraph: {
    title: "Cod Reducere SHEIN Romania 2026 | AmCupon.ro",
    description: "Reduceri SHEIN actualizate zilnic. Haine, incaltaminte si accesorii de moda la preturi incredibile.",
    url: "https://amcupon.ro/shein",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function SheinPage() {
  return (
    <BrandPageTemplate config={{
      slug: "shein.com",
      slugAlt: "shein",
      name: "SHEIN",
      tagline: "Fashion global la preturi mici — mii de noutati zilnic",
      emoji: "👗",
      desc: "SHEIN este una dintre cele mai mari platforme de moda online din lume, cu mii de produse noi adaugate zilnic la preturi accesibile.",
      editorial: [
        "SHEIN a revolutionat industria modei rapide, aducand zilnic mii de produse noi la preturi incredibil de accesibile. Platforma este deosebit de populara printre tinerii din Romania care cauta tinutele la moda la preturi mici, de la rochii si bluze pana la genti, accesorii si lenjerie.",
        "Cu reduceri regulate de 30-80% si colectii noi in fiecare zi, SHEIN a devenit sinonima cu moda accesibila in Romania. Promotiile sezoniere — vara, Black Friday, 11.11 Singles Day — aduc reduceri spectaculoase la zeci de mii de produse simultan.",
        "AmCupon.ro urmareste toate codurile promotionale SHEIN active, inclusiv codurile exclusive pentru utilizatorii noi si ofertele de sezon. Prin combina un cod de reducere cu promotiile existente poti ajunge la economii de 50-80% din pretul initial.",
      ],
      tips: [
        "Codul de bun-venit SHEIN ofera reducere substantiala la prima comanda — verifica pe AmCupon.ro cel mai recent cod activ.",
        "Instaleaza aplicatia SHEIN pentru acces la promotii exclusive si flash sale-uri disponibile doar in app.",
        "Sectiunea 'Sale' de pe SHEIN are reduceri permanente de 20-70% — cauta produsele cu cel mai mare discount.",
        "Combina un voucher SHEIN cu produsele deja reduse din sectiunea Sale pentru economii maxime.",
        "SHEIN Points acumulate la cumparaturi pot fi folosite ca discount la urmatoarele comenzi.",
        "Verifica tab-ul 'Extra' la checkout — SHEIN ofera deseori transport gratuit sau reducere suplimentara la anumite praguri de comanda.",
      ],
      faq: [
        { q: "SHEIN livreaza in Romania?", a: "Da, SHEIN livreaza in Romania prin curier rapid. Livrarea standard dureaza 7-15 zile lucratoare. Livrarea express este disponibila la cost suplimentar si ajunge in 3-7 zile." },
        { q: "Cum folosesc un cod reducere SHEIN?", a: "La checkout, cauta campul 'Cod promotional'. Introdu codul copiat de pe AmCupon.ro si apasa 'Aplica'. Reducerea se scade automat din totalul comenzii." },
        { q: "Pot returna produse de pe SHEIN?", a: "Da, SHEIN accepta retur in 35 de zile de la primire. Prima returnare per comanda este gratuita. Banii se intorc pe cardul original sau ca credit SHEIN Wallet." },
        { q: "SHEIN are marimi pentru romani?", a: "SHEIN foloseste marimi proprii care pot diferi de cele europene. Verifica mereu ghidul de marimi din pagina produsului si masuratorile tale pentru a alege corect. Recenziile cu fotografii sunt foarte utile." },
        { q: "Cand sunt cele mai mari reduceri pe SHEIN?", a: "Cele mai mari promotii sunt de 11.11 (Singles Day), Black Friday si New Year Sale. Flash sale-urile zilnice pot oferi reduceri de 50-80% la categorii specifice." },
      ],
      canonical: "/shein",
    }} />
  );
}
