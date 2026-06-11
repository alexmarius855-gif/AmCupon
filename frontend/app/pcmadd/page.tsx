import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere PC Madd — Calculatoare si IT 2026 | AmCupon.ro",
  description: "Coduri de reducere PC Madd actualizate zilnic. Reduceri la calculatoare, componente si periferice IT. Promotii PCMadd verificate.",
  keywords: ["cod reducere pcmadd", "pc madd reduceri", "calculatoare reduceri", "pcmadd promotii", "pc madd discount"],
  alternates: { canonical: "https://amcupon.ro/pcmadd" },
  openGraph: { title: "Reduceri PC Madd IT 2026 | AmCupon.ro", url: "https://amcupon.ro/pcmadd", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function PcmaddPage() {
  return (
    <BrandPageTemplate config={{
      slug: "pcmadd.com",
      slugAlt: "pcmadd",
      name: "PC Madd",
      tagline: "Calculatoare, componente IT si periferice la preturi competitive",
      emoji: "💻",
      desc: "Coduri de reducere PC Madd verificate zilnic. Reduceri la calculatoare, laptopuri, componente, periferice si accesorii IT.",
      editorial: [
        "PC Madd este un magazin online specializat in calculatoare, componente IT, periferice si accesorii tech, cu o gama larga de produse pentru birou, gaming si utilizare profesionala. Platforma ofera atat sisteme pre-asamblate cat si componente individuale pentru cei care isi doresc un PC custom.",
        "Pe AmCupon.ro monitorizam ofertele PC Madd si publicam codurile de reducere active. Reducerile apar frecvent la lansarea de generatii noi de hardware, in campanii de Black Friday si la componentele cu stoc limitat care se lichidata.",
        "PC Madd se remarca prin preturile competitive la componente si prin suportul tehnic disponibil pentru clienti. Platforma ofera si servicii de asamblare si testare pentru sistemele comandate online.",
      ],
      tips: [
        "Compara pretul componentelor cu benchmark-urile de performanta — raportul calitate/pret variaza mult.",
        "Urmareste lansarile de noi generatii CPU/GPU — preturile la generatia anterioara scad semnificativ.",
        "Cumpara componente in pachete (bundle CPU+placa de baza) pentru reduceri suplimentare.",
        "Verifica garantia la componente IT — procesoarele au de obicei 3 ani, placile video 2-3 ani.",
        "Foloseste codul de reducere PC Madd de pe AmCupon.ro pentru economii suplimentare.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere PC Madd?", a: "La finalizarea comenzii pe pcmadd.com, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul de pe AmCupon.ro si apasa Aplica." },
        { q: "PC Madd ofera servicii de asamblare?", a: "Da, PC Madd ofera servicii de asamblare si testare pentru sistemele comandate online. Pretul serviciului variaza in functie de complexitatea configuratiei." },
        { q: "Care este garantia la componentele IT de la PC Madd?", a: "Garantia variaza pe categorie: procesoare 3 ani, placi video 2-3 ani, memorii RAM 3-5 ani. PC Madd ofera garantie legala si suport tehnic post-vanzare." },
        { q: "PC Madd livreaza rapid?", a: "Da, produsele in stoc se livreaza in 1-2 zile lucratoare. Produsele la comanda pot dura mai mult in functie de disponibilitatea furnizorului." },
      ],
      canonical: "/pcmadd",
    }} />
  );
}
