import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Otter — Fashion și Streetwear 2026 | AmCupon.ro",
  description: "Coduri de reducere Otter actualizate zilnic. Reduceri la haine streetwear, încălțăminte și accesorii urbane. Promoții Otter verificate.",
  keywords: ["cod reducere otter", "otter reduceri", "streetwear reduceri", "otter promoții", "otter fashion discount"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/otter.ro" },
  openGraph: { title: "Reduceri Otter Fashion 2026 | AmCupon.ro", url: "https://amcupon.ro/otter", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "otter.ro", slugAlt: "otter", name: "Otter", canonical: "/otter" }, META);
}

export default function OtterPage() {
  return (
    <BrandPageTemplate config={{
      slug: "otter.ro",
      slugAlt: "otter",
      name: "Otter",
      tagline: "Fashion urban și streetwear — stil autentic pentru cei care cutează",
      emoji: "🧢",
      desc: "Coduri de reducere Otter actualizate zilnic. Reduceri la colecții streetwear, încălțăminte urban și accesorii de modă.",
      editorial: [
        "Otter.ro este un brand românesc de fashion urban și streetwear, cu colecții originale de haine, încălțăminte și accesorii cu un stil distinctiv și modern. Platforma se adresează tinerilor care își doresc un look autentic, diferit de mainstream-ul fast fashion.",
        "Pe AmCupon.ro publicăm promoțiile Otter pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Otter lansează frecvent colecții limitate și drop-uri exclusive — abonarea la newsletter sau la grupul de social media e esențială pentru a nu rata lansările.",
        "Otter se remarca prin calitatea materialelor și prin designul original — produsele sunt gândite să dureze și să fie purtate zilnic. Brandul are o comunitate puternică de clienți fideli care apreciază autenticitatea.",
      ],
      tips: [
        "Urmărește contul de social media Otter pentru preview-uri la colecții noi și drop-uri exclusive.",
        "Mărimile Otter pot fi oversized — verifică ghidul de mărimi sau comandă o mărime mai mică.",
        "Drop-urile limitate se epuizează rapid — adaugă în coș imediat ce apare produsul dorit.",
        "Combină mai multe articole dintr-o comandă pentru a reduce costul de livrare.",
        "Verifică secțiunea 'Sale' Otter pentru articole din colecții anterioare cu reduceri bune.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Otter?", a: "La checkout, caută câmpul 'Cod promoțional' sau 'Voucher'. Introdu codul de pe AmCupon.ro și confirmă reducerea înainte de plată." },
        { q: "Otter livrează în toată România?", a: "Da, Otter livrează în toată România prin curier. Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Pot returna produse Otter?", a: "Da. Pentru cumpărăturile online, legea îți dă cel puțin 14 zile ca să returnezi un produs; mulți comercianți oferă mai mult. Produsele trebuie sa fie nepurtate, cu etichetele intacte; termenul exact e pe site-ul Otter." },
        { q: "Otter face livrare internationala?", a: "Verifică site-ul Otter pentru opțiunile de livrare internațională — disponibilitatea și prețurile de transport variază pe destinație." },
      ],
      canonical: "/otter",
    }} />
  );
}
