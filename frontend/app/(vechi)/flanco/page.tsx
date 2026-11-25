import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere Flanco — Oferte Electronice și Electrocasnice",
  description: "Coduri de reducere Flanco actualizate zilnic. Reduceri la telefoane, laptopuri, televizoare și electrocasnice. Promoții Flanco verificate.",
  keywords: ["cod reducere flanco", "flanco reduceri", "flanco promoții", "electronice reduceri", "flanco discount"],
  alternates: { canonical: "https://amcupon.ro/flanco" },
  openGraph: {
    title: "Reduceri Flanco Electronice 2026 | AmCupon.ro",
    description: "Coduri de reducere și oferte Flanco verificate zilnic. Telefoane, laptopuri și electrocasnice la prețuri reduse.",
    url: "https://amcupon.ro/flanco",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "flanco.ro", slugAlt: "flanco", name: "Flanco", canonical: "/flanco" }, META);
}

export default function FlancoPage() {
  return (
    <BrandPageTemplate config={{
      slug: "flanco.ro",
      slugAlt: "flanco",
      name: "Flanco",
      tagline: "Electronice și electrocasnice — al doilea cel mai mare retailer din România",
      emoji: "📺",
      desc: "Coduri de reducere Flanco actualizate zilnic. Reduceri la telefoane, laptopuri, TV, electrocasnice mari și mici de la branduri de top.",
      editorial: [
        "Flanco este al doilea cel mai mare retailer de electronice și electrocasnice din România, cu peste 130 de magazine fizice și o prezenta online puternica. Platforma oferă o gama completa de produse tech: telefoane, laptopuri, tablete, televizoare, frigidere, mașini de spălat și alte electrocasnice.",
        "Pe AmCupon.ro publicăm promoțiile Flanco pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Flanco are promoții regulate de weekend, zile flash cu reduceri de 24h și campanii mari de Black Friday, Crăciun și 8 Martie cu reduceri substanțiale la produse de top.",
        "Flanco se diferențiază prin serviciile post-vânzare: garanție extinsa, instalare la domiciliu pentru aparate mari și rate fără dobanda. Magazinele fizice permit testarea produselor înainte de cumpărare, iar comenzile online beneficiază de livrare rapida.",
      ],
      tips: [
        "Compara prețul Flanco cu eMAG și Altex înainte de comanda — diferențele pot fi semnificative.",
        "Verificați ofertele de weekend Flanco — apar frecvent reduceri flash de 24-48 ore la telefoane și TV.",
        "Ratele Flanco fără dobanda sunt adesea disponibile chiar și pe perioade scurte (6-12 luni) — util pentru achiziții mari.",
        "Garanția extinsa Flanco merita luat în calcul la electrocasnice mari și aparate cu preț de peste 1000 lei.",
        "Abonează-te la newsletter Flanco pentru acces la oferte exclusive și notificări despre produsele urmărite.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere pe Flanco?", a: "La finalizarea comenzii online, cauta secțiunea 'Cod voucher' sau 'Cod promoțional'. Introdu codul de pe AmCupon.ro și apasa Aplica — reducerea se reflecta imediat în totalul comenzii." },
        { q: "Flanco oferă livrare gratuita?", a: "Da, Flanco oferă livrare gratuita la comenzi peste un anumit prag. Electrocasnicele mari au livrare și instalare la domiciliu, cu posibila taxa suplimentara pentru etaje superioare." },
        { q: "Pot returna un produs cumpărat de la Flanco?", a: "Da, Flanco accepta retururi în 30 de zile de la livrare. Produsele trebuie sa fie în starea originala, cu ambalajul intact și cu toate accesoriile incluse." },
        { q: "Flanco oferă rate fără dobanda?", a: "Da, Flanco are parteneriate cu mai multe bănci și IFN-uri pentru rate fără dobanda pe 3-24 luni. Condițiile variază în funcție de banca aleasa și valoarea comenzii." },
      ],
      canonical: "/flanco",
      categorieSlug: "electronice",
    }} />
  );
}
