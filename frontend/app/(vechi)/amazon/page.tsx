import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Amazon România 2026 — Oferte & Promoții",
  description: "Coduri reducere Amazon România actualizate zilnic. Milioane de produse cu livrare rapidă. Promoții Amazon Prime, reduceri electronice, cărți, fashion și mai mult.",
  keywords: ["cod reducere amazon", "amazon românia reduceri", "amazon prime reduceri", "amazon discount", "amazon voucher", "amazon promoții"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/amazon.com" },
  openGraph: {
    title: "Cod Reducere Amazon România 2026 | AmCupon.ro",
    description: "Reduceri Amazon actualizate zilnic. Electronice, cărți, fashion, casă și milioane de alte produse cu livrare în România.",
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
      desc: "Coduri reducere Amazon actualizate zilnic. Electronice, cărți, fashion, produse pentru casă și milioane de alte produse, cu livrare internațională în România.",
      editorial: [
        "Amazon este unul dintre cei mai mari retaileri online din lume. Comenzile din România pleacă din magazinele Amazon din alte țări (de exemplu amazon.de), cu livrare internațională — util pentru branduri și produse greu de găsit local — de la electronice Apple, Samsung și Sony, la cărți în engleză, gadgeturi, produse beauty și articole pentru casă.",
        "Pe Amazon găsești oferte zilnice (Lightning Deals), campanii de Prime Day, Black Friday și Cyber Monday, plus secțiunea Warehouse Deals, cu produse resigilate la preț redus.",
        "Cumpărând prin linkurile de pe AmCupon.ro plătești același preț ca direct pe Amazon; noi primim un comision din partea rețelei.",
      ],
      tips: [
        "Creează o listă de dorințe Amazon și activează alertele de preț — primești notificare când produsul scade la prețul dorit.",
        "Înainte să iei Amazon Prime, verifică pe site dacă beneficiile (livrarea gratuită) se aplică și comenzilor livrate în România.",
        "Verifică secțiunea Warehouse Deals pentru produse resigilate sau cu ambalaj deteriorat, la preț redus — citește starea produsului și condițiile de retur.",
        "Compară prețul pe Amazon cu alți retaileri români — uneori taxele vamale și TVA-ul adăugate la import scad avantajul de preț.",
        "Verifică la fiecare produs dacă se livrează în România și cât costă transportul — diferă de la un vânzător la altul.",
        "Campaniile mari pe Amazon sunt Prime Day (de obicei în iulie), Black Friday și Cyber Monday (noiembrie).",
      ],
      faq: [
        { q: "Amazon livrează în România?", a: "Da, multe produse de pe Amazon (de exemplu de pe amazon.de) se livrează în România, dar nu toate — pe pagina produsului scrie dacă se livrează la adresa ta. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Cum aplic un cod de reducere pe Amazon?", a: "În coșul de cumpărături, înainte de finalizarea comenzii, caută câmpul 'Introdu codul promoțional'. Codul se aplică automat la produsele eligibile. Unele reduceri Amazon sunt sub formă de cupon pe pagina produsului — trebuie bifat înainte de adăugarea în coș." },
        { q: "Plătesc taxe vamale la Amazon România?", a: "Depinde de unde pleacă produsul. Din depozitele Amazon din UE (Germania, Franța, Polonia) nu plătești taxe vamale. Din afara UE se plătește TVA la orice valoare (regula din iulie 2021), iar peste 150 EUR și taxe vamale." },
        { q: "Pot returna produse cumpărate de pe Amazon?", a: "Da. Returul se inițiază din contul tău Amazon; termenul și costul depind de produs și de vânzător — le vezi în pagina produsului. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult." },
        { q: "Ce este Amazon Prime și merită?", a: "Amazon Prime e un abonament cu livrare gratuită la produsele eligibile, Prime Video și acces la ofertele Prime Day. Prețul diferă de la o țară la alta; verifică pe site și dacă livrarea gratuită se aplică în România." },
      ],
      canonical: "/amazon",
    }} />
  );
}
