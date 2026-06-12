import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere pFarma 2026 — Farmacie Online la Reducere | AmCupon.ro",
  description: "Coduri reducere pFarma actualizate. Medicamente OTC, suplimente, cosmetice farmacie si produse naturiste la preturi mici. Promotii pFarma verificate.",
  keywords: ["cod reducere pfarma", "pfarma reduceri", "farmacie online reducere", "medicamente online ieftine", "pfarma promotii", "suplimente reducere"],
  alternates: { canonical: "https://amcupon.ro/pfarma" },
  openGraph: {
    title: "Cod Reducere pFarma 2026 | AmCupon.ro",
    description: "Medicamente OTC, suplimente si cosmetice farmacie la reducere. Promotii pFarma verificate zilnic.",
    url: "https://amcupon.ro/pfarma",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

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
        "AmCupon.ro monitorizeaza toate ofertele pFarma disponibile. Campaniile de reduceri apar in special in sezonul rece (vitamine imunitate) si primavara (detox, suplimente energie). Cumparatorii nou pe pFarma beneficiaza adesea de reducere la prima comanda.",
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
        { q: "Cat dureaza livrarea pFarma?", a: "Livrarea prin curierat dureaza 1-2 zile lucratoare in Romania. pFarma ofera si livrare la Fancourier sau DPD, cu posibilitate de urmarire a coletului." },
        { q: "Cand apar cele mai mari reduceri pe pFarma?", a: "Promotiile mari apar toamna (sezon rece, vitamine) si de Black Friday. pFarma are si campanii regulate lunare la produse din categorii specifice — urmareste AmCupon.ro pentru notificari." },
      ],
      canonical: "/pfarma",
    }} />
  );
}
