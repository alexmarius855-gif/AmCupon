import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Reduceri Elefant — Coduri si Oferte Elefant.ro 2026 | AmCupon.ro",
  description: "Oferte si coduri de reducere Elefant.ro actualizate zilnic. Carti, jocuri, muzica, filme la preturi mici. Promotii Elefant verificate acum.",
  keywords: ["reducere elefant", "cod reducere elefant", "oferte elefant", "elefant carti reducere", "elefant promotii"],
  alternates: { canonical: "https://amcupon.ro/elefant" },
  openGraph: {
    title: "Reduceri Elefant.ro 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Elefant verificate zilnic. Carti, jocuri, filme la preturi mici.",
    url: "https://amcupon.ro/elefant",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function ElefantPage() {
  return (
    <BrandPageTemplate config={{
      slug: "elefant.ro",
      slugAlt: "elefant",
      name: "Elefant",
      tagline: "Libraria online cu cele mai multe titluri din Romania",
      emoji: "📚",
      desc: "Reduceri si coduri de reducere Elefant.ro verificate zilnic. Carti, jocuri, filme.",
      editorial: [
        "Elefant.ro este una dintre cele mai mari librarii online din Romania, cu peste 2 milioane de titluri disponibile — carti in limba romana si straina, manuale, carti de colorat, jocuri de societate, filme si muzica.",
        "Pe AmCupon.ro monitorizam promotiile Elefant si le publicam imediat ce apar. Elefant are frecvent reduceri de 20-50% la carti, campanii 1+1 gratis, si oferte la categorii specifice (SF, romane, carti pentru copii).",
        "Elefant ofera livrare rapida si retururi simple. Abonamentul Elefant Premium aduce reduceri suplimentare si transport gratuit pentru comenzile mai mari. Combina abonamentul cu codurile de pe AmCupon.ro pentru economii maxime.",
      ],
      tips: [
        "Sectiunea 'Oferte Zilei' de pe elefant.ro are carti cu reduceri mari dar stoc limitat — verifica dimineata.",
        "Comanda minimum 3-4 carti deodata pentru a beneficia de transport gratuit.",
        "Foloseste filtrele de pret si autor pentru a gasi editii mai ieftine ale aceleiasi carti.",
        "Aboneaza-te la newsletter-ul Elefant pentru coduri exclusive de 10-20% la prima comanda.",
        "Cauta titlul dorit si pe Libris pentru a compara preturile — uneori difera semnificativ.",
      ],
      faq: [
        { q: "Cum folosesc un voucher la Elefant?", a: "La finalizarea comenzii pe elefant.ro gasesti campul 'Cod voucher' inainte de plata. Introdu codul si apasa 'Aplica' — reducerea se calculeaza automat." },
        { q: "Elefant livreaza in toata Romania?", a: "Da, Elefant livreaza prin curier in toata Romania. Livrarea este gratuita pentru comenzile peste un anumit prag (verifica pragul actual pe site)." },
        { q: "Cat dureaza livrarea de la Elefant?", a: "In general 2-4 zile lucratoare. Cartile disponibile in stoc se livreaza mai rapid; comenzile cu titluri la comanda pot dura mai mult." },
        { q: "Pot returna o carte de la Elefant?", a: "Da, Elefant accepta retururi in 30 de zile de la primire pentru carti in starea originala (nefolosite, cu ambalajul intact)." },
      ],
      canonical: "/elefant",
    }} />
  );
}
