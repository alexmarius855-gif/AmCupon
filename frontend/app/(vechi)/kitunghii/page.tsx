import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Cod Reducere KitUnghii 2026 — Produse Nail Art la Reducere",
  description: "Coduri reducere KitUnghii actualizate. Geluri UV, oje semipermanente, accesorii nail art la prețuri mici. Promoții KitUnghii verificate pe AmCupon.ro.",
  keywords: ["cod reducere kitunghii", "kitunghii reduceri", "gel uv reducere", "oje semipermanente ieftine", "nail art produse", "kitunghii promoții"],
  alternates: { canonical: "https://amcupon.ro/cod-reducere/kitunghii.ro" },
  openGraph: {
    title: "Cod Reducere KitUnghii 2026 | AmCupon.ro",
    description: "Gel UV, oje semipermanente și accesorii nail art la reducere. Promoții KitUnghii verificate pe AmCupon.ro.",
    url: "https://amcupon.ro/kitunghii",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "kitunghii.ro", slugAlt: "kitunghii", name: "KitUnghii", canonical: "/kitunghii" }, META);
}

export default function KitUnghiiPage() {
  return (
    <BrandPageTemplate config={{
      slug: "kitunghii.ro",
      slugAlt: "kitunghii",
      name: "KitUnghii",
      tagline: "Specialist în produse nail art, gel UV și oje semipermanente pentru profesioniste și amatore",
      emoji: "💅",
      desc: "KitUnghii este magazinul online specializat în produse pentru unghii din România, cu o gama completa de geluri UV, oje semipermanente și accesorii nail art.",
      editorial: [
        "KitUnghii s-a impus ca specialist în produse pentru unghii în România, aducând la preturi accesibile tot ce au nevoie atat salonele profesionale cat și cele care își fac unghiile acasă.",
        "Gama de produse include geluri UV și LED, oje semipermanente în sute de nuanțe, top coat-uri, base coat-uri, pilituri, freze, lămpi UV/LED și kituri complete pentru începători. Brandurile disponibile includ atat mărci internaționale de renume cat și branduri proprii cu raport preț-calitate excelent.",
        "AmCupon.ro urmărește toate promoțiile KitUnghii pentru a-ți oferi cele mai bune coduri de reducere. Cele mai mari reduceri apar în perioadele de Black Friday și în campaniile de vânzare din iarna și primavara.",
      ],
      tips: [
        "Cumpara kituri complete în loc de produse individuale — KitUnghii oferă kituri starter la preturi mult mai avantajoase.",
        "Verifica secțiunea de outlet — produse din colecțiile anterioare la reduceri de pana la 70%.",
        "Înscrie-te la newsletter pentru a afla primele despre noile colecții de culori și promoții exclusive.",
        "Consulta tutorialele de pe site sau YouTube pentru a alege produsele potrivite nivelului tău de experienta.",
        "Gelurile UV de la KitUnghii sunt compatibile cu lămpi de 36W și 48W — verifica compatibilitatea înainte de cumpărare.",
        "Comanda mai multe nuanțe simultan pentru a reduce costul de livrare per produs.",
      ],
      faq: [
        { q: "Produsele KitUnghii sunt profesionale?", a: "Da, KitUnghii oferă atat produse profesionale pentru saloane cat și produse entry-level pentru uz casnic. Fiecare produs are specificații clare despre nivelul de utilizare recomandat." },
        { q: "Cum aplic un cod reducere KitUnghii?", a: "La finalizarea comenzii, găsești câmpul pentru voucher sau cod promoțional. Introdu codul de pe AmCupon.ro și reducerea se aplica instantaneu la totalul coșului." },
        { q: "Cat durează livrarea KitUnghii?", a: "Termenul și costul livrării le vezi în coș, înainte să plătești — depind de stoc, de adresă și de metoda aleasă." },
        { q: "Gelurile UV de la KitUnghii au o durata buna de utilizare?", a: "Gelurile corect aplicate (strat subțire, lamp cure complet) țin 2-4 săptămâni fără cioplitura. Durata depinde și de îngrijire și activitățile zilnice." },
        { q: "KitUnghii accepta retururi?", a: "Da, în 14 zile de la recepția coletului pentru produsele nefolosite și în ambalajul original. Produsele deschise (motive de siguranta cosmetica) nu se pot returna." },
      ],
      canonical: "/kitunghii",
    }} />
  );
}
