import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Albire Dinti 2026 — Oferte Verificate | AmCupon.ro",
  description: "Coduri de reducere albire dinti actualizate zilnic. Reduceri la servicii de albire profesionala si kituri de albire acasa. Promotii albirea-dintilor.com verificate.",
  keywords: ["cod reducere albire dinti", "albire dinti reducere", "albirea-dintilor.com cod", "kit albire dinti ieftin", "albire dinti acasa reducere"],
  alternates: { canonical: "https://amcupon.ro/albire-dinti" },
  openGraph: { title: "Reduceri Albire Dinti 2026 | AmCupon.ro", url: "https://amcupon.ro/albire-dinti", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function AlbireDintiPage() {
  return (
    <BrandPageTemplate config={{
      slug: "albirea-dintilor.com",
      slugAlt: "albire",
      name: "Albirea Dintilor",
      tagline: "Servicii profesionale de albire dentara si kituri pentru acasa",
      emoji: "🦷",
      desc: "Coduri de reducere albire dinti verificate zilnic. Reduceri la kituri profesionale de albire, geluri dentare si tratamente estetice.",
      editorial: [
        "Albirea-dintilor.com este una dintre putinele platforme specializate exclusiv in produse si servicii de albire dentara disponibile in Romania. Platforma ofera atat kituri de albire profesionala pentru acasa, cat si produse recomandate de stomatologi — geluri cu peroxid, truse LED, benzi de albire si pasta specializata.",
        "Pe AmCupon.ro monitorizam toate promotiile disponibile pentru albirea-dintilor.com. Reducerile apar frecvent la kiturile complete si la pachetele cu mai multe produse. Comisionul de afiliere de 10% indica o marja buna, ceea ce inseamna ca reducerile reale sunt sustenabile si frecvente.",
        "Albirea dintilor la domiciliu cu produse profesionale a devenit o alternativa populara la sedintele de cabinet — mai accesibila ca pret, mai comoda si cu rezultate comparabile la utilizare corecta. Kiturile moderne contin gel cu concentratie sigura de peroxid si tava personalizabila.",
      ],
      tips: [
        "Alege kituri cu concentratie de peroxid sub 6% pentru uz la domiciliu — sigure si eficiente.",
        "Trateaza mai intai sensibilitatea dentara daca o ai — albirea poate accentua temporar sensibilitatea.",
        "Rezultatele dureaza 6-12 luni cu intretinere minima. Evita cafeaua si vinul rosu imediat dupa tratament.",
        "Pachetele combinate (gel + tava + pasta) sunt mai economice decat produsele separate.",
        "Verifica data de expirare a gelului — produsele expirate sunt mai putin eficiente.",
      ],
      faq: [
        { q: "Albirea dentara la domiciliu e sigura?", a: "Da, daca folosesti produse cu concentratie de peroxid aprobata pentru uz casnic (sub 6%). Kiturile profesionale de pe albirea-dintilor.com respecta standardele UE. Persoanele cu sensibilitate severa sau restaurari dentare recente ar trebui sa consulte mai intai un stomatolog." },
        { q: "Cate sedinte sunt necesare pentru rezultate vizibile?", a: "In general 7-14 zile de aplicare zilnica de 30-60 de minute. Rezultatele depind de culoarea initiala a dintilor si de consistenta utilizarii. Dintii natural galbeni raspund mai bine decat cei gri." },
        { q: "Cum aplic codul de reducere?", a: "La checkout pe albirea-dintilor.com, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul de pe AmCupon.ro si confirma — reducerea se aplica imediat." },
        { q: "Albirea functioneaza pe coroane sau fațete?", a: "Nu — produsele de albire functioneaza doar pe smaltul natural. Coroanele ceramice si fatele dentare nu se coloreaza si nu se albesc. Daca ai restaurari dentare vizibile, discuta cu stomatologul inainte." },
      ],
      canonical: "/albire-dinti",
    }} />
  );
}
