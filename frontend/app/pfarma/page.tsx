import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere pFarma 2026 — Farmacie Online la Reducere",
  description: "Coduri reducere pFarma actualizate. Medicamente OTC, suplimente, cosmetice farmacie și produse naturiste la prețuri mici. Promoții pFarma verificate.",
  keywords: ["cod reducere pfarma", "pfarma reduceri", "farmacie online reducere", "medicamente online ieftine", "pfarma promoții", "suplimente reducere"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/pfarma.ro" },
  openGraph: {
    title: "Cod Reducere pFarma 2026 | AmCupon.ro",
    description: "Medicamente OTC, suplimente și cosmetice farmacie la reducere. Promoții pFarma verificate zilnic.",
    url: "https://amcupon.ro/pfarma",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "pfarma.ro", slugAlt: "pfarma", name: "pFarma", canonical: "/pfarma" }, META);
}

export default function PfarmaPage() {
  return (
    <BrandPageTemplate config={{
      slug: "pfarma.ro",
      slugAlt: "pfarma",
      name: "pFarma",
      tagline: "Farmacie online completă cu medicamente OTC, suplimente și produse naturiste",
      emoji: "💊",
      desc: "pFarma este o farmacie online autorizată din România cu o gamă completă de medicamente fără prescripție, suplimente alimentare, cosmetice farmaceutice și produse naturiste.",
      editorial: [
        "pFarma este o farmacie online autorizată ANMDMR, oferind românilor acces ușor la medicamente fără prescripție (OTC), suplimente alimentare, produse de îngrijire și cosmetice farmaceutice.",
        "Gama de produse include vitamine și minerale, probiotice, produse pentru sistemul imunitar, cosmetice dermatologice (Eucerin, La Roche-Posay, Vichy), produse homeopate și fitoterapeutice, dispozitive medicale simple și articole de îngrijire. Prețurile sunt competitive comparativ cu farmaciile fizice, cu promoții regulate la produse populare.",
        "Pe AmCupon.ro publicăm promoțiile pFarma pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Campaniile apar mai des în sezonul rece (vitamine pentru imunitate) și primăvara.",
      ],
      tips: [
        "Cumpără vitamina C, D3 și zinc în cantități mai mari în afara sezonului rece — prețurile sunt mai mici și te pregătești în avans.",
        "pFarma are secțiune specială de promoții — verifică săptămânal pentru reduceri la mărcile premium.",
        "Compară prețul per unitate (capsule) la suplimentele identice dar în ambalaje diferite — mai mare e adesea mai ieftin.",
        "Înscrie-te la newsletter pFarma pentru oferte exclusive și notificări la produsele adăugate în coș.",
        "Consultă farmacistul sau medicul înainte de suplimentele noi, mai ales dacă iei tratament cronic.",
        "Verifică data de expirare la produsele în promoție — farmaciile online vând uneori stocuri cu termen scurt la reduceri mari.",
      ],
      faq: [
        { q: "pFarma este o farmacie autorizată?", a: "Da, pFarma este o farmacie online autorizată de Agenția Națională a Medicamentului și a Dispozitivelor Medicale (ANMDMR) și funcționează conform legislației românești în vigoare." },
        { q: "Cum aplic codul de reducere pFarma?", a: "La checkout, introdu codul din câmpul destinat voucherelor sau codurilor promoționale. Reducerea se calculează automat și se scade din totalul comenzii." },
        { q: "pFarma vinde medicamente cu prescripție?", a: "Nu, pFarma vinde exclusiv medicamente fără prescripție medicală (OTC), suplimente alimentare, produse cosmetice și dispozitive medicale simple. Pentru medicamente cu prescripție, mergi la o farmacie fizică." },
        { q: "Cât durează livrarea pFarma?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Când apar cele mai mari reduceri pe pFarma?", a: "Promoțiile mari apar toamna (sezon rece, vitamine) și de Black Friday. pFarma are și campanii regulate lunare la produse din categorii specifice — urmărește AmCupon.ro pentru notificări." },
      ],
      canonical: "/pfarma",
    }} />
  );
}
