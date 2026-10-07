import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere pFarma 2026 — Farmacie Online la Reducere",
  description: "Coduri reducere pFarma actualizate. Medicamente OTC, suplimente, cosmetice farmacie si produse naturiste la preturi mici. Promotii pFarma verificate.",
  keywords: ["cod reducere pfarma", "pfarma reduceri", "farmacie online reducere", "medicamente online ieftine", "pfarma promotii", "suplimente reducere"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/pfarma.ro" },
  openGraph: {
    title: "Cod Reducere pFarma 2026 | AmCupon.ro",
    description: "Medicamente OTC, suplimente si cosmetice farmacie la reducere. Promotii pFarma verificate zilnic.",
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
      tagline: "Farmacie online completa cu medicamente OTC, suplimente si produse naturiste",
      emoji: "💊",
      desc: "pFarma este o farmacie online autorizata din Romania cu o gama completa de medicamente fara prescriptie, suplimente alimentare, cosmetice farmaceutice si produse naturiste.",
      editorial: [
        "pFarma este o farmacie online autorizata ANMDMR, oferind romanilor acces usor la medicamente fara prescriptie (OTC), suplimente alimentare, produse de ingrijire si cosmetice farmaceutice. Platforma are aproape 10.000 de vanzari confirmate si este o optiune de incredere pentru cumparaturile de farmacie online.",
        "Gama de produse include vitamine si minerale, probiotice, produse pentru sistemul imunitar, cosmetice dermatologice (Eucerin, La Roche-Posay, Vichy), produse homeopate si fitoterapeutice, dispozitive medicale simple si articole de ingrijire. Preturile sunt competitive comparativ cu farmaciile fizice, cu promotii regulate la produse populare.",
        "Pe AmCupon.ro publicăm promoțiile pFarma pe care le primim prin rețeaua de afiliere, actualizate de mai multe ori pe zi. Campaniile apar mai des in sezonul rece (vitamine pentru imunitate) si primavara.",
      ],
      tips: [
        "Cumpara vitamina C, D3 si zinc in cantitati mai mari in afara sezonului rece — preturile sunt mai mici si te pregatesti in avans.",
        "pFarma are sectiune speciala de promotii — verifica saptamanal pentru reduceri la marcile premium.",
        "Compara pretul per unitate (capsule) la suplimentele identice dar in ambalaje diferite — mai mare e adesea mai ieftin.",
        "Inscrie-te la newsletter pFarma pentru oferte exclusive si notificari la produsele adaugate in cos.",
        "Consulta farmacistul sau medicul inainte de suplimentele noi, mai ales daca iei tratament cronic.",
        "Verifica data de expirare la produsele in promotie — farmaciile online vand uneori stocuri cu termen scurt la reduceri mari.",
      ],
      faq: [
        { q: "pFarma este o farmacie autorizata?", a: "Da, pFarma este o farmacie online autorizata de Agentia Nationala a Medicamentului si a Dispozitivelor Medicale (ANMDMR) si functioneaza conform legislatiei romanesti in vigoare." },
        { q: "Cum aplic codul de reducere pFarma?", a: "La checkout, introdu codul din campul destinat voucherelor sau codurilor promotionale. Reducerea se calculeaza automat si se scade din totalul comenzii." },
        { q: "pFarma vinde medicamente cu prescriptie?", a: "Nu, pFarma vinde exclusiv medicamente fara prescriptie medicala (OTC), suplimente alimentare, produse cosmetice si dispozitive medicale simple. Pentru medicamente cu prescriptie, mergi la o farmacie fizica." },
        { q: "Cat dureaza livrarea pFarma?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Cand apar cele mai mari reduceri pe pFarma?", a: "Promotiile mari apar toamna (sezon rece, vitamine) si de Black Friday. pFarma are si campanii regulate lunare la produse din categorii specifice — urmareste AmCupon.ro pentru notificari." },
      ],
      canonical: "/pfarma",
    }} />
  );
}
