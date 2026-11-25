import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Reduceri Elefant — Coduri și Oferte Elefant.ro 2026",
  description: "Oferte și coduri de reducere Elefant.ro actualizate zilnic. Cărți, jocuri, muzică, filme la prețuri mici. Promoții Elefant verificate acum.",
  keywords: ["reducere elefant", "cod reducere elefant", "oferte elefant", "elefant cărți reducere", "elefant promoții"],
  alternates: { canonical: "https://amcupon.ro/elefant" },
  openGraph: {
    title: "Reduceri Elefant.ro 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Elefant verificate zilnic. Cărți, jocuri, filme la prețuri mici.",
    url: "https://amcupon.ro/elefant",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "elefant.ro", slugAlt: "elefant", name: "Elefant", canonical: "/elefant" }, META);
}

export default function ElefantPage() {
  return (
    <BrandPageTemplate config={{
      slug: "elefant.ro",
      slugAlt: "elefant",
      name: "Elefant",
      tagline: "Librăria online cu cele mai multe titluri din România",
      emoji: "📚",
      desc: "Reduceri și coduri de reducere Elefant.ro actualizate zilnic. Carti, jocuri, filme.",
      editorial: [
        "Elefant.ro este una dintre cele mai mari librarii online din România, cu peste 2 milioane de titluri disponibile — carti în limba romana și straina, manuale, carti de colorat, jocuri de societate, filme și muzica.",
        "Pe AmCupon.ro publicăm promoțiile Elefant pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Elefant are frecvent reduceri de 20-50% la carti, campanii 1+1 gratis, și oferte la categorii specifice (SF, romane, carti pentru copii).",
        "Elefant oferă livrare rapida și retururi simple. Abonamentul Elefant Premium aduce reduceri suplimentare și transport gratuit pentru comenzile mai mari. Combina abonamentul cu codurile de pe AmCupon.ro pentru economii maxime.",
      ],
      tips: [
        "Secțiunea 'Oferte Zilei' de pe elefant.ro are carti cu reduceri mari dar stoc limitat — verifica dimineata.",
        "Comanda minimum 3-4 carti deodată pentru a beneficia de transport gratuit.",
        "Folosește filtrele de preț și autor pentru a găsi ediții mai ieftine ale aceleiași carti.",
        "Abonează-te la newsletter-ul Elefant pentru coduri exclusive de 10-20% la prima comanda.",
        "Cauta titlul dorit și pe Libris pentru a compara preturile — uneori difera semnificativ.",
      ],
      faq: [
        { q: "Cum folosesc un voucher la Elefant?", a: "La finalizarea comenzii pe elefant.ro găsești câmpul 'Cod voucher' înainte de plata. Introdu codul și apasa 'Aplica' — reducerea se calculează automat." },
        { q: "Elefant livrează în toată România?", a: "Da, Elefant livrează prin curier în toată România. Livrarea este gratuita pentru comenzile peste un anumit prag (verifica pragul actual pe site)." },
        { q: "Cat durează livrarea de la Elefant?", a: "În general 2-4 zile lucrătoare. Cărțile disponibile în stoc se livrează mai rapid; comenzile cu titluri la comanda pot dura mai mult." },
        { q: "Pot returna o carte de la Elefant?", a: "Da, Elefant accepta retururi în 30 de zile de la primire pentru carti în starea originala (nefolosite, cu ambalajul intact)." },
      ],
      canonical: "/elefant",
      categorieSlug: "carti-educatie",
    }} />
  );
}
