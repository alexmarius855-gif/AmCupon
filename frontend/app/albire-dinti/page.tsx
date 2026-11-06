import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Albire Dinți 2026 — Oferte Actualizate",
  description: "Coduri de reducere albire dinți actualizate zilnic. Reduceri la servicii de albire profesională și kituri de albire acasă. Promoții albirea-dintilor.com verificate.",
  keywords: ["cod reducere albire dinți", "albire dinți reducere", "albirea-dintilor.com cod", "kit albire dinți ieftin", "albire dinți acasă reducere"],
  alternates: { canonical: "https://amcupon.ro/albire-dinti" },
  openGraph: { title: "Reduceri Albire Dinți 2026 | AmCupon.ro", url: "https://amcupon.ro/albire-dinti", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "albirea-dintilor.com", slugAlt: "albire", name: "Albirea Dinților", canonical: "/albire-dinti" }, META);
}

export default function AlbireDintiPage() {
  return (
    <BrandPageTemplate config={{
      slug: "albirea-dintilor.com",
      slugAlt: "albire",
      name: "Albirea Dinților",
      tagline: "Servicii profesionale de albire dentară și kituri pentru acasă",
      emoji: "🦷",
      desc: "Coduri de reducere albire dinți actualizate zilnic. Reduceri la kituri profesionale de albire, geluri dentare și tratamente estetice.",
      editorial: [
        "Albirea-dintilor.com este una dintre puținele platforme specializate exclusiv în produse și servicii de albire dentară disponibile în România. Platforma oferă atât kituri de albire profesională pentru acasă, cât și produse pentru albire — geluri cu peroxid, truse LED, benzi de albire și pastă specializată.",
        "Pe AmCupon.ro publicăm promoțiile albirea-dintilor.com pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar frecvent la kiturile complete și la pachetele cu mai multe produse, așa că merită să verifici înainte de cumpărare.",
        "Albirea dinților la domiciliu cu produse profesionale a devenit o alternativă populară la ședințele de cabinet — mai accesibilă ca preț, mai comodă și cu rezultate comparabile la utilizare corectă. Kiturile moderne conțin gel cu concentrație sigură de peroxid și tavă personalizabilă.",
      ],
      tips: [
        "În UE, produsele de albire cu peste 0,1% peroxid de hidrogen se folosesc doar după un consult la stomatolog (Directiva 2011/84/UE) — întreabă-l înainte să alegi un kit.",
        "Tratează mai întâi sensibilitatea dentară dacă o ai — albirea poate accentua temporar sensibilitatea.",
        "Rezultatele durează 6-12 luni cu întreținere minimă. Evită cafeaua și vinul roșu imediat după tratament.",
        "Pachetele combinate (gel + tavă + pastă) sunt mai economice decât produsele separate.",
        "Verifică data de expirare a gelului — produsele expirate sunt mai puțin eficiente.",
      ],
      faq: [
        { q: "Albirea dentară la domiciliu e sigură?", a: "În UE, produsele de albire vândute direct cumpărătorilor au cel mult 0,1% peroxid de hidrogen; cele între 0,1% și 6% se folosesc doar după examinarea și prima aplicare făcute de un stomatolog (Directiva 2011/84/UE). Persoanele cu sensibilitate severă sau restaurări dentare recente ar trebui să consulte mai întâi un stomatolog." },
        { q: "Câte ședințe sunt necesare pentru rezultate vizibile?", a: "Depinde de produs — urmează instrucțiunile din kit. Rezultatele depind de culoarea inițială a dinților și de cât de constant folosești produsul. Dacă ai dinți sensibili, întreabă întâi medicul stomatolog." },
        { q: "Cum aplic codul de reducere?", a: "La checkout pe albirea-dintilor.com, caută câmpul 'Cod promoțional' sau 'Voucher'. Introdu codul de pe AmCupon.ro și confirmă — reducerea se aplică imediat." },
        { q: "Albirea funcționează pe coroane sau fațete?", a: "Nu — produsele de albire funcționează doar pe smalțul natural. Coroanele ceramice și fațetele dentare nu se colorează și nu se albesc. Dacă ai restaurări dentare vizibile, discută cu stomatologul înainte." },
      ],
      canonical: "/albire-dinti",
    }} />
  );
}
