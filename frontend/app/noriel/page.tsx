import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Noriel — Oferte Jucarii 2026 | AmCupon.ro",
  description: "Coduri de reducere Noriel actualizate zilnic. Reduceri la jucarii, jocuri de societate, articole pentru copii si seturi LEGO. Promotii Noriel verificate.",
  keywords: ["cod reducere noriel", "noriel reduceri", "noriel promotii", "jucarii reduceri", "noriel discount"],
  alternates: { canonical: "https://amcupon.ro/noriel" },
  openGraph: {
    title: "Reduceri Noriel 2026 | AmCupon.ro",
    description: "Coduri de reducere si oferte Noriel verificate zilnic. Jucarii, LEGO si jocuri de societate pentru copii la preturi reduse.",
    url: "https://amcupon.ro/noriel",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function NorielPage() {
  return (
    <BrandPageTemplate config={{
      slug: "noriel.ro",
      slugAlt: "noriel",
      name: "Noriel",
      tagline: "Cel mai mare magazin de jucarii din Romania — LEGO, jocuri si distractie",
      emoji: "🧸",
      desc: "Coduri de reducere Noriel jucarii verificate zilnic. Reduceri la jucarii, seturi LEGO, jocuri de societate si articole pentru copii.",
      editorial: [
        "Noriel este cel mai mare lant de magazine de jucarii din Romania, cu prezenta atat in marile centre comerciale cat si online. Oferita o gama completa de jucarii pentru toate varstele — de la jucarii pentru bebelusi la seturi LEGO complexe si jocuri de societate pentru familie.",
        "Pe AmCupon.ro monitorizam toate promotiile Noriel si le publicam actualizate. Cele mai importante perioade promotionale sunt inainte de Craciun, de Paste si in perioadele back-to-school, cand reducerile pot ajunge la 40-50%.",
        "Noriel Club este programul de fidelitate care acorda puncte la fiecare achizitie. Punctele se pot folosi ca reducere la urmatoarele comenzi, atat online cat si in magazinele fizice.",
      ],
      tips: [
        "Cumpara jucariile LEGO in perioadele de promotii — reducerile pot fi de 20-30% chiar si la seturile noi.",
        "Verifica sectiunea 'Outlet' Noriel pentru jucarii la preturi reduse semnificativ — stoc limitat.",
        "Seturi bundle (jucarie + accesoriu) ofera mai buna valoare decat produsele cumparate separat.",
        "Aboneaza-te la newsletter Noriel pentru alerte de reduceri la jucariile dorite de copilul tau.",
        "Compara pretul online vs in magazin — uneori promotiile online sunt mai avantajoase.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere la Noriel?", a: "La finalizarea comenzii online, cauta campul 'Cod voucher' sau 'Cod promotional'. Introdu codul si apasa Aplica — reducerea se adauga automat la total." },
        { q: "Noriel livreaza gratuit?", a: "Noriel ofera livrare gratuita la comenzi peste un anumit prag. Poti alege si ridicarea din magazinul fizic Noriel cel mai apropiat, de obicei disponibila in 1-2 zile." },
        { q: "Pot returna jucarii la Noriel?", a: "Da, returul se face in 30 de zile de la primire, cu conditia ca jucaria sa fie in ambalajul original nedes fcut. Retur gratuit in magazin sau prin curier." },
        { q: "Noriel are si jocuri de societate pentru adulti?", a: "Da, Noriel are o sectiune dedicata jocurilor de societate pentru adulti si familie, inclusiv titluri populare internationale si jocuri romanesti." },
      ],
      canonical: "/noriel",
    }} />
  );
}
