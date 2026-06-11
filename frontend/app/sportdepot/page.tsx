import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Sport Depot — Echipament Sportiv 2026 | AmCupon.ro",
  description: "Coduri de reducere Sport Depot actualizate zilnic. Reduceri la echipament sportiv, imbracaminte si incaltaminte sport. Promotii SportDepot verificate.",
  keywords: ["cod reducere sport depot", "sportdepot reduceri", "echipament sport reduceri", "sport depot promotii", "sportdepot discount"],
  alternates: { canonical: "https://amcupon.ro/sportdepot" },
  openGraph: { title: "Reduceri Sport Depot 2026 | AmCupon.ro", url: "https://amcupon.ro/sportdepot", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function SportDepotPage() {
  return (
    <BrandPageTemplate config={{
      slug: "sportdepot.ro",
      slugAlt: "sportdepot",
      name: "Sport Depot",
      tagline: "Echipament sportiv pentru orice sport si orice nivel",
      emoji: "⚽",
      desc: "Coduri de reducere Sport Depot verificate zilnic. Reduceri la echipament, imbracaminte si incaltaminte sport de la branduri internationale.",
      editorial: [
        "Sport Depot este un retailer specializat in echipament sportiv cu prezenta in Romania, oferind produse pentru fotbal, baschet, fitness, alergare, ciclism, inot si alte sporturi. Platforma are branduri internationale Nike, Adidas, Puma, Under Armour, Asics si propria linie de produse.",
        "Pe AmCupon.ro monitorizam toate promotiile Sport Depot si le publicam zilnic. Reducerile majore apar la schimbarea sezonului (colectii noi primavara-vara si toamna-iarna), in perioadele Back to School si inainte de marile competitii sportive.",
        "Sport Depot se adreseaza atat sportivilor de performanta cat si amatorilor — ai optiuni pentru orice buget si nivel de activitate. Personalul din magazine este specializat pe sporturi specifice si poate oferi consultanta pentru alegerea echipamentului potrivit.",
      ],
      tips: [
        "Cumpara echipamentul la finalul sezonului — reduceri de 40-60% la colectia care se schimba.",
        "Marimile din ghidul Sport Depot pot diferi de branduri — verifica tabelul de marimi inainte de comanda online.",
        "Pantofii de sport se inlocuiesc la 500-800 km (alergare) sau anual (uz general) — planifica cumparatura din timp.",
        "Cauta produsele cu eticheta 'Produs recomandat' — sunt testate de sportivi si au recenzii verificate.",
        "Aboneaza-te la newsletter Sport Depot pentru acces la oferte exclusive de weekend.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Sport Depot?", a: "La checkout, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul de pe AmCupon.ro si confirma — reducerea se aplica la totalul comenzii." },
        { q: "Sport Depot ofera livrare gratuita?", a: "Da, Sport Depot ofera livrare gratuita la comenzi peste un anumit prag. Comenzile mari de echipament ating usor pragul." },
        { q: "Pot returna produse sportive de la Sport Depot?", a: "Da, Sport Depot accepta retururi in 30 de zile. Produsele trebuie sa fie neutilizate, cu etichete intacte si ambalaj original." },
        { q: "Sport Depot are garantie pentru incaltamintea de sport?", a: "Da, incaltamintea sport de la Sport Depot are garantie legala de 24 luni. Defectele de fabricatie sunt acoperite, uzura normala nu." },
      ],
      canonical: "/sportdepot",
    }} />
  );
}
