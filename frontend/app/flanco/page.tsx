import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Flanco — Oferte Electronice si Electrocasnice 2026 | AmCupon.ro",
  description: "Coduri de reducere Flanco actualizate zilnic. Reduceri la telefoane, laptopuri, televizoare si electrocasnice. Promotii Flanco verificate.",
  keywords: ["cod reducere flanco", "flanco reduceri", "flanco promotii", "electronice reduceri", "flanco discount"],
  alternates: { canonical: "https://amcupon.ro/flanco" },
  openGraph: {
    title: "Reduceri Flanco Electronice 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Flanco verificate zilnic. Telefoane, laptopuri si electrocasnice la preturi reduse.",
    url: "https://amcupon.ro/flanco",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function FlancoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "flanco.ro",
      slugAlt: "flanco",
      name: "Flanco",
      tagline: "Electronice si electrocasnice — al doilea cel mai mare retailer din Romania",
      emoji: "📺",
      desc: "Coduri de reducere Flanco verificate zilnic. Reduceri la telefoane, laptopuri, TV, electrocasnice mari si mici de la branduri de top.",
      editorial: [
        "Flanco este al doilea cel mai mare retailer de electronice si electrocasnice din Romania, cu peste 130 de magazine fizice si o prezenta online puternica. Platforma ofera o gama completa de produse tech: telefoane, laptopuri, tablete, televizoare, frigidere, masini de spalat si alte electrocasnice.",
        "Pe AmCupon.ro monitorizam toate promotiile Flanco si publicam codurile de reducere active. Flanco are promotii regulate de weekend, zile flash cu reduceri de 24h si campanii mari de Black Friday, Craciun si 8 Martie cu reduceri substantiale la produse de top.",
        "Flanco se diferentiaza prin serviciile post-vanzare: garantie extinsa, instalare la domiciliu pentru aparate mari si rate fara dobanda. Magazinele fizice permit testarea produselor inainte de cumparare, iar comenzile online beneficiaza de livrare rapida.",
      ],
      tips: [
        "Compara pretul Flanco cu eMAG si Altex inainte de comanda — diferentele pot fi semnificative.",
        "Verificati ofertele de weekend Flanco — apar frecvent reduceri flash de 24-48 ore la telefoane si TV.",
        "Ratele Flanco fara dobanda sunt adesea disponibile chiar si pe perioade scurte (6-12 luni) — util pentru achizitii mari.",
        "Garantia extinsa Flanco merita luat in calcul la electrocasnice mari si aparate cu pret de peste 1000 lei.",
        "Aboneaza-te la newsletter Flanco pentru acces la oferte exclusive si notificari despre produsele urmarite.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Flanco?", a: "La finalizarea comenzii online, cauta sectiunea 'Cod voucher' sau 'Cod promotional'. Introdu codul de pe AmCupon.ro si apasa Aplica — reducerea se reflecta imediat in totalul comenzii." },
        { q: "Flanco ofera livrare gratuita?", a: "Da, Flanco ofera livrare gratuita la comenzi peste un anumit prag. Electrocasnicele mari au livrare si instalare la domiciliu, cu posibila taxa suplimentara pentru etaje superioare." },
        { q: "Pot returna un produs cumparat de la Flanco?", a: "Da, Flanco accepta retururi in 30 de zile de la livrare. Produsele trebuie sa fie in starea originala, cu ambalajul intact si cu toate accesoriile incluse." },
        { q: "Flanco ofera rate fara dobanda?", a: "Da, Flanco are parteneriate cu mai multe banci si IFN-uri pentru rate fara dobanda pe 3-24 luni. Conditiile variaza in functie de banca aleasa si valoarea comenzii." },
      ],
      canonical: "/flanco",
    }} />
  );
}
