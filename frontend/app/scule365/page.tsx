import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Scule365 2026 — Unelte & Scule la Reducere",
  description: "Coduri reducere Scule365 actualizate. Scule profesionale, unelte electrice si accesorii la preturi competitive. Promotii Scule365 verificate pe AmCupon.ro.",
  keywords: ["cod reducere scule365", "scule365 reduceri", "scule profesionale online", "unelte electrice reducere", "scule365 promotii"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/scule365.ro" },
  openGraph: {
    title: "Cod Reducere Scule365 2026 | AmCupon.ro",
    description: "Scule profesionale si unelte electrice la reducere. Promotii Scule365 verificate zilnic pe AmCupon.ro.",
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
      tagline: "Scule profesionale si unelte pentru meseriasi si amatori — livrare rapida in Romania",
      emoji: "🔧",
      desc: "Scule365 este unul dintre cele mai complete magazine online de scule si unelte din Romania, cu mii de produse de la branduri profesionale.",
      editorial: [
        "Scule365 este destinatia preferata a meseriesilor, constructorilor si bricoleurilor din Romania. Magazinul ofera o gama extinsa de scule electrice, pneumatice si manuale de la branduri consacrate precum Bosch, Makita, DeWalt, Milwaukee si altele.",
        "De la masini de gaurit si polizoare unghiulare pana la seturi de chei si accesorii specializate, Scule365 acopera toate nevoile unui atelier sau santier.",
        "Pe AmCupon.ro publicăm promoțiile Scule365 pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Reducerile apar cu frecventa mai mare in perioadele de vara (pentru unelte de gradina) si toamna (pentru echipamente de constructie). Verifica codurile active inainte de orice achizitie de valoare.",
      ],
      tips: [
        "Compara preturile la sculele electrice — Scule365 are adesea preturi mai bune decat retailerii generalisti pentru produse profesionale.",
        "Inscrie-te la newsletterul Scule365 pentru a fi notificat la campaniile de reduceri sezoniere.",
        "Verifica garantia producatorului inainte de cumparare — la sculele profesionale poate fi mai lunga decat garantia legala.",
        "Cumpara seturi de scule in loc de produse individuale pentru economii mai mari — pretul per bucata este mai mic.",
        "Verifica stocul inainte de finalizarea comenzii — produsele din categorii specializate pot intra rapid in out-of-stock.",
        "Foloseste filtrul de brand ca sa gasesti mai repede sculele de care ai nevoie.",
      ],
      faq: [
        { q: "Scule365 livreaza in toata Romania?", a: "Da, prin curier. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă. La produsele mari sau grele, transportul poate costa mai mult." },
        { q: "Sculele de la Scule365 sunt originale?", a: "Scule365 declara ca vinde produse originale, cu garantia producatorului. Pe langa ea, ai garantia legala de conformitate." },
        { q: "Cum aplic un cod de reducere la Scule365?", a: "La checkout, cauta campul pentru cod promotional si introdu codul de pe AmCupon.ro. Reducerea se aplica automat la finalul comenzii." },
        { q: "Ce marci de scule gasesc pe Scule365?", a: "Scule365 stocheaza produse de la Bosch, Makita, DeWalt, Milwaukee, Metabo, Stanley, Wera, Knipex si multi alti producatori de top din industrie." },
        { q: "Scule365 accepta retururi?", a: "Da, Scule365 respecta legislatia europeana privind returul — 14 zile pentru produse nefolosite. Sculele cu defecte de fabricatie sunt acoperite de garantia producatorului." },
      ],
      canonical: "/scule365",
    }} />
  );
}
