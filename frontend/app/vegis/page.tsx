import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Vegis — Produse Naturiste si Bio 2026 | AmCupon.ro",
  description: "Coduri de reducere Vegis actualizate zilnic. Reduceri la produse naturiste, bio, suplimente si alimente organice. Promotii Vegis verificate.",
  keywords: ["cod reducere vegis", "vegis reduceri", "produse naturiste reduceri", "vegis promotii", "vegis discount"],
  alternates: { canonical: "https://amcupon.ro/vegis" },
  openGraph: { title: "Reduceri Vegis Naturiste 2026 | AmCupon.ro", url: "https://amcupon.ro/vegis", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function VegisPage() {
  return (
    <BrandPageTemplate config={{
      slug: "vegis.ro",
      slugAlt: "vegis",
      name: "Vegis",
      tagline: "Produse naturiste, bio si suplimente — cel mai mare magazin din Romania",
      emoji: "🌿",
      desc: "Coduri de reducere Vegis verificate zilnic. Reduceri la produse naturiste, suplimente alimentare, cosmetice bio si alimente ecologice.",
      editorial: [
        "Vegis.ro este cel mai mare magazin online de produse naturiste din Romania, cu o oferta de peste 20.000 de produse: suplimente alimentare, ceaiuri, plante medicinale, cosmetice bio, alimente ecologice si produse pentru ingrijire naturala. Platforma pune accentul pe transparenta si calitate — toate produsele sunt certificate sau verificate.",
        "Pe AmCupon.ro publicam toate promotiile Vegis disponibile. Reducerile apar frecvent la suplimentele sezoniere (vitamine D3 iarna, probiotice, imunitate), la cosmeticele bio si in perioadele de salduri. Vegis are si un club de fidelitate cu reduceri progresive.",
        "Vegis se adreseaza celor care doresc un stil de viata sanatos si natural. De la suplimente pentru copii pana la produse pentru sportivi sau pentru batrani, Vegis are una dintre cele mai complete game de produse naturiste din Romania, cu livrare gratuita la comenzi mai mari.",
      ],
      tips: [
        "Cumpara suplimentele sezoniere din timp — preturile cresc iarna cand cererea pentru vitamina D si imunitate explodeaza.",
        "Combina mai multe suplimente intr-o singura comanda pentru a atinge pragul de livrare gratuita.",
        "Citeste recenziile utilizatorilor pentru suplimente — comunitatea Vegis e activa si ofera feedback sincer.",
        "Aboneaza-te la newsletter Vegis pentru alerte despre reducerile la produsele urmarite.",
        "Verifica sectiunea 'Promotii' saptamanal — Vegis are mereu reduceri rotative la categorii diferite.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Vegis?", a: "La checkout, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul de pe AmCupon.ro si confirma — reducerea se aplica imediat la totalul comenzii." },
        { q: "Produsele Vegis sunt certificate bio?", a: "Vegis vinde atat produse cu certificare bio/organica (au sigla EU BIO) cat si produse naturiste fara certificare formala. Fiecare produs are mentionat statutul de certificare pe pagina lui." },
        { q: "Vegis livreaza gratuit?", a: "Da, Vegis ofera livrare gratuita la comenzi peste un anumit prag. Verifica site-ul pentru pragul curent — de obicei intre 100-150 lei." },
        { q: "Pot returna produse naturiste de la Vegis?", a: "Da, retururile se accepta in 30 de zile daca produsele sunt neatinse, cu sigiliul intact si ambalajul original. Produsele deschise sau folosite nu pot fi returnate din motive igienice." },
      ],
      canonical: "/vegis",
    }} />
  );
}
