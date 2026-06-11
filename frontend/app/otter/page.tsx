import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Otter — Fashion si Streetwear 2026 | AmCupon.ro",
  description: "Coduri de reducere Otter actualizate zilnic. Reduceri la haine streetwear, incaltaminte si accesorii urbane. Promotii Otter verificate.",
  keywords: ["cod reducere otter", "otter reduceri", "streetwear reduceri", "otter promotii", "otter fashion discount"],
  alternates: { canonical: "https://amcupon.ro/otter" },
  openGraph: { title: "Reduceri Otter Fashion 2026 | AmCupon.ro", url: "https://amcupon.ro/otter", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function OtterPage() {
  return (
    <BrandPageTemplate config={{
      slug: "otter.ro",
      slugAlt: "otter",
      name: "Otter",
      tagline: "Fashion urban si streetwear — stil autentic pentru cei care cuteaza",
      emoji: "🧢",
      desc: "Coduri de reducere Otter verificate zilnic. Reduceri la colectii streetwear, incaltaminte urban si accesorii de moda.",
      editorial: [
        "Otter.ro este un brand romanesc de fashion urban si streetwear, cu colectii originale de haine, incaltaminte si accesorii cu un stil distinctiv si modern. Platforma se adreseaza tinerilor care isi doresc un look autentic, diferit de mainstream-ul fast fashion.",
        "Pe AmCupon.ro monitorizam promotiile Otter si publicam codurile de reducere active. Otter lanseza frecvent colectii limitate si drop-uri exclusive — abonarea la newsletter sau la grupul de social media e esentiala pentru a nu rata lansarile.",
        "Otter se remarca prin calitatea materialelor si prin designul original — produsele sunt gandite sa dureze si sa fie purtate zilnic. Brandul are o comunitate puternica de clienti fideli care apreciaza autenticitatea.",
      ],
      tips: [
        "Urmareste contul de social media Otter pentru preview-uri la colectii noi si drop-uri exclusive.",
        "Marimile Otter pot fi oversized — verifica ghidul de marimi sau comanda o marime mai mica.",
        "Drop-urile limitate se epuizeaza rapid — adauga in cos imediat ce apare produsul dorit.",
        "Combina mai multe articole dintr-o comanda pentru a reduce costul de livrare.",
        "Verifica sectiunea 'Sale' Otter pentru articole din colectii anterioare cu reduceri bune.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Otter?", a: "La checkout, cauta campul 'Cod promotional' sau 'Voucher'. Introdu codul de pe AmCupon.ro si confirma reducerea inainte de plata." },
        { q: "Otter livreaza in toata Romania?", a: "Da, Otter livreaza in toata Romania prin curierat rapid. Comenzile se proceseaza in 1-3 zile lucratoare dupa plasare." },
        { q: "Pot returna produse Otter?", a: "Da, Otter accepta retururi in 14-30 de zile. Produsele trebuie sa fie nepurtate, cu etichete originale intacte si ambalaj original." },
        { q: "Otter face livrare internationala?", a: "Verifica site-ul Otter pentru optiunile de livrare internationala — disponibilitatea si preturile de transport variaza pe destinatie." },
      ],
      canonical: "/otter",
    }} />
  );
}
