import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere BookZone — Cărți Online 2026 | AmCupon.ro",
  description: "Coduri de reducere BookZone actualizate zilnic. Reduceri la cărți, audiobooks și e-books. Promoții BookZone verificate.",
  keywords: ["cod reducere bookzone", "bookzone reduceri", "cărți online reduceri", "bookzone promoții", "bookzone discount"],
  // bookzone.ro a iesit din output.json (programul 2P nu mai e activ), deci
  // pagina de magazin da 404. Canonical catre un 404 e mai rau decat un link
  // rupt — ii spune lui Google ca adresa canonica nu exista. Regula din 10.08:
  // brandurile fara pagina de magazin isi pastreaza canonical propriu.
  alternates: { canonical: "https://amcupon.ro/bookzone" },
  openGraph: { title: "Reduceri BookZone 2026 | AmCupon.ro", url: "https://amcupon.ro/bookzone", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "bookzone.ro", slugAlt: "bookzone", name: "BookZone", canonical: "/bookzone" }, META);
}

export default function BookzonePage() {
  return (
    <BrandPageTemplate config={{
      slug: "bookzone.ro",
      slugAlt: "bookzone",
      name: "BookZone",
      tagline: "Cel mai mare magazin de carte din România — carti, audiobooks și e-books",
      emoji: "📖",
      desc: "Coduri de reducere BookZone actualizate zilnic. Reduceri la carti fizice, audiobooks și e-books de la cei mai buni autori romani și străini.",
      editorial: [
        "BookZone este unul dintre cei mai importanți editori și distribuitori de carte din România, cu un catalog de mii de titluri în toate genurile: ficțiune, non-ficțiune, dezvoltare personala, business, carti pentru copii și manuale. Platforma online oferă livrare rapida și frecvent promoții la titluri noi și bestsellere.",
        "Pe AmCupon.ro publicăm promoțiile BookZone pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Cel mai bun moment pentru cumpărături e în perioadele de salduri (vara și iarna) și cu ocazia unor evenimente editoriale — lansări, târguri de carte sau campanii tematice.",
        "BookZone se remarca prin calitatea producției editoriale și prin titlurile exclusive din portofoliu. Multi autori romani importanți sunt publicați exclusiv prin BookZone, ceea ce face platforma o destinație esentiala pentru cititorul roman.",
      ],
      tips: [
        "Abonează-te la newsletter BookZone pentru acces la pre-comenzi exclusive și reduceri la lansări noi.",
        "Cumpara seturi de carti din aceeași serie — prețul pe volum e mai mic decât individual.",
        "Verifica secțiunea de carti 'Outlet' pentru titluri cu reduceri permanente de 30-50%.",
        "Audiobooks-urile BookZone sunt produse profesional — o alternativa buna pentru cei care citesc în masina sau în deplasare.",
        "Folosește codul de reducere BookZone de pe AmCupon.ro pentru economii la următoarea comanda.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere BookZone?", a: "La finalizarea comenzii, cauta câmpul 'Cod promoțional'. Introdu codul de pe AmCupon.ro și apasa Aplica — reducerea se aplica instantaneu la totalul comenzii." },
        { q: "BookZone livrează gratuit?", a: "Da, BookZone oferă livrare gratuita la comenzi peste un anumit prag (verifica site-ul pentru pragul curent). Livrarea standard durează 2-4 zile lucrătoare." },
        { q: "Pot returna o carte cumparata de la BookZone?", a: "Da, retururile se accepta în 14 zile de la primire, dacă cartea e în stare originala, nescrijelita și cu ambalajul intact. Initieaza returul din contul tău sau prin email." },
        { q: "BookZone are și variante digitale ale cărților?", a: "Da, BookZone oferă atat carti fizice cat și e-books (descarcabile în format PDF/EPUB) și audiobooks. E-books se accesează instant după plata, fără timp de așteptare." },
      ],
      canonical: "/bookzone",
      categorieSlug: "carti-educatie",
    }} />
  );
}
