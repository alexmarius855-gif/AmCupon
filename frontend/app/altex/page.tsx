import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Reduceri Altex — Coduri si Oferte Altex 2026 | AmCupon.ro",
  description: "Toate ofertele si codurile de reducere Altex actualizate zilnic. Electronice, electrocasnice, IT la cel mai mic pret. Verifica promotiile active acum.",
  keywords: ["reducere altex", "cod reducere altex", "oferte altex", "altex promotii", "altex discount"],
  alternates: { canonical: "https://amcupon.ro/altex" },
  openGraph: {
    title: "Reduceri Altex 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Altex verificate zilnic. Electronice, electrocasnice, IT la preturi mici.",
    url: "https://amcupon.ro/altex",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function AltexPage() {
  return (
    <BrandPageTemplate config={{
      slug: "altex.ro",
      slugAlt: "altex",
      name: "Altex",
      tagline: "Cel mai mare retailer de electronice si electrocasnice din Romania",
      emoji: "🖥️",
      desc: "Reduceri si coduri de reducere Altex verificate zilnic. Electronice, electrocasnice, IT.",
      editorial: [
        "Altex este unul dintre cei mai mari retaileri de electronice si electrocasnice din Romania, cu peste 100 de magazine fizice in toata tara si un magazin online complet. Lansat in 1993, Altex a crescut de la un mic magazin la un imperiu al electronicelor cu mii de produse.",
        "Pe AmCupon.ro monitorizam zilnic promotiile Altex si le afisam actualizate. Gasesti oferte la televizoare, laptopuri, telefoane, frigidere, masini de spalat si sute de alte produse. Reducerile Altex pot ajunge pana la 50% in perioadele promotionale.",
        "Altex are promotii regulate: Black Friday (cel mai mare eveniment de shopping din Romania), promotii de vara, promotii de iarna si campanii lunare cu reduceri la categorii specifice. Cele mai bune dealuri sunt de obicei disponibile online, exclusive pentru cumparatorii de pe altex.ro.",
      ],
      tips: [
        "Urmareste pagina de 'Oferte Zilei' de pe altex.ro — apar produse cu discount mare dar stoc limitat.",
        "Compara pretul cu eMAG inainte de cumparatura — uneori preturile difera semnificativ.",
        "Inscrie-te in programul Altex Advantage pentru reduceri suplimentare si livrare gratuita.",
        "Cumpara in rate fara dobanda cu cardurile partenere — disponibil pentru multe produse.",
        "Foloseste codurile de reducere de pe AmCupon.ro la checkout pentru economii suplimentare de 5-15%.",
      ],
      faq: [
        { q: "Cum folosesc un cod de reducere la Altex?", a: "Adauga produsele in cos pe altex.ro, mergi la checkout si cauta campul 'Cod reducere' sau 'Voucher'. Lipeste codul si aplica — reducerea se calculeaza automat din total." },
        { q: "Altex are livrare gratuita?", a: "Da, Altex ofera livrare gratuita pentru comenzile peste o anumita valoare (verificati pragul curent pe site). Livrarea in magazine este intotdeauna gratuita." },
        { q: "Pot returna un produs cumparat de la Altex?", a: "Da, Altex accepta retururi in 30 de zile de la cumparare pentru produsele cumparate online. Produsele trebuie sa fie in starea originala, cu ambalajul intact." },
        { q: "Cand sunt cele mai bune promotii Altex?", a: "Black Friday (noiembrie) are cele mai mari reduceri — pana la 70% la electronice. Altex mai are campanii importante de Paste, vara si iarna. Urmareste pagina noastra pentru toate promotiile active." },
      ],
      canonical: "/altex",
    }} />
  );
}
