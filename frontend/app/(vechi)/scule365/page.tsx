import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Scule365 2026 — Unelte & Scule la Reducere",
  description: "Coduri reducere Scule365 actualizate. Scule profesionale, unelte electrice și accesorii la prețuri competitive. Promoții Scule365 verificate pe AmCupon.ro.",
  keywords: ["cod reducere scule365", "scule365 reduceri", "scule profesionale online", "unelte electrice reducere", "scule365 promoții"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/scule365.ro" },
  openGraph: {
    title: "Cod Reducere Scule365 2026 | AmCupon.ro",
    description: "Scule profesionale și unelte electrice la reducere. Promoții Scule365 verificate zilnic pe AmCupon.ro.",
    url: "https://amcupon.ro/scule365",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "scule365.ro", slugAlt: "scule365", name: "Scule365", canonical: "/scule365" }, META);
}

export default function Scule365Page() {
  return (
    <BrandPageTemplate config={{
      slug: "scule365.ro",
      slugAlt: "scule365",
      name: "Scule365",
      tagline: "Scule profesionale și unelte pentru meseriași și amatori — livrare rapidă în România",
      emoji: "🔧",
      desc: "Scule365 este unul dintre cele mai complete magazine online de scule și unelte din România, cu mii de produse de la branduri profesionale.",
      editorial: [
        "Scule365 vinde scule pentru meseriași, constructori și bricoleuri din România. Magazinul oferă o gamă extinsă de scule electrice, pneumatice și manuale de la branduri consacrate precum Bosch, Makita, DeWalt, Milwaukee și altele.",
        "De la mașini de găurit și polizoare unghiulare până la seturi de chei și accesorii specializate, Scule365 acoperă toate nevoile unui atelier sau șantier.",
        "Pe AmCupon.ro publicăm promoțiile Scule365 pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar cu frecvență mai mare în perioadele de vară (pentru unelte de grădină) și toamnă (pentru echipamente de construcție). Verifică codurile active înainte de orice achiziție de valoare.",
      ],
      tips: [
        "Compară prețul aceluiași model (codul exact al produsului) la mai multe magazine înainte să cumperi.",
        "Înscrie-te la newsletterul Scule365 pentru a fi notificat la campaniile de reduceri sezoniere.",
        "Verifică garanția producătorului înainte de cumpărare — la sculele profesionale poate fi mai lungă decât garanția legală.",
        "Cumpără seturi de scule în loc de produse individuale pentru economii mai mari — prețul per bucată este mai mic.",
        "Verifică stocul înainte de finalizarea comenzii — produsele din categorii specializate pot intra rapid în out-of-stock.",
        "Folosește filtrul de brand ca să găsești mai repede sculele de care ai nevoie.",
      ],
      faq: [
        { q: "Scule365 livrează în toată România?", a: "Da, prin curier. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă. La produsele mari sau grele, transportul poate costa mai mult." },
        { q: "Sculele de la Scule365 sunt originale?", a: "Scule365 declară că vinde produse originale, cu garanția producătorului. Pe lângă ea, ai garanția legală de conformitate." },
        { q: "Cum aplic un cod de reducere la Scule365?", a: "La checkout, caută câmpul pentru cod promoțional și introdu codul de pe AmCupon.ro. Reducerea se aplică automat la finalul comenzii." },
        { q: "Ce mărci de scule găsesc pe Scule365?", a: "Scule365 stochează produse de la Bosch, Makita, DeWalt, Milwaukee, Metabo, Stanley, Wera, Knipex și mulți alți producători de top din industrie." },
        { q: "Scule365 acceptă retururi?", a: "Da, Scule365 respectă legislația europeană privind returul — 14 zile pentru produse nefolosite. Sculele cu defecte de fabricație sunt acoperite de garanția producătorului." },
      ],
      canonical: "/scule365",
    }} />
  );
}
