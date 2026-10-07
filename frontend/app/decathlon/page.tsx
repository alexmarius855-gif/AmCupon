import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Reduceri Decathlon — Oferte si Coduri Decathlon 2026",
  description: "Oferte si coduri de reducere Decathlon actualizate zilnic. Echipamente sportive, biciclete, fitness la preturi mici. Promotii Decathlon verificate acum.",
  keywords: ["reducere decathlon", "cod reducere decathlon", "oferte decathlon", "decathlon promotii", "decathlon sport reducere"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/decathlon.ro" },
  openGraph: {
    title: "Reduceri Decathlon 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Decathlon verificate zilnic. Sport, fitness, biciclete la preturi mici.",
    url: "https://amcupon.ro/decathlon",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "decathlon.ro", slugAlt: "decathlon", name: "Decathlon", canonical: "/decathlon" }, META);
}

export default function DecathlonPage() {
  return (
    <BrandPageTemplate config={{
      slug: "decathlon.ro",
      slugAlt: "decathlon",
      name: "Decathlon",
      tagline: "Echipamente sportive de calitate la preturi accesibile",
      emoji: "🏃",
      desc: "Reduceri si coduri de reducere Decathlon actualizate zilnic. Sport, fitness, biciclete.",
      editorial: [
        "Decathlon este cel mai mare retailer de articole sportive din lume, prezent si in Romania cu magazine mari in orasele principale si un magazin online complet. Brandul francez ofera echipamente pentru peste 70 de sporturi, de la fitness la alpinism, inot si ciclism.",
        "Pe AmCupon.ro publicăm promoțiile Decathlon pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Decathlon are reduceri la sfarsit de sezon (iarna pe echipament de vara si invers), campanii periodice si oferte la brandurile proprii (Quechua, Domyos, B'Twin, etc.).",
        "Brandurile proprii Decathlon (Quechua, Forclaz, Domyos, Kipsta) sunt de obicei mai ieftine decat Nike sau Adidas si sunt gandite pentru sportivi amatori si intermediari.",
      ],
      tips: [
        "Sfarsitul de sezon la Decathlon aduce reduceri — echipamentul de schi e mai ieftin vara, iar cel de vara, iarna.",
        "Brandurile proprii Decathlon (Quechua, Domyos) sunt de obicei mai ieftine decat brandurile mari de sport.",
        "Click&Collect e gratuit — comanda online si ridici din magazin pentru a evita costurile de livrare.",
        "Urmareste sectiunea 'Solduri' de pe decathlon.ro pentru produse cu stoc limitat la preturi reduse.",
        "Bicicletele Decathlon B'Twin sunt printre cele mai bune optiuni la preturi accesibile pentru incepatori.",
      ],
      faq: [
        { q: "Decathlon are coduri de reducere?", a: "Decathlon nu foloseste frecvent coduri de reducere clasice, dar are promotii directe pe site (reduceri de pret, 2+1 gratis, etc.). Urmareste pagina noastra pentru toate ofertele active." },
        { q: "Cum returnez un produs la Decathlon?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Termenul Decathlon si unde poti returna (magazin sau curier) sunt pe site-ul lor, la retururi." },
        { q: "Decathlon livreaza acasa?", a: "Da, prin curier sau cu ridicare din magazin. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Ce sporturi are Decathlon acoperite?", a: "Decathlon acopera peste 70 de sporturi: fitness, alergare, ciclism, inot, hiking, schi, fotbal, tenis, yoga, escalada si multe altele. Gasesti echipament pentru incepatori si sportivi avansati." },
      ],
      canonical: "/decathlon",
    }} />
  );
}
