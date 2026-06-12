import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere KitUnghii 2026 — Produse Nail Art la Reducere | AmCupon.ro",
  description: "Coduri reducere KitUnghii actualizate. Geluri UV, oje semipermanente, accesorii nail art la preturi mici. Promotii KitUnghii verificate pe AmCupon.ro.",
  keywords: ["cod reducere kitunghii", "kitunghii reduceri", "gel uv reducere", "oje semipermanente ieftine", "nail art produse", "kitunghii promotii"],
  alternates: { canonical: "https://amcupon.ro/kitunghii" },
  openGraph: {
    title: "Cod Reducere KitUnghii 2026 | AmCupon.ro",
    description: "Gel UV, oje semipermanente si accesorii nail art la reducere. Promotii KitUnghii verificate pe AmCupon.ro.",
    url: "https://amcupon.ro/kitunghii",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function KitUnghiiPage() {
  return (
    <BrandPageTemplate config={{
      slug: "kitunghii.ro",
      slugAlt: "kitunghii",
      name: "KitUnghii",
      tagline: "Specialist in produse nail art, gel UV si oje semipermanente pentru profesioniste si amatore",
      emoji: "💅",
      desc: "KitUnghii este magazinul online specializat in produse pentru unghii din Romania, cu o gama completa de geluri UV, oje semipermanente si accesorii nail art.",
      editorial: [
        "KitUnghii s-a impus ca specialist in produse pentru unghii in Romania, aducand la preturi accesibile tot ce au nevoie atat salonele profesionale cat si cele care isi fac unghiile acasa. Cu peste 12.000 de vanzari confirmate, magazinul are o reputatie solida in comunitatea nail art din Romania.",
        "Gama de produse include geluri UV si LED, oje semipermanente in sute de nuante, top coat-uri, base coat-uri, pilituri, freze, lampi UV/LED si kituri complete pentru incepatori. Brandurile disponibile includ atat marci internationale de renume cat si branduri proprii cu raport pret-calitate excelent.",
        "AmCupon.ro urmareste toate promotiile KitUnghii pentru a-ti oferi cele mai bune coduri de reducere. Cele mai mari reduceri apar in perioadele de Black Friday si in campaniile de vanzare din iarna si primavara.",
      ],
      tips: [
        "Cumpara kituri complete in loc de produse individuale — KitUnghii ofera kituri starter la preturi mult mai avantajoase.",
        "Verifica sectiunea de outlet — produse din colectiile anterioare la reduceri de pana la 70%.",
        "Inscrie-te la newsletter pentru a afla primele despre noile colectii de culori si promotii exclusive.",
        "Consulta tutorialele de pe site sau YouTube pentru a alege produsele potrivite nivelului tau de experienta.",
        "Gelurile UV de la KitUnghii sunt compatibile cu lampi de 36W si 48W — verifica compatibilitatea inainte de cumparare.",
        "Comanda mai multe nuante simultan pentru a reduce costul de livrare per produs.",
      ],
      faq: [
        { q: "Produsele KitUnghii sunt profesionale?", a: "Da, KitUnghii ofera atat produse profesionale pentru saloane cat si produse entry-level pentru uz casnic. Fiecare produs are specificatii clare despre nivelul de utilizare recomandat." },
        { q: "Cum aplic un cod reducere KitUnghii?", a: "La finalizarea comenzii, gasesti campul pentru voucher sau cod promotional. Introdu codul de pe AmCupon.ro si reducerea se aplica instantaneu la totalul cosului." },
        { q: "Cat dureaza livrarea KitUnghii?", a: "Livrarea standard prin curierat dureaza 1-3 zile lucratoare in Romania. Comenzile plasate inainte de ora 14:00 sunt expediate de obicei in aceeasi zi." },
        { q: "Gelurile UV de la KitUnghii au o durata buna de utilizare?", a: "Gelurile corect aplicate (strat subtire, lamp cure complet) tin 2-4 saptamani fara cioplitura. Durata depinde si de ingrijire si activitatile zilnice." },
        { q: "KitUnghii accepta retururi?", a: "Da, in 14 zile de la receptia coletului pentru produsele nefolosite si in ambalajul original. Produsele deschise (motive de siguranta cosmetica) nu se pot returna." },
      ],
      canonical: "/kitunghii",
    }} />
  );
}
