import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Amazon Romania 2026 — Oferte & Promotii",
  description: "Coduri reducere Amazon Romania actualizate zilnic. Milioane de produse cu livrare rapida. Promotii Amazon Prime, reduceri electronice, carti, fashion si mai mult.",
  keywords: ["cod reducere amazon", "amazon romania reduceri", "amazon prime reduceri", "amazon discount", "amazon voucher", "amazon promotii"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/amazon.com" },
  openGraph: {
    title: "Cod Reducere Amazon Romania 2026 | AmCupon.ro",
    description: "Reduceri Amazon actualizate zilnic. Electronice, carti, fashion, casa si milioane de alte produse cu livrare in Romania.",
    url: "https://amcupon.ro/amazon",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "amazon.com", slugAlt: "amazon", name: "Amazon", canonical: "/amazon" }, META);
}

export default function AmazonPage() {
  return (
    <BrandPageTemplate config={{
      slug: "amazon.com",
      slugAlt: "amazon",
      name: "Amazon",
      tagline: "Unul dintre cei mai mari retaileri online din lume — livrare internațională în România",
      emoji: "📦",
      desc: "Coduri reducere Amazon actualizate zilnic. Electronice, carti, fashion, produse casa si milioane de alte produse, cu livrare internațională în România.",
      editorial: [
        "Amazon este unul dintre cei mai mari retaileri online din lume. Comenzile din Romania pleaca din magazinele Amazon din alte tari (de exemplu amazon.de), cu livrare internationala — util pentru branduri si produse greu de gasit local — de la electronice Apple, Samsung si Sony, la carti in engleza, gadgeturi, produse beauty si articole pentru casa.",
        "Pe Amazon gasesti oferte zilnice (Lightning Deals), campanii de Prime Day, Black Friday si Cyber Monday, plus sectiunea Warehouse Deals, cu produse resigilate la pret redus.",
        "Cumparand prin linkurile de pe AmCupon.ro platesti acelasi pret ca direct pe Amazon; noi primim un comision din partea retelei.",
      ],
      tips: [
        "Creeaza o lista de dorinte Amazon si activeaza alertele de pret — primesti notificare cand produsul scade la pretul dorit.",
        "Inainte sa iei Amazon Prime, verifica pe site daca beneficiile (livrarea gratuita) se aplica si comenzilor livrate in Romania.",
        "Verifica sectiunea Warehouse Deals pentru produse resigilate sau cu ambalaj deteriorat, la pret redus — citeste starea produsului si conditiile de retur.",
        "Compara pretul pe Amazon cu alti retaileri romani — uneori taxele vamale si TVA-ul adaugate la import scad avantajul de pret.",
        "Verifica la fiecare produs daca se livreaza in Romania si cat costa transportul — difera de la un vanzator la altul.",
        "Campaniile mari pe Amazon sunt Prime Day (de obicei in iulie), Black Friday si Cyber Monday (noiembrie).",
      ],
      faq: [
        { q: "Amazon livreaza in Romania?", a: "Da, multe produse de pe Amazon (de exemplu de pe amazon.de) se livreaza in Romania, dar nu toate — pe pagina produsului scrie daca se livreaza la adresa ta. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Cum aplic un cod de reducere pe Amazon?", a: "In cosul de cumparaturi, inainte de finalizarea comenzii, cauta campul 'Introdu codul promotional'. Codul se aplica automat la produsele eligibile. Unele reduceri Amazon sunt sub forma de cupon pe pagina produsului — trebuie bifat inainte de adaugarea in cos." },
        { q: "Platesc taxe vamale la Amazon Romania?", a: "Depinde de unde pleaca produsul. Din depozitele Amazon din UE (Germania, Franta, Polonia) nu platesti taxe vamale. Din afara UE se plateste TVA la orice valoare (regula din iulie 2021), iar peste 150 EUR si taxe vamale." },
        { q: "Pot returna produse cumparate de pe Amazon?", a: "Da. Returul se initiaza din contul tau Amazon; termenul si costul depind de produs si de vanzator — le vezi in pagina produsului. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult." },
        { q: "Ce este Amazon Prime si merita?", a: "Amazon Prime e un abonament cu livrare gratuita la produsele eligibile, Prime Video si acces la ofertele Prime Day. Pretul difera de la o tara la alta; verifica pe site si daca livrarea gratuita se aplica in Romania." },
      ],
      canonical: "/amazon",
    }} />
  );
}
