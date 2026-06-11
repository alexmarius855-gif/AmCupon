import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Litera — Carti si Edituri 2026 | AmCupon.ro",
  description: "Coduri de reducere Litera actualizate zilnic. Reduceri la carti Litera, bestsellere si colectii speciale. Promotii Litera verificate.",
  keywords: ["cod reducere litera", "litera reduceri", "carti litera reduceri", "litera promotii", "litera discount"],
  alternates: { canonical: "https://amcupon.ro/litera" },
  openGraph: { title: "Reduceri Litera Carti 2026 | AmCupon.ro", url: "https://amcupon.ro/litera", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function LiteraPage() {
  return (
    <BrandPageTemplate config={{
      slug: "litera.ro",
      slugAlt: "litera",
      name: "Litera",
      tagline: "Una dintre cele mai mari edituri din Romania — carti pentru toate varstele",
      emoji: "📚",
      desc: "Coduri de reducere Litera verificate zilnic. Reduceri la carti din toate genurile, de la fictiune si non-fictiune la carti pentru copii si manuale.",
      editorial: [
        "Litera este una dintre cele mai importante si mai mari edituri din Romania, cu un portofoliu de mii de titluri in toate genurile: literatura romana si straina, non-fictiune, carti pentru copii, manuale scolare, ghiduri practice si carti de sport. Litera a publicat multi bestselleri internationali si autori romani consacrati.",
        "Pe AmCupon.ro monitorizarm promotiile Litera si publicam codurile de reducere active. Momentele cele mai bune pentru cumparaturi sunt in perioadele Back to School (august-septembrie), Sarbatorile de iarna si in campania 'Un an cu carti' de la inceput de an.",
        "Litera are si un club de cititori cu beneficii exclusive si o sectiune de e-books in crestere. Calitatea tiparului si a editarii Litera este recunoscuta in industrie, cu investitii constante in traduceri profesionale si design editorial.",
      ],
      tips: [
        "Urmareste sectiunea 'Noutati' Litera pentru carti noi cu reducere de lansare (10-20%).",
        "Seturile tematice Litera (trilogii, serii) au reducere mai mare decat cumparatura pe bucata.",
        "Back to School e cel mai bun moment pentru manuale si carti educationale — reduceri semnificative.",
        "Cartile pentru copii Litera au calitate excelenta a ilustratiilor — investitie buna pe termen lung.",
        "Aboneaza-te la newsletter Litera pentru acces la promotii exclusive si informatii despre lansari.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Litera?", a: "La checkout-ul de pe litera.ro, cauta campul 'Cod promotional'. Introdu codul de pe AmCupon.ro si apasa Aplica pentru a beneficia de reducere." },
        { q: "Litera livreaza gratuit?", a: "Da, Litera ofera livrare gratuita la comenzi peste un anumit prag. Verifica site-ul pentru conditiile curente de livrare." },
        { q: "Pot cumpara carti Litera in format digital?", a: "Da, Litera are o gama crescanda de e-books disponibile pe platforma lor digitala. Unele titluri sunt disponibile simultan in format fizic si digital." },
        { q: "Litera vinde si manuale scolare?", a: "Da, Litera este unul dintre principalii editori de manuale scolare din Romania, acoperind toate clasele si materiile din curriculum national." },
      ],
      canonical: "/litera",
    }} />
  );
}
