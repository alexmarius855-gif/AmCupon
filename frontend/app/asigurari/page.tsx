import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Asigurări Online România 2026 — RCA, CASCO, Locuință | AmCupon.ro",
  description: "Compară asigurări RCA, CASCO, locuință, viață și călătorie prin Otto Broker — 15 ani experiență, peste 130.000 clienți. Obține cotații de la mai mulți asigurători printr-un singur broker.",
  keywords: ["asigurare rca online", "asigurare casco", "compara asigurari romania", "otto broker", "asigurare locuinta", "asigurare calatorie"],
  alternates: { canonical: "https://amcupon.ro/asigurari" },
  openGraph: { title: "Asigurări Online România 2026 | AmCupon.ro", url: "https://amcupon.ro/asigurari", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function AsigurariPage() {
  return (
    <BrandPageTemplate config={{
      slug: "ottobroker.ro",
      name: "Otto Broker",
      tagline: "Broker de asigurări — RCA, CASCO, locuință, viață, călătorie și bicicletă, de la mai mulți asigurători",
      emoji: "🛡️",
      desc: "Otto Broker compară ofertele mai multor asiguratori autorizați din România — RCA, CASCO, locuință, viață, călătorie și asigurare de bicicletă (Otto Velo, unică în Romania).",
      editorial: [
        "Otto Broker este un broker de asigurări românesc cu 15 ani de experiență pe piață, peste 130.000 de clienți persoane fizice și 10.000 de clienți companii, plus o rețea de 30 de birouri de vânzare în centre comerciale din toată țara. Spre deosebire de un singur asigurător, un broker îți arată ofertele de la mai mulți jucători de pe piață, ca să compari și să alegi ce ți se potrivește — fără cost suplimentar pentru tine.",
        "Acoperă cele mai căutate tipuri de asigurări: RCA (obligatorie pentru orice mașină înmatriculată), CASCO (protecție completă, cu asistență la rezolvarea daunei), asigurare de locuință, asigurare de viață și asigurare de călătorie. Au și un produs unic pe piața românească — Otto Velo, singura asigurare dedicată bicicletelor din România.",
        "Pe AmCupon.ro nu inventăm oferte sau prețuri pentru asigurări — cotația reală depinde de mașină/locuință/vârstă și se calculează direct pe site-ul Otto Broker. Linkul de mai jos te duce direct la ei, prin partenerul nostru de afiliere 2Performant.",
      ],
      tips: [
        "RCA-ul are preț fix stabilit de ASF pentru fiecare asigurător — diferența reală vine din reduceri, servicii incluse (asistență rutieră) și modul de plată. Compară măcar 2-3 oferte înainte să cumperi.",
        "CASCO nu e obligatoriu, dar merită luat în calcul dacă mașina e nouă, are leasing activ sau nu ți-ai permite o reparație majoră din buzunar.",
        "La asigurarea de locuință, verifică dacă acoperă și evenimente naturale (cutremur, inundație) — nu toate polițele de bază le includ automat.",
        "Otto Velo e o opțiune de nișă, dar merită verificată dacă ai o bicicletă scumpă (electrică sau de performanță) — puține companii asigură biciclete separat în România.",
        "Un broker nu te costă în plus față de a merge direct la un asigurător — comisionul vine din partea companiei de asigurări, nu din buzunarul tău.",
      ],
      faq: [
        { q: "Ce diferență e între un broker de asigurări și un asigurător direct?", a: "Asigurătorul (ex. Allianz, Groupama) vinde doar propriile polițe. Brokerul (Otto Broker) îți arată ofertele de la mai mulți asigurători deodată, ca să compari prețul și condițiile — serviciul brokerului e gratuit pentru tine, comisionul vine din partea asigurătorului." },
        { q: "RCA-ul costă la fel peste tot?", a: "Prima de bază pentru RCA e reglementată de ASF și diferă în funcție de vechimea șoferului, istoricul de daune (bonus-malus) și tipul mașinii — nu de asigurător. Diferențele reale apar din discounturi, servicii incluse și modul de plată (integral vs. rate)." },
        { q: "Cum obțin o cotație?", a: "Accesează Otto Broker prin linkul de mai jos și completează datele mașinii/locuinței — cotația e generată automat, fără obligație de cumpărare." },
        { q: "Ce este Otto Velo?", a: "O asigurare dedicată bicicletelor, unică pe piața din România conform Otto Broker — utilă mai ales pentru biciclete electrice sau de performanță, cu valoare mare de înlocuire." },
      ],
      canonical: "/asigurari",
    }} />
  );
}
