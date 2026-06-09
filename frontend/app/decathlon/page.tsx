import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Reduceri Decathlon — Oferte si Coduri Decathlon 2026 | AmCupon.ro",
  description: "Oferte si coduri de reducere Decathlon actualizate zilnic. Echipamente sportive, biciclete, fitness la preturi mici. Promotii Decathlon verificate acum.",
  keywords: ["reducere decathlon", "cod reducere decathlon", "oferte decathlon", "decathlon promotii", "decathlon sport reducere"],
  alternates: { canonical: "https://amcupon.ro/decathlon" },
  openGraph: {
    title: "Reduceri Decathlon 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Decathlon verificate zilnic. Sport, fitness, biciclete la preturi mici.",
    url: "https://amcupon.ro/decathlon",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function DecathlonPage() {
  return (
    <BrandPageTemplate config={{
      slug: "decathlon.ro",
      slugAlt: "decathlon",
      name: "Decathlon",
      tagline: "Echipamente sportive de calitate la preturi accesibile",
      emoji: "🏃",
      desc: "Reduceri si coduri de reducere Decathlon verificate zilnic. Sport, fitness, biciclete.",
      editorial: [
        "Decathlon este cel mai mare retailer de articole sportive din lume, prezent si in Romania cu magazine mari in orasele principale si un magazin online complet. Brandul francez ofera echipamente pentru peste 70 de sporturi, de la fitness la alpinism, inot si ciclism.",
        "Pe AmCupon.ro monitorizam promotiile Decathlon si le publicam imediat. Decathlon are frecvent reduceri de 20-40% la sfarsit de sezon (iarna pe echipament de vara si invers), campanii periodice si oferte la brandurile proprii (Quechua, Domyos, B'Twin, etc.).",
        "Brandurile proprii Decathlon (Quechua, Forclaz, Domyos, Kipsta) ofera cel mai bun raport calitate-pret din piata. Sunt produse mai ieftine decat Nike sau Adidas, dar cu calitate comparabila pentru sportivi amatori si intermediari.",
      ],
      tips: [
        "Sfarsitul de sezon la Decathlon aduce reduceri de 30-50% — cumpara echipament de schi vara si de vara iarna.",
        "Brandurile proprii Decathlon (Quechua, Domyos) au de obicei cel mai bun raport calitate-pret.",
        "Click&Collect e gratuit — comanda online si ridici din magazin pentru a evita costurile de livrare.",
        "Urmareste sectiunea 'Solduri' de pe decathlon.ro pentru produse cu stoc limitat la preturi reduse.",
        "Bicicletele Decathlon B'Twin sunt printre cele mai bune optiuni la preturi accesibile pentru incepatori.",
      ],
      faq: [
        { q: "Decathlon are coduri de reducere?", a: "Decathlon nu foloseste frecvent coduri de reducere clasice, dar are promotii directe pe site (reduceri de pret, 2+1 gratis, etc.). Urmareste pagina noastra pentru toate ofertele active." },
        { q: "Cum returnez un produs la Decathlon?", a: "Decathlon are una dintre cele mai flexibile politici de retur — 365 de zile pentru produsele nesatisfacatoare, returul se face direct in magazine sau prin curier." },
        { q: "Decathlon livreaza acasa?", a: "Da, Decathlon livreaza prin curier in 2-5 zile lucratoare. Click&Collect in magazine este gratuit. Livrarea la domiciliu poate fi gratuita pentru comenzi peste un anumit prag." },
        { q: "Ce sporturi are Decathlon acoperite?", a: "Decathlon acopera peste 70 de sporturi: fitness, alergare, ciclism, inot, hiking, schi, fotbal, tenis, yoga, escalada si multe altele. Gasesti echipament pentru incepatori si sportivi avansati." },
      ],
      canonical: "/decathlon",
    }} />
  );
}
