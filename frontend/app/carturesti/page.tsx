import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Carturesti — Oferte Carti 2026 | AmCupon.ro",
  description: "Coduri de reducere Carturesti actualizate zilnic. Reduceri la carti, jocuri de societate, papetarie si cadouri culturale. Promotii Carturesti verificate.",
  keywords: ["cod reducere carturesti", "carturesti reduceri", "carturesti promotii", "carti reducere", "carturesti discount"],
  alternates: { canonical: "https://amcupon.ro/carturesti" },
  openGraph: {
    title: "Reduceri Carturesti 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Carturesti verificate zilnic. Carti, jocuri de societate si cadouri la preturi reduse.",
    url: "https://amcupon.ro/carturesti",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function CarturestiPage() {
  return (
    <BrandPageTemplate config={{
      slug: "carturesti.ro",
      slugAlt: "carturesti",
      name: "Carturesti",
      tagline: "Libraria culturala a Romaniei — carti, muzica, film si cadouri",
      emoji: "📚",
      desc: "Coduri de reducere Carturesti verificate zilnic. Reduceri la carti romanesti si straine, jocuri de societate, papetarie.",
      editorial: [
        "Carturesti este cea mai cunoscuta retea de librarii din Romania, cu prezenta atat fizica (librarii in marile orase) cat si online. Oferita o selectie vasta de carti romanesti si internationale, jocuri de societate, muzica, film si produse de papetarie premium.",
        "Pe AmCupon.ro monitorizam permanent promotiile Carturesti — de la reduceri la titluri noi la campanii de aniversare cu discounturi de 20-40% la intreaga gama. Codurile de reducere Carturesti sunt actualizate zilnic.",
        "Carturesti organizeaza periodic campanii tematice: saptamana cartii, targuri online, reduceri de Black Friday si campanii back-to-school. Aboneaza-te la newsletter-ul lor pentru acces anticipat la promotii.",
      ],
      tips: [
        "Comanda minimum 3 carti simultan pentru a atinge pragul de livrare gratuita Carturesti.",
        "Sectiunea 'Promotii' din meniu are mereu carti la 50% sau mai mult — titluri clasice si recente.",
        "Pachetele tematice (ex: pachet thriller, pachet fantasy) ofera economii de 20-30% fata de cumpararea separata.",
        "Carturesti Club — programul de fidelitate — ofera puncte la fiecare comanda care se transforma in reduceri viitoare.",
        "Jocurile de societate din Carturesti sunt adesea mai ieftine decat in magazinele fizice specializate.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Carturesti?", a: "La finalizarea comenzii online, introdu codul in campul dedicat 'Cod promotional' sau 'Voucher'. Reducerea se aplica automat la total. Unele coduri sunt valabile doar pentru anumite categorii sau valori minime de comanda." },
        { q: "Carturesti livreaza gratuit?", a: "Da, Carturesti ofera livrare gratuita la comenzi peste un prag minim. Returul este gratuit in 30 de zile. In magazinele fizice poti ridica comanda gratuita indiferent de valoare." },
        { q: "Pot returna o carte la Carturesti?", a: "Da, returul se face in 30 de zile la magazinele fizice sau prin curier. Cartea trebuie sa fie in starea originala, nescrijelita si cu ambalajul intact." },
        { q: "Carturesti are si carti in engleza?", a: "Da, Carturesti are o sectiune extinsa de carti in engleza si alte limbi straine, inclusiv titluri internationale recente care nu sunt disponibile in traducere romana." },
      ],
      canonical: "/carturesti",
    }} />
  );
}
