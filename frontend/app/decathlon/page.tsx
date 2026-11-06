import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Reduceri Decathlon — Oferte și Coduri Decathlon 2026",
  description: "Oferte și coduri de reducere Decathlon actualizate zilnic. Echipamente sportive, biciclete, fitness la prețuri mici. Promoții Decathlon verificate acum.",
  keywords: ["reducere decathlon", "cod reducere decathlon", "oferte decathlon", "decathlon promoții", "decathlon sport reducere"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/decathlon.ro" },
  openGraph: {
    title: "Reduceri Decathlon 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Decathlon verificate zilnic. Sport, fitness, biciclete la prețuri mici.",
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
      tagline: "Echipamente sportive de calitate la prețuri accesibile",
      emoji: "🏃",
      desc: "Reduceri și coduri de reducere Decathlon actualizate zilnic. Sport, fitness, biciclete.",
      editorial: [
        "Decathlon este un retailer francez de articole sportive, prezent și în România cu magazine mari în orașele principale și un magazin online complet. Oferă echipamente pentru zeci de sporturi, de la fitness la alpinism, înot și ciclism.",
        "Pe AmCupon.ro publicăm promoțiile Decathlon pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Decathlon are reduceri la sfârșit de sezon (iarna pe echipament de vară și invers), campanii periodice și oferte la brandurile proprii (Quechua, Domyos, B'Twin, etc.).",
        "Brandurile proprii Decathlon (Quechua, Forclaz, Domyos, Kipsta) sunt de obicei mai ieftine decât Nike sau Adidas și sunt gândite pentru sportivi amatori și intermediari.",
      ],
      tips: [
        "Sfârșitul de sezon la Decathlon aduce reduceri — echipamentul de schi e mai ieftin vara, iar cel de vară, iarna.",
        "Brandurile proprii Decathlon (Quechua, Domyos) sunt de obicei mai ieftine decât brandurile mari de sport.",
        "Click&Collect e gratuit — comandă online și ridici din magazin pentru a evita costurile de livrare.",
        "Urmărește secțiunea 'Solduri' de pe decathlon.ro pentru produse cu stoc limitat la prețuri reduse.",
        "Bicicletele Decathlon B'Twin sunt printre cele mai bune opțiuni la prețuri accesibile pentru începători.",
      ],
      faq: [
        { q: "Decathlon are coduri de reducere?", a: "Decathlon nu folosește frecvent coduri de reducere clasice, dar are promoții directe pe site (reduceri de preț, 2+1 gratis, etc.). Urmărește pagina noastră pentru toate ofertele active." },
        { q: "Cum returnez un produs la Decathlon?", a: "Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Termenul Decathlon și unde poți returna (magazin sau curier) sunt pe site-ul lor, la retururi." },
        { q: "Decathlon livrează acasă?", a: "Da, prin curier sau cu ridicare din magazin. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Ce sporturi are Decathlon acoperite?", a: "Decathlon acoperă zeci de sporturi: fitness, alergare, ciclism, înot, hiking, schi, fotbal, tenis, yoga, escaladă și multe altele. Găsești echipament pentru începători și sportivi avansați." },
      ],
      canonical: "/decathlon",
    }} />
  );
}
