import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Sport Depot — Echipament Sportiv 2026",
  description: "Coduri de reducere Sport Depot actualizate zilnic. Reduceri la echipament sportiv, îmbrăcăminte și încălțăminte sport. Promoții SportDepot verificate.",
  keywords: ["cod reducere sport depot", "sportdepot reduceri", "echipament sport reduceri", "sport depot promoții", "sportdepot discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/sportdepot.ro" },
  openGraph: { title: "Reduceri Sport Depot 2026 | AmCupon.ro", url: "https://amcupon.ro/sportdepot", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "sportdepot.ro", slugAlt: "sportdepot", name: "Sport Depot", canonical: "/sportdepot" }, META);
}

export default function SportDepotPage() {
  return (
    <BrandPageTemplate config={{
      slug: "sportdepot.ro",
      slugAlt: "sportdepot",
      name: "Sport Depot",
      tagline: "Echipament sportiv pentru orice sport și orice nivel",
      emoji: "⚽",
      desc: "Coduri de reducere Sport Depot actualizate zilnic. Reduceri la echipament, îmbrăcăminte și încălțăminte sport de la branduri internaționale.",
      editorial: [
        "Sport Depot este un retailer specializat în echipament sportiv cu prezență în România, oferind produse pentru fotbal, baschet, fitness, alergare, ciclism, înot și alte sporturi. Platforma are branduri internaționale Nike, Adidas, Puma, Under Armour, Asics și propria linie de produse.",
        "Pe AmCupon.ro publicăm promoțiile Sport Depot pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile majore apar la schimbarea sezonului (colecții noi primăvară-vară și toamnă-iarnă), în perioadele Back to School și înainte de marile competiții sportive.",
        "Sport Depot se adresează atât sportivilor de performanță cât și amatorilor — ai opțiuni pentru orice buget și nivel de activitate.",
      ],
      tips: [
        "Cumpără echipamentul la finalul sezonului — colecția care pleacă intră la reducere.",
        "Mărimile din ghidul Sport Depot pot diferi de branduri — verifică tabelul de mărimi înainte de comanda online.",
        "Pantofii de sport se înlocuiesc la 500-800 km (alergare) sau anual (uz general) — planifică cumpărătura din timp.",
                "Abonează-te la newsletter Sport Depot pentru acces la oferte exclusive de weekend.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Sport Depot?", a: "La checkout, caută câmpul 'Cod promoțional' sau 'Voucher'. Introdu codul de pe AmCupon.ro și confirmă — reducerea se aplică la totalul comenzii." },
        { q: "Sport Depot oferă livrare gratuită?", a: "Da, Sport Depot oferă livrare gratuită la comenzi peste un anumit prag. Comenzile mari de echipament ating ușor pragul." },
        { q: "Pot returna produse sportive de la Sport Depot?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Produsele trebuie sa fie nefolosite, cu etichetele intacte; termenul exact e pe site-ul Sport Depot." },
        { q: "Sport Depot are garanție pentru încălțămintea de sport?", a: "Da, încălțămintea sport de la Sport Depot are garanție legală de 24 luni. Defectele de fabricație sunt acoperite, uzura normală nu." },
      ],
      canonical: "/sportdepot",
    }} />
  );
}
