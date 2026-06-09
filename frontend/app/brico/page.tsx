import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Brico — Oferte Bricolaj 2026 | AmCupon.ro",
  description: "Coduri de reducere Brico Depot actualizate zilnic. Reduceri la materiale constructii, unelte, gradina si decoratiuni. Promotii Brico verificate.",
  keywords: ["cod reducere brico", "brico reduceri", "brico depot promotii", "bricolaj reduceri", "materiale constructii reducere"],
  alternates: { canonical: "https://amcupon.ro/brico" },
  openGraph: {
    title: "Reduceri Brico 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Brico Depot verificate zilnic. Materiale constructii, unelte si gradina la preturi reduse.",
    url: "https://amcupon.ro/brico",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function BricoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "brico.ro",
      slugAlt: "brico",
      name: "Brico",
      tagline: "Materiale de constructii, unelte si gradina la preturi avantajoase",
      emoji: "🔨",
      desc: "Coduri de reducere Brico verificate zilnic. Reduceri la materiale constructii, unelte, gradina si amenajari interioare.",
      editorial: [
        "Brico Depot este unul dintre cei mai mari retaileri de materiale de constructii si bricolaj din Romania, parte din grupul Kingfisher. Ofera o gama completa de produse pentru constructie, renovare, gradinarit si amenajari interioare — de la vopsele si parchet la unelte profesionale si mobilier de gradina.",
        "Pe AmCupon.ro monitorizam promotiile Brico Depot si publicam ofertele actualizate. Reducerile se gasesc frecvent la materiale de sezon, unelte si produse de gradina in perioadele de primavara si vara.",
        "Brico organizeaza regulat campanii tematice — 'Weekend-ul Bricolajului', promotii de primavara pentru gradina si campanii de toamna pentru renovari interioare — cu reduceri de 20-40% la categorii intregi.",
      ],
      tips: [
        "Cumpara materiale de constructii in cantitati mari — reducerile de volum pot fi de 10-20% fata de pretul per bucata.",
        "Verifica promotiile 'Pret-bataie' din catalog — aceste produse au reduceri saptamanale rotative.",
        "Comanda online si ridica din magazin (click & collect) pentru a evita costurile de livrare la produse grele.",
        "Clubul Brico ofera puncte de fidelitate si acces la promotii exclusive pentru membrii inregistrati.",
        "Compara pretul uneltelor Brico cu magazinele specializate — adesea gasesti acelasi brand mai ieftin.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Brico?", a: "La finalul comenzii online, cauta sectiunea 'Cod promotional' sau 'Voucher'. Introdu codul si reducerea se aplica automat la totalul comenzii." },
        { q: "Brico livreaza la domiciliu?", a: "Da, Brico Depot ofera livrare la domiciliu pentru comenzile online, inclusiv produse voluminoase si grele. Costul de livrare variaza in functie de dimensiunile comenzii." },
        { q: "Pot returna produse cumparate de la Brico?", a: "Da, returul se face in 30 de zile cu bon fiscal, la orice magazin Brico Depot din Romania sau prin curier. Produsele trebuie sa fie in starea originala." },
        { q: "Brico are si servicii de montaj?", a: "Da, Brico Depot ofera servicii de montaj pentru anumite produse (parchet, gresie, faianta) prin retele de instalatori parteneri. Detalii disponibile la magazin." },
      ],
      canonical: "/brico",
    }} />
  );
}
