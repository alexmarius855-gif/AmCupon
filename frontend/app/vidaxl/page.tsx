import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere vidaXL — Oferte Mobilier 2026 | AmCupon.ro",
  description: "Coduri de reducere vidaXL actualizate zilnic. Reduceri la mobilier, gradina, sport, auto si electronice. Promotii vidaXL verificate.",
  keywords: ["cod reducere vidaxl", "vidaxl reduceri", "vidaxl promotii", "mobilier ieftin online", "vidaxl discount"],
  alternates: { canonical: "https://amcupon.ro/vidaxl" },
  openGraph: {
    title: "Reduceri vidaXL 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte vidaXL verificate zilnic. Mobilier, gradina si articole pentru casa la preturi reduse.",
    url: "https://amcupon.ro/vidaxl",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function VidaxlPage() {
  return (
    <BrandPageTemplate config={{
      slug: "vidaxl.ro",
      slugAlt: "vidaxl",
      name: "vidaXL",
      tagline: "Mobilier, gradina si articole pentru casa la preturi mici",
      emoji: "🛋️",
      desc: "Coduri de reducere vidaXL verificate zilnic. Reduceri la mobilier, gradina, articole sport si auto la preturi accesibile.",
      editorial: [
        "vidaXL este un retailer online olandez cu prezenta globala, specializat in mobila, articole de gradina, sport si bricolaj la preturi accesibile. Magazinul roman vidaXL.ro ofera mii de produse din aceste categorii cu livrare rapida si retururi simple.",
        "Pe AmCupon.ro monitorizam ofertele vidaXL si publicam codurile de reducere active. Platforma are frecvent promotii la mobilier de gradina in primavara-vara, mobilier interior in perioadele de renovare si articole sport in sezon.",
        "vidaXL este recunoscut pentru raportul bun calitate-pret, mai ales la articole de gradina (mobilier outdoor, grilaje, copertine) si mobilier functional simplu. Preturile mai mici sunt posibile datorita modelului direct-to-consumer fara intermediari.",
      ],
      tips: [
        "Comanda mobilierul in avans — livrarea produselor voluminoase poate dura 5-10 zile.",
        "Verifica dimensiunile exact inainte de comanda — returnarea mobilierului voluminos implica costuri.",
        "Sectiunea 'Oferte' vidaXL are mereu produse cu reduceri de 30-50% — viziteaza-o saptamanal.",
        "Cumpara mobila de gradina la sfarsitul sezonului (septembrie-octombrie) — reduceri de lichidare de stoc.",
        "Foloseste codul de reducere vidaXL de pe AmCupon.ro la checkout pentru economii suplimentare.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe vidaXL?", a: "La finalizarea comenzii, cauta campul 'Cod voucher' sau 'Cod promotional'. Introdu codul de pe AmCupon.ro si apasa Aplica — reducerea se scade din totalul comenzii." },
        { q: "vidaXL livreaza gratuit in Romania?", a: "Politica de livrare variaza — unele produse au livrare gratuita, altele au taxa de transport. Produsele voluminoase (mobilier mare) pot avea costuri de livrare mai mari." },
        { q: "Pot returna mobilierul de la vidaXL?", a: "Da, returul se face in 30 de zile de la primire. Produsele montate sau cu ambalajul deteriorat pot fi respinse. Costul returului este de obicei suportat de cumparator." },
        { q: "Cat de buna este calitatea produselor vidaXL?", a: "vidaXL ofera calitate buna raportat la pret. Produsele din categoriile gradina si sport au recenzii in general bune. Mobilierul interior e functional si accesibil, nu premium." },
      ],
      canonical: "/vidaxl",
    }} />
  );
}
