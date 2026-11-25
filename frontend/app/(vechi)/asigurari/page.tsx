import { Metadata } from "next";
import BrandPageTemplate, { metadataBrand } from "../components/BrandPageTemplate";

const META: Metadata = {
  title: "Asigurări Online România 2026 — RCA, CASCO, Locuință",
  description: "Compară asigurări RCA, CASCO, locuință, viață și călătorie prin Otto Broker — 15 ani experiență, peste 130.000 clienți.",
  keywords: ["asigurare rca online", "asigurare casco", "compară asigurări românia", "otto broker", "asigurare locuință", "asigurare călătorie"],
  alternates: { canonical: "https://amcupon.ro/asigurari" },
  openGraph: { title: "Asigurări Online România 2026 | AmCupon.ro", url: "https://amcupon.ro/asigurari", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Metadata cu reparare automata: daca magazinul iese din output.json, pagina devine onesta
// si noindex (vezi metadataBrand in BrandPageTemplate.tsx).
export async function generateMetadata(): Promise<Metadata> {
  return metadataBrand({ slug: "ottobroker.ro", name: "Otto Broker", canonical: "/asigurari" }, META);
}

export default function AsigurariPage() {
  return (
    <BrandPageTemplate config={{
      slug: "ottobroker.ro",
      name: "Otto Broker",
      tagline: "Broker de asigurări — RCA, CASCO, locuință, viață, călătorie și bicicletă, de la mai mulți asigurători",
      emoji: "🛡️",
      desc: "Otto Broker compară ofertele mai multor asigurători autorizați din România — RCA, CASCO, locuință, viață, călătorie și asigurare de bicicletă (Otto Velo).",
      editorial: [
        "Otto Broker este un broker de asigurări românesc, autorizat de ASF. Pe site-ul lor scrie că au 15 ani de experiență, peste 130.000 de clienți persoane fizice și peste 10.000 de clienți companii, plus birouri de vânzare (citit pe 14 noiembrie 2026). Spre deosebire de un singur asigurător, un broker îți arată ofertele de la mai mulți jucători de pe piață, ca să compari și să alegi ce ți se potrivește — fără cost suplimentar pentru tine.",
        "Acoperă cele mai căutate tipuri de asigurări: RCA (obligatorie pentru orice mașină înmatriculată), CASCO (pentru daunele propriei mașini), asigurare de locuință, asigurare de viață și asigurare de călătorie. Au și Otto Velo, o asigurare pentru biciclete, pe care Otto Broker o prezintă ca produs unic în România.",
        "Pe AmCupon.ro nu inventăm oferte sau prețuri pentru asigurări — cotația reală depinde de mașină/locuință/vârstă și se calculează direct pe site-ul Otto Broker. Linkul de mai jos te duce direct la ei, prin partenerul nostru de afiliere 2Performant.",
      ],
      tips: [
        "Prețul RCA diferă de la un asigurător la altul și depinde de mașină, de vârstă, de localitate și de istoricul de daune (bonus-malus). Compară măcar 2-3 oferte înainte să cumperi.",
        "CASCO nu e obligatoriu, dar merită luat în calcul dacă mașina e nouă, are leasing activ sau nu ți-ai permite o reparație majoră din buzunar.",
        "La asigurarea de locuință, verifică dacă acoperă și evenimente naturale (cutremur, inundație) — nu toate polițele de bază le includ automat.",
        "Otto Velo merită verificată dacă ai o bicicletă scumpă (electrică sau de performanță).",
        "La un broker, comisionul îl plătește asigurătorul, nu tu separat.",
      ],
      faq: [
        { q: "Ce diferență e între un broker de asigurări și un asigurător direct?", a: "Asigurătorul (ex. Allianz, Groupama) vinde doar propriile polițe. Brokerul (Otto Broker) îți arată ofertele de la mai mulți asigurători deodată, ca să compari prețul și condițiile — comisionul brokerului îl plătește asigurătorul, nu tu separat." },
        { q: "RCA-ul costă la fel peste tot?", a: "Nu. Fiecare asigurător își stabilește tariful, care depinde de mașină, de vârstă, de localitate și de istoricul de daune (bonus-malus). De aceea merită comparate mai multe oferte." },
        { q: "Cum obțin o cotație?", a: "Accesează Otto Broker prin linkul de mai jos și completează datele mașinii/locuinței — cotația e generată automat, fără obligație de cumpărare." },
        { q: "Ce este Otto Velo?", a: "O asigurare dedicată bicicletelor, unică pe piața din România conform Otto Broker — utilă mai ales pentru biciclete electrice sau de performanță, cu valoare mare de înlocuire." },
      ],
      canonical: "/asigurari",
    }} />
  );
}
