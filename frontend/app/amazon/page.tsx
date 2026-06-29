import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Amazon Romania 2026 — Oferte & Promotii | AmCupon.ro",
  description: "Coduri reducere Amazon Romania actualizate zilnic. Milioane de produse cu livrare rapida. Promotii Amazon Prime, reduceri electronice, carti, fashion si mai mult.",
  keywords: ["cod reducere amazon", "amazon romania reduceri", "amazon prime reduceri", "amazon discount", "amazon voucher", "amazon promotii"],
  alternates: { canonical: "https://amcupon.ro/amazon" },
  openGraph: {
    title: "Cod Reducere Amazon Romania 2026 | AmCupon.ro",
    description: "Reduceri Amazon actualizate zilnic. Electronice, carti, fashion, casa si milioane de alte produse cu livrare in Romania.",
    url: "https://amcupon.ro/amazon",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function AmazonPage() {
  return (
    <BrandPageTemplate config={{
      slug: "amazon.com",
      slugAlt: "amazon",
      name: "Amazon",
      tagline: "Cel mai mare marketplace din lume — milioane de produse livrate in Romania",
      emoji: "📦",
      desc: "Coduri reducere Amazon verificate zilnic. Electronice, carti, fashion, produse casa si milioane de alte produse cu livrare rapida in Romania prin Amazon Global.",
      editorial: [
        "Amazon este cel mai mare retailer online din lume, cu peste 350 de milioane de produse in catalog. In Romania, Amazon livreaza prin Amazon Global Store, oferind acces la branduri si produse indisponibile local — de la electronice Apple, Samsung si Sony, la carti in engleza, gadgeturi, produse beauty si articole pentru casa.",
        "Pe AmCupon.ro monitorizam toate promotiile Amazon disponibile pentru Romania — reduceri zilnice Lightning Deals, oferte Prime, campanii Black Friday si Cyber Monday. Amazon Prime Members beneficiaza de reduceri exclusive si livrare gratuita, iar sectiunea Warehouse Deals ofera produse resigilate la preturi semnificativ reduse.",
        "Amazon Associates este unul dintre cele mai vechi si mai de incredere programe de afiliere din lume. Cumpand prin linkurile de pe AmCupon.ro, sustii platforma si primesti aceleasi preturi si garantii ca si cumparand direct de pe Amazon.",
      ],
      tips: [
        "Creeaza o lista de dorinte Amazon si activeaza alertele de pret — primesti notificare cand produsul scade la pretul dorit.",
        "Amazon Prime ofera livrare gratuita si rapida plus reduceri exclusive — testeaza 30 de zile gratuit.",
        "Verifica sectiunea Warehouse Deals pentru produse resigilate sau cu ambalaj deteriorat la 20-60% discount — garantia ramane valabila.",
        "Compara pretul pe Amazon cu alti retaileri romani — uneori taxele vamale si TVA-ul adaugate la import scad avantajul de pret.",
        "Utilizeaza filtrul 'Expediat din Romania' sau 'Eligibil pentru livrare gratuita' pentru comenzi fara costuri suplimentare.",
        "Cele mai mari reduceri pe Amazon apar in: Prime Day (iulie), Black Friday (noiembrie) si Cyber Monday — marcheaza datele in calendar.",
      ],
      faq: [
        { q: "Amazon livreaza in Romania?", a: "Da, Amazon livreaza in Romania prin Amazon Global Store. Timpul de livrare este de obicei 5-14 zile lucratoare. Unele produse sunt marcate 'Nu se livreaza in Romania' — verifica inainte de comanda." },
        { q: "Cum aplic un cod de reducere pe Amazon?", a: "In cosul de cumparaturi, inainte de finalizarea comenzii, cauta campul 'Introdu codul promotional'. Codul se aplica automat la produsele eligibile. Unele reduceri Amazon sunt sub forma de cupon pe pagina produsului — trebuie bifat inainte de adaugarea in cos." },
        { q: "Platesc taxe vamale la Amazon Romania?", a: "Depinde de valoarea comenzii si tara de expediare. Comenzile sub 150 EUR din afara UE pot avea TVA aditional. Produsele expediate din depozite EU Amazon (Germania, Franta, Polonia) nu au taxe vamale suplimentare." },
        { q: "Pot returna produse cumparate de pe Amazon?", a: "Da, Amazon are politica de retur de 30 de zile pentru majoritatea produselor. Returul se initiaza din contul tau Amazon. Produsele expediate din depozitele EU se returneaza mai usor — verifica conditiile specifice per produs." },
        { q: "Ce este Amazon Prime si merita?", a: "Amazon Prime este un abonament (~$139/an sau ~$14.99/luna) care ofera livrare gratuita rapida, acces la Prime Video, Prime Music si reduceri exclusive Prime Day. Daca comanzi frecvent pe Amazon, se amortizeaza rapid." },
      ],
      canonical: "/amazon",
    }} />
  );
}
