import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Reduceri Libris — Coduri si Oferte Libris.ro 2026 | AmCupon.ro",
  description: "Oferte si coduri de reducere Libris.ro actualizate zilnic. Carti romanesti si straine, manuale, papetarie la preturi mici. Promotii Libris verificate acum.",
  keywords: ["reducere libris", "cod reducere libris", "oferte libris", "libris carti reducere", "libris promotii"],
  alternates: { canonical: "https://amcupon.ro/libris" },
  openGraph: {
    title: "Reduceri Libris.ro 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Libris verificate zilnic. Carti, papetarie la preturi mici.",
    url: "https://amcupon.ro/libris",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function LibrisPage() {
  return (
    <BrandPageTemplate config={{
      slug: "libris.ro",
      slugAlt: "libris",
      name: "Libris",
      tagline: "Libraria online cu cele mai bune preturi la carti din Romania",
      emoji: "📖",
      desc: "Reduceri si coduri de reducere Libris.ro verificate zilnic. Carti, manuale, papetarie.",
      editorial: [
        "Libris.ro este una dintre cele mai importante librarii online din Romania, cu un catalog vast de carti in romana si straina, manuale scolare, papetarie si produse de birou. Libris se remarca prin promotii frecvente si preturi competitive.",
        "Pe AmCupon.ro monitorizam promotiile Libris si le publicam actualizat. Libris organizeaza frecvent campanii cu reduceri de 20-40% la categorii specifice, saptamani cu carti la 1+1, si oferte speciale de Ziua Cartii (23 aprilie) si inainte de inceputul scolii.",
        "Libris ofera si o sectiune de carti second-hand in stare buna la preturi si mai mici, ideala daca nu ai nevoie de editie noua. Transportul gratuit de la un anumit prag face cumparaturile mai convenabile.",
      ],
      tips: [
        "Ziua Cartii (23 aprilie) si Back to School (august-septembrie) aduc cele mai mari reduceri la Libris.",
        "Sectiunea 'Oferte' de pe libris.ro are carti cu reduceri permanente — verifica saptamanal.",
        "Comanda mai multe carti deodata pentru a atinge pragul de transport gratuit.",
        "Compara si pe Elefant.ro — uneori acelasi titlu are preturi diferite intre cele doua librarii.",
        "Carti second-hand din sectiunea dedicata pot fi cu 30-50% mai ieftine decat editia noua.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Libris?", a: "In cosul de cumparaturi de pe libris.ro gasesti campul 'Cod voucher' sau 'Cod promotional'. Introdu codul si apasa Aplica — reducerea se scade automat din total." },
        { q: "Libris livreaza rapid?", a: "Libris livreaza in general in 2-4 zile lucratoare prin curier. Cartile din stoc se livreaza mai repede; titlurile la comanda pot necesita mai mult timp." },
        { q: "Pot returna o carte de la Libris?", a: "Da, Libris accepta retururi in 14 zile de la primire pentru carti in starea originala, nefolosite si cu ambalajul intact." },
        { q: "Libris are promotii regulate?", a: "Da, Libris are campanii lunare, saptamani tematice (saptamana SF, saptamana romanelor), si evenimente speciale de Ziua Cartii si la inceputul scolii. Urmareste pagina noastra pentru toate promotiile." },
      ],
      canonical: "/libris",
    }} />
  );
}
