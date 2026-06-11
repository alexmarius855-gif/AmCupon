import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere BookZone — Carti Online 2026 | AmCupon.ro",
  description: "Coduri de reducere BookZone actualizate zilnic. Reduceri la carti, audiobooks si e-books. Promotii BookZone verificate.",
  keywords: ["cod reducere bookzone", "bookzone reduceri", "carti online reduceri", "bookzone promotii", "bookzone discount"],
  alternates: { canonical: "https://amcupon.ro/bookzone" },
  openGraph: { title: "Reduceri BookZone 2026 | AmCupon.ro", url: "https://amcupon.ro/bookzone", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function BookzonePage() {
  return (
    <BrandPageTemplate config={{
      slug: "bookzone.ro",
      slugAlt: "bookzone",
      name: "BookZone",
      tagline: "Cel mai mare magazin de carte din Romania — carti, audiobooks si e-books",
      emoji: "📖",
      desc: "Coduri de reducere BookZone verificate zilnic. Reduceri la carti fizice, audiobooks si e-books de la cei mai buni autori romani si straini.",
      editorial: [
        "BookZone este unul dintre cei mai importanti editori si distribuitori de carte din Romania, cu un catalog de mii de titluri in toate genurile: fictiune, non-fictiune, dezvoltare personala, business, carti pentru copii si manuale. Platforma online ofera livrare rapida si frecvent promotii la titluri noi si bestsellere.",
        "Pe AmCupon.ro monitorizam ofertele BookZone si publicam codurile de reducere active. Cel mai bun moment pentru cumparaturi e in perioadele de salduri (vara si iarna) si cu ocazia unor evenimente editoriale — lansari, targuri de carte sau campanii tematice.",
        "BookZone se remarca prin calitatea productiei editoriale si prin titlurile exclusive din portofoliu. Multi autori romani importanti sunt publicati exclusiv prin BookZone, ceea ce face platforma o destinatie esentiala pentru cititorul roman.",
      ],
      tips: [
        "Aboneaza-te la newsletter BookZone pentru acces la pre-comenzi exclusive si reduceri la lansari noi.",
        "Cumpara seturi de carti din aceeasi serie — pretul pe volum e mai mic decat individual.",
        "Verifica sectiunea de carti 'Outlet' pentru titluri cu reduceri permanente de 30-50%.",
        "Audiobooks-urile BookZone sunt produse profesional — o alternativa buna pentru cei care citesc in masina sau in deplasare.",
        "Foloseste codul de reducere BookZone de pe AmCupon.ro pentru economii la urmatoarea comanda.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere BookZone?", a: "La finalizarea comenzii, cauta campul 'Cod promotional'. Introdu codul de pe AmCupon.ro si apasa Aplica — reducerea se aplica instantaneu la totalul comenzii." },
        { q: "BookZone livreaza gratuit?", a: "Da, BookZone ofera livrare gratuita la comenzi peste un anumit prag (verifica site-ul pentru pragul curent). Livrarea standard dureaza 2-4 zile lucratoare." },
        { q: "Pot returna o carte cumparata de la BookZone?", a: "Da, retururile se accepta in 14 zile de la primire, daca cartea e in stare originala, nescrijelita si cu ambalajul intact. Initieaza returul din contul tau sau prin email." },
        { q: "BookZone are si variante digitale ale cartilor?", a: "Da, BookZone ofera atat carti fizice cat si e-books (descarcabile in format PDF/EPUB) si audiobooks. E-books se acceseaza instant dupa plata, fara timp de asteptare." },
      ],
      canonical: "/bookzone",
    }} />
  );
}
